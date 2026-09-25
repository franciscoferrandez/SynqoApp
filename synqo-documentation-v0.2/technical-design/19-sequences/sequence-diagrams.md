# 19 — Sequence Diagrams

## 1. Propósito

Este documento alinea las interacciones runtime críticas entre frontend, API, servicios de aplicación, dominio, persistencia, jobs y proveedores externos. No describe métodos internos ni implementación de clases; muestra límites transaccionales, autorización, side effects asíncronos y errores relevantes.

Referencias: `product/14-user-flows.md`, `technical-design/16-identity-sessions/identity-and-session-design.md`, `technical-design/18-api/api-design.md`, `technical-design/14-state-machines/state-machines.md`.

## 2. Convenciones

- `FE`: frontend web/PWA.
- `API`: controladores REST.
- `App`: casos de uso de aplicación.
- `Authz`: autorización contextual server-side.
- `Domain`: reglas de dominio deterministas.
- `DB`: PostgreSQL/MikroORM.
- `Jobs`: pg-boss sobre PostgreSQL, concretado en `technical-design/20-jobs-events/jobs-and-events.md`.
- `Email`: proveedor transaccional y plantillas según `technical-design/21-notifications/notification-matrix.md`.
- Side effects asíncronos se muestran con `-)`.
- Un `GET` pasivo o preview no cuenta como actividad humana relevante.

## 3. Crear equipo rápido

```mermaid
sequenceDiagram
    actor User
    participant FE
    participant API
    participant App
    participant Domain
    participant DB

    User->>FE: Crear equipo rápido
    FE->>API: POST /teams/quick (Idempotency-Key)
    API->>App: createQuickTeam(command)
    App->>Domain: validate timezone, mode QUICK, participant
    Domain-->>App: team ACTIVE + participant + defaults
    App->>DB: transaction create team, participant, participant session, public link
    DB-->>App: committed
    App-->>API: team + participant + redirectTo
    API-->>FE: 201 + Set-Cookie synqo_context_session
    FE-->>User: Team home

    alt invalid timezone or payload
        Domain-->>App: VALIDATION_ERROR
        App-->>API: reject
        API-->>FE: 400 VALIDATION_ERROR
    end
```

Notas:

- Corresponde a `UF-01` y `SM-QT-01`.
- La transacción mínima evita equipo inaccesible o participante huérfano.
- Crear el equipo rápido registra `lastRelevantActivityAt`.

## 4. Entrar por public link

```mermaid
sequenceDiagram
    actor Visitor
    participant FE
    participant API
    participant App
    participant Domain
    participant DB

    Visitor->>FE: Abre public link
    FE->>API: POST /access/exchange (publicRef)
    API->>App: exchangePublicLink(publicRef)
    App->>DB: find team/resource by publicRef
    App->>Domain: validate accessible state
    alt team/resource accessible
        App-->>API: minimal context + redirectTo
        API-->>FE: 200 redirectTo, no identity granted
        FE-->>Visitor: identify participant if needed
        Visitor->>FE: displayName
        FE->>API: POST /teams/{teamRef}/participants
        API->>App: createParticipant
        App->>Domain: validate active team and display name
        App->>DB: transaction create participant + participant session
        API-->>FE: 201 + Set-Cookie synqo_context_session
    else expired or inaccessible
        App-->>API: RESOURCE_NOT_FOUND or TEAM_EXPIRED
        API-->>FE: 404/409
    end
```

Notas:

- Public link no concede identidad ni administración.
- Abrir el link por sí mismo no renueva lifecycle rápido; la creación/identificación humana sí.

## 5. Entrar por identified link

```mermaid
sequenceDiagram
    actor Participant
    participant FE
    participant API
    participant App
    participant DB
    participant Domain

    Participant->>FE: Abre URL con token
    FE->>API: POST /access/exchange(token)
    API->>App: exchangeIdentifiedLink(token)
    App->>DB: transaction lookup token hash FOR UPDATE
    App->>Domain: validate scope, expiry, revocation, team state, participant active
    alt token valid
        App->>DB: rotate/create participant session, mark used if one-time
        DB-->>App: committed
        App-->>API: redirectTo clean URL
        API-->>FE: 200 + Set-Cookie + redirectTo
        FE->>FE: replace URL without token
    else token invalid, used, expired, revoked
        App-->>API: TOKEN_EXPIRED_OR_USED
        API-->>FE: 410
    else team expired
        App-->>API: TEAM_EXPIRED
        API-->>FE: 409
    end
```

Notas:

- El link establece `ParticipantSession`, no cuenta.
- Los tokens claros nunca se registran ni se guardan.

## 6. Crear equipo administrable + verificar

