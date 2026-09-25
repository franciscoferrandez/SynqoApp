# SPEC-001 — Bootstrap del repositorio y toolchain

## Metadata

- Status: `Ready`
- MoSCoW: `Must` (enablement)
- Owner: pendiente de asignación humana
- Created: 2026-09-25
- Last updated: 2026-09-25

## Goal

Crear la base técnica mínima del monorepo para que las siguientes vertical slices puedan desarrollarse, ejecutarse y verificarse localmente sin introducir todavía comportamiento de producto.

## Scope

- Crear un workspace pnpm con las aplicaciones `apps/web` y `apps/api`.
- Configurar TypeScript estricto y la configuración común mínima que aporte valor real.
- Crear una app web React + TypeScript + Vite con app shell mínima y estados claros para rutas todavía vacías.
- Crear una API NestJS + TypeScript con un healthcheck técnico.
- Configurar PostgreSQL local mediante Docker Compose y MikroORM en la API, sin tablas de dominio de las siguientes slices.
- Preparar scripts locales coherentes para instalar, lintar, formatear, hacer typecheck, ejecutar tests y construir web/API.
- Preparar CI con los gates disponibles del repositorio: instalación reproducible, format check, lint, typecheck, tests y builds.
- Mantener el contrato REST/OpenAPI como fuente de verdad y añadir un check mínimo de consistencia/validación sin inventar endpoints funcionales.
- Incluir los smoke tests definidos para este slice y una prueba Playwright de carga del app shell.

## Non-goals

- No implementar equipos, participantes, disponibilidad, decisiones, encuestas, autenticación ni autorización de producto.
- No crear CRUD genérico, dashboards ni pantallas finales.
- No crear tablas de dominio ni migraciones de negocio de las slices posteriores.
- No implementar emails, jobs, IA, analytics de producto ni proveedores externos.
- No cambiar requisitos, decisiones arquitectónicas, baseline, OpenAPI funcional ni roadmap.
- No añadir Nx, Turborepo, microservicios, CQRS, Event Sourcing, Redis ni una plataforma de feature flags.

## Related requirements

### Non-functional requirements

#### Usability

- `RNF-US-01` — Operaciones principales con fricción mínima y sin registro cuando proceda.
- `RNF-US-04` — Diferenciar inequívocamente `No disponible` y `Sin respuesta`.
- `RNF-US-05` — Diferenciar inequívocamente disponibilidad general y respuesta a propuesta.

#### Accessibility

- `RNF-A11Y-01` — Objetivo WCAG 2.2 AA.
- `RNF-A11Y-02` — Operaciones principales accesibles por teclado y con foco perceptible.
- `RNF-A11Y-03` — El color no es el único codificador de estado.

#### Security

- `RNF-SEC-03` — Autorización validada en servidor para toda operación sensible.
- `RNF-SEC-05` — Prevención de acceso entre equipos por enumeración o IDOR.
- `RNF-SEC-06` — No exponer tokens sensibles innecesariamente en URLs, logs o telemetría.

#### Privacy

- `RNF-PRIV-01` — Minimización de PII, especialmente en equipos rápidos.
- `RNF-PRIV-03` — Aislamiento estricto entre equipos.

#### Reliability

- `RNF-REL-01` — Los reintentos accidentales no generan respuestas duplicadas.

#### Compatibility / responsive

- `RNF-COMP-01` — Compatibilidad con navegadores modernos de escritorio y móvil.
- `RNF-RESP-01` — Diseño responsive mobile-first.

La lista de `RNF release blockers` aplicable al producto completo se mantiene en [`../product/09b-requirements-prioritization.md`](../product/09b-requirements-prioritization.md); esta SPEC solo establece los fundamentos que pueden verificarse en el bootstrap.

## Related user stories

- N/A: el Slice 0 no introduce una historia de usuario funcional.

## Related flows / screens

- App shell mínima de la aplicación web.
- Healthcheck técnico de la API.
- No implementa ninguna pantalla de producto ni recorrido E2E funcional.

## Product and domain rules

- Source: [`../delivery/28-implementation-roadmap/vertical-slices.md`](../delivery/28-implementation-roadmap/vertical-slices.md), `Slice 0 - Bootstrap/repo`.
  - El bootstrap habilita slices verticales y no crea producto falso.
  - No hay reglas de dominio de negocio en esta unidad salvo tipos compartidos evidentes.
