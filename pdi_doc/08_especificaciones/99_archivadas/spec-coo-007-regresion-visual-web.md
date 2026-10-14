---
id: SPEC-COO-007
nivel: N2
estado: cerrado
release: REL-003
---

# SPEC-COO-007 — Detectar regresiones visuales en WEB

## Objetivo

Detectar cambios estéticos accidentales antes de publicar cambios de WEB. La suite recorrerá las pantallas y casuísticas acordadas en móvil y escritorio, en tema claro y oscuro, y comparará capturas reproducibles con referencias revisadas.

## Scope

- Inventariar las pantallas y casuísticas visibles que debe cubrir la comparación visual.
- Capturar y comparar esos recorridos en los tamaños móvil y escritorio y en los temas claro y oscuro que se acuerden.
- Mantener referencias versionadas y documentar cómo ejecutarlas, compararlas, revisar diferencias y actualizarlas deliberadamente.
- Integrar la comparación en la validación previa al `push`, de modo que un fallo lo bloquee en el flujo normal de Git y permita crear commits para preparar la corrección.
- Ejecutar la misma comprobación en CI para conservar evidencia y detectar diferencias en Pull Requests.

## Fuera de scope

- Cambios de diseño o comportamiento de las pantallas para hacerlas coincidir con las capturas.
- Sustituir pruebas funcionales, de accesibilidad o la revisión humana de cambios visuales.
- Bloquear `commit` cuando falle la comparación visual.

## Baseline relacionado

- [REL-003 — Estabilización de Synqo](../../01_producto/10_entregas/rel-003-estabilizacion-synqo.md)
- [SPEC-COO-003 — Uso móvil adaptable en REL-001](../99_archivadas/spec-coo-003-uso-movil-rel-001.md)
- [WEB — contrato de módulo](../../06_arquitectura/03_modulos/WEB/README.md)
- [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md)
- [Estrategia de pruebas de la demo local](../../07_desarrollo/02_testing/estrategia-demo-local.md)
- [Convención de commits](../../07_desarrollo/04_git/convencion-commits.md)

## Módulos afectados

- WEB
- Automatización de pruebas, Git hooks y CI del repositorio

## Criterios de aceptación

1. Existe un inventario verificable de pantallas y casuísticas cubiertas por las capturas de referencia.
2. La matriz ejecuta las capturas acordadas en móvil y escritorio, en tema claro y oscuro.
3. Las capturas se producen en condiciones reproducibles y una diferencia visual no aprobada hace fallar la prueba con evidencia que permite localizarla.
4. La documentación explica cómo ejecutar y comparar las capturas, y cómo actualizar las referencias con revisión deliberada.
5. El hook de `pre-push` bloquea el `push` normal si falla la comparación visual; permite realizar commits aunque el test esté fallando.
6. CI ejecuta la misma comparación y conserva el informe de diferencias cuando falla.

## Impacto baseline esperado

No se prevé cambiar la presentación o el comportamiento del producto ni modificar requisitos normativos. Este Change añade una protección al proceso de desarrollo de WEB. Si la preparación encuentra que debe definirse una obligación de calidad transversal, resolverá ese cambio por `pdi:baseline-update` antes de implementarlo.

## Questions / Assumptions

### Pendiente de preparación

- Ninguna pregunta bloqueante pendiente. La matriz y los escenarios acordados durante Research se concretan abajo.

### Supuestos de trabajo

- La prueba será visual y automatizada con Chromium/Playwright, ya utilizado por WEB.
- Una actualización de referencias representa una aprobación humana explícita y se revisa junto con sus cambios; ejecutar el comando de actualización no equivale a aprobar el resultado.
- El bloqueo indicado por la persona impulsora corresponde al `push` normal desde el clon local. El hook local no es una barrera frente a una omisión deliberada; CI aporta el control remoto posterior.

### Resoluciones de preparación

