/* ============================================
   LOGIN LOGIC
   ============================================ */

var CLAVE_USUARIO_RECORDADO = 'usuarioRecordado';

function leerUsuarioRecordado() {
    try {
        return localStorage.getItem(CLAVE_USUARIO_RECORDADO) || '';
    } catch (e) {
        return '';
    }
}

function guardarUsuarioRecordado(username, recordar) {
    try {
        if (recordar) {
            localStorage.setItem(CLAVE_USUARIO_RECORDADO, username);
        } else {
            localStorage.removeItem(CLAVE_USUARIO_RECORDADO);
        }
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', function() {
    var loginForm  = document.getElementById('loginForm');
    var loginBtn   = document.getElementById('loginBtn');
    var clearBtn   = document.getElementById('clearBtn');
    var rememberCk = document.getElementById('rememberUser');
    var userInput  = document.getElementById('username');
    var passInput  = document.getElementById('password');

    // Si el servidor mando al login porque no hay sesion valida, se limpia lo guardado en el
    // navegador (evita un bucle login -> dashboard -> login) y se avisa al usuario
    var sesionExpirada = new URLSearchParams(window.location.search).get('sesion') === 'expirada';
    if (sesionExpirada) {
        authService.logout();
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
        }
        showLoginError('Tu sesión no está activa o expiró. Inicia sesión de nuevo.');
    }

    // Si ya está autenticado, ir al dashboard
    if (authService.isAuthenticated()) {
        window.location.replace('dashboard.html');
        return;
    }

    // Rellenar el usuario recordado (nunca se guarda la contraseña)
    var recordado = leerUsuarioRecordado();
    if (recordado) {
        userInput.value = recordado;
        rememberCk.checked = true;
        passInput.focus();
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        var username = userInput.value.trim();
        var password = passInput.value.trim();

        if (!username || !password) {
            showLoginError('Por favor completa todos los campos');
            return;
        }

        // Estado de carga
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Iniciando sesion...';

        try {
            var result = await authService.login(username, password);

            if (result.success) {
                guardarUsuarioRecordado(username, rememberCk.checked);

                loginBtn.innerHTML = '<i class="ti ti-check"></i> Sesion iniciada';
                loginBtn.style.background = 'linear-gradient(135deg,#27ae60,#1e9b55)';

                setTimeout(function() {
                    window.location.replace('dashboard.html');
                }, 600);
            } else {
                showLoginError(result.message || 'Usuario o contraseña incorrectos');
                resetLoginBtn();
            }
        } catch (error) {
            showLoginError('Error al conectar con el servidor');
            resetLoginBtn();
        }
    });

    // Botón limpiar: vacía los campos y quita el mensaje de error
    clearBtn.addEventListener('click', function() {
        loginForm.reset();
        userInput.value = '';
        passInput.value = '';
        rememberCk.checked = false;
        passInput.type = 'password';

        var icon = document.getElementById('toggleIcon');
        if (icon) icon.className = 'ti ti-eye';

        var errorMsg = document.getElementById('errorMessage');
        if (errorMsg) errorMsg.classList.remove('show');

        userInput.focus();
    });

    // Toggle mostrar/ocultar contrasena
    var togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            var icon  = document.getElementById('toggleIcon');
            var isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';
            if (icon) icon.className = isPass ? 'ti ti-eye-off' : 'ti ti-eye';
        });
    }

    // Enter en los campos de texto dispara el submit
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter' || loginBtn.disabled) return;
        var id = e.target && e.target.id;
        if (id === 'username' || id === 'password') {
            loginForm.requestSubmit();
        }
    });
});

function showLoginError(message) {
    var errorMsg = document.getElementById('errorMessage');
    var errorText = document.getElementById('errorText');
    if (errorText) errorText.textContent = message;
    else if (errorMsg) errorMsg.textContent = message;
    if (errorMsg) errorMsg.classList.add('show');
    setTimeout(function() {
        if (errorMsg) errorMsg.classList.remove('show');
    }, 5000);
}

function resetLoginBtn() {
    var loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="ti ti-login"></i> Ingresar';
    loginBtn.style.background = '';
}
