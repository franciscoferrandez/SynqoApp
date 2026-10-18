---
id: SPEC-EVT-001
nivel: N2
estado: ready_for_change_apply
release: REL-004
---

# SPEC-EVT-001 — Gestión de eventos del equipo

## Objetivo

Permitir que cualquier persona con acceso a un equipo cree, consulte, edite, rechace y recupere sus eventos desde una sección propia.

**Clasificación N2:** añade datos persistentes, reglas de dominio, operaciones API y nuevas pantallas WEB dentro de los módulos ya definidos. No incorpora integración externa ni cambia la arquitectura de módulos.

## Scope

- Realizar [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md), [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md) y el ciclo propio de rechazo/recuperación de [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md), sin la rama que requiere consulta abierta.
- Crear y editar los campos del evento conforme a [RD-EVT-001 — Datos del evento](../../03_requisitos/03_datos/EVT/rd-evt-001-datos-evento.md) y [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md).
- Mostrar lista y ficha, ordenar las agrupaciones y conservar autoría y momentos conforme a [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md) y [RD-EVT-002 — Autoría y momentos del evento](../../03_requisitos/03_datos/EVT/rd-evt-002-autoria-momentos-evento.md).
- Rechazar y recuperar eventos conforme a [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md).

## Fuera de scope

- La campanita y la información de eventos en el calendario, definidos por [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md). La regla de que los rechazados no cuentan para la campanita se verificará con ese Change.
- Crear, cambiar, retirar o navegar vínculos con consultas, definidos por [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md). El caso de rechazo cuando existe una consulta vinculada también queda para ese Change, porque este Change todavía no puede crear tales vínculos.
- En consecuencia, el criterio de [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md) que permite abrir consultas de fechas vinculadas no se declara realizado por esta SPEC; se completará al entregar la integración de [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md).

## Baseline relacionado

- [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md), [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md) y [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md).
- [RD-EVT-001 — Datos del evento](../../03_requisitos/03_datos/EVT/rd-evt-001-datos-evento.md), [RD-EVT-002 — Autoría y momentos del evento](../../03_requisitos/03_datos/EVT/rd-evt-002-autoria-momentos-evento.md), [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md) y [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md).
- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md).
- [FLUJO-EVT-001 — Consultar y gestionar eventos](../../04_experiencia-usuario/02_flujos/flujo-evt-001-gestionar-eventos.md), [WF-EVT-001 — Lista de eventos del equipo](../../04_experiencia-usuario/03_wireframes/wf-evt-001-lista-eventos.md) y [WF-EVT-002 — Ficha y edición de evento](../../04_experiencia-usuario/03_wireframes/wf-evt-002-ficha-evento.md).
- [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md), [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md) y [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md).

## Módulos afectados

- [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md) y [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md).
- [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md).

## Criterios de aceptación

1. Una persona con acceso al equipo vigente puede crear un evento con título y notas opcionales, con fecha o sin ella. Título, notas, fecha y estado cumplen los límites y reglas de [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md), [RD-EVT-001 — Datos del evento](../../03_requisitos/03_datos/EVT/rd-evt-001-datos-evento.md) y [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md).
2. En un evento activo sin fecha, el estado de planificación siempre es provisional. Al crear con fecha, provisional es el valor predeterminado, aunque la persona puede elegir definitivo. Se puede registrar una fecha pasada y cambiar la fecha y estado desde la ficha, incluso cuando la fecha sea definitiva. Un evento rechazado puede conservar cualquier fecha y usa «Rechazado» como estado de ciclo de vida; al recuperarlo pasa a provisional.
3. La lista y la ficha están accesibles desde una pestaña propia del equipo. La ficha presenta los campos del evento y la autoría y momentos requeridos por [RD-EVT-002 — Autoría y momentos del evento](../../03_requisitos/03_datos/EVT/rd-evt-002-autoria-momentos-evento.md); omite «última modificación» hasta el primer cambio real.
4. Los eventos sin fecha definitiva, incluidos los provisionales con fecha, aparecen en su grupo; los definitivos se dividen entre futuros y pasados según el día actual de la zona horaria del equipo. Un definitivo fechado hoy aparece en «Futuros».
5. Los futuros se ordenan por fecha ascendente y los pasados por fecha descendente. Cuando comparten fecha, aparece primero el modificado más recientemente. Los eventos sin fecha definitiva y rechazados se ordenan por última modificación descendente, usando creación si nunca se han modificado.
6. Cualquier persona con acceso puede rechazar eventos provisionales o definitivos. El evento pasa a «Rechazados» y conserva sus datos. No se puede editar mientras esté rechazado.
7. Cualquier persona con acceso puede recuperar un evento rechazado. Conserva la fecha que tenía y pasa a provisional; la lista refleja el grupo y orden correspondientes.
8. No hay borrado individual de eventos. La eliminación del equipo elimina los eventos dependientes según [RN-EQU-003 — Borrado de equipos caducados](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md) y las claves foráneas en cascada del modelo de datos.
9. Todas las operaciones verifican el enlace de acceso y la vigencia del equipo. Las mutaciones también comprueban que la identidad que las atribuye pertenece al equipo. Las fallas no dejan escrituras parciales ni actualizan autoría, última modificación o actividad del equipo como si el cambio hubiera ocurrido.
10. Editar un evento rechazado, rechazar uno ya rechazado o recuperar uno que no está rechazado responde `409` y no cambia datos. Un evento o participante que no pertenezca al equipo se trata como `404`; los campos inválidos responden `422` con violaciones por campo.
11. La experiencia implementa los flujos de creación, lectura, edición, rechazo y recuperación en móvil y escritorio, con teclado, foco, estados de carga/error y recuperación. La validación automatizada de accesibilidad se documenta sin declarar una auditoría WCAG global.
12. Contratos API, errores y autenticación se documentan en OpenAPI y coinciden con las respuestas probadas. La lista y ficha no ofrecen enlaces a consultas, y esta SPEC no acredita la campanita de [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md).

