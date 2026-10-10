package com.astro.sistemas.controller;

import com.astro.sistemas.model.Grupo;
import com.astro.sistemas.model.AuditoriaEdicion;
import com.astro.sistemas.repository.GrupoRepository;
import com.astro.sistemas.repository.AuditoriaEdicionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/grupos")
public class GrupoController {

    @Autowired private GrupoRepository grupoRepo;
    @Autowired private AuditoriaEdicionRepository auditoriaRepo;

    @PreAuthorize("hasAnyRole('ADMIN','USER','CONSULTOR')")
    @GetMapping
    public ResponseEntity<List<Grupo>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estatus) {

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(
                grupoRepo.findByNombreContainingIgnoreCaseOrCodigoContainingIgnoreCase(search, search));
        }
        if (estatus != null && !estatus.isBlank()) {
            return ResponseEntity.ok(grupoRepo.findByEstatus(estatus));
        }
        return ResponseEntity.ok(grupoRepo.findAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER','CONSULTOR')")
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        return grupoRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Grupo grupo) {
        try {
            Grupo saved = grupoRepo.save(grupo);
            registrarAuditoria("grupo", "Codigo", null, grupo.getCodigo());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Grupo datos) {
        return grupoRepo.findById(id).map(existing -> {
            if (!existing.getCodigo().equals(datos.getCodigo()))
                registrarAuditoria("grupo", "Codigo", existing.getCodigo(), datos.getCodigo());
            if (!existing.getNombre().equals(datos.getNombre()))
                registrarAuditoria("grupo", "Nombre", existing.getNombre(), datos.getNombre());
            if (!existing.getEstatus().equals(datos.getEstatus()))
                registrarAuditoria("grupo", "Estatus", existing.getEstatus(), datos.getEstatus());

            existing.setCodigo(datos.getCodigo());
            existing.setNombre(datos.getNombre());
            existing.setEstatus(datos.getEstatus());
            return ResponseEntity.ok(grupoRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        return grupoRepo.findById(id).map(g -> {
            registrarAuditoria("grupo", "Codigo", g.getCodigo(), "ELIMINADO");
            grupoRepo.delete(g);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private void registrarAuditoria(String tabla, String campo, String anterior, String nuevo) {
        try {
            auditoriaRepo.save(AuditoriaEdicion.builder()
                    .tablaAfectada(tabla)
                    .campoEditado(campo)
                    .valorAnterior(anterior)
                    .valorNuevo(nuevo)
                    .build());
        } catch (Exception ignored) {}
    }
}