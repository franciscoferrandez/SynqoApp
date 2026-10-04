---
name: product-status
description: Consultar el estado de una entrega REL y sus capacidades pendientes o bloqueadas.
---

# Skill `product-status`

**Invocación mental:** `pdi:product-status`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Mostrar estado de una entrega: definido, pendiente, en Change, validado y bloqueado.

## Precondiciones

Existe al menos una REL; si no, indicar `pdi:product-release`.

## Contexto obligatorio

- REL;
- SPEC activas/archivadas relacionadas;
- trazabilidad/evidencia disponible.

## Procedimiento

1. Ejecutar `python3 <PDI_ROOT>/scripts/artifact_index.py --id <REL-ID>` desde el proyecto para localizar las filas explícitas de delivery y sus enlaces; leer la REL y las SPEC relacionadas para interpretar alcance y evidencia.
2. Resumir estados delivery.
3. Listar pendientes y bloqueos.
4. No inferir implementación solo por existencia de código sin trazabilidad suficiente.

## Prohibido

- alterar estados;
- confundir “aprobado” documental con “implementado”.

## Gate / salida

`DONE` con catálogo de pendientes.

## Siguientes acciones permitidas

`pdi:product-next`, `pdi:change-new`, `pdi:change-verify`.