## Impacto baseline esperado

Realización de requisitos existentes, sin cambio normativo ni ADR nuevo. La cobertura de [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md) queda parcial hasta entregar el criterio de navegación a consultas vinculadas en el Change de [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md). Los criterios de [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md) condicionados por la campanita de [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md) también se validan en ese Change.

## Questions / Assumptions

No quedan decisiones abiertas sobre el alcance funcional de este Change: incluye crear, editar, consultar, rechazar y recuperar eventos sin vínculo con una consulta abierta. La lista muestra el grupo «Rechazados» y el detalle permite recuperar eventos; los casos que dependen de una consulta abierta quedan expresamente para SPEC-EVT-003.

### Decisiones de experiencia confirmadas

- Se pide confirmación antes de rechazar o recuperar un evento. La confirmación específica cuando hay una consulta abierta se prepara en el Change de integración con consultas.
- Si se sale de creación o edición con cambios sin guardar, se pide confirmación antes de descartarlos.
- Se omiten las notas vacías y las agrupaciones sin eventos. Si el equipo no tiene eventos, se conserva un estado vacío con invitación a crear el primero.

Estas decisiones se incorporaron también a [FLUJO-EVT-001 — Consultar y gestionar eventos](../../04_experiencia-usuario/02_flujos/flujo-evt-001-gestionar-eventos.md), [WF-EVT-001 — Lista de eventos del equipo](../../04_experiencia-usuario/03_wireframes/wf-evt-001-lista-eventos.md) y [WF-EVT-002 — Ficha y edición de evento](../../04_experiencia-usuario/03_wireframes/wf-evt-002-ficha-evento.md).

## Research necesario

- El análisis de código confirma que no existe aún modelo, persistencia ni endpoint de eventos. El patrón cercano es el recorrido de consultas, separado por recurso/Controller, servicio de aplicación, interfaz de repositorio y adaptador Doctrine.
- Para operaciones de equipo, usar la verificación Bearer establecida. Las mutaciones deben revisar vigencia dentro de `TeamRepository::withLockedTeam`, transacción que bloquea la fila del equipo; las fechas de agrupación usan la zona horaria obtenida con los datos del equipo.
- El esquema usa migraciones Doctrine versionadas, UUID y claves foráneas con `ON DELETE CASCADE` para datos dependientes del equipo. La guía API exige DTO/operaciones revisadas, reglas fuera del Controller, OpenAPI y Problem Details.
- La web obtiene datos mediante `TeamApi`, y las rutas del equipo comparten `TeamLayout`. Los recorridos E2E existentes usan Playwright y las pruebas API son de integración con PostgreSQL.
- La suite existente no tiene pruebas de eventos. Se añadirá cobertura focalizada nueva durante la implementación, junto a verificación de regresión visual para las pantallas afectadas.

## Design / Structure

### API y persistencia

