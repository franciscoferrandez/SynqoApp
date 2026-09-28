# SPEC-015 — Conformidad de persistencia con MikroORM

## Metadata

- Status: `Implemented`
- MoSCoW: `Must` (corrección fundacional)
- Owner: Product owner
- Created: 2026-09-28
- Last updated: 2026-09-28

## Goal

Restablecer la conformidad efectiva de la implementación de Slice 1 con la Design Baseline y ADR-005: la persistencia de negocio de equipos rápidos debe ejecutarse mediante PostgreSQL + MikroORM, no mediante consultas SQL directas en `TeamsService`.

## Scope

- Integración de MikroORM en el runtime NestJS de la API y registro de las entidades ya materializadas por Slice 1: equipo rápido, participante, credencial de acceso y sesión contextual.
- Mapeo de esas entidades sobre el esquema y las migraciones existentes, sin sustituir constraints de PostgreSQL por validaciones de aplicación.
- Sustitución del uso de `Pool` y SQL de negocio en `TeamsService` por casos de uso que oculten MikroORM y conserven transacciones para la creación de equipo rápido.
- Pruebas que demuestren el registro de entidades, la inicialización de ORM en runtime y la preservación de los contratos y garantías de Slice 1.
- Documentar la excepción acotada de `pg` para el healthcheck técnico, si sigue siendo necesaria: no puede convertirse en una vía de persistencia de dominio.

## Non-goals

- Cambiar requisitos, API pública, cookies, autorización, modelo lógico, schema físico o migraciones de Slice 1.
- Implementar disponibilidad, coincidencias, identidad contextual/delegación, equipos administrables o funcionalidades de SPEC-003 y posteriores.
- Introducir un repository CRUD genérico, CQRS, microservicios o una abstracción adicional no exigida por el dominio.
- Sustituir el mecanismo de migraciones de MikroORM ni usar generación automática de schema en runtime.

## Related requirements

### Functional requirements

- `RF-ID-01` — crear un equipo rápido sin cuenta.
- `RF-ID-03` — preservar identidad local de participante.
- `RF-ACC-01` — acceso por enlace público contextual.
- `RF-ACC-04` — sesión de participante contextual.
- `RF-ACC-05` — aislamiento de contexto entre equipos.
- `RF-EQR-01` — equipo rápido activo y con zona horaria.
- `RF-EQR-02` — participante asociado al equipo correcto.
- `RF-EQR-09` — actividad humana relevante conserva el contexto rápido.

### Non-functional requirements

#### Security / privacy

- `RNF-SEC-03` — autorización server-side de operaciones sensibles.
- `RNF-SEC-05` — impedir acceso entre equipos por enumeración o IDOR.
- `RNF-SEC-06` — no exponer tokens sensibles.
- `RNF-PRIV-01` — minimizar PII en equipos rápidos.
- `RNF-PRIV-03` — aislamiento estricto entre equipos.

#### Reliability / compatibility

- `RNF-REL-01` — una operación o reintento no deja efectos duplicados.
- `RNF-COMP-01` — compatibilidad con el runtime y toolchain aprobados.

## Related user stories

- `HU-EQ-01` — crear equipo rápido.
- `HU-EQ-03` — acceder a un equipo rápido como participante.

## Related flows / screens

- `UF-01` — crear equipo rápido.
- `UF-02` — acceder mediante enlace público.
- `SCR-02`, `SCR-03`, `SCR-06`, `SCR-11`.

## Product and domain rules

- Fuentes: [`../technical-design/13-domain/domain-design.md`](../technical-design/13-domain/domain-design.md), [`../technical-design/13-domain/domain-invariants.md`](../technical-design/13-domain/domain-invariants.md), [`../technical-design/17-data-model/data-model.md`](../technical-design/17-data-model/data-model.md).
- Cada módulo NestJS expone casos de uso y oculta los detalles de MikroORM; se permiten métodos de persistencia orientados a invariantes, no un CRUD genérico.
- La creación del equipo, participante, credencial y sesión permanece atómica; constraints, FK y unicidad siguen reforzando el dominio en PostgreSQL.

