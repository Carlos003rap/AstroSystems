/* ============================================
   ADMINISTRACIÓN GRUPOS
   Tabla: grupo (Id_grupo, Codigo, Nombre, Estatus)
   ============================================ */

var currentPage = 0;
var pageSize    = 10;
var totalPages  = 1;

window.addEventListener('load', function() {
    loadGroups();
});

// ── Cargar grupos ──
function loadGroups() {
    var loadingState = document.getElementById('loadingState');
    var noResults    = document.getElementById('noResults');
    if (loadingState) loadingState.style.display = 'block';
    if (noResults)    noResults.style.display    = 'none';

    apiClient.getGroups(currentPage, pageSize).then(function(res) {
        var groups = (res.content || res || []).map(function(g) {
            return { Id_grupo: g.idGrupo || g.Id_grupo, Codigo: g.codigo || g.Codigo, Nombre: g.nombre || g.Nombre, Estatus: g.estatus || g.Estatus };
        });
        renderGroups(groups);
        updatePagination(currentPage, res.totalPages || 1);
        if (loadingState) loadingState.style.display = 'none';
    }).catch(function() {
        UIService.showError('Error al cargar grupos');
        if (loadingState) loadingState.style.display = 'none';
    });
}

// ── MODIFICADO: el link "Editar" solo se muestra si el rol puede escribir ──
function renderGroups(groups) {
    var tbody   = document.getElementById('groupsTableBody');
    var counter = document.getElementById('visibleCount');
    if (!tbody) return;

    var rol = authService.getUserRole();
    var puedeEditar = rol === 'ADMIN';

    tbody.innerHTML = '';

    if (!groups || groups.length === 0) {
        var noResults = document.getElementById('noResults');
        if (noResults) noResults.style.display = 'block';
        if (counter) counter.textContent = '0';
        return;
    }

    if (counter) counter.textContent = groups.length;

    groups.forEach(function(g) {
        var estadoClass = g.Estatus === 'Activo' ? 'status-active' : 'status-inactive';
        var tr = document.createElement('tr');
        tr.dataset.search  = (g.Codigo + ' ' + g.Nombre).toLowerCase();
        tr.dataset.estatus = g.Estatus;
        tr.innerHTML =
            '<td>' + g.Id_grupo + '</td>' +
            '<td><span class="code-pill-grupo">' + g.Codigo + '</span></td>' +
            '<td>' + g.Nombre + '</td>' +
            '<td><span class="status-badge ' + estadoClass + '">' + g.Estatus + '</span></td>' +
            '<td>' + (puedeEditar
                ? '<a class="btn-action edit" href="editar-grupo.html?id=' + g.Id_grupo + '"><i class="ti ti-edit"></i>Editar</a>'
                : '<span class="text-muted">Solo lectura</span>') + '</td>';
        tbody.appendChild(tr);
    });
}

// ── Filtro en tiempo real ──
function filterTable() {
    var s = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase().trim() : '';
    var e = document.getElementById('filterEstatus') ? document.getElementById('filterEstatus').value : '';
    var rows    = document.querySelectorAll('#groupsTableBody tr');
    var visible = 0;

    rows.forEach(function(row) {
        var ok = (!s || row.dataset.search.includes(s))
              && (!e || row.dataset.estatus === e);
        row.style.display = ok ? '' : 'none';
        if (ok) visible++;
    });

    var counter   = document.getElementById('visibleCount');
    var noResults = document.getElementById('noResults');
    if (counter)   counter.textContent = visible;
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
    if (currentPage > 0) { currentPage--; loadGroups(); }
}

function nextPage() {
    if (currentPage < totalPages - 1) { currentPage++; loadGroups(); }
}

// ── Modal ──
function closeModal(id) { UIService.closeModal(id); }

function saveGroup() {
    var codigo  = document.getElementById('groupCodigo') ? document.getElementById('groupCodigo').value.trim() : '';
    var nombre  = document.getElementById('groupNombre') ? document.getElementById('groupNombre').value.trim() : '';
    var estatus = document.getElementById('groupEstatus')? document.getElementById('groupEstatus').value       : 'Activo';

    if (!codigo || !nombre) {
        UIService.showError('Por favor completa todos los campos');
        return;
    }

    // TODO: apiClient.createGroup({ Codigo: codigo, Nombre: nombre, Estatus: estatus })
    //     .then(function() {
    //         UIService.showSuccess('Grupo guardado correctamente');
    //         closeModal('groupModal');
    //         loadGroups();
    //     }).catch(function() {
    //         UIService.showError('Error al guardar el grupo');
    //     });

    UIService.showSuccess('Grupo guardado (modo prueba)');
    closeModal('groupModal');
}