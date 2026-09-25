# 17 — Data Model

## 1. Propósito

Este documento define el modelo lógico PostgreSQL/MikroORM para el Target MVP de Synqo. Parte del dominio táctico, las máquinas de estado, el diseño de identidad/sesiones y las reglas de negocio ya consolidadas.

No introduce implementación de aplicación. Su objetivo es dejar un esquema persistente verificable, con constraints e índices que refuercen invariantes críticas y preparen la API de fase 18.

## 2. Convenciones

- Identificadores internos: `uuid`.
- Identificadores públicos: strings opacos no secuenciales (`publicRef`, `slug` o equivalente), únicos dentro del ámbito necesario.
- Fechas de disponibilidad: `date`, interpretada en la zona horaria IANA canónica del equipo.
- Instantes técnicos: `timestamptz`.
- Estados: enums PostgreSQL o checks equivalentes gestionados por migraciones.
- Todas las tablas principales incluyen `createdAt`, `updatedAt`.
- Soft delete se usa para preservar histórico; delete real/anonymization se reserva para purga de equipos rápidos expirados y tokens/sesiones caducados.

## 3. Enums iniciales

| Enum | Valores |
|---|---|
| `team_mode` | `QUICK`, `MANAGED` |
| `quick_team_state` | `ACTIVE`, `RECOVERABLE`, `EXPIRED` |
| `managed_team_state` | `PENDING_VERIFICATION`, `ACTIVE`, `ARCHIVED` |
| `team_policy` | `EVERYONE`, `ADMINISTRATORS` |
| `availability_status` | `AVAILABLE`, `MAYBE`, `UNAVAILABLE` |
| `availability_request_state` | `OPEN`, `CLOSED` |
| `decision_type` | `PROPOSAL`, `SURVEY` |
| `decision_participation_state` | `OPEN`, `CLOSED` |
| `decision_resolution_state` | `PENDING`, `RESOLVED`, `CANCELLED` |
| `survey_mode` | `SINGLE`, `MULTIPLE` |
| `survey_visibility` | `NOMINAL`, `AGGREGATED` |
| `access_credential_type` | `PUBLIC_LINK`, `IDENTIFIED_LINK`, `VERIFICATION_LINK`, `RECOVERY_LINK` |
| `credential_scope` | `TEAM_PUBLIC`, `PARTICIPANT_TARGET`, `ADMIN_VERIFY`, `ADMIN_RECOVERY`, `ACCOUNT_VERIFY`, `ACCOUNT_RECOVERY` |

`UNANSWERED` no es enum persistido de disponibilidad; se deriva por ausencia de entrada/respuesta.

## 4. Tablas de equipo e identidad local

### `teams`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `publicRef` | `text` | no | Unique, no secuencial. |
| `name` | `text` | no | Nombre visible. |
| `mode` | `team_mode` | no | `QUICK` o `MANAGED`. |
| `timeZone` | `text` | no | IANA canónica. Validación final en dominio/app. |
| `quickState` | `quick_team_state` | sí | Obligatorio si `mode=QUICK`. |
| `managedState` | `managed_team_state` | sí | Obligatorio si `mode=MANAGED`. |
| `lastRelevantActivityAt` | `timestamptz` | sí | Solo rápido activo/recuperable. |
| `recoverableSince` | `timestamptz` | sí | Solo rápido recuperable. |
| `expiredAt` | `timestamptz` | sí | Rápido expirado definitivo. |
| `createAvailabilityRequestPolicy` | `team_policy` | no | Default `EVERYONE`. |
| `createDecisionPolicy` | `team_policy` | no | Default `EVERYONE`. |
| `resolveDecisionPolicy` | `team_policy` | no | Default `ADMINISTRATORS` en administrable; equivalente abierto en rápido por dominio. |
| `allowAvailable` | `boolean` | no | Default true. |
| `allowMaybe` | `boolean` | no | Default true. |
| `allowUnavailable` | `boolean` | no | Default true. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría técnica. |
| `deletedAt` | `timestamptz` | sí | Solo soft delete administrativo futuro. |

Constraints:

- `publicRef` unique.
- `mode=QUICK` implica `quickState IS NOT NULL AND managedState IS NULL`.
- `mode=MANAGED` implica `managedState IS NOT NULL AND quickState IS NULL`.
- `mode=QUICK` implica políticas equivalentes a participantes activos; las columnas pueden mantener defaults pero el dominio ignora administración formal.
- `allowAvailable OR allowUnavailable` debe ser true.
- `mode=QUICK` implica `allowAvailable AND allowMaybe AND allowUnavailable`.
- `expiredAt IS NOT NULL` solo si rápido `EXPIRED`.

