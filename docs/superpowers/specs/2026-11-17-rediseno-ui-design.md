# Pulido visual, animaciones y versión móvil de AstroSystems

Fecha: 2026-11-17
Estado: borrador para aprobación de Carlos

## Intención y por qué

El cronograma del equipo cierra el 5 de diciembre y el pulido visual es lo último que falta (fase de pulido: íconos locales, tildes, responsive, estados vacíos, confirmaciones). Carlos quiere que el sistema se vea moderno y profesional, con animaciones, y que funcione bien en teléfono. Tiene que quedar bien a la primera, con pocos retoques, y sin romper nada que ya funciona ("0 errores").

## Estado actual (lo que se encontró en el repo)

- Frontend en HTML, CSS y JS puro dentro de `project/frontend/html` (11 páginas, 7 hojas de estilo, 13 scripts). El `Dockerfile` del backend copia esa carpeta tal cual, así que **no hay paso de build**: lo que se edita ahí es lo que se despliega en Render al hacer merge a `main`.
- Casi sin animaciones (un spinner y un slide en el login).
- En teléfono el sidebar pasa a ocupar todo el ancho arriba de la página (`position: relative; width: 100%`), empujando el contenido hacia abajo. Las tablas solo hacen scroll horizontal.
- Íconos de Tabler cargados desde el CDN con `@latest`. Tipografía "Segoe UI", que no existe en teléfonos.
- `confirm()` y `alert()` nativos en cerrar sesión, permisos y exportar. Toasts armados con estilos dentro del JS.
- Estados vacíos y de carga mínimos ("No hay datos").
- Detalles sueltos en `global.css`: color de hover fuera de la paleta, `.btn-small` repetido.
- La carpeta `figma/` tiene los mockups aprobados por el equipo (login con tarjeta sobre la foto de la UTP, verde institucional).

## Objetivos

1. Look moderno y consistente en las 11 páginas, usando un solo sistema de diseño (variables CSS: colores, espacios, radios, sombras, tipografía).
2. Animaciones con propósito: entradas escalonadas, hover y presión de botones, contadores del dashboard, modales y toasts con transición, esqueletos de carga, sacudida del formulario cuando el login falla.
3. Funciona bien de 360 px a pantallas grandes: sidebar tipo menú lateral deslizable en teléfono, tablas que se vuelven tarjetas, formularios y modales cómodos con el pulgar.
4. Cero cambios de comportamiento: no se tocan endpoints, ids ni lógica existentes.

## No-objetivos y anti-objetivos

- No se cambia la identidad (verde institucional, estructura de pantallas, textos de los mockups de Figma), así que las capturas de la documentación siguen siendo válidas.
- No se migra a React, Tailwind ni a ningún framework, y no se agrega paso de build.
- No se cambia el backend.
- Anti-objetivo: que algo se vea más bonito pero rompa un flujo (login, bloqueo, CRUD, roles, exportar CSV) o tarde más en cargar.

## Restricciones

- Todo debe seguir funcionando servido como archivos estáticos por Spring Boot.
- Dependencias externas (íconos, fuente) deben quedar locales en el repo, sin CDN.
- Respetar `prefers-reduced-motion`: sin animaciones para quien las desactiva.
- Accesibilidad básica: foco visible, contraste legible, botones de al menos 44 px en móvil, `aria-label` donde falte.
- Los ids, clases y atributos `onclick` que usa el JS actual se mantienen. Las clases nuevas se agregan, no reemplazan.
- Trabajo en una rama nueva; el merge a `main` (que despliega en Render) lo hace Carlos.

## Paleta (decisión de Carlos, 17 nov)

Verde institucional como único color de acento y **fondos blancos**. Decisiones del constructor sobre eso: página y tarjetas en blanco, separadas con bordes finos y sombras suaves (sin el gris de fondo actual); sidebar en verde; encabezados de tabla en un verde muy claro con texto verde oscuro en lugar de verde sólido; colores de estado (verde, ámbar, rojo) solo para estados, no para decorar; los íconos de las tarjetas del dashboard pasan a tonos de verde.

