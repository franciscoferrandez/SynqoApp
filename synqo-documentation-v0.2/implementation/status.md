# Implementation Status

Memoria viva de la implementación. Git sigue siendo la fuente de verdad de los cambios de código y el spec register el índice de unidades; este documento resume el estado operativo.

## Current phase

Implementation. SPEC-003 está implementada sobre la persistencia MikroORM verificada; el browser smoke aislado de CI completa la Verification.

## Active work

- `SPEC-003` — Registrar disponibilidad individual diaria (`Implemented`; `pnpm run ci` y revisión manual correctos; browser smoke de PR pendiente).

## Completed specs

- `SPEC-001` — Bootstrap del repositorio y toolchain (`Verified`; validación técnica y revisión manual completadas el 2026-09-25).
- `SPEC-002` — Crear equipo rápido y acceso de participante (`Verified`; controles, pruebas automatizadas y E2E parcial completados el 2026-09-28).
- `SPEC-015` — Conformidad de persistencia con MikroORM (`Verified`; CI, browser smoke y revisión manual completados el 2026-09-28).

## Next specs

- `SPEC-004` — Disponibilidad colectiva y coincidencias deterministas (`Planned`; no puede iniciarse hasta cerrar `SPEC-003`).

## Known blockers

- Browser smoke aislado del PR pendiente para marcar SPEC-003 `Verified`.
- `SPEC-001` no tiene bloqueadores documentales; la implementación debe detenerse y abrir Change Control si una decisión mecánica afecta la baseline o un contrato diseñado.

## Accepted deviations

- None.

## Last validation

- `SPEC-002`: `pnpm test:integration`, `pnpm test:e2e`, lint, typecheck, tests unitarios, format check, validación OpenAPI, build y `git diff --check` correctos el 2026-09-28. OpenAPI no tuvo errores y conserva 47 advertencias preexistentes.
- `SPEC-003`: `pnpm run ci` correcto el 2026-09-29 (incluye format, lint, typecheck, unit, 11 tests de integración, OpenAPI y build); revisión manual del propietario correcta; browser smoke aislado pendiente en PR. OpenAPI conserva 47 advertencias preexistentes.
- `SPEC-015`: `pnpm run ci` correcto localmente y [`CI #36488303503`](https://github.com/franciscoferrandez/SynqoApp/actions/runs/36488303503) correcto (incluido `browser-smoke`) el 2026-09-28; CodeQL también correcto.

## Environment status

- Repository contains the design/documentation baseline.
- Application workspace y toolchain están implementados. El preflight de SPEC-003 queda `Pass`: MikroORM registra `AvailabilityEntryEntity` y `TeamsService` usa `EntityManager`; `pg.Client` permanece limitado al healthcheck técnico.
- Branch state and uncommitted changes are reported by Git; this document does not duplicate that history.