```mermaid
sequenceDiagram
    actor Owner
    participant FE
    participant API
    participant App
    participant Domain
    participant DB
    participant Email

    Owner->>FE: Crear equipo administrable
    FE->>API: POST /teams/managed (Idempotency-Key)
    API->>App: createManagedTeam
    App->>Domain: validate email, timezone, mode MANAGED
    App->>DB: transaction create team PENDING_VERIFICATION, admin identity pending, verification token hash
    DB-->>App: committed
    App-)Email: send verification email
    API-->>FE: 202 pending verification

    Owner->>FE: Abre verification link
    FE->>API: POST /admin/verify(token)
    API->>App: verifyAdminToken
    App->>DB: transaction lock token + team + admin identity
    App->>Domain: validate token unused, unexpired, scope ADMIN_VERIFY
    alt valid
        App->>DB: set managed ACTIVE, mark verified, mark token used, create admin session
        API-->>FE: 200 + Set-Cookie admin context + redirectTo
    else invalid/expired/used
        API-->>FE: 410 TOKEN_EXPIRED_OR_USED
    end
```

Notas:

- Email es side effect asíncrono posterior al commit.
- El equipo no otorga administración persistente antes de la verificación.

## 7. Recuperar administración

```mermaid
sequenceDiagram
    actor Admin
    participant FE
    participant API
    participant App
    participant DB
    participant Email

    Admin->>FE: Solicita recuperación
    FE->>API: POST /admin/recovery-requests
    API->>App: requestAdminRecovery(teamRef, email)
    App->>DB: find matching verified admin identity
    alt match eligible
        App->>DB: create recovery token hash, revoke previous recovery tokens
        App-)Email: send recovery email
    else no match
        App-->>App: do not reveal enumeration
    end
    API-->>FE: 202 generic accepted

    Admin->>FE: Abre recovery link
    FE->>API: POST /admin/recover(token)
    API->>App: recoverAdmin
    App->>DB: transaction validate token, mark used, rotate admin sessions
    alt valid
        API-->>FE: 200 + Set-Cookie admin context + redirectTo
    else invalid/expired/used
        API-->>FE: 410 TOKEN_EXPIRED_OR_USED
    end
```

Notas:

- La solicitud siempre responde genéricamente.
- Nuevo recovery invalida tokens anteriores del mismo alcance.

## 8. Responder disponibilidad

```mermaid
sequenceDiagram
    actor Participant
    participant FE
    participant API
    participant App
    participant Authz
    participant Domain
    participant DB

    Participant->>FE: Guarda disponibilidad
    FE->>API: PUT /teams/{teamRef}/availability/me
    API->>App: updateOwnAvailability(entries)
    App->>Authz: authorize updateOwnAvailability
    Authz-->>App: Own participant context
    App->>Domain: validate dates, enabled statuses, day granularity
    alt valid and authorized
        App->>DB: transaction upsert availability_entries by participant+date
        App->>DB: update quick team relevant activity if applicable
        App-->>API: updated range
        API-->>FE: 200
    else forbidden
        API-->>FE: 403 FORBIDDEN_BY_TEAM_POLICY
    else invalid status/date
        API-->>FE: 422 DOMAIN_RULE_VIOLATION
    end
```

Notas:

- `UNANSWERED` no se persiste.
- Esta operación no modifica respuestas de propuestas.

## 9. Responder solicitud de disponibilidad

```mermaid
sequenceDiagram
    actor Participant
    participant FE
    participant API
    participant App
    participant Authz
    participant Domain
    participant DB

    Participant->>FE: Responde solicitud
    FE->>API: PUT /teams/{teamRef}/availability-requests/{requestRef}/response
    API->>App: respondAvailabilityRequest(entries)
    App->>DB: load request and participant snapshot
    App->>Authz: authorize respondAvailabilityRequest Own
    App->>Domain: validate request OPEN, range, statuses enabled
    alt request open
        App->>DB: transaction upsert availability_entries for dates
        App->>DB: mark relevant human activity if quick
        API-->>FE: 200 updated availability
    else deadline/job already closed
        API-->>FE: 409 REQUEST_CLOSED
    end
```

Notas:

- La solicitud no tiene respuestas paralelas: actualiza disponibilidad general.
- Si el deadline se alcanzó antes de la respuesta, gana el estado cerrado.

## 10. Crear y resolver propuesta