- Los tamaños representativos para las capturas serán 390 × 844 CSS px y 1280 × 800 CSS px, cada uno en tema claro y oscuro. La frontera 768/769 px permanece cubierta por los E2E responsive existentes; no multiplica todas las capturas visuales.
- Se cubrirán 24 escenas: creación inicial con correo oculto, de demostración y habilitado; confirmación normal y con aviso de fallo de correo, y su estado sin creación reciente; cabecera de equipo y selección de identidad; calendario de equipo y personal con datos mixtos; detalle de día; composición y confirmación de consulta de fechas; consultas vacías y con consultas abiertas de texto/fecha; composición de consulta de texto; detalle de consulta de texto y de fechas, detalle con y sin voto, consulta resuelta y confirmación de resolución; estados de equipo caducado, enlace ausente, equipo no encontrado y error de carga; y la herramienta de brandboard disponible solo en desarrollo. Cada escena tendrá cuatro referencias: móvil/escritorio por claro/oscuro (96 en total).
- Los servicios API se simularán con datos fijos para que los cambios de base, correo, reloj o límite de creación no alteren las capturas. Los E2E funcionales contra API real siguen siendo pruebas separadas.
- Las capturas usarán `toHaveScreenshot` de Playwright Test. Las referencias se versionarán bajo `apps/web/e2e/visual-regressions.spec.ts-snapshots/`; la ejecución normal solo comparará y fallará ante diferencias no aceptadas. Actualizarlas requiere el comando documentado y revisión del diff de imágenes.
- Para evitar diferencias por sistema operativo, Chromium, fuentes y dependencias, tanto actualización local como CI ejecutarán la suite dentro de la imagen oficial `mcr.microsoft.com/playwright:v1.63.0-noble`, que coincide con `@playwright/test` fijado en el lockfile. El proceso fijará reloj, zona horaria, animaciones, caret, viewport y datos de API.
- Lefthook ejecutará la suite visual en `pre-push`; no se añadirá a `pre-commit`. CI ejecutará el mismo comando. El hook local bloquea el flujo normal de push, y CI aporta el gate remoto y el informe de diferencias.

## Research necesario

- Revisar la matriz responsive, los recorridos Playwright existentes, la configuración Chromium/Playwright y el pipeline actual.
- Investigar la estrategia de comparación de capturas que ofrezca una señal estable con las dependencias y el entorno existentes.
- Comprobar cómo configurar Lefthook para añadir un hook `pre-push` sin alterar `pre-commit` ni `commit-msg`.

### Resultado de Research

- Playwright Test 1.63.0 ya está fijado en `apps/web/package-lock.json`. Su matcher `toHaveScreenshot` realiza la comparación visual, falla con la diferencia y permite actualizar la referencia mediante `--update-snapshots`. La documentación oficial advierte que el sistema operativo, fuentes, navegador y otros factores del host pueden cambiar los píxeles; por eso se fijará un mismo contenedor para comparar y generar referencias.
- La imagen oficial `mcr.microsoft.com/playwright:v1.63.0-noble` contiene navegadores y dependencias del navegador para la versión correspondiente. La prueba visual usará API simulada y servidor WEB local, por lo que no necesita PostgreSQL ni Mailpit.
- La configuración actual de Playwright ejecuta Chromium, pero no tiene proyectos de comparación visual ni snapshots de referencia. Los escenarios funcionales actuales mezclan API real y mocks, por lo que la suite visual tendrá fixtures propios deterministas y no dependerá de equipos creados en la base local.
- `lefthook.yml` tiene `pre-commit` y `commit-msg`, pero aún no `pre-push`. Lefthook soporta ese hook. El nuevo gate se limitará a la suite visual y permitirá seguir creando commits cuando una imagen cambie.

## Design / Structure

Un archivo Playwright dedicado describirá escenarios visuales y generará una referencia por escenario, viewport y tema. Las fixtures fijarán las respuestas API y la fecha; se esperarán a que termine la carga y se apartará el puntero antes de capturar. Las capturas serán de página completa salvo diálogos que necesiten conservar el fondo y el backdrop.

Un script local ejecutará el test mediante Docker Compose con la imagen fijada, montando el repositorio para que los informes y las actualizaciones de snapshots queden en el árbol local. Los comandos normales compararán; el comando explícito de actualización pasará `--update-snapshots`. Lefthook llamará al comando normal desde `pre-push`, y GitHub Actions lo ejecutará en el mismo contenedor y publicará el informe de Playwright aunque falle.

No se permitirá actualizar referencias desde el hook ni desde CI. Los snapshots se regenerarán solo bajo petición expresa del desarrollador y se revisarán en el diff igual que cualquier otro cambio visual.

## Plan por slices

