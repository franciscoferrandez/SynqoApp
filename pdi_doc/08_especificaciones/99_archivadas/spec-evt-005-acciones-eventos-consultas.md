---
id: SPEC-EVT-005
nivel: N1
estado: cerrado
release: REL-004
---

# SPEC-EVT-005 — Acciones en fichas de eventos y consultas

## Objetivo

Agrupar las acciones de las fichas en un menú hamburguesa y corregir la selección inicial del evento al cambiar el vínculo de una consulta, conforme a la petición expresa del 2026-10-19.

## Scope

- Evento: menú arriba a la derecha, alineado con «Detalle del evento»; título y badge del estado en la fila siguiente. Incluir las acciones existentes de editar, rechazar o recuperar según el estado.
- Consulta: menú equivalente junto al encabezado, con resolver y elegir/cambiar/quitar evento cuando correspondan. Mantener visibles los datos, votos y enlaces de navegación.
- Al cambiar el vínculo, seleccionar inicialmente el evento actual, incluso si las opciones llegan después o no está entre los elegibles. Sin vínculo, seleccionar «Sin evento». «Quitar vínculo» inicia explícitamente esa elección.
- Mantener confirmaciones, errores, reintentos, reglas de acceso y efectos de cada acción. Cancelar menús o diálogos no persiste cambios.

## Fuera de scope

API, contratos, esquema, reglas de dominio, creación de consultas, calendario y nuevos permisos. No ejecutar ni actualizar regresiones visuales, crear ADR ni realizar commit sin petición expresa. REL-004 no se declara entregada.

## Baseline relacionado

- [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md), [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md), [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md).
- [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md), [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md).
- [FLUJO-EVT-001 — Consultar y gestionar eventos](../../04_experiencia-usuario/02_flujos/flujo-evt-001-gestionar-eventos.md), [FLUJO-CON-003 — Resolver una consulta](../../04_experiencia-usuario/02_flujos/flujo-con-003-resolver-consulta.md), [FLUJO-EVT-003 — Vincular eventos y consultas de fechas](../../04_experiencia-usuario/02_flujos/flujo-evt-003-vincular-evento-consulta.md).
- [WF-EVT-002 — Ficha y edición de evento](../../04_experiencia-usuario/03_wireframes/wf-evt-002-ficha-evento.md), [WF-CON-002 — Detalle de una consulta abierta](../../04_experiencia-usuario/03_wireframes/wf-con-002-detalle-consulta.md), [WF-EVT-004 — Vincular evento y consulta de fechas](../../04_experiencia-usuario/03_wireframes/wf-evt-004-vincular-evento-consulta.md).
- [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md), [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md), [REL-004 — Eventos del equipo](../../01_producto/10_entregas/rel-004-eventos-del-equipo.md), [SPEC-EVT-004 — Crear evento desde consulta y simplificar resolución](../99_archivadas/spec-evt-004-crear-evento-desde-consulta.md).

## Módulos afectados

WEB: fichas de evento y consulta, componente compartido de acciones, estilos y E2E. La API conserva sus contratos y efectos.

## Criterios de aceptación

1. El menú del evento está alineado con «Detalle del evento»; su badge se alinea con el título. Editar/rechazar solo se ofrecen en eventos activos y recuperar en rechazados.
2. La consulta abierta ofrece resolver y, si es de fechas, elegir evento o cambiar/quitar vínculo según su relación actual. Las consultas cerradas no ofrecen mutaciones; votos y navegación permanecen accesibles fuera del menú.
3. «Cambiar evento» preselecciona el evento asociado tras una carga asíncrona y al reintentar. El actual sigue representado si es definitivo/rechazado y no elegible para vínculos nuevos. Guardar sin cambiar mantiene el vínculo.
4. Sin vínculo, la opción inicial es «Sin evento»; «Quitar vínculo» la selecciona explícitamente. Solo guardar confirma modificaciones; cancelar conserva el vínculo y no escribe.
5. Los menús tienen nombres accesibles, estado expandido y botones nativos operables con teclado. Escape y clic exterior cierran; al cancelar diálogos o completar acciones se devuelve el foco al disparador persistente cuando se permanece en la ficha.
6. Menús, diálogos y cabeceras son utilizables sin desbordamiento horizontal en 390/768/769/1280, claro y oscuro. Confirmaciones, rechazos coordinados, resolución vinculada/sin vínculo, navegación e integración real conservan su comportamiento.
7. Tests, lint, formato, build, revisión independiente, documentación y matriz de aceptación pasan; no se ejecutan snapshots visuales ni se marca la release entregada.

