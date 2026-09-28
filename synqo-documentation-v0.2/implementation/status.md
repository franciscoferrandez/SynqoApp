# Implementation Status

Memoria viva de la implementación. Git sigue siendo la fuente de verdad de los cambios de código y el spec register el índice de unidades; este documento resume el estado operativo.

## Current phase

Implementation. SPEC-003 está siendo actualizada sobre la corrección verificada de persistencia. El Baseline Conformance Preflight debe volver a pasar antes de su Verification.

## Active work

- `SPEC-003` — Registrar disponibilidad individual diaria (`In Progress`; actualización no destructiva sobre `main` y conformidad de la persistencia de Slice 2 con MikroORM).

## Completed specs

- `SPEC-001` — Bootstrap del repositorio y toolchain (`Verified`; validación técnica y revisión manual completadas el 2026-09-25).
- `SPEC-002` — Crear equipo rápido y acceso de participante (`Verified`; controles, pruebas automatizadas y E2E parcial completados el 2026-09-28).
- `SPEC-015` — Conformidad de persistencia con MikroORM (`Verified`; CI, browser smoke y revisión manual completados el 2026-09-28).

## Next specs

- `SPEC-004` — Disponibilidad colectiva y coincidencias deterministas (`Planned`; no puede iniciarse hasta cerrar `SPEC-003`).

## Known blockers

- Ninguno conocido; la Verification debe confirmar de nuevo el preflight tras la integración de la rama.
- `SPEC-001` no tiene bloqueadores documentales; la implementación debe detenerse y abrir Change Control si una decisión mecánica afecta la baseline o un contrato diseñado.

## Accepted deviations

- None.

## Last validation

- `SPEC-002`: `pnpm test:integration`, `pnpm test:e2e`, lint, typecheck, tests unitarios, format check, validación OpenAPI, build y `git diff --check` correctos el 2026-09-28. OpenAPI no tuvo errores y conserva 47 advertencias preexistentes.
- `SPEC-003`: `pnpm format:check`, `pnpm test`, `pnpm test:integration`, `pnpm lint`, `pnpm typecheck`, `pnpm openapi:check`, `pnpm build`, `pnpm db:migrate` y `pnpm test:e2e` correctos el 2026-09-28. OpenAPI conserva 47 advertencias preexistentes. Estas validaciones funcionales no sustituyen el preflight de baseline pendiente.
- `SPEC-015`: `pnpm run ci` correcto localmente y [`CI #36488303503`](https://github.com/franciscoferrandez/SynqoApp/actions/runs/36488303503) correcto (incluido `browser-smoke`) el 2026-09-28; CodeQL también correcto.

## Environment status

- Repository contains the design/documentation baseline.
- Application workspace y toolchain están implementados. SPEC-015 integra MikroORM en runtime y conserva una excepción limitada de `pg` para el healthcheck técnico; el preflight de persistencia queda `Pass`.
- Branch state and uncommitted changes are reported by Git; this document does not duplicate that history.
