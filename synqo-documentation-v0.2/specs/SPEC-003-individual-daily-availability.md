# SPEC-003 — Registrar disponibilidad individual diaria

## Metadata

- Status: `Implemented`
- MoSCoW: `Must` (con el límite `Should` de configuración administrable fuera de esta slice)
- Owner: Product owner
- Created: 2026-09-28
- Last updated: 2026-09-28

## Goal

Permitir que un participante activo de un equipo rápido registre, consulte y modifique su disponibilidad general por día, conservando una distinción explícita entre los tres estados declarables y la ausencia de respuesta.

## Scope

- Disponibilidad propia por rango y actualización idempotente por día mediante `GET` y `PUT /teams/{teamRef}/availability/me`.
- `AvailabilityEntry`, `AvailabilityStatePolicy`, `UNANSWERED` derivado y el upsert único por equipo, participante y fecha.
- `SCR-12` para la disponibilidad propia: lista semanal operativa y calendario mínimo del mismo contexto temporal.
- Persistencia, autorización contextual, protección de mutaciones con cookie y pruebas de Slice 2.

## Non-goals

- Agregación colectiva, detalle nominal y ranking de coincidencias (SPEC-004).
- Solicitudes de disponibilidad (SPEC-007), decisiones/propuestas o modificación de sus respuestas.
- Configuración de estados para equipo administrable; no hay ruta administrable funcional en este slice.
- Franjas horarias, recurrencia, calendario externo, notificaciones e IA.

## Related requirements

### Functional requirements

- `RF-DIS-01` — indicar disponibilidad por fecha.
- `RF-DIS-02` — disponibilidad general exclusivamente a nivel de día.
- `RF-DIS-03` — soportar Disponible, Quizá y No disponible.
- `RF-DIS-04` — distinguir Sin respuesta.
- `RF-DIS-05` — equipo rápido usa los tres estados.
- `RF-DIS-06` — equipo administrable aplica su configuración; se preserva mediante `AvailabilityStatePolicy`, sin implementar administración en esta slice.
- `RF-DIS-07` — permitir modificar disponibilidad.
- `RF-DIS-08` — una modificación no altera respuestas de propuestas previas.
- `RF-DIS-09` — cada participante gestiona por defecto la propia disponibilidad.
- `RF-EQR-09` — conservar el contexto de equipo rápido durante actividad humana válida.

### Usability

- `RNF-US-04` — No disponible y Sin respuesta se distinguen inequívocamente.
- `RNF-US-05` — disponibilidad general y respuesta a propuesta son inequívocamente distintas.
- `RNF-US-06` — en móvil se pueden modificar varios días sin una pantalla por fecha.
- `RNF-US-07` — Calendario y Lista conservan el contexto temporal cuando sea posible.

### Accessibility

- `RNF-A11Y-01` — objetivo WCAG 2.2 AA.
- `RNF-A11Y-02` — operación por teclado y foco perceptible.
- `RNF-A11Y-03` — el color no es el único codificador de estado.

### Security / privacy

- `RNF-SEC-03` — autorización validada en servidor en toda operación sensible.
- `RNF-SEC-05` — impedir acceso entre equipos por enumeración o IDOR.
- `RNF-SEC-06` — no exponer tokens sensibles en URL, logs o telemetría.
- `RNF-PRIV-01` — minimizar PII, especialmente en equipos rápidos.
- `RNF-PRIV-03` — aislamiento estricto entre equipos.

### Performance / reliability / compatibility

- `RNF-PERF-01` — respuesta percibida como inmediata en condiciones normales.
- `RNF-REL-01` — reintentos accidentales no generan respuestas duplicadas.
- `RNF-COMP-01` — navegadores modernos de escritorio y móvil.
- `RNF-RESP-01` — diseño responsive mobile-first.

## Related user stories

- `HU-DIS-01` — Indicar disponibilidad.
- `HU-DIS-02` — Modificar disponibilidad sin alterar una respuesta de propuesta.

