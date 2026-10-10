package com.astro.sistemas.controller;

import com.astro.sistemas.model.Puerta;
import com.astro.sistemas.repository.PuertaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/puertas")
public class PuertaController {

    @Autowired private PuertaRepository puertaRepo;

    @PreAuthorize("hasAnyRole('ADMIN','CONSULTOR')")
    @GetMapping
    public ResponseEntity<List<Puerta>> listar(
            @RequestParam(required = false) Long idArea) {
        if (idArea != null) {
            return ResponseEntity.ok(puertaRepo.findByArea_IdArea(idArea));
        }
        return ResponseEntity.ok(puertaRepo.findAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN','CONSULTOR')")
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        return puertaRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Puerta puerta) {
        try {
            return ResponseEntity.ok(puertaRepo.save(puerta));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Puerta datos) {
        return puertaRepo.findById(id).map(existing -> {
            existing.setNombrePuerta(datos.getNombrePuerta());
            existing.setArea(datos.getArea());
            return ResponseEntity.ok(puertaRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!puertaRepo.existsById(id)) return ResponseEntity.notFound().build();
        puertaRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}