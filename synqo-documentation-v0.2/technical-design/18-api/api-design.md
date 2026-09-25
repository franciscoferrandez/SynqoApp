# 18 — API Design

## 1. Propósito

Este documento define el contrato REST JSON inicial de Synqo y acompaña a `openapi.yaml`. La API está diseñada para el frontend web/PWA del MVP, sin exponer el esquema de PostgreSQL como contrato público.

Referencias principales: ADR-006, diseño de dominio, matriz de autorización, diseño de identidad/sesiones, modelo de datos y requisitos funcionales.

## 2. Principios

- REST JSON + OpenAPI es la frontera contractual.
- El recurso principal de navegación es `Team`, identificado externamente por `teamRef`.
- `Cuenta`, `Participante` y administración son contextos distintos; las cookies/sesiones aportan contexto y la API reautoriza cada operación.
- Las mutaciones críticas son idempotentes cuando hay riesgo de doble submit.
- Las operaciones de resolución usan control de concurrencia optimista.
- Los endpoints IA solo interpretan/sugieren; nunca publican, resuelven, cancelan ni mutan el dominio.
- Los enlaces sensibles se canjean por sesión y redirigen o devuelven `redirectTo` sin conservar token en URL final.

## 3. Convenciones HTTP

| Aspecto | Decisión |
|---|---|
| Base path | `/api/v1` |
| Formato | JSON UTF-8 |
| Auth web | Cookies `HttpOnly` server-side (`synqo_account_session`, `synqo_context_session`) + CSRF en mutaciones. |
| Idempotencia | Header `Idempotency-Key` recomendado/obligatorio en creación de equipo, participante, solicitud, consulta, respuesta y resolución. |
| Concurrencia | `version` en DTO y `If-Match` opcional para cierre/resolución/cancelación de consultas. |
| Paginación | Cursor simple (`cursor`, `limit`) para historial/listados largos. |
| Fechas | `YYYY-MM-DD` para fechas locales del equipo; `date-time` ISO 8601 para instantes. |
| Errores | `application/problem+json` compatible con RFC 9457, extendido con `code` y `details`. |

## 4. Recursos principales

| Recurso API | No expone directamente | Notas |
|---|---|---|
| `/teams` | tabla `teams` | Crea rápido/administrable y lee contexto operativo. |
| `/teams/{teamRef}/participants` | tabla `participants` | Gestiona identidad local, no cuenta global. |
| `/teams/{teamRef}/availability` | `availability_entries` | Upsert por fecha y agregación colectiva. |
| `/teams/{teamRef}/availability-requests` | request + snapshot | Responder actualiza disponibilidad general. |
| `/teams/{teamRef}/decisions` | `decision_processes` | Superficie común para propuestas y encuestas. |
| `/teams/{teamRef}/proposals` | detalle propuesta | Alias de creación/lectura filtrada por tipo. |
| `/teams/{teamRef}/surveys` | detalle encuesta | Alias de creación/lectura filtrada por tipo. |
| `/access/*` | `access_credentials` | Canje de enlaces y creación/revocación. |
| `/admin/*` | identidades/sesiones admin | Verificación y recuperación administrativa. |
| `/account/*` | cuenta + vínculos | Cuenta global y agregados diferibles. |
| `/ai/*` | proveedor IA | Interpretación estructurada y candidatos deterministas. |

## 5. Endpoints por capacidad

### Teams

| Método | Path | Autorización | Idempotencia | Resultado |
|---|---|---|---|---|
| `POST` | `/teams/quick` | Público | Sí | Crea equipo rápido, participante inicial y sesión contextual. |
| `POST` | `/teams/managed` | Público | Sí | Crea equipo administrable pendiente y envía verificación. |
| `GET` | `/teams/{teamRef}` | Link público o sesión | No | Contexto mínimo del equipo. |
| `GET` | `/teams/{teamRef}/home` | Participant/Admin | No | Home contextual, pendientes y navegación. |
| `PATCH` | `/teams/{teamRef}/settings` | Admin | Sí | Cambia políticas/estados habilitados. |
| `POST` | `/teams/{teamRef}/reactivate` | Participant en `RECOVERABLE` | Sí | Reactiva equipo rápido con actividad humana válida. |

### Participants

