/* ============================================
   DASHBOARD
   ============================================ */

window.addEventListener('load', function() {
    setRoleBadge();
    filterCardsByRole();
    loadDashboardStats();
});

// ── NUEVO: muestra el rol real de la cuenta en el header ──
function setRoleBadge() {
    var badge = document.getElementById('roleBadge');
    if (badge) {
        badge.textContent = authService.getUserRole() || '—';
    }
    // Saludo con el nombre de la cuenta (solo interfaz)
    var saludo = document.getElementById('dashGreeting');
    var user = authService.getCurrentUser() || {};
    var nombre = user.nombreCompleto || user.username || user.name || '';
    if (saludo) saludo.textContent = nombre ? 'Hola, ' + nombre : 'Bienvenido';
}

// ── NUEVO: oculta las tarjetas que el rol actual no puede usar ──
function filterCardsByRole() {
    var rol = authService.getUserRole();
    document.querySelectorAll('.dashboard-card[data-roles]').forEach(function(card) {
        var rolesPermitidos = card.getAttribute('data-roles').split(',');
        if (rolesPermitidos.indexOf(rol) === -1) {
            card.style.display = 'none';
        }
    });
}

// ── MODIFICADO: cada estadística se pide por separado y falla de forma
//    independiente, para que un 403 en auditoría no borre los datos
//    de usuarios/grupos que el rol sí puede ver ──
function loadDashboardStats() {
    var rol = authService.getUserRole();
    var puedeVerUsuariosGrupos = ['ADMIN', 'USER', 'CONSULTOR'].indexOf(rol) !== -1;
    var puedeVerAuditoria      = ['ADMIN', 'AUDITOR'].indexOf(rol) !== -1;

    if (puedeVerUsuariosGrupos) {
        apiClient.getUsers(0, 1000)
            .then(function(r) { setStat('statUsuarios', (r.content || r || []).length); })
            .catch(function() { setStat('statUsuarios', '—', 'error'); });

        apiClient.getGroups(0, 1000)
            .then(function(r) { setStat('statGrupos', (r.content || r || []).length); })
            .catch(function() { setStat('statGrupos', '—', 'error'); });
    } else {
        setStat('statUsuarios', '—', 'sin-acceso');
        setStat('statGrupos', '—', 'sin-acceso');
    }

    if (puedeVerAuditoria) {
        apiClient.getLoginLogs(0, 1000)
            .then(function(r) { setStat('statAccesos', (r.content || r || []).length); })
            .catch(function() { setStat('statAccesos', '—', 'error'); });

        apiClient.getAuditLogs(0, 1000)
            .then(function(r) { setStat('statCambios', (r.content || r || []).length); })
            .catch(function() { setStat('statCambios', '—', 'error'); });
    } else {
        setStat('statAccesos', '—', 'sin-acceso');
        setStat('statCambios', '—', 'sin-acceso');
    }
}

// Pinta el valor: contador animado si es número, nota si no hay dato
// estado: 'error' (falló la petición) o 'sin-acceso' (el rol no puede verlo)
function setStat(id, value, estado) {
    var el = document.getElementById(id);
    if (!el) return;
    var card = el.closest ? el.closest('.stat-card') : null;
    if (card) {
        card.classList.remove('is-loading');
        card.classList.toggle('is-unavailable', !!estado);
        var previa = card.querySelector('.stat-note');
        if (previa) previa.parentNode.removeChild(previa);
        if (estado) {
            var nota = document.createElement('span');
            nota.className = 'stat-note ' + (estado === 'error' ? 'is-error' : 'is-locked');
            nota.innerHTML = '<i class="ti ' + (estado === 'error' ? 'ti-alert-circle' : 'ti-lock') + '" aria-hidden="true"></i>';
            nota.appendChild(document.createTextNode(estado === 'error' ? 'No se pudo cargar' : 'Sin acceso con tu rol'));
            card.appendChild(nota);
        }
    }
    if (typeof value === 'number' && typeof UIService !== 'undefined' && UIService.countUp) {
        UIService.countUp(el, value);
    } else {
        el.textContent = value;
    }
}