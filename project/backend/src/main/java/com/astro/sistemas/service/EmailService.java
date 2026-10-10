package com.astro.sistemas.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void enviarCorreoRecuperacion(String destinatario, String token) {
        String enlace = frontendUrl + "/reset-password.html?token=" + token;

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destinatario);
        mensaje.setSubject("Recuperación de contraseña - Astro Sistemas");
        mensaje.setText(
            "Solicitaste restablecer tu contraseña en Astro Sistemas.\n\n" +
            "Haz clic en el siguiente enlace para crear una nueva contraseña (válido por 15 minutos):\n" +
            enlace + "\n\n" +
            "Si no solicitaste esto, puedes ignorar este correo con tranquilidad."
        );
        mailSender.send(mensaje);
    }

    public void enviarNotificacionCambioPassword(String destinatario) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destinatario);
        mensaje.setSubject("Tu contraseña fue cambiada - Astro Sistemas");
        mensaje.setText(
            "Tu contraseña en Astro Sistemas fue cambiada exitosamente.\n\n" +
            "Si tú realizaste este cambio, puedes ignorar este mensaje.\n\n" +
            "Si NO reconoces esta acción, tu cuenta pudo haber sido comprometida. " +
            "Contacta de inmediato al administrador del sistema."
        );
        mailSender.send(mensaje);
    }
}