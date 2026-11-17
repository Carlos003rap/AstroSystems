# Pulido visual, animaciones y versión móvil de AstroSystems — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar las 11 páginas de AstroSystems con un diseño moderno y consistente, animaciones con propósito y buen funcionamiento en teléfono, sin cambiar ningún comportamiento existente.

**Architecture:** `global.css` se convierte en el sistema de diseño (variables y componentes). `ui.js` y `navbar.js` ganan los componentes compartidos (toast, confirmación, esqueletos, estados vacíos, tablas a tarjetas, menú deslizable). Cada página solo agrega clases y estilos, sin tocar su lógica. Un script de Playwright con la API simulada verifica cada paso.

**Tech Stack:** HTML, CSS y JS puros servidos como estáticos por Spring Boot (sin build). Tabler Icons e Inter locales en `html/css/vendor/`. Playwright (Python) con Chrome para QA.

**Spec:** `docs/superpowers/specs/2026-11-17-rediseno-ui-design.md`

## Global Constraints

- Sin CDN: íconos y fuente locales en `project/frontend/html/css/vendor/` (Spring Security solo deja pasar sin sesión `/css/**`, `/js/**` e `/img/**`: ningún recurso nuevo puede vivir fuera de esas carpetas).
- Sin framework y sin paso de build; el backend no se toca.
- Los ids, clases y `onclick` que usa el JS actual se mantienen; las clases nuevas se agregan.
- Puntos de corte de partida: 480, 768 y 1100 px. Debe funcionar desde 360 px.
- Botones táctiles de al menos 44 px en móvil; foco visible; `aria-label` donde falte.
- Respetar `prefers-reduced-motion` (sin animaciones, contadores muestran el valor final al instante).
- Identidad intacta: verde institucional, estructura y textos de los mockups de `figma/`.
- Paleta: verde como único acento y fondos blancos (página y tarjetas); verde/ámbar/rojo solo para estados.
- Rama nueva `fase8-pulido-visual`. Commits y push solo cuando Carlos confirme cada paso; el merge a `main` lo hace Carlos. Los commits llevan la atribución de Claude Code vigente.
- Textos de interfaz en español con tildes correctas.

## Review Focus

1. Backend dormido (Render gratis): el login puede tardar 50 s o más. Debe verse el aviso "el servidor está despertando", no permitir doble envío y mostrar un mensaje claro al agotar el tiempo.
2. Respuestas vacías o con error (0 filas, 401, 403, 429, 500): la tabla nunca queda en blanco ni atascada en esqueleto; siempre hay estado vacío o mensaje de error.
3. Teléfono a 360 px con datos largos (nombres de grupo largos, correos, cédulas): sin scroll horizontal de página; el menú deslizable se cierra al navegar y con Esc.
4. Roles ADMIN, USER, CONSULTOR y AUDITOR: cada uno ve solo sus opciones en sidebar y dashboard, sin huecos, también en móvil.
5. Teclado y movimiento reducido: Enter envía el login, el modal de confirmación devuelve el foco y se cierra con Esc, y con `prefers-reduced-motion` no hay animaciones.

---

### Task 1: Arnés de QA y recursos locales

**Files:**
- Create: `docs/superpowers/qa/smoke.py`
- Create: `project/frontend/html/css/vendor/tabler/` (CSS + fuentes del webfont), `project/frontend/html/css/vendor/inter/` (woff2 latin + `inter.css`)
- Modify: los 11 `*.html` en `project/frontend/html/` (reemplazar el `<link>` del CDN por el local y agregar el de `inter.css`)

**Interfaces:**
- Produces: `python3 docs/superpowers/qa/smoke.py --pages <lista|all> --viewports 360,768,1280 --role <ADMIN|USER|CONSULTOR|AUDITOR>`; sale con código 0 solo si hay 0 fallos y deja capturas en `/tmp/astro-qa/<rol>/<pagina>-<ancho>.png`. Un fallo es: error de consola, petición a un dominio externo, `scrollWidth > innerWidth` en la página, o un `.ti` sin glifo visible.
- Produces: la API `/api/**` se simula con `page.route` y fixtures por rol; la sesión se siembra leyendo cómo `auth.js` guarda el token.

