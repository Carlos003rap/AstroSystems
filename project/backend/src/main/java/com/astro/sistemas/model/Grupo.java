package com.astro.sistemas.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grupo")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_grupo")
    private Long idGrupo;

    @Column(name = "Codigo", length = 20)
    private String codigo;

    @Column(name = "Nombre", length = 100)
    private String nombre;

    @Column(name = "Estatus", length = 20)
    @Builder.Default
    private String estatus = "Activo";
}
