# 20 — Jobs and Events

## 1. Propósito

Este documento concreta el uso de pg-boss y eventos internos para Synqo. Mantiene el dominio principalmente transaccional y usa jobs persistentes solo cuando existe una razón funcional concreta: envío de email transaccional, cierre por deadline, lifecycle/retención de equipos rápidos y limpieza de credenciales.

No introduce Redis, broker adicional, Event Sourcing ni una arquitectura event-driven general.

## 2. Principios

- PostgreSQL + pg-boss es suficiente para el MVP.
- Un job debe poder ejecutarse al menos una vez sin duplicar efectos.
- El dominio no depende de que un job de notificación de actividad exista, porque esas notificaciones están fuera del MVP.
- Los jobs de tiempo son idempotentes y recalculan precondiciones al ejecutar.
- Los eventos internos síncronos son señales dentro de la misma transacción/caso de uso; no son integración distribuida.
- Los emails se envían después de persistir token/estado, nunca antes del commit.

## 3. Eventos internos vs jobs persistentes

| Tipo | Persistencia | Uso | Ejemplos | No usar para |
|---|---|---|---|---|
| Evento de aplicación síncrono | No cola persistente propia | Coordinar efectos dentro del caso de uso o preparar jobs tras commit. | `RelevantHumanActivityRecorded`, `DecisionCreated`, `AdminVerificationRequested`. | Comunicación externa fiable por sí mismo. |
| Job pg-boss | Persistente en PostgreSQL | Trabajo asíncrono, reintentos, ejecución diferida o mantenimiento. | `send.adminVerificationEmail`, `sweep.quickTeams`, `close.dueDecisions`. | Modelar cada cambio del dominio como evento. |
| Audit entry | Persistente como registro | Observabilidad y trazabilidad mínima. | `QUICK_TEAM_EXPIRED`, `DECISION_CLOSED_BY_DEADLINE`. | Reconstruir estado del dominio. |

## 4. Catálogo de jobs

| ID | Job | Razón funcional | Productor | Trigger |
|---|---|---|---|---|
| `JOB-EMAIL-01` | `email.adminVerification` | Verificar identidad administrativa de equipo administrable. | `createManagedTeam`, `resendVerification`. | Tras commit de token de verificación. |
| `JOB-EMAIL-02` | `email.adminRecovery` | Recuperar capacidad administrativa verificada. | `requestAdminRecovery`. | Tras commit de token de recovery, si existe identidad elegible. |
| `JOB-EMAIL-03` | `email.accountAuth` | Autenticación/verificación de cuenta si se ofrece en el MVP. | Flujo de cuenta. | Tras commit de token de cuenta. |
| `JOB-LIFE-01` | `sweep.quickTeams` | Mover rápidos `ACTIVE → RECOVERABLE` y `RECOVERABLE → EXPIRED`. | Scheduler recurrente. | Periodicidad, por ejemplo cada hora. |
| `JOB-LIFE-02` | `purge.expiredQuickTeam` | Eliminar/anonimizar irreversiblemente datos y credenciales de rápido expirado. | `sweep.quickTeams` o recuperación de pendientes. | Tras marcar `EXPIRED`. |
| `JOB-CLOSE-01` | `close.dueAvailabilityRequests` | Cerrar solicitudes abiertas con deadline vencido. | Scheduler recurrente. | Periodicidad corta, por ejemplo cada 5-15 min. |
| `JOB-CLOSE-02` | `close.dueDecisions` | Cerrar consultas abiertas con deadline vencido sin resolverlas. | Scheduler recurrente. | Periodicidad corta, por ejemplo cada 5-15 min. |
| `JOB-CLEAN-01` | `cleanup.credentialsAndSessions` | Revocar/purgar tokens y sesiones caducadas sin token claro. | Scheduler recurrente. | Diario u horario según volumen. |
| `JOB-MAINT-01` | `recover.stuckJobs` | Detectar trabajos fallidos/dead-letter y exponerlos a operación. | Scheduler recurrente / pg-boss monitoring. | Diario o por alerta. |

No se crean jobs para:

- notificaciones externas automáticas de solicitudes, propuestas, encuestas, recordatorios o expiración;
- recalcular disponibilidad/votos como proceso asíncrono obligatorio;
- resolver consultas automáticamente;
- invocar IA en segundo plano;
- enviar mensajes por WhatsApp Business, push o chat.