Índices:

- `idx_teams_public_ref`.
- `idx_teams_quick_lifecycle (quickState, lastRelevantActivityAt, recoverableSince)` para jobs.
- `idx_teams_managed_state (managedState)`.

### `participants`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `teamId` | `uuid` | no | FK `teams(id)`. |
| `publicRef` | `text` | no | Referencia pública acotada al equipo. |
| `displayName` | `text` | no | No es prueba de identidad. |
| `isActive` | `boolean` | no | Default true. |
| `joinedAt` | `timestamptz` | no | Alta. |
| `deactivatedAt` | `timestamptz` | sí | Inactivo no es destinatario futuro. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría técnica. |

Constraints:

- FK con `ON DELETE CASCADE` solo para purga real de equipo rápido expirado; en operación ordinaria no se borra.
- Unique `(teamId, publicRef)`.
- No unique por `displayName`.
- `deactivatedAt IS NULL` si `isActive=true`; `deactivatedAt IS NOT NULL` si `isActive=false`.

Índices:

- `idx_participants_team_active (teamId, isActive)`.
- `idx_participants_team_joined (teamId, joinedAt)`.

### `accounts`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `emailNormalized` | `citext` | no | Unique. |
| `emailVerifiedAt` | `timestamptz` | sí | Verificación. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría. |
| `disabledAt` | `timestamptz` | sí | Futuro. |

`citext` es recomendado para email normalizado; si no se habilita extensión, usar `lower(email)` con índice funcional.

### `participant_account_links`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `participantId` | `uuid` | no | FK `participants(id)`. |
| `accountId` | `uuid` | no | FK `accounts(id)`. |
| `linkedAt` | `timestamptz` | no | Instante de vinculación. |
| `proofType` | `text` | no | `participant_session`, etc. |

Constraints:

- Unique `(participantId)`: una participación local no se vincula a varias cuentas.
- Unique `(accountId, participantId)` redundante pero útil para consultas.

## 5. Administración

### `administrative_identities`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `teamId` | `uuid` | no | FK `teams(id)`. |
| `emailNormalized` | `citext` | no | Canal administrativo. |
| `isPrimary` | `boolean` | no | MVP: una primaria. |
| `verifiedAt` | `timestamptz` | sí | Administración persistente solo tras verificar. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría. |

Constraints:

- Unique parcial `(teamId) WHERE isPrimary=true`.
- Unique `(teamId, emailNormalized)`.
- FK a equipo administrable; el dominio valida `mode=MANAGED`.

### `administrative_account_links`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `administrativeIdentityId` | `uuid` | no | FK. |
| `accountId` | `uuid` | no | FK. |
| `linkedAt` | `timestamptz` | no | Instante. |

Constraints:

- Unique `(administrativeIdentityId)`.

## 6. Sesiones y enlaces

### `account_sessions`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK/session id opaco. |
| `accountId` | `uuid` | no | FK. |
| `tokenHash` | `text` | no | Unique si se usa token además de id opaco. |
| `createdAt`, `expiresAt`, `lastUsedAt`, `revokedAt` | `timestamptz` | según campo | TTL y revocación. |
| `userAgentHash`, `ipPrefix` | `text` | sí | Anti-abuso minimizado. |

### `participant_sessions`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK/session id opaco. |
| `teamId` | `uuid` | no | FK. |
| `participantId` | `uuid` | no | FK. |
| `tokenHash` | `text` | no | Unique. |
| `createdAt`, `expiresAt`, `lastUsedAt`, `revokedAt` | `timestamptz` | según campo | TTL y revocación. |
| `userAgentHash`, `ipPrefix` | `text` | sí | Minimizado. |

Constraints:

- FK compuesta lógica: `participant.teamId = teamId` validada con FK compuesta si se añade unique `(id, teamId)` en `participants`, o por dominio/transacción.

### `administrative_sessions`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK/session id opaco. |
| `teamId` | `uuid` | no | FK. |
| `administrativeIdentityId` | `uuid` | no | FK. |
| `tokenHash` | `text` | no | Unique. |
| `createdAt`, `expiresAt`, `lastUsedAt`, `revokedAt` | `timestamptz` | según campo | TTL y revocación. |

