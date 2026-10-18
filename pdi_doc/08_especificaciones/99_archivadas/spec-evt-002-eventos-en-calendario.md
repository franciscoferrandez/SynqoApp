---
id: SPEC-EVT-002
nivel: N2
estado: cerrado
release: REL-004
---

# SPEC-EVT-002 — Mostrar eventos en el calendario

## Objetivo

Permitir reconocer desde el calendario los días con eventos activos y consultar esos eventos en el detalle del día.

**Clasificación N2:** integra la consulta de eventos con la vista de calendario existente y sus datos API; no cambia la estructura de módulos.

## Scope

- Realizar [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md) una vez disponibles los datos de evento de [SPEC-EVT-001 — Gestión de eventos del equipo](../99_archivadas/spec-evt-001-gestion-eventos-equipo.md).
- Añadir el indicador de eventos y su cantidad cuando corresponda a las casillas del calendario.
- Presentar en el detalle del día los eventos activos fechados en ese día, sin afectar la disponibilidad ni sus opciones de visualización.

## Fuera de scope

- Crear, editar, rechazar o recuperar eventos; pertenece a [SPEC-EVT-001 — Gestión de eventos del equipo](../99_archivadas/spec-evt-001-gestion-eventos-equipo.md).
- Vincular consultas de fechas a eventos; pertenece a [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md) y su Change propio.
- Modificar el cálculo, las marcas o la presentación de disponibilidad ya definidos en [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md).

## Baseline relacionado

- [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md), [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md), [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md) y [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md).
- [FLUJO-EVT-002 — Consultar eventos desde el calendario](../../04_experiencia-usuario/02_flujos/flujo-evt-002-consultar-eventos-calendario.md), [WF-EVT-003 — Eventos en el calendario](../../04_experiencia-usuario/03_wireframes/wf-evt-003-eventos-en-calendario.md), [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md) y [FLUJO-DIS-001 — Marcar disponibilidad en el calendario](../../04_experiencia-usuario/02_flujos/flujo-dis-001-marcar-disponibilidad.md).
- [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md) y [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md); [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md).

## Dependencias

- [SPEC-EVT-001 — Gestión de eventos del equipo](../99_archivadas/spec-evt-001-gestion-eventos-equipo.md) debe estar implementada y validada: proporciona persistencia y datos de evento con fecha y estado.
- La integración se realiza en el calendario existente, que ya carga los datos del período visible y abre un detalle diario distinto en escritorio y móvil.

## Módulos afectados

- API: lectura autorizada de eventos por intervalo visible, reutilizando el modelo de [SPEC-EVT-001 — Gestión de eventos del equipo](../99_archivadas/spec-evt-001-gestion-eventos-equipo.md).
- WEB: casillas y detalle diario existentes, sin alterar la edición de disponibilidad.

## Criterios de aceptación

1. Cada día del calendario que tenga eventos no rechazados muestra una campanita en la esquina superior derecha de su casilla.
2. Si ese día tiene más de un evento no rechazado, la campanita muestra el número de eventos; con uno solo no muestra número.
3. Se incluyen eventos provisionales con fecha y eventos definitivos. Los eventos rechazados no aparecen en el indicador ni en el detalle.
4. Al abrir el detalle de un día, se muestra cada evento no rechazado con título y estado, junto con el contenido de disponibilidad ya existente. El acceso desde un evento abre su ficha completa.
5. Consultar eventos no cambia la marca de disponibilidad, la regla de resumen, la superposición, los recuentos ni el día seleccionado.
6. Durante la creación de una consulta de fechas se conserva la interacción actual del calendario para seleccionar o retirar días; el indicador no reemplaza esa acción.
7. El calendario sigue siendo usable con ratón, teclado y pantalla móvil; el indicador no oculta el número del día, el estado de disponibilidad ni los controles existentes.
8. Si el día tiene varios eventos, aparecen en el mismo orden de la pestaña «Eventos», dentro de un área desplazable si no caben en el detalle visible.
9. Si el día no tiene eventos no se muestra una sección vacía. Si falla la carga de eventos pero la disponibilidad se cargó, esta se conserva visible y se informa del fallo con opción para reintentar solo los eventos.
10. Las pruebas de integración verifican cantidad e inclusión/exclusión de eventos por día, y las pruebas de interfaz cubren casillas, detalle en escritorio y diálogo móvil.