- Añadir entidad Doctrine y tabla `team_event` con relación al equipo, participante creador, participante de última modificación opcional, momentos de creación/modificación, título, notas opcionales, fecha opcional, estado y una versión entera de concurrencia inicializada en 1. Usar fecha de calendario sin hora. El estado de respuesta es `provisional|definitive|rejected`: la regla de fecha nula a provisional se aplica a eventos activos; el rechazo es estado de ciclo de vida y puede conservar una fecha nula o presente. La recuperación deja el evento en provisional. Mantener la cascada de borrado desde el equipo; no añadir tabla de historial.
- Mantener reglas de longitud, fecha y estado en la capa de aplicación/dominio, no en el Controller. En eventos activos, una fecha ausente obliga estado provisional; creación con fecha usa provisional como valor predeterminado pero permite elegir definitivo; rechazo cambia el estado de ciclo de vida a rechazado y conserva fecha/datos; recuperación conserva la fecha y deja estado provisional. No ofrecer una operación de borrado individual.
- Exponer operaciones autenticadas y específicas mediante recurso/Controller, servicio, repositorio y adaptador Doctrine:
  - `GET /api/teams/current/events` devuelve `{unfinalized, future, past, rejected}`, cada grupo como lista de resúmenes `{id, title, date, status, lastModifiedAt, version}`, en el orden definido en [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md).
  - `GET /api/teams/current/events/{eventId}` devuelve `{event}` con resumen, `notes`, `createdBy`, `createdAt`, `lastModifiedBy`, `lastModifiedAt` y `version`.
  - `POST /api/teams/current/events` recibe `{participantId, title, notes?, date?, status?}` y responde `201 {event, expiresAt}`. `status` admite `provisional|definitive`; si se omite, vale `provisional`. Una fecha ausente obliga `provisional`.
  - `PUT /api/teams/current/events/{eventId}` reemplaza los campos editables con `{participantId, title, notes?, date?, status}` y responde `{event, expiresAt}`.
  - `PUT /api/teams/current/events/{eventId}/rejection` y `/recovery` reciben `{participantId}` y responden `{event, expiresAt}`.
  Las fechas usan `YYYY-MM-DD`; las respuestas usan `status: provisional|definitive|rejected`. Las mutaciones identifican al participante actor en el cuerpo y comprueban su pertenencia. No se expone la entidad Doctrine directamente.
- Errores con `application/problem+json`: `400` JSON mal formado, `401` falta de enlace Bearer, `404` equipo/evento/participante no encontrado, `409` transición o estado incompatible, `410` equipo caducado y `422` campos inválidos. Las respuestas llevan `Cache-Control: no-store`. Reflejar estos contratos en OpenAPI y verificarlos con pruebas API.
- Las escrituras se ejecutan en transacción bajo bloqueo de la fila de equipo, comprueban pertenencia de evento e identidad y verifican expiración. Registrar última modificación e incrementar la versión cuando cambian los campos propios o el estado del ciclo de vida; ambas operaciones ocurren juntas. Una petición sin cambio no debe fingir modificación ni incrementar la versión. La versión no se muestra como dato de producto y permite detectar cambios aunque ocurran en el mismo instante. La actividad del equipo se actualiza solo tras una mutación confirmada.
- El servicio agrupa las fechas definitivas usando la fecha actual en zona del equipo. No imponer unicidad por día: el baseline permite consultar eventos por fecha y el contador en calendario está fuera de esta SPEC.

### WEB

- Añadir ruta hija `eventos` en el equipo y la entrada «Eventos» al `TeamLayout`.
- Implementar una lista que consume los grupos de API y vistas de ficha/formulario para crear, editar, rechazar y recuperar. La representación de estados y errores sigue el sistema de diseño común; `TeamApi` es el único acceso HTTP, sin persistencia local de eventos.
- En creación y edición, mostrar título, notas opcionales, fecha y estado. Si no hay fecha, representar «Provisional» como estado fijo; al asignar una fecha permitir elegir provisional o definitivo. Si hay fecha al crear, iniciar con provisional seleccionado.
- Omitir notas vacías, grupos vacíos y la sección de última modificación antes del primer cambio real. Si no hay eventos, la lista mantiene la acción principal «Crear evento».
- Usar una vista de formulario de una columna que se adapta al ancho móvil y escritorio; cambios sin guardar piden confirmación al salir. Rechazar y recuperar también requieren confirmación.
- Aplicar los wireframes preparados y los estados de carga, error, reintento y foco descritos en los criterios. Las decisiones ya aprobadas están reflejadas en ellos; las variantes de composición visual se comprobarán con regresión visual antes de aceptar capturas.

## Plan por slices

