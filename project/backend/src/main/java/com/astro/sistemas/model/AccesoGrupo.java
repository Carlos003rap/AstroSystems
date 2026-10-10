package com.astro.sistemas.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "acceso_grupo")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AccesoGrupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_acceso_grupo")
    private Long idAccesoGrupo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "Id_grupo")
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "Id_puerta")
    private Puerta puerta;
}