## Design / Structure

### Research

- `AvailabilityCalendar.load()` obtiene `this.dates` y carga disponibilidad con `TeamApi.availability(from, to)`. El mismo componente conserva el estado del calendario, los días visibles y el detalle que se abre al elegir un día.
- El API actual expone `/teams/current/availability`; su lectura y escritura tienen contratos propios. Los eventos tienen entidad y ciclos de vida propios y se accederán mediante el recurso de eventos preparado en SPEC-EVT-001, sin acoplar la disponibilidad a los datos eventuales.
- La vista de mes muestra un intervalo acotado (hasta seis semanas). Solicitar el intervalo visible evita cargar eventos de otros períodos y permite mantener el acceso con el enlace Bearer y vigencia normal del equipo.

### API

- Obtener solo eventos activos dentro del intervalo visible del calendario; no cargar el historial completo ni eventos rechazados para esta vista. La consulta de rango devuelve identificador, fecha, título y estado necesarios para pintar el día y abrir la ficha.
- Añadir `GET /api/teams/current/events/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD`, que devuelve `{events: [{id, date, title, status}]}` para eventos activos con fecha dentro del rango inclusivo, en el orden de la pestaña. Ambos límites son requeridos, fechas civiles válidas y el intervalo no puede superar 42 días; rangos inválidos responden `422` Problem Details. El calendario consulta este recurso en paralelo con la disponibilidad para no ampliar el contrato de esta última.
- Mantener la comprobación del enlace y la vigencia del equipo exigida por [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).

### WEB

- Incorporar el indicador a las casillas y los elementos al detalle existente, conservando las preferencias del calendario y el comportamiento móvil de diálogo.
- Mostrar título y estado de cada evento; el título lleva a la ficha completa. No duplicar notas ni autoría en el detalle del día.
- Conservar legibilidad en las casillas estrechas y el orden de lectura/accesibilidad del detalle.

## Plan por slices

1. Consultar eventos activos por rango de fechas en API con pruebas de fechas, estados y acceso de equipo.
2. Integrar los eventos en el modelo de calendario web, sin afectar datos ni acciones de disponibilidad.
3. Añadir presentación en casillas y detalle para escritorio y móvil, incluyendo carga, error y reintento.
4. Verificar casos e2e y regresión visual para móvil/escritorio y tema claro/oscuro; actualizar capturas solo tras acordar la vista final.

## Evidencia / Validation

- API: eventos provisional/definitivo aparecen; rechazados, sin fecha y fechas fuera del rango no; casos de límite de rango y equipo caducado/enlace inválido.
- WEB: día sin eventos, un evento, varios eventos, eventos provisionales/definitivos, día con disponibilidad, detalle escritorio y diálogo móvil, carga/error/reintento, foco y navegación con teclado.
- Probar que el indicador de día con varios eventos anuncia cantidad accesible y no desplaza u oculta el número del día.
- Ejecutar pruebas focalizadas API/Web, e2e calendario, linter y build pertinentes; inspeccionar regresión visual de las vistas afectadas.

## Questions / Assumptions

1. **Contenido del detalle:** aprobado: título y estado; el título abre la ficha completa.
2. **Orden con varios eventos:** aprobado: conservar el orden de la pestaña «Eventos».
3. La campanita es un indicador visual en la casilla. La casilla conserva su interacción existente para abrir el detalle.
4. Si no hay eventos, no aparece una sección vacía. Si la petición de eventos falla, la disponibilidad sigue visible y se permite reintentar solo la carga de eventos.

