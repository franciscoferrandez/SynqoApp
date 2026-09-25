# SPEC-002 — Crear equipo rápido y acceso de participante

## Metadata

- Status: `Ready`
- MoSCoW: `Must`
- Owner: pendiente de asignación humana
- Created: 2026-09-25
- Last updated: 2026-09-25

## Goal

Permitir que un visitante cree un equipo rápido sin cuenta ni email, obtenga una identidad local contextual y comparta un enlace público desde el que otro visitante pueda identificarse sin cuenta y acceder al inicio del equipo.

## Scope

- Crear exclusivamente equipos de modalidad `QUICK`, activos desde su creación, con nombre, zona horaria IANA y participante inicial.
- Crear en la misma transacción el equipo, el participante inicial, el acceso público inicial y la `ParticipantSession` contextual del creador.
- Exponer el contexto público mínimo de un equipo accesible y permitir que un visitante cree su propia identidad local desde ese contexto.
- Emitir sesiones opacas, revocables y acotadas a `teamId + participantId`; las mutaciones que usan cookies aplican la protección CSRF/origin definida en la baseline.
- Permitir que creador y segundo participante carguen su propio participante y el inicio contextual mínimo del equipo.
- Persistir `teams`, `participants`, `participant_sessions` y los `access_credentials` necesarios para el enlace público, con migraciones y constraints del modelo lógico.
- Implementar las pantallas/estados mínimos de `SCR-02`, `SCR-03`, `SCR-06` y el primer `SCR-11`: creación rápida, compartir/acceder, identificación, inicio del equipo y estados de enlace inválido, error, carga y sin sesión.
- Aplicar idempotencia y controles antiabuso a las creaciones públicas incluidos en las fuentes de seguridad.

## Non-goals

- Crear equipos administrables, verificar emails, otorgar administración o implementar configuración de equipo.
- Crear cuentas globales, login, vinculación de cuenta o reclamar participantes por nombre.
- Implementar disponibilidad, solicitudes, propuestas, encuestas, directorio de participantes, desactivación, actividad de producto o resolución.
- Implementar enlaces identificados, verificación/recovery, su revocación o la UI de creación de enlaces personalizados; solo se soporta el acceso público inicial requerido para compartir el equipo.
- Implementar jobs, transiciones completas `ACTIVE → RECOVERABLE → EXPIRED`, reactivación o purga. La creación debe dejar los datos necesarios para que SPEC-010 los implemente sin alterar este contrato.

## Related requirements

### Functional requirements

- `RF-ID-01` — Uso esencial sin cuenta.
- `RF-ID-03` — Participante existente sin cuenta.
- `RF-ACC-01` — Abrir un equipo accesible mediante enlace directo.
- `RF-ACC-04` — El enlace directo no concede capacidades superiores a la identidad autorizada.
- `RF-ACC-05` — Zona horaria IANA canónica para cada equipo.
- `RF-EQR-01` — Crear equipo rápido sin cuenta ni email.
- `RF-EQR-02` — Vida limitada obligatoria para el equipo rápido.
- `RF-EQR-09` — Los tres estados de disponibilidad permanecen habilitados en un equipo rápido.
- `RF-PA-01` — Identidad inequívoca dentro del equipo.
- `RF-PA-02` — Participación sin cuenta.

### Non-functional requirements

#### Usability

- `RNF-US-01` — Operaciones principales con fricción mínima y sin registro cuando procede.
- `RNF-US-02` — Modalidad rápida/administrable perceptible.
- `RNF-US-03` — Carácter temporal del equipo rápido visible sin ser intrusivo.

#### Accessibility

- `RNF-A11Y-01` — Objetivo WCAG 2.2 AA.
- `RNF-A11Y-02` — Creación e identificación usables por teclado y con foco perceptible.
- `RNF-A11Y-03` — Los estados no dependen exclusivamente del color.

#### Security

- `RNF-SEC-01` — El enlace público no es prueba de administración.
- `RNF-SEC-02` — No apropiación de participante por identificadores o nombres públicos.
- `RNF-SEC-03` — Autorización server-side en operaciones sensibles.
- `RNF-SEC-04` — Accesos revocables cuando el modelo lo permita.
- `RNF-SEC-05` — Prevención de acceso entre equipos por enumeración o IDOR.
- `RNF-SEC-06` — No exposición innecesaria de tokens en URLs, logs o telemetría.