1. **Modelo y persistencia API:** entidad, migración, restricciones de datos y repositorio; probar creación/lectura básica, autoría, límites de equipo y cascada.
2. **Casos de uso y contrato API:** validación, listados agrupados/ordenados, detalle, edición y transiciones de rechazo/recuperación; seguridad por enlace, transacción, expiración, Problem Details y OpenAPI.
3. **WEB de eventos:** navegación, lista vacía/agrupada, ficha, formulario de creación/edición y acciones de rechazo/recuperación; estados de carga, error y reintento, accesibilidad y adaptabilidad.
4. **Integración y regresión:** Playwright contra API/PostgreSQL, actualización deliberada de referencias visuales de las pantallas nuevas, validación de las regresiones en claro/oscuro y móvil/escritorio, revisión independiente y matriz de aceptación.

## Evidencia / Validation

- PHPUnit/PostgreSQL: límites de título/notas, fecha opcional/pasada, estado por defecto y coherencia, pertenencia de identidad/evento/equipo, Bearer ausente/incorrecto, equipo caducado, cambios y reintentos, agrupaciones y orden en límites de fecha/zona, transición rechazar/recuperar, fecha conservada y estado provisional tras recuperar, rollback ante fallo y cascada al borrar el equipo.
- Verificar `doctrine:migrations:migrate`, `doctrine:schema:validate`, análisis estático API y exportación OpenAPI contra los contratos probados.
- Playwright: crear, listar, abrir ficha, editar, cancelar/guardar, rechazar y recuperar; recargar y abrir desde otro contexto; verificar respuestas fallidas sin perder borradores relevantes ni mostrar cambios como confirmados.
- Revisar visualmente móvil/escritorio y tema claro/oscuro; ejecutar test visual normal y actualizar capturas solo tras aceptar la composición. Documentar herramienta automatizada de accesibilidad, versión, alcance y resultado, además de la revisión manual de teclado/foco.
- Comandos de referencia: `docker compose exec api composer test`, `composer cs:check`, `composer stan`, `composer rector:check`, `php bin/console lint:container`, `php bin/console doctrine:schema:validate`, `npm --prefix apps/web test`, `npm --prefix apps/web run test:e2e`, `npm --prefix apps/web run test:visual`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run format:check` y `npm --prefix apps/web run build`.

## Convergence

- Verificar que cada criterio dentro de scope apunta a requisitos y a evidencia; dejar explícito que la navegación de consultas y la campanita requieren Changes posteriores.
- Comprobar contrato, restricciones de base de datos, cascada de caducidad, matrices de pruebas y capturas visuales; resolver cualquier diferencia de baseline antes de cerrar.
- Actualizar REL-004 y el índice de trazabilidad al cerrar este Change conforme al gate PDI.

## Gate DoR

| Condición | Resultado | Evidencia |
|---|---|---|
| Objetivo, alcance y exclusiones están claros. | PASS | Scope y Fuera de scope delimitan gestión propia; calendario y vínculos con consultas van en Changes posteriores. |
| Baseline y módulos afectados están consultados. | PASS | RF/RN/RD, experiencia del equipo, y módulos API/WEB enlazados. |
| Research justifica el diseño técnico. | PASS | Recorrido de consultas, acceso por enlace, `withLockedTeam`, transacción, migraciones Doctrine y PostgreSQL examinados. |
| Diseño, estructura, slices y evidencia están definidos. | PASS | Secciones Design / Structure, Plan por slices y Evidencia / Validation. |
| Decisiones funcionales y de experiencia están resueltas. | PASS | Estado predeterminado, rechazar/recuperar, cancelar con cambios, notas/grupos vacíos y estado sin fecha incorporados a SPEC, FLUJO y WF. |
| Contrato API mínimo y estados de error están definidos. | PASS | Rutas, cuerpos, respuestas, códigos Problem Details, estados/transiciones y `no-store` especificados. |
| Dependencias y cobertura parcial se comunican sin declarar requisitos completos por inferencia. | PASS | Navegación a consultas y caso de rechazo con consulta abierta quedan para SPEC-EVT-003; campanita, para SPEC-EVT-002. |
| Se requiere un ADR o una decisión de arquitectura nueva. | NO | El diseño aplica arquitectura API/WEB y transacciones ya establecidas; no añade dependencia ni cambia módulos. |

**Resultado: READY_FOR_CHANGE_APPLY.** Esta SPEC cubre el ciclo propio de creación, edición, consulta, rechazo y recuperación del evento. No acredita todavía los criterios condicionados a vínculos de consulta ni su aparición en el calendario.
