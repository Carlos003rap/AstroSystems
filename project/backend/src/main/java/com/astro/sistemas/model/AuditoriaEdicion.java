package com.astro.sistemas.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_edicion")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditoriaEdicion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_auditoria_edicion")
    private Long idAuditoriaEdicion;

    @Column(name = "Tabla_afectada", length = 50)
    private String tablaAfectada;

    @Column(name = "Campo_editado", length = 100)
    private String campoEditado;

    @Column(name = "Valor_anterior", columnDefinition = "TEXT")
    private String valorAnterior;

    @Column(name = "Valor_nuevo", columnDefinition = "TEXT")
    private String valorNuevo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "Id_admin")
    private Usuario admin;

    @Column(name = "Fecha")
    @Builder.Default
    private LocalDateTime fecha = LocalDateTime.now();
}
