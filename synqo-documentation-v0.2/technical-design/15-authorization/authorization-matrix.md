# 15 — Authorization Matrix

## 1. Propósito

Esta matriz convierte ADR-022 y los permisos de producto en reglas server-side implementables. Synqo no usa RBAC genérico: evalúa `actor + equipo + modalidad + política + recurso + operación`.

La UI puede ocultar acciones, pero la API debe volver a autorizar cada lectura sensible y cada mutación.

## 2. Actores y contextos

| Código | Actor/contexto | Descripción | Capacidades base |
|---|---|---|---|
| `ANON` | Público no identificado | No tiene sesión contextual; puede abrir enlaces públicos válidos. | Crear equipo, canjear enlace público/identificado/admin, iniciar identificación. |
| `PARTICIPANT` | Participante | Sesión contextual `teamId + participantId`, sin cuenta global. | Operar como participante activo dentro de su equipo. |
| `ACCOUNT_PARTICIPANT` | Participante con cuenta | Cuenta global autenticada y participación vinculada en el equipo. | Igual que participante, más vistas agregadas de cuenta cuando proceda. |
| `ADMIN` | Administrador sin cuenta | Sesión administrativa contextual obtenida por verificación/recovery. | Administrar equipo administrable concreto. |
| `ACCOUNT_ADMIN` | Administrador con cuenta | Cuenta global autenticada con administración vinculada. | Igual que administrador, más continuidad de cuenta. |
| `INVALID` | Sesión inválida/expirada | Credencial caducada, revocada, corrupta o de otro equipo. | Ninguna; debe reautenticarse o canjear enlace válido. |
| `SYSTEM` | Sistema/job | Jobs internos de expiración, deadlines, limpieza. | Ejecutar transiciones internas sin actuar como usuario. |

Un mismo request puede tener cuenta y contexto de participante/admin; la autorización siempre se evalúa contra el equipo y la capacidad contextual requerida.

## 3. Políticas de equipo

### Equipo rápido

| Capacidad | Política |
|---|---|
| Crear solicitud | Cualquier participante activo. |
| Crear propuesta | Cualquier participante activo. |
| Crear encuesta | Cualquier participante activo. |
| Responder disponibilidad/consulta | Participante activo destinatario. |
| Resolver consulta | Cualquier participante activo. |
| Configurar equipo | No aplica; no hay administración formal. |
| Recuperar/reactivar | Interacción humana válida durante `RECOVERABLE`. |

### Equipo administrable

| Capacidad | Default MVP | Valores configurables |
|---|---|---|
| Crear solicitud | `EVERYONE` | `EVERYONE` o `ADMINISTRATORS` |
| Crear propuesta/encuesta | `EVERYONE` | `EVERYONE` o `ADMINISTRATORS` |
| Resolver consulta | `ADMINISTRATORS` | `EVERYONE` o `ADMINISTRATORS` |
| Configurar equipo | Administración verificada | No configurable en MVP |
| Estados de disponibilidad | `AVAILABLE`, `MAYBE`, `UNAVAILABLE` habilitados | No deshabilitar simultáneamente `AVAILABLE` y `UNAVAILABLE` |

## 4. Matriz por recurso

Leyenda:

- `Allow`: permitido si las validaciones de recurso pasan.
- `Policy`: depende de modalidad/política del equipo.
- `Own`: solo sobre el propio participante/respuesta/dato.
- `Admin`: requiere administración verificada del equipo.
- `System`: solo job interno.
- `Deny`: no permitido.
- `PublicLink`: requiere enlace público válido y no concede identidad por sí mismo.
- `Exchange`: canjea credencial opaca por sesión contextual si es válida.

