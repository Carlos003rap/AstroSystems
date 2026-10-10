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
    }

    function showSuccess(msg) {
        successText.textContent = msg;
        successMessage.classList.add('show');
        errorMessage.classList.remove('show');
    }

    forgotForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        errorMessage.classList.remove('show');
        successMessage.classList.remove('show');

        var email = document.getElementById('email').value.trim();
        if (!email) {
            showError('Ingresa tu correo electrónico');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Enviando...';

        try {
            var result = await apiClient.forgotPassword(email);
            showSuccess(result.message || 'Si el correo está registrado, recibirás un enlace de recuperación.');
            forgotForm.reset();
        } catch (error) {
            showError('Ocurrió un error, intenta de nuevo en unos momentos');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="ti ti-send"></i>Enviar enlace de recuperación';
        }
    });
});