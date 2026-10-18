---
id: SPEC-EVT-003
nivel: N2
estado: ready_for_change_apply
release: REL-004
---

# SPEC-EVT-003 — Vincular eventos y consultas de fechas

## Objetivo

Permitir que una persona relacione una consulta de fechas abierta con un evento elegible, asigne al evento la fecha aceptada al resolverla y consulte desde ambas fichas las relaciones que deban conservarse.

**Clasificación N2:** amplía los casos de uso existentes de consultas y eventos en API y WEB, persiste una relación entre recursos y coordina varias mutaciones bajo las transacciones y el bloqueo de equipo ya establecidos.

## Scope

- Realizar [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md) y los criterios relacionados de [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md), [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md), [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md) y [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md).
- Permitir elegir un evento al crear una consulta de fechas y cambiar, retirar o elegirlo mientras la consulta siga abierta, incluida la elección durante la resolución. Las consultas de texto no admiten vínculo.
- Cuando la consulta queda vinculada a un evento sin fecha o con fecha provisional, aceptar exactamente una fecha y asignarla al evento como definitiva en la misma operación que cierra la consulta.
- Conservar y mostrar las relaciones cerradas entre consulta y evento en ambas fichas. Una vez cerrada una consulta, el evento puede vincularse a otra consulta de fechas abierta; las anteriores siguen visibles.
- Integrar las dos decisiones ya definidas para el rechazo de un evento con consulta abierta: desvincular la consulta y mantenerla abierta, o rechazar ambos y conservar la relación histórica.
- Integrar el caso excepcional en que se intenta resolver una consulta cuyo evento vinculado está rechazado: desvincular y aceptar una fecha, o rechazar la consulta. Cancelar no cambia ninguno de los dos.
- Mantener el comportamiento actual de consultas no vinculadas, incluida la aceptación de varias opciones.

## Fuera de scope

- El marcador de evento en el calendario y el detalle del día, que corresponden a [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md) y [SPEC-EVT-002 — Mostrar eventos en el calendario](spec-evt-002-eventos-en-calendario.md).
- La creación, edición, lista, ficha, rechazo y recuperación como capacidades independientes del evento, que corresponden a [SPEC-EVT-001 — Gestión de eventos del equipo](../99_archivadas/spec-evt-001-gestion-eventos-equipo.md). Esta SPEC depende de esa capacidad y solo añade las relaciones con consultas.
- Las consultas de opciones de texto y su resolución.
- Historial de cambios de vínculo mientras una consulta permanece abierta. Solo se conserva el vínculo vigente al cierre y las relaciones cerradas que decida el producto.
- Una referencia de evento en disponibilidad individual o en opciones de la consulta.

## Dependencias y orden

- Para iniciar la implementación de esta SPEC debe estar implementada y disponible [SPEC-EVT-001 — Gestión de eventos del equipo](../99_archivadas/spec-evt-001-gestion-eventos-equipo.md): entidad, ficha y operaciones de evento. La integración se implementa después de ese Change.
- Puede implementarse antes o después de [SPEC-EVT-002 — Mostrar eventos en el calendario](spec-evt-002-eventos-en-calendario.md); no comparte sus criterios de aceptación.
- La especificación puede prepararse en paralelo. No se altera el calendario ni se presupone que el Change de eventos ya esté entregado.

## Baseline relacionado

- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md), [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md), [RN-CON-002 — Resolución de una consulta abierta](../../03_requisitos/02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md).
- [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md), [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md), [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md), [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md), [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md), [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md), [RD-EVT-002 — Autoría y momentos del evento](../../03_requisitos/03_datos/EVT/rd-evt-002-autoria-momentos-evento.md).
- [FLUJO-CON-001 — Crear una consulta de fechas](../../04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md), [FLUJO-CON-003 — Resolver una consulta](../../04_experiencia-usuario/02_flujos/flujo-con-003-resolver-consulta.md), [FLUJO-EVT-003 — Vincular eventos y consultas de fechas](../../04_experiencia-usuario/02_flujos/flujo-evt-003-vincular-evento-consulta.md) y [WF-EVT-004 — Vincular evento y consulta de fechas](../../04_experiencia-usuario/03_wireframes/wf-evt-004-vincular-evento-consulta.md).
- [Estructura inicial del equipo](../../04_experiencia-usuario/01_arquitectura-informacion/estructura-equipo.md), [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md), [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md), [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md).
- [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md), [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md), [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).

## Módulos afectados

