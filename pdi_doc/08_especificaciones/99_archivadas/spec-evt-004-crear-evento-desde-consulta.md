---
id: SPEC-EVT-004
nivel: N2
estado: cerrado
release: REL-004
---

# SPEC-EVT-004 — Crear evento desde consulta y simplificar resolución

## Objetivo

Simplificar el recorrido probado en local: crear opcionalmente un evento nuevo al crear una consulta de fechas y resolver usando exclusivamente el vínculo que ya tenga la consulta.

## Scope

- Sustituir el selector de evento de creación por un switch opcional «Crear evento provisional», desactivado inicialmente.
- Crear evento, consulta y vínculo conjuntamente al confirmar: mismo título, fecha nula, estado provisional, mismo equipo y participante creador.
- En resolución, mostrar solo una etiqueta con el título del evento asociado. Sin vínculo no mostrar elementos de vinculación. Retirar cualquier selección, cambio o retirada del vínculo desde el modal.
- Mantener la retirada/cambio del vínculo en la ficha abierta, la resolución de una fecha con vínculo y varias sin él, la autoría, las versiones, los avisos de estado y la navegación histórica.
- En el caso excepcional de evento rechazado, permitir rechazar la consulta o cancelar para desvincular previamente desde su ficha; no ofrecer desvincular dentro del modal.

## Fuera de scope

Rediseñar el mantenimiento del vínculo en la ficha, modificar consultas de texto, estados de eventos definitivos, rechazo coordinado desde evento, navegación histórica, calendario o esquema de datos. No se ejecutan ni actualizan regresiones visuales; siguen pendientes antes del cierre de la release. No se hará commit sin petición expresa.

## Baseline relacionado

- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md), [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md).
- [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md), [RN-CON-002 — Resolución de una consulta abierta](../../03_requisitos/02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md), [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md).
- [FLUJO-CON-001 — Crear una consulta de fechas](../../04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md), [FLUJO-CON-003 — Resolver una consulta](../../04_experiencia-usuario/02_flujos/flujo-con-003-resolver-consulta.md), [FLUJO-EVT-003 — Vincular eventos y consultas de fechas](../../04_experiencia-usuario/02_flujos/flujo-evt-003-vincular-evento-consulta.md), [WF-EVT-004 — Vincular evento y consulta de fechas](../../04_experiencia-usuario/03_wireframes/wf-evt-004-vincular-evento-consulta.md).
- [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md), [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md), [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md), [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md).
- [REL-004 — Eventos del equipo](../../01_producto/10_entregas/rel-004-eventos-del-equipo.md), [SPEC-EVT-003 — Vincular eventos y consultas de fechas](../99_archivadas/spec-evt-003-vinculo-evento-consulta.md).

## Módulos afectados

API: creación conjunta bajo el bloqueo/transacción del equipo y OpenAPI. WEB: formulario del calendario, modal de resolución, cliente HTTP y pruebas de los recorridos afectados.

## Criterios de aceptación

1. Crear consulta de fechas no ofrece selector de eventos existentes; el switch está desactivado inicialmente y permite crear solo la consulta.
2. Al activar el switch y confirmar, existe un único evento nuevo provisional sin fecha, con el mismo título y autor de la consulta, asociado a ella. Alternar el switch o cancelar no persiste recursos.
3. Validación, acceso, caducidad o fallo de persistencia no dejan consulta, evento, vínculo ni actividad parcialmente guardados.
4. El modal de resolución con vínculo muestra el título del evento como etiqueta y ningún selector/acción de modificación de vínculo. Sin vínculo no muestra elementos de evento vacío y conserva selección múltiple de fechas.
5. La aceptación vinculada usa exactamente una fecha y el vínculo actual, con los avisos/versiones y la autoría existentes. Para resolver sin evento se retira antes el vínculo desde la ficha.
6. Evento excepcionalmente rechazado: no hay desvinculación dentro del modal; rechazar conserva la relación y cancelar no cambia recursos. Los conflictos recargan el vínculo actual y exigen revisar de nuevo.
7. Mantener edición del vínculo en ficha, navegación, consultas de texto, rechazo coordinado y conservación histórica; usar teclado/foco y los viewports WEB.
8. Contrato de creación, errores y pruebas API/WEB/E2E coinciden; checks y revisión independiente sin hallazgos graves pendientes.

## Impacto baseline esperado

Evolución explícita aprobada por la persona impulsora el 2026-10-19. Se actualizan RF, RN, flujos y wireframe enlazados mediante `pdi:baseline-update`; se preserva la SPEC archivada anterior como evidencia histórica. No hay nueva decisión arquitectónica.

## Questions / Assumptions

**Decisión resuelta:** el título del evento será el mismo título de la consulta, por respuesta expresa de la persona impulsora en esta sesión. No se añade campo de título independiente.

La petición cambia los controles de creación y resolución. Las reglas existentes de eventos ya definitivos y el mantenimiento del vínculo desde la ficha siguen aplicando; no se interpreta la simplificación del modal como un permiso de cambiar automáticamente una fecha definitiva.

