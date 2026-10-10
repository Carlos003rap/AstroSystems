package com.astro.sistemas.repository;

import com.astro.sistemas.model.AuditoriaLogin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AuditoriaLoginRepository extends JpaRepository<AuditoriaLogin, Long> {
    List<AuditoriaLogin> findByResultado(String resultado);
    List<AuditoriaLogin> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);
    List<AuditoriaLogin> findByAdmin_Id(Long adminId);
}