## 5. Detalle de jobs

### `JOB-EMAIL-01` — `email.adminVerification`

| Campo | Diseño |
|---|---|
| Producer | Caso de uso `createManagedTeam` o `resendVerification`. |
| Trigger | Enqueue tras commit de `VerificationLink` hasheado. |
| Payload mínimo | `teamId`, `administrativeIdentityId`, `verificationCredentialId`, `locale`. |
| Handler | Carga token metadata, comprueba no usado/no revocado/no expirado, compone URL, envía con Resend/Mailpit. |
| Idempotency key | `email.adminVerification:{verificationCredentialId}`. |
| Retries/backoff | 5 intentos, backoff exponencial con jitter; no regenerar token automáticamente. |
| Failure handling | Marcar job failed/dead-letter; permitir reenviar verificación desde UI creando token nuevo. |
| Observabilidad | `jobId`, `teamId`, `credentialId`, provider message id, estado, latencia; nunca token claro. |

### `JOB-EMAIL-02` — `email.adminRecovery`

| Campo | Diseño |
|---|---|
| Producer | Caso de uso `requestAdminRecovery`. |
| Trigger | Enqueue solo si existe identidad elegible; la respuesta API siempre es genérica. |
| Payload mínimo | `teamId`, `administrativeIdentityId`, `recoveryCredentialId`, `locale`. |
| Handler | Comprueba token vigente y envía recovery link. |
| Idempotency key | `email.adminRecovery:{recoveryCredentialId}`. |
| Retries/backoff | 5 intentos, backoff exponencial con jitter. |
| Failure handling | Dead-letter operacional; nueva solicitud invalida tokens anteriores. |
| Observabilidad | Igual que verificación, sin revelar enumeración al usuario. |

### `JOB-EMAIL-03` — `email.accountAuth`

| Campo | Diseño |
|---|---|
| Producer | Flujo de cuenta si se implementa passwordless/verificación. |
| Trigger | Tras commit de token de cuenta. |
| Payload mínimo | `accountId` o email normalizado, `credentialId`, `locale`. |
| Handler | Enviar enlace de cuenta. |
| Idempotency key | `email.accountAuth:{credentialId}`. |
| Retries/backoff | 5 intentos, exponencial con jitter. |
| Failure handling | Dead-letter; usuario puede pedir nuevo enlace. |
| Observabilidad | Sin token claro ni PII adicional. |

Nota: si la cuenta se difiere o se usa OIDC externo, este job no se activa.

### `JOB-LIFE-01` — `sweep.quickTeams`

| Campo | Diseño |
|---|---|
| Producer | Scheduler recurrente pg-boss. |
| Trigger | Cada hora como default inicial. |
| Payload mínimo | Ninguno o `batchSize`, `now`. |
| Handler | Selecciona rápidos `ACTIVE` con `lastRelevantActivityAt <= now-30d`; pasa a `RECOVERABLE`. Selecciona `RECOVERABLE` con `recoverableSince <= now-14d`; pasa a `EXPIRED`, revoca sesiones/links y encola purga. |
| Idempotency key | `sweep.quickTeams:{floor(now/hour)}` para evitar duplicar barridos concurrentes. |
| Retries/backoff | 3 intentos; backoff lineal corto. |
| Failure handling | Reintento seguro; el siguiente sweep vuelve a evaluar estados. |
| Observabilidad | Contadores `activeToRecoverable`, `recoverableToExpired`, `purgeJobsEnqueued`, duración, errores. |

Reglas:

- Recalcular precondiciones dentro de la transacción.
- No contar visitas pasivas ni jobs como actividad.
- No enviar emails de expiración en MVP.
- Vinculación a cuenta no altera plazos.

### `JOB-LIFE-02` — `purge.expiredQuickTeam`

