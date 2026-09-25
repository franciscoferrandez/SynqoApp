# 28 - Implementation Roadmap

## 1. Proposito

Este roadmap convierte la documentacion cerrada de Synqo en un plan incremental para empezar implementacion con Codex/terminal.

El orden prioriza vertical slices demostrables end-to-end, no capas tecnicas aisladas. Cada slice debe entregar valor observable con UI, API, dominio, persistencia y tests proporcionales al riesgo.

## 2. Fuentes

- `PRD.md`
- `product/09b-requirements-prioritization.md`
- `product/17-traceability-matrix.md`
- `technical-design/13-domain/domain-design.md`
- `technical-design/15-authorization/authorization-matrix.md`
- `technical-design/17-data-model/data-model.md`
- `technical-design/18-api/api-design.md`
- `technical-design/20-jobs-events/jobs-and-events.md`
- `quality/25-test-plan/test-plan.md`
- `ai/26-technical-design/ai-technical-design.md`
- `ai/27-evaluation/ai-evaluation-plan.md`

## 3. Estado documental antes de codigo

### Listo para iniciar implementacion

- Producto, alcance y MoSCoW estan definidos.
- Arquitectura base aceptada: React + TypeScript + Vite, NestJS, REST/OpenAPI, PostgreSQL + MikroORM, monolito modular y pnpm.
- Dominio, invariantes, estados, autorizacion, sesiones/enlaces, modelo de datos, API, jobs, notificaciones, seguridad, privacidad, analytics, testing e IA estan documentados.
- Los recorridos E2E-01, E2E-02, E2E-03 y E2E-AI-01 tienen trazabilidad.

### Bloqueadores restantes

No hay bloqueadores documentales para empezar codigo.

Riesgos a cerrar durante implementacion:

- elegir librerias concretas de validacion OpenAPI, CSRF, rate limiting y validacion JSON Schema respetando ADR existentes;
- decidir detalles mecanicos de workspace pnpm/Nest/React en el bootstrap;
- ajustar migraciones si MikroORM requiere nombres/constraints ligeramente distintos al modelo logico;
- seleccionar proveedor/modelo IA con evaluacion real, no antes.

## 4. Principios de ejecucion

- Implementar primero el `Minimum Viable Validation`: equipo rapido, participante sin cuenta, disponibilidad, coincidencias, propuesta, encuesta `SINGLE`, resultado y resolucion.
- No construir administracion, cuenta, notificaciones ni IA antes de tener el flujo manual rapido demostrable.
- Evitar big-bang de backend o frontend: cada slice debe tener pantalla navegable y endpoint real o fake controlado solo cuando el slice lo justifique.
- Mantener el dominio determinista como fuente de verdad para disponibilidad, votos, resultados, resoluciones y IA.
- Todo endpoint debe autorizar server-side aunque la UI oculte acciones.
- No introducir capacidades fuera del MVP: chat, recurrencia, franjas horarias generales, RAG, agentes, microservicios, Event Sourcing, CQRS, Redis.

## 5. Orden recomendado de slices

| Orden | Slice | Objetivo | Prioridad |
|---:|---|---|---|
| 0 | Bootstrap/repo | Crear base tecnica minima para entregar slices. | Enablement |
| 1 | Quick team + participant access | Crear equipo rapido y entrar como participante sin cuenta. | Must |
| 2 | Availability | Registrar y consultar disponibilidad propia diaria. | Must |
| 3 | Collective availability + matches + calendar | Ver recuentos, lista/calendario y candidatas deterministas. | Must/Should |
| 4 | Proposal | Crear propuesta, responder, ver resultado y resolver. | Must |
| 5 | Survey | Crear encuesta `SINGLE`, votar, ver resultado y resolver; despues `MULTIPLE`. | Must/Should |
| 6 | Availability requests | Solicitar disponibilidad y responder actualizando disponibilidad general. | Should |
| 7 | Managed/admin | Crear administrable, verificar email, configurar politicas basicas. | Should |
| 8 | Account linking | Cuenta global, vinculos y agregacion de equipos/pendientes. | Could |
| 9 | Lifecycle/jobs | Deadlines, recuperable/expirado, purga y cleanup. | Must/Should |
| 10 | Notifications | Emails transaccionales permitidos y recuperacion admin/cuenta. | Should |
| 11 | AI assistance | Interpretar lenguaje natural, validar, calcular candidatas y evaluar. | Should producto / Required TFM |

El orden 9 puede adelantarse parcialmente cuando una slice introduzca deadlines o expiracion. Por ejemplo, los jobs de verificacion administrable aparecen en slice 7/10; los deadlines de propuesta pueden implementarse inicialmente con validacion on-write/on-read y cerrar sweep en slice 9.

## 6. Estrategia de migraciones

Orden inicial recomendado:

1. Enums y extension `citext` si se confirma su uso.
2. `teams`, `participants`.
3. sesiones y credenciales: `participant_sessions`, `access_credentials`.
4. disponibilidad: `availability_entries`.
5. consultas: `decision_processes`, `proposal_details`, `survey_details`, `decision_options`, `decision_responses`, tablas de respuesta y resolucion.
6. solicitudes: `availability_requests`, `availability_request_participants`.
7. administracion: `administrative_identities`, `administrative_sessions`, links/verificacion necesarios.
8. cuentas y vinculos: `accounts`, `account_sessions`, `participant_account_links`, `administrative_account_links`.
9. auditoria/jobs auxiliares si no basta la persistencia propia de pg-boss.
10. indices de optimizacion adicionales guiados por tests/consultas reales.

Reglas:

- Las migraciones deben poder ejecutarse en entorno limpio.
- Las constraints criticas deben aparecer temprano: pertenencia a equipo, unicidad, estados, links one-time, resolucion unica.
- No crear columnas para backlog fuera de MVP salvo que el modelo ya las requiera para coherencia del Target MVP.

## 7. Feature flags

No se recomienda un sistema general de feature flags al inicio.

Flags/interruptores ligeros aceptables:

- `AI_ASSISTANT_ENABLED`: desactivar IA sin afectar flujo manual.
- `ACCOUNT_FEATURES_ENABLED`: ocultar cuenta/vinculacion si se difiere.
- `EMAIL_PROVIDER_MODE`: fake/Mailpit/Resend por entorno, como configuracion de proveedor, no flag de producto.

No usar flags para ocultar invariantes incompletas. Si una slice se integra, sus reglas de dominio y seguridad deben estar activas.

## 8. Definition of Ready

Una tarea o slice esta lista para empezar cuando:

- referencia RF/HU y prioridad MoSCoW;
- tiene ruta UI o flujo API definido;
- identifica tablas/migraciones tocadas;
- tiene reglas de autorizacion server-side;
- enumera tests minimos;
- define criterio de demo terminado;
- no depende de una decision abierta no documentada.

## 9. Definition of Done

Una slice esta terminada cuando:

- el flujo principal se completa en UI contra backend real;
- las reglas de dominio relevantes estan en servidor;
- OpenAPI/DTOs reflejan endpoints implementados;
- migraciones y constraints necesarias estan aplicadas;
- tests unit/domain/API/component/E2E proporcionales pasan;
- accesibilidad basica de pantallas tocadas esta cubierta;
- errores y estados vacio/cargando/sin permiso estan tratados;
- no hay PII/tokens en logs;
- `git diff --check`, lint/typecheck y suites acordadas pasan.

## 10. Backlog tecnico inicial

Sin estimaciones ficticias:

- crear monorepo pnpm con apps `web` y `api` y packages compartidos solo si aportan valor real;
- configurar TypeScript estricto, lint, format y scripts CI locales;
- configurar NestJS modular: Identity & Access, Teams, Availability, Decisions, Notifications, AI;
- configurar React/Vite con routing, layout base, tokens de diseno y estados UI comunes;
- configurar PostgreSQL local/test y MikroORM migrations;
- generar/validar OpenAPI desde contrato o mantenerlo como artefacto verificado;
- implementar `ProblemDetails` uniforme;
- implementar cookies HttpOnly, CSRF/origin e idempotency middleware;
- implementar fake providers: email, LLM, analytics, clock;
- crear test builders y fake clock;
- configurar Vitest, Testing Library, Playwright, Testcontainers y axe;
- configurar redaccion de logs y analytics sink minimizado;
- preparar seed/demo script para E2E-01 y E2E-02.

## 11. Gates por hito

| Hito | Gate minimo |
|---|---|
| MVV temporal | E2E-01 completo sin cuenta: equipo rapido -> disponibilidad -> coincidencias -> propuesta -> resolucion. |
| MVV decision | E2E-02 `SINGLE` completo: encuesta -> voto -> resultado -> resolucion. |
| Target MVP core | Solicitudes, vistas calendario/lista, `MULTIPLE`, historico basico y pendientes de equipo. |
| Persistencia administrable | E2E-03 con verificacion admin y settings basicos. |
| Operacion segura | Threat model prioritario, deadlines, lifecycle rapido, purga y cleanup. |
| TFM IA | E2E-AI-01 con fake adapter + evaluacion dataset fase 27 contra proveedor real controlado. |

## 12. No objetivos del inicio de implementacion

- No optimizar rendimiento antes de tener consultas reales medidas.
- No introducir cache distribuida.
- No crear microservicios ni colas externas.
- No implementar cuenta como requisito para equipo rapido.
- No implementar IA antes del flujo manual de propuesta.
- No implementar notificaciones automaticas de actividad.
- No implementar funcionalidades `Won't this release`.

## 13. Como usar este roadmap con Codex

Para cada slice:

1. abrir `vertical-slices.md`;
2. leer los documentos referenciados;
3. implementar solo el scope de esa slice;
4. actualizar tests y OpenAPI/contratos si cambia el contrato implementable;
5. ejecutar las validaciones de la slice;
6. no saltar a otra slice salvo dependencia tecnica minima documentada.

La primera tarea de codigo deberia ser la slice 0, seguida inmediatamente por una version demostrable de slice 1.