## Related flows / screens

- `UF-05` — Disponibilidad libre.
- `SCR-12` — Mi disponibilidad.

## Product and domain rules

- Sources: [`../product/07-business-rules.md`](../product/07-business-rules.md), `BR-DIS-01`..`BR-DIS-08`, `BR-ACT-01`..`BR-ACT-03`; [`../technical-design/13-domain/domain-design.md`](../technical-design/13-domain/domain-design.md) y [`../technical-design/13-domain/domain-invariants.md`](../technical-design/13-domain/domain-invariants.md).
- La disponibilidad general es por `LocalDate` en la zona IANA canónica del equipo. Solo se declaran `AVAILABLE`, `MAYBE` o `UNAVAILABLE`; `UNANSWERED` se deriva de la ausencia de entrada y nunca se acepta en escritura.
- En un equipo rápido los tres estados están siempre habilitados. `MAYBE` no equivale a `AVAILABLE`.
- La raíz de agregado es `AvailabilityEntry` por `Team + Participant + Date`; la frontera transaccional es el upsert de las entradas remitidas.
- Cambiar disponibilidad general no modifica respuestas específicas de propuestas, y actualizarla es actividad humana relevante para un equipo rápido. Las lecturas pasivas no renuevan actividad.

## Preconditions

- `SPEC-002` está `Verified`; existe una sesión de participante activa y contextual de un equipo rápido.
- La Design Baseline v1.2 (incluidos CR-001 y CR-002 aceptados) sigue activa. El Baseline Conformance Preflight debe pasar antes de marcar esta SPEC como `Verified`.
- La implementación posterior se autorizará en una rama `feat/SPEC-003-individual-availability` y seguirá `$synqo-sdd-implementation`.

## Functional behaviour

- Un participante lee únicamente sus entradas dentro de un rango `from`/`to`; una fecha sin fila se presenta como `UNANSWERED`, no como `UNAVAILABLE`.
- El participante puede seleccionar varios días y asignar o reemplazar su estado por `AVAILABLE`, `MAYBE` o `UNAVAILABLE`. El servidor aplica un upsert por `(teamId, participantId, localDate)` y devuelve el rango actualizado conforme al contrato.
- La misma `Idempotency-Key` para la misma operación y payload no duplica entradas ni efectos de actividad; un payload divergente con la misma clave se rechaza de forma segura.
- Una actualización válida renueva `lastRelevantActivityAt` de un equipo rápido como interacción humana intencional. Un `GET` de disponibilidad nunca la renueva.
- La lista semanal es la interacción primaria: cada fila ofrece Disponible, Quizá y No disponible mediante iconos `✓`, `?` y `×`, con verde, amarillo/anaranjado y rojo; la selección se enmarca en azul. Incluye navegación semanal anterior/siguiente, vuelta a hoy y resaltado perceptible del día actual.
- El calendario muestra un mes natural completo de lunes a domingo, completando la rejilla con días funcionales del mes anterior y siguiente en tono secundario. Cada día presenta únicamente el número y un recuadro de estado; al activarlo abre un diálogo para elegir los mismos tres estados. Volver a activar el estado seleccionado elimina su entrada y deriva `UNANSWERED`. La cabecera admite abreviaturas cortas o largas configurables en código. No incorpora agregados, candidatos ni detalle de otros participantes.

## Authorization

- Sources: [`../technical-design/15-authorization/authorization-rules.md`](../technical-design/15-authorization/authorization-rules.md) y [`../technical-design/15-authorization/authorization-matrix.md`](../technical-design/15-authorization/authorization-matrix.md).
- `availability.readOwn` y `availability.updateOwn` requieren una `ParticipantSession` válida, participante activo y coincidencia estricta entre sesión, `teamRef` y `teamId` cargados por servidor.
- El servidor deriva el participante desde la sesión; no acepta `participantRef` o identificadores de actor en el payload para elegir a quién modificar. Un administrador tampoco puede editar la disponibilidad de otra persona en MVP.
- La UI no sustituye los controles server-side. Las mutaciones con cookie aplican comprobación CSRF/origin ya establecida por la baseline.

