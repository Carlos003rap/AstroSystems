package com.astro.sistemas.controller;

import com.astro.sistemas.model.UsuarioAcceso;
import com.astro.sistemas.model.AuditoriaEdicion;
import com.astro.sistemas.model.Usuario;
import com.astro.sistemas.repository.UsuarioAccesoRepository;
import com.astro.sistemas.repository.UsuarioRepository;
import com.astro.sistemas.repository.AuditoriaEdicionRepository;
import com.astro.sistemas.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/admin/usuarios")
public class UsuarioAccesoController {

    @Autowired private UsuarioAccesoRepository usuarioRepo;
    @Autowired private AuditoriaEdicionRepository auditoriaRepo;
    @Autowired private UsuarioRepository usuarioAdminRepo;
    @Autowired private JwtUtils jwtUtils;

    @PreAuthorize("hasAnyRole('ADMIN','USER','CONSULTOR')")
    @GetMapping
    public ResponseEntity<List<UsuarioAcceso>> listar(
            @RequestParam(required = false) String cedula,
            @RequestParam(required = false) String estatus) {
        if (cedula != null && !cedula.isBlank())
            return ResponseEntity.ok(usuarioRepo.findByCedulaContainingIgnoreCase(cedula));
        if (estatus != null && !estatus.isBlank())
            return ResponseEntity.ok(usuarioRepo.findByEstatus(estatus));
        return ResponseEntity.ok(usuarioRepo.findAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER','CONSULTOR')")
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        return usuarioRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody UsuarioAcceso usuario, HttpServletRequest req) {
        try {
            if (usuarioRepo.findByCedula(usuario.getCedula()).isPresent())
                return ResponseEntity.badRequest().body("Ya existe un usuario con esa cedula");
            UsuarioAcceso saved = usuarioRepo.save(usuario);
            registrarAuditoria(req, "usuario", "Cedula", null, usuario.getCedula());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id,
                                        @RequestBody UsuarioAcceso datos,
                                        HttpServletRequest req) {
        return usuarioRepo.findById(id).map(existing -> {
            if (!existing.getCedula().equals(datos.getCedula()))
                registrarAuditoria(req, "usuario", "Cedula", existing.getCedula(), datos.getCedula());
            if (!existing.getEstatus().equals(datos.getEstatus()))
                registrarAuditoria(req, "usuario", "Estatus", existing.getEstatus(), datos.getEstatus());
            if (datos.getGrupo() != null && !existing.getGrupo().getIdGrupo().equals(datos.getGrupo().getIdGrupo()))
                registrarAuditoria(req, "usuario", "Id_grupo",
                        String.valueOf(existing.getGrupo().getIdGrupo()),
                        String.valueOf(datos.getGrupo().getIdGrupo()));
            existing.setCedula(datos.getCedula());
            existing.setEstatus(datos.getEstatus());
            if (datos.getGrupo() != null) existing.setGrupo(datos.getGrupo());
            return ResponseEntity.ok(usuarioRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id, HttpServletRequest req) {
        return usuarioRepo.findById(id).map(u -> {
            registrarAuditoria(req, "usuario", "Cedula", u.getCedula(), "ELIMINADO");
            usuarioRepo.delete(u);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private void registrarAuditoria(HttpServletRequest req, String tabla,
                                    String campo, String anterior, String nuevo) {
        try {
            String header = req.getHeader("Authorization");
            Usuario admin = null;
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                String username = jwtUtils.getUsernameFromJwtToken(token);
                admin = usuarioAdminRepo.findByUsername(username).orElse(null);
            }
            auditoriaRepo.save(AuditoriaEdicion.builder()
                    .tablaAfectada(tabla)
                    .campoEditado(campo)
                    .valorAnterior(anterior)
                    .valorNuevo(nuevo)
                    .admin(admin)
                    .build());
        } catch (Exception ignored) {}
    }
}