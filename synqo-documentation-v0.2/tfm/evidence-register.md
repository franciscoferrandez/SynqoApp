# Evidence Register

Índice central de evidencias significativas. Cada entrada debe apuntar al artefacto real y no duplicar su contenido.

| ID | Fecha | Tipo | Artefacto | Relacionado con | Evidencia | Observaciones |
|---|---|---|---|---|---|---|
| E-001 | 2026-09-24 | DESIGN | [`../project/design-baseline.md`](../project/design-baseline.md) | Design Baseline v1.0 | Baseline documental para implementation | Establecida para comenzar implementación; no implica que exista código. |
| E-002 | 2026-09-24 | DESIGN | [`../development/spec-driven-development.md`](../development/spec-driven-development.md) | Proceso SDD | Workflow Spec-First y estados de SPEC | Operativa aprobada documentalmente. |
| E-003 | 2026-09-24 | DESIGN | [`../delivery/28-implementation-roadmap/vertical-slices.md`](../delivery/28-implementation-roadmap/vertical-slices.md) | Roadmap | Slices, dependencias y gates | Fuente del orden inicial de SPECs. |
| E-004 | 2026-09-25 | SPEC | [`../specs/SPEC-001-bootstrap-repository-toolchain.md`](../specs/SPEC-001-bootstrap-repository-toolchain.md) | SPEC-001 | SPEC Ready para Slice 0, con alcance, trazabilidad, criterios de aceptación y tests requeridos | Preparada en rama `docs/SPEC-001-bootstrap`; no contiene código ni resultados de verificación. |
| E-005 | 2026-09-25 | IMPLEMENTATION | [`../../package.json`](../../package.json), [`../../apps/api/test/health.integration-spec.ts`](../../apps/api/test/health.integration-spec.ts), [`../../apps/web/tests/app-shell.spec.ts`](../../apps/web/tests/app-shell.spec.ts) | SPEC-001 | `pnpm run ci`, `pnpm test:e2e` y `pnpm db:migrate` correctos; migración limitada a la tabla técnica `mikro_orm_migrations`; smoke manual de API/web aceptado por el propietario | OpenAPI válido sin errores; 47 advertencias ya presentes en el contrato documental. |
| E-006 | 2026-09-25 | SECURITY | [`../../.github/workflows/codeql.yml`](../../.github/workflows/codeql.yml), [`../architecture/adr/ADR-012-ci-cd.md`](../architecture/adr/ADR-012-ci-cd.md), [`../architecture/adr/ADR-015-security.md`](../architecture/adr/ADR-015-security.md) | SPEC-001; control de análisis estático | CodeQL quedó operativo en CI tras hacer público el repositorio; en un repositorio privado requiere GitHub Code Security para publicar sus resultados | Decisión temporal por coste. Si el repositorio pasa a privado sin ese servicio, abrir una CR antes de sustituir CodeQL por controles equivalentes a evaluar: Semgrep CE, Gitleaks y Dependabot. |
| E-007 | 2026-09-25 | SPEC | [`../specs/SPEC-002-quick-team-participant-access.md`](../specs/SPEC-002-quick-team-participant-access.md) | SPEC-002 | SPEC Ready para Slice 1, con alcance, trazabilidad, autorización, criterios de aceptación y tests requeridos | Preparada en rama `docs/SPEC-002-quick-team`; no contiene código ni resultados de verificación. |

Tipos admitidos: `REQUIREMENT`, `DESIGN`, `DECISION`, `SPEC`, `IMPLEMENTATION`, `TEST`, `SECURITY`, `UX`, `AI`, `DEPLOYMENT`, `CHANGE`, `METRIC`.

No se registran aquí commits, tests o métricas hasta que existan como evidencia objetiva.
