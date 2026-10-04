---
name: architecture-decision
description: Resolver una decisión arquitectónica significativa con evidencia y un ADR.
---

# Skill `architecture-decision`

**Invocación mental:** `pdi:architecture-decision`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Resolver una decisión arquitectónica significativa mediante evidencia y ADR.

## Precondiciones

Existe Question/driver arquitectónico real.

## Contexto obligatorio

- drivers;
- baseline;
- Research;
- restricciones;
- arquitectura vigente.

## Procedimiento

1. Formular Question neutral.
2. Research.
3. Enumerar opciones reales.
4. Evaluar contra drivers.
5. Obtener aprobación humana cuando el nivel lo exige.
   Si sigue pendiente, registrar pregunta, opciones, evaluación y artefacto/gate bloqueado en el RFC o artefacto afectado; no dejar la deliberación solo en la conversación ni aprobar el ADR.
6. Crear ADR.
7. Invocar `pdi:baseline-update` para reflejar arquitectura/tecnologías resultantes.

## Prohibido

- decidir durante Research;
- crear ADR trivial;
- seleccionar tecnología por moda.

## Gate / salida

`DONE` con ADR y baseline coherente o `BLOCKED`.

## Siguientes acciones permitidas

Volver a `pdi:change-prepare` o `pdi:product-continue`.
