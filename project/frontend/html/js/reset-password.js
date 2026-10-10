document.addEventListener('DOMContentLoaded', function() {
    var resetForm = document.getElementById('resetForm');
    var submitBtn = document.getElementById('submitBtn');
    var errorMessage = document.getElementById('errorMessage');
    var errorText = document.getElementById('errorText');
    var successMessage = document.getElementById('successMessage');
    var successText = document.getElementById('successText');
    var apiClient = new ApiClient();

    var params = new URLSearchParams(window.location.search);
    var token = params.get('token');

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

    // Sin token en la URL, no hay nada que hacer aqui
    if (!token) {
        showError('Este enlace no es válido. Solicita uno nuevo desde la pantalla de inicio de sesión.');
        resetForm.style.display = 'none';
        return;
    }

    // Mostrar/ocultar contrasena (ambos campos)
    function wireToggle(inputId, buttonId, iconId) {
        var input = document.getElementById(inputId);
        var button = document.getElementById(buttonId);
        var icon = document.getElementById(iconId);
        button.addEventListener('click', function() {
            var isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            icon.className = isPassword ? 'ti ti-eye-off' : 'ti ti-eye';
        });
    }
    wireToggle('newPassword', 'toggleNewPassword', 'toggleNewIcon');
    wireToggle('confirmPassword', 'toggleConfirmPassword', 'toggleConfirmIcon');

    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        errorMessage.classList.remove('show');
        successMessage.classList.remove('show');

        var newPassword = document.getElementById('newPassword').value;
        var confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword.length < 8) {
            showError('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        if (newPassword !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Guardando...';

        try {
            var result = await apiClient.resetPassword(token, newPassword);
            showSuccess((result.message || 'Contraseña actualizada correctamente') + '. Redirigiendo al inicio de sesión...');
            resetForm.style.display = 'none';
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 2500);
        } catch (error) {
            showError(error.message || 'No se pudo restablecer la contraseña');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="ti ti-device-floppy"></i>Guardar nueva contraseña';
        }
    });
});