## Preconditions

- `SPEC-001` y `SPEC-002` están integradas en `main`.
- El Baseline Conformance Preflight ha concluido `Fail` el 2026-09-28: `apps/api/src/app.module.ts` no integra MikroORM, `apps/api/src/mikro-orm.config.ts` declara `entities: []` y `apps/api/src/teams.service.ts` usa `pg.Pool` para persistencia de negocio.
- La Design Baseline v1.0 y [`ADR-005`](../architecture/adr/ADR-005-persistence.md) exigen PostgreSQL + MikroORM. Esta SPEC restaura esa decisión; no la modifica y no requiere Change Request.

## Functional behaviour

- Crear, leer y unirse a un equipo rápido conserva los mismos resultados, errores, sesiones, referencias públicas y garantías transaccionales actuales.
- La API inicializa MikroORM en el runtime y usa entidades registradas para toda persistencia de negocio ya existente en Slice 1.
- El healthcheck puede conservar una comprobación mínima directa de conectividad PostgreSQL, sin entidades ni lógica de dominio; cualquier excepción se documenta y cubre solo ese uso técnico.

## Authorization

- No se modifica la matriz de autorización. La migración de persistencia conserva las comprobaciones contextuales de `TeamsService` y los casos negativos existentes.

## API contract

- No cambia [`../technical-design/18-api/openapi.yaml`](../technical-design/18-api/openapi.yaml). Se preservan los endpoints de creación, lectura, unión y contexto de participante de Slice 1.

## Data / persistence

- Se mapean las tablas `teams`, `participants`, `access_credentials` y `participant_sessions` existentes mediante MikroORM, con sus UUID, referencias públicas, relaciones, nullability y constraints actuales.
- Las migraciones existentes siguen siendo la fuente del schema; esta SPEC no crea schema automáticamente ni cambia datos existentes.
- La transacción de creación rápida se ejecuta mediante la unidad de trabajo/transacción de MikroORM.

## UI behaviour

- N/A. El comportamiento de las pantallas existentes no cambia.

## Errors and edge cases

- Un fallo durante la creación no deja equipo, participante, credencial o sesión parciales.
- Una entidad no registrada, una configuración ORM inválida o una conexión no disponible falla de forma controlada y no degrada a SQL directo para persistencia de negocio.
- Las relaciones de participante y sesión siguen impidiendo consultar o actuar en otro equipo.

## Security / privacy considerations

- Se preservan hashing de tokens, protección CSRF/origin, rate limit y aislamiento por equipo existentes.
- Las excepciones técnicas no deben registrar URL de conexión, tokens, cookies ni datos de participante.

## Acceptance criteria

1. **Given** el arranque de la API, **when** se inicializa el módulo de aplicación, **then** MikroORM queda integrado en runtime con las entidades de Slice 1 registradas y `TeamsService` no crea ni usa `pg.Pool`.
2. **Given** la creación válida de un equipo rápido, **when** se completa, **then** se persisten de forma atómica equipo, participante, credencial y sesión mediante MikroORM, conservando el contrato actual.
3. **Given** una operación fallida durante la creación, **when** termina, **then** PostgreSQL no contiene un agregado parcial.
4. **Given** una lectura pública, unión o consulta de contexto existentes, **when** se ejecutan, **then** sus respuestas, errores y aislamiento entre equipos se mantienen sin cambios de OpenAPI.
5. **Given** el healthcheck, **when** verifica PostgreSQL, **then** cualquier uso directo de `pg` queda limitado a esa sonda técnica y no ejecuta persistencia de dominio.
6. **Given** el Baseline Conformance Preflight, **when** revisa esta corrección, **then** encuentra configuración de ejecución, entidades, transacciones y pruebas reales de PostgreSQL + MikroORM.