### Team

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `createQuickTeam` | Allow | Allow | Allow | Allow | Allow | Deny | Deny |
| `createManagedTeam` | Allow | Allow | Allow | Allow | Allow | Deny | Deny |
| `readTeamPublicContext` | PublicLink | Allow | Allow | Allow | Allow | Deny | Deny |
| `readTeamHome` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `reactivateQuickTeam` | Deny | Allow | Allow | Deny | Deny | Deny | Deny |
| `expireQuickTeam` | Deny | Deny | Deny | Deny | Deny | Deny | System |
| `purgeExpiredQuickTeam` | Deny | Deny | Deny | Deny | Deny | Deny | System |
| `archiveManagedTeam` | Deny | Deny | Deny | Future | Future | Deny | Deny |

### Participant

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `createParticipantFromPublicLink` | PublicLink | Allow | Allow | Admin | Admin | Deny | Deny |
| `readParticipantSelf` | Deny | Own | Own | Admin | Admin | Deny | Deny |
| `readParticipantDirectory` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `updateParticipantSelfDisplayName` | Deny | Own | Own | Deny | Deny | Deny | Deny |
| `deactivateParticipant` | Deny | Own | Own | Admin | Admin | Deny | Deny |
| `linkParticipantToAccount` | Deny | Own | Own | Deny | Deny | Deny | Deny |
| `claimParticipantByName` | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

### Availability

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `readOwnAvailability` | Deny | Own | Own | Deny | Deny | Deny | Deny |
| `updateOwnAvailability` | Deny | Own | Own | Deny | Deny | Deny | Deny |
| `readCollectiveAvailability` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `readNominalAvailabilityDetail` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `calculateMatches` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `updateOtherParticipantAvailability` | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

### Availability Request

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `createAvailabilityRequest` | Deny | Policy | Policy | Admin/Policy | Admin/Policy | Deny | Deny |
| `readAvailabilityRequest` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `respondAvailabilityRequest` | Deny | Own | Own | Deny | Deny | Deny | Deny |
| `closeAvailabilityRequest` | Deny | Policy | Policy | Admin/Policy | Admin/Policy | Deny | System if deadline |
| `reopenAvailabilityRequest` | Deny | Future | Future | Future | Future | Deny | Deny |
| `sendExternalRequestNotification` | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

### Proposal

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `createProposal` | Deny | Policy | Policy | Admin/Policy | Admin/Policy | Deny | Deny |
| `readProposal` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `respondProposal` | Deny | Own | Own | Deny | Deny | Deny | Deny |
| `modifyProposalOptions` | Deny | CreatorBeforeResponses | CreatorBeforeResponses | AdminBeforeResponses | AdminBeforeResponses | Deny | Deny |
| `closeProposal` | Deny | CreatorOrPolicy | CreatorOrPolicy | Admin/Policy | Admin/Policy | Deny | System if deadline |
| `cancelProposal` | Deny | CreatorOrPolicy | CreatorOrPolicy | Admin/Policy | Admin/Policy | Deny | Deny |
| `resolveProposal` | Deny | Policy | Policy | Admin/Policy | Admin/Policy | Deny | Deny |

### Survey

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `createSurvey` | Deny | Policy | Policy | Admin/Policy | Admin/Policy | Deny | Deny |
| `readSurvey` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `voteSurvey` | Deny | Own | Own | Deny | Deny | Deny | Deny |
| `modifySurveyOptions` | Deny | CreatorBeforeResponses | CreatorBeforeResponses | AdminBeforeResponses | AdminBeforeResponses | Deny | Deny |
| `closeSurvey` | Deny | CreatorOrPolicy | CreatorOrPolicy | Admin/Policy | Admin/Policy | Deny | System if deadline |
| `cancelSurvey` | Deny | CreatorOrPolicy | CreatorOrPolicy | Admin/Policy | Admin/Policy | Deny | Deny |
| `resolveSurvey` | Deny | Policy | Policy | Admin/Policy | Admin/Policy | Deny | Deny |