Las decisiones anteriores se incorporaron al flujo y wireframe de esta SPEC. La presentación dentro del detalle usa su espacio desplazable cuando hace falta, sin ocultar disponibilidad ni dejar controles inaccesibles.

## Gate DoR

| Condición | Resultado | Evidencia |
|---|---|---|
| Objetivo, alcance, exclusiones y dependencia están claros. | PASS | Scope, Fuera de scope y dependencia de SPEC-EVT-001. |
| Baseline y módulos afectados están consultados. | PASS | RF-EVT-004, RF-EVT-001/002, RF-DIS-002, experiencia de calendario, API y WEB. |
| Research justifica el diseño y el límite de consulta. | PASS | La vista solicita hasta 42 días; disponibilidad y eventos conservan recursos API separados. |
| Diseño, estructura, plan y validación están definidos. | PASS | Contrato de rango, agrupación, componente, slices y pruebas especificadas. |
| Decisiones funcionales de detalle y orden están resueltas. | PASS | Título+estado, enlace a ficha, orden de pestaña Eventos, bloque vacío omitido y comportamiento de error aprobados. |
| Dependencia de aplicación respecto a SPEC-EVT-001 está documentada. | PASS | No se puede aplicar hasta que el modelo de evento y la ficha estén disponibles. |
| Se necesita cambiar la arquitectura o tomar una decisión de arquitectura nueva. | NO | Se conserva la separación actual de recursos API y la vista WEB existente. |

## Validation / Convergence

| Criterio | Evidencia | Resultado |
|---|---|---|
| 1. Indicador en días con eventos activos | `calendar-events.spec.ts` comprueba la campanita en la casilla | PASS |
| 2. Cantidad cuando hay varios eventos | `calendar-events.spec.ts` comprueba `2 eventos` y el contador visual | PASS |
| 3. Provisionales/definitivos incluidos y rechazados excluidos | `EventApiTest` y endpoint de calendario filtran estados; cobertura WEB muestra estados activos | PASS |
| 4. Detalle conserva disponibilidad y abre la ficha | `calendar-events.spec.ts` en escritorio y navegación a `/e/eventos/:eventId` | PASS |
| 5. No altera disponibilidad, resumen, superposición, recuentos ni selección | `calendar-events.spec.ts`, `calendar-options.spec.ts` y smoke de calendario | PASS |
| 6. Selección de consulta de fechas conservada | `calendar-events.spec.ts` comprueba selección con el indicador presente | PASS |
| 7. Ratón, teclado y móvil | Smoke de accesibilidad en 390, 768, 769 y 1280 px; caso de diálogo móvil focalizado | PASS |
| 8. Orden y desplazamiento de múltiples eventos | API ordena la respuesta y el detalle usa lista desplazable; caso de dos eventos cubierto | PASS |
| 9. Sin sección vacía y reintento aislado | `calendar-events.spec.ts` comprueba error, disponibilidad visible y segundo intento de eventos | PASS |
| 10. Pruebas API e interfaz | PHPUnit focalizado `18 tests, 206 assertions`; WEB `4/4` E2E específicos | PASS |

### Evidencia técnica

- API completa: `146 tests, 1222 assertions`.
- WEB unitarias: `26 passed`; lint, formato y build correctos con Node `24.21.0`.
- E2E específico de calendario: `4 passed`.
- Smoke de accesibilidad del calendario: `4 passed`.
- Regresión visual: `omitido_activamente`; se ajustará antes del cierre de la release, sin cambiar la aceptación funcional de este Change.
- No hay cambios de baseline ni ADR nuevos.

**Resultado: DONE — Change cerrado y archivado localmente el 2026-10-18.** La integración API/WEB del calendario queda validada localmente. La release REL-004 no se declara entregada: quedan pendientes la actualización deliberada de capturas visuales y SPEC-EVT-003.