## Impacto baseline esperado

Actualizar únicamente flujos y wireframes mediante `pdi:baseline-update` para reflejar el acceso a las acciones y la preselección aprobados. Los RF/RN siguen vigentes sin nuevas reglas. Mantener trazabilidad y delivery de la evolución sin alterar las SPEC archivadas.

## Questions / Assumptions

La petición expresa determina posición, acciones y selección inicial. Las acciones se conservan con sus condiciones actuales; no se habilita edición de consultas cerradas ni resolución desde el evento. No hay decisiones de producto abiertas.

## Research

Las acciones actuales son botones en ambas fichas, con retorno de foco dirigido a ellos. Al moverlas es necesario retornar al disparador persistente. El selector enlaza `[value]` antes de insertar las opciones asíncronas: se sustituye por el accessor nativo de Angular Forms para mantener sincronizado el valor con las opciones. El endpoint de vínculo ya admite conservar el actual, aunque no sea elegible para un vínculo nuevo.

## Design / Structure

Un componente WEB compartido agrupa botones nativos bajo un disparador hamburguesa con nombre accesible y `aria-expanded`/`aria-controls`. La lista desplegada es un grupo de acciones, sin prometer el patrón ARIA menu y sus flechas; se recorre con Tab. Escape cierra y devuelve foco; clic exterior cierra sin secuestrar foco. Elegir acción cierra antes de abrir el diálogo. Los padres invocan el retorno al disparador al cancelar/completar, incluidos edición, rechazo, recuperación, vínculo y resolución. Tras completar la resolución, la consulta cerrada ya no tiene menú y el foco retorna a «Volver a Consultas». No añadir dependencias: Angular Forms ya pertenece al proyecto.

Las cabeceras tienen una fila superior con etiqueta y disparador, y otra con título y badge. Ancho adaptable, texto largo con salto y estilos mediante tokens semánticos claros/oscuros. El vínculo se edita con borrador independiente: abrir usa el actual, retirar usa null, las cargas no sobrescriben la elección y los errores permiten reintentar.

## Plan por slices

1. MEDIUM: componente compartido, cabeceras y acceso a acciones; sincronización del selector y retorno de foco. PRIMARY fija comportamiento y contratos; implementer recibe estos archivos de producción con propiedad exclusiva.
2. LOW: adaptar E2E existentes y añadir regresión asíncrona, estados condicionales, cancelación/teclado/foco y geometría adaptable sin snapshots. Escritores de tests con archivos disjuntos.
3. LOW: checks WEB y E2E focalizados, relacionados y reales; revisión independiente, matriz de aceptación, convergencia y cierre si todo pasa.

## Evidencia / Validation

NVM desde raíz antes de cada check WEB. Tests unitarios, lint de accesibilidad, formato, build. Playwright: vínculos, consultas de fechas, responsive 390/768/769/1280 en ambos temas, eventos, decisiones de consultas, accesibilidad, calendario y recorridos con API real usando solo la base de pruebas. Añadir respuesta de opciones retrasada y vínculo actual no elegible; verificar valor visible y payload sin cambio, sin vínculo y retirada explícita, error/reintento, Escape/clic exterior y foco tras cancelar/completar. No ejecutar regresiones visuales. Validador documental y diff sin errores.

## Convergence