```mermaid
sequenceDiagram
    actor User
    participant FE
    participant API
    participant App
    participant Authz
    participant Domain
    participant DB
    participant Jobs

    User->>FE: Publica propuesta
    FE->>API: POST /teams/{teamRef}/proposals
    API->>App: createProposal(options)
    App->>Authz: authorize createProposal Policy
    App->>Domain: validate >=2 options, date required, optional time, no ranges
    App->>DB: transaction create decision OPEN/PENDING + options
    opt deadlineAt
        App-)Jobs: schedule closeDecision(deadlineAt)
    end
    API-->>FE: 201 decision

    User->>FE: Responde propuesta
    FE->>API: PUT /teams/{teamRef}/decisions/{decisionRef}/response
    API->>App: putDecisionResponse(PROPOSAL)
    App->>Authz: authorize respondProposal Own
    App->>Domain: validate OPEN, statuses enabled, response independent from general availability
    App->>DB: transaction upsert decision_response + proposal_response_options
    API-->>FE: 200 decision with result

    User->>FE: Resolver propuesta
    FE->>API: POST /teams/{teamRef}/decisions/{decisionRef}/resolve (If-Match)
    API->>App: resolveDecision(selectedOptionId)
    App->>DB: transaction lock decision/version
    App->>Authz: authorize resolveProposal Policy
    App->>Domain: validate PENDING, selected option exactly one, no auto tie-break
    alt no concurrent resolution
        App->>DB: insert resolution, set CLOSED/RESOLVED, store snapshot
        API-->>FE: 200 resolved decision
    else concurrent resolution wins first
        API-->>FE: 409 CONCURRENT_MODIFICATION
    end
```

Notas:

- Resultado calculado se puede leer antes de resolver; la resolución es operación explícita.
- El job de deadline solo cierra participación; no resuelve.

## 11. Votar y resolver encuesta

```mermaid
sequenceDiagram
    actor User
    participant FE
    participant API
    participant App
    participant Authz
    participant Domain
    participant DB

    User->>FE: Crea encuesta
    FE->>API: POST /teams/{teamRef}/surveys
    API->>App: createSurvey
    App->>Authz: authorize createSurvey Policy
    App->>Domain: validate SINGLE/MULTIPLE, options, visibility
    App->>DB: transaction create decision OPEN/PENDING + survey details + options
    API-->>FE: 201 decision

    User->>FE: Vota
    FE->>API: PUT /teams/{teamRef}/decisions/{decisionRef}/response
    API->>App: putDecisionResponse(SURVEY)
    App->>Authz: authorize voteSurvey Own
    App->>Domain: validate OPEN and selection count according to mode
    alt valid vote
        App->>DB: transaction replace survey_response_options
        API-->>FE: 200 decision with counts
    else SINGLE with multiple selected
        API-->>FE: 422 INVALID_DECISION_RESPONSE
    end

    User->>FE: Resolver encuesta
    FE->>API: POST /teams/{teamRef}/decisions/{decisionRef}/resolve (If-Match)
    API->>App: resolveDecision(selectedOptionIds)
    App->>DB: transaction lock decision/version
    App->>Authz: authorize resolveSurvey Policy
    App->>Domain: validate resolution shape for SINGLE/MULTIPLE
    App->>DB: insert resolution, set CLOSED/RESOLVED, store snapshot
    API-->>FE: 200 resolved decision
```

Notas:

- Empate en resultado no produce resolución automática.
- Visibilidad agregada no implica anonimato fuerte.

## 12. Vincular participante a cuenta

```mermaid
sequenceDiagram
    actor User
    participant FE
    participant API
    participant AccountAuth
    participant App
    participant DB
    participant Domain

    User->>FE: Vincular participante a cuenta
    FE->>AccountAuth: login/create account
    AccountAuth-->>FE: account session ready
    FE->>API: POST /account/link-participant
    API->>App: linkParticipantToAccount
    App->>DB: transaction load participant session + account session
    App->>Domain: validate participant control, no name claim, no incompatible link
    alt valid
        App->>DB: create participant_account_link preserving participantId
        App->>DB: rotate participant session
        API-->>FE: 200 participant linked
    else already linked to another account
        API-->>FE: 409 DOMAIN_RULE_VIOLATION
    end
```

Notas:

- La vinculación no recrea participante ni histórico.
- Si el equipo es rápido, su modalidad/lifecycle no cambia.

## 13. Lifecycle sweep y reactivación

```mermaid
sequenceDiagram
    participant Jobs
    participant App
    participant Domain
    participant DB
    participant FE
    participant API
    actor Participant

    Jobs->>App: sweepQuickTeams()
    App->>DB: find ACTIVE past 30d inactivity
    App->>Domain: validate no relevant human activity
    App->>DB: set RECOVERABLE
    App->>DB: find RECOVERABLE past 14d
    App->>Domain: validate recovery window elapsed
    App->>DB: set EXPIRED, revoke sessions/links
    App-)Jobs: enqueue purge/anonymize expired data

    Participant->>FE: Abre equipo recoverable y confirma reactivación
    FE->>API: POST /teams/{teamRef}/reactivate
    API->>App: reactivateQuickTeam
    App->>Domain: validate human activity and still recoverable
    alt still recoverable
        App->>DB: set ACTIVE, update lastRelevantActivityAt
        App-->>API: team active
        API-->>FE: 200 team active
    else already expired
        App-->>API: TEAM_EXPIRED
        API-->>FE: 409 TEAM_EXPIRED
    end
```