| Método | Path | Autorización | Idempotencia | Resultado |
|---|---|---|---|---|
| `POST` | `/teams/{teamRef}/participants` | Link público/sesión | Sí | Crea participante local y sesión. |
| `GET` | `/teams/{teamRef}/participants/me` | Participant | No | Participante actual. |
| `PATCH` | `/teams/{teamRef}/participants/me` | Participant | Sí | Actualiza display name. |
| `GET` | `/teams/{teamRef}/participants` | Participant/Admin | No | Directorio activo/histórico permitido. |
| `POST` | `/teams/{teamRef}/participants/me/deactivate` | Participant/Admin sobre actor autorizado | Sí | Marca inactivo. |

### Availability

| Método | Path | Autorización | Idempotencia | Resultado |
|---|---|---|---|---|
| `GET` | `/teams/{teamRef}/availability/me` | Participant | No | Disponibilidad propia por rango. |
| `PUT` | `/teams/{teamRef}/availability/me` | Participant | Sí | Upsert de días; no toca propuestas. |
| `GET` | `/teams/{teamRef}/availability/collective` | Participant/Admin | No | Recuentos por estado y detalle nominal si procede. |
| `GET` | `/teams/{teamRef}/availability/matches` | Participant/Admin | No | Candidatos ordenados determinísticamente. |

### Availability requests

| Método | Path | Autorización | Idempotencia | Resultado |
|---|---|---|---|---|
| `POST` | `/teams/{teamRef}/availability-requests` | Policy | Sí | Crea solicitud para participantes activos. |
| `GET` | `/teams/{teamRef}/availability-requests/{requestRef}` | Participant/Admin | No | Solicitud, rango, estado y progreso. |
| `PUT` | `/teams/{teamRef}/availability-requests/{requestRef}/response` | Participant Own | Sí | Actualiza disponibilidad general del intervalo. |
| `POST` | `/teams/{teamRef}/availability-requests/{requestRef}/close` | Creator/Policy/Admin/System | Sí | Cierra solicitud. |

### Decisions, proposals and surveys

| Método | Path | Autorización | Idempotencia | Resultado |
|---|---|---|---|---|
| `POST` | `/teams/{teamRef}/proposals` | Policy | Sí | Crea propuesta con opciones temporales. |
| `POST` | `/teams/{teamRef}/surveys` | Policy | Sí | Crea encuesta SINGLE/MULTIPLE. |
| `GET` | `/teams/{teamRef}/decisions` | Participant/Admin | No | Listado filtrable. |
| `GET` | `/teams/{teamRef}/decisions/{decisionRef}` | Participant/Admin | No | Consulta, opciones, resultado y respuesta propia. |
| `PUT` | `/teams/{teamRef}/decisions/{decisionRef}/response` | Participant Own | Sí | Responde propuesta o encuesta abierta. |
| `POST` | `/teams/{teamRef}/decisions/{decisionRef}/close` | Creator/Policy/Admin/System | Sí + versión | Cierra participación sin resolver. |
| `POST` | `/teams/{teamRef}/decisions/{decisionRef}/resolve` | Policy/Admin | Sí + versión | Registra resolución explícita y cierra. |
| `POST` | `/teams/{teamRef}/decisions/{decisionRef}/cancel` | Creator/Policy/Admin | Sí + versión | Cancela y cierra. |

### Access, account and admin

| Método | Path | Autorización | Idempotencia | Resultado |
|---|---|---|---|---|
| `POST` | `/access/exchange` | Público con token/ref | Sí | Canjea link por sesión y `redirectTo`. |
| `POST` | `/teams/{teamRef}/access-links` | Participant/Admin según tipo | Sí | Crea link público/identificado permitido. |
| `DELETE` | `/teams/{teamRef}/access-links/{linkId}` | Own/Admin/System | Sí | Revoca link. |
| `POST` | `/admin/verify` | Token verificación | Sí | Activa admin/team y crea sesión admin. |
| `POST` | `/admin/recovery-requests` | Público | Sí | Respuesta genérica y email si procede. |
| `POST` | `/admin/recover` | Token recovery | Sí | Recupera sesión admin. |
| `POST` | `/account/link-participant` | Account + Participant | Sí | Vincula cuenta sin recrear participante. |
| `GET` | `/account/home` | Account | No | Agregado de equipos/pendientes vinculados. |