## Research necesario

`ConsultationService::create` ya valida equipo/participante/fechas dentro de `withLockedTeam`; el repositorio de eventos puede crear el provisional dentro de esa misma transacción, sin encadenar dos peticiones HTTP. `event_id` y `open_event_id` ya soportan el vínculo sin nueva migración. El formulario WEB carga eventos y consultas solo para el selector actual: esa carga se elimina al sustituirlo. La ficha necesita conservar su selector, con estado separado del modal de resolución.

## Design / Structure

- POST de consulta añade `createEvent?: boolean`, por defecto false. La activación (`true`) solo es válida para consultas de fechas; rechazar tipos inválidos y la combinación de activación con un `eventId` explícito. El parámetro antiguo de creación se conserva para compatibilidad API, sin ofrecerlo en WEB.
- La aplicación crea el evento mediante `EventRepository` e `IdentifierGenerator` dentro del mismo bloqueo/transacción; después crea la consulta con su identificador. Título validado de consulta, notas nulas, fecha nula, estado provisional, autor y momento de creación comunes. La respuesta sigue devolviendo la consulta con su resumen de evento.
- WEB envía `createEvent`, no realiza creación separada de evento. El modal de resolución omite `eventId`; conserva `expectedEventVersion` cuando aplica. El editor de vínculo permanece en la ficha y conserva sus cargas/reintentos.
- Se conserva el contrato API anterior de resolución para compatibilidad; el nuevo recorrido WEB no lo utiliza para modificar el vínculo.

## Plan por slices

1. Creación atómica API y contrato: HIGH por transacción e integridad, retenido en PRIMARY; pruebas de éxito, acceso, validación y rollback LOW.
2. Switch en creación y etiqueta en resolución: MEDIUM con reglas fijadas; actualización de E2E y fixtures LOW. No alterar el editor de vínculo de la ficha.
3. Verificación y convergencia: API, WEB, E2E focalizados/relevantes y smoke adaptable; revisión independiente y matriz de aceptación. Documentar la omisión visual, sin marcar la release entregada.

## Evidencia / Validation

API/PostgreSQL: createEvent false/ausente/true, fecha nula/estado/título/autoría, texto/boolean inválido/combinación eventId, rollback forzado y actividad; resolución conserva invariantes existentes. WEB/E2E: switch por defecto, alternar/cancelar/confirmar y persistencia; sin selector en resolución con/sin evento, retirada previa en ficha, una fecha frente a múltiples, aviso definitivo, conflicto y rechazo excepcional. Viewports 390/768/769/1280, claro/oscuro, teclado/foco y lint de accesibilidad; no declarar conformidad global. Ejecutar scripts existentes de API y WEB con NVM antes de checks WEB; ningún snapshot visual.

## Convergence

Contrastar las nuevas reglas contra RF/RN/flujos/wireframe, contrato y pruebas. Actualizar el delivery de la evolución sin borrar la validación histórica anterior. Conservar la omisión visual de la release y no marcarla entregada. No cambiar la SPEC archivada anterior para hacerla coincidir con el nuevo comportamiento.

## Gate DoR

PASS: alcance, requisitos y módulos identificados; título decidido expresamente; diseño transaccional reutiliza las fronteras existentes; plan y validación definidos. `validate_structure.py` y `git diff --check` pasan. La revisión focal del baseline comprueba que creación y resolución en RF/RN/flujos/wireframe coinciden, preservando como histórica la SPEC anterior. No quedan decisiones de producto abiertas. **READY_FOR_CHANGE_APPLY.**

## Verificación y matriz de aceptación — 2026-10-19

| Acceptance criterion | Evidence | Result |
|---|---|---|
| 1. Switch desactivado inicialmente; no selector de eventos existentes al crear | [E2E de consultas de fechas](../../../apps/web/e2e/date-consultations.spec.ts) y [E2E de vínculos](../../../apps/web/e2e/event-consultations.spec.ts) comprueban el switch y el payload; API comprueba campo ausente/false sin crear eventos. | PASS |
| 2. Evento nuevo provisional, sin fecha, mismo título/autor; alternar o cancelar no persiste | [Pruebas API de creación conjunta](../../../apps/api/tests/ConsultationEventCreationApiTest.php) verifican título exacto, fecha/notas nulas, autor, momento, versión inicial y ambos vínculos. E2E verifica cancelación con switch activado, alternancia y reinicio del borrador sin POST. [E2E real](../../../apps/web/e2e/events-real.spec.ts) lee los recursos persistidos antes de resolver. | PASS |
| 3. Sin recursos ni actividad parcialmente guardados | API prueba Bearer, participante ajeno, caducidad, tipos inválidos y combinación inválida con evento existente. Un CHECK forzado al guardar consulta revierte también evento y actividad, sin huérfanos. | PASS |
| 4. Modal sin selector: etiqueta solo con vínculo; sin vínculo acepta varias fechas | E2E comprueba ausencia de combobox/control de evento vacío en resolución, etiqueta del evento vinculado, una fecha vinculada y varias sin vínculo. | PASS |
| 5. Resolución usa el vínculo actual y conserva fecha/autoría/versiones; retirada previa desde ficha | E2E de definitivo comprueba aviso y `expectedEventVersion` con recarga tras 409. El caso de retirada desde ficha permite luego resolver sin evento. E2E real finaliza el evento y confirma autoría y navegación tras recarga. | PASS |
| 6. Rechazado sin desvinculación dentro del modal; cancelar no cambia recursos | E2E verifica aceptación bloqueada, cancelación sin escrituras, rechazo de consulta con relación histórica y retirada posterior desde ficha antes de resolver. | PASS |
| 7. Regresiones de fichas, historial, texto y rechazo; teclado/foco/adaptación | [Smoke responsive](../../../apps/web/e2e/event-consultations-responsive.spec.ts) cubre cuatro viewports y ambos temas, switch real por Space/foco/alcance y reflujo, edición de vínculo y diálogos. Regresión relacionada y navegación real correctas. | PASS |
| 8. Contrato, tests, checks y revisión independiente | OpenAPI describe y prueba `createEvent`; API completa 171 tests/1531 assertions, WEB 26 tests, 41 E2E focalizados y 50 E2E relacionados/reales. CS Fixer, PHPStan, Rector, Doctrine, lint, formato y build correctos. Revisión independiente `REVIEW_OK` sin hallazgos pendientes. | PASS |

