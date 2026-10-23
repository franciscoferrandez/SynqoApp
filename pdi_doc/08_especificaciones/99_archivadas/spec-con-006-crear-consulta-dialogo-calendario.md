---
id: SPEC-CON-006
nivel: N1
estado: cerrada
release: REL-005
---

# SPEC-CON-006 — Crear consultas desde el calendario con el diálogo compartido

## Objetivo

Reutilizar el diálogo de creación de consultas de fechas desde el botón de la esquina superior derecha del calendario, por petición expresa de la persona impulsora del 2026-10-21. Preparar el Change, resolver interactivamente lo necesario e implementar después de superar el gate.

## Clasificación

Evolución N1 del recorrido WEB. Reutiliza creación, validaciones y persistencia existentes, sin cambiar el contrato API ni requerir migración. Preparación completada mediante `pdi:change-new` y `pdi:change-prepare`; decisiones expresas consolidadas mediante `pdi:baseline-update` antes de `pdi:change-apply`. Entrega objetivo: [REL-005 — Ajustes de funcionalidad de consultas](../../01_producto/10_entregas/rel-005-ajustes-funcionalidad-consultas.md).

## Scope

El botón de creación de fechas del calendario abre directamente el diálogo de fechas ya disponible desde Consultas, sin elección de tipo. Sustituir su compositor anterior por el componente compartido, incluyendo selección por calendario, preferencias de lectura, campanita sin tick ni contadores, título y switch opcional de evento provisional. Adoptar el guardado directo y la cancelación con descarte del diálogo ya aprobado, con el contexto inicial y la navegación final acordados abajo.

## Fuera de scope

Cambios en API, esquema, votos, edición de consultas, cálculo de disponibilidad, preferencias del calendario principal o ciclo de vida de eventos. No refactorizar fuera de la retirada del compositor sustituido y la integración del componente. Sin commit ni ejecución/actualización de regresión visual automática.

## Baseline relacionado

- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md).
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md).
- [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md).
- [FLUJO-CON-001 — Crear una consulta de fechas](../../04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md).
- [FLUJO-CON-006 — Crear una consulta de fechas desde Consultas](../../04_experiencia-usuario/02_flujos/flujo-con-006-crear-consulta-fechas-desde-consultas.md).
- [WF-CON-004 — Crear una consulta de fechas](../../04_experiencia-usuario/03_wireframes/wf-con-004-crear-consulta-fechas.md).
- [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](../../04_experiencia-usuario/03_wireframes/wf-con-008-calendario-dialogo-consultas-fechas.md).
- [SPEC-CON-005 — Calendario en consultas de fechas](spec-con-005-calendario-en-consultas-fechas.md), contexto histórico de la solución compartida validada.

## Módulos afectados

[WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md).

## Questions / Assumptions

Respuestas expresas del 2026-10-21:

- Abrir en el mes que se está viendo en el calendario principal.
- Comenzar sin fechas seleccionadas; no incluir automáticamente el día cuyo detalle esté abierto.
- Tras guardar, ir a la lista de Consultas, como en el recorrido anterior.

No hay preguntas funcionales pendientes. La nueva petición autoriza sustituir el compositor por el mismo diálogo validado; se conservan creación directa, evento opcional y cancelación del formulario compartido. Sin autorización para commit ni regresión visual automática.

## Research

El calendario inicia actualmente un panel de creación y requiere confirmación; la nueva petición sustituye ese recorrido. `availability-calendar.ts` concentra el compositor, selección temporal y confirmaciones antiguas. `consultation-date-editor.ts` ya implementa el diálogo compartido con creación directa; `consultations-page.ts` recibe su resultado, actualiza caducidad y carga consultas. Los cambios acumulados anteriores siguen sin commit y deben conservarse.

## Design / Structure

Consolidación mediante `pdi:baseline-update` del requisito y los wireframes/flujos enlazados: ambas entradas reutilizan el diálogo, creación directa y cancelación con descarte. Sin cambios de contrato API, autorización, reglas de dominio ni esquema. Se mantiene la propuesta visual ya aprobada: no hace falta otro mockup al reutilizar el componente sin alterar su composición.

