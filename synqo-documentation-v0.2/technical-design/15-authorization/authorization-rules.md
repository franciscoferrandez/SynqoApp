# 15 — Authorization Rules

## 1. Principios

- La autorización es server-side y obligatoria en toda operación sensible.
- La UI puede mostrar/ocultar acciones, pero nunca es autoridad.
- No hay RBAC genérico ni roles arbitrarios en MVP.
- La unidad de decisión es `actor + equipo + recurso + operación + estado`.
- Una cuenta global no concede por sí misma capacidades dentro de un equipo.
- Un enlace público no concede identidad administrativa ni apropiación de participante.
- Los enlaces con identidad/capacidad se canjean por sesión contextual y después se usa URL limpia.

## 2. Modelo conceptual de actor

```ts
type ActorContext =
  | { kind: 'anonymous' }
  | { kind: 'participant'; teamId: TeamId; participantId: ParticipantId; accountId?: AccountId }
  | { kind: 'administrator'; teamId: TeamId; administrativeIdentityId: AdministrativeIdentityId; accountId?: AccountId }
  | { kind: 'account'; accountId: AccountId }
  | { kind: 'system'; jobName: string }
  | { kind: 'invalid'; reason: 'expired' | 'revoked' | 'malformed' | 'wrong-scope' };
```

Una request puede combinar cuenta con participant/admin session. Para mutaciones de equipo se exige siempre contexto contextual (`participant` o `administrator`) salvo creación/canje de enlaces.

## 3. Capacidades conceptuales

Las capacidades no son roles globales. Son nombres estables para evaluar operaciones:

| Capacidad | Recurso principal |
|---|---|
| `team.createQuick` | Team |
| `team.createManaged` | Team |
| `team.read` | Team |
| `team.reactivateQuick` | Team |
| `team.expireQuick` | Team |
| `participant.create` | Participant |
| `participant.readSelf` | Participant |
| `participant.readDirectory` | Participant |
| `participant.updateSelf` | Participant |
| `participant.deactivate` | Participant |
| `participant.linkAccount` | Participant |
| `availability.readOwn` | Availability |
| `availability.updateOwn` | Availability |
| `availability.readCollective` | Availability |
| `availability.readNominalDetail` | Availability |
| `request.create` | AvailabilityRequest |
| `request.respond` | AvailabilityRequest |
| `request.close` | AvailabilityRequest |
| `decision.createProposal` | Proposal |
| `decision.createSurvey` | Survey |
| `decision.respondProposal` | ProposalResponse |
| `decision.voteSurvey` | SurveyVote |
| `decision.read` | DecisionProcess |
| `decision.readResult` | Result |
| `decision.readNominalResult` | Result |
| `decision.modifyOptions` | DecisionOption |
| `decision.close` | DecisionProcess |
| `decision.cancel` | DecisionProcess |
| `decision.resolve` | Resolution |
| `settings.read` | TeamSettings |
| `settings.update` | TeamSettings |
| `access.exchangePublic` | AccessLink |
| `access.exchangeIdentified` | AccessLink |
| `access.exchangeAdmin` | AccessLink |
| `access.createShareLink` | AccessLink |
| `access.revoke` | AccessLink |
| `history.readTeam` | History |
| `history.readAccountAggregated` | History |

## 4. Servicio conceptual de autorización

```ts
interface AuthorizationService {
  can(actor: ActorContext, operation: Operation, resource: ResourceRef, input?: AuthorizationInput): Promise<AuthorizationDecision>;
  assertCan(actor: ActorContext, operation: Operation, resource: ResourceRef, input?: AuthorizationInput): Promise<void>;
  listCapabilities(actor: ActorContext, teamId: TeamId): Promise<TeamCapabilities>;
}

type AuthorizationDecision =
  | { allowed: true; reason: string; constraints?: AuthorizationConstraints }
  | { allowed: false; reason: AuthorizationErrorCode };
```

La API debería usar `assertCan` antes de mutar y `can/listCapabilities` solo para lectura de capacidades. `listCapabilities` no sustituye la validación al ejecutar.

## 5. Flujo server-side obligatorio

Para cualquier operación sobre recurso contextual:

