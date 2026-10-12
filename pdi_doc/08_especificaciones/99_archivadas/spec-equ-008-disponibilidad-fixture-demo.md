---
id: SPEC-EQU-008
nivel: N1
estado: cerrado
release: REL-003
---
# SPEC-EQU-008 — Hacer verosímil y variada la disponibilidad del juego demo

## Objetivo

Ajustar las disponibilidades del juego demo para que representen un uso menos exhaustivo y permitan observar cómo resume Synqo días sin marcas y días con estados individuales diversos.

## Scope

- Cambiar exclusivamente la generación de disponibilidades de la fixture demo compartida por el reset local y el reset de preproducción.
- Mantener las dos identidades de equipo, participantes, consultas y estados de consultas existentes.
- Incluir días completamente sin marcas, marcas parciales por participante y ejemplos que produzcan resúmenes agregados distintos conforme a la regla vigente.
- Mantener datos reproducibles entre resets y compatibles con el horizonte temporal existente.

## Fuera de scope

- Cambiar la regla de cálculo del resumen diario del equipo, definida por [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md).
- Cambiar las vistas, el modo de edición o el contrato de disponibilidad.
- Cambiar el comando, sus guardas, la cadencia del Cron, las credenciales o la transacción del reset.
- Rediseñar consultas, participantes, nombres de equipo o calendario de consultas.

## Baseline relacionado