## API contract

La fuente normativa es [`../technical-design/18-api/openapi.yaml`](../technical-design/18-api/openapi.yaml); se materializan sin ampliarlo:

- `GET /teams/{teamRef}/availability/me` (`getMyAvailability`): requiere participante contextual y parámetros `from` y `to`; responde `AvailabilityRange` con entradas declaradas del rango.
- `PUT /teams/{teamRef}/availability/me` (`putMyAvailability`): requiere participante contextual e `Idempotency-Key`; recibe `UpdateAvailabilityRequest` con `entries` no vacío de `{ date, status }` y responde `AvailabilityRange`.
- `DELETE /teams/{teamRef}/availability/me/{date}` (`clearMyAvailability`): requiere participante contextual e `Idempotency-Key`; elimina de forma idempotente la entrada propia de esa fecha y responde un `AvailabilityRange` vacío. La ausencia posterior de fila se deriva como `UNANSWERED`.
- `AvailabilityStatus` admite exclusivamente `AVAILABLE`, `MAYBE`, `UNAVAILABLE`. Todos los errores usan `application/problem+json` / `ProblemDetails`.

Como mínimo se cubren rango o fecha inválidos, estado no declarable/no habilitado, sesión ausente/expirada/revocada o de otro equipo, `teamRef` inexistente, CSRF/origin inválido e idempotencia en conflicto. No se implementan ni alteran los endpoints colectivos de SPEC-004.

## Data / persistence

- Crear la migración y entidad de `availability_entries` conforme a [`../technical-design/17-data-model/data-model.md`](../technical-design/17-data-model/data-model.md): UUID, `teamId`, `participantId`, `localDate`, `status`, `sourceRequestId` nullable y auditoría temporal.
- Mantener unicidad `(teamId, participantId, localDate)`, pertenencia del participante al equipo y validación de política de estados en dominio. `UNANSWERED` no se persiste.
- Crear los índices `idx_availability_team_date`, `idx_availability_participant_range` y `idx_availability_match_counts` definidos para soportar lectura propia y las slices posteriores.
- No crear `availability_requests` ni datos de propuestas; `sourceRequestId` permanece nulo en esta slice.

## UI behaviour

- `SCR-12` muestra estado de carga, vacío de entradas como `Sin respuesta`, error recuperable, sesión/permisos inválidos y controles para los tres estados declarables.
- Cada estado se expresa con nombre e icono además del color. Los controles y el diálogo son semánticos, navegables por teclado y anuncian errores y guardados de manera accesible.
- En móvil permite seleccionar/modificar varios días desde la lista semanal sin navegar a una pantalla independiente por día. La Lista navega por semanas y el Calendario por meses. Al cambiar Lista → Calendario muestra el mes actual si la semana contiene hoy; de otro modo, el mes del lunes visible. Al cambiar Calendario → Lista muestra la semana actual si el mes contiene hoy; de otro modo, la primera semana del mes visible.
- La pantalla aclara que esta es disponibilidad general por día; no representa una respuesta a propuesta ni muestra información colectiva.

## Errors and edge cases

- `UNANSWERED`, fechas sin formato `date`, rangos inválidos, entradas duplicadas ambiguas o un estado no habilitado se rechazan sin una mutación parcial.
- Una sesión de A contra `teamRef` B no puede leer ni actualizar datos de B y no recibe información de ese equipo.
- Reintentos de red con la misma clave y payload devuelven el resultado idempotente; la reutilización divergente devuelve conflicto seguro.
- Si una fecha no tiene entrada, la API conserva la ausencia y la UI la deriva como `Sin respuesta`; no se crea una fila para representarla.
- La escritura no consulta ni modifica `proposal_response_options`; tal independencia debe mantenerse aunque aún no existan propuestas en el sistema.

## Security / privacy considerations