- API: ampliación de `ConsultationRecord`, repositorio y servicio; consultas elegibles; asignación atómica de evento y resolución; rechazo coordinado de evento/consulta; lectura de relaciones.
- WEB: selector opcional en creación de consulta de fechas; acciones de cambiar/retirar vínculo mientras está abierta; selección en resolución; confirmaciones y avisos de fecha definitiva/rechazo; navegación entre fichas.

## Criterios de aceptación

1. Al crear una consulta de fechas se puede dejar el vínculo vacío o elegir un evento del mismo equipo que no esté rechazado, no tenga fecha o tenga fecha provisional, y que no esté vinculado a otra consulta abierta. No se ofrecen eventos rechazados; primero hay que recuperarlos. La selección es opcional y forma parte de la creación confirmada de la consulta.
2. Mientras una consulta de fechas siga abierta se puede elegir otro evento elegible, retirar el vínculo o conservarlo. La selección puede realizarse antes de iniciar la resolución o durante ella. No se ofrecen como vínculo nuevo eventos rechazados, definitivos ni vinculados a otra consulta abierta. El servidor vuelve a comprobar equipo, vigencia, estado y elegibilidad al confirmar; un estado obsoleto no se presenta como guardado.
3. Un evento y una consulta abierta se vinculan como máximo entre sí. Una consulta cerrada conserva su vínculo histórico. El evento admite otra consulta de fechas abierta cuando sus consultas anteriores ya se cerraron.
4. Si una consulta de fechas queda vinculada al resolverla, para aceptarla se exige exactamente una opción. Si no está vinculada, se mantiene la aceptación de una o varias opciones.
5. Si se acepta una fecha para un evento que al confirmar sigue sin fecha o tiene fecha provisional, la fecha aceptada queda definitiva y la última modificación del evento se atribuye al participante que resuelve. El cierre de la consulta y la modificación del evento se confirman juntas o no se guarda ninguna.
6. Si el evento vinculado ya es definitivo antes de la confirmación, la interfaz lo advierte antes de confirmar que la consulta no cambiará su fecha. Si la resolución se confirma, se conserva el vínculo, se cierra la consulta y el evento no cambia. La confirmación envía `expectedEventVersion`, la versión del evento que se mostró en el aviso. El servidor la compara dentro de la transacción; si ya no coincide, responde conflicto sin cambios y la interfaz vuelve a cargar el estado actual para pedir una nueva confirmación.
7. Rechazar una consulta vinculada no modifica los datos ni el estado del evento. La consulta cerrada y el evento conservan su relación histórica navegable.
8. Si un evento está excepcionalmente rechazado y continúa vinculado al resolver, se ofrecen exactamente estas salidas: desvincularlo y resolver aceptando una fecha, o rechazar la consulta conservando el vínculo histórico. Cancelar no modifica evento ni consulta.
9. Al rechazar un evento con una consulta abierta vinculada, una confirmación ofrece exactamente: rechazar el evento y desvincular la consulta, que queda abierta; o rechazar ambos, conservando el vínculo histórico. Cancelar deja ambos sin cambios.
10. Desde la ficha de una consulta vinculada se puede abrir la ficha del evento; desde la ficha del evento se pueden abrir todas las consultas vinculadas ya cerradas, incluidas las rechazadas. Una consulta abierta vinculada se muestra desde el evento y permite abrirse.
11. El selector y la ficha presentan estados de carga, vacío, error y reintento; si no hay eventos elegibles se puede crear o resolver la consulta sin vínculo. Las acciones son utilizables con teclado y en los viewports de la matriz WEB; el foco se conserva y vuelve correctamente al cerrar diálogos.
12. Contratos, errores, seguridad Bearer y cambios de OpenAPI coinciden con los casos probados. Un fallo o conflicto concurrente no deja modificaciones parciales en consulta, evento, autoría, vínculo ni actividad del equipo.

## Impacto baseline esperado

Realización de reglas y requisitos existentes. La regla de que un evento rechazado debe recuperarse antes de ofrecerlo como vínculo nuevo está incorporada en [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md), [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md) y [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md). Si Research encuentra una discrepancia entre implementación y baseline, no se resolverá cambiando silenciosamente esta SPEC.

## Questions / Assumptions

### Decisión aprobada — eventos rechazados como vínculo nuevo

- **Pregunta:** si un evento rechazado pero sin fecha definitiva puede elegirse como vínculo nuevo.
- **Decisión:** no se ofrece para crear o cambiar un vínculo mientras esté rechazado; primero debe recuperarse. Esta exclusión aplica a vínculos nuevos. La excepción de un evento que ya estaba vinculado y se rechaza antes de resolver se mantiene, según [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md).
- **Origen:** respuesta expresa de la persona impulsora durante la preparación de SPEC-EVT-003; incorporada al baseline por `pdi:baseline-update`.

