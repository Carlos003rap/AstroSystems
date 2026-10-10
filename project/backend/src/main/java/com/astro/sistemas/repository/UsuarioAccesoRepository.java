package com.astro.sistemas.repository;

import com.astro.sistemas.model.UsuarioAcceso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UsuarioAccesoRepository extends JpaRepository<UsuarioAcceso, Long> {
    Optional<UsuarioAcceso> findByCedula(String cedula);
    List<UsuarioAcceso> findByGrupo_IdGrupo(Long idGrupo);
    List<UsuarioAcceso> findByEstatus(String estatus);
    List<UsuarioAcceso> findByCedulaContainingIgnoreCase(String cedula);
}
