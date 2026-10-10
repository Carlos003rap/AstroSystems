/* ============================================
   ADMINISTRACIÓN USUARIOS
   Tabla: usuario (Id_usuario, Cedula, Id_grupo, Estatus)
   ============================================ */

var currentPage = 0;
var pageSize    = 10;
var totalPages  = 1;
var allGroups   = [];

// ── Init ──
window.addEventListener('load', function() {
    loadGroupsForSelect();
    loadUsers();
});

// ── Cargar grupos para el select del filtro ──
function loadGroupsForSelect() {
    apiClient.getGroups(0, 100).then(function(res) {
        allGroups = (res.content || res || []).map(function(g) {
            return { Id_grupo: g.idGrupo || g.Id_grupo, Codigo: g.codigo || g.Codigo, Nombre: g.nombre || g.Nombre };
        });
        var selFilter = document.getElementById('filterGrupo');
        var selModal  = document.getElementById('userGrupo');
        allGroups.forEach(function(g) {
            if (selFilter) selFilter.appendChild(new Option((g.Codigo || g.codigo) + ' - ' + (g.Nombre || g.nombre), g.Codigo || g.codigo));
            if (selModal)  selModal.appendChild(new Option((g.Codigo || g.codigo) + ' - ' + (g.Nombre || g.nombre), g.Id_grupo || g.idGrupo));
        });
    }).catch(function() {
        UIService.showError('No se pudieron cargar los grupos');
    });
}

// ── Cargar usuarios desde la API ──
function loadUsers() {
    var loadingState = document.getElementById('loadingState');
    var noResults    = document.getElementById('noResults');
    if (loadingState) loadingState.style.display = 'block';
    if (noResults)    noResults.style.display    = 'none';

    apiClient.getUsers(currentPage, pageSize).then(function(res) {
        var users = (res.content || res || []).map(function(u) {
            return {
                Id_usuario: u.idUsuario || u.id || u.Id_usuario,
                Cedula: u.cedula || u.Cedula,
                Id_grupo: u.grupo && (u.grupo.idGrupo || u.grupo.Id_grupo) ? (u.grupo.idGrupo || u.grupo.Id_grupo) : u.id_grupo,
                grupoCodigo: u.grupo && (u.grupo.codigo || u.grupo.Codigo) ? (u.grupo.codigo || u.grupo.Codigo) : '',
                Estatus: u.estatus || u.Estatus
            };
        });
        renderUsers(users);
        updatePagination(currentPage, res.totalPages || 1);
        if (loadingState) loadingState.style.display = 'none';
    }).catch(function() {
        if (loadingState) loadingState.style.display = 'none';
        UIService.showError('Error al cargar usuarios');
    });
}

// ── MODIFICADO: el link "Editar" solo se muestra si el rol puede escribir ──
function renderUsers(users) {
    var tbody   = document.getElementById('usersTableBody');
    var counter = document.getElementById('visibleCount');
    if (!tbody) return;

    var rol = authService.getUserRole();
    var puedeEditar = rol === 'ADMIN';

    tbody.innerHTML = '';

    if (!users || users.length === 0) {
        var noResults = document.getElementById('noResults');
        if (noResults) noResults.style.display = 'block';
        if (counter) counter.textContent = '0';
        return;
    }

    if (counter) counter.textContent = users.length;

    users.forEach(function(u) {
        var estadoClass = u.Estatus === 'Activo' ? 'status-active' : 'status-inactive';
        var grupoCodigo = u.grupoCodigo || u.Id_grupo;
        var tr = document.createElement('tr');
        tr.dataset.cedula  = (u.Cedula  || '').toLowerCase();
        tr.dataset.grupo   = u.grupoCodigo || '';
        tr.dataset.estatus = u.Estatus || '';
        tr.innerHTML =
            '<td>' + u.Id_usuario + '</td>' +
            '<td>' + u.Cedula + '</td>' +
            '<td><span class="group-pill">' + grupoCodigo + '</span></td>' +
            '<td><span class="status-badge ' + estadoClass + '">' + u.Estatus + '</span></td>' +
            '<td><div class="action-btns">' +
                (puedeEditar
                    ? '<a class="btn-action edit" href="editar-usuario.html?id=' + u.Id_usuario + '"><i class="ti ti-edit"></i>Editar</a>'
                    : '<span class="text-muted">Solo lectura</span>') +
            '</div></td>';
        tbody.appendChild(tr);
    });
}

// ── Filtro en tiempo real ──
function filterTable() {
    var search  = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase().trim() : '';
    var grupo   = document.getElementById('filterGrupo')   ? document.getElementById('filterGrupo').value   : '';
    var estatus = document.getElementById('filterEstatus') ? document.getElementById('filterEstatus').value : '';
    var rows    = document.querySelectorAll('#usersTableBody tr');
    var visible = 0;

    rows.forEach(function(row) {
        var ok = (!search  || row.dataset.cedula.includes(search))
              && (!grupo   || row.dataset.grupo   === grupo)
              && (!estatus || row.dataset.estatus === estatus);
        row.style.display = ok ? '' : 'none';
        if (ok) visible++;
    });

    var counter = document.getElementById('visibleCount');
    if (counter) counter.textContent = visible;

    var noResults = document.getElementById('noResults');
    if (noResults) noResults.style.display = (visible === 0 && rows.length > 0) ? 'block' : 'none';
}

// ── Paginación ──
function updatePagination(page, total) {
    totalPages = total || 1;
    var info    = document.getElementById('pageInfo');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    if (info)    info.textContent = 'Página ' + (page + 1) + ' de ' + totalPages;
    if (prevBtn) prevBtn.disabled = page <= 0;
    if (nextBtn) nextBtn.disabled = page >= totalPages - 1;
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        loadUsers();
    }
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        loadUsers();
    }
}

// ── Editar usuario ──
function editUser(id) {
    navigateTo('editar-usuario.html?id=' + id);
}

// ── Modal ──
function closeModal(id) {
    UIService.closeModal(id);
}

function saveUser() {
    var cedula  = document.getElementById('userCedula') ? document.getElementById('userCedula').value.trim() : '';
    var grupo   = document.getElementById('userGrupo')  ? document.getElementById('userGrupo').value         : '';
    var estatus = document.getElementById('userEstatus')? document.getElementById('userEstatus').value       : 'Activo';

    if (!cedula || !grupo) {
        UIService.showError('Por favor completa todos los campos');
        return;
    }

    // TODO: apiClient.createUser({ Cedula: cedula, Id_grupo: grupo, Estatus: estatus })
    //     .then(function() {
    //         UIService.showSuccess('Usuario guardado correctamente');
    //         closeModal('userModal');
    //         loadUsers();
    //     }).catch(function() {
    //         UIService.showError('Error al guardar el usuario');
    //     });

    UIService.showSuccess('Usuario guardado (modo prueba)');
    closeModal('userModal');
}