- [ ] **Step 1: Escribir `smoke.py`** con los cuatro chequeos de arriba, sirviendo `project/frontend/html` con `http.server` y usando `/usr/bin/google-chrome`. Incluir `check_no_external_requests` y `check_no_horizontal_overflow`.
- [ ] **Step 2: Ejecutar** `python3 docs/superpowers/qa/smoke.py --pages all --viewports 360,1280 --role ADMIN`. Esperado: FALLA por peticiones externas (CDN) y por desborde horizontal en móvil.
- [ ] **Step 3: Descargar los recursos** con npm (`@tabler/icons-webfont`, `@fontsource-variable/inter`) a un directorio temporal, copiar a `html/css/vendor/` solo CSS y fuentes necesarias (Inter solo subset latin), y reescribir las rutas relativas dentro de los CSS.
- [ ] **Step 4: Reemplazar** en los 11 HTML el `<link>` del CDN por `css/vendor/tabler/tabler-icons.min.css` y agregar `css/vendor/inter/inter.css`.
- [ ] **Step 5: Ejecutar de nuevo.** Esperado: ya no hay peticiones externas ni íconos sin glifo; el desborde móvil puede seguir fallando (se arregla en tareas siguientes).
- [ ] **Step 6: Commit** (tras confirmación de Carlos).

### Task 2: Sistema de diseño en `global.css`

**Files:**
- Modify: `project/frontend/html/css/global.css`

**Interfaces:**
- Produces: variables `--color-primary-50…900`, `--color-neutral-50…900`, `--radius-sm|md|lg|xl`, `--shadow-sm|md|lg`, `--space-1…8`, `--font-sans`, `--ease-out`, `--dur-fast|base|slow`; clases `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-small`, `.card`, `.badge`, `.skeleton`, `.empty-state`, `.toast`, `.modal-backdrop`, `.is-visible`, `.sr-only`; animaciones `fade-up`, `shimmer`, `shake`; bloque `@media (prefers-reduced-motion: reduce)` que anula animaciones y transiciones.
- Las variables y clases que ya existen (`--color-primary`, `.btn-primary`, `.status-*`) conservan su nombre y valor base.

- [ ] **Step 1: Agregar a `smoke.py`** el chequeo `check_reduced_motion` (con `reduced_motion="reduce"` ninguna animación CSS corre) y `check_focus_visible` (Tab en login muestra anillo de foco).
- [ ] **Step 2: Ejecutar.** Esperado: FALLA en esos dos chequeos.
- [ ] **Step 3: Reescribir `global.css`** con las variables y clases de Interfaces, quitando el `.btn-small` duplicado y el hover fuera de paleta. Los botones dejan de ser píldora global por selector `button` y pasan a clases explícitas, sin romper los que ya dependen de eso (revisar cada CSS de página).
- [ ] **Step 4: Ejecutar.** Esperado: PASA en los chequeos nuevos y sin regresiones; revisar capturas de las 11 páginas a 1280 px.
- [ ] **Step 5: Commit** (tras confirmación).

### Task 3: Componentes compartidos (`ui.js`, `navbar.js`)

**Files:**
- Modify: `project/frontend/html/js/ui.js`, `project/frontend/html/js/navbar.js`
- Modify: `project/frontend/html/css/dashboard.css` (solo las reglas del sidebar y del menú móvil)