Constraints:

- Identidad administrativa debe estar verificada antes de crear sesión, validado transaccionalmente por dominio.

### `access_credentials`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `type` | `access_credential_type` | no | Tipo de enlace. |
| `scope` | `credential_scope` | no | Alcance mínimo. |
| `tokenHash` | `text` | sí | Null permitido para public refs no secretas. |
| `publicRef` | `text` | sí | Para enlaces públicos de bajo privilegio. |
| `teamId` | `uuid` | sí | FK si aplica. |
| `participantId` | `uuid` | sí | FK si aplica. |
| `administrativeIdentityId` | `uuid` | sí | FK si aplica. |
| `accountId` | `uuid` | sí | FK si aplica. |
| `targetType` | `text` | sí | `TEAM`, `REQUEST`, `DECISION`, etc. |
| `targetId` | `uuid` | sí | Recurso destino. |
| `targetPath` | `text` | sí | Ruta limpia tras canje. |
| `oneTime` | `boolean` | no | Default false. |
| `createdAt`, `expiresAt`, `lastExchangedAt`, `usedAt`, `revokedAt` | `timestamptz` | según campo | TTL/revocación. |
| `createdByActorType`, `createdByActorId` | `text`, `uuid` | sí | Auditoría mínima. |

Constraints:

- Unique parcial `tokenHash WHERE tokenHash IS NOT NULL`.
- Unique parcial `(publicRef) WHERE publicRef IS NOT NULL`.
- `VERIFICATION_LINK` y `RECOVERY_LINK` requieren `tokenHash`, `expiresAt`, `oneTime=true`.
- `IDENTIFIED_LINK` requiere `teamId` y `participantId`.
- `PUBLIC_LINK` no puede incluir `participantId` ni `administrativeIdentityId`.
- `usedAt IS NOT NULL` implica `oneTime=true`.

Índices:

- `idx_access_credentials_token_hash`.
- `idx_access_credentials_public_ref`.
- `idx_access_credentials_expiry (expiresAt) WHERE revokedAt IS NULL`.
- `idx_access_credentials_team (teamId, type, revokedAt)`.

## 7. Disponibilidad

### `availability_entries`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `teamId` | `uuid` | no | FK. |
| `participantId` | `uuid` | no | FK. |
| `localDate` | `date` | no | Día en zona horaria del equipo. |
| `status` | `availability_status` | no | No incluye `UNANSWERED`. |
| `sourceRequestId` | `uuid` | sí | Última solicitud que actualizó esta entrada, FK nullable. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría. |

Constraints:

- Unique `(teamId, participantId, localDate)`.
- El estado debe estar habilitado según equipo; se valida en dominio porque depende de columnas de `teams`.
- `participantId` debe pertenecer a `teamId`.

Índices:

- `idx_availability_team_date (teamId, localDate)`.
- `idx_availability_participant_range (teamId, participantId, localDate)`.
- `idx_availability_match_counts (teamId, localDate, status)`.

`AvailabilityRequest` no duplica disponibilidad: sus respuestas actualizan `availability_entries`.

### `availability_requests`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `teamId` | `uuid` | no | FK. |
| `publicRef` | `text` | no | Unique por equipo. |
| `createdByParticipantId` | `uuid` | sí | FK. |
| `createdByAdministrativeIdentityId` | `uuid` | sí | FK. |
| `startDate`, `endDate` | `date` | no | Intervalo cerrado. |
| `state` | `availability_request_state` | no | `OPEN`/`CLOSED`. |
| `deadlineAt` | `timestamptz` | sí | Cierre automático. |
| `closedAt` | `timestamptz` | sí | Cierre. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría. |

Constraints:

- Unique `(teamId, publicRef)`.
- `startDate <= endDate`.
- Exactamente uno de creador participante/admin cuando proceda, o sistema futuro.
- `closedAt IS NOT NULL` si `state=CLOSED`.

Índices:

- `idx_availability_requests_team_state (teamId, state)`.
- `idx_availability_requests_deadline (deadlineAt) WHERE state='OPEN'`.

### `availability_request_participants`

Snapshot opcional recomendado para saber a quién se dirigió la solicitud en el momento de publicación, sin duplicar respuestas.

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `availabilityRequestId` | `uuid` | no | FK. |
| `participantId` | `uuid` | no | FK. |
| `createdAt` | `timestamptz` | no | Snapshot. |

