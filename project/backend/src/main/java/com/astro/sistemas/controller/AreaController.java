package com.astro.sistemas.controller;

import com.astro.sistemas.model.Area;
import com.astro.sistemas.repository.AreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/areas")
public class AreaController {

    @Autowired private AreaRepository areaRepo;

    @PreAuthorize("hasAnyRole('ADMIN','CONSULTOR')")
    @GetMapping
    public ResponseEntity<List<Area>> listar() {
        return ResponseEntity.ok(areaRepo.findAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN','CONSULTOR')")
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        return areaRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Area area) {
        try {
            return ResponseEntity.ok(areaRepo.save(area));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Area datos) {
        return areaRepo.findById(id).map(existing -> {
            existing.setNombreArea(datos.getNombreArea());
            return ResponseEntity.ok(areaRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!areaRepo.existsById(id)) return ResponseEntity.notFound().build();
        areaRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}