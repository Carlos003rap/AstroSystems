import argparse
import base64
import json
import os
import sys
import threading
import functools
import http.server
import socketserver
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "project", "frontend", "html"))
PORT = 4173
CHROME = "/usr/bin/google-chrome"

# Errores que ya existen en main y que corrige la rama fase5 (script en linea viejo de
# administracion-usuarios.html). Quitar de aqui cuando fase5 este en main.
KNOWN_ERRORS = ["No se pudieron cargar los grupos"]

PUBLIC = ["login", "forgot-password", "reset-password"]
PRIVATE = [
    "dashboard",
    "administracion-usuarios",
    "administracion-grupos",
    "editar-usuario",
    "editar-grupo",
    "consultas",
    "auditoria",
]
QUERY = {
    "reset-password": "?token=prueba",
    "editar-usuario": "?id=1",
    "editar-grupo": "?id=1",
}

GRUPOS = [
    {"idGrupo": 1, "codigo": "9GS231", "nombre": "Ingenieria de Software Aplicada III", "estatus": "Activo"},
    {"idGrupo": 2, "codigo": "1IL122", "nombre": "Grupo con un nombre bastante largo para probar el desborde en celular", "estatus": "Activo"},
]
USUARIOS = [
    {"idUsuario": 1, "cedula": "8-123-4567", "estatus": "Activo", "grupo": GRUPOS[0]},
    {"idUsuario": 2, "cedula": "PE-12-3456", "estatus": "Inactivo", "grupo": GRUPOS[1]},
]
LOGIN_LOGS = [
    {"idLog": 1, "usuario": "admin", "resultado": "Exitoso", "fecha": "2026-11-17T02:20:00", "ip": "127.0.0.1"},
    {"idLog": 2, "usuario": "admin", "resultado": "Bloqueado", "fecha": "2026-11-17T02:10:00", "ip": "127.0.0.1"},
]
AUDIT_LOGS = [
    {"idAuditoria": 1, "tabla": "usuario", "accion": "UPDATE", "usuario": "admin", "fecha": "2026-11-17T02:21:00"},
]


def b64(data):
    return base64.urlsafe_b64encode(json.dumps(data).encode()).decode().rstrip("=")


def fake_jwt():
    return b64({"alg": "none"}) + "." + b64({"sub": "admin", "exp": 4102444800}) + ".x"


def api_response(path):
    if path.startswith("/api/admin/usuarios/"):
        return USUARIOS[0]
    if path.startswith("/api/admin/usuarios"):
        return {"content": USUARIOS, "totalPages": 1}
    if path.startswith("/api/admin/grupos/"):
        return GRUPOS[0]
    if path.startswith("/api/admin/grupos"):
        return {"content": GRUPOS, "totalPages": 1}
    if path.startswith("/api/admin/auditoria-login"):
        return {"content": LOGIN_LOGS, "totalPages": 1}
    if path.startswith("/api/admin/auditoria-edicion"):
        return {"content": AUDIT_LOGS, "totalPages": 1}
    if path.startswith("/api/admin/puertas") or path.startswith("/api/admin/areas") or path.startswith("/api/admin/acceso-grupo"):
        return []
    if path.startswith("/api/users"):
        return []
    if path.startswith("/api/health"):
        return {"status": "UP"}
    return {}


