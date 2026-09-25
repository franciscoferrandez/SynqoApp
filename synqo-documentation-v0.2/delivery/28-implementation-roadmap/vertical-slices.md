# 28 - Vertical Slices

## Lectura

Cada slice debe entregar un recorrido demostrable. Las listas de RF/HU son guias de trazabilidad, no una copia exhaustiva de requisitos.

## Slice 0 - Bootstrap/repo

| Aspecto | Detalle |
|---|---|
| Valor | Permitir construir y probar slices verticales sin generar producto falso. |
| RF/HU | RNF release blockers; ADR base; sin RF funcional nuevo. |
| Endpoints | Healthcheck tecnico; OpenAPI servido si se decide en bootstrap. |
| UI | App shell minima, rutas vacias protegidas por estados claros. |
| Dominio | Estructura modular sin reglas de negocio todavia salvo tipos compartidos evidentes. |
| DB | Configuracion PostgreSQL/MikroORM y primera migracion base vacia o enums si procede. |
| Tests | Typecheck/lint, unit smoke, API smoke, Playwright carga app shell. |
| Demo terminada | `web` y `api` arrancan localmente, CI local pasa, healthcheck visible. |

Notas:

- No crear CRUD generico.
- No construir dashboards o pantallas finales sin flujo.
- Preparar fake clock y fake providers temprano.

## Slice 1 - Quick team + participant access

| Aspecto | Detalle |
|---|---|
| Valor | Un visitante crea equipo rapido, entra como participante sin cuenta y comparte/accede por enlace. |
| RF/HU | `RF-ID-01`, `RF-ID-03`, `RF-ACC-01`, `RF-ACC-04`, `RF-ACC-05`, `RF-EQR-01`, `RF-EQR-02`, `RF-EQR-09`, `RF-PA-01`, `RF-PA-02`; `HU-EQ-01`, `HU-EQ-03`. |
| Endpoints | `POST /teams/quick`, `GET /teams/{teamRef}`, `POST /teams/{teamRef}/participants`, `GET /teams/{teamRef}/participants/me`, `POST /access/exchange` si se usa token de acceso. |
| UI | `SCR-02`, `SCR-03`, `SCR-06`, primer `SCR-11`. |
| Dominio | `Team`, `Participant`, zona horaria, equipo rapido temporal, identidad local, access credential/session. |
| DB | `teams`, `participants`, `participant_sessions`, `access_credentials`. |
| Tests | Domain equipo rapido; API crear/acceder; IDOR basico; token/link invalido; Playwright crear equipo y entrar como segundo participante. |
| Demo terminada | Crear equipo sin cuenta, copiar enlace, abrirlo en contexto limpio, identificarse y ver home de equipo. |

## Slice 2 - Availability

| Aspecto | Detalle |
|---|---|
| Valor | Un participante registra y modifica su disponibilidad diaria. |
| RF/HU | `RF-DIS-01`..`RF-DIS-09`, `RF-EQR-09`; `HU-DIS-01`, `HU-DIS-02`. |
| Endpoints | `GET /teams/{teamRef}/availability/me`, `PUT /teams/{teamRef}/availability/me`. |
| UI | `SCR-12` en modo lista primero; calendario minimo despues si no bloquea. |
| Dominio | `AvailabilityEntry`, `AvailabilityStatePolicy`, `UNANSWERED` derivado, upsert por dia. |
| DB | `availability_entries`; indices por participante/rango. |
| Tests | Unit/domain estados y no respuesta; API upsert idempotente; component selector estado accesible; Playwright registrar disponibilidad. |
| Demo terminada | Participante marca varios dias como Disponible/Quiza/No disponible, recarga y conserva datos. |

## Slice 3 - Collective availability + matches + calendar

