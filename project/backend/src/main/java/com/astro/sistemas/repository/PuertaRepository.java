package com.astro.sistemas.repository;

import com.astro.sistemas.model.Puerta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PuertaRepository extends JpaRepository<Puerta, Long> {
    List<Puerta> findByArea_IdArea(Long idArea);
}