#### Privacy

- `RNF-PRIV-01` — Minimización de PII, especialmente en equipos rápidos.
- `RNF-PRIV-02` — Eliminación o anonimización irreversible tras expiración definitiva.
- `RNF-PRIV-03` — Aislamiento estricto entre equipos.

#### Reliability

- `RNF-REL-01` — Reintentos accidentales no duplican operaciones.

#### Compatibility / responsive

- `RNF-COMP-01` — Navegadores modernos de escritorio y móvil.
- `RNF-RESP-01` — Diseño responsive mobile-first.

## Related user stories

- `HU-EQ-01` — Crear equipo rápido sin registro ni email.
- `HU-EQ-03` — Acceder por enlace público sin cuenta.

## Related flows / screens

- `UF-01` — Crear equipo rápido.
- `UF-03` — Acceso público.
- `SCR-02` — Crear equipo: modalidad (solo la entrada hacia rápido; administrable no se implementa).
- `SCR-03` — Crear equipo rápido.
- `SCR-06` — Identificación al acceder.
- `SCR-11` — Inicio de equipo, alcance inicial sin pendientes ni funcionalidades posteriores.

## Product and domain rules

- Source: [`../product/07-business-rules.md`](../product/07-business-rules.md), `BR-EQ-01`, `BR-EQ-02`, `BR-EQ-05`, `BR-EQ-07`..`BR-EQ-11`, `BR-PA-01`, `BR-PA-02`, `BR-PA-04`, `BR-DIS-04` y `BR-ACT-01`..`BR-ACT-03`.
  - El equipo creado es exclusivamente `QUICK`, no tiene administración formal, conserva una zona IANA canónica y habilita siempre `AVAILABLE`, `MAYBE` y `UNAVAILABLE`.
  - Un participante pertenece a un único equipo, puede existir sin cuenta y un nombre no prueba ni permite reclamar identidad.
  - La creación y la identificación humana cuentan como actividad relevante; abrir un enlace, un preview, un bot o un job no la renuevan.
- Source: [`../technical-design/13-domain/domain-invariants.md`](../technical-design/13-domain/domain-invariants.md), `INV-GLO-01`..`INV-GLO-06` y `INV-TEAM-01`..`INV-TEAM-12`.
  - `Team` es el contexto y Cuenta/Participante/Administrador no se colapsan; toda operación contextual se comprueba contra el equipo.
- Source: [`../technical-design/14-state-machines/state-machines.md`](../technical-design/14-state-machines/state-machines.md), `SM-QT-01` y `SM-QT-02`.
  - Crear rápido deja `ACTIVE`, participante inicial, acceso inicial y `lastRelevantActivityAt` en una operación atómica. Esta SPEC no agenda ni ejecuta el job de lifecycle posterior.
- Source: [`../technical-design/16-identity-sessions/identity-and-session-design.md`](../technical-design/16-identity-sessions/identity-and-session-design.md).
  - La sesión de participante es opaca, server-side, limitada por la expiración del equipo y asociada a `teamId + participantId`; el enlace público no concede identidad.

## Preconditions

- `SPEC-001` está `Verified`; el workspace, PostgreSQL, MikroORM, OpenAPI y harnesses básicos están disponibles.
- La Design Baseline v1.0 permanece `Active for implementation` y no tiene blockers aplicables a Slice 1.
- La implementación se realiza en una rama `feat/SPEC-002-quick-team` autorizada y derivada de `main`.
- La zona horaria que envía el cliente se valida como IANA canónica; la sugerencia del navegador es una conveniencia de UI, no una fuente de verdad.

## Functional behaviour

### Crear equipo rápido