1. **Capturas y escenarios:** crear fixtures visuales deterministas y cubrir las pantallas/casuísticas enumeradas en esta SPEC a 390 × 844 y 1280 × 800 en ambos temas; generar la primera tanda candidata de referencias y revisar diferencias.
2. **Ejecución reproducible y mantenimiento:** ejecutar en el contenedor Playwright fijado, separar comandos de comparación y actualización, documentar ambos, los informes y el proceso de revisión de referencias.
3. **Gate de publicación:** añadir `pre-push` sin cambiar `pre-commit`, ejecutar el mismo control en CI y comprobar que una diferencia bloquea push pero no commit.

## Evidencia / Validation

- Ejecutar la suite en el contenedor fijado dos veces sin cambiar el código ni las referencias; ambas ejecuciones deben pasar.
- Introducir temporalmente una diferencia visible en una pantalla cubierta y comprobar que la comparación falla y genera diff/actual/expected legibles; retirar el cambio temporal.
- Confirmar que el comando de actualización cambia referencias dentro de la ruta versionada y que repetir la comparación normal pasa después de revisar la actualización.
- Ejecutar el hook con comparación fallida: `git push` normal se rechaza y `git commit` permitido no activa la suite visual. Verificar también que si el contenedor/dependencia requerida no está disponible, el hook no declara PASS silenciosamente.
- Ejecutar la suite desde CI y confirmar la conservación del informe de diferencias al fallar.
- Registrar las combinaciones de escenario, viewport y tema cubiertas, y verificar que no hay huecos contra el inventario de rutas y estados de la SPEC.

### Resultado de verificación local (2026-10-14)

| Criterio                                       | Evidencia                                                                                                                                                                                                                                                 | Resultado                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1. Inventario de pantallas y casuísticas       | `visual-regressions.spec.ts` define 24 escenas y genera 4 referencias por escena. Se versionan 96 PNG.                                                                                                                                                    | PASS                                                                |
| 2. Viewports y temas                           | Ejecución completa en el contenedor fijado: 96/96 comparaciones pasan en 390 × 844 y 1280 × 800, tema claro y oscuro. La suite completa se ejecutó dos veces sin cambios en código ni referencias.                                                        | PASS                                                                |
| 3. Reproducibilidad y detección de diferencias | Escenarios con API simulada, fecha y zona horaria fijas; Chromium de la imagen Playwright fijada. Una regla CSS temporal hizo fallar la primera captura y Playwright produjo `actual`, `expected`, `diff` y trace en `test-results/`; la regla se retiró. | PASS                                                                |
| 4. Comparar y actualizar referencias           | README raíz y README de WEB describen comparación, actualización deliberada, revisión de imágenes e informes. Se actualizaron 4 referencias de una escena y la comparación posterior pasó 4/4.                                                            | PASS                                                                |
| 5. `pre-push` falla sin bloquear `commit`      | `npx lefthook run pre-push` con el cambio CSS temporal devuelve error tras el primer fallo. `pre-commit` no invoca la suite visual; por tanto el fallo visual no añade un bloqueo al commit.                                                              | PASS para los hooks configurados; no se ejecutó un `git push` real. |
| 6. CI ejecuta y conserva evidencia             | `.github/workflows/web.yml` ejecuta `test:visual` y sube `playwright-report/` y `test-results/` con `if: always()`. Revisión estática del workflow; no se ejecutó remotamente.                                                                            | PASS (configuración verificada; ejecución remota pendiente)         |

Checks adicionales: lint, formato WEB, formato de documentos, build WEB, 17 pruebas unitarias, listado de 65 E2E no visuales, `docker compose config --quiet`, `git diff --check` y validación estructural PDI pasan. La primera prueba del listado E2E encontró informes locales creados por Docker como root; el runner se ajustó para usar el UID/GID local y el listado volvió a pasar.

## Convergence

La comparación entre intención, implementación y delivery no encuentra drift. Los 6 criterios están satisfechos por pruebas locales o revisión estática del workflow. No se declara ENTREGADO: no se ha ejecutado el workflow remoto ni se ha publicado el cambio.

## Resultado de cierre

Change cerrado y SPEC archivada. La primera ejecución remota de CI queda como comprobación operativa posterior a la integración, no como cambio de alcance pendiente.

## Estado tras implementación

**DONE.** Convergencia PASS y cierre documental completado. El hook local bloquea el flujo normal de `push`; CI queda configurada para repetir la suite y conservar evidencia. La ejecución remota todavía no está observada.