**Interfaces:**
- Produces en `UIService`:
  - `static showToast(message: string, type?: 'success'|'error'|'warning'|'info'): void` (misma firma; ahora con clases, ícono, barra de progreso y cierre con clic).
  - `static confirmDialog(opts: { title: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean }): Promise<boolean>` (foco atrapado, Esc cancela, devuelve el foco).
  - `static renderEmptyState(target: HTMLElement, opts: { icon: string; title: string; text?: string }): void`
  - `static renderSkeletonRows(tbody: HTMLElement, cols: number, rows?: number): void`
  - `static enableResponsiveTables(root?: ParentNode): void` (observa los `tbody` y copia el texto de cada `th` en `data-label` de cada `td`).
  - `static countUp(el: HTMLElement, to: number, ms?: number): void`
- Produces en `NavbarService`: `openDrawer(): void`, `closeDrawer(): void`; en pantallas ≤ 900 px el sidebar es un panel deslizable con fondo oscuro, se cierra con Esc, con clic fuera y al navegar.
- Cambia: `handleLogout()` usa `confirmDialog`; `requireRole()` y `exportTable()` usan `showToast` en lugar de `alert()`. `requireRole` sigue devolviendo `boolean` de forma síncrona y redirige tras 1200 ms. `UIService.confirm` (síncrono) no se modifica; buscar con grep sus usos y migrar los que existan.

- [ ] **Step 1: Agregar a `smoke.py`** `check_logout_dialog` (clic en cerrar sesión abre `.modal-backdrop.is-visible`, Esc lo cierra y el foco vuelve al botón), `check_drawer_mobile` (a 360 px el sidebar está fuera de pantalla, el botón de menú lo abre, Esc lo cierra), `check_tables_as_cards` (a 360 px una fila de la tabla de usuarios muestra `data-label`) y `check_roles_menu` (cada rol ve exactamente sus opciones en sidebar).
- [ ] **Step 2: Ejecutar.** Esperado: FALLAN los cuatro.
- [ ] **Step 3: Implementar** las firmas de Interfaces en `ui.js` y `navbar.js`; `enableResponsiveTables` se invoca desde `DOMContentLoaded` en `navbar.js` para que todas las páginas la reciban sin editar su JS.
- [ ] **Step 4: Ejecutar** con `--role ADMIN`, `USER`, `CONSULTOR` y `AUDITOR`. Esperado: PASA todo.
- [ ] **Step 5: Entregar el paso 1 a Carlos** (archivos completos listos para pegar y capturas a 360 y 1280 px) y esperar su confirmación.
- [ ] **Step 6: Commit** (tras confirmación).

### Task 4: Login, recuperar y restablecer contraseña

**Files:**
- Modify: `login.html`, `forgot-password.html`, `reset-password.html`, `css/login.css`, `js/login.js`, `js/forgot-password.js`, `js/reset-password.js`

**Interfaces:**
- Consumes: `showToast`, clases de Task 2.
- Produces: en `login.js`, aviso "El servidor está despertando, puede tardar un momento" si la petición supera 6 s, tiempo límite de 90 s con mensaje de error y botón habilitado de nuevo, y clase `.shake` en la tarjeta ante error. El texto del botón es "Iniciando sesión..." con tilde.

- [ ] **Step 1: Agregar a `smoke.py`** `check_login_slow_server` (la ruta simulada tarda 8 s: aparece el aviso y un segundo clic no envía otra petición), `check_login_error_shake` (credenciales inválidas, 401, 429: mensaje visible y `.shake`), `check_login_enter_submits`.
- [ ] **Step 2: Ejecutar.** Esperado: FALLAN.
- [ ] **Step 3: Implementar** el rediseño (tarjeta con efecto cristal sobre la foto, entrada suave, brillo al enfocar) y la lógica de aviso/tiempo límite en `login.js`, sin cambiar el flujo de bloqueo ni "recordar usuario".
- [ ] **Step 4: Ejecutar.** Esperado: PASA, sin errores de consola, a 360, 768 y 1280 px.
- [ ] **Step 5: Entregar a Carlos** y esperar confirmación; **Step 6: Commit.**

### Task 5: Dashboard y sidebar

**Files:**
- Modify: `dashboard.html`, `css/dashboard.css`, `js/dashboard.js`