- Un visitante puede enviar nombre del equipo, zona horaria IANA y nombre visible inicial a `POST /teams/quick`, sin cuenta ni email.
- La operación valida el payload, crea atómicamente el equipo `QUICK` en `ACTIVE`, el participante inicial, el acceso público inicial y su sesión contextual. Establece los tres estados de disponibilidad habilitados y `lastRelevantActivityAt` como actividad humana válida.
- La respuesta devuelve solo referencias públicas, el resumen de equipo, el participante creado y un `redirectTo` interno; la sesión se entrega en cookie opaca y no en el payload.
- La respuesta y UI informan claramente de que el equipo es rápido y temporal. No deben ofrecer administración ni aparentar persistencia indefinida.
- La misma `Idempotency-Key` con el mismo actor/operación/payload no crea otro equipo; una reutilización con payload distinto se rechaza de forma segura.

### Compartir, abrir e identificarse

- El creador puede copiar el enlace público inicial del equipo. Abrirlo resuelve únicamente contexto público mínimo necesario para entrar o identificarse; no expone directorio, settings, sesiones, PII adicional ni capacidades administrativas.
- Un visitante sin sesión puede proporcionar un nombre visible mediante `POST /teams/{teamRef}/participants`. El servidor crea un participante local nuevo del mismo equipo y una `ParticipantSession`; no busca ni reutiliza participantes por nombre.
- Tras crear o recuperar contexto por acceso público, la aplicación navega a una URL interna limpia. Si se usa `POST /access/exchange` para resolver el `publicRef`, este solo acepta el alcance público, devuelve `redirectTo` interno y nunca establece una identidad que no exista.
- `GET /teams/{teamRef}/participants/me` y `GET /teams/{teamRef}/home` solo funcionan con una sesión contextual válida del mismo equipo. El home de esta slice muestra el contexto de equipo y estados de continuación, sin simular funcionalidades de slices posteriores.

### Temporalidad y estados futuros

- La creación persiste los campos de lifecycle y credenciales requeridos por el modelo para que el ciclo obligatorio pueda completarse después.
- Esta SPEC no cambia un equipo a `RECOVERABLE` o `EXPIRED`. Antes de que exista SPEC-010, una visita pasiva tampoco debe modificar `lastRelevantActivityAt`.

## Authorization

- Source: [`../technical-design/15-authorization/authorization-rules.md`](../technical-design/15-authorization/authorization-rules.md) y [`../technical-design/15-authorization/authorization-matrix.md`](../technical-design/15-authorization/authorization-matrix.md).
- `team.createQuick` y la creación de participante desde enlace público válido permiten actor anónimo, sujeto a validación, idempotencia y rate limiting; no requieren cuenta.
- La lectura pública del equipo exige `PublicLink`/referencia pública válida y devuelve el mínimo contexto. El inicio y `/participants/me` exigen `ParticipantSession` del mismo `teamId`.
- Cada request contextual carga recurso y sesión, compara estrictamente `teamId`, comprueba participante activo y rechaza sesiones inválidas, revocadas, expiradas o de otro equipo. Nunca confía en refs recibidas para derivar identidad.
- Un enlace público no concede administración ni permite actuar como un participante ya existente. No se implementan acciones administrativas en esta SPEC.
- La UI puede ocultar acciones, pero cada endpoint aplica autorización server-side. Las mutaciones con cookies exigen CSRF/origin conforme a ADR-008 y ADR-015.

## API contract

Mantener [`../technical-design/18-api/openapi.yaml`](../technical-design/18-api/openapi.yaml) como fuente de verdad y materializar únicamente:

- `POST /teams/quick` (`createQuickTeam`), público e idempotente: crea equipo rápido, participante inicial y sesión contextual; `201` con `CreateTeamResponse`.
- `GET /teams/{teamRef}` (`getTeam`): contexto mínimo público o contextual; no filtra datos nominales.
- `POST /teams/{teamRef}/participants` (`createParticipant`), público con enlace/ref válido e idempotente: crea identidad local y sesión; `201` con `Participant`.
- `GET /teams/{teamRef}/participants/me` (`getCurrentParticipant`): requiere participante contextual del equipo.
- `GET /teams/{teamRef}/home` (`getTeamHome`): requiere participante contextual del equipo.
- `POST /access/exchange` (`exchangeAccess`) solo para resolver el `publicRef` del enlace público inicial si la navegación lo requiere; no se admiten enlaces identificados ni tokens privilegiados en esta slice.