### Decisiones ya fijadas

- La relación aplica solo a consultas de fechas abiertas, admite un evento por consulta y una consulta abierta por evento, y se puede cambiar o retirar antes del cierre.
- No se ofrecen eventos rechazados ni definitivos como vínculo nuevo; el evento rechazado debe recuperarse antes de poder elegirlo. La fecha aceptada al resolver una consulta vinculada se vuelve definitiva si el evento sigue sin fecha o provisional.
- El participante que resuelve figura como última persona que modificó el evento al asignarle fecha. Cambiar únicamente el vínculo no modifica la autoría/fecha de modificación propia del evento.
- Rechazar una consulta no modifica el evento. Las consultas cerradas vinculadas se conservan y se navegan en ambos sentidos.
- En los diálogos de rechazo del evento y de resolución con evento rechazado se aplican exactamente las salidas recogidas en los criterios 8 y 9; cancelar deja el estado sin cambios.

### Decisiones de interacción de esta preparación

- En los formularios de creación y resolución se usará un control opcional para seleccionar evento, con acción clara para retirar la selección. En la ficha abierta se muestra el evento actual y acciones «Cambiar» y «Quitar».
- Si no hay eventos elegibles, el selector informa que se puede continuar sin vincular; no bloquea la consulta.
- La ficha de consulta muestra un enlace al evento; la ficha de evento agrupa las consultas relacionadas en un bloque propio, con enlaces a cada una. El bloque se omite cuando no hay relaciones.
- Los avisos de evento definitivo y rechazado se presentan antes de la confirmación final, dentro del recorrido de resolución; las acciones confirmadas siguen los criterios de aceptación.

## Research necesario

- **Código existente:** no hay modelo de eventos ni vínculo en `ConsultationRecord`. La creación y resolución actuales pasan por `ConsultationService`; sus mutaciones validan entrada y usan `TeamRepository::withLockedTeam`, que ejecuta una transacción Doctrine y aplica bloqueo pesimista a la fila del equipo. `OrmConsultationRepository` persiste consulta y resolución dentro de esa transacción. Esto permite serializar las mutaciones de un mismo equipo, siempre que los nuevos casos de evento usen el mismo límite transaccional.
- **Integridad de datos:** PostgreSQL es la base de datos. Propuesta: columna nullable `consultation.event_id` como relación ManyToOne desde consultas hacia eventos, que permite conservar cada vínculo histórico en la consulta cerrada; índice único parcial sobre `event_id` para las filas con `state = 'open'` para reforzar la regla de una consulta abierta por evento. La columna singular cumple la regla de como máximo un evento por consulta. Revalidar si el estado persistido o el modelo de migrations cambia en la SPEC-EVT-001 antes de implementar.
- **Contrato existente:** API Platform expone operaciones específicas vía `ConsultationOperations`/`ConsultationController`, el servicio coordina acceso, expiración y repositorios, y los errores se devuelven como Problem Details. La resolución vigente acepta múltiples IDs de opción y no conoce eventos; habrá que extender DTO/cuerpo OpenAPI y pruebas de integración.
- **Cliente existente:** `TeamApi` crea, lista y resuelve consultas; los componentes principales son `availability-calendar.ts`, `consultations-page.ts` y `consultation-detail.ts`. El formulario de consulta de fechas nace dentro del calendario; la de texto nace en Consultas. Solo el primero recibe selector de evento.
- **Seguridad y concurrencia:** todos los cambios usan Bearer, comprueban que consulta, evento y participante pertenecen al equipo verificado y respetan expiración. El bloqueo de equipo serializa crear/cambiar vínculo, resolver y rechazar evento; la restricción única parcial sirve como defensa ante una escritura concurrente o una ruta que omita el bloqueo.
- No se identifica necesidad de nueva dependencia ni cambio de arquitectura. La propuesta relacional se limita a la persistencia API ya definida y deberá validarse con el esquema/migraciones de SPEC-EVT-001.

## Design / Structure

### Modelo y operaciones API

