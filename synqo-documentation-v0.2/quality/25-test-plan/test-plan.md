# 25 - Test Plan

## 1. Proposito

Este plan convierte ADR-014, trazabilidad funcional, invariantes de dominio, state machines, OpenAPI, threat model y accesibilidad en una estrategia ejecutable de testing para el MVP de Synqo.

El objetivo no es maximizar porcentaje de cobertura, sino proteger:

- los recorridos E2E principales;
- invariantes `Must` y RNF release blocker;
- seguridad de enlaces, sesiones y autorizacion por equipo;
- accesibilidad basica WCAG 2.2 AA;
- concurrencia, idempotencia, deadlines y jobs temporales;
- fallos de proveedores externos sin depender de ellos en CI ordinaria.

## 2. Herramientas base

| Nivel | Herramienta prevista | Uso |
|---|---|---|
| Unit/application | Vitest | Funciones puras, servicios de aplicacion con fakes, validadores, policies. |
| Domain | Vitest | Entidades/value objects, invariantes, state transitions y calculos deterministas. |
| Repository/integration | Vitest + Testcontainers PostgreSQL | Persistencia real, constraints, transacciones, locks, idempotencia y jobs. |
| API contract/integration | Supertest o cliente HTTP equivalente + OpenAPI validation | Endpoints NestJS, auth contextual, ProblemDetails, DTOs. |
| UI component/integration | Testing Library | Componentes React, formularios, calendario/lista, estados, accesibilidad local. |
| E2E | Playwright | Flujos completos web con backend real/fakes controlados. |
| A11y automation | axe-core/playwright-axe o equivalente | Checks automaticos criticos/serios. |

No se fija porcentaje global obligatorio. Se exigen gates por suites criticas y trazabilidad.

## 3. Piramide de pruebas

### 3.1 Unit/application

Debe probar:

- validacion de DTOs y objetos de valor: fechas, zona horaria, estados, politicas;
- ordenacion determinista de coincidencias;
- calculo de resultados de propuesta y encuesta;
- validadores de IA structured output;
- policies de autorizacion puras cuando no requieran DB;
- redaccion de logs y filtros de analitica;
- bucketizacion de product analytics.

No debe probar:

- integridad real de FK/unique;
- locks concurrentes;
- cookies/CSRF reales;
- navegacion E2E.

### 3.2 Domain

Debe probar cada invariancia critica y transicion sin infraestructura externa:

- `Equipo` rapido y administrable;
- `Participante`, `Cuenta`, `Administrador` separados;
- disponibilidad diaria y estados;
- solicitud abierta/cerrada;
- consulta con ejes `participationState` y `resolutionState`;
- propuesta, encuesta `SINGLE`/`MULTIPLE`, resultado y resolucion;
- IA como interpretacion + validacion + calculo determinista.

### 3.3 Repository/integration

Debe usar PostgreSQL real mediante Testcontainers para:

- unique constraints e indices logicos;
- pertenencia a `teamId`;
- upsert de disponibilidad;
- respuesta idempotente por consulta/participante;
- token one-time con `usedAt` transaccional;
- resolucion concurrente con optimistic/pessimistic locking;
- jobs de deadline, expiracion y purga;
- delete real de equipo rapido expirado y ausencia de PII/tokens remanentes.

### 3.4 API

Debe cubrir el contrato OpenAPI y reglas server-side:

- endpoints publicos: `createQuickTeam`, `createManagedTeam`, `createParticipant`, `exchangeAccess`, `verifyAdmin`, `requestAdminRecovery`, `recoverAdmin`;
- endpoints contextuales: disponibilidad, solicitudes, propuestas, encuestas, decisiones, settings, account home;
- codigos `ProblemDetails` para validacion, autenticacion, autorizacion, estado invalido, concurrencia, token usado/expirado, rate limit y feature fuera de MVP;
- CSRF/origin para mutaciones con cookie;
- idempotency key;
- ETag/`If-Match` en cierre/resolucion/cancelacion.

### 3.5 UI component/integration

Debe cubrir:

- formularios de equipo rapido/administrable;
- identificacion de participante;
- calendario y lista de disponibilidad propia/colectiva;
- selector de estado con color + texto/simbolo;
- creacion y respuesta de propuesta/encuesta;
- resultado separado de resolucion;
- permisos: acciones ocultas/deshabilitadas y mensajes read-only;
- estados de enlace invalido/expirado/revocado;
- errores de formulario accesibles.

### 3.6 Playwright E2E