- Aplicar los controles de sesión, CSRF/origin, validación de entrada, `ProblemDetails` seguro y minimización de logs establecidos en SPEC-002 y los ADR de seguridad vigentes.
- No exponer identificadores internos, tokens, cookies ni disponibilidad de terceros. Las rutas siempre aplican aislamiento por equipo en servidor.
- La actividad renovada solo procede de un `PUT` autorizado y exitoso; ni carga inicial, ni `GET`, ni preview/bot cuentan como actividad humana.

## Acceptance criteria

1. **Given** un participante activo de un equipo rápido, **when** declara uno o varios días, **then** puede guardar `Disponible`, `Quizá` o `No disponible` y recargar el rango conservando exactamente esos valores.
2. **Given** una fecha sin entrada, **when** se muestra en Lista o Calendario, **then** aparece como `Sin respuesta` y no como `No disponible`.
3. **Given** una entrada existente, **when** el participante cambia su estado, **then** el upsert reemplaza solo su entrada de ese día y conserva una única fila por equipo, participante y fecha.
4. **Given** una petición que intenta declarar `UNANSWERED`, **when** llega al servidor, **then** se rechaza con `ProblemDetails` y no persiste una fila.
5. **Given** una actualización de disponibilidad general, **when** existe una respuesta de propuesta para la misma fecha, **then** la actualización no lee ni cambia esa respuesta.
6. **Given** una sesión contextual del equipo A, **when** intenta leer o actualizar `/teams/{teamRefB}/availability/me`, **then** el servidor la rechaza sin revelar datos de B.
7. **Given** un reintento del mismo `PUT` con igual `Idempotency-Key` y payload, **when** se procesa de nuevo, **then** no crea duplicados ni un efecto de actividad adicional; con payload distinto devuelve conflicto seguro.
8. **Given** un `PUT` autorizado y exitoso en un equipo rápido, **when** termina, **then** renueva actividad relevante; un `GET` equivalente no la renueva.
9. **Given** una semana en Lista o un mes en Calendario, **when** se cambia de vista, **then** se transforma el contexto temporal según CR-002; la navegación anterior/siguiente y volver a hoy funciona, el día actual queda resaltado y los controles siguen siendo accesibles por teclado y no dependen solo del color.
10. **Given** una mutación con cookie contextual, **when** falta CSRF válido o el origin no está permitido, **then** se rechaza sin actualizar disponibilidad ni actividad.

## Required tests

### Unit

- `AvailabilityEntry` y `AvailabilityStatePolicy`: tres estados declarables, `UNANSWERED` derivado, política de rápido y zona horaria del equipo.
- Upsert por día, sustitución de estado, prohibición de `UNANSWERED` y ausencia de efectos sobre respuestas de propuesta.
- Validación de DTO/rango, idempotencia y clasificación de actividad humana frente a lectura pasiva.

### Integration / API

- PostgreSQL/Testcontainers: migración, enum/check, unicidad, pertenencia participante-equipo e índices de `availability_entries`.
- `GET` por rango y `PUT` con varias fechas, recarga persistente, upsert idempotente y rollback ante payload inválido.
- Contract tests OpenAPI para ambos endpoints y `ProblemDetails` en entradas/rangos/estados inválidos.
- Sesión ausente, expirada, revocada y cross-team; CSRF/origin, idempotencia y no exposición de datos ajenos.
- Actualización de actividad en `PUT` exitoso de rápido y ausencia de actualización en `GET`.

### UI/component

- Selector de iconos accesible, `Sin respuesta` inequívoco, edición de varios días, carga/error/sin sesión y persistencia visual tras recarga.
- Calendario mensual con días adyacentes funcionales, Lista semanal, transiciones de intervalo, navegación, hoy, resaltado de fecha actual, retirada por segunda pulsación, diálogo, teclado, foco perceptible y axe para `SCR-12`.

### E2E