Añadir a `ConsultationDateEditor` una entrada opcional `initialMonth` para creación, validada como mes civil; el valor por defecto sigue siendo el mes de hoy en Consultas y la carga de edición conserva su comportamiento. El padre Calendario le pasa el mes visible al abrir. No precargar opciones ni propagar cambios de mes o selección del borrador al padre.

Integrar el componente con carga diferida como en Consultas, incluyendo estados de carga/error. Sustituir por `showDateEditor` el estado antiguo de composición y retirar únicamente su formulario, confirmaciones, métodos y CSS exclusivo. El calendario principal recupera su selección habitual de detalle y no actúa como editor de fechas. Mantener la disponibilidad y eventos, sus preferencias, llamadas, reintentos y estados existentes.

Cerrar el diálogo nativo de detalle móvil antes de abrir el formulario si estuviera abierto, conservando el día seleccionado. Al cancelar/descarte se destruye el borrador y se devuelve foco al botón de creación sin alterar mes/día/preferencias. Al crear se actualiza caducidad, se cierra el formulario y se navega a `/e/consultas` con `preserveFragment: true`; sin nueva llamada de creación ni confirmación del padre. El hijo conserva sus guardas de envío y borrador ante errores.

Conservar los cambios acumulados de la evolución anterior sin commit. Propiedad de escrituras disjunta: código/CSS/unitarias, E2E y documentación.

## Criterios de aceptación

1. El botón existente abre directamente el diálogo de fechas compartido, sin selector de tipo ni compositor lateral/inferior ni confirmación general de creación.
2. Abre en el mes visible, incluidas vistas históricas/futuras y semanas completas, con título y selección vacíos aunque hubiera un día abierto. Los días pasados nuevos siguen deshabilitados.
3. Conserva preferencias de semanas/regla y el calendario compacto del equipo: selección por contorno sin tick, campanita sin contadores, sin edición de disponibilidad ni preferencias dentro del diálogo.
4. Crear guarda una vez con los límites y evento opcional vigentes; actualiza caducidad y lleva a la lista de Consultas conservando el fragmento de acceso. El nuevo elemento aparece en Abiertas.
5. Cancelar/Escape sin borrador cierra directamente; con cambios confirma descarte y permite continuar. Conserva mes/día/preferencias del calendario de fondo y devuelve foco al botón, sin llamadas de escritura.
6. Errores de carga/guardado y reintentos conservan el borrador, selección entre meses y estado del switch; no dejan eventos huérfanos ni envíos duplicados.
7. Desde Consultas la creación continúa en el mes actual y conserva elección de tipo, creación/edición, identidades y navegación. Disponibilidad, detalle diario y eventos del calendario principal mantienen su comportamiento.
8. Tests WEB, lint, formato y build, E2E focalizados y relacionados/reales y revisión independiente pasan; teclado, foco y reflujo en cuatro anchuras y ambos temas. Sin nuevas dependencias ni cambios de API/esquema ni snapshots automáticos.

## Plan por slices

1. **MEDIUM**, integración WEB y retirada del compositor sustituido: `availability-calendar.ts`, entrada opcional de `consultation-date-editor.ts`, unitarias relacionadas y CSS exclusivamente obsoleto. Reutilizar el hijo; no duplicar su lógica.
2. **LOW**, E2E nuevos y adaptación de recorridos del calendario al diálogo y guardado directo, conservando evidencia de creación, opciones/vínculo, cancelación, errores y disponibilidad. Código y pruebas se delegan con propiedad disjunta.
3. **LOW**, checks reales aplicables y revisión independiente. El agente principal conserva las decisiones de producto, criterios, convergencia y cierre. Matriz `Acceptance criterion | Evidence | Result`; no cerrar con FAIL/UNKNOWN ni hallazgos graves.

## Evidencia / Validation