Debe ejecutar sobre backend real en modo test, PostgreSQL Testcontainers o DB efimera equivalente, fake clock controlable y proveedores fake.

Flujos obligatorios:

- E2E-01 coordinacion rapida;
- E2E-02 decision colectiva;
- E2E-03 administrable/persistente;
- E2E-AI-01 con fake adapter IA.

## 4. Escenarios E2E obligatorios

### E2E-01 - Coordinacion rapida

1. Visitante crea equipo rapido sin cuenta.
2. Creador comparte enlace publico.
3. Segundo participante se identifica sin cuenta.
4. Ambos registran disponibilidad diaria.
5. Se consulta disponibilidad colectiva y coincidencias.
6. Se crea propuesta desde candidata o manual.
7. Participantes responden propuesta.
8. Se ve resultado agregado.
9. Participante resuelve explicitamente.
10. La resolucion cierra participacion y queda en historico.

Checks criticos:

- no cuenta/email obligatorios;
- `Quizá`, `No disponible` y `Sin respuesta` no se confunden;
- propuesta no modifica disponibilidad general;
- Synqo no resuelve automaticamente.

### E2E-02 - Decision colectiva

1. Equipo activo crea encuesta `SINGLE`.
2. Participantes votan y uno cambia voto mientras esta abierta.
3. Resultado se actualiza.
4. Se resuelve con una opcion.
5. Se crea encuesta `MULTIPLE`.
6. Participante selecciona varias opciones.
7. Resolucion multiple admite una o varias opciones.

Checks criticos:

- `SINGLE` no acepta multiples opciones;
- empate no dispara desempate automatico;
- resultado y resolucion se presentan separados.

### E2E-03 - Uso administrable/persistente

1. Visitante crea equipo administrable con email.
2. Email fake captura link de verificacion.
3. Verificacion activa administracion.
4. Admin cambia politica de resolucion/creacion.
5. Participante se une y responde disponibilidad/consulta.
6. Participante sin admin intenta settings y recibe forbidden.
7. Admin resuelve segun politica.
8. Vinculacion a cuenta se prueba si el flujo de cuenta esta incluido en la slice.

Checks criticos:

- enlace publico no concede admin;
- admin sin `ParticipantSession` no responde como participante;
- configuracion invalida de estados se rechaza.

### E2E-AI-01 - Asistencia IA

1. Usuario introduce texto natural.
2. Fake LLM devuelve structured output valido.
3. Dominio valida schema/semantica.
4. CandidateDateService calcula candidatas.
5. Usuario revisa fechas concretas.
6. Se crea propuesta mediante endpoint normal.

Variantes:

- `NEEDS_CLARIFICATION`;
- `UNSUPPORTED`;
- provider error;
- prompt injection ignorada por schema/domain validation.

Checks criticos:

- IA no muta dominio;
- fallo IA no bloquea creacion manual;
- no se envia disponibilidad nominal al proveedor.

## 5. Escenarios transversales de alto riesgo

| Escenario | Nivel minimo | Evidencia esperada |
|---|---|---|
| Identified link canjea a sesion contextual y URL limpia | API + Playwright | Token no queda en URL final/logs; session rota/crea participante. |
| Token one-time concurrente | Integration | Dos canjes simultaneos, solo uno gana; otro `TOKEN_EXPIRED_OR_USED`. |
| IDOR cross-team | API | Actor de equipo A no lee/muta recursos de equipo B. |
| Escalada participant -> admin | API/E2E | Participant no cambia settings ni resuelve si policy exige admin. |
| CSRF/origin | API | Mutacion con cookie sin CSRF/origin valido falla. |
| Deadline solicitud/consulta | Domain + Integration + E2E | Fake clock vence, job cierra, API rechaza respuestas tardias. |
| Resolucion concurrente | Integration/API | Dos resoluciones/cancelaciones paralelas, solo una persiste; otra `CONCURRENT_MODIFICATION`. |
| Idempotency retry | API/Integration | Misma key+payload no duplica; misma key+payload distinto se rechaza. |
| Quick lifecycle | Domain + Integration + E2E | Active -> Recoverable -> Active o Expired; previews no renuevan; purga idempotente. |
| Provider failure email | Integration | Email fake falla, dominio queda consistente y job reintenta/dead-letter. |
| Provider failure IA | API/E2E | Respuesta controlada; flujo manual disponible. |
| Product analytics redaction | Unit/API | Eventos no contienen campos prohibidos. |

## 6. Test data, clock y fixtures

### Test data builders

Crear builders expresivos, no fixtures enormes:

- `QuickTeamBuilder`
- `ManagedTeamBuilder`
- `ParticipantBuilder`
- `AdminIdentityBuilder`
- `AvailabilityBuilder`
- `AvailabilityRequestBuilder`
- `ProposalBuilder`
- `SurveyBuilder`
- `AccessCredentialBuilder`
- `SessionBuilder`
- `AiIntentBuilder`

Cada builder debe permitir defaults validos y variaciones invalidas concretas.

### Fake clock

Todos los tests temporales usan reloj inyectable:

- deadlines;
- 30d `ACTIVE -> RECOVERABLE`;
- 14d `RECOVERABLE -> EXPIRED`;
- TTL de sesiones/tokens;
- fechas relativas de IA.

No se permiten tests con sleeps reales para comportamiento temporal.

### Proveedores fake

CI ordinaria usa:

- fake email provider o Mailpit local controlado;
- fake LLM adapter;
- fake analytics sink;
- fake idp/passwordless si aplica.

No se llama a Resend, proveedor LLM real ni servicios externos en CI ordinaria.

## 7. Accesibilidad

### Automatizada

Debe ejecutarse en component/integration o Playwright:

- `AUTO-A11Y-01` axe sin violaciones critical/serious no justificadas;
- `AUTO-A11Y-02` botones icon-only con nombre;
- `AUTO-A11Y-03` campos con label;
- `AUTO-A11Y-04` contraste de tokens principales;
- `AUTO-A11Y-08` errores asociados;
- `AUTO-A11Y-09` disponibilidad no codificada solo por color;
- `AUTO-A11Y-10` viewport 320px sin scroll horizontal funcional.

### Manual

Debe documentarse evidencia para:

- teclado completo en calendario/lista;
- foco visible y orden logico;
- lector de pantalla o inspeccion de nombres accesibles para calendario;
- zoom 200%;
- separacion visual/semantica de Resultado y Resolucion;
- mensajes de enlace invalido, expirado y revocado.

## 8. Seguridad

Los tests derivados del threat model son obligatorios antes de produccion:

- `TM-01/TM-02`: token leakage/replay;
- `TM-03`: impersonation de participante;
- `TM-04`: admin escalation;
- `TM-05`: IDOR;
- `TM-06`: CSRF;
- `TM-07`: session fixation;
- `TM-08/TM-09`: enumeration y rate limiting;
- `TM-10`: race conditions;
- `TM-11`: injection;
- `TM-12`: logging leakage;
- `TM-13/TM-14`: fallos/proveedor email y LLM;
- `TM-17`: idempotency key;
- `TM-18/TM-19`: lectura publica excesiva y open redirect por `targetPath`;
- `TM-20`: previews/crawlers no consumen acciones destructivas ni renuevan actividad.

## 9. CI quality gates

### Pull request ordinario

- typecheck/lint si existen en la implementacion;
- unit + domain tests;
- API contract tests de rutas tocadas;
- component tests de componentes tocados;
- no snapshots obsoletos sin revision;
- `git diff --check`;
- no dependencia de proveedores externos.

### Pull request que toca dominio, auth, persistencia o API

- suite integration con Testcontainers PostgreSQL;
- tests de autorizacion/IDOR de rutas tocadas;
- tests de idempotencia/concurrencia si toca mutaciones;
- OpenAPI validation.

### Pull request que toca UI de flujos criticos

- Testing Library + axe;
- Playwright smoke del flujo afectado;
- checks responsive basicos;
- evidencia manual cuando el cambio afecta calendario/accesibilidad compleja.

### Antes de release

- E2E-01/02/03 completos;
- E2E-AI-01 con fake adapter;
- suite threat model prioritaria;
- suite accesibilidad automatizada y checklist manual;
- jobs temporales con fake clock;
- purga de equipo rapido expirado;
- revision de analytics/privacy redaction.

## 10. No objetivos iniciales

- No perseguir porcentaje global arbitrario.
- No probar proveedores reales en CI ordinaria.
- No generar fixtures masivos que oculten la intencion del test.
- No hacer E2E para cada variante que pueda cubrirse en dominio/API.
- No usar screenshots como unica asercion funcional.

## 11. Referencias

- `architecture/adr/ADR-014-testing.md`
- `product/17-traceability-matrix.md`
- `technical-design/13-domain/domain-invariants.md`
- `technical-design/14-state-machines/state-machines.md`
- `technical-design/18-api/openapi.yaml`
- `security/22-threat-model/threat-model.md`
- `design/09-accessibility/accessibility-checklist.md`
