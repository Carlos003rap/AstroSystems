package com.astro.sistemas.security;

import com.astro.sistemas.model.Usuario;
import com.astro.sistemas.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String COOKIE_NAME = "ASTRO_TOKEN";

    private final JwtUtils jwtUtils;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthFilter(JwtUtils jwtUtils, UsuarioRepository usuarioRepository) {
        this.jwtUtils = jwtUtils;
        this.usuarioRepository = usuarioRepository;
    }

    // Los archivos estaticos (estilos, scripts e imagenes) son publicos: no se consulta la base de datos para ellos
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String ruta = request.getRequestURI();
        return ruta.startsWith("/css/") || ruta.startsWith("/js/") || ruta.startsWith("/img/");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = obtenerToken(request);

        if (token != null && jwtUtils.validateJwtToken(token)) {
            String username = jwtUtils.getUsernameFromJwtToken(token);

            // Se consulta al usuario en cada peticion: si fue desactivado o cambio de rol,
            // el token viejo deja de servir de inmediato
            Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
            if (usuarioOpt.isPresent() && Boolean.TRUE.equals(usuarioOpt.get().getEstado())) {

                // Mismo valor por defecto que el login (AuthController): sin rol se trata como USER
                Usuario.Rol rolUsuario = usuarioOpt.get().getRol();
                String rol = (rolUsuario != null ? rolUsuario : Usuario.Rol.USER).name();
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + rol));
                var authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    // La API solo acepta el token en el encabezado Authorization (asi una cookie no puede usarse
    // para ataques CSRF contra /api). Las paginas aceptan tambien la cookie de sesion.
    private String obtenerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        if (request.getRequestURI().startsWith("/api/")) {
            return null;
        }

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if (COOKIE_NAME.equals(c.getName())) {
                    return c.getValue();
                }
            }
        }
        return null;
    }
}
