package com.astro.sistemas.config;

import com.astro.sistemas.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .collect(Collectors.toList());

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // JwtAuthFilter es @Component, asi que Spring Boot tambien lo registraria como filtro global
    // del servidor; se desactiva ese registro para que solo corra dentro de Spring Security
    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilterRegistration(JwtAuthFilter filter) {
        FilterRegistrationBean<JwtAuthFilter> registro = new FilterRegistrationBean<>(filter);
        registro.setEnabled(false);
        return registro;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**", "/api/health", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Paginas y archivos publicos
                        .requestMatchers("/", "/index.html", "/login.html", "/forgot-password.html",
                                "/reset-password.html", "/css/**", "/js/**", "/img/**",
                                "/favicon.ico", "/error").permitAll()
                        // Paginas internas segun el rol (mismas reglas que ya usa el frontend)
                        .requestMatchers("/administracion-usuarios.html", "/administracion-grupos.html",
                                "/consultas.html").hasAnyRole("ADMIN", "USER", "CONSULTOR")
                        .requestMatchers("/editar-usuario.html", "/editar-grupo.html").hasRole("ADMIN")
                        .requestMatchers("/auditoria.html").hasAnyRole("ADMIN", "AUDITOR")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        // Sin sesion (o token vencido): la API responde 401; las paginas mandan al login
                        .authenticationEntryPoint((request, response, e) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                            } else {
                                response.sendRedirect("/login.html?sesion=expirada");
                            }
                        })
                        // Con sesion pero sin el rol: la API responde 403; las paginas mandan al panel
                        .accessDeniedHandler((request, response, e) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
                            } else {
                                response.sendRedirect("/dashboard.html");
                            }
                        })
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}