| Campo | Diseño |
|---|---|
| Producer | `sweep.quickTeams` al marcar `EXPIRED`; también scheduler de recuperación si hay expirados sin purga. |
| Trigger | Tras commit de `EXPIRED`. |
| Payload mínimo | `teamId`, `expiredAt`, `purgeMode=DELETE_DOMAIN_DATA`. |
| Handler | Verifica que el equipo sigue `EXPIRED`; borra físicamente dominio, participantes, disponibilidad, consultas, credenciales y sesiones. Solo conserva métricas agregadas y trazas minimizadas sin PII ni tokens. |
| Idempotency key | `purge.expiredQuickTeam:{teamId}`. |
| Retries/backoff | 5 intentos, exponencial. |
| Failure handling | Dead-letter crítico; alerta operacional hasta completar. |
| Observabilidad | Equipo, modo, filas afectadas por tipo, duración, errores; sin PII. |

Reglas:

- Nunca reactivar un equipo `EXPIRED`.
- Tras `EXPIRED`, enlaces antiguos devuelven `TEAM_EXPIRED` o inaccesible.
- La purga debe tolerar ejecución repetida.

### `JOB-CLOSE-01` — `close.dueAvailabilityRequests`

| Campo | Diseño |
|---|---|
| Producer | Scheduler recurrente. |
| Trigger | Cada 5-15 minutos. |
| Payload mínimo | `batchSize`, `now`. |
| Handler | Selecciona solicitudes `OPEN` con `deadlineAt <= now`; cierra si siguen abiertas. |
| Idempotency key | `close.dueAvailabilityRequests:{floor(now/window)}`. |
| Retries/backoff | 3 intentos; siguiente sweep corrige. |
| Failure handling | Reintento seguro; alertar si backlog crece. |
| Observabilidad | Número cerrado, duración, lag máximo de deadline. |

Reglas:

- No modifica disponibilidad.
- No envía recordatorios ni avisos externos.
- La lectura/API debe validar deadline también para evitar aceptar respuestas después de vencido aunque el sweep vaya tarde.

### `JOB-CLOSE-02` — `close.dueDecisions`

| Campo | Diseño |
|---|---|
| Producer | Scheduler recurrente. |
| Trigger | Cada 5-15 minutos. |
| Payload mínimo | `batchSize`, `now`. |
| Handler | Selecciona consultas `OPEN/PENDING` con `deadlineAt <= now`; pasa a `CLOSED/PENDING`. |
| Idempotency key | `close.dueDecisions:{floor(now/window)}`. |
| Retries/backoff | 3 intentos; siguiente sweep corrige. |
| Failure handling | Reintento seguro; alertar si lag de deadline supera umbral. |
| Observabilidad | Número cerrado, duración, lag máximo, conflictos. |

Reglas:

- Nunca registra resolución.
- No elige ganador ni aplica desempates.
- La API debe rechazar respuestas si detecta deadline vencido aunque el job aún no cerró.

### `JOB-CLEAN-01` — `cleanup.credentialsAndSessions`

| Campo | Diseño |
|---|---|
| Producer | Scheduler recurrente. |
| Trigger | Diario inicialmente; horario si el volumen lo exige. |
| Payload mínimo | `before`, `batchSize`. |
| Handler | Purga o marca caducados tokens/sesiones expirados/revocados, respetando retención mínima de seguridad. |
| Idempotency key | `cleanup.credentialsAndSessions:{date}`. |
| Retries/backoff | 3 intentos. |
| Failure handling | Siguiente ejecución continúa; alerta si backlog crece. |
| Observabilidad | Filas purgadas por tipo, backlog, errores. |

Reglas:

- No registra tokens claros.
- No revoca sesiones válidas salvo política explícita o expiración.
- Expiración de equipo rápido invalida sus credenciales de forma prioritaria.

### `JOB-MAINT-01` — `recover.stuckJobs`

| Campo | Diseño |
|---|---|
| Producer | Scheduler operativo o monitor de pg-boss. |
| Trigger | Diario o por alerta. |
| Payload mínimo | `olderThan`, `queues`. |
| Handler | Lista jobs en fallo/dead-letter, agrega métricas y, si la política lo permite, reencola trabajos idempotentes. |
| Idempotency key | `recover.stuckJobs:{date}`. |
| Retries/backoff | No crítico; 1-2 intentos. |
| Failure handling | Alerta operacional. |
| Observabilidad | Dead-letter por cola, antigüedad, reencolados. |

## 6. Deadlines: job específico, sweep o lazy