| Aspecto | Detalle |
|---|---|
| Valor | El equipo responde `cuando podemos` con recuentos y candidatas deterministas. |
| RF/HU | `RF-DIS-10`..`RF-DIS-13`, `RF-COI-01`..`RF-COI-05`; `HU-DIS-03`. |
| Endpoints | `GET /teams/{teamRef}/availability/collective`, `GET /teams/{teamRef}/availability/matches`, `GET /teams/{teamRef}/participants`. |
| UI | `SCR-13`; calendario + lista con color, texto/simbolo y detalle de dia. |
| Dominio | `AvailabilityAggregationService`, `CandidateRankingService`, recuentos `AVAILABLE/MAYBE/UNAVAILABLE/UNANSWERED`. |
| DB | Consultas sobre `availability_entries` y `participants`; no tabla de coincidencias persistida. |
| Tests | Domain ranking determinista; API recuentos separados; component a11y calendario/lista; Playwright dos participantes y matches. |
| Demo terminada | Con dos o mas participantes se ven recuentos y fechas ordenadas sin resolver automaticamente. |

## Slice 4 - Proposal

| Aspecto | Detalle |
|---|---|
| Valor | Convertir candidatas o fechas manuales en propuesta, recoger respuestas, ver resultado y resolver explicitamente. |
| RF/HU | `RF-CON-01`..`RF-CON-13`, `RF-PRO-01`..`RF-PRO-14`, `RF-RES-01`, `RF-RES-02`, `RF-RES-05`..`RF-RES-07`; `HU-PRO-01`..`HU-PRO-04`. |
| Endpoints | `POST /teams/{teamRef}/proposals`, `GET /teams/{teamRef}/decisions`, `GET /teams/{teamRef}/decisions/{decisionRef}`, `PUT /teams/{teamRef}/decisions/{decisionRef}/response`, `POST /teams/{teamRef}/decisions/{decisionRef}/resolve`, opcional `close/cancel` si entra en esta slice. |
| UI | `SCR-18`, `SCR-19`, `SCR-20`, `SCR-23`, parte de `SCR-17`. |
| Dominio | `DecisionProcess` tipo `PROPOSAL`, opciones fecha+hora opcional, respuestas independientes, resultado vs resolucion. |
| DB | `decision_processes`, `proposal_details`, `decision_options`, `decision_responses`, `proposal_response_options`, `decision_resolutions`, `decision_resolution_options`. |
| Tests | Domain invariantes propuesta; API idempotencia/respuesta/resolucion; concurrencia resolucion; component resultado/resolucion separados; Playwright E2E-01 completo. |
| Demo terminada | E2E-01 completo: disponibilidad -> matches -> propuesta -> respuestas -> resultado -> resolucion. |

## Slice 5 - Survey

| Aspecto | Detalle |
|---|---|
| Valor | Resolver `que decidimos` mediante encuesta. |
| RF/HU | `RF-ENC-01`..`RF-ENC-14`, `RF-CON-*`, `RF-RES-*`; `HU-ENC-01`..`HU-ENC-05`. |
| Endpoints | `POST /teams/{teamRef}/surveys`, `GET /teams/{teamRef}/decisions/{decisionRef}`, `PUT /teams/{teamRef}/decisions/{decisionRef}/response`, `POST /teams/{teamRef}/decisions/{decisionRef}/resolve`. |
| UI | `SCR-21`, `SCR-22`, `SCR-23`, `SCR-17`. |
| Dominio | `SurveyDecision`, `SINGLE`, `MULTIPLE`, visibilidad, empate sin desempate, resolucion explicita. |
| DB | `survey_details`, `survey_response_options` sobre tablas comunes de decision. |
| Tests | Domain `SINGLE` max una opcion; API cambiar voto; resultados; Playwright E2E-02 `SINGLE`, despues `MULTIPLE`. |
| Demo terminada | Crear encuesta, votar, cambiar voto, ver resultado, resolver; ningun empate se resuelve solo. |

## Slice 6 - Availability requests

