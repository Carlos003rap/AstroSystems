package com.astro.sistemas.service;

import com.astro.sistemas.model.AuditoriaEdicion;
import com.astro.sistemas.model.PasswordResetToken;
import com.astro.sistemas.model.Usuario;
import com.astro.sistemas.repository.AuditoriaEdicionRepository;
import com.astro.sistemas.repository.PasswordResetTokenRepository;
import com.astro.sistemas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditoriaEdicionRepository auditoriaEdicionRepository;

    private static final long DURACION_TOKEN_MS = 15 * 60 * 1000;
    private static final long COOLDOWN_SOLICITUD_MS = 60 * 1000;
    private static final Pattern PATRON_EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario crearUsuario(Usuario usuario) {
        if (usuario.getUsername() == null || usuario.getUsername().isBlank()) {
            throw new IllegalArgumentException("El nombre de usuario es obligatorio");
        }
        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }
        validarEmail(usuario.getEmail());

        usuario.setUsername(usuario.getUsername().trim());
        usuario.setEmail(usuario.getEmail().trim());

        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new RuntimeException("El usuario ya existe");
        }
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    private void validarEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("El correo es obligatorio");
        }
        if (!PATRON_EMAIL.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("El correo no tiene un formato válido");
        }
    }

    public Optional<Usuario> obtenerPorUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }

    public Optional<Usuario> obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public List<Usuario> buscarUsuarios(String criterio) {
        return usuarioRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(criterio, criterio);
    }

    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));
    }

    public Usuario actualizarUsuario(Usuario usuario) {
        Usuario existente = obtenerPorId(usuario.getId());

        if (usuario.getEmail() != null) {
            validarEmail(usuario.getEmail());
            String nuevoEmail = usuario.getEmail().trim();
            if (!nuevoEmail.equalsIgnoreCase(existente.getEmail())
                    && usuarioRepository.existsByEmail(nuevoEmail)) {
                throw new RuntimeException("El email ya está registrado");
            }
            existente.setEmail(nuevoEmail);
        }

        existente.setNombreCompleto(usuario.getNombreCompleto());
        if (usuario.getEstado() != null) {
            existente.setEstado(usuario.getEstado());
        }
        if (usuario.getRol() != null) {
            existente.setRol(usuario.getRol());
        }
        return usuarioRepository.save(existente);
    }

    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new NoSuchElementException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    public boolean verificarPassword(String password, String passwordEncriptada) {
        return passwordEncoder.matches(password, passwordEncriptada);
    }

    public void solicitarRecuperacion(String email) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            // No revelamos si el correo existe o no, por seguridad
            return;
        }

        Usuario usuario = usuarioOpt.get();

        // Evitar spam: no permitir mas de una solicitud por minuto para el mismo usuario
        Optional<PasswordResetToken> ultimoOpt =
                passwordResetTokenRepository.findFirstByUsuarioOrderByFechaCreacionDesc(usuario);
        if (ultimoOpt.isPresent()) {
            long tiempoDesdeUltimo = System.currentTimeMillis() - ultimoOpt.get().getFechaCreacion();
            if (tiempoDesdeUltimo < COOLDOWN_SOLICITUD_MS) {
                return; // ya se envio un enlace hace poco, no mandar otro
            }
        }

        // Invalidar cualquier token anterior que siga activo, para que solo el ultimo sirva
        List<PasswordResetToken> tokensAnteriores =
                passwordResetTokenRepository.findByUsuarioAndUsadoFalse(usuario);
        for (PasswordResetToken t : tokensAnteriores) {
            t.setUsado(true);
        }
        passwordResetTokenRepository.saveAll(tokensAnteriores);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .usuario(usuario)
                .token(token)
                .fechaExpiracion(System.currentTimeMillis() + DURACION_TOKEN_MS)
                .build();
        passwordResetTokenRepository.save(resetToken);

        emailService.enviarCorreoRecuperacion(usuario.getEmail(), token);
    }

    public void restablecerPassword(String token, String nuevaPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("El enlace no es válido"));

        if (Boolean.TRUE.equals(resetToken.getUsado())) {
            throw new RuntimeException("Este enlace ya fue utilizado");
        }

        if (resetToken.getFechaExpiracion() < System.currentTimeMillis()) {
            throw new RuntimeException("El enlace expiró, solicita uno nuevo");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        // Invalidar este token y cualquier otro que siguiera pendiente del mismo usuario
        List<PasswordResetToken> tokensDelUsuario =
                passwordResetTokenRepository.findByUsuarioAndUsadoFalse(usuario);
        for (PasswordResetToken t : tokensDelUsuario) {
            t.setUsado(true);
        }
        passwordResetTokenRepository.saveAll(tokensDelUsuario);

        try {
            auditoriaEdicionRepository.save(AuditoriaEdicion.builder()
                    .tablaAfectada("usuarios")
                    .campoEditado("password")
                    .valorAnterior("***")
                    .valorNuevo("Contraseña restablecida por recuperación vía correo")
                    .admin(usuario)
                    .build());
        } catch (Exception ignored) {
            // No dejamos que un fallo de auditoria interrumpa el reseteo de contrasena
        }

        emailService.enviarNotificacionCambioPassword(usuario.getEmail());
    }
}