package com.astro.sistemas.repository;

import com.astro.sistemas.model.AuditoriaEdicion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AuditoriaEdicionRepository extends JpaRepository<AuditoriaEdicion, Long> {
    List<AuditoriaEdicion> findByTablaAfectada(String tabla);
    List<AuditoriaEdicion> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);
    List<AuditoriaEdicion> findByAdmin_Id(Long adminId);
}