- Source: [`../project/design-baseline.md`](../project/design-baseline.md).
  - La implementación debe respetar la baseline activa y sus fuentes normativas.
- Source: [`../architecture/adr/ADR-007-monorepo.md`](../architecture/adr/ADR-007-monorepo.md).
  - El repositorio usa pnpm workspaces sin Nx/Turborepo inicialmente.

## Preconditions

- La rama de trabajo es una rama temporal basada en `main`.
- El workspace no contiene código de aplicación previo que deba preservarse o migrarse.
- Node.js y pnpm están disponibles en el host según [`../architecture/adr/ADR-009-local-development.md`](../architecture/adr/ADR-009-local-development.md).
- Docker está disponible para PostgreSQL local.
- La Design Baseline v1.0 permanece `Active for implementation` y no presenta baseline blocker global.

## Functional behaviour

### Workspace

- El repositorio instala dependencias desde un único lockfile pnpm.
- `apps/web` y `apps/api` se pueden ejecutar y construir de forma independiente mediante scripts documentados.
- Los scripts raíz permiten ejecutar los checks del workspace sin depender de herramientas no documentadas.
- La configuración compartida no fuerza paquetes o abstracciones que no sean necesarios para este slice.

### Web

- La app web arranca en desarrollo y produce un build de producción.
- La ruta inicial muestra el app shell mínimo y un estado explícito de funcionalidad todavía no disponible.
- El app shell es navegable por teclado, tiene foco perceptible y no usa color como único indicador.
- No expone controles que aparenten crear o modificar datos de producto.

### API

- La API arranca en desarrollo y produce un build de producción.
- Expone un healthcheck técnico público y no mutador para verificar que el proceso está vivo.
- El healthcheck no devuelve secretos, credenciales, tokens ni PII.
- Los errores del healthcheck y del bootstrap usan una respuesta consistente y no filtran detalles sensibles.

### Persistencia e infraestructura local

- Docker Compose permite levantar PostgreSQL para desarrollo y tests de integración futuros.
- MikroORM queda configurado con una conexión parametrizada por entorno y migraciones ejecutables.
- No se crean entidades ni tablas de dominio de `SPEC-002` o posteriores.
- Los secretos y credenciales locales se proporcionan por variables de entorno/documentación de ejemplo, nunca mediante secretos reales commiteados.

### CI y contrato

- CI ejecuta los checks del workspace definidos en esta SPEC.
- Se valida el contrato OpenAPI existente como artefacto documental/contractual, sin generar endpoints funcionales no incluidos en esta unidad.
- Los comandos reales usados por CI quedan reflejados en los scripts del workspace y en la documentación de implementación si difieren de la guía.

## Authorization

- No hay autorización de producto en esta SPEC porque no se implementan recursos de equipos, participantes o decisiones.
- El healthcheck solo expone información técnica mínima y no permite mutaciones.
- No se debe añadir un bypass de autorización que pueda reutilizarse silenciosamente en slices posteriores.
- Las decisiones de autenticación, sesiones y autorización contextual siguen gobernadas por [`../architecture/adr/ADR-008-authentication.md`](../architecture/adr/ADR-008-authentication.md), [`../architecture/adr/ADR-015-security.md`](../architecture/adr/ADR-015-security.md) y [`../architecture/adr/ADR-022-contextual-authorization.md`](../architecture/adr/ADR-022-contextual-authorization.md).

## API contract

- Mantener [`../technical-design/18-api/openapi.yaml`](../technical-design/18-api/openapi.yaml) como fuente de verdad del contrato REST.
- El healthcheck técnico puede documentarse como endpoint operativo separado si la implementación lo necesita; no debe alterar silenciosamente los endpoints funcionales diseñados.
- No se introducen endpoints de producto en esta SPEC.

## Data / persistence

- PostgreSQL local mediante Docker Compose, con configuración separada por entorno.
- MikroORM configurado para migraciones y conexión parametrizada.
- Sin tablas de dominio requeridas por esta unidad; una migración inicial vacía o de infraestructura solo se crea si la herramienta la necesita para un arranque reproducible.
- No se persisten tokens, PII ni datos de usuario en el healthcheck o en logs de bootstrap.

