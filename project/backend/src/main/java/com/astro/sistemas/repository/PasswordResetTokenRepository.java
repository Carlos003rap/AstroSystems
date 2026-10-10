package com.astro.sistemas.repository;

import com.astro.sistemas.model.PasswordResetToken;
import com.astro.sistemas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    List<PasswordResetToken> findByUsuarioAndUsadoFalse(Usuario usuario);
    Optional<PasswordResetToken> findFirstByUsuarioOrderByFechaCreacionDesc(Usuario usuario);
}