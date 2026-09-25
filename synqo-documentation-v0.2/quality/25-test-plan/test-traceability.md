# 25 - Test Traceability

## 1. Proposito

Esta matriz conecta capacidades, invariantes, amenazas y recorridos E2E con suites de test previstas. Debe usarse como control de cobertura cuando empiece la implementacion.

Leyenda de suites:

- `U`: unit/application.
- `D`: domain.
- `I`: repository/integration con PostgreSQL/Testcontainers.
- `API`: API/contract.
- `UI`: component/integration UI.
- `E2E`: Playwright.
- `A11Y`: accesibilidad automatizada/manual.
- `SEC`: seguridad derivada del threat model.

## 2. Capacidades y RF criticos

| Capacidad | RF / prioridad | Suites | Casos obligatorios |
|---|---|---|---|
| Equipo rapido | `RF-EQR-*` Must/Should | D, I, API, E2E | Crear sin cuenta, renovar por actividad humana, no renovar por preview/bot, recoverable, expired, purga. |
| Equipo administrable | `RF-EQA-*` Should | D, I, API, E2E, SEC | Crear pendiente, verificar email, defaults, settings, admin separado de participante. |
| Participacion sin cuenta | `RF-ID-01`, `RF-ID-03`, `RF-PA-02` Must | API, E2E | Crear/unirse sin cuenta ni email; identidad local persiste. |
| Identidad separada | `RF-ID-08`, `RF-PA-01`, `RF-PA-06` Must | D, API, SEC | Cuenta/Participante/Admin no se colapsan; no reclamar por nombre. |
| Deep links | `RF-ACC-*` Must/Should | I, API, E2E, SEC | Public/identified/admin/recovery links, clean redirect, revocacion, scope. |
| Disponibilidad | `RF-DIS-*` Must/Should | D, I, API, UI, E2E, A11Y | Disponibilidad por dia, tres estados, `UNANSWERED` derivado, calendario/lista. |
| Coincidencias | `RF-COI-*` Must/Should | U, D, API, UI, E2E | Recuentos separados, ranking determinista, `Quizá` señal debil. |
| Solicitudes | `RF-SD-*` Should/Could/Won't | D, I, API, UI | Intervalo, respuesta actualiza disponibilidad, cierre/deadline, no emails actividad. |
| Propuestas | `RF-PRO-*` Must/Should/Won't | D, I, API, UI, E2E | Dos opciones, fecha obligatoria, respuesta independiente, resultado, resolucion una opcion. |
| Encuestas | `RF-ENC-*` Must/Should/Won't | D, I, API, UI, E2E | SINGLE/MULTIPLE, votos, empate, visibilidad, resolucion segun modo. |
| Resolucion | `RF-RES-*` Must/Should | D, I, API, UI, E2E | Resultado != Resolucion, resolucion explicita, cierra participacion, no desempate automatico. |
| Pendientes | `RF-PEN-*` Should/Could | API, UI, E2E | Pendientes por actor/equipo/cuenta cuando aplique; deep link a accion. |
| Historico | `RF-HIS-*` Must/Should/Could | API, UI, E2E | Historico conserva autoria mientras equipo exista; rapido expirado no recuperable. |
| IA | `RF-AI-*` Must/Should | U, D, API, E2E, SEC | Structured output, validacion, fake provider, no mutacion, fallback manual, minimizacion. |

## 3. Invariantes de dominio

| Invariantes | Criticidad | Suites | Prueba prevista |
|---|---|---|---|
| `INV-GLO-01`..`INV-GLO-06` | Critica | D, I, API, SEC | Contexto por equipo, identidades separadas, auth server-side, IDOR negative tests. |
| `INV-TEAM-01`..`INV-TEAM-13` | Critica/MVP | D, I, API, E2E | Modalidades, zona IANA, lifecycle rapido, admin verificable, participante local, inactivos. |
| `INV-POL-01`..`INV-POL-05` | Critica en administrable | D, API, E2E | Estados habilitados, policies `EVERYONE/ADMINISTRATORS`, sin subconjuntos arbitrarios. |
| `INV-AVA-01`..`INV-AVA-09` | Critica | U, D, I, API, UI, A11Y | Disponibilidad diaria, estados, recuentos, ranking determinista, zona horaria. |
| `INV-REQ-01`..`INV-REQ-04` | Target MVP | D, I, API | Intervalo, respuesta actualiza disponibilidad, cerrada rechaza, no notificaciones actividad. |
| `INV-DEC-01`..`INV-DEC-12` | Critica | D, I, API, E2E | Estados validos, cerrado no acepta respuestas, resultado/resolucion separados, no desempate. |
| `INV-PRO-01`..`INV-PRO-08` | Critica | D, I, API, UI, E2E | Opciones temporales, hora opcional, sin franjas, respuesta no muta disponibilidad. |
| `INV-SUR-01`..`INV-SUR-07` | Critica | D, I, API, UI, E2E | SINGLE/MULTIPLE, modalidad estable, agregado no anonimato fuerte, resolucion valida. |
| `INV-AI-01`..`INV-AI-06` | Critica para TFM/seguridad | U, D, API, E2E, SEC | LLM no calcula ni muta, contexto minimo, fechas relativas, revision humana. |