## Aproximaciones consideradas

1. **Pulir sobre lo existente (elegida).** Se mantiene el verde y el layout; se rehace la capa de diseño con un sistema de variables, componentes compartidos y animaciones. Menor riesgo, conserva las capturas, es lo más rápido de dejar bien.
2. **Rediseño completo.** Más original, pero choca con Figma y con las capturas del Manual de Usuario y del documento de Diseño, y sube el riesgo de errores cerca de la entrega.
3. **Pasar todo a un framework.** Descartada: no hay build, el backend sirve estáticos y el tiempo no alcanza.

## Diseño elegido (decisiones, en orden de construcción)

**Paso 1, base compartida**
- `global.css` pasa a ser el sistema de diseño: variables (paleta verde con escala, grises, estados, radios, sombras, espacios), tipografía, botones, inputs, tablas, badges, tarjetas, utilidades y animaciones comunes.
- Tabler Icons y la fuente Inter se descargan al repo (`html/css/vendor/`) y se enlazan localmente.
- `ui.js`: toasts con clases CSS (ícono, barra de progreso, se cierran con clic), un modal de confirmación propio que reemplaza a `confirm()`/`alert()`, estados vacíos y esqueletos reutilizables, y un ayudante que convierte cualquier tabla en tarjetas en móvil leyendo los encabezados (así no hay que tocar el JS de cada página).
- `navbar.js`: sidebar con menú deslizable y fondo oscuro en pantallas chicas, botón de menú, cierre al elegir una opción o con Esc, indicador de página activa.

**Paso 2, login, recuperar y restablecer contraseña**
Tarjeta con efecto de cristal sobre la foto, entrada suave, brillo al enfocar los campos, sacudida al fallar, mensaje de "el servidor está despertando" cuando tarda más de unos segundos (Render gratis se duerme), tiempo límite con mensaje claro, tildes corregidas ("Iniciando sesión...").

**Paso 3, dashboard y sidebar**
Tarjetas de estadísticas con contador animado, entrada escalonada, hover con elevación, esqueletos mientras llegan los datos, encabezado con saludo y rol.

**Paso 4, administración de usuarios y grupos, editar usuario y grupo**
Barra de filtros que se apila en móvil, tabla con fila resaltada al pasar el mouse, tarjetas en móvil, modales con entrada animada y desenfoque de fondo, confirmación propia para eliminar, estados vacío, cargando y error, paginación táctil.

**Paso 5, auditoría y consultas**
Pestañas con indicador animado, tablas y filtros adaptados, resultados con estados vacíos útiles, exportar con aviso tipo toast.

**Paso 6, revisión final**
Capturas automáticas con Chrome a 360, 768 y 1280 px de cada página (con la API simulada), revisión de consola sin errores, prueba de que los flujos existentes siguen intactos, y pase por teclado y reduced-motion. Luego Pull Request.

## Cómo se entrega

Cada paso se entrega completo (archivos listos para usar) y Carlos lo confirma con capturas antes de pasar al siguiente. Todo se acumula en una sola rama y un solo Pull Request.

## Lo que queda a criterio del constructor

Valores exactos de colores intermedios, duraciones y curvas de las animaciones, tamaños de fuente, qué íconos específicos se usan en estados vacíos, y el detalle de los puntos de corte (se parte de 480, 768 y 1100 px).

## Pendientes que dependen de Carlos

- Confirmar si la rama `fase5-login-y-validaciones` ya está en `main`. El `main` que se clonó termina en el PR #3 (fase 4), así que no la trae. Si no está mergeada, conviene mergearla antes para que esta rama parta de ahí y no haya conflictos en `api.js` y `administracion-usuarios.js`.
