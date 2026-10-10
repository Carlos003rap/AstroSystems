package com.astro.sistemas.controller;

import com.astro.sistemas.model.AuditoriaLogin;
import com.astro.sistemas.model.Usuario;
import com.astro.sistemas.repository.AuditoriaLoginRepository;
import com.astro.sistemas.security.JwtUtils;
import com.astro.sistemas.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UsuarioService usuarioService;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private AuditoriaLoginRepository auditoriaLoginRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        try {
            var usuario = usuarioService.obtenerPorUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (!usuarioService.verificarPassword(password, usuario.getPassword())) {
                registrarLogin(usuario, "Fallido");
                return ResponseEntity.badRequest().body("Contrasena incorrecta");
            }

            String token = jwtUtils.generateJwtToken(usuario.getUsername(), usuario.getRol().name());

            registrarLogin(usuario, "Exitoso");

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "id",             usuario.getId(),
                "username",       usuario.getUsername(),
                "email",          usuario.getEmail(),
                "nombreCompleto", usuario.getNombreCompleto(),
                "role",           usuario.getRol().name(),
                "permissions",    new String[]{ usuario.getRol().name() }
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        try {
            return ResponseEntity.ok(usuarioService.crearUsuario(usuario));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        try {
            usuarioService.solicitarRecuperacion(email);
        } catch (Exception e) {
            // No revelamos el detalle al cliente (por seguridad), pero lo dejamos en el log del servidor
            System.out.println("Aviso: no se pudo procesar la recuperacion de contrasena - " + e.getMessage());
        }
        // Mensaje generico siempre, exista o no el correo
        return ResponseEntity.ok(Map.of(
            "message", "Si el correo está registrado, recibirás un enlace de recuperación."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        try {
            usuarioService.restablecerPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private void registrarLogin(Usuario admin, String resultado) {
        try {
            auditoriaLoginRepo.save(AuditoriaLogin.builder()
                    .admin(admin)
                    .resultado(resultado)
                    .build());
        } catch (Exception ignored) {}
    }
}