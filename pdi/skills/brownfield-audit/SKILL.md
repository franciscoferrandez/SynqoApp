---
name: brownfield-audit
description: Auditar un proyecto existente para reconstruir una baseline confiable antes de evolucionarlo.
---

# Skill `brownfield-audit`

**Invocación mental:** `pdi:brownfield-audit`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Reconstruir una baseline confiable de un proyecto existente antes de evolucionarlo.

## Precondiciones

Proyecto con código/artefactos preexistentes.

## Contexto obligatorio

- docs;
- código;
- tests;
- contratos;
- infraestructura disponible;
- historial relevante.

## Procedimiento

1. Inventario.
2. Clasificar fuentes por autoridad/confianza.
3. Comparar documentación y código.
4. Registrar conflictos y unknowns.
5. Priorizar huecos necesarios para la próxima evolución.
6. Usar `pdi:baseline-update` para consolidar verdad validada.
7. Evaluar readiness.

## Prohibido

- documentar retrospectivamente todo sin necesidad;
- asumir código=intención.

## Gate / salida

`READY_FOR_PRODUCT_CONTINUE`, `READY` o `BLOCKED`.

## Siguientes acciones permitidas

`pdi:product-continue`, `pdi:baseline-update`, `pdi:change-new`.
