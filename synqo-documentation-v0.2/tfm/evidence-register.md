# Evidence Register

Índice central de evidencias significativas. Cada entrada debe apuntar al artefacto real y no duplicar su contenido.

| ID | Fecha | Tipo | Artefacto | Relacionado con | Evidencia | Observaciones |
|---|---|---|---|---|---|---|
| E-001 | 2026-09-24 | DESIGN | [`../project/design-baseline.md`](../project/design-baseline.md) | Design Baseline v1.0 | Baseline documental para implementation | Establecida para comenzar implementación; no implica que exista código. |
| E-002 | 2026-09-24 | DESIGN | [`../development/spec-driven-development.md`](../development/spec-driven-development.md) | Proceso SDD | Workflow Spec-First y estados de SPEC | Operativa aprobada documentalmente. |
| E-003 | 2026-09-24 | DESIGN | [`../delivery/28-implementation-roadmap/vertical-slices.md`](../delivery/28-implementation-roadmap/vertical-slices.md) | Roadmap | Slices, dependencias y gates | Fuente del orden inicial de SPECs. |
| E-004 | 2026-09-25 | SPEC | [`../specs/SPEC-001-bootstrap-repository-toolchain.md`](../specs/SPEC-001-bootstrap-repository-toolchain.md) | SPEC-001 | SPEC Ready para Slice 0, con alcance, trazabilidad, criterios de aceptación y tests requeridos | Preparada en rama `docs/SPEC-001-bootstrap`; no contiene código ni resultados de verificación. |

Tipos admitidos: `REQUIREMENT`, `DESIGN`, `DECISION`, `SPEC`, `IMPLEMENTATION`, `TEST`, `SECURITY`, `UX`, `AI`, `DEPLOYMENT`, `CHANGE`, `METRIC`.

No se registran aquí commits, tests o métricas hasta que existan como evidencia objetiva.