## UI behaviour

- App shell responsive y mobile-first, coherente con [`../architecture/adr/ADR-001-platform-strategy.md`](../architecture/adr/ADR-001-platform-strategy.md) y la baseline visual.
- Estado inicial claro, sin simular funcionalidades futuras.
- Estructura preparada para rutas posteriores sin construir navegación de producto no especificada.
- Accesibilidad básica: landmarks semánticos, foco visible, navegación por teclado y contraste conforme al objetivo WCAG 2.2 AA aplicable.

## Errors and edge cases

- Instalación limpia desde el lockfile.
- Ejecución sin PostgreSQL: la API comunica un error operativo claro sin filtrar credenciales; el proceso no declara salud de base de datos si no puede comprobarla.
- Variables de entorno ausentes o inválidas: fallo temprano y mensaje accionable sin revelar secretos.
- Puerto ocupado o dependencia local no disponible: error reproducible y documentado.
- Healthcheck repetido: no crea datos ni cambia estado.
- App shell cargada sin API disponible: muestra un estado claro y no aparenta que una operación de producto haya tenido éxito.
- CI debe fallar ante format, lint, typecheck, test, build o validación contractual fallidos.

## Security / privacy considerations

- Aplicar los defaults de seguridad transversales que sean pertinentes al proceso API y al entorno expuesto, siguiendo [`../architecture/adr/ADR-015-security.md`](../architecture/adr/ADR-015-security.md).
- No commitear secretos, `.env` reales, tokens, dumps de base de datos ni credenciales.
- Sanitizar/redactar logs conforme a [`../architecture/adr/ADR-013-observability.md`](../architecture/adr/ADR-013-observability.md).
- El healthcheck y los errores no deben permitir enumerar equipos, participantes o recursos de producto.
- No se introducen datos personales ni proveedores externos en esta unidad.

## Acceptance criteria

1. **Given** un checkout limpio con Node.js, pnpm y Docker disponibles, **when** se instala el workspace usando el lockfile, **then** la instalación termina sin modificaciones inesperadas del lockfile.
2. **Given** el workspace instalado, **when** se ejecutan los scripts raíz de format check, lint, typecheck, tests y build, **then** todos terminan correctamente.
3. **Given** PostgreSQL levantado con la configuración documentada, **when** se ejecuta la configuración/migración inicial de MikroORM, **then** termina de forma reproducible sin crear tablas de dominio fuera del alcance.
4. **Given** la API arrancada, **when** se consulta el healthcheck técnico, **then** responde con éxito, no muta datos y no expone secretos, tokens ni PII.
5. **Given** la API sin una dependencia local requerida o con una variable inválida, **when** se inicia o se consulta el healthcheck, **then** devuelve/falla con un error operativo claro y sin información sensible.
6. **Given** la app web arrancada, **when** se visita la ruta inicial, **then** carga el app shell, muestra un estado explícito de funcionalidad futura y permite navegación básica por teclado.
7. **Given** la app web compilada, **when** se sirve el build, **then** Playwright puede cargar el app shell sin errores bloqueantes de consola ni recursos rotos.
8. **Given** un cambio que incumple format, lint, typecheck, tests, build o validación OpenAPI, **when** se ejecuta CI, **then** el job falla antes de aceptar el cambio.
9. **Given** el diff de la unidad, **when** se revisa contra esta SPEC y el roadmap, **then** no contiene funcionalidades de producto, tablas de dominio ni cambios silenciosos de baseline.

## Required tests

### Unit

- Smoke test de configuración compartida y scripts críticos.
- Unit test del formateo/contrato de la respuesta del healthcheck.
- Unit test de validación de configuración/variables de entorno sin exponer valores sensibles.

### Integration

- API smoke test contra la aplicación NestJS arrancada.
- Healthcheck con y sin dependencia PostgreSQL según el contrato operativo definido.
- Smoke test de conexión/migración MikroORM usando PostgreSQL local o Testcontainers cuando el harness esté disponible.
- Validación del artefacto OpenAPI y comprobación de que no se han introducido endpoints funcionales fuera de alcance.

### UI/component