## 4. Transacciones criticas

| TX | Operacion | Suites | Caso principal |
|---|---|---|---|
| `TX-01` | Crear equipo rapido | I, API, E2E | Equipo + participante inicial + actividad en una transaccion. |
| `TX-02` | Crear administrable | I, API, E2E | Equipo pending + admin identity + token; email tras commit. |
| `TX-03` | Verificar administracion | I, API, SEC | Token one-time, activa equipo, crea admin session. |
| `TX-04` | Identificar participante | I, API, E2E | Sesion contextual y scope de equipo. |
| `TX-05` | Vincular participante-cuenta | I, API | Preserva participantId e historico. |
| `TX-06` | Responder solicitud | I, API | Actualiza disponibilidad por intervalo de forma idempotente. |
| `TX-07` | Actualizar disponibilidad | I, API | Upsert `(teamId, participantId, localDate)`. |
| `TX-08` | Crear consulta | I, API | Consulta + opciones + creador + estado inicial. |
| `TX-09` | Responder consulta | I, API | Unique por consulta/participante; reemplazo idempotente. |
| `TX-10` | Cerrar por deadline | I | Fake clock + job idempotente. |
| `TX-11` | Resolver consulta | I, API, SEC | Lock/version; solo una resolucion. |
| `TX-12` | Cancelar consulta | I, API | Terminal e historico preservado. |
| `TX-13` | Cambiar configuracion | API, SEC | Admin requerido y constraints de estados. |
| `TX-14` | Expirar equipo rapido | I, SEC | Invalida credenciales y purga/anonimiza segun fase 23. |

## 5. OpenAPI por superficie

| Superficie | OperationIds | Suites | Riesgos cubiertos |
|---|---|---|---|
| Teams | `createQuickTeam`, `createManagedTeam`, `getTeam`, `getTeamHome`, `updateTeamSettings`, `reactivateQuickTeam` | API, E2E, SEC | Public surface, admin settings, quick lifecycle. |
| Participants | `createParticipant`, `getCurrentParticipant`, `updateCurrentParticipant`, `deactivateCurrentParticipant`, `listParticipants` | API, SEC | Identidad local, impersonation, nominal exposure. |
| Availability | `putMyAvailability`, `getMyAvailability`, `getCollectiveAvailability`, `getAvailabilityMatches` | API, UI, A11Y | Dia/estado, agregados, rangos, accesibilidad. |
| Availability Requests | `createAvailabilityRequest`, `respondAvailabilityRequest`, `closeAvailabilityRequest` | API, I | Intervalos, deadlines, idempotencia. |
| Decisions | `createProposal`, `createSurvey`, `putDecisionResponse`, `closeDecision`, `resolveDecision`, `cancelDecision` | D, I, API, E2E | Estados, concurrencia, resolucion, encuesta/propuesta. |
| Access | `exchangeAccess`, `createAccessLink`, `revokeAccessLink` | I, API, SEC | Token leakage/replay, scope, revocacion, targetPath. |
| Admin | `verifyAdmin`, `requestAdminRecovery`, `recoverAdmin` | I, API, SEC | One-time tokens, enumeration, provider email fake. |
| Account | `linkParticipantToAccount`, `getAccountHome` | API, E2E | Vinculacion, agregados autorizados. |
| AI | `interpretCoordination` | U, API, E2E | Fake LLM, schema validation, no domain mutation. |

## 6. Threat model coverage

