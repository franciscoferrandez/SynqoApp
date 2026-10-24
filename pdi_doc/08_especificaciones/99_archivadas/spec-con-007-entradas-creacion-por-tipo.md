---
id: SPEC-CON-007
nivel: N1
estado: cerrada
release: REL-005
---

# SPEC-CON-007 — Separar las entradas de creación de consultas por tipo

## Objetivo y origen

Petición expresa del 2026-10-24: crear consultas de fechas únicamente desde el botón existente del Calendario y consultas de opciones libres únicamente desde Consultas. Eliminar la elección de tipo intermedia en Consultas, conservando los formularios y comportamientos vigentes de cada tipo.

## Scope y límites

Ambos botones de creación de Consultas, cabecera y estado vacío, abrirán directamente texto/opciones libres. El Calendario conserva su diálogo compartido de fechas, mes visible, selección inicial vacía, evento provisional opcional y navegación posterior a Consultas. La edición de fechas desde su ficha sigue disponible. Mantener copy actual salvo retirar la elección de tipo. Sin cambios API, esquema, estados, votos ni reglas de edición. No implementar ni hacer commit durante esta preparación.

## Fuentes y módulos

- [REL-005 — Ajustes de funcionalidad de consultas](../../01_producto/10_entregas/rel-005-ajustes-funcionalidad-consultas.md).
- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md).
- [RF-CON-005 — Crear una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-005-crear-consulta-texto.md).
- [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md), para conservar su contrato sin modificaciones.
- [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md).

## Gate de inicio

`pdi:change-new`: READY_FOR_CHANGE_PREPARE. Evolución N1 independiente de la futura reorganización de listas; no depende de sus decisiones temporales ni de paginación.

## Research y baseline consolidado

Exploración independiente de solo lectura completada: `consultations-page.ts` contiene dos CTA que llaman a `chooseType()`, selector y montaje de alta de fechas. `availability-calendar.ts` ya abre `ConsultationDateEditor` con mes visible y guarda hacia Consultas. El mismo editor sigue siendo necesario para alta en Calendario y edición desde la ficha; no retirarlo. No hay ambigüedad funcional pendiente: se conserva el copy actual «Crear consulta» y el comportamiento de cada formulario salvo su entrada.

Mediante `pdi:baseline-update`, conforme a la petición expresa, se actualizan los dos requisitos enlazados y estos artefactos:

- [FLUJO-CON-001 — Crear una consulta de fechas](../../04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md).
- [FLUJO-CON-004 — Crear una consulta con opciones de texto](../../04_experiencia-usuario/02_flujos/flujo-con-004-crear-consulta-texto.md).
- [FLUJO-CON-006 — Crear una consulta de fechas desde Consultas](../../04_experiencia-usuario/02_flujos/flujo-con-006-crear-consulta-fechas-desde-consultas.md): obsoleto por sustitución expresa, conserva su contexto histórico; no borrar ni reescribir las SPEC archivadas.
- [WF-CON-001 — Lista de consultas del equipo](../../04_experiencia-usuario/03_wireframes/wf-con-001-lista-consultas.md).
- [WF-CON-004 — Crear una consulta de fechas](../../04_experiencia-usuario/03_wireframes/wf-con-004-crear-consulta-fechas.md).
- [WF-CON-006 — Crear una consulta con opciones de texto](../../04_experiencia-usuario/03_wireframes/wf-con-006-crear-consulta-texto.md).
- [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](../../04_experiencia-usuario/03_wireframes/wf-con-008-calendario-dialogo-consultas-fechas.md).

## Diseño y unidades afectadas

Ambos CTA de `ConsultationsPage` llaman directamente a su editor de texto. Retirar únicamente el estado/dialog/transiciones del selector y el montaje de alta de fechas de esa página, con sus imports y callbacks que queden sin uso. Conservar el editor de fechas en Calendario y en `ConsultationDetailPage`, sus permisos y su carga diferida. Mantener API y ruta de detalle de consultas, identificadores, tipo persistido, formulario y confirmación de texto, validación, guardado directo de fechas, cancelación y retorno de foco/fragmento.

Actualizar fixtures de creación de texto que pulsan «Texto» en el selector: consultas, responsive, accesibilidad, benchmark y visuales afectados. Trasladar la cobertura de alta de fechas y sus estados del editor desde la entrada retirada a Calendario; conservar la cobertura de edición de fechas, preferencias, campanita, cancelación y errores, sin borrar evidencia útil. El prototipo histórico de doble entrada no se toma como norma del recorrido nuevo. No requiere nueva composición visual: reutiliza formularios existentes.

## Criterios de aceptación verificables

1. Cabecera de Consultas abre directamente texto; no aparece elección de tipo ni posibilidad de alta de fechas desde esa pestaña.
2. El CTA del estado vacío hace lo mismo y devuelve foco al cerrar conforme al comportamiento existente.
3. Calendario conserva creación de fechas en mes visible, borrador vacío, preferencias y selección vigentes, evento provisional opcional y navegación posterior conservando acceso.
4. Crear texto conserva validación, confirmación, cancelar/descarte y errores/reintentos actuales; no modificar contratos API ni guardar un tipo distinto.
5. Editar consultas de fechas desde la ficha sigue disponible según sus reglas; el componente compartido no se elimina.
6. Ambos recorridos y edición se verifican por teclado y en cuatro anchuras y ambos temas; sin selector residual ni regresiones de foco/navegación.
7. Checks WEB y E2E focalizados/relacionados pasan; la cobertura del editor de fechas se conserva en su entrada vigente. No se presume verificación de implementación durante prepare.