- La consulta conserva un `event_id` nullable. Las consultas cerradas mantienen la relación para navegación histórica. No se añade historial de cambios de vínculo.
- Crear consulta de fechas acepta un `eventId` opcional. Solo se pueden vincular eventos del mismo equipo que no estén rechazados, sin fecha o con fecha provisional, y que no estén vinculados a otra consulta abierta. Una operación específica de vínculo modifica o elimina el evento de una consulta todavía abierta. La resolución admite tres estados de entrada para el campo de vínculo: ausente conserva el vínculo actual; UUID lo cambia/elegir; `null` lo retira. El contrato final debe reflejarse en OpenAPI y validar cada transición dentro de la transacción.
- En una consulta de fechas vinculada, resolver con aceptación exige una fecha exacta. Si el vínculo efectivo apunta a evento no fechado/provisional, el repositorio actualiza fecha, estado definitivo, participante y momento de última modificación junto con la resolución. El rechazo de consulta conserva el evento intacto.
- Si el evento vinculado es rechazado al resolver, la operación exige una decisión explícita: aceptar con desvinculación o rechazar la consulta conservando la relación. Si el evento se volvió definitivo, el cliente presenta aviso y confirma; la operación resuelve sin actualizar el evento. La confirmación envía `expectedEventVersion`, copiada del campo `version` recibido con el evento. El servidor lo compara dentro de la transacción; si no coincide con la versión actual, devuelve un conflicto tipado sin escrituras para que la persona vuelva a revisar y confirmar el estado actual. La versión aumenta con cada cambio real de los datos o el estado propio del evento y evita aceptar un aviso obsoleto aunque dos cambios compartan la misma marca temporal.
- La operación de rechazo de evento con consulta abierta recibe una disposición explícita. «Desvincular» mantiene consulta abierta sin vínculo; «rechazar ambas» cierra también la consulta y conserva la relación. Evento y consulta se modifican en la misma transacción.
- Reutilizar el acceso verificado del equipo, el límite de `withLockedTeam`, comprobaciones de pertenencia, vigencia y actor, y las respuestas JSON/Problem Details de las operaciones existentes. Las operaciones nuevas o extendidas deben describirse en OpenAPI.

### Integridad y concurrencia

- Las escrituras de los dos módulos de dominio comparten la transacción abierta por `withLockedTeam`. No se confirma una resolución sin la asignación del evento cuando ambas son necesarias.
- El bloqueo de la fila del equipo ordena operaciones concurrentes dentro del mismo equipo. Para el aviso de evento definitivo, la petición incluye `expectedEventVersion` y el servidor lo compara bajo el bloqueo con `version` actual; una diferencia devuelve conflicto sin escrituras y fuerza a revisar el aviso con el estado actual.
- Añadir índice único parcial PostgreSQL por evento para consultas abiertas; conservar la posibilidad de varias consultas cerradas para el mismo evento. Mantener FK y cascada de borrado de datos del equipo coherentes con el esquema de SPEC-EVT-001.
- Nunca modificar última modificación del evento al cambiar únicamente el vínculo. En la asignación de fecha, atribuir el cambio al participante de la resolución. Actualizar actividad del equipo solo tras una operación confirmada.

### WEB y experiencia

- Integrar el selector opcional en el formulario de consulta de fechas que ya vive en el calendario; no añadirlo al formulario de consultas de texto.
- En la vista de consulta abierta, mostrar el vínculo y permitir cambiarlo/quitarlo. La resolución conserva ese estado o permite seleccionar uno en el mismo recorrido. Con vínculo, limita aceptación a una fecha; sin vínculo, mantiene la selección múltiple existente.
- Mostrar las relaciones en ambas fichas mediante enlaces accesibles, conservar contexto y foco al regresar y ofrecer estados sin relaciones.
- Aplicar avisos previos a confirmación y diálogos de rechazo definidos en los requisitos y en [FLUJO-EVT-003 — Vincular eventos y consultas de fechas](../../04_experiencia-usuario/02_flujos/flujo-evt-003-vincular-evento-consulta.md) y [WF-EVT-004 — Vincular evento y consulta de fechas](../../04_experiencia-usuario/03_wireframes/wf-evt-004-vincular-evento-consulta.md). Los selectores de vínculos nuevos omiten eventos rechazados y definitivos; los eventos rechazados deben recuperarse primero. Se conserva la excepción de un evento que ya estaba vinculado.

## Plan por slices

1. **Relación y lectura API:** después de SPEC-EVT-001, incorporar el vínculo persistido, consultas por evento y validación de propiedad/elegibilidad; migración, integridad relacional y OpenAPI de lectura/creación.
2. **Creación y mantenimiento del vínculo:** selector opcional al crear consulta de fechas, listar elegibles, cambiar/quitar el vínculo durante el estado abierto, conflictos y revalidación bajo bloqueo.
3. **Resolución atómica:** selección de evento durante resolución, límite de una fecha si hay vínculo, asignación definitiva y autoría, evento ya definitivo y excepción de evento rechazado; cubrir cancelación y resolución rechazada.
4. **Rechazo del evento y navegación:** opciones de rechazo coordinado, persistencia histórica y enlaces desde fichas de eventos y consultas, en WEB y API.
5. **Validación y convergencia:** pruebas API/PostgreSQL y WEB/E2E, concurrencia, visual/responsive, OpenAPI y revisión independiente; matriz de aceptación.