| Threat | Suites | Test previsto |
|---|---|---|
| `TM-01` token leakage | API, SEC, E2E | Clean redirect, referrer/log redaction, no analytics con token. |
| `TM-02` replay | I, API | Canje concurrente one-time. |
| `TM-03` impersonation | API, SEC | No claim por nombre; `/me` no acepta participantRef ajeno. |
| `TM-04` admin escalation | API, E2E | Participant no settings/resolution admin-only. |
| `TM-05` IDOR | API, SEC | Cross-team negative tests por familia de recurso. |
| `TM-06` CSRF | API | Mutaciones sin CSRF/origin invalido fallan. |
| `TM-07` session fixation | API, SEC | Session id rota tras canjes/elevacion. |
| `TM-08` enumeration | API | Recovery existente/no existente indistinguible. |
| `TM-09` spam/abuse | API | Rate limit en public endpoints con respuesta generica. |
| `TM-10` races | I, API | Concurrent resolve/close/respond. |
| `TM-11` injection | U, API, UI | Payloads SQL/XSS/path/prompt rechazados o escapados. |
| `TM-12` logging leakage | U, API | Logger redactor y endpoints sensibles sin token/email claro. |
| `TM-13` email provider compromise | I | TTL/one-time/min payload en plantillas y jobs. |
| `TM-14` LLM provider compromise | U, API | Contexto minimo, schema invalid, no mutacion. |
| `TM-15` repudiation | I | Audit entries en settings/resolve/recovery/revoke. |
| `TM-16` expensive queries | API, I | Limites de rango/paginacion. |
| `TM-17` idempotency key | API, I | Misma key+payload, key+payload distinto, scope por equipo. |
| `TM-18` public read excess | API | Anonimo recibe contexto minimo. |
| `TM-19` targetPath | U, API | Rechaza URL externa, protocol-relative y rutas no permitidas. |
| `TM-20` previews/crawlers | API, E2E | GET/canje pasivo no renueva ni ejecuta accion destructiva. |

## 7. Accesibilidad coverage

| Area | Checks | Suites |
|---|---|---|
| Automaticos globales | `AUTO-A11Y-01`..`AUTO-A11Y-10` | UI, E2E, A11Y |
| Navegacion | `MAN-A11Y-01`..`MAN-A11Y-05` | Manual + E2E smoke |
| Calendario | `CAL-A11Y-01`..`CAL-A11Y-10` | UI, E2E, Manual |
| Disponibilidad | `DIS-A11Y-01`..`DIS-A11Y-05` | UI, A11Y |
| Formularios | `FORM-A11Y-01`..`FORM-A11Y-05` | UI, A11Y |
| Dialogs/toasts | `MODAL-A11Y-01`..`MODAL-A11Y-05` | UI, Manual |
| Resultados/tablas | `RESULT-A11Y-01`..`TABLE-A11Y-02` | UI, Manual |
| Estados/enlaces | `STATE-A11Y-01`..`STATE-A11Y-05` | UI, E2E |

## 8. E2E coverage

| E2E | Capacidades | Suites de apoyo | Criterio de paso |
|---|---|---|---|
| `E2E-01` | Equipo rapido, participante sin cuenta, disponibilidad, coincidencias, propuesta, resolucion | D, API, UI, SEC | Flujo completo sin cuenta y sin resolucion automatica. |
| `E2E-02` | Encuesta, voto, resultado, resolucion, historico | D, API, UI | SINGLE y MULTIPLE cubiertos; empate no decide. |
| `E2E-03` | Administrable, email verification, settings, participacion, permisos | I, API, SEC | Admin verificado gobierna; participante no escala. |
| `E2E-AI-01` | IA, validacion, candidatos, propuesta | U, API | Fake LLM; fallo no bloquea flujo manual. |

## 9. CI sin servicios externos

| Dependencia | En CI ordinaria | Tests reales fuera de CI ordinaria |
|---|---|---|
| PostgreSQL | Testcontainers | N/A, es dependencia core y se prueba real en contenedor. |
| Email | Fake provider/Mailpit local | Prueba smoke manual/staging con Resend antes de produccion. |
| LLM | Fake adapter + contract tests de adapter | Evaluacion controlada fase 27 contra proveedor real. |
| Analytics | Fake sink/schema validation | Smoke de proveedor futuro si se adopta. |
| IdP/passwordless | Fake adapter | Smoke staging si se integra proveedor real. |

## 10. Gaps aceptados

- No se exige cobertura 100% ni porcentaje global inicial.
- No se prueban navegadores antiguos fuera de `RNF-COMP-01`.
- No se automatiza toda revision manual de accesibilidad.
- No se llama a proveedores reales en CI ordinaria.
- No se implementa aqui el dataset IA; queda para fase 27.