PK `(availabilityRequestId, participantId)`.

No contiene estados de disponibilidad. `UNANSWERED` se calcula comparando este snapshot y `availability_entries` en el intervalo.

## 8. Consultas, opciones, respuestas y resolución

### Alternativas para `Consulta`

| Alternativa | Ventajas | Coste |
|---|---|---|
| Tablas separadas `proposals`/`surveys` completas | Muy explícito por tipo. | Duplica lifecycle, permisos, deadlines, respuestas y resolución. |
| Tabla única enorme | Consultas simples para estado común. | Muchos campos nulos y checks condicionales difíciles de leer. |
| Raíz común `decision_processes` + tablas detalle por tipo | Comparte lifecycle y permite constraints específicas por tipo. | Requiere joins para algunos detalles. |

Decisión: usar raíz común `decision_processes` con tablas detalle `proposal_details` y `survey_details`. Las opciones y respuestas se mantienen comunes con constraints por tipo donde sea posible y validación de dominio para reglas condicionales complejas. Encaja con MikroORM sin imponer herencia profunda y evita duplicación.

### `decision_processes`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `teamId` | `uuid` | no | FK. |
| `publicRef` | `text` | no | Unique por equipo. |
| `type` | `decision_type` | no | `PROPOSAL`/`SURVEY`. |
| `title` | `text` | no | Título visible. |
| `description` | `text` | sí | Opcional. |
| `createdByParticipantId` | `uuid` | sí | FK. |
| `createdByAdministrativeIdentityId` | `uuid` | sí | FK. |
| `participationState` | `decision_participation_state` | no | Default `OPEN`. |
| `resolutionState` | `decision_resolution_state` | no | Default `PENDING`. |
| `deadlineAt` | `timestamptz` | sí | Opcional. |
| `closedAt` | `timestamptz` | sí | Cierre de participación. |
| `version` | `integer` | no | Optimistic locking para resolución/cancelación. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría. |
| `deletedAt` | `timestamptz` | sí | Solo soft delete futuro. |

Constraints:

- Unique `(teamId, publicRef)`.
- `OPEN` solo puede combinarse con `PENDING`.
- `RESOLVED` o `CANCELLED` implica `participationState=CLOSED`.
- `closedAt IS NOT NULL` si `participationState=CLOSED`.
- Tipo solo `PROPOSAL` o `SURVEY` en MVP.

Índices:

- `idx_decisions_team_state (teamId, participationState, resolutionState)`.
- `idx_decisions_deadline (deadlineAt) WHERE participationState='OPEN'`.
- `idx_decisions_team_created (teamId, createdAt DESC)`.
- `idx_decisions_creator_participant (createdByParticipantId)`.

### `proposal_details`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `decisionProcessId` | `uuid` | no | PK/FK. |
| `timeZone` | `text` | no | Copia de zona horaria de equipo al crear, para interpretación histórica. |

Constraint: el dominio garantiza que `decision_processes.type='PROPOSAL'`.

### `survey_details`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `decisionProcessId` | `uuid` | no | PK/FK. |
| `mode` | `survey_mode` | no | `SINGLE`/`MULTIPLE`. |
| `visibility` | `survey_visibility` | no | Default `NOMINAL` o según producto. |

Constraint: el dominio garantiza que `decision_processes.type='SURVEY'`.

### `decision_options`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `decisionProcessId` | `uuid` | no | FK. |
| `position` | `integer` | no | Orden estable. |
| `label` | `text` | sí | Obligatorio para encuesta; opcional para propuesta. |
| `proposalDate` | `date` | sí | Obligatorio para propuesta. |
| `proposalTime` | `time` | sí | Hora opcional, no franja. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría. |
| `deletedAt` | `timestamptz` | sí | Soft delete solo si sin respuestas. |

Constraints:

- Unique `(decisionProcessId, position)`.
- Para propuesta: `proposalDate IS NOT NULL`; `proposalTime` puede ser null; no existen campos `endTime`.
- Para encuesta: `label IS NOT NULL`; `proposalDate IS NULL AND proposalTime IS NULL`.
- Las constraints dependientes de `decision_processes.type` se aplican en dominio o con triggers si se decide más adelante; no se añade complejidad de trigger en MVP documental.

Índices:

- `idx_decision_options_decision (decisionProcessId, position)`.

### `decision_responses`

