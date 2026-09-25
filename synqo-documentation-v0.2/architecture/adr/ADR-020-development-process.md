# ADR-020 — Proceso de entrega y guardrails arquitectónicos

**Estado:** Accepted — revised
**Última revisión:** 2026-09-24

## Decisión
Synqo usa Waterfall a nivel macro: Requirements/Analysis, Design, Design Baseline, Implementation, Verification & Validation, Deployment y TFM Evaluation/As-Built Documentation. Analysis y Design terminan en una baseline documental estable.

Durante Implementation se usa Spec-First SDD a nivel micro: una SPEC pasa por `Planned`, `Draft`, `Ready`, `In Progress`, `Implemented` y `Verified`; una funcionalidad sustancial no empieza sin SPEC `Ready`. Cada cambio pasa por verificación proporcional y revisión humana.

Trunk-based development, ramas cortas, PR para cambios relevantes, `main` protegida por CI, Conventional Commits, SemVer para releases, ADR Markdown y Mermaid versionado. Sin `/v1` en API hasta coexistencia real de versiones.

Los cambios que afecten la Design Baseline se gestionan mediante Change Request antes de implementar. Los cambios menores que no alteren comportamiento pueden seguir el flujo de small change. La verificación final es obligatoria para cambios de código, tests, build, datos o comportamiento.

La conservación de evidencia estructurada para el TFM es una consecuencia operativa: se indexan decisiones, hitos, validaciones y usos relevantes de IA sin sustituir Git, SPECs, ADRs, CRs ni informes de testing.

## Regla documental
- decisiones funcionales y reglas: `product/`;
- decisiones arquitectónicas entre alternativas significativas: `architecture/adr/`;
- operativa de implementación: `IMPLEMENTATION-GUIDE.md`, `development/`, `specs/`, `changes/`, `implementation/`;
- evidencia TFM: `tfm/` como índice contextual, no como copia de Git o de conversaciones.

No convertir automáticamente cada regla de negocio en ADR.
