# AI-Assisted Development Log

Registro de usos relevantes de IA durante el desarrollo. No almacena conversaciones completas, prompts enteros, secretos ni código sensible.

| ID | Fecha | Herramienta | Actividad | Artefacto | Intervención humana | Resultado |
|---|---|---|---|---|---|---|
| AI-DEV-001 | 2026-09-24 | Codex | Preparación de la operativa de implementación | `project/design-baseline.md`, `IMPLEMENTATION-GUIDE.md`, `development/`, `specs/`, `tfm/` | El propietario define el alcance; se revisan fuentes, se preservan decisiones y se limita la tarea a documentación. | Accepted |
| AI-DEV-002 | 2026-09-25 | Codex | Authoring de SPEC-001 desde la plantilla y sincronización de registros | `specs/SPEC-001-bootstrap-repository-toolchain.md`, `specs/spec-register.md`, `implementation/status.md`, `tfm/` | El propietario autorizó la rama documental y debe revisar/autorizar la futura implementación; se mantuvo el alcance del Slice 0 y no se implementó código. | SPEC marcada `Ready`; pendiente de implementación y verificación. |
| AI-DEV-003 | 2026-09-25 | Codex | Implementación y verificación local de SPEC-001 | Workspace pnpm, `apps/web`, `apps/api`, CI y registros de evidencia | El propietario autorizó expresamente la rama `feat/SPEC-001-bootstrap`, realizó el smoke manual y aceptó el resultado; la IA se limitó al alcance aprobado y ejecutó los checks definidos. | Accepted. |
| AI-DEV-004 | 2026-09-25 | Codex | Authoring de SPEC-002 desde la plantilla y sincronización de registros | `specs/SPEC-002-quick-team-participant-access.md`, `specs/spec-register.md`, `implementation/status.md`, `tfm/` | El propietario autorizó la rama documental; se revisaron las fuentes del Slice 1 y se preservó la baseline sin implementar código. | SPEC marcada `Ready`; pendiente de autorización para implementación y verificación. |

En entradas futuras, `Intervención humana` debe resumir revisión, correcciones, rechazo o aceptación de propuestas. No se registran usos triviales que no dejen evidencia significativa.