- [REL-003 — Estabilización de Synqo](../../01_producto/10_entregas/rel-003-estabilizacion-synqo.md)
- [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md)
- [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md)
- [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../99_archivadas/spec-equ-006-juego-demo-preproduccion.md)
- [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [ADR-EQU-004 — Derivar credenciales estables para los equipos demo](../../05_investigacion-y-decisiones/05_adr/adr-equ-004-credenciales-estables-equipos-demo.md)

## Módulos afectados

- [API — contrato de módulo](../../06_arquitectura/03_modulos/API/README.md): fixture y carga de marcas en el reset.
- [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md): pruebas deterministas de fixture y persistencia.

## Criterios de aceptación

1. Cada participante deja sin marcar la mayoría de las fechas del horizonte de la fixture; ningún participante aparece con una marca para todos los días.
2. En cada equipo existen días completamente en blanco, con cero marcas de todas las personas.
3. En cada equipo se pueden observar fechas con una marca individual, marcas parciales de varias personas y fechas con diferentes combinaciones de disponible, quizá y no disponible.
4. La fixture produce, en cada equipo, ejemplos verificables de resumen neutro, disponible, quizá y no disponible conforme a [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md). Al menos un ejemplo combina disponible y no disponible para que se observe la precedencia vigente del peor estado.
5. Los patrones de disponibilidad son reproducibles entre ejecuciones con el mismo instante de reset, UTC y las identidades de equipo/participante; la fixture no depende de azar no controlado.
6. Se conserva el horizonte existente: desde el primer día del mes natural anterior hasta el último día del tercer mes futuro; los días se anclan al lunes UTC de la semana del reset.
7. No cambian los dos equipos, los ocho participantes ni las cuatro consultas con sus tipos y estados actuales. Los tests de reset continúan comprobando la preservación del pool efímero y las demás guardas existentes.

## Questions / Assumptions

- La expresión «disponibilidad aleatoria» se implementará como una distribución pseudoaleatoria pero determinista, de modo que cada reset muestre los mismos patrones relativos y las pruebas puedan asegurar los casos de ejemplo.
- El calendario seguirá cubriendo el horizonte ya aprobado; este Change ajusta la densidad y variedad de las marcas, no su período.
- No hay una decisión pendiente sobre cambiar la regla de agregación: se conserva el peor estado vigente.
- La lista exacta de fechas y participantes se derivará de ejemplos relativos al lunes UTC para seguir siendo útil después de cada reset; no se fija contenido nuevo de calendario como regla de producto.

## Research

- [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md) exige datos deterministas y comparte la fixture con preproducción mediante [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../99_archivadas/spec-equ-006-juego-demo-preproduccion.md).
- `DemoFixture::availability()` crea actualmente una marca por participante para cada día del período y repite una secuencia de estados por desplazamiento; por eso no hay días sin marcar y la agregación queda dominada por marcas no disponibles.
- [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md) conserva las marcas individuales, ignora «sin marcar» y muestra el peor estado agregado. El defecto observado pertenece al contenido demo, no a la regla de producto.
- El repositorio de reset llama a la fixture para cada participante; los tests de [SPEC-EQU-004](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md) comprueban la repetibilidad y el horizonte, por lo que pueden ampliarse sin tocar el contrato del comando.

## Design

- Generar una marca escasa por participante/día mediante una secuencia pseudoaleatoria estable a partir del offset UTC y las identidades de equipo/participante.
- Añadir patrones de muestra explícitos y acotados al inicio del tramo futuro para garantizar en cada equipo los estados agregados y combinaciones definidos en los criterios; el resto del período seguirá la distribución escasa.
- Mantener como `sin marcar` la ausencia de fila en `availability`; no persistir un estado nuevo.
- Probar los estados agregados usando el mismo calculador de dominio que usa la aplicación, además de comprobar la distribución persistida por equipo.

## Structure

- `DemoFixture`: seleccionar fechas/estados de forma escasa, reproducible y diferenciada por equipo y participante.
- `OrmDemoResetRepository`: pasar a la fixture el contexto de equipo necesario; no cambiar transacción, guardas, pool ni credenciales.
- `DemoResetTest`: comprobar repetibilidad, días vacíos, densidad y ejemplos agregados; mantener las verificaciones actuales de horizonte y seguridad del reset.

## Plan por slices

1. Implementar generación determinista dispersa y muestras garantizadas por equipo.
2. Ampliar pruebas unitarias/de integración para comprobar densidad, días en blanco y estados agregados bajo la regla actual.
3. Ejecutar la suite focalizada y los checks API aplicables; verificar que se conservan el horizonte, las consultas y las protecciones del reset.

## Preparación / DoR

El objetivo, scope, baseline, módulos, ejemplos observables y evidencia requerida están definidos. La solución queda acotada a la fixture; la ausencia de marca seguirá representándose sin fila y la regla de resumen no cambia. La generación será determinista y mantendrá el horizonte y los escenarios necesarios tras los resets UTC. No hay preguntas bloqueantes, cambios normativos pendientes ni decisiones de arquitectura. El tamaño y el riesgo son N1: una modificación localizada de datos de demostración con pruebas focalizadas; no afecta contratos ni reglas de negocio.

**DoR: PASS — READY_FOR_CHANGE_APPLY.** El plan se aplicó en un único slice N1.

## Evidencia / Validation

- Implementado: [DemoFixture](../../../apps/api/src/Application/Demo/DemoFixture.php) genera marcas pseudoaleatorias deterministas y escasas, además de una semana explícita de ejemplos relativos al lunes UTC. [OrmDemoResetRepository](../../../apps/api/src/Infrastructure/Persistence/OrmDemoResetRepository.php) omite la persistencia de días sin marca.
- Añadida prueba focalizada en [DemoResetTest](../../../apps/api/tests/DemoResetTest.php) para densidad individual, días en blanco y los cuatro resultados agregados mediante el calculador real de dominio.
- La prueba focalizada `docker compose exec -T api composer test -- tests/DemoResetTest.php` pasó inicialmente con 12 tests y 119 aserciones; la suite completa volvió a ejecutar los casos reforzados.
- `docker compose exec -T api composer test`: PASS, 99 tests y 764 aserciones.
- `docker compose exec -T api composer cs:check`: PASS, cero archivos que requieran cambios.
- `docker compose exec -T api composer stan`: PASS, sin errores en 77 archivos.
- `docker compose exec -T api composer rector:check`: PASS.
- `python3 <PDI_ROOT>/scripts/validate_structure.py`: PASS; `git diff --check`: PASS.

| Criterio | Evidencia | Resultado |
|---|---|---|
| 1. Cada participante deja la mayoría de fechas sin marca | `testFixtureIsSparseAndShowsTheTeamAvailabilityScenarios` comprueba la densidad de los ocho participantes y compara cada patrón con una segunda generación idéntica. | PASS |
| 2. Días en blanco en ambos equipos | La prueba de fixture exige que el lunes de muestra no tenga marcas en cada equipo; la prueba de reset confirma que el día sigue sin filas tras persistir. | PASS |
| 3. Marcas individuales, parciales y estados variados | Los ejemplos relativos al lunes comprueban una marca, varias marcas parciales y combinaciones de los tres estados en ambos equipos. | PASS |
| 4. Resúmenes neutro, disponible, quizá y no disponible, con caso mixto | `DailyAvailability::day` calcula los escenarios de fixture en la prueba; el día disponible/no disponible produce no disponible conforme al orden vigente. | PASS |
| 5. Reproducibilidad | La prueba compara el resultado de generación por fecha para cada equipo y participante; el patrón deriva de sus índices y el offset UTC, no de azar de ejecución. | PASS |
| 6. Horizonte y anclaje UTC | `testFixtureIsDeterministicAcrossUtcBoundaryAndYearChange` conserva límites, fechas de referencia semanales y cambio de año; el reset integrado confirma el horizonte persistido. | PASS |
| 7. Contenido y guardas del reset intactos | La suite comprueba los dos equipos, ocho participantes, cuatro consultas/estados, votos, pool efímero, rollback, lock, restricciones de host y tokens estables de preproducción. | PASS |

**Verificación: PASS — READY_FOR_CHANGE_CONVERGE.**

## Convergencia

La comparación entre SPEC, [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md), [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md), [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../99_archivadas/spec-equ-006-juego-demo-preproduccion.md), el código y las pruebas no encontró discrepancias pendientes. El cambio modifica solo la selección/persistencia de marcas de fixture; no cambia el resumen de dominio, las identidades ni el flujo protegido de reset. No se requiere actualización normativa ni de arquitectura. **Convergencia PASS — READY_FOR_CHANGE_CLOSE.**

## Resultado de cierre

**DONE — SPEC-EQU-008 cerrada el 2026-10-12 y archivada en `08_especificaciones/99_archivadas/`.** Los siete criterios están en PASS; la suite completa y los checks estáticos aplicables pasan. El código queda validado localmente; no se declara despliegue a preproducción ni entrega completa de REL-003. No hay cambios normativos ni de arquitectura pendientes.
