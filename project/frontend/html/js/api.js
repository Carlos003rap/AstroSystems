/* ============================================
   API SERVICE - Llamadas a endpoints
   Las paginas ahora las sirve el propio backend, asi que la API queda en /api
   (en la laptop: http://localhost:8080 ; en la nube: https://astro-backend-os4g.onrender.com)
   ============================================ */

const API_BASE_URL = (function () {
    var host  = window.location.hostname;
    var port  = window.location.port;
    var local = host === 'localhost' || host === '127.0.0.1';

    // Live Server o Vite en la laptop: el backend esta en otro puerto
    if (local && port !== '8080') return 'http://localhost:8080/api';

    // Sitio estatico anterior en Render: el backend esta en otra direccion
    if (host === 'astro-frontend-de7m.onrender.com') return 'https://astro-backend-os4g.onrender.com/api';

    // Paginas servidas por el propio backend (localhost:8080 o Render): misma direccion
    return '/api';
})();

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // ── Método genérico con JWT ──
    async request(endpoint, options) {
        options = options || {};
        var url = this.baseURL + endpoint;
        var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});

        var token = localStorage.getItem('authToken');
        if (token) headers['Authorization'] = 'Bearer ' + token;

        try {
            var response = await fetch(url, Object.assign({ credentials: 'include' }, options, { headers: headers }));

            if (!response.ok) {
                var esAuth = endpoint.indexOf('/auth/') === 0;
                if (response.status === 401 && !esAuth) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                }
                if (response.status === 403) {
                    throw new Error('No tienes permiso para realizar esta acción con tu rol actual.');
                }
                var mensajeServidor = '';
                try {
                    var cuerpo = await response.text();
                    if (cuerpo) {
                        try {
                            var datos = JSON.parse(cuerpo);
                            mensajeServidor = datos.message || '';
                        } catch (e) {
                            mensajeServidor = cuerpo.length < 200 ? cuerpo : '';
                        }
                    }
                } catch (e) {}
                throw new Error(mensajeServidor || ('Error ' + response.status + ': ' + response.statusText));
            }
            // Respuesta vacía (ej. DELETE 204)
            var text = await response.text();
            return text ? JSON.parse(text) : {};

        } catch (error) {
            console.error('API Error [' + endpoint + ']:', error.message);
            throw error;
        }
    }

    // ── AUTH ──
    // Respuesta: { token: "...", user: { id, username, email, nombreCompleto, role, permissions } }
    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: username, password: password })
        });
    }

    async logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        return Promise.resolve();
    }

    // ── RECUPERACION DE CONTRASENA ──
    async forgotPassword(email) {
        var response = await fetch(this.baseURL + '/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        return response.json();
    }

    async resetPassword(token, newPassword) {
        var response = await fetch(this.baseURL + '/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token, newPassword: newPassword })
        });
        var data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'No se pudo restablecer la contraseña');
        }
        return data;
    }

    // ── USUARIOS ACCESO (tabla: usuario — cedula/grupo/estatus) ──
    async getUsers(page, size) {
        page = page || 0; size = size || 10;
        return this.request('/admin/usuarios?page=' + page + '&size=' + size);
    }

    async getUserById(id) {
        return this.request('/admin/usuarios/' + id);
    }

    async createUser(data) {
        // data: { Cedula, grupo: { idGrupo }, Estatus }
        return this.request('/admin/usuarios', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateUser(id, data) {
        // data: { Cedula, grupo: { idGrupo }, Estatus }
        return this.request('/admin/usuarios/' + id, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteUser(id) {
        return this.request('/admin/usuarios/' + id, { method: 'DELETE' });
    }

    // ── ADMINS (tabla: usuarios — login del panel) ──
    async getAdmins() {
        return this.request('/users');
    }

    // ── GRUPOS (tabla: grupo) ──
    async getGroups(page, size) {
        page = page || 0; size = size || 100;
        return this.request('/admin/grupos?page=' + page + '&size=' + size);
    }

    async getGroupById(id) {
        return this.request('/admin/grupos/' + id);
    }

    async createGroup(data) {
        // data: { Codigo, Nombre, Estatus }
        return this.request('/admin/grupos', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateGroup(id, data) {
        return this.request('/admin/grupos/' + id, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteGroup(id) {
        return this.request('/admin/grupos/' + id, { method: 'DELETE' });
    }

    // ── PUERTAS (tabla: puerta) ──
    async getPuertas() {
        return this.request('/admin/puertas');
    }

    async getPuertaById(id) {
        return this.request('/admin/puertas/' + id);
    }

    // ── AREAS (tabla: area) ──
    async getAreas() {
        return this.request('/admin/areas');
    }

    // ── ACCESO POR GRUPO (tabla: acceso_grupo) ──
    async getAccesosByGrupo(idGrupo) {
        return this.request('/admin/acceso-grupo?id_grupo=' + idGrupo);
    }

    async addAcceso(idGrupo, idPuerta) {
        // Agrega acceso de una puerta a un grupo
        return this.request('/admin/acceso-grupo', {
            method: 'POST',
            body: JSON.stringify({ Id_grupo: idGrupo, Id_puerta: idPuerta })
        });
    }

    async removeAcceso(idGrupo, idPuerta) {
        // Quita acceso de una puerta a un grupo
        return this.request('/admin/acceso-grupo?id_grupo=' + idGrupo + '&id_puerta=' + idPuerta, {
            method: 'DELETE'
        });
    }

    // ── AUDITORIA LOGIN (tabla: auditoria_login) ──
    async getLoginLogs(page, size, filters) {
        page = page || 0; size = size || 20;
        filters = filters || {};
        var params = new URLSearchParams(Object.assign({ page: page, size: size }, filters));
        return this.request('/admin/auditoria-login?' + params.toString());
    }

    // ── AUDITORIA EDICION (tabla: auditoria_edicion) ──
    async getAuditLogs(page, size, filters) {
        page = page || 0; size = size || 20;
        filters = filters || {};
        var params = new URLSearchParams(Object.assign({ page: page, size: size }, filters));
        return this.request('/admin/auditoria-edicion?' + params.toString());
    }

    // ── HEALTH CHECK ──
    async healthCheck() {
        try {
            return await this.request('/health');
        } catch (e) {
            return null;
        }
    }
}

// Instancia global
const apiClient = new ApiClient();