Una fila representa la respuesta de un participante a una consulta, no cada selección concreta.

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `decisionProcessId` | `uuid` | no | FK. |
| `participantId` | `uuid` | no | FK. |
| `respondedAt` | `timestamptz` | no | Último envío válido. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría. |

Constraints:

- Unique `(decisionProcessId, participantId)` para idempotencia/reemplazo.
- Participante debe pertenecer al mismo equipo que la consulta.

Índices:

- `idx_decision_responses_decision (decisionProcessId)`.
- `idx_decision_responses_participant (participantId, respondedAt DESC)`.

### `proposal_response_options`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `decisionResponseId` | `uuid` | no | FK. |
| `decisionOptionId` | `uuid` | no | FK. |
| `status` | `availability_status` | no | Respuesta específica de propuesta. |

PK `(decisionResponseId, decisionOptionId)`.

Constraints:

- Estado usa `AVAILABLE/MAYBE/UNAVAILABLE`; `UNANSWERED` se deriva por ausencia de fila.
- Opción debe pertenecer a la misma consulta que la respuesta, validado con FK compuesta o dominio transaccional.
- No modifica `availability_entries`.

Índices:

- `idx_proposal_response_options_option_status (decisionOptionId, status)` para resultados.

### `survey_response_options`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `decisionResponseId` | `uuid` | no | FK. |
| `decisionOptionId` | `uuid` | no | FK. |

PK `(decisionResponseId, decisionOptionId)`.

Constraints:

- Para `SINGLE`, como máximo una opción por `decisionResponseId`; puede reforzarse con validación de dominio o índice único parcial si se separasen tablas por modo. El dominio debe validarlo en la transacción.
- Para `MULTIPLE`, varias opciones.

Índices:

- `idx_survey_response_options_option (decisionOptionId)`.

### `decision_resolutions`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `decisionProcessId` | `uuid` | no | FK unique. |
| `resolvedByParticipantId` | `uuid` | sí | FK. |
| `resolvedByAdministrativeIdentityId` | `uuid` | sí | FK. |
| `kind` | `text` | no | `RESOLVED` o `CANCELLED`. |
| `reason` | `text` | sí | Nota opcional. |
| `resultSnapshot` | `jsonb` | sí | Snapshot mínimo del resultado al resolver/cancelar. |
| `resolvedAt` | `timestamptz` | no | Instante. |

Constraints:

- Unique `(decisionProcessId)`.
- `kind` in `RESOLVED`, `CANCELLED`.
- Exactamente uno de actor participante/admin cuando proceda.
- La transacción debe actualizar `decision_processes` a `CLOSED/RESOLVED` o `CLOSED/CANCELLED`.

### `decision_resolution_options`

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `decisionResolutionId` | `uuid` | no | FK. |
| `decisionOptionId` | `uuid` | no | FK. |

PK `(decisionResolutionId, decisionOptionId)`.

Reglas:

- Propuesta: exactamente una opción.
- Encuesta `SINGLE`: exactamente una opción.
- Encuesta `MULTIPLE`: una o varias opciones.
- Se validan en dominio dentro de la transacción de resolución.

## 9. Jobs, outbox mínimo y auditoría

Fase 20 detallará pg-boss y eventos internos. Para no bloquear el modelo:

### `scheduled_jobs`

Tabla conceptual si pg-boss no cubre todos los metadatos de dominio; puede omitirse si pg-boss aporta persistencia suficiente.

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `type` | `text` | no | `CLOSE_REQUEST`, `CLOSE_DECISION`, `QUICK_TO_RECOVERABLE`, etc. |
| `teamId` | `uuid` | sí | FK. |
| `resourceType`, `resourceId` | `text`, `uuid` | sí | Recurso objetivo. |
| `runAt` | `timestamptz` | no | Programación. |
| `status` | `text` | no | `PENDING`, `RUNNING`, `DONE`, `FAILED`. |
| `createdAt`, `updatedAt` | `timestamptz` | no | Auditoría. |

Índice `idx_scheduled_jobs_due (status, runAt)`.

### `domain_audit_entries`

Auditoría mínima, no event sourcing.

