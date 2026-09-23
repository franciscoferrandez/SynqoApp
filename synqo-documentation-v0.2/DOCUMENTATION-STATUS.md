# Documentation status

## Consolidado

La documentación existente en `product/`, `architecture/`, `traceability/` y `PRD.md` corresponde a la definición funcional y arquitectónica consolidada de las fases 1–13.

## Pendiente guiado

Las carpetas `planning/`, `design/`, `technical-design/`, `security/`, `quality/`, `ai/` y `delivery/` contienen work packages numerados. Cada uno incluye un prompt detallado que debe ejecutarse desde la raíz del repositorio y que genera los documentos indicados en `WORKPLAN.md`.

## Regla de estado

- Un work package con solo `NN-PROMPT-*.md` está **pendiente**.
- Cuando se generen sus entregables y se revisen, marca su checkbox en `WORKPLAN.md`.
- No borres el prompt completado: funciona como trazabilidad de cómo se diseñó el artefacto.