Notas:

- El sweep no envía notificaciones externas automáticas de actividad.
- Previews, bots y jobs no reactivan equipos.

## 14. AI interpretation

```mermaid
sequenceDiagram
    actor User
    participant FE
    participant API
    participant App
    participant Authz
    participant LLM
    participant Domain
    participant DB

    User->>FE: Escribe intención de coordinación
    FE->>API: POST /teams/{teamRef}/ai/interpret-coordination
    API->>App: interpretCoordination(text, locale)
    App->>Authz: authorize read/calculate availability
    App->>DB: load minimal team context, timezone, aggregate availability
    App->>LLM: text + minimal context + schema
    alt provider ok
        LLM-->>App: structured intent
        App->>Domain: schema validation + semantic validation
        alt OK
            App->>Domain: CandidateDateService deterministic calculation
            App-->>API: OK + interpreted dates + candidates
            API-->>FE: 200
            FE-->>User: Review interpretation and candidates
        else ambiguous/unsupported
            App-->>API: NEEDS_CLARIFICATION or UNSUPPORTED
            API-->>FE: 200
        end
    else provider failure
        App-->>API: AI_PROVIDER_UNAVAILABLE
        API-->>FE: 503 or fallback message
    end

    Note over FE,API: Creating a proposal remains POST /teams/{teamRef}/proposals
```

Notas:

- El LLM no lee BD directamente y no muta dominio.
- El cálculo final de candidatos es determinista.
- La respuesta muestra fechas concretas antes de publicar nada.

## 15. Deadline y cierre automático de consulta

```mermaid
sequenceDiagram
    participant Jobs
    participant App
    participant Domain
    participant DB
    actor User
    participant FE
    participant API

    Jobs->>App: closeExpiredDecisions(now)
    App->>DB: find OPEN/PENDING decisions with deadlineAt <= now
    App->>Domain: validate still OPEN/PENDING
    App->>DB: set participation CLOSED, resolution PENDING
    App-->>Jobs: done

    User->>FE: Intenta responder tras deadline
    FE->>API: PUT /teams/{teamRef}/decisions/{decisionRef}/response
    API->>App: putDecisionResponse
    App->>DB: load decision CLOSED/PENDING
    App->>Domain: reject response
    API-->>FE: 409 DECISION_CLOSED
```

Notas:

- El deadline no elige ganador ni registra resolución.
- La consulta cerrada pendiente sigue siendo resoluble/cancelable según permisos.

## 16. Errores transversales

| Error | Secuencias donde aparece | Resultado esperado |
|---|---|---|
| Token inválido/caducado/usado | Identified link, admin verify/recovery | `410 TOKEN_EXPIRED_OR_USED`, sin sesión nueva. |
| Permiso denegado | Disponibilidad, solicitud, propuesta, encuesta, settings | `403 FORBIDDEN_BY_TEAM_POLICY`, sin mutación. |
| Deadline alcanzado | Solicitud/consulta | Job cierra; respuestas posteriores devuelven `409`. |
| Resolución concurrente | Resolver propuesta/encuesta | Un commit gana; el resto devuelve `409 CONCURRENT_MODIFICATION`. |
| Fallo proveedor IA | AI interpretation | No se publica nada; respuesta `503` o estado de fallback según implementación. |

## 17. Cobertura E2E

| E2E | Diagramas |
|---|---|
| E2E-01 Coordinación temporal | Crear rápido, public/identified link, disponibilidad, propuesta, deadline, resolución. |
| E2E-02 Decisión colectiva | Crear/votar/resolver encuesta, deadline, errores transversales. |
| E2E-03 Administrable | Crear managed+verify, recovery admin, settings vía API fase 18, continuidad con participante/cuenta. |

## 18. Referencias posteriores

- Los jobs de lifecycle, deadlines, purga e idempotencia operacional están concretados en `technical-design/20-jobs-events/jobs-and-events.md`.
- El envío de emails de verificación/recuperación y plantillas está concretado en `technical-design/21-notifications/notification-matrix.md` y `technical-design/21-notifications/email-template-catalogue.md`.
- Fase 22 debe convertir los paths de token, autorización y enlace público en amenazas y controles verificables.