Todos los errores usan `application/problem+json`/`ProblemDetails`. Como mínimo se cubren payload o zona IANA inválidos, referencia/enlace inexistente o revocado, sesión inválida o de otro equipo, acceso no autorizado, CSRF/origin inválido, conflicto de idempotencia y rate limit. No se modifican endpoints, DTOs ni semántica OpenAPI fuera de este alcance.

## Data / persistence

- Aplicar migraciones para `teams`, `participants`, `participant_sessions` y `access_credentials` conforme a [`../technical-design/17-data-model/data-model.md`](../technical-design/17-data-model/data-model.md).
- `teams` conserva `publicRef` único no secuencial, modo `QUICK`, `quickState=ACTIVE`, `timeZone` IANA, `lastRelevantActivityAt`, políticas coherentes con rápido y los tres estados habilitados. Se aplican sus checks de modalidad y lifecycle.
- `participants` tiene `teamId`, referencia pública acotada al equipo, nombre visible no único e indicador activo; la unicidad es `(teamId, publicRef)`, nunca por `displayName`.
- `participant_sessions` persiste un identificador/token opaco hasheado, `teamId`, `participantId`, expiración, revocación y metadata minimizada. La pertenencia participante-equipo se refuerza por constraint compuesta cuando sea viable o mediante dominio/transacción documentada.
- `access_credentials` conserva solo el `PUBLIC_LINK`/`TEAM_PUBLIC` mínimo para el enlace inicial, con `publicRef` y scope de equipo; cualquier token sensible futuro se almacena exclusivamente hasheado. No se persisten tokens en claro.
- La creación rápida es transaccional: ningún fallo puede dejar equipo sin participante/sesión/acceso ni participante huérfano.

## UI behaviour

- `SCR-02` presenta la elección de modalidad sin hacer funcional el camino administrable; el usuario puede continuar hacia rápido sin registro.
- `SCR-03` recoge nombre de equipo, nombre visible y zona horaria sugerida por el navegador y editable. Explica la temporalidad del rápido, valida errores de forma accesible y evita doble envío.
- `SCR-06` muestra contexto mínimo del enlace y solicita solo el nombre visible necesario para crear una identidad local. No permite elegir ni reclamar un participante existente.
- Tras creación o identificación se carga el primer `SCR-11`, responsive y mobile-first, con equipo y actor actuales, enlace para compartir y una indicación clara de que disponibilidad/decisiones llegarán en slices posteriores.
- Se implementan estados vacíos, carga, error recuperable, sin permisos/sesión y enlace inválido o revocado. Foco, mensajes y controles son semánticos y navegables por teclado; ningún estado depende solo del color.

## Errors and edge cases

- Nombre de equipo, nombre visible o zona IANA ausentes/ inválidos: `VALIDATION_ERROR`, sin crear datos.
- Reintento de creación con la misma clave/payload: devuelve el resultado idempotente; clave con payload distinto o fuera de scope: conflicto seguro.
- `teamRef` o enlace público inexistente, revocado o perteneciente a equipo no accesible: no revela datos adicionales.
- Participante/sesión de equipo A al solicitar `/teams/{teamRefB}/...`: `FORBIDDEN`/`NOT_FOUND` según el contrato sin filtración cross-team.
- Cookie ausente, expirada, revocada o corrupta: no se deriva identidad; se presenta identificación o estado de acceso apropiado.
- Solicitud mutante con cookie sin CSRF válido u origin no permitido: rechazada sin mutar.
- Preview/crawler/GET pasivo: no crea participante, sesión ni actividad relevante.
- Abuso de `POST /teams/quick`, `POST /teams/{teamRef}/participants` y, si se activa, `/access/exchange`: rate limit con respuesta segura y sin enumeración.

## Security / privacy considerations

