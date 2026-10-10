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
            .catch(function() { setStat('statUsuarios', '—'); });

        apiClient.getGroups(0, 1000)
            .then(function(r) { setStat('statGrupos', (r.content || r || []).length); })
            .catch(function() { setStat('statGrupos', '—'); });
    } else {
        setStat('statUsuarios', '—');
        setStat('statGrupos', '—');
    }

    if (puedeVerAuditoria) {
        apiClient.getLoginLogs(0, 1000)
            .then(function(r) { setStat('statAccesos', (r.content || r || []).length); })
            .catch(function() { setStat('statAccesos', '—'); });

        apiClient.getAuditLogs(0, 1000)
            .then(function(r) { setStat('statCambios', (r.content || r || []).length); })
            .catch(function() { setStat('statCambios', '—'); });
    } else {
        setStat('statAccesos', '—');
        setStat('statCambios', '—');
    }
}

function setStat(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
}