def start_server():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args, **kwargs):
            pass

    handler = functools.partial(Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


def run_page(browser, name, width, role, out_dir, failures):
    context = browser.new_context(viewport={"width": width, "height": 800}, reduced_motion="no-preference")
    if name not in PUBLIC:
        user = json.dumps({"username": "admin", "role": role})
        context.add_init_script(
            "localStorage.setItem('authToken','%s');localStorage.setItem('currentUser',%s);" % (fake_jwt(), json.dumps(user))
        )
    page = context.new_page()
    label = "%s %s@%d" % (role, name, width)
    external = []
    console_errors = []

    def on_request(req):
        host = urlparse(req.url).hostname
        if host not in ("127.0.0.1", "localhost") and not req.url.startswith("data:"):
            external.append(req.url)

    def on_console(msg):
        if msg.type == "error" and "Failed to load resource" not in msg.text and msg.text not in KNOWN_ERRORS:
            console_errors.append(msg.text)

    def on_route(route):
        path = urlparse(route.request.url).path
        route.fulfill(status=200, content_type="application/json", body=json.dumps(api_response(path)))

    page.on("request", on_request)
    page.on("console", on_console)
    page.on("pageerror", lambda e: console_errors.append(str(e)))
    page.on("dialog", lambda d: d.dismiss())
    page.route("**/api/**", on_route)

    url = "http://127.0.0.1:%d/%s.html%s" % (PORT, name, QUERY.get(name, ""))
    page.goto(url, wait_until="load")
    page.wait_for_timeout(700)

    if external:
        failures.append("%s: peticiones externas: %s" % (label, sorted(set(external))[:3]))
    if console_errors:
        failures.append("%s: errores de consola: %s" % (label, console_errors[:2]))
    overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    if overflow > 1:
        failures.append("%s: desborde horizontal de %dpx" % (label, overflow))
    has_icons = page.evaluate("document.querySelectorAll('i.ti').length > 0")
    if has_icons:
        icon_font_ok = page.evaluate(
            "[...document.fonts].some(f => f.family.toLowerCase().includes('tabler') && f.status === 'loaded')"
        )
        if not icon_font_ok:
            failures.append("%s: la fuente de iconos no cargo" % label)
        missing = page.evaluate(
            "[...document.querySelectorAll('i.ti')].filter(i => ['none','normal'].includes(getComputedStyle(i,'::before').content)).map(i => i.className)"
        )
        if missing:
            failures.append("%s: iconos sin glifo: %s" % (label, sorted(set(missing))[:4]))

    os.makedirs(os.path.join(out_dir, role), exist_ok=True)
    page.screenshot(path=os.path.join(out_dir, role, "%s-%d.png" % (name, width)), full_page=True)
    context.close()


def check_reduced_motion(browser, failures):
    context = browser.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce")
    context.add_init_script(
        "localStorage.setItem('authToken','%s');localStorage.setItem('currentUser',%s);"
        % (fake_jwt(), json.dumps(json.dumps({"username": "admin", "role": "ADMIN"})))
    )
    page = context.new_page()
    page.route("**/api/**", lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(api_response(urlparse(r.request.url).path))))
    for name in ["login", "dashboard"]:
        page.goto("http://127.0.0.1:%d/%s.html" % (PORT, name), wait_until="load")
        page.wait_for_timeout(1200)
        running = page.evaluate("document.getAnimations().filter(a => a.playState === 'running').length")
        if running:
            failures.append("reduced-motion %s: %d animaciones siguen corriendo" % (name, running))
    context.close()


def check_focus_visible(browser, failures):
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    page.goto("http://127.0.0.1:%d/login.html" % PORT, wait_until="load")
    page.wait_for_timeout(600)
    page.keyboard.press("Tab")
    visible = page.evaluate(
        "(() => { const s = getComputedStyle(document.activeElement); "
        "return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none'; })()"
    )
    if not visible:
        failures.append("login: el elemento enfocado con Tab no muestra anillo de foco")
    context.close()



ROLE_MENU = {
    "ADMIN": ["Panel de Control", "Usuarios", "Grupos", "Consultas", "Auditoría"],
    "USER": ["Panel de Control", "Usuarios", "Grupos", "Consultas"],
    "CONSULTOR": ["Panel de Control", "Usuarios", "Grupos", "Consultas"],
    "AUDITOR": ["Panel de Control", "Auditoría"],
}


def private_context(browser, role, width, reduced="no-preference"):
    context = browser.new_context(viewport={"width": width, "height": 800}, reduced_motion=reduced)
    context.add_init_script(
        "if(!sessionStorage.getItem('qa-seeded')){sessionStorage.setItem('qa-seeded','1');"
        "localStorage.setItem('authToken','%s');localStorage.setItem('currentUser',%s);}"
        % (fake_jwt(), json.dumps(json.dumps({"username": "admin", "role": role})))
    )
    page = context.new_page()
    page.route("**/api/**", lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(api_response(urlparse(r.request.url).path))))
    return context, page


def open_page(page, name):
    page.goto("http://127.0.0.1:%d/%s.html%s" % (PORT, name, QUERY.get(name, "")), wait_until="load")
    page.wait_for_timeout(700)