- Aplicar ADR-008, ADR-015 y ADR-022, así como [`../security/22-threat-model/security-checklist.md`](../security/22-threat-model/security-checklist.md), a las rutas de esta slice.
- Cookies de sesión `HttpOnly`, `Secure`, `SameSite=Lax`, de valor opaco y alcance contextual; nunca serializar identificadores internos, tokens o cookies al cliente, logs o analytics.
- Validar y limitar entradas, aplicar CORS allowlist, Helmet/CSP y rate limit a endpoints públicos conforme a la configuración base de seguridad.
- La respuesta pública de equipo se minimiza; no lista participantes ni revela settings, credenciales, metadatos de sesión o información de administración.
- Registrar únicamente auditoría/telemetría mínima sin PII o secretos innecesarios; la política de retención y purga completa queda para SPEC-010, sin debilitar el requisito de no guardar tokens claros ahora.

## Acceptance criteria

1. **Given** un visitante sin cuenta ni email, **when** crea un equipo rápido con nombre, zona IANA válida y nombre visible, **then** recibe `201`, el equipo queda `QUICK/ACTIVE`, los tres estados de disponibilidad quedan habilitados y existe un participante inicial con sesión contextual.
2. **Given** la creación de un equipo rápido, **when** falla cualquier paso de persistencia, **then** la transacción no deja equipos, participantes, sesiones ni credenciales parciales.
3. **Given** un equipo rápido recién creado, **when** el creador copia y otro visitante abre su enlace en un contexto limpio, **then** solo ve contexto mínimo e identifica un participante local sin cuenta antes de entrar al home del equipo.
4. **Given** dos participantes con el mismo nombre visible, **when** el segundo se identifica, **then** se crea una identidad local distinta y nunca se apropia de la existente.
5. **Given** una sesión de participante del equipo A, **when** intenta leer `/me` o el home del equipo B, **then** el servidor rechaza la petición sin devolver datos de B.
6. **Given** un enlace público, **when** se abre o se resuelve, **then** no concede administración ni una identidad de participante preexistente y no renueva actividad por una visita pasiva.
7. **Given** un reintento de `POST /teams/quick` o `POST /teams/{teamRef}/participants` con la misma `Idempotency-Key` y payload, **when** llega más de una vez, **then** no se crean duplicados; un payload distinto con la misma clave se rechaza.
8. **Given** una mutación protegida por cookie, **when** falta CSRF válido o el origin no está permitido, **then** se rechaza sin crear o cambiar datos.
9. **Given** un `teamRef`/enlace/sesión inválido, revocado o expirado, **when** se intenta acceder, **then** se devuelve `ProblemDetails` seguro y la UI muestra un estado recuperable o de enlace inválido accesible.
10. **Given** la interfaz de creación, identificación e inicio de equipo, **when** se usa en móvil o con teclado, **then** es responsive, tiene foco perceptible, mensajes de error accesibles y la temporalidad no se comunica solo por color.

## Required tests

### Unit

- Dominio: creación de `QUICK/ACTIVE`, zona IANA válida, defaults de los tres estados y participante local sin cuenta.
- Dominio: nombre visible no reclama ni fusiona participantes; reglas de actividad humana frente a visita pasiva.
- Validación de DTOs, `ProblemDetails`, política de contexto y scope de `Idempotency-Key`.
- Redacción de logs y serializadores: ningún token, cookie o identificador interno se expone.

### Integration

- PostgreSQL/Testcontainers: migraciones, `publicRef` único, checks de modo `QUICK`, defaults y relaciones/constraints entre equipo, participante y sesión.
- `TX-01`: equipo, participante inicial, acceso inicial y sesión en una transacción; rollback completo ante fallo.
- Sesión opaca ligada a `teamId + participantId`, expiración/revocación y aislamiento entre equipos.
- Idempotencia de creación con mismo payload y rechazo por payload divergente; rate limit de las rutas públicas.

### API

- Contract tests OpenAPI para `createQuickTeam`, `getTeam`, `createParticipant`, `getCurrentParticipant`, `getTeamHome` y la resolución pública de acceso si se activa.
- Creación y unión sin cuenta/email; `/me` y home solo con sesión contextual del mismo equipo.
- Negativos de IDOR cross-team, enlace/ref inválido, suplantación por nombre, enlace público sin privilegios y sesión inválida/revocada.
- CSRF/origin para mutaciones con cookies, idempotencia, limitación antiabuso y respuestas `ProblemDetails` sin filtración.

### UI/component