| Campo | Tipo | Null | Notas |
|---|---|---:|---|
| `id` | `uuid` | no | PK. |
| `teamId` | `uuid` | sí | FK. |
| `actorType` | `text` | no | `PARTICIPANT`, `ADMIN`, `ACCOUNT`, `SYSTEM`. |
| `actorId` | `uuid` | sí | Id contextual. |
| `action` | `text` | no | Acción significativa. |
| `resourceType`, `resourceId` | `text`, `uuid` | sí | Recurso. |
| `metadata` | `jsonb` | sí | Minimizada y sin tokens claros. |
| `createdAt` | `timestamptz` | no | Instante. |

Índice `idx_audit_team_created (teamId, createdAt DESC)`.

## 10. Consultas clave e índices

| Caso | Tablas | Índices relevantes |
|---|---|---|
| Calendario individual | `availability_entries` | `(teamId, participantId, localDate)` |
| Disponibilidad colectiva | `participants`, `availability_entries` | `(teamId, isActive)`, `(teamId, localDate, status)` |
| Coincidencias | `availability_entries` + participantes activos | `(teamId, localDate, status)` |
| Pendientes de participante | `availability_requests`, `decision_processes`, `decision_responses` | `(teamId, state)`, `(teamId, participationState, resolutionState)`, `(decisionProcessId, participantId)` |
| Consultas activas | `decision_processes` | `(teamId, participationState, resolutionState)` |
| Resultados de propuesta | `proposal_response_options` | `(decisionOptionId, status)` |
| Resultados de encuesta | `survey_response_options` | `(decisionOptionId)` |
| Deadlines | requests/decisions | índices parciales por `deadlineAt` cuando abiertas |
| Lifecycle rápido | `teams` | `(quickState, lastRelevantActivityAt, recoverableSince)` |
| Canje de links | `access_credentials` | `tokenHash`, `publicRef`, `expiresAt` |

## 11. Concurrencia e idempotencia

- Disponibilidad: `INSERT ... ON CONFLICT (teamId, participantId, localDate) DO UPDATE`.
- Respuesta de consulta: unique `(decisionProcessId, participantId)`; modificar respuesta reemplaza selecciones dentro de una misma transacción si la consulta sigue abierta.
- Resolución/cancelación: usar `version` de `decision_processes` y update condicional `WHERE resolutionState='PENDING' AND version=:expected`, o bloqueo pesimista `SELECT ... FOR UPDATE` sobre la consulta. La implementación puede elegir, pero debe producir un único `decision_resolutions` por consulta.
- Tokens one-time: marcar `usedAt` en la misma transacción que crea sesión; unique `tokenHash` y condición `usedAt IS NULL AND revokedAt IS NULL`.

## 12. Retención, soft delete y delete real

| Área | Estrategia |
|---|---|
| Equipos rápidos activos/recuperables | Mantener datos necesarios mientras el lifecycle lo permita. |
| Equipo rápido `EXPIRED` | Borrado físico preferente de dominio y credenciales; invalidación inmediata de sesiones/enlaces. Solo sobreviven métricas agregadas y trazas minimizadas sin PII ni tokens. |
| Equipos administrables | Soft delete/archivado futuro, no delete real ordinario en MVP. |
| Participantes inactivos | Mantener fila con `isActive=false` para histórico; no destinatario futuro. |
| Consultas resueltas/canceladas | Mantener histórico mientras equipo exista y política lo permita. |
| Tokens/sesiones expirados | Purga periódica o retención corta para seguridad/auditoría, sin token claro. |
| Auditoría | Minimizada, sin PII innecesaria ni tokens claros. |

La política completa de retención y purga está en `security/23-privacy-retention/data-retention-and-privacy.md`.

## 13. Notas de migración y evolución

- Añadir columnas/índices para notificaciones externas futuras sin cambiar el núcleo de decisiones.
- Si la regla `SINGLE` necesitase enforcement 100% en DB, considerar separar `survey_single_response_option` o añadir trigger específico; no se introduce de inicio para mantener KISS.
- Si se requieren múltiples administradores equivalentes, relajar unique parcial de primaria y añadir roles/políticas explícitas en una fase posterior.
- Si aparecen subgrupos de destinatarios, extender snapshots de destinatarios; el MVP mantiene todos los participantes activos.
- Si la carga de resultados lo exige, se puede añadir cache/materialized view de agregados, invalidada al responder; no es fuente de verdad.

## 14. Referencias

- `architecture/adr/ADR-005-persistence.md`
- `technical-design/13-domain/domain-design.md`
- `technical-design/14-state-machines/state-machines.md`
- `technical-design/16-identity-sessions/identity-and-session-design.md`
- `product/07-business-rules.md`