## Plan por slices

1. **LOW/MEDIUM — WEB:** cambiar ambos CTA, retirar selector y estado/montaje de alta de fechas de Consultas; preservar formularios, Calendario y edición. Propiedad: página de Consultas y pruebas unitarias directamente necesarias.
2. **MEDIUM — Evidencia:** adaptar E2E/fixtures de entrada y migrar cobertura de fechas, revisión independiente y checks reales. Propiedad disjunta de E2E respecto del código; no subagentes de subagentes. El principal conserva producto/contratos y verificación de invariantes.

Antes de checks WEB, activar `source "$HOME/.nvm/nvm.sh" && nvm use` desde raíz. Ejecutar tests/lint/formato/build y E2E focalizados; revisar todos los criterios con matriz y no cerrar sin evidencia. Las referencias visuales deberán tratarse explícitamente durante apply si cambian; esta preparación no ejecuta ni actualiza snapshots, no hace commit ni publica.

## Gate de preparación

**PASS — READY_FOR_CHANGE_APPLY**, 2026-10-24. Intención explícita, baseline consolidado, flujo/estructura existentes reutilizados, módulos definidos, alcance independiente, criterios y plan verificables. No hay decisiones funcionales pendientes ni nueva decisión arquitectónica. Índice de trazabilidad mantenido por autorización expresa vigente. La preparación queda completada; no se inicia implementación por esta operación.

## Evidencia de preparación — 2026-10-24

Exploración delegada y revisión independiente completadas: REVIEW_OK, sin BLOCKER/MAJOR ni decisiones funcionales abiertas. Validación documental: python3 pdi/scripts/validate_structure.py PASS (69 directorios, 17 skills), python3 pdi/scripts/artifact_links.py sin incidencias y git diff --check PASS. Baseline, release e índice de trazabilidad actualizados. No se han ejecutado tests de producto ni alterado código, snapshots, commits o despliegues; estos resultados acreditan preparación y no sustituyen apply/verify.

## Apply y verificación funcional — 2026-10-24

Autorización expresa posterior: aplicar las tres SPEC de una en una mediante subagentes, verificar y hacer commit de cada implementación; actualizar screenshots y publicar al terminar. Implementación WEB y adaptación E2E en dos subagentes con propiedad disjunta; revisión independiente REVIEW_OK, sin hallazgos pendientes. Corregido retorno de foco al CTA de origen, con fallback a cabecera si el estado vacío desaparece tras crear.

| Acceptance criterion | Evidence | Result |
|---|---|---|
| 1. Cabecera abre texto sin selector ni alta de fechas | consultations.spec.ts, matriz de entradas | PASS |
| 2. Estado vacío abre texto y restaura foco | Matriz ambos CTA, Escape y descarte | PASS |
| 3. Calendario conserva alta, mes vacío, preferencias, evento y navegación | date-consultations.spec.ts, consultation-dates.spec.ts, recorridos reales | PASS |
| 4. Texto conserva validación, confirmación, errores y contrato | consultations.spec.ts y edición de texto en suite completa | PASS |
| 5. Edición de fechas conservada | consultation-dates.spec.ts y consultation-dates-real.spec.ts | PASS |
| 6. Teclado, cuatro anchuras y dos temas | Matrices de ambos CTA y edición de fechas, smoke de accesibilidad | PASS |
| 7. Checks y E2E relacionados | 43 unitarias WEB y 182 E2E no visuales; lint, formato y build | PASS |

Comandos con NVM activado: npm --prefix apps/web test (43 PASS), run lint, run format:check y run build (492,71 kB iniciales, PASS). Suite final: WEB_TEST_PORT=4210 npm --prefix apps/web run test:e2e -- --workers=1, **182/182 PASS en 5,7 minutos**, con PostgreSQL y Mailpit reales; benchmark 14,6 s. El entorno aislado usa synqo_test y cuota de test, sin reset ni cambios de configuración de desarrollo. Los 429 de la ejecución inicial se identificaron como cuota del entorno y se resolvieron usando ese perfil de pruebas.

Convergencia funcional PASS para este alcance; los ajustes de listas preparados permanecen pendientes en sus propios Changes. Regresión visual y cierre documental diferidos al final de las tres implementaciones por instrucción expresa; no se declara ninguna release ENTREGADA.

## Cierre — 2026-10-24

Commit funcional `6beb62a`, creado con hooks activos. Regresión final común: API **219 tests / 2394 assertions PASS**, WEB **61 unitarias PASS**, E2E **191/191 PASS** en 5,8 minutos y benchmark automatizado 12,9 s. Checks estáticos, lint, formato, build y esquema PASS; revisión independiente REVIEW_OK.

Con NVM activado, npm --prefix apps/web run test:visual:update ejecuta toda la suite reproducible: **136/136 PASS** en 3,2 minutos, móvil 390×844 y escritorio 1280×800, ambos temas. Se actualizan 20 referencias por la secuencia conjunta autorizada; inspeccionadas las nuevas listas de consultas y eventos. La comparación sin actualización se ejecutará en el hook pre-push y el CI se vigilará después de publicar.

Verificación y convergencia PASS: criterios completos, baseline, código, contratos, tests y delivery coherentes; sin drift significativo ni hallazgos graves pendientes. DONE: SPEC cerrada y archivada con evidencia local y enlaces reparados. Las releases conservan en_implementacion y este cierre no acredita despliegue ni estado ENTREGADA.
