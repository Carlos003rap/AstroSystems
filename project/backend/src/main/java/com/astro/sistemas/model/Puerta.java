package com.astro.sistemas.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "puerta")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Puerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_puerta")
    private Long idPuerta;

    @Column(name = "Nombre_puerta", length = 100)
    private String nombrePuerta;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "Id_area")
    private Area area;
}