def check_logout_dialog(browser, failures):
    context, page = private_context(browser, "ADMIN", 1280)
    open_page(page, "dashboard")
    page.click(".logout-btn")
    page.wait_for_timeout(400)
    if not page.is_visible(".modal-backdrop.is-visible"):
        failures.append("logout: no aparece la ventana de confirmacion")
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)
    if page.is_visible(".modal-backdrop.is-visible"):
        failures.append("logout: Esc no cierra la ventana")
    if not page.evaluate("document.activeElement.classList.contains('logout-btn')"):
        failures.append("logout: el foco no vuelve al boton de cerrar sesion")
    page.click(".logout-btn")
    page.wait_for_timeout(400)
    page.click(".confirm-actions .btn-primary")
    page.wait_for_timeout(800)
    if not page.url.endswith("login.html"):
        failures.append("logout: al confirmar no se llega al login (%s)" % page.url)
    if page.evaluate("localStorage.getItem('authToken')"):
        failures.append("logout: el token sigue guardado")
    context.close()


def check_drawer_mobile(browser, failures):
    context, page = private_context(browser, "ADMIN", 360)
    open_page(page, "dashboard")
    box = page.evaluate("(() => { const r = document.getElementById('sidebar').getBoundingClientRect(); return r.right; })()")
    if box > 1:
        failures.append("menu movil: el sidebar esta visible al cargar (right=%s)" % box)
    page.click("#sidebarToggle")
    page.wait_for_timeout(600)
    if not page.evaluate("document.getElementById('sidebar').classList.contains('is-open')"):
        failures.append("menu movil: el boton no abre el menu")
    if not page.is_visible("#sidebarOverlay.is-visible"):
        failures.append("menu movil: no aparece el fondo oscuro")
    page.keyboard.press("Escape")
    page.wait_for_timeout(500)
    if page.evaluate("document.getElementById('sidebar').classList.contains('is-open')"):
        failures.append("menu movil: Esc no cierra el menu")
    page.click("#sidebarToggle")
    page.wait_for_timeout(600)
    page.mouse.click(350, 400)
    page.wait_for_timeout(500)
    if page.evaluate("document.getElementById('sidebar').classList.contains('is-open')"):
        failures.append("menu movil: tocar fuera no cierra el menu")
    page.click("#sidebarToggle")
    page.wait_for_timeout(600)
    page.click(".menu-item:has-text('Usuarios')")
    page.wait_for_timeout(900)
    if "administracion-usuarios.html" not in page.url:
        failures.append("menu movil: elegir Usuarios no navega (%s)" % page.url)
    context.close()


def check_tables_as_cards(browser, failures):
    context, page = private_context(browser, "ADMIN", 360)
    open_page(page, "auditoria")
    info = page.evaluate(
        "(() => { const t = document.querySelector('table.rt'); if (!t) return null;"
        " const td = t.querySelector('tbody td[data-label]'); const th = t.querySelector('thead th');"
        " return { label: td ? td.getAttribute('data-label') : null, head: th ? th.textContent.trim() : null,"
        " rowDisplay: td ? getComputedStyle(td.parentElement).display : null }; })()"
    )
    if not info or not info["label"]:
        failures.append("tablas: no se pusieron data-label en las celdas")
    elif info["label"] != info["head"]:
        failures.append("tablas: data-label (%s) no coincide con el encabezado (%s)" % (info["label"], info["head"]))
    elif info["rowDisplay"] != "block":
        failures.append("tablas: a 360px la fila no se vuelve tarjeta (display=%s)" % info["rowDisplay"])
    context.close()


def check_roles_menu(browser, failures):
    for role, expected in ROLE_MENU.items():
        context, page = private_context(browser, role, 1280)
        open_page(page, "dashboard")
        items = page.evaluate("[...document.querySelectorAll('.sidebar .menu-item')].map(b => b.textContent.trim())")
        if items != expected:
            failures.append("menu por rol %s: se esperaba %s y se vio %s" % (role, expected, items))
        context.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pages", default="all")
    parser.add_argument("--viewports", default="360,768,1280")
    parser.add_argument("--role", default="ADMIN")
    parser.add_argument("--out", default="/tmp/astro-qa")
    args = parser.parse_args()

    pages = PUBLIC + PRIVATE if args.pages == "all" else args.pages.split(",")
    widths = [int(w) for w in args.viewports.split(",")]
    failures = []

    server = start_server()
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
        for name in pages:
            for width in widths:
                run_page(browser, name, width, args.role, args.out, failures)
        check_reduced_motion(browser, failures)
        check_focus_visible(browser, failures)
        check_logout_dialog(browser, failures)
        check_drawer_mobile(browser, failures)
        check_tables_as_cards(browser, failures)
        check_roles_menu(browser, failures)
        browser.close()
    server.shutdown()

    for f in failures:
        print("FALLO:", f)
    print("%d fallos" % len(failures))
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