1. Resolver sesión o credencial opaca.
2. Determinar `ActorContext`.
3. Cargar recurso por identificador interno o público permitido.
4. Verificar pertenencia estricta a `teamId`.
5. Verificar estado del equipo: no `EXPIRED`; si `RECOVERABLE`, solo permitir reactivación válida y operaciones definidas.
6. Verificar participante activo cuando la operación requiera participación.
7. Verificar administración verificada cuando requiera administración.
8. Evaluar política del equipo (`QUICK` fija; `MANAGED` configurable).
9. Verificar estado del recurso: solicitud abierta, consulta abierta/pendiente, opciones sin respuestas, etc.
10. Ejecutar mutación dentro de transacción cuando aplique.
11. Auditar operaciones administrativas, resolución y rechazos relevantes sin registrar tokens/PII innecesaria.

## 6. Validaciones anti-IDOR y escalada

### Reglas generales

| Regla | Aplicación |
|---|---|
| `AUTH-IDOR-01` | Nunca confiar solo en IDs recibidos; cargar recurso y comparar `resource.teamId` con el contexto autorizado. |
| `AUTH-IDOR-02` | Un `participantId` de la request debe pertenecer al mismo `teamId` de la sesión participant. |
| `AUTH-IDOR-03` | Un `accountId` autenticado no permite operar participaciones no vinculadas. |
| `AUTH-IDOR-04` | Una admin session solo vale para su equipo administrable concreto. |
| `AUTH-IDOR-05` | Un enlace público no permite listar datos nominales ni operar como participante sin identificación cuando esta sea necesaria. |
| `AUTH-IDOR-06` | Tokens sensibles se validan por hash/alcance/expiración/revocación y no por datos expuestos en URL. |
| `AUTH-IDOR-07` | Operaciones de lectura nominal deben comprobar visibilidad y pertenencia igual que las mutaciones. |
| `AUTH-IDOR-08` | Los jobs `SYSTEM` solo pueden ejecutar operaciones internas predefinidas; no aceptan actor arbitrario externo. |

### Team

- Crear equipo rápido/administrable no requiere cuenta.
- Leer contexto por enlace público solo muestra información mínima necesaria para entrar/identificarse.
- Leer home del equipo exige participant/admin session del mismo equipo.
- Reactivar rápido exige equipo `RECOVERABLE` y actividad humana válida.
- Expirar/purgar rápido solo `SYSTEM`.

### Participant

- Crear participante desde enlace público válido no implica cuenta.
- Actualizar identidad local propia exige participant session del mismo equipo.
- Desactivar participante propio requiere contexto propio; desactivar otros participantes queda reservado a administración verificada según la matriz.
- Reclamar por nombre está prohibido: se requiere enlace identificado, sesión previa o prueba suficiente.
- Vincular a cuenta exige control de la cuenta y de la participant session.

### Availability

- Un participante solo modifica su propia disponibilidad.
- Administradores no editan disponibilidad de otros en MVP.
- Disponibilidad colectiva requiere pertenencia al equipo.
- Detalle nominal requiere pertenencia y respetar visibilidad/acceso del equipo.
- `UNANSWERED` no puede declararse como estado.

### Availability Request

- Crear solicitud usa la política de creación del equipo.
- Responder solicitud exige participant session propia, solicitud abierta, participante activo y fecha dentro del intervalo.
- Cerrar por deadline solo `SYSTEM`.
- Cierre manual se limita a creador o actor autorizado por política; la fase 18 concretará el endpoint exacto.
- Reapertura queda fuera de MVP salvo soporte explícito futuro.

### Proposal / Survey / Decision

- Crear propuesta/encuesta usa política de creación del equipo.
- Responder/votar exige participante activo y consulta `OPEN/PENDING`.
- Modificar opciones solo antes de respuestas y por creador/admin autorizado.
- Cerrar por deadline no requiere actor humano y no resuelve.
- Resolver exige política de resolución: rápido cualquier participante activo; administrable `ADMINISTRATORS` por defecto o `EVERYONE` si se configura.
- Cancelar exige creador o actor permitido por política; nunca borra histórico recibido.
- Consultas `CLOSED/RESOLVED` y `CLOSED/CANCELLED` no aceptan mutaciones.
- Resultado nominal respeta visibilidad `NOMINAL`/`AGGREGATED`; agregado no promete anonimato fuerte.

### Settings

- Solo admin verificado de equipo administrable puede modificar políticas/estados.
- Equipo rápido no tiene settings configurables de administración.
- La configuración no puede deshabilitar simultáneamente `AVAILABLE` y `UNAVAILABLE`.
- No se aceptan roles genéricos, permisos por usuario ni subconjuntos arbitrarios.

### Access Links