**Interfaces:**
- Consumes: `countUp`, `renderSkeleton…`, drawer de Task 3.
- Produces: contadores animados en `#statUsuarios`, `#statGrupos`, `#statAccesos`, `#statCambios`; esqueleto mientras llegan los datos; si la API falla, la tarjeta muestra "—" y un aviso sin romper las demás.

- [ ] **Step 1: Agregar a `smoke.py`** `check_dashboard_stats` (valores finales correctos con la API simulada, también con reduced motion), `check_dashboard_stats_error` (una estadística con 500 no deja las otras en esqueleto), `check_dashboard_cards_by_role`.
- [ ] **Step 2–4: Ejecutar para ver el fallo, implementar, ejecutar para ver que pasa.**
- [ ] **Step 5: Entregar a Carlos** y esperar confirmación; **Step 6: Commit.**

### Task 6: Administración de usuarios, grupos y edición

**Files:**
- Modify: `administracion-usuarios.html`, `administracion-grupos.html`, `editar-usuario.html`, `editar-grupo.html`, `css/administracion.css`, `css/editar-usuario.css`; en `js/administracion-usuarios.js` y `js/administracion-grupos.js` solo los puntos de eliminar/estado vacío/carga, sin tocar la lógica de datos.

**Interfaces:**
- Consumes: `confirmDialog`, `renderEmptyState`, `renderSkeletonRows`, `enableResponsiveTables`.
- Produces: el eliminar usa `confirmDialog({danger: true, …})`; tabla vacía, con error y cargando tienen estado propio; el filtro se apila en móvil.

- [ ] **Step 1: Agregar a `smoke.py`** `check_users_empty_state` (lista vacía muestra el estado vacío), `check_users_error_state` (500 muestra mensaje de error, no tabla en blanco), `check_users_delete_confirm` (cancelar no llama a DELETE; confirmar sí), `check_users_long_values` (nombres largos no desbordan a 360 px).
- [ ] **Step 2–4: Fallo, implementar, pasa** (con los cuatro roles donde aplique).
- [ ] **Step 5: Entregar a Carlos** y esperar confirmación; **Step 6: Commit.**

### Task 7: Auditoría y consultas

**Files:**
- Modify: `auditoria.html`, `consultas.html`, `css/auditoria.css`, `css/consultas.css`; en `js/auditoria-cambios.js`, `js/auditoria-login.js` y `js/consultas.js` solo estados de carga, vacío y error.

**Interfaces:**
- Consumes: componentes de Task 3.
- Produces: pestañas con indicador animado, resultados con estados vacío/error/cargando, exportar CSV con aviso `showToast`.

- [ ] **Step 1: Agregar a `smoke.py`** `check_audit_tabs` (cambiar de pestaña no deja la anterior visible), `check_audit_empty_error`, `check_export_toast`, `check_consultas_mobile`.
- [ ] **Step 2–4: Fallo, implementar, pasa** (rol AUDITOR y ADMIN).
- [ ] **Step 5: Entregar a Carlos** y esperar confirmación; **Step 6: Commit.**

### Task 8: Revisión final y Pull Request

**Files:**
- Modify: ajustes puntuales detectados; `docs/superpowers/specs/2026-11-17-rediseno-ui-design.md` (marcar estado "implementado").

- [ ] **Step 1: Ejecutar** `smoke.py --pages all --viewports 360,768,1280` para los cuatro roles. Esperado: 0 fallos y capturas de todas las páginas.
- [ ] **Step 2: Verificar** el arranque real: construir y levantar el backend si es posible, o servir los estáticos tal como los copia el `Dockerfile`, y abrir login y dashboard.
- [ ] **Step 3: Revisar** `git diff --stat` contra `main`: confirmar que no hay cambios fuera de `project/frontend/html/` y `docs/`.
- [ ] **Step 4: Subir la rama** `fase8-pulido-visual` y abrir el Pull Request con la lista de cambios y las capturas; avisar a Carlos que el merge a `main` despliega en Render.
