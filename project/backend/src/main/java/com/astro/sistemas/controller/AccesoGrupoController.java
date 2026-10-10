package com.astro.sistemas.controller;

import com.astro.sistemas.model.AccesoGrupo;
import com.astro.sistemas.model.AuditoriaEdicion;
import com.astro.sistemas.model.Grupo;
import com.astro.sistemas.model.Puerta;
import com.astro.sistemas.model.Usuario;
import com.astro.sistemas.repository.AccesoGrupoRepository;
import com.astro.sistemas.repository.AuditoriaEdicionRepository;
import com.astro.sistemas.repository.GrupoRepository;
import com.astro.sistemas.repository.PuertaRepository;
import com.astro.sistemas.repository.UsuarioRepository;
import com.astro.sistemas.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/acceso-grupo")
public class AccesoGrupoController {

    @Autowired private AccesoGrupoRepository accesoRepo;
    @Autowired private GrupoRepository grupoRepo;
    @Autowired private PuertaRepository puertaRepo;
    @Autowired private AuditoriaEdicionRepository auditoriaRepo;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private JwtUtils jwtUtils;

    @PreAuthorize("hasAnyRole('ADMIN','CONSULTOR')")
    @GetMapping
    public ResponseEntity<List<AccesoGrupo>> listar(
            @RequestParam(required = false) Long id_grupo,
            @RequestParam(required = false) Long id_puerta) {
        if (id_grupo != null)  return ResponseEntity.ok(accesoRepo.findByGrupo_IdGrupo(id_grupo));
        if (id_puerta != null) return ResponseEntity.ok(accesoRepo.findByPuerta_IdPuerta(id_puerta));
        return ResponseEntity.ok(accesoRepo.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> agregar(@RequestBody Map<String, Long> body, HttpServletRequest req) {
        try {
            Long idGrupo  = body.get("Id_grupo");
            Long idPuerta = body.get("Id_puerta");

            if (idGrupo == null || idPuerta == null)
                return ResponseEntity.badRequest().body("Se requiere Id_grupo e Id_puerta");

            if (accesoRepo.existsByGrupo_IdGrupoAndPuerta_IdPuerta(idGrupo, idPuerta))
                return ResponseEntity.badRequest().body("Ya existe ese acceso");

            Grupo  grupo  = grupoRepo.findById(idGrupo).orElseThrow();
            Puerta puerta = puertaRepo.findById(idPuerta).orElseThrow();

            AccesoGrupo acceso = AccesoGrupo.builder()
                    .grupo(grupo).puerta(puerta).build();
            AccesoGrupo saved = accesoRepo.save(acceso);

            registrarAuditoria(req, "acceso_grupo", "Id_puerta",
                    null, "Grupo " + idGrupo + " → Puerta " + idPuerta + " AGREGADA");

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping
    @Transactional
    public ResponseEntity<?> eliminar(
            @RequestParam Long id_grupo,
            @RequestParam Long id_puerta,
            HttpServletRequest req) {
        try {
            accesoRepo.deleteByGrupo_IdGrupoAndPuerta_IdPuerta(id_grupo, id_puerta);

            registrarAuditoria(req, "acceso_grupo", "Id_puerta",
                    "Grupo " + id_grupo + " → Puerta " + id_puerta + " ELIMINADA", null);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private void registrarAuditoria(HttpServletRequest req, String tabla,
                                    String campo, String anterior, String nuevo) {
        try {
            String header = req.getHeader("Authorization");
            Usuario admin = null;
            if (header != null && header.startsWith("Bearer ")) {
                String token    = header.substring(7);
                String username = jwtUtils.getUsernameFromJwtToken(token);
                admin = usuarioRepo.findByUsername(username).orElse(null);
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