## Required tests

### Unit

- Configuración ORM y registro de entidades de Slice 1.
- Casos de servicio para éxito y rollback de creación rápida, con la transacción de ORM.

### Integration

- PostgreSQL real: creación, lectura, unión y contexto conservan contratos, FK, unicidad, aislamiento y ausencia de escritura parcial.
- Arranque de API con MikroORM integrado; healthcheck de PostgreSQL sin acceso de dominio por SQL directo.

### E2E

- El flujo existente de crear equipo, abrir enlace en contexto limpio e identificarse sigue funcionando sin cambio observable.

## Documentation impact

- Actualizar esta SPEC, [`spec-register.md`](spec-register.md), [`../implementation/status.md`](../implementation/status.md), el registro de evidencia y el hito metodológico con resultados objetivos.
- Actualizar la guía docente de esta SPEC cuando exista implementación; no cambiar requisitos, baseline, ADR-005, OpenAPI ni roadmap sin una decisión posterior.

## Implementation constraints

- Usar el adaptador oficial de NestJS/MikroORM y versiones compatibles con el runtime y las dependencias principales aprobadas; documentar una excepción solo si existe incompatibilidad comprobada.
- Mantener monolito modular, Data Mapper y Unit of Work de MikroORM; no introducir repositorios genéricos.
- No mezclar esta corrección con la disponibilidad no integrada de SPEC-003. Tras fusionarla, SPEC-003 deberá actualizarse sobre `main` y superar su propio Baseline Conformance Preflight.

## Out of scope

- Cualquier cambio de producto o contrato de Slice 1.
- Refactor de `SPEC-003` en su rama no integrada; se realizará tras esta corrección para que use el cimiento ya incorporado.
- Persistencia de slices posteriores.

## Traceability

- Requirements: `RF-ID-01`, `RF-ID-03`, `RF-ACC-01`, `RF-ACC-04`, `RF-ACC-05`, `RF-EQR-01`, `RF-EQR-02`, `RF-EQR-09`, RNF de seguridad, privacidad, fiabilidad y compatibilidad indicados arriba.
- User stories: `HU-EQ-01`, `HU-EQ-03`.
- Baseline: [`../project/design-baseline.md`](../project/design-baseline.md).
- Change Request: N/A; restaura ADR-005 sin cambiar la baseline.
- ADR: [`ADR-005`](../architecture/adr/ADR-005-persistence.md), ADR-014, ADR-015 y ADR-020.
- Implementation commit: pending commit reference.
- Verification evidence: pending `$synqo-verification`.

## Implementation outcome

- Implemented as specified: Yes. MikroORM se integra mediante el adaptador oficial de NestJS, entidades explícitas y `EntityManager` transaccional; `TeamsService` ya no usa `pg.Pool`.
- Deviations: `DatabaseHealthService` conserva `pg.Client` exclusivamente para `SELECT 1` de salud técnica; no accede a entidades ni persistencia de dominio.
- Versions: paquetes principales MikroORM actualizados a `7.2.2`; `@mikro-orm/nestjs` usa `7.1.0`, su última versión publicada y compatible con MikroORM v7/NestJS 12.
- Verification: `pnpm run ci` correcto el 2026-09-28 (format, lint, typecheck, unit, integración con PostgreSQL/Testcontainers, OpenAPI y build); revisión manual del propietario aceptada. El E2E local queda pendiente de CI porque el puerto 3000 estaba ocupado por una API externa a esta rama.
- Notes for TFM: SPEC correctiva creada tras un `Fail` verificable del Baseline Conformance Preflight; no se considera deuda diferida.

## Definition of Done

Aplicar [`../development/definition-of-done.md`](../development/definition-of-done.md). Además: pruebas reales demuestran integración runtime de MikroORM, entidades de Slice 1, transacción sin escrituras parciales y compatibilidad contractual; el preflight queda `Pass` antes de cerrar la SPEC.