| Aspecto | Detalle |
|---|---|
| Valor | Pedir disponibilidad para un intervalo y actualizar disponibilidad general desde la respuesta. |
| RF/HU | `RF-SD-01`..`RF-SD-07`, `RF-SD-08` como Won't; `HU-SD-01`, `HU-SD-02`. |
| Endpoints | `POST /teams/{teamRef}/availability-requests`, `GET /teams/{teamRef}/availability-requests/{requestRef}`, `PUT /teams/{teamRef}/availability-requests/{requestRef}/response`, `POST /teams/{teamRef}/availability-requests/{requestRef}/close`. |
| UI | `SCR-14`, `SCR-15`, `SCR-16`; pendientes simples en `SCR-11`. |
| Dominio | `AvailabilityRequest`, snapshot de participantes activos, deadline opcional, respuesta actualiza `AvailabilityEntry`. |
| DB | `availability_requests`, `availability_request_participants`, `availability_entries.sourceRequestId`. |
| Tests | Domain cierre y respuesta; API deadline vencido; Playwright crear solicitud y responder; no notificaciones externas. |
| Demo terminada | Un participante solicita rango, otro responde y la disponibilidad colectiva cambia. |

## Slice 7 - Managed/admin

| Aspecto | Detalle |
|---|---|
| Valor | Equipo persistente configurable con identidad administrativa verificable. |
| RF/HU | `RF-EQA-01`..`RF-EQA-17`, `RF-ID-08`, `RF-RES-03`; `HU-EQ-02`, `HU-EQA-01`..`HU-EQA-03`. |
| Endpoints | `POST /teams/managed`, `POST /admin/verify`, `PATCH /teams/{teamRef}/settings`, `GET /teams/{teamRef}/home`. |
| UI | `SCR-04`, `SCR-05`, `SCR-26`, `SCR-27`, `SCR-28`, `SCR-30`. |
| Dominio | `AdministrativeIdentity`, managed states, settings, policies `EVERYONE/ADMINISTRATORS`, estados habilitados. |
| DB | `administrative_identities`, `administrative_sessions`; ampliar `teams` settings. |
| Tests | API verificacion one-time; auth participant no admin; settings invalidos; E2E-03 parcial. |
| Demo terminada | Crear administrable, verificar con email fake, cambiar politica, comprobar forbidden para participante no admin. |

## Slice 8 - Account linking

| Aspecto | Detalle |
|---|---|
| Valor | Continuidad global sin convertir la cuenta en requisito para participar. |
| RF/HU | `RF-ID-02`..`RF-ID-07`, `RF-PEN-03`, `RF-HIS-03`; `HU-ID-01`, `HU-ID-02`, `HU-PEN-01/HU-PEN-02`. |
| Endpoints | `POST /account/link-participant`, `GET /account/home`; auth de cuenta si se implementa en MVP. |
| UI | `SCR-07`, `SCR-08`, `SCR-09`, `SCR-10`. |
| Dominio | `Account`, vinculos con participante/admin, preservacion de identidad local e historico. |
| DB | `accounts`, `account_sessions`, `participant_account_links`, `administrative_account_links`. |
| Tests | Domain no recrea participante; API prueba de control; Playwright vincular participacion y verla en inicio global. |
| Demo terminada | Una participacion existente se vincula a cuenta y aparece en vista global sin cambiar equipo ni historico. |

## Slice 9 - Lifecycle/jobs

| Aspecto | Detalle |
|---|---|
| Valor | Mantener coherencia temporal: deadlines, expiracion de equipo rapido, purga y limpieza. |
| RF/HU | `RF-EQR-03`..`RF-EQR-15`, `RF-CON-06`, `RF-CON-08`, `RF-HIS-05`, `RF-HIS-06`; `HU-EQR-01`, `HU-CON-01`. |
| Endpoints | `POST /teams/{teamRef}/reactivate`; respuestas/cierres existentes deben validar deadlines/lifecycle. |
| UI | Estados recuperable/expirado en `SCR-11` y estados de enlace invalido/expirado. |
| Dominio | Lifecycle rapido, actividad humana relevante, close due requests/decisions, purge expired quick team. |
| DB | Indices lifecycle/deadline; pg-boss; audit minima si procede. |
| Tests | Fake clock; integration jobs idempotentes; API rechaza mutaciones vencidas; Playwright recuperable/expirado si viable. |
| Demo terminada | Con fake clock, un deadline cierra participacion sin resolver y un equipo rapido pasa por recuperable/expirado/purga. |

