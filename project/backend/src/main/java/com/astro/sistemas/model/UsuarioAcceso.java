package com.astro.sistemas.model;

import jakarta.persistence.*;
import lombok.*;

// Tabla: usuario (personas con acceso fisico — distinta de la tabla usuarios de administradores)
@Entity
@Table(name = "usuario")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UsuarioAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_usuario")
    private Long idUsuario;

    @Column(name = "Cedula", length = 20, unique = true)
    private String cedula;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "Id_grupo")
    private Grupo grupo;

    @Column(name = "Estatus", length = 20)
    @Builder.Default
    private String estatus = "Activo";
}
