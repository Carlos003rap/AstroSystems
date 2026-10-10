package com.astro.sistemas.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "area")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_area")
    private Long idArea;

    @Column(name = "Nombre_area", length = 100)
    private String nombreArea;
}