## Slice 10 - Notifications

| Aspecto | Detalle |
|---|---|
| Valor | Emails transaccionales permitidos sin convertir Synqo en mensajeria. |
| RF/HU | Administracion verificable y recovery; no `RF-CON-16`; `HU-EQA-04` si recovery entra. |
| Endpoints | `POST /admin/recovery-requests`, `POST /admin/recover`; soporte de reenvio verificacion si se define. |
| UI | `SCR-29`, `SCR-30`, estados de verificacion/recovery. |
| Dominio | Tokens one-time, respuesta generica anti-enumeracion, recuperacion administrativa. |
| DB | `access_credentials` de `ADMIN_VERIFY/ADMIN_RECOVERY`; jobs email. |
| Tests | Email fake/Mailpit; no enumeracion; token expirado/usado; provider failure; no notificaciones de actividad. |
| Demo terminada | Recovery admin envia email fake, canjea token una vez y recupera sesion admin. |

## Slice 11 - AI assistance

| Aspecto | Detalle |
|---|---|
| Valor | Ruta IA del TFM: texto natural -> estructura validada -> candidatas deterministas -> propuesta manual confirmada. |
| RF/HU | `RF-AI-01`..`RF-AI-12`; `HU-AI-01`; salvaguardas `RF-AI-06`..`RF-AI-10`. |
| Endpoints | `POST /teams/{teamRef}/ai/interpret-coordination`; crear propuesta sigue usando `POST /teams/{teamRef}/proposals`. |
| UI | `SCR-AI-01` integrada con disponibilidad colectiva/propuesta. |
| Dominio | `CoordinationIntent`, schema validation, domain validation, `CandidateDateService`, fallback manual. |
| DB | No requiere nuevas tablas de dominio; observabilidad minimizada segun fase 26/24. |
| Tests | JSON Schema tests, golden dataset fase 27, fake adapter en CI, E2E-AI-01, prompt injection, privacy context. |
| Demo terminada | Con fake adapter: introducir texto, ver interpretacion, calcular candidatas, revisar y crear propuesta normal; fallo IA no bloquea manual. |

## Dependencias entre slices

| Slice | Depende de | Motivo |
|---|---|---|
| 1 | 0 | Necesita repo, API, DB y app shell. |
| 2 | 1 | Necesita participante contextual. |
| 3 | 2 | Necesita disponibilidad persistida de varios participantes. |
| 4 | 1, 3 parcial | Puede crear propuesta manual con 1; gana valor completo con matches. |
| 5 | 1, 4 parcial | Reutiliza decision lifecycle, resultado y resolucion. |
| 6 | 2 | Responder solicitud actualiza disponibilidad general. |
| 7 | 1 | Reutiliza equipo, participantes, auth contextual y sesiones. |
| 8 | 1 | Vincula identidades existentes; no debe preceder al uso sin cuenta. |
| 9 | 1, 4, 6 | Deadlines/lifecycle necesitan recursos reales que cerrar/expirar. |
| 10 | 7 | Email transaccional principal es verificacion/recovery admin. |
| 11 | 3, 4 | IA calcula candidatas sobre disponibilidad y termina en propuesta normal. |

## Slices que pueden recortarse si hay presion

- Recortar primero `Slice 8` cuenta global, salvo lo necesario para TFM/documentacion.
- Recortar partes enriquecidas de `Slice 6` solicitudes si disponibilidad manual ya valida E2E-01.
- Recortar `MULTIPLE` y visibilidades avanzadas de `Slice 5` despues de completar `SINGLE`.
- Mantener `Slice 11` para TFM aunque su prioridad de producto sea `Should`; puede ejecutarse con fake provider primero y proveedor real evaluado despues.

No recortar:

- seguridad de enlaces/sesiones;
- autorizacion server-side;
- disponibilidad diaria y estados basicos;
- calculo determinista;
- resultado/resolucion separados;
- fallback manual frente a IA;
- privacidad/minimizacion.