- Canjear un link identificado establece participant session acotada al equipo y participante.
- Canjear verificación/recovery admin establece o recupera administración contextual, no cuenta global salvo flujo separado.
- Tras canje exitoso, redirigir a URL limpia.
- Links sensibles deben poder revocarse cuando el modelo lo permita.
- Previews/crawlers no deben renovar actividad relevante ni consumir de forma peligrosa enlaces de un solo uso; el diseño de identidad está en `technical-design/16-identity-sessions/identity-and-session-design.md` y los jobs se cerrarán en fase 20.

### History

- Participantes del equipo pueden leer histórico del equipo mientras la política de retención lo permita.
- Una cuenta solo agrega histórico de participaciones vinculadas.
- La salida/inactivación de un participante no recalcula resultados pasados.
- No existe mutación del resultado histórico salvo corrección operativa futura explícita.

## 7. Resolución de políticas

```text
canByTeamPolicy(team, capability, actor):
  if team.mode == QUICK:
    return actor.kind == participant
       and actor.teamId == team.id
       and participant is active
       and team.lifecycleState in [ACTIVE, RECOVERABLE when action reactivates]

  if team.mode == MANAGED:
    policy = team.settings.policyFor(capability)
    if policy == EVERYONE:
      return actor is active participant of team OR verified admin of team
    if policy == ADMINISTRATORS:
      return actor is verified admin of team
```

Para lectura, `EVERYONE` no significa público: significa participantes activos y administración del equipo. `ANON` solo accede a contexto mínimo mediante enlace público válido.

## 8. Estados y autorización

| Recurso | Estado | Regla |
|---|---|---|
| Equipo rápido | `ACTIVE` | Operaciones normales según participant session. |
| Equipo rápido | `RECOVERABLE` | Permitir reactivación por actividad humana válida; bloquear mutaciones pasivas/automatizadas. |
| Equipo rápido | `EXPIRED` | Denegar toda operación contextual; permitir solo lectura mínima de error si procede. |
| Equipo administrable | `PENDING_VERIFICATION` | No conceder administración persistente; permitir verificación/reenvío. |
| Equipo administrable | `ACTIVE` | Operaciones según política. |
| Solicitud | `OPEN` | Responder/cerrar según reglas. |
| Solicitud | `CLOSED` | Solo lectura; no respuestas. |
| Consulta | `OPEN/PENDING` | Responder, votar, cerrar, cancelar o resolver según reglas. |
| Consulta | `CLOSED/PENDING` | No responder; resolver/cancelar según reglas. |
| Consulta | `CLOSED/RESOLVED` | Solo lectura/histórico. |
| Consulta | `CLOSED/CANCELLED` | Solo lectura/histórico. |

## 9. Errores recomendados

| Código | Uso |
|---|---|
| `AUTHENTICATION_REQUIRED` | No hay sesión/enlace válido para operación no pública. |
| `INVALID_OR_EXPIRED_SESSION` | Sesión caducada, revocada o corrupta. |
| `INVALID_OR_EXPIRED_LINK` | Credencial opaca inválida, expirada, revocada o de alcance incorrecto. |
| `FORBIDDEN_BY_TEAM_POLICY` | Actor válido pero política no permite operación. |
| `FORBIDDEN_CROSS_TEAM_RESOURCE` | Recurso no pertenece al equipo del actor. |
| `ADMIN_VERIFICATION_REQUIRED` | Operación administrativa sin verificación. |
| `PARTICIPANT_INACTIVE` | Participante ya no es destinatario/actor válido para mutación. |
| `TEAM_EXPIRED` | Equipo rápido expirado definitivamente. |
| `RESOURCE_STATE_FORBIDS_OPERATION` | Estado de solicitud/consulta impide mutación. |
| `FEATURE_NOT_IN_MVP` | Operación fuera de alcance actual. |

## 10. Casos límite que deben probarse

- Participante de equipo A intenta responder consulta de equipo B.
- Cuenta autenticada intenta operar una participación no vinculada.
- Admin de equipo A intenta cambiar settings de equipo B.
- Enlace público intenta resolver una consulta.
- Link identificado expirado no crea sesión.
- Equipo rápido `EXPIRED` rechaza cualquier mutación aunque exista cuenta vinculada.
- Deadline cierra consulta y actor intenta responder después.
- Política administrable cambia de `EVERYONE` a `ADMINISTRATORS`; participante deja de poder resolver nuevas consultas.
- Encuesta `AGGREGATED` no expone relación nominal a participantes no admin.
- Doble submit de resolución produce una sola resolución aceptada.
