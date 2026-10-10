package com.astro.sistemas.repository;

import com.astro.sistemas.model.AccesoGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccesoGrupoRepository extends JpaRepository<AccesoGrupo, Long> {
    List<AccesoGrupo> findByGrupo_IdGrupo(Long idGrupo);
    List<AccesoGrupo> findByPuerta_IdPuerta(Long idPuerta);
    void deleteByGrupo_IdGrupoAndPuerta_IdPuerta(Long idGrupo, Long idPuerta);
    boolean existsByGrupo_IdGrupoAndPuerta_IdPuerta(Long idGrupo, Long idPuerta);
}