### Evidencia reproducible

- `docker compose exec -T api composer test`: PASS, 171 tests y 1531 assertions. El archivo nuevo de creación conjunta aporta 5 tests y 63 assertions.
- Dentro de API, `composer cs:check`, `composer stan` y `composer rector:check`: PASS. `docker compose exec -T api php bin/console doctrine:schema:validate --env=test`: PASS. No se necesita una nueva migración.
- Antes de todos los checks WEB, `source "$HOME/.nvm/nvm.sh" && nvm use` desde la raíz: Node 24.21.0 y npm 11.19.0. `npm --prefix apps/web test`: 26 PASS; `npm --prefix apps/web run lint`, `format:check` y `build`: PASS sobre el código final.
- Desde `apps/web`, `npx playwright test e2e/event-consultations.spec.ts e2e/event-consultations-responsive.spec.ts e2e/date-consultations.spec.ts --output=/tmp/synqo-evt004-e2e --reporter=list --workers=1`: 41/41 PASS.
- Con `api-e2e` iniciado mediante `docker compose --profile e2e up -d api-e2e`, dentro del servicio `web-visual-test`: `WEB_PROXY_CONFIG=proxy.e2e.conf.json npx playwright test e2e/events-real.spec.ts e2e/events.spec.ts e2e/consultations.spec.ts e2e/consultation-decisions.spec.ts e2e/calendar-events.spec.ts e2e/calendar-options.spec.ts e2e/availability.spec.ts e2e/accessibility-smoke.spec.ts --workers=2 --output=/tmp/synqo-evt004-related-real --reporter=list`: 50/50 PASS. Incluye dos recorridos con Symfony/PostgreSQL reales; solo usa `synqo_test`. Se detuvo el servicio temporal al terminar.
- Accesibilidad automatizada: ESLint 10.12.0 con angular-eslint 21.4.0 y `templateAccessibility` sobre plantillas inline, PASS; Playwright 1.63.0 con teclado, foco, controles alcanzables y reflujo en 390×844, 768×1024, 769×1024 y 1280×800, claro/oscuro, PASS. Alcance parcial; no acredita conformidad WCAG global.
- Regresiones visuales: `omitido_activamente`, por la instrucción vigente de tratarlas antes del cierre de la release. No se ejecutaron ni actualizaron snapshots.
- `python3 pdi/scripts/validate_structure.py` y `git diff --check`: PASS. El cambio generado de `apps/api/config/reference.php` al ejecutar pruebas se retiró; no pertenece a esta evolución.

## Resultado de convergencia y cierre

`pdi:change-verify` y `pdi:change-converge`: PASS. Baseline, flujos, wireframe, contrato y recorridos coinciden con la petición del 2026-10-19 y la respuesta expresa sobre el título compartido. La compatibilidad de la API anterior permanece documentada; los controles WEB ya no permiten modificar el vínculo durante la resolución. La cancelación sin título ni fechas conserva su salida directa anterior aunque el switch esté activado.

La revisión independiente final no deja BLOCKER, MAJOR, MINOR, decisiones pendientes ni drift abierto. La creación transaccional mantiene la arquitectura y el esquema existentes; no se necesita ADR nuevo. La SPEC anterior se conserva intacta como evidencia histórica.

**DONE — Change cerrado y archivado localmente el 2026-10-19 mediante `pdi:change-close`.** Ocho criterios PASS, checks verdes y alcance verificado. Sin commit ni despliegue. [REL-004 — Eventos del equipo](../../01_producto/10_entregas/rel-004-eventos-del-equipo.md) conserva la validación local y la regresión visual pendiente; no se declara entregada.