### Response / Result / Resolution

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `readOwnResponse` | Deny | Own | Own | Deny | Deny | Deny | Deny |
| `readAggregatedResult` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `readNominalResult` | Deny | VisibilityPolicy | VisibilityPolicy | Admin | Admin | Deny | Deny |
| `recordResolution` | Deny | Policy | Policy | Admin/Policy | Admin/Policy | Deny | Deny |
| `updateResolution` | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| `deleteResponse` | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

### Settings

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `readSettings` | Deny | ManagedReadLimited | ManagedReadLimited | Admin | Admin | Deny | Deny |
| `updateCreationPolicy` | Deny | Deny | Deny | Admin | Admin | Deny | Deny |
| `updateResolutionPolicy` | Deny | Deny | Deny | Admin | Admin | Deny | Deny |
| `updateAvailabilityStates` | Deny | Deny | Deny | Admin | Admin | Deny | Deny |
| `recoverAdministration` | Exchange | Deny | Deny | Exchange | Exchange | Deny | Deny |
| `linkAdministrationToAccount` | Deny | Deny | Deny | Admin | Admin | Deny | Deny |

### Access Links

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `openPublicLink` | PublicLink | Allow | Allow | Allow | Allow | Deny | Deny |
| `exchangeIdentifiedLink` | Exchange | Exchange | Exchange | Deny | Deny | Deny | Deny |
| `exchangeAdminVerificationLink` | Exchange | Deny | Deny | Exchange | Exchange | Deny | Deny |
| `createShareLink` | Deny | Allow | Allow | Admin | Admin | Deny | Deny |
| `createIdentifiedParticipantLink` | Deny | Own | Own | Admin | Admin | Deny | Deny |
| `revokeAccessLink` | Deny | Own | Own | Admin | Admin | Deny | System |

### History

| Operación | ANON | PARTICIPANT | ACCOUNT_PARTICIPANT | ADMIN | ACCOUNT_ADMIN | INVALID | SYSTEM |
|---|---|---|---|---|---|---|---|
| `readTeamHistory` | Deny | Allow | Allow | Allow | Allow | Deny | Deny |
| `readHistoricalOwnAuthorship` | Deny | Own | Own | Admin | Admin | Deny | Deny |
| `readAccountAggregatedHistory` | Deny | Deny | OwnAccount | Deny | OwnAccount | Deny | Deny |
| `mutateHistoricalResult` | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

## 5. Resolución de marcadores de política

| Marcador | Significado |
|---|---|
| `Policy` | En rápido: participante activo. En administrable: depende de política `EVERYONE`/`ADMINISTRATORS`. |
| `Admin/Policy` | Si política administrable permite `EVERYONE`, participante activo puede; si no, solo admin. En rápido no existe admin formal y aplica participante activo. |
| `Own` | Recurso pertenece al participante de la sesión y al mismo equipo. |
| `OwnAccount` | Recurso pertenece a la cuenta autenticada y a participaciones vinculadas. |
| `CreatorBeforeResponses` | Creador de la consulta, misma sesión contextual o vínculo verificable, consulta abierta y sin respuestas. |
| `AdminBeforeResponses` | Admin verificado, consulta abierta y sin respuestas. |
| `CreatorOrPolicy` | Creador si sigue teniendo participación válida, o actor permitido por política del equipo. |
| `VisibilityPolicy` | Resultado agregado siempre para participantes activos; detalle nominal solo si la visibilidad/configuración lo permite. |
| `ManagedReadLimited` | Lectura de configuración necesaria para comprender reglas del equipo, sin secretos ni tokens. |
| `Exchange` | Canje de credencial opaca válida, de alcance mínimo, no expirada/revocada, por sesión contextual. |

## 6. Operaciones fuera del MVP

Estas operaciones deben devolver `FEATURE_NOT_IN_MVP` o no exponerse:

- notificaciones externas automáticas de actividad;
- subgrupos arbitrarios de destinatarios;
- roles genéricos configurables;
- anonimato fuerte;
- recurrencia automática;
- franjas horarias de disponibilidad general;
- conversión rápida a administrable;
- archivo/restauración de equipo administrable.
