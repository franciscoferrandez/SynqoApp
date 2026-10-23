---
id: MOCKUP-CON-001
estado: en_revision
---

# MOCKUP-CON-001 — Calendario en consultas de fechas

## Propósito y estado

Propuesta interactiva de creación y edición de fechas desde Consultas. La persona impulsora aprueba la propuesta visual condicionada a retirar el tick de selección y reservar la esquina superior derecha para la campana de eventos. Ese ajuste se ha incorporado al ejemplo; la aprobación visual no equivale a implementación del producto. Las decisiones funcionales proceden de las rondas interactivas recogidas en [SPEC-CON-005 — Calendario en consultas de fechas](../../08_especificaciones/99_archivadas/spec-con-005-calendario-en-consultas-fechas.md).

## Vista

[Abrir el ejemplo interactivo](prototipo-consultas-fechas.html). HTML autónomo con datos ilustrativos, sin API ni cambios de datos del equipo. También accesible desde el [índice de mockups](index.html).

## Recorridos para revisar

- Crear consulta: elegir Fechas antes del formulario, escribir título, seleccionar días y cambiar de mes. Las fechas se mantienen marcadas sin lista apilada ni contador. Guardar directamente; probar también cancelar con cambios.
- Editar una consulta abierta de ejemplo: conservar fechas existentes, retirar una fecha pasada, añadir otra y guardar. La retirada de una opción votada exige confirmación específica, sin trasladar votos a otra fecha. Volver desde la confirmación conserva el borrador.
- Comparar claro/oscuro y tamaños de móvil/escritorio. Las preferencias ilustrativas se manejan fuera del diálogo; el calendario del formulario solo muestra el resultado de disponibilidad y la selección.
- El switch de creación de evento provisional conserva el comportamiento vigente. La edición no modifica vínculo ni datos del evento.

## Dirección visual

Recorridos normativos: [FLUJO-CON-006 — Crear una consulta de fechas desde Consultas](../02_flujos/flujo-con-006-crear-consulta-fechas-desde-consultas.md), [FLUJO-CON-007 — Editar una consulta de fechas](../02_flujos/flujo-con-007-editar-consulta-fechas.md) y [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](../03_wireframes/wf-con-008-calendario-dialogo-consultas-fechas.md).

Usar como base el [sistema de diseño inicial](../05_sistema-diseno/sistema-diseno-inicial.md) y [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](mockup-coo-001-calendario-consultas.md), contrastados con los controles actuales de calendario. El ejemplo omite recuentos, edición de marcas, modo propio, solapa y menú de preferencias dentro del diálogo. La selección se distingue por el contorno azul, sin tick, y mantiene nombre accesible y `aria-pressed`. El foco de teclado conserva su contorno discontinuo independiente.

La esquina superior derecha muestra una campana si hay eventos no rechazados ese día, también si está seleccionado. No incorpora recuentos: el nombre accesible del día identifica los eventos ilustrativos. El ejemplo usa una campana SVG por petición expresa; el calendario vigente emplea un carácter como indicador. Los días 23 y 28 de octubre muestran eventos, y el 30 solo tiene un evento rechazado, que no se indica.

## Límites y revisión

Smoke de interacción en Chromium mediante Playwright y revisión independiente: PASS para selección, retirada/restauración de fechas pasadas, confirmación al guardar, preferencias sin escritura, teclado y foco en 390/768/769/1280. Corregidos los hallazgos de foco y desbordamiento de etiquetas. No se han generado capturas ni ejecutado regresiones visuales.

Los datos y el guardado son ilustrativos. La propuesta no altera la creación desde el calendario principal, no acredita accesibilidad global y no ejecuta regresiones visuales. Se registra la aprobación visual con el ajuste indicado; el resto de gates de preparación e implementación pertenece a la SPEC.