- Playwright: participante entra en un equipo rápido, registra varios días con los tres estados, recarga y los conserva.
- Caso negativo: sesión del equipo A no lee ni actualiza disponibilidad del B; petición con CSRF inválido no muta datos.

## Documentation impact

- Actualizar este archivo, [`spec-register.md`](spec-register.md), [`../implementation/status.md`](../implementation/status.md) y los registros TFM vinculados a la preparación y verificación.
- Crear la guía inicial de formación [`../training/spec-003-individual-availability/README.md`](../training/spec-003-individual-availability/README.md).
- La retirada de una entrada sigue [`../changes/CR-001-clear-individual-availability.md`](../changes/CR-001-clear-individual-availability.md) y la transición de contexto/la segunda pulsación siguen [`../changes/CR-002-monthly-calendar-and-toggle-clear.md`](../changes/CR-002-monthly-calendar-and-toggle-clear.md), sin introducir un cuarto estado persistido. El calendario mensual y los días adyacentes se implementan conforme a [`../design/04-calendar/calendar-specification.md`](../design/04-calendar/calendar-specification.md).

## Implementation constraints

- Implementar solo tras autorización explícita con `$synqo-sdd-implementation`, en una rama `feat/SPEC-003-individual-availability`, y cerrar con `$synqo-verification`.
- Respetar React + TypeScript + Vite, NestJS + TypeScript, PostgreSQL + MikroORM, REST/OpenAPI, monolito modular y pnpm definidos por la baseline.
- Si el schema físico, una semántica de borrado de entradas, la política administrable o el contrato requieren una decisión no documentada, detenerse y abrir Change Control; no inventar un cuarto estado persistido ni una API para editar disponibilidad ajena.

## Out of scope

- SPEC-004 y posteriores, incluidas coincidencias, disponibilidad colectiva, solicitudes, decisiones, lifecycle jobs, notificaciones e IA.
- Configuración administrable de estados y cualquier edición de zona horaria con histórico.
- Account linking, directorio de participantes, recurrencia, franjas horarias y sincronización con calendarios externos.

## Traceability

- Requirements: `RF-DIS-01`..`RF-DIS-09`, `RF-EQR-09` y RNF enumerados arriba.
- User stories: `HU-DIS-01`, `HU-DIS-02`.
- Baseline: [`../project/design-baseline.md`](../project/design-baseline.md)
- Change Requests: [`CR-001`](../changes/CR-001-clear-individual-availability.md) y [`CR-002`](../changes/CR-002-monthly-calendar-and-toggle-clear.md) (Accepted).
- ADR: ADR-008, ADR-015 y ADR-022 (controles transversales de acceso y seguridad).
- Roadmap: [`../delivery/28-implementation-roadmap/vertical-slices.md`](../delivery/28-implementation-roadmap/vertical-slices.md) — Slice 2.
- Implementation commit: pending commit reference.
- Verification evidence: `E-011`, `E-012`.

## Implementation outcome

- Implementado funcionalmente conforme al calendario mensual ya especificado, incluidos días adyacentes funcionales en tono secundario dentro de la cuadrícula mensual.
- Deviations: `sourceRequestId` se persiste nullable sin FK hasta que SPEC-007 cree su tabla referenciada; no hay comportamiento expuesto ni cambio de contrato.
- Verification: pruebas unitarias, integración, E2E, migración y gates de calidad correctos el 2026-09-28; el cierre queda bloqueado hasta corregir el `Fail` del Baseline Conformance Preflight sobre la integración efectiva de MikroORM en la persistencia de negocio.
- Notes for TFM: SPEC preparada antes de código; la evidencia de authoring se registra como `E-010`.

## Definition of Done

Aplicar [`../development/definition-of-done.md`](../development/definition-of-done.md). Para esta slice: migración reproducible y constraints verificadas; autorización e IDOR, CSRF/origin e idempotencia cubiertos; `SCR-12` accesible y responsive; OpenAPI/DTOs sincronizados; y evidencia objetiva de `$synqo-verification` antes de marcar `Verified`.