- Formulario rápido con validación accesible, prevención de doble envío, modalidad y temporalidad perceptibles.
- Identificación de participante, estados de carga/error/enlace inválido/sin sesión y redirección a URL limpia cuando corresponda.
- Home inicial responsive, navegación por teclado, foco visible y comprobaciones axe de las pantallas tocadas.

### E2E

- Playwright parcial de `E2E-01`: visitante crea equipo rápido, comparte enlace, segundo contexto de navegador se identifica sin cuenta y ambos alcanzan el home del mismo equipo.
- Caso negativo: enlace inválido/revocado y acceso de sesión del equipo A al home de B no exponen información.
- La continuación de disponibilidad, coincidencias, propuesta y resolución permanece en SPEC-003 a SPEC-005.

## Documentation impact

- Crear esta SPEC desde [`SPEC-TEMPLATE.md`](SPEC-TEMPLATE.md).
- Actualizar [`spec-register.md`](spec-register.md) a `Ready` y [`../implementation/status.md`](../implementation/status.md) con el siguiente trabajo habilitado.
- Registrar la evidencia de preparación, el uso relevante de IA y el hito Spec-First en los registros `tfm` correspondientes.
- No modificar roadmap, baseline, requisitos, ADRs ni OpenAPI como parte de este authoring.

## Implementation constraints

- Implementar únicamente tras autorización explícita, en `feat/SPEC-002-quick-team`, mediante `$synqo-sdd-implementation` y cerrar con `$synqo-verification`.
- Respetar React + TypeScript + Vite, NestJS + TypeScript, PostgreSQL + MikroORM, REST/OpenAPI, monolito modular y pnpm establecidos por la baseline.
- Mantener `Team` como agregado de contexto e Identity & Access separado; no introducir un `userId` genérico, JWT como mecanismo principal, RBAC genérico ni cuentas obligatorias.
- No alterar contrato/baseline. Si una librería, implementación de rate limit, estrategia de sesión o schema físico requiere cambiar requisitos, autorización, privacidad, contrato o diseño baseline, detenerse y tramitar Change Control.

## Out of scope

- Todas las capacidades de `SPEC-003` y posteriores, incluidos disponibilidad, calendario, decisiones, solicitudes, lifecycle jobs, notificaciones e IA.
- Camino funcional de creación administrable de `SCR-02`, `SCR-04` y pantallas de verificación/admin.
- Cuentas, account sessions, enlaces identificados, enlaces de verificación/recovery, account linking y directorio de participantes.
- Cambiar el lifecycle ya diseñado o resolver las decisiones diferidas de detección de previews/bots más allá de no considerar pasivos los GET de esta slice.

## Traceability

- Requirements: `RF-ID-01`, `RF-ID-03`, `RF-ACC-01`, `RF-ACC-04`, `RF-ACC-05`, `RF-EQR-01`, `RF-EQR-02`, `RF-EQR-09`, `RF-PA-01`, `RF-PA-02`; RNF enumerados arriba.
- User stories: `HU-EQ-01`, `HU-EQ-03`.
- Baseline: [`../project/design-baseline.md`](../project/design-baseline.md)
- Change Request: N/A
- ADR: ADR-008, ADR-015, ADR-022.
- Roadmap: [`../delivery/28-implementation-roadmap/implementation-roadmap.md`](../delivery/28-implementation-roadmap/implementation-roadmap.md), [`../delivery/28-implementation-roadmap/vertical-slices.md`](../delivery/28-implementation-roadmap/vertical-slices.md) — Slice 1.
- Implementation commit: pending; consultar el historial Git de `feat/SPEC-002-quick-team` cuando exista.
- Verification evidence: pending.

## Implementation outcome

- Implemented as specified: pending.
- Deviations: pending.
- Verification: pending.
- Notes for TFM: SPEC preparada antes de código; la evidencia de implementación se registrará tras las verificaciones objetivas.

## Definition of Done

Referenciar [`../development/definition-of-done.md`](../development/definition-of-done.md). Condiciones específicas: todas las rutas de esta SPEC pasan los tests de autorización/IDOR, CSRF, idempotencia y antiabuso aplicables; migraciones reproducibles; UI accesible; contrato OpenAPI sincronizado; y evidencia de verification registrada antes de marcarla `Verified`.