### AI

| Método | Path | Autorización | Idempotencia | Resultado |
|---|---|---|---|---|
| `POST` | `/teams/{teamRef}/ai/interpret-coordination` | Participant/Admin | No | Interpreta texto a restricciones estructuradas y candidatos. |

Este endpoint no crea propuestas. El usuario debe confirmar usando `/teams/{teamRef}/proposals`.

## 6. DTOs principales

Los nombres completos están en `openapi.yaml`. Resumen:

- `TeamSummary`, `TeamHome`, `Participant`, `TeamSettings`.
- `AvailabilityEntry`, `CollectiveAvailabilityDay`, `CandidateDate`.
- `AvailabilityRequest`, `AvailabilityRequestProgress`.
- `Decision`, `DecisionOption`, `ProposalOptionInput`, `SurveyOptionInput`, `DecisionResult`, `Resolution`.
- `DecisionResponseInput`, con variantes `proposal` y `survey`.
- `AccessExchangeResponse`, `ProblemDetails`, `AiInterpretationRequest`, `AiInterpretationResponse`.

Los DTOs usan referencias públicas (`teamRef`, `participantRef`, `decisionRef`, `optionId` público) y no exponen IDs internos de tablas salvo que el contrato defina expresamente un identificador opaco.

## 7. Errores

| HTTP | Code | Uso |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | Payload inválido, fecha fuera de rango, opción insuficiente. |
| 401 | `AUTHENTICATION_REQUIRED` | No hay sesión o token intercambiable. |
| 403 | `FORBIDDEN_BY_TEAM_POLICY` | Actor válido sin permiso contextual. |
| 404 | `RESOURCE_NOT_FOUND` | Recurso inexistente o inaccesible sin revelar detalles. |
| 409 | `INVALID_STATE_TRANSITION` | Consulta cerrada, equipo expirado, transición no permitida. |
| 409 | `CONCURRENT_MODIFICATION` | `version`/`If-Match` obsoleto. |
| 410 | `TOKEN_EXPIRED_OR_USED` | Link caducado/usado/revocado. |
| 422 | `DOMAIN_RULE_VIOLATION` | Regla de negocio incumplida. |
| 429 | `RATE_LIMITED` | Protección anti-abuso. |
| 501 | `FEATURE_NOT_IN_MVP` | Capacidad documentada fuera del MVP. |

## 8. Reintentos seguros

| Operación | Estrategia |
|---|---|
| Crear equipo/participante/solicitud/consulta | `Idempotency-Key`; repetir devuelve el recurso creado o estado compatible. |
| Upsert disponibilidad | Naturalmente idempotente por `(participant, date)`. |
| Responder solicitud/consulta | `PUT` reemplaza respuesta del participante; seguro ante reintentos. |
| Cerrar/resolver/cancelar | `Idempotency-Key` + `version`/`If-Match`; si ya produjo el mismo resultado puede devolver 200/201 idempotente. |
| Canjear token one-time | Reintento exacto dentro de una ventana corta puede devolver la sesión/redirect si corresponde; de lo contrario `410`. |

## 9. Cobertura E2E

| Recorrido | Endpoints mínimos |
|---|---|
| E2E-01 Coordinación temporal | crear/open team, create participant, PUT availability, GET matches, POST proposal, PUT decision response, GET result, POST resolve. |
| E2E-02 Decisión colectiva | POST survey, PUT decision response, GET result, POST resolve. |
| E2E-03 Administrable | POST managed team, POST admin verify, PATCH settings, create participant/continue usage. |

## 10. Fuera de alcance

- No se exponen endpoints de chat, recurrencia automática, franjas horarias de disponibilidad general, subgrupos arbitrarios ni notificaciones externas automáticas de actividad.
- No se expone API administrativa genérica de roles.
- No se expone endpoint IA de mutación de dominio.

## 11. Referencias

- `architecture/adr/ADR-006-api-style.md`
- `technical-design/15-authorization/authorization-matrix.md`
- `technical-design/16-identity-sessions/identity-and-session-design.md`
- `technical-design/17-data-model/data-model.md`
- `product/09-functional-requirements.md`
