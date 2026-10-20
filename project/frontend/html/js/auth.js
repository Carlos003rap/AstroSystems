/* ============================================
   AUTH SERVICE - Gestión de autenticación
   ============================================ */

class AuthService {
    constructor() {
        this.tokenKey = 'authToken';
        this.userKey  = 'currentUser';
    }

    setAuth(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    getCurrentUser() {
        var user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    async login(username, password) {
        try {
            var response = await apiClient.login(username, password);

            if (response.token && response.user) {
                this.setAuth(response.token, response.user);
                return { success: true, user: response.user };
            } else {
                return { success: false, message: 'Respuesta invalida del servidor' };
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'No fue posible conectar con el servidor'
            };
        }
    }

    // ── CRÍTICO: corregido — sin slash inicial ──
    checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.replace('login.html');
            return false;
        }
        return true;
    }

    hasPermission(permission) {
        var user = this.getCurrentUser();
        return user && user.permissions && user.permissions.includes(permission);
    }

    getUserRole() {
        var user = this.getCurrentUser();
        return user ? user.role : null;
    }

    isAdmin() {
        return this.getUserRole() === 'ADMIN';
    }
}

const authService = new AuthService();