Estrategia ejecutada: unitarias WEB, lint, formato y build con `source "$HOME/.nvm/nvm.sh" && nvm use` desde raíz. E2E focalizados del botón, contexto inicial, selección, creación/evento, cancelación/foco, errores y navegación, seguidos de regresiones relevantes de calendario y consultas. No ejecutar regresión visual automática. Comprobar estructura, enlaces y diff. Resultados concretos en la sección siguiente.

## Gate de preparación

**PASS — READY_FOR_CHANGE_APPLY**, 2026-10-21. Tres decisiones respondidas, baseline y experiencia consolidados, módulo definido, integración/alcance y criterios cerrados. Reutilización del diseño ya aprobado, sin otra decisión visual pendiente. Mantener trazabilidad por autorización expresa vigente. La implementación se autoriza por la petición de preparar y finalmente implementar, sin commit ni regresión visual automática.

## Verificación de implementación — 2026-10-21

| Acceptance criterion | Evidence | Result |
|---|---|---|
| 1. Entrada directa al diálogo compartido | [Integración del calendario](../../../apps/web/src/app/pages/availability-calendar.ts) y [E2E del recorrido](../../../apps/web/e2e/date-consultations.spec.ts): abre el componente compartido y envía directamente; retirados compositor y confirmación antiguos. | PASS |
| 2. Mes visible y borrador vacío | E2E con mes futuro e histórico, semanas completas y detalle abierto; título vacío, ninguna fecha preseleccionada y pasado deshabilitado. [Unitarias del editor](../../../apps/web/src/app/pages/consultation-date-editor.spec.ts) cubren mes inicial válido, respaldo y entrada ignorada en edición. | PASS |
| 3. Preferencias y representación compacta | E2E de fechas y [eventos del calendario](../../../apps/web/e2e/calendar-events.spec.ts): preferencias guardadas, campanita en día seleccionado, sin tick ni contadores ni controles de preferencias dentro del diálogo. | PASS |
| 4. Guardado, evento y navegación | E2E verifica un POST, límite de diez fechas, selección entre meses, evento opcional, nueva consulta en Abiertas y fragmento conservado. [Prueba con API y PostgreSQL](../../../apps/web/e2e/events-real.spec.ts) crea desde Calendario y resuelve el evento vinculado como definitivo. | PASS |
| 5. Cancelar, descarte, contexto y foco | E2E de fechas cubre Escape limpio, continuar editando, descarte y foco recuperado; calendario conserva mes, día seleccionado y preferencias sin escrituras. | PASS |
| 6. Errores y reintentos | E2E de fechas, [diálogo desde Consultas](../../../apps/web/e2e/consultation-dates.spec.ts) y unitarias: error de carga/escritura conserva borrador, fechas entre meses y switch; guarda única sin duplicar lógica del padre. | PASS |
| 7. Regresiones de Consultas y calendario | 33 E2E de creación/edición de fechas y texto PASS; disponibilidad, preferencias, eventos y recorrido móvil pasan también. Creación/edición desde Consultas y creación/resolución desde Calendario verificadas con API real. | PASS |
| 8. Checks, revisión y accesibilidad parcial | Checks WEB PASS y revisión independiente REVIEW_OK. El caso responsive de [diálogo compartido](../../../apps/web/e2e/consultation-dates.spec.ts) cubre cuatro anchuras y ambos temas dentro de los 33 PASS; otros 32 casos verifican vínculos/eventos, teclado y foco. Sin API/esquema/dependencias/snapshots nuevos. | PASS |

### Comandos y resultados

- Checks WEB con NVM desde raíz, Node 24.21.0/npm 11.19.0: `npm test`, `npm run lint`, `npm run format:check` y `npm run build`: **43 unitarias PASS**, lint, formato y build PASS. Inicial **494,97 kB**, editor de carga diferida **21,10 kB**, presupuesto conservado y sin nuevas dependencias.
- Desde `apps/web`, `npx playwright test e2e/date-consultations.spec.ts e2e/event-consultations.spec.ts e2e/calendar-events.spec.ts e2e/event-consultations-responsive.spec.ts`: 58 casos distintos verificados. Primer pase 57/58; el único fallo era una expectativa de mensaje antigua, corregida y revalidada con `date-consultations.spec.ts` y `calendar-events.spec.ts`, **10/10 PASS**. La matriz responsive aporta 32 casos en 390×844, 768×1024, 769×1024 y 1280×800, claro/oscuro, teclado y foco; no acredita conformidad WCAG global.
- `npx playwright test e2e/consultation-dates.spec.ts e2e/consultations.spec.ts e2e/consultation-editing.spec.ts e2e/consultation-editing-responsive.spec.ts --workers=2 --output=/tmp/synqo-con006-consultations --reporter=list`: **33/33 PASS**, incluidos creación desde Consultas en el mes actual, edición y retiradas votadas.
- Prettier sobre los siete E2E adaptados PASS. Comprobación suplementaria de TypeScript de los seis recorridos adaptados (`tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --esModuleInterop --skipLibCheck`) PASS, sin modificar configuración ni dependencias.
- No hay cambios API/esquema en este Change: se reutiliza el contrato existente. Los cambios API acumulados pertenecen al Change anterior y se conservan. Sin regresión visual automática ni snapshots; pendiente de release por instrucción vigente. Sin commit ni despliegue.
- Con NVM activado, `docker compose --profile e2e up -d api-e2e` y `docker compose run --rm --no-deps --user "$(id -u):$(id -g)" -e HOME=/tmp -e npm_config_cache=/tmp/npm-cache web-visual-test bash -lc 'WEB_PROXY_CONFIG=proxy.e2e.conf.json npx playwright test e2e/events-real.spec.ts e2e/mobile-journey.spec.ts e2e/consultation-dates-real.spec.ts --workers=1 --output=/tmp/synqo-con006-real --reporter=list'`: nueve PASS y un fallo de fixture por variable `date` eliminada en la adaptación. Se restaura la variable sin cambiar producto. Las dos pruebas reales de fechas y los seis casos móviles pasan.
- Repetición en el mismo perfil aislado, sin resetear datos: `npx playwright test e2e/events-real.spec.ts e2e/availability.spec.ts e2e/calendar-options.spec.ts --workers=1 --output=/tmp/synqo-con006-real-retry --reporter=list`, con el mismo contenedor/proxy: **18/18 PASS**, incluidos los dos eventos reales, siete casos de disponibilidad y nueve de preferencias. La creación desde Calendario con evento provisional y su resolución se verifican íntegramente en PostgreSQL. Servicio temporal `api-e2e` detenido al terminar. No se modifica configuración autogenerada de API.
- Estructura PDI y referencias de artefactos PASS; enlaces locales de documentos modificados PASS; `git diff --check` PASS. Las fixtures antiguas se adaptan al diálogo compartido, incluido el benchmark; no se ejecuta el benchmark de rendimiento/correo completo, ajeno al alcance funcional.

## Convergencia y cierre — 2026-10-21

`pdi:change-verify`: **PASS — READY_FOR_CHANGE_CONVERGE**, ocho criterios PASS. `pdi:change-converge`: **PASS — READY_FOR_CHANGE_CLOSE**. La intención aprobada, el baseline consolidado, el diálogo compartido y los tests coinciden. Se retira el compositor sustituido y sus expectativas antiguas, sin cambiar reglas de consulta, eventos ni disponibilidad. No queda drift significativo ni decisión arquitectónica pendiente; sin ADR.

**DONE — Change cerrado y archivado localmente mediante `pdi:change-close`.** Matriz y revisión independiente sin hallazgos pendientes; enlaces e índice de trazabilidad reparados. [REL-005 — Ajustes de funcionalidad de consultas](../../01_producto/10_entregas/rel-005-ajustes-funcionalidad-consultas.md) registra la capacidad VALIDADO localmente y sigue abierta. No se presupone aceptación de la persona impulsora del nuevo recorrido ni despliegue. Regresión visual de release pendiente por instrucción vigente. Sin commit.
