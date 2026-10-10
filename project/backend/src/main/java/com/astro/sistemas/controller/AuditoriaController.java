package com.astro.sistemas.controller;

import com.astro.sistemas.model.AuditoriaLogin;
import com.astro.sistemas.model.AuditoriaEdicion;
import com.astro.sistemas.repository.AuditoriaLoginRepository;
import com.astro.sistemas.repository.AuditoriaEdicionRepository;
import com.astro.sistemas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
public class AuditoriaController {

    @Autowired private AuditoriaLoginRepository loginRepo;
    @Autowired private AuditoriaEdicionRepository edicionRepo;

    @GetMapping("/auditoria-login")
    public ResponseEntity<List<Map<String, Object>>> listarLogin(
            @RequestParam(required = false) String resultado) {

        List<AuditoriaLogin> logs = resultado != null && !resultado.isBlank()
                ? loginRepo.findByResultado(resultado)
                : loginRepo.findAll();

        List<Map<String, Object>> response = new ArrayList<>();
        for (AuditoriaLogin l : logs) {
            Map<String, Object> item = new HashMap<>();
            item.put("idAuditoriaLogin", l.getIdAuditoriaLogin());
            item.put("resultado", l.getResultado());
            item.put("fecha", l.getFecha() != null ? l.getFecha().toString() : null);

            if (l.getAdmin() != null) {
                Map<String, Object> admin = new HashMap<>();
                admin.put("id",       l.getAdmin().getId());
                admin.put("username", l.getAdmin().getUsername());
                item.put("admin", admin);
            } else {
                item.put("admin", null);
            }
            response.add(item);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/auditoria-edicion")
    public ResponseEntity<List<Map<String, Object>>> listarEdicion(
            @RequestParam(required = false) String tabla) {

        List<AuditoriaEdicion> logs = tabla != null && !tabla.isBlank()
                ? edicionRepo.findByTablaAfectada(tabla)
                : edicionRepo.findAll();

        List<Map<String, Object>> response = new ArrayList<>();
        for (AuditoriaEdicion l : logs) {
            Map<String, Object> item = new HashMap<>();
            item.put("idAuditoriaEdicion", l.getIdAuditoriaEdicion());
            item.put("tablaAfectada",  l.getTablaAfectada());
            item.put("campoEditado",   l.getCampoEditado());
            item.put("valorAnterior",  l.getValorAnterior());
            item.put("valorNuevo",     l.getValorNuevo());
            item.put("fecha", l.getFecha() != null ? l.getFecha().toString() : null);

            if (l.getAdmin() != null) {
                Map<String, Object> admin = new HashMap<>();
                admin.put("id",       l.getAdmin().getId());
                admin.put("username", l.getAdmin().getUsername());
                item.put("admin", admin);
            } else {
                item.put("admin", null);
            }
            response.add(item);
        }
        return ResponseEntity.ok(response);
    }
}