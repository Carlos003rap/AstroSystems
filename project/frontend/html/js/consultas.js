/* ============================================
   CONSULTAS - Carga datos reales desde la API
   ============================================ */

// ── MODIFICADO: cada fuente de datos se pide por separado.
//    Antes usaba Promise.all, y si Puertas/Areas/Accesos fallaban
//    (403 para roles sin permiso), TODA la pagina se rompia,
//    incluyendo Usuarios/Grupos que ese rol si podia ver. ──
// Estado de carga por pestaña para la interfaz: 'cargando', 'listo' o 'error'
var CARGA = { usuarios: 'cargando', grupos: 'cargando', puertas: 'cargando', areas: 'cargando' };

function marcarCarga(tab, estado) {
    CARGA[tab] = estado;
    if (typeof currentTab !== 'undefined' && currentTab === tab && typeof renderList === 'function') renderList();
}

// Vuelve a pedir los datos de la pestaña actual
function reintentarConsulta() {
    var cargadores = { usuarios: cargarUsuarios, grupos: cargarGrupos, puertas: cargarPuertas, areas: cargarAreas };
    if (!cargadores[currentTab]) return;
    marcarCarga(currentTab, 'cargando');
    cargadores[currentTab]();
}

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
        CARGA['usuarios'] = 'listo';
        if (currentTab === 'usuarios') renderList();
    }).catch(function(e) {
        console.error('Error cargando usuarios:', e);
        marcarCarga('usuarios', 'error');
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
        CARGA['grupos'] = 'listo';
        if (currentTab === 'grupos') renderList();
    }).catch(function(e) {
        console.error('Error cargando grupos:', e);
        marcarCarga('grupos', 'error');
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
        CARGA['puertas'] = 'listo';
        if (currentTab === 'puertas') renderList();
    }).catch(function(e) {
        console.error('Error cargando puertas:', e);
        marcarCarga('puertas', 'error');
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
        CARGA['areas'] = 'listo';
        if (currentTab === 'areas') renderList();
    }).catch(function(e) {
        console.error('Error cargando areas:', e);
        marcarCarga('areas', 'error');
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