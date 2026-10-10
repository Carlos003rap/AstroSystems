package com.astro.sistemas.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_login")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditoriaLogin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_auditoria_login")
    private Long idAuditoriaLogin;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "Id_admin")
    private Usuario admin;

    @Column(name = "Fecha")
    @Builder.Default
    private LocalDateTime fecha = LocalDateTime.now();

    @Column(name = "Resultado", length = 20)
    private String resultado;
}
