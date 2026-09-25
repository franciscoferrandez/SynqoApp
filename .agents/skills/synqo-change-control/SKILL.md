---
name: synqo-change-control
description: Gestiona cambios que afectan la Design Baseline de Synqo antes de cualquier implementación.
---

# Synqo Change Control

1. Identifica los documentos y decisiones afectados.
2. Crea una CR desde [`synqo-documentation-v0.2/changes/CHANGE-REQUEST-TEMPLATE.md`](../../../synqo-documentation-v0.2/changes/CHANGE-REQUEST-TEMPLATE.md).
3. Documenta estado actual, propuesta, motivo, alternativas e impacto en producto, RF/HU, UX, dominio, API, datos, seguridad, tests y documentación.
4. Mantén la CR `Proposed` y no implementes mientras falte decisión humana.
5. Si se acepta, marca `Accepted`, actualiza documentos fuente, trazabilidad, baseline, registro de SPEC y ADR si es una decisión arquitectónica significativa.
6. Antes de implementar, comprueba la rama autorizada; usa `change/CR-XXX-short-slug` como convención si el propietario confirma crearla.
7. Crea/actualiza la SPEC y registra CR y decisión en la evidencia TFM; actualiza metodología si altera baseline.

No abras un ADR para una decisión local o puramente funcional. Explicita cuándo la elección necesita al propietario del producto o una decisión arquitectónica.