Contrastar código/tests con flujos y wireframes actualizados mediante `pdi:baseline-update`. Mantener las SPEC anteriores intactas, no cambiar RF/RN/contratos y conservar REL-004 en implementación con visuales pendientes.

## Gate DoR

PASS: petición explícita, criterios verificables, diseño y módulos identificados, documentación UX convergida y sin cuestiones bloqueantes. La persona impulsora autorizó expresamente mantener el índice opcional de trazabilidad en esta ejecución. Validador documental y diff sin errores. **READY_FOR_CHANGE_APPLY.**

## Verificación y matriz de aceptación — 2026-10-19

| Acceptance criterion | Evidence | Result |
|---|---|---|
| 1. Menú del evento en encabezado y badge alineado con título; acciones según estado | [E2E responsive](../../../apps/web/e2e/event-consultations-responsive.spec.ts) comprueba centros verticales de etiqueta/disparador y título/badge, acciones de activos y rechazados, en los cuatro viewports y ambos temas. [E2E de eventos](../../../apps/web/e2e/events.spec.ts) y [recorridos reales](../../../apps/web/e2e/events-real.spec.ts) verifican edición, rechazo y recuperación. | PASS |
| 2. Menú de consulta condicionado por estado/tipo/vínculo; votos y navegación accesibles | Responsive comprueba elegir/cambiar/quitar y resolver en abiertas, ausencia de mutadores en cerradas y enlaces visibles. [Decisiones de consulta](../../../apps/web/e2e/consultation-decisions.spec.ts), [smoke de accesibilidad](../../../apps/web/e2e/accessibility-smoke.spec.ts) y [recorrido móvil](../../../apps/web/e2e/mobile-journey.spec.ts) conservan votación, texto y resolución. | PASS |
| 3. Preselección actual tras carga/reintento, también no elegibles; guardar conserva vínculo | [E2E de vínculos](../../../apps/web/e2e/event-consultations.spec.ts) retrasa las opciones tras un 500 y reintento. El provisional pasa de opción de vínculo actual a opción elegible real; definitivo y rechazado siguen representados como actuales. En los tres casos el selector conserva el ID y guardar envía ese mismo ID. | PASS |
| 4. Sin vínculo o retirada explícita usan «Sin evento»; cancelar no escribe | E2E de vínculos verifica inicio vacío sin relación, seleccionar un evento y cancelar sin escrituras, cambio confirmado y retirada explícita con payload null. La cancelación conserva los recursos. | PASS |
| 5. Teclado, Escape, clic exterior y retorno de foco | Responsive verifica Tab por botones nativos, salida del grupo con Tab y Escape desde fuera, vuelta al disparador, clic exterior, cancelación de vínculo/resolución/rechazo sin PUT. Revisión confirma retorno tras completar acciones y al botón Volver cuando la resolución elimina el menú. | PASS |
| 6. Adaptación y regresiones funcionales | 32/32 responsive en 390×844, 768×1024, 769×1024 y 1280×800, claro/oscuro; geometría, controles alcanzables y sin desbordamiento. E2E de vínculos y relacionados/reales verifican resolución vinculada/sin vínculo, disposiciones unlink/reject_both, historial y calendario. | PASS |
| 7. Checks, revisión y documentación coherentes; sin visuales ni entrega | 26 unitarias, lint, formato y build PASS; revisión independiente final REVIEW_OK, sin hallazgos pendientes. Validador documental, enlaces relativos y diff correctos. Regresiones visuales omitidas expresamente; REL-004 sigue en implementación. | PASS |

### Evidencia reproducible