- Render del app shell y estado vacío/no disponible.
- Navegación por teclado y foco perceptible en la ruta inicial.
- Comprobación de que los estados no dependen solo del color cuando el componente tenga indicadores visuales.

### E2E

- Playwright: cargar la app web desde un servidor real y verificar el app shell.
- No se ejecutan todavía E2E-01, E2E-02, E2E-03 ni E2E-AI-01; pertenecen a slices posteriores.

## Documentation impact

- Crear esta SPEC desde `SPEC-TEMPLATE`.
- Actualizar [`spec-register.md`](spec-register.md) de `Planned` a `Ready`.
- Actualizar [`../implementation/status.md`](../implementation/status.md) para reflejar que `SPEC-001` está lista para implementación y que todavía no hay código de aplicación.
- Registrar la evidencia de la SPEC en [`../tfm/evidence-register.md`](../tfm/evidence-register.md).
- Registrar el uso relevante de IA en [`../tfm/ai-assisted-development-log.md`](../tfm/ai-assisted-development-log.md), sin almacenar prompts completos.
- Añadir el hito metodológico de SPEC preparada/Ready en [`../tfm/methodology-log.md`](../tfm/methodology-log.md).
- No modificar el roadmap, la baseline ni los documentos de requisitos.

## Implementation constraints

- Implementar en una rama `feat/SPEC-001-bootstrap` derivada de `main`, con autorización explícita para crearla/cambiar a ella.
- Respetar React + TypeScript + Vite, NestJS + TypeScript, PostgreSQL + MikroORM, REST/OpenAPI y monorepo pnpm.
- Ejecutar web/API en host y usar Docker Compose para PostgreSQL, conforme a ADR-009.
- No introducir Nx/Turborepo ni un sistema de paquetes compartidos por anticipación; añadir un package compartido solo si una necesidad concreta de esta unidad lo justifica.
- Mantener configuración estricta y scripts reproducibles; documentar versiones de runtime/package manager elegidas en los artefactos de implementación, sin convertirlas en una decisión de producto.
- Mantener el healthcheck y la app shell pequeños, verificables y sin dominio falso.
- Si una decisión mecánica afecta la baseline, contrato público, seguridad diseñada o alcance, detenerse y derivar a Change Control.

## Out of scope

- Todas las funcionalidades de `SPEC-002` y posteriores.
- Migraciones de negocio, seeds de producto y fixtures con PII.
- Autenticación, sesiones, access links y autorización contextual de participantes/administradores.
- Notificaciones, jobs, IA, analytics y despliegue de producción.

## Traceability

- Requirements: RNF release blockers aplicables; lista completa en [`../product/09b-requirements-prioritization.md`](../product/09b-requirements-prioritization.md).
- User stories: N/A para Slice 0.
- Baseline: [`../project/design-baseline.md`](../project/design-baseline.md)
- Change Request: N/A
- ADR: ADR-001, ADR-002A, ADR-004, ADR-005, ADR-006, ADR-007, ADR-009, ADR-010, ADR-012, ADR-013, ADR-014, ADR-015.
- Roadmap: [`../delivery/28-implementation-roadmap/implementation-roadmap.md`](../delivery/28-implementation-roadmap/implementation-roadmap.md), [`../delivery/28-implementation-roadmap/vertical-slices.md`](../delivery/28-implementation-roadmap/vertical-slices.md) — Slice 0.
- Implementation commit: pending
- Verification evidence: pending; ejecutar `$synqo-verification` tras la implementación.

## Implementation outcome

- Implemented as specified: `pending`
- Deviations: `pending`
- Verification: `pending`
- Notes for TFM: La SPEC formaliza la primera unidad de implementación y conserva la separación `SPEC -> CODE`; no registra código ni resultados de tests todavía.

## Definition of Done

Referenciar [`../development/definition-of-done.md`](../development/definition-of-done.md) y cumplir además:

- La instalación limpia, los scripts del workspace, el healthcheck, la configuración de persistencia y el app shell tienen pruebas proporcionales al alcance.
- CI ejecuta los gates documentados y falla ante regresiones de formato, tipos, tests, build o contrato.
- No se han creado funcionalidades de producto ni tablas de dominio fuera de esta SPEC.
- La documentación de comandos reales, variables de entorno y límites del bootstrap queda sincronizada.
