/* ============================================
   CONSULTAS - Carga datos reales desde la API
   ============================================ */

// ── MODIFICADO: cada fuente de datos se pide por separado.
//    Antes usaba Promise.all, y si Puertas/Areas/Accesos fallaban
//    (403 para roles sin permiso), TODA la pagina se rompia,
//    incluyendo Usuarios/Grupos que ese rol si podia ver. ──
function loadAllData() {
    cargarUsuarios();
    cargarGrupos();

    var rol = authService.getUserRole();
    var puedeVerPuertasAreas = ['ADMIN', 'CONSULTOR'].indexOf(rol) !== -1;

    if (puedeVerPuertasAreas) {
        cargarPuertas();
        cargarAreas();
        cargarAccesos();
    }

    // La primera pestaña visible siempre es 'usuarios', que todos los
    // roles con acceso a esta pagina pueden ver.
    renderList();
}

function cargarUsuarios() {
    apiClient.getUsers(0, 1000).then(function(r) {
        var usuarios = r.content || r || [];
        DB.usuarios = usuarios.map(function(u) {
            return {
                id:      u.idUsuario,
                cedula:  u.cedula,
                idGrupo: u.grupo ? u.grupo.idGrupo : null,
                grupo:   u.grupo ? u.grupo.codigo   : '',
                estatus: u.estatus
            };
        });
        if (currentTab === 'usuarios') renderList();
    }).catch(function(e) {
        console.error('Error cargando usuarios:', e);
    });
}

function cargarGrupos() {
    apiClient.getGroups(0, 1000).then(function(r) {
        var grupos = r.content || r || [];
        DB.grupos = grupos.map(function(g) {
            return {
                id:      g.idGrupo,
                codigo:  g.codigo,
                nombre:  g.nombre,
                estatus: g.estatus
            };
        });
        if (currentTab === 'grupos') renderList();
    }).catch(function(e) {
        console.error('Error cargando grupos:', e);
    });
}

function cargarPuertas() {
    apiClient.getPuertas().then(function(r) {
        var puertas = r.content || r || [];
        DB.puertas = puertas.map(function(p) {
            return {
                id:     p.idPuerta,
                nombre: p.nombrePuerta,
                idArea: p.area ? p.area.idArea    : null,
                area:   p.area ? p.area.nombreArea : ''
            };
        });
        if (currentTab === 'puertas') renderList();
    }).catch(function(e) {
        console.error('Error cargando puertas:', e);
    });
}

function cargarAreas() {
    apiClient.getAreas().then(function(r) {
        var areas = r.content || r || [];
        DB.areas = areas.map(function(a) {
            return {
                id:     a.idArea,
                nombre: a.nombreArea
            };
        });
        if (currentTab === 'areas') renderList();
    }).catch(function(e) {
        console.error('Error cargando areas:', e);
    });
}

function cargarAccesos() {
    apiClient.request('/admin/acceso-grupo').then(function(r) {
        var accesos = r.content || r || [];
        DB.accesos = accesos.map(function(ac) {
            return {
                idGrupo:  ac.grupo  ? ac.grupo.idGrupo   : null,
                idPuerta: ac.puerta ? ac.puerta.idPuerta : null
            };
        });
    }).catch(function(e) {
        console.error('Error cargando accesos:', e);
    });
}