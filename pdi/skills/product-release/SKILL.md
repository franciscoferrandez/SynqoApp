---
name: product-release
description: Definir una entrega REL a partir de capacidades del Product Baseline.
---

# Skill `product-release`

**Invocación mental:** `pdi:product-release`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Definir una entrega REL a partir de capacidades del Product Baseline.

## Precondiciones

Existe suficiente definición de producto para expresar el objetivo de entrega.

## Contexto obligatorio

- producto;
- HU/RF relevantes;
- dependencias conocidas;
- entregas existentes.

## Procedimiento

1. Definir objetivo mínimo de la entrega.
2. Seleccionar capacidades mediante enlaces `[ID — denominación canónica](ruta/relativa.md)` a sus artefactos.
3. Declarar dependencias.
4. Crear `REL-NNN`.
5. Inicializar estado delivery sin modificar estado documental de RF/HU.
6. Definir criterio de entregable.

## Prohibido

- redefinir requisitos dentro de REL;
- marcar implementado sin evidencia.

## Gate / salida

`DONE` con REL creada/actualizada.

## Siguientes acciones permitidas

`pdi:product-status`, `pdi:product-next`.
