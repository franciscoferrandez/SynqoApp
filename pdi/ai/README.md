# IA — Notas de integración

La fuente de las skills PDI vive en `pdi/skills/`. El plugin las carga sin copiarlas al proyecto. Los archivos `SKILL.md` son contratos operativos portables que cada agente puede exponer como comandos.

Esta carpeta conserva las notas de integración, como `OPEN_SPEC.md`.

## Skills PDI

```text
pdi:init
pdi:product-continue
pdi:baseline-status
pdi:baseline-update
pdi:baseline-check
pdi:product-release
pdi:product-status
pdi:product-next
pdi:module-define
pdi:change-new
pdi:change-prepare
pdi:change-apply
pdi:change-verify
pdi:change-converge
pdi:change-close
pdi:architecture-decision
pdi:brownfield-audit
```

## Regla

Una skill no puede rebajar silenciosamente el gate de otra.
