package com.astro.sistemas;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Seeding deshabilitado. La aplicación ahora depende de los datos existentes en la base de datos conectada.
    }
}
