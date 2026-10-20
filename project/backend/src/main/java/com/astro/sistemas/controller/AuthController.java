package com.astro.sistemas.controller;

import com.astro.sistemas.model.AuditoriaLogin;
import com.astro.sistemas.model.Usuario;
import com.astro.sistemas.repository.AuditoriaLoginRepository;
import com.astro.sistemas.security.JwtAuthFilter;
import com.astro.sistemas.security.JwtUtils;
import com.astro.sistemas.service.UsuarioService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final int MAX_INTENTOS_FALLIDOS = 5;
    private static final int MINUTOS_VENTANA = 15;
    private static final String MENSAJE_CREDENCIALES = "Usuario o contraseña incorrectos";
    private static final String MENSAJE_BLOQUEO =
            "Demasiados intentos fallidos. Espera " + MINUTOS_VENTANA + " minutos e inténtalo de nuevo.";

    @Autowired private UsuarioService usuarioService;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private AuditoriaLoginRepository auditoriaLoginRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    @Value("${app.jwt.expiration}")
    private long expiracionMs;

    private String hashFalso;

    @PostConstruct
    public void init() {
        hashFalso = passwordEncoder.encode("hash-falso-para-igualar-tiempos");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials,
                                   HttpServletRequest request) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return respuestaError(HttpStatus.BAD_REQUEST, MENSAJE_CREDENCIALES);
        }

        try {
            Optional<Usuario> usuarioOpt = usuarioService.obtenerPorUsername(username.trim());

            if (usuarioOpt.isEmpty()) {
                // Se compara contra un hash falso para que tarde lo mismo que un usuario real
                usuarioService.verificarPassword(password, hashFalso);
                return respuestaError(HttpStatus.BAD_REQUEST, MENSAJE_CREDENCIALES);
            }

            Usuario usuario = usuarioOpt.get();

            if (estaBloqueado(usuario)) {
                // Tambien se ejecuta BCrypt aqui para que el bloqueo no se note por el tiempo de respuesta
                usuarioService.verificarPassword(password, hashFalso);
                registrarLogin(usuario, "Bloqueado");
                return respuestaError(HttpStatus.TOO_MANY_REQUESTS, MENSAJE_BLOQUEO);
            }

            if (!usuarioService.verificarPassword(password, usuario.getPassword())) {
                registrarLogin(usuario, "Fallido");
                return respuestaError(HttpStatus.BAD_REQUEST, MENSAJE_CREDENCIALES);
            }

            // Un usuario desactivado no puede entrar; mismo mensaje para no revelar su estado
            if (!Boolean.TRUE.equals(usuario.getEstado())) {
                registrarLogin(usuario, "Fallido");
                return respuestaError(HttpStatus.BAD_REQUEST, MENSAJE_CREDENCIALES);
            }

            String rolNombre = (usuario.getRol() != null ? usuario.getRol() : Usuario.Rol.USER).name();
            String token = jwtUtils.generateJwtToken(usuario.getUsername(), rolNombre);

            // HashMap y no Map.of: Map.of lanza NullPointerException si nombreCompleto es null
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id",             usuario.getId());
            userMap.put("username",       usuario.getUsername());
            userMap.put("email",          usuario.getEmail());
            userMap.put("nombreCompleto", usuario.getNombreCompleto() != null ? usuario.getNombreCompleto() : "");
            userMap.put("role",           rolNombre);
            userMap.put("permissions",    new String[]{ rolNombre });

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userMap);

            registrarLogin(usuario, "Exitoso");

            // Ademas del token en el JSON (lo usa el frontend para la API), se guarda en una cookie
            // HttpOnly para que el servidor pueda validar la sesion antes de entregar las paginas
            ResponseCookie cookie = ResponseCookie.from(JwtAuthFilter.COOKIE_NAME, token)
                    .httpOnly(true)
                    .secure(request.isSecure())
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofMillis(expiracionMs))
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);

        } catch (Exception e) {
            System.out.println("Aviso: error inesperado en el login - " + e.getMessage());
            return respuestaError(HttpStatus.BAD_REQUEST, MENSAJE_CREDENCIALES);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        ResponseCookie borrar = ResponseCookie.from(JwtAuthFilter.COOKIE_NAME, "")
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, borrar.toString())
                .body(Map.of("message", "Sesión cerrada"));
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

    private boolean estaBloqueado(Usuario usuario) {
        LocalDateTime desde = LocalDateTime.now().minusMinutes(MINUTOS_VENTANA);

        // Un login exitoso reinicia el conteo de fallos
        Optional<AuditoriaLogin> ultimoExito =
                auditoriaLoginRepo.findFirstByAdminAndResultadoOrderByFechaDesc(usuario, "Exitoso");
        if (ultimoExito.isPresent() && ultimoExito.get().getFecha() != null
                && ultimoExito.get().getFecha().isAfter(desde)) {
            desde = ultimoExito.get().getFecha();
        }

        long fallos = auditoriaLoginRepo.countByAdminAndResultadoAndFechaAfter(usuario, "Fallido", desde);
        return fallos >= MAX_INTENTOS_FALLIDOS;
    }

    private ResponseEntity<?> respuestaError(HttpStatus status, String mensaje) {
        return ResponseEntity.status(status).body(Map.of("message", mensaje));
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
