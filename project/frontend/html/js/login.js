/* ============================================
   LOGIN LOGIC
   ============================================ */

var CLAVE_USUARIO_RECORDADO = 'usuarioRecordado';

// Interfaz del envío: aviso de servidor lento y tiempo límite
var TIEMPO_AVISO_MS  = 6000;
var TIEMPO_LIMITE_MS = 90000;
var enviando = false;

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

        // Sin doble envío: mientras hay una petición en curso no se manda otra
        if (enviando) return;

        var username = userInput.value.trim();
        var password = passInput.value.trim();

        if (!username || !password) {
            showLoginError('Por favor completa todos los campos');
            sacudirTarjeta();
            return;
        }

        enviando = true;

        // Estado de carga
        ocultarLoginError();
        loginBtn.disabled = true;
        loginBtn.setAttribute('aria-busy', 'true');
        loginBtn.innerHTML = '<i class="ti ti-loader-2 ti-spin" aria-hidden="true"></i> Iniciando sesión...';

        // Render gratis se duerme: si tarda, se avisa; si no responde en 90 s, se corta la espera
        var avisoTimer = setTimeout(mostrarAvisoServidor, TIEMPO_AVISO_MS);
        var limiteTimer;
        var limite = new Promise(function(resolve) {
            limiteTimer = setTimeout(function() { resolve({ vencido: true }); }, TIEMPO_LIMITE_MS);
        });
        var peticion = authService.login(username, password);

        try {
            var result = await Promise.race([peticion, limite]);

            if (result && result.vencido) {
                // Si el servidor responde bien después del límite, el token ya quedó guardado: se entra igual
                peticion.then(function(tarde) {
                    if (tarde && tarde.success) {
                        guardarUsuarioRecordado(username, rememberCk.checked);
                        window.location.replace('dashboard.html');
                    }
                }).catch(function() {});
                showLoginError('El servidor no respondió a tiempo. Revisa tu conexión e inténtalo de nuevo en un momento.');
                sacudirTarjeta();
                resetLoginBtn();
            } else if (result.success) {
                guardarUsuarioRecordado(username, rememberCk.checked);

                loginBtn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> Sesión iniciada';
                loginBtn.classList.add('is-success');

                setTimeout(function() {
                    window.location.replace('dashboard.html');
                }, 600);
            } else {
                showLoginError(result.message || 'Usuario o contraseña incorrectos');
                sacudirTarjeta();
                resetLoginBtn();
            }
        } catch (error) {
            showLoginError('Error al conectar con el servidor');
            sacudirTarjeta();
            resetLoginBtn();
        } finally {
            clearTimeout(avisoTimer);
            clearTimeout(limiteTimer);
            ocultarAvisoServidor();
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
        if (e.key !== 'Enter' || loginBtn.disabled || enviando) return;
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
    enviando = false;
    loginBtn.disabled = false;
    loginBtn.removeAttribute('aria-busy');
    loginBtn.classList.remove('is-success');
    loginBtn.innerHTML = '<i class="ti ti-login" aria-hidden="true"></i> Ingresar';
}

function ocultarLoginError() {
    var errorMsg = document.getElementById('errorMessage');
    if (errorMsg) errorMsg.classList.remove('show');
}

// Sacudida de la tarjeta cuando el inicio de sesión falla (se reinicia si ya estaba)
function sacudirTarjeta() {
    var tarjeta = document.querySelector('.login-container');
    if (!tarjeta) return;
    tarjeta.classList.remove('shake');
    void tarjeta.offsetWidth;
    tarjeta.classList.add('shake');
}

function mostrarAvisoServidor() {
    var aviso = document.getElementById('serverNotice');
    if (aviso) aviso.classList.add('show');
}

function ocultarAvisoServidor() {
    var aviso = document.getElementById('serverNotice');
    if (aviso) aviso.classList.remove('show');
}