## Evidencia / Validation

- **API unit/integración PostgreSQL:** crear vínculo y crear sin vínculo; solo consulta de fechas; cambio/retirada de vínculo; evento/consulta/participante ajenos al equipo; expiración; evento ya ligado a otra consulta abierta; reutilizar evento tras cerrar consulta; consultas cerradas mantienen vínculo; evento/consulta rechazados y recuperados según casos; uno vs varias fechas; evento provisional y definitivo; atribución de última modificación y aumento de versión, incluidos dos cambios dentro del mismo instante; cancelaciones y rollback.
- **Concurrencia:** dos consultas intentando vincular el mismo evento; cambio de vínculo simultáneo con resolución; rechazo de evento contra resolución; dos resoluciones concurrentes. Verificar serialización con el bloqueo del equipo y restricción única parcial sin filas parciales.
- **Contrato:** migraciones y `doctrine:schema:validate`; exportación OpenAPI; verificar respuestas JSON, `application/problem+json`, códigos de conflicto, autenticación Bearer y no cacheabilidad conforme a las operaciones actuales.
- **WEB unit/E2E Playwright:** crear consulta de fechas con/sin evento; cambiar/quitar vínculo; resolver con una fecha y sin vínculo con varias; aviso de evento definitivo; caso de evento rechazado; rechazo de evento con consulta abierta en cada salida; cancelar todos los diálogos; navegación en ambos sentidos e historial; recargar para verificar persistencia.
- **WEB calidad:** viewports 390×844, 768×1024 y 1280×800 y frontera 768/769; claro/oscuro; teclado/foco; estados de error/reintento; herramientas automatizadas de accesibilidad con versión, alcance y resultado, sin declarar conformidad WCAG global.
- Ejecutar checks definidos en `apps/api/composer.json` y `apps/web/package.json`, incluidos los tests API/web, análisis estático, lint, build y E2E que cubran el recorrido; documentar comandos ejecutables según el README local en el momento de aplicar.

## Convergence

- Actualizar OpenAPI y comprobar que contratos documentados y probados coinciden.
- Confirmar que las relaciones cerradas son navegables desde ambas fichas, vínculos abiertos únicos y no hay cambios parciales en decisiones concurrentes.
- Comprobar que la regla de elegibilidad y la excepción para eventos ya vinculados se reflejan de forma coherente en baseline, flujo, wireframe, API, WEB y pruebas.
- Mantener RF-EVT-004 y la visualización de calendario fuera de la aceptación de este Change.
- Al cerrar, enlazar la SPEC en REL-004 con el estado de delivery que permitan las evidencias; no marcar otros requisitos cumplidos por inferencia.

## Gate DoR

| Condición | Resultado | Evidencia |
|---|---|---|
| Objetivo, scope y exclusiones están identificados. | PASS | Scope y Fuera de scope; REL-004 y RF/RN enlazados. |
| Baseline y módulos afectados están consultados. | PASS | Baseline relacionado; READMEs de API y WEB; contratos actuales de consulta y equipo. |
| Investigación técnica justifica la solución propuesta. | PASS | `ConsultationService`, `OrmConsultationRepository`, `ConsultationRecord` y `OrmTeamRepository::withLockedTeam`; PostgreSQL y migraciones actuales. |
| Diseño, estructura, slices y validación están definidos. | PASS | Design / Structure, Plan por slices y Evidencia / Validation. |
| Dependencia de producto para aplicar está declarada. | PASS | SPEC-EVT-001 debe implementarse antes de este Change; no impide preparar contrato independiente. |
| No quedan decisiones funcionales bloqueantes pendientes. | PASS | La elección de eventos rechazados está resuelta en esta SPEC y registrada en RN-EVT-003, RF-CON-001 y RF-CON-004. |

**Resultado del gate:** PASS. El Change puede entrar en implementación después de que se entregue su dependencia SPEC-EVT-001.

## Resultado de preparación

**READY_FOR_CHANGE_APPLY.** El alcance, diseño, dependencia, estructura, slices y evidencia están definidos. No quedan decisiones funcionales bloqueantes; el evento rechazado debe recuperarse antes de ser ofrecido como vínculo nuevo, y la excepción del vínculo previo se mantiene. La implementación puede comenzar cuando SPEC-EVT-001 esté implementada y validada; esa validación local ya consta en REL-004. El despliegue de la release no es requisito previo. El calendario sigue fuera de este Change.