| Caso | Estrategia MVP | Motivo |
|---|---|---|
| Solicitud de disponibilidad con deadline | Sweep periódico + validación on-write/on-read. | Evita un job por solicitud; el retraso de pocos minutos es aceptable y la API no acepta respuestas vencidas. |
| Consulta con deadline | Sweep periódico + validación on-write/on-read. | Cierra participación sin resolver; evita programar un job por consulta en el MVP. |
| Equipo rápido `ACTIVE → RECOVERABLE` | Sweep periódico + evaluación lazy al acceso. | No requiere precisión al segundo; acceso puede mostrar estado actualizado. |
| Equipo rápido `RECOVERABLE → EXPIRED` | Sweep periódico + evaluación lazy estricta al acceso. | La expiración definitiva debe aplicarse antes de permitir cualquier mutación. |
| Purga de equipo rápido expirado | Job por equipo expirado + recovery sweep. | Es trabajo pesado/irreversible y debe ser observable. |
| Tokens/sesiones caducados | Cleanup periódico. | No necesita job por token. |

Validación lazy significa que las operaciones sensibles consultan estado/fechas y aplican la transición o rechazo antes de mutar. No sustituye el sweep; lo complementa para corregir lag.

## 7. Idempotencia y entrega al menos una vez

| Riesgo | Control |
|---|---|
| Email duplicado | Idempotency key por credential; provider message id guardado si procede; reenviar manual crea token nuevo. |
| Cierre duplicado | Update condicional `WHERE state=OPEN` o `participationState=OPEN`; repetir no cambia resultado. |
| Expiración duplicada | Update condicional por estado y timestamp; purge job unique por `teamId`. |
| Purga parcial | Handler por pasos idempotentes, registra progreso mínimo o recalcula filas pendientes. |
| Jobs concurrentes | Locks/unique keys pg-boss y update condicional en DB. |
| Job retrasado | Revalidar precondiciones con `now` real antes de actuar. |

## 8. Observabilidad

Métricas mínimas:

- jobs completados/fallidos por cola;
- tiempo en cola y duración de handler;
- retry count;
- deadline lag máximo;
- quick teams movidos por estado;
- purge backlog;
- emails enviados/fallidos por tipo;
- dead-letter count por cola.

Logging:

- incluir `jobId`, `queue`, `teamId`/`resourceId` cuando aplique;
- nunca token claro, email completo si no es imprescindible, ni disponibilidad nominal innecesaria;
- errores con `code` estable.

Alertas iniciales:

- dead-letter crítico en `purge.expiredQuickTeam`;
- backlog de deadlines mayor que umbral;
- fallo sostenido de email transaccional;
- cleanup sin ejecutar más de una ventana esperada.

## 9. Eventos internos síncronos recomendados

| Evento | Emitido por | Consumidores síncronos | Jobs derivados |
|---|---|---|---|
| `RelevantHumanActivityRecorded` | Mutaciones humanas válidas | Teams lifecycle policy | Ninguno directo. |
| `ManagedTeamVerificationRequested` | Crear/reemitir verificación | Audit, enqueue after commit | `email.adminVerification`. |
| `AdminRecoveryRequested` | Solicitud de recovery elegible | Audit, enqueue after commit | `email.adminRecovery`. |
| `AvailabilityRequestCreated` | Crear solicitud | Audit | Ninguno de notificación en MVP. |
| `DecisionCreated` | Crear propuesta/encuesta | Audit | Ninguno de notificación en MVP; deadline cubierto por sweep. |
| `DecisionResolved` | Resolver consulta | Audit | Ninguno. |
| `QuickTeamExpired` | Lifecycle sweep/lazy transition | Audit, enqueue after commit | `purge.expiredQuickTeam`. |

Los eventos no son contrato público ni se publican a otro sistema en el MVP.

## 10. Exclusiones explícitas

- Redis, RabbitMQ, Kafka u otro broker.
- Event Sourcing.
- CQRS.
- Notificaciones automáticas de actividad.
- Recordatorios externos.
- Resolución automática de consultas.
- Recalcular resultados como job obligatorio.
- Workers IA autónomos.

## 11. Referencias

- `architecture/adr/ADR-016-async-jobs.md`
- `architecture/adr/ADR-017-email-notifications.md`
- `technical-design/14-state-machines/state-machines.md`
- `technical-design/19-sequences/sequence-diagrams.md`
