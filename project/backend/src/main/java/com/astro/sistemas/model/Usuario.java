package com.astro.sistemas.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "nombre_completo")
    private String nombreCompleto;

    @Column(name = "estado")
    @Builder.Default
    private Boolean estado = true;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    @Builder.Default
    private Long fechaCreacion = System.currentTimeMillis();

    @Enumerated(EnumType.STRING)
    @Column(name = "rol")
    @Builder.Default
    private Rol rol = Rol.USER;

    public enum Rol {
        ADMIN, USER, AUDITOR, CONSULTOR
    }
}
