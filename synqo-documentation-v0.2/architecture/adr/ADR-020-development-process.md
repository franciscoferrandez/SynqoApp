# ADR-020 — Proceso de entrega y guardrails arquitectónicos

**Estado:** Accepted — revised

## Decisión
Trunk-based development, ramas cortas, PR para cambios relevantes, `main` protegida por CI, Conventional Commits, SemVer para releases, ADR Markdown y Mermaid versionado. Sin `/v1` en API hasta coexistencia real de versiones.

## Regla documental
- decisiones funcionales y reglas: `docs/product`;
- decisiones arquitectónicas entre alternativas significativas: `docs/architecture/adr`.

No convertir automáticamente cada regla de negocio en ADR.