- Antes de cada check WEB: `source "$HOME/.nvm/nvm.sh" && nvm use` desde la raíz; Node 24.21.0 y npm 11.19.0.
- `npm --prefix apps/web test`: 26 PASS. `npm --prefix apps/web run lint`, `format:check` y `build`: PASS, incluidos los ajustes finales de foco y Escape. Prettier sobre los E2E modificados: PASS.
- Desde `apps/web`, `npx playwright test e2e/event-consultations.spec.ts e2e/date-consultations.spec.ts --workers=1 --output=/tmp/synqo-evt005-core --reporter=list`: 20/20 PASS antes de ampliar los casos de preselección. Reejecución focal final de los tres estados asíncronos y el nuevo caso sin vínculo/cancelación: 4/4 PASS. Se conserva la cobertura previa de creación y resolución.
- Con `api-e2e` iniciado mediante `docker compose --profile e2e up -d api-e2e`, dentro de `web-visual-test`: `WEB_PROXY_CONFIG=proxy.e2e.conf.json npx playwright test e2e/event-consultations-responsive.spec.ts --workers=1 --output=/tmp/synqo-evt005-responsive --reporter=list`: 32/32 PASS. El primer intento del host no disponía de Chromium compatible; la evidencia final se obtuvo en el contenedor de Playwright. Las navegaciones de fixture a la misma URL se corrigieron con recarga explícita antes de la ejecución final.
- En el mismo perfil aislado: `WEB_PROXY_CONFIG=proxy.e2e.conf.json npx playwright test e2e/events-real.spec.ts e2e/events.spec.ts e2e/consultations.spec.ts e2e/consultation-decisions.spec.ts e2e/calendar-events.spec.ts e2e/calendar-options.spec.ts e2e/availability.spec.ts e2e/accessibility-smoke.spec.ts e2e/mobile-journey.spec.ts --workers=2 --output=/tmp/synqo-evt005-related-real --reporter=list`: 54 PASS y dos timeouts iniciales. Ambos se repitieron sin cambiar código ni expectativas mediante `npx playwright test e2e/availability.spec.ts e2e/calendar-options.spec.ts --grep "marks today|at 1280px" --workers=1 --output=/tmp/synqo-evt005-retry-final --reporter=list`: 2/2 PASS. Quedan verificados los 56 casos relacionados, incluidos dos recorridos con Symfony/PostgreSQL y seis de uso móvil. Solo se usó la base de pruebas.
- La prueba de benchmark de arranque se adapta al acceso por menú; no se ejecuta el benchmark de correo en este Change de fichas. No hay cambios API ni de esquema que requieran repetir los checks PHP de la evolución anterior.
- Accesibilidad automatizada parcial: ESLint 10.12.0 y angular-eslint 21.4.0 con `templateAccessibility`, PASS; Playwright 1.63.0 verifica teclado, foco y reflujo en los viewports/temas indicados. No acredita conformidad WCAG global.
- `python3 pdi/scripts/validate_structure.py`, comprobación de enlaces relativos modificados y `git diff --check`: PASS. La regeneración de `apps/api/config/reference.php` al iniciar API de pruebas se retira por ser ajena al alcance.
- Regresión visual: `omitido_activamente` por instrucción vigente. No se ejecutan ni actualizan snapshots.

## Resultado de convergencia y cierre

`pdi:change-verify` y `pdi:change-converge`: PASS. Los menús y la preselección coinciden con la petición y los flujos/wireframes actualizados mediante `pdi:baseline-update`. Se corrigieron dos notas UX antiguas que todavía presentaban la integración con consultas como futura, enlazando su flujo vigente; las SPEC históricas permanecen intactas. No cambia ningún RF/RN, contrato, permiso ni efecto de dominio.

La revisión independiente detectó y verificó la corrección de dos detalles menores de foco: Escape tras salir del grupo con Tab y retorno al disparador antes de emitir la acción. La rama de resolución sin identidad está además protegida por el layout, que no renderiza la ficha sin participante; no se añade un harness artificial para una ruta inaccesible en E2E. No quedan BLOCKER, MAJOR, MINOR, decisiones ni drift abiertos. El componente local reutiliza Angular Forms existente; no requiere ADR.

**DONE — Change cerrado y archivado localmente el 2026-10-19 mediante `pdi:change-close`.** Siete criterios PASS. Sin nuevo commit ni despliegue. REL-004 conserva las regresiones visuales pendientes antes de su cierre y no se declara entregada.
