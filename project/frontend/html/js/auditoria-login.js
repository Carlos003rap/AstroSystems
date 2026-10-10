/* ============================================
   AUDITORIA
   La lógica principal está en auditoria.html
   Este archivo es un stub para compatibilidad
   ============================================ */

// TODO: cuando el backend esté listo, reemplazar los datos
// de prueba en auditoria.html por estas llamadas:
//
// function loadLoginLogs() {
//     apiClient.getLoginLogs(currentPage, pageSize).then(function(res) {
//         var logs = res.content || res;
//         // Mapear campos: Id_auditoria_login, Id_admin, Fecha, Resultado
//         DATA.login = logs.map(function(l) {
//             return {
//                 id:        l.Id_auditoria_login,
//                 idAdmin:   l.Id_admin,
//                 admin:     l.adminUsuario || l.Id_admin,
//                 fecha:     l.Fecha.split('T')[0],
//                 hora:      l.Fecha.split('T')[1] ? l.Fecha.split('T')[1].substring(0,8) : '',
//                 resultado: l.Resultado
//             };
//         });
//         renderStats();
//         renderTable();
//     });
// }