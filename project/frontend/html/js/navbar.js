/* ============================================
   NAVBAR/SIDEBAR - Componente compartido
   ============================================ */

class NavbarService {

    static createSidebar() {
        const user = authService.getCurrentUser();
        const nombre = user?.username || user?.name || 'Usuario';
        const iniciales = nombre.substring(0, 2).toUpperCase();
        const rol = authService.getUserRole();

        const puedeVerUsuariosGrupos = ['ADMIN', 'USER', 'CONSULTOR'].includes(rol);
        const puedeVerConsultas      = ['ADMIN', 'USER', 'CONSULTOR'].includes(rol);
        const puedeVerAuditoria      = ['ADMIN', 'AUDITOR'].includes(rol);

        const itemUsuarios = puedeVerUsuariosGrupos ? `
                <button class="menu-item" onclick="navigateTo('administracion-usuarios.html')">
                    <i class="ti ti-users"></i><span>Usuarios</span>
                </button>` : '';

        const itemGrupos = puedeVerUsuariosGrupos ? `
                <button class="menu-item" onclick="navigateTo('administracion-grupos.html')">
                    <i class="ti ti-users-group"></i><span>Grupos</span>
                </button>` : '';

        const itemConsultas = puedeVerConsultas ? `
                <button class="menu-item" onclick="navigateTo('consultas.html')">
                    <i class="ti ti-search"></i><span>Consultas</span>
                </button>` : '';

        const itemAuditoria = puedeVerAuditoria ? `
                <button class="menu-item" onclick="navigateTo('auditoria.html')">
                    <i class="ti ti-history"></i><span>Auditoría</span>
                </button>` : '';

        const seccionAdmin = (itemUsuarios || itemGrupos)
            ? `<div class="menu-section-title">Administración</div>${itemUsuarios}${itemGrupos}`
            : '';

        const seccionReportes = (itemConsultas || itemAuditoria)
            ? `<div class="menu-section-title">Reportes</div>${itemConsultas}${itemAuditoria}`
            : '';

        return `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <div class="sidebar-logo-icon">
                        <i class="ti ti-building-skyscraper"></i>
                    </div>
                    <span class="sidebar-logo-text">ASTRO SISTEMAS</span>
                </div>
                <div class="sidebar-profile">
                    <div class="profile-avatar">${iniciales}</div>
                    <span class="profile-name" id="profileName">${nombre}</span>
                    <span class="profile-role" id="profileRole">${rol || ''}</span>
                </div>
            </div>

            <nav class="sidebar-menu">
                <div class="menu-section-title">Principal</div>
                <button class="menu-item" onclick="navigateTo('dashboard.html')">
                    <i class="ti ti-layout-dashboard"></i><span>Panel de Control</span>
                </button>

                ${seccionAdmin}
                ${seccionReportes}
            </nav>

            <div class="sidebar-footer">
                <button class="logout-btn" onclick="handleLogout()">
                    <i class="ti ti-logout"></i><span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
        `;
    }

    static injectSidebar() {
        const root = document.getElementById('sidebarRoot');
        if (root) {
            root.innerHTML = NavbarService.createSidebar();
        }
        NavbarService.setActiveMenuItem();
        NavbarService.initToggle();
    }

    static setActiveMenuItem() {
        const page = window.location.pathname.split('/').pop() || 'dashboard.html';
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') || '';
        document.querySelectorAll('.sidebar .menu-item').forEach(btn => {
            const onclick = btn.getAttribute('onclick') || '';
            if (tab && onclick.includes('auditoria.html?tab=' + tab)) {
                btn.classList.add('active');
            } else if (!tab && onclick.includes(page) && !onclick.includes('?tab=')) {
                btn.classList.add('active');
            } else if (!tab && !onclick.includes('?') && onclick.includes(page)) {
                btn.classList.add('active');
            }
        });
    }

    static initToggle() {
        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebar   = document.getElementById('sidebar');
        const main = document.getElementById('mainContent') || document.getElementById('adminMain');

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', function () {
                sidebar.classList.toggle('collapsed');
                if (main) main.classList.toggle('collapsed');
            });
        }
    }
}

function requireRole(rolesPermitidos) {
    const rol = authService.getUserRole();
    if (!rolesPermitidos.includes(rol)) {
        alert('No tienes permiso para acceder a esta sección.');
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

function navigateTo(page) {
    window.location.href = page;
}

function handleLogout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        authService.logout();
        window.location.href = 'login.html';
    }
}

function exportTable(tableId, format = 'csv') {
    const table = document.getElementById(tableId) || document.querySelector('table');
    if (!table) { alert('No se encontró una tabla para exportar.'); return; }

    const headers = Array.from(table.querySelectorAll('thead th'))
        .map(th => th.innerText.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(row =>
        Array.from(row.querySelectorAll('td')).map(cell => {
            const text = cell.innerText.replace(/\n/g, ' ').trim();
            return `"${text.replace(/"/g, '""')}"`;
        }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const ext = format === 'xlsx' ? 'xlsx' : 'csv';
    const filename = `${tableId || 'export'}_${new Date().toISOString().slice(0, 10)}.${ext}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    if (!currentPage.includes('login.html') && !currentPage.includes('index.html')) {
        authService.checkAuth();
    }
    if (document.getElementById('sidebarRoot')) {
        NavbarService.injectSidebar();
    }
});