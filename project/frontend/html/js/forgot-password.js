document.addEventListener('DOMContentLoaded', function() {
    var forgotForm = document.getElementById('forgotForm');
    var submitBtn = document.getElementById('submitBtn');
    var errorMessage = document.getElementById('errorMessage');
    var errorText = document.getElementById('errorText');
    var successMessage = document.getElementById('successMessage');
    var successText = document.getElementById('successText');
    var apiClient = new ApiClient();

    function showError(msg) {
        errorText.textContent = msg;
        errorMessage.classList.add('show');
        successMessage.classList.remove('show');
        sacudirTarjeta();
    }

    function showSuccess(msg) {
        successText.textContent = msg;
        successMessage.classList.add('show');
        errorMessage.classList.remove('show');
    }

    forgotForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (submitBtn.disabled) return;
        errorMessage.classList.remove('show');
        successMessage.classList.remove('show');

        var email = document.getElementById('email').value.trim();
        if (!email) {
            showError('Ingresa tu correo electrónico');
            return;
        }

        submitBtn.disabled = true;
        var avisoTimer = setTimeout(mostrarAvisoServidor, 6000);
        submitBtn.innerHTML = '<i class="ti ti-loader-2 ti-spin" aria-hidden="true"></i> Enviando...';

        try {
            var result = await apiClient.forgotPassword(email);
            showSuccess(result.message || 'Si el correo está registrado, recibirás un enlace de recuperación.');
            forgotForm.reset();
        } catch (error) {
            showError('Ocurrió un error, intenta de nuevo en unos momentos');
        } finally {
            ocultarAvisoServidor(avisoTimer);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="ti ti-send" aria-hidden="true"></i>Enviar enlace de recuperación';
        }
    });
});

// ── Ayudas de interfaz (mismas que en el login) ──
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

function ocultarAvisoServidor(timer) {
    clearTimeout(timer);
    var aviso = document.getElementById('serverNotice');
    if (aviso) aviso.classList.remove('show');
}
