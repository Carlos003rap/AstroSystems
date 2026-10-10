/* ============================================
   LOGIN LOGIC
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    var loginForm = document.getElementById('loginForm');
    var loginBtn  = document.getElementById('loginBtn');

    // Si ya está autenticado, ir al dashboard
    if (authService.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        var username = document.getElementById('username').value.trim();
        var password = document.getElementById('password').value.trim();

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
                loginBtn.innerHTML = '<i class="ti ti-check"></i> Sesion iniciada';
                loginBtn.style.background = 'linear-gradient(135deg,#27ae60,#1e9b55)';

                setTimeout(function() {
                    window.location.href = 'dashboard.html';
                }, 600);
            } else {
                showLoginError(result.message || 'Usuario o contrasena incorrectos');
                resetLoginBtn();
            }
        } catch (error) {
            showLoginError('Error al conectar con el servidor');
            resetLoginBtn();
        }
    });

    // Toggle mostrar/ocultar contrasena
    var togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            var input = document.getElementById('password');
            var icon  = document.getElementById('toggleIcon');
            var isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            if (icon) icon.className = isPass ? 'ti ti-eye-off' : 'ti ti-eye';
        });
    }

    // Enter en cualquier campo dispara el submit
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !loginBtn.disabled) loginForm.requestSubmit();
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