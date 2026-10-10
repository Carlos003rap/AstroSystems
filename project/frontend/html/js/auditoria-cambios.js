/* ============================================
   AUDITORIA CAMBIOS
   La lógica principal está en auditoria.html
   Este archivo es un stub para compatibilidad
   ============================================ */

// TODO: cuando el backend esté listo:
//
// function loadAuditLogs() {
//     apiClient.getAuditLogs(currentPage, pageSize).then(function(res) {
//         var logs = res.content || res;
//         // Mapear campos: Id_auditoria_edicion, Tabla_afectada,
//         //   Campo_editado, Valor_anterior, Valor_nuevo, Id_admin, Fecha
//         DATA.cambios = logs.map(function(l) {
//             return {
//                 id:             l.Id_auditoria_edicion,
//                 idAdmin:        l.Id_admin,
//                 admin:          l.adminUsuario || l.Id_admin,
//                 tablaAfectada:  l.Tabla_afectada,
//                 campoEditado:   l.Campo_editado,
//                 valorAnterior:  l.Valor_anterior,
//                 valorNuevo:     l.Valor_nuevo,
//                 fecha:          l.Fecha.split('T')[0],
//                 hora:           l.Fecha.split('T')[1] ? l.Fecha.split('T')[1].substring(0,8) : ''
//             };
//         });
//         renderStats();
//         renderTable();
//     });
// }