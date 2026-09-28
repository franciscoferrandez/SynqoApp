# Implementation Status

Memoria viva de la implementación. Git sigue siendo la fuente de verdad de los cambios de código y el spec register el índice de unidades; este documento resume el estado operativo.

## Current phase

Implementation. La Design Baseline v1.2 (CR-001 y CR-002 implementadas) sigue vigente, pero el Baseline Conformance Preflight ha detectado una divergencia de persistencia que impide cerrar la Slice 2.

## Active work

- `SPEC-003` — Registrar disponibilidad individual diaria (`Implemented`; cierre bloqueado hasta que la persistencia de negocio cumpla la integración efectiva de MikroORM exigida por la baseline).

## Completed specs

- `SPEC-001` — Bootstrap del repositorio y toolchain (`Verified`; validación técnica y revisión manual completadas el 2026-09-25).
- `SPEC-002` — Crear equipo rápido y acceso de participante (`Verified`; controles, pruebas automatizadas y E2E parcial completados el 2026-09-28).

## Next specs

- `SPEC-004` — Disponibilidad colectiva y coincidencias deterministas (`Planned`; no puede iniciarse hasta cerrar `SPEC-003`).

## Known blockers

- Baseline Conformance Preflight: la persistencia de negocio usa consultas SQL directas y no acredita la integración runtime de MikroORM exigida por la baseline. Debe corregirse en una unidad fundacional antes de cerrar `SPEC-003` o iniciar `SPEC-004`.
- `SPEC-001` no tiene bloqueadores documentales; la implementación debe detenerse y abrir Change Control si una decisión mecánica afecta la baseline o un contrato diseñado.

## Accepted deviations

- None.

## Last validation

- `SPEC-002`: `pnpm test:integration`, `pnpm test:e2e`, lint, typecheck, tests unitarios, format check, validación OpenAPI, build y `git diff --check` correctos el 2026-09-28. OpenAPI no tuvo errores y conserva 47 advertencias preexistentes.
- `SPEC-003`: `pnpm format:check`, `pnpm test`, `pnpm test:integration`, `pnpm lint`, `pnpm typecheck`, `pnpm openapi:check`, `pnpm build`, `pnpm db:migrate` y `pnpm test:e2e` correctos el 2026-09-28. OpenAPI conserva 47 advertencias preexistentes. Estas validaciones funcionales no sustituyen el preflight de baseline pendiente.

## Environment status

- Repository contains the design/documentation baseline.
- Application workspace, toolchain y la slice de equipo rápido están implementados y verificados.
- Branch state and uncommitted changes are reported by Git; this document does not duplicate that history.
