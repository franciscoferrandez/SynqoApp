---
name: change-close
description: Cerrar un Change verificado y convergido, archivar su contexto y actualizar delivery.
---

# Skill `change-close`

**Invocación mental:** `pdi:change-close`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Cerrar un Change, archivar contexto temporal y actualizar el estado de delivery.

## Precondiciones

- convergence PASS;
- drift resuelto;
- DoD aplicable.

## Contexto obligatorio

- SPEC;
- REL;
- evidencia;
- trazabilidad;
- cambios normativos ya consolidados.

## Procedimiento

1. Marcar SPEC cerrada.
2. Mover/archivar según política.
3. Si existe `<DOC>/00_gobierno/11_trazabilidad.md`, reparar los enlaces a la SPEC cuando el archivo cambie de ubicación al archivarse; no añadir estados ni evidencia de implementación al índice.
4. Actualizar REL: IMPLEMENTADO/VALIDADO/ENTREGADO según evidencia real.
5. Registrar PR/commits cuando exista.
6. Actualizar baseline solo si aún queda una verdad normativa legítima pendiente, mediante `pdi:baseline-update`; no por rutina.
7. Generar resumen de cierre y siguiente pendiente.

## Prohibido

- marcar ENTREGADO sin evidencia;
- incrementar baseline “por número” si no cambió su contenido;
- mantener SPEC archivada como verdad normativa futura.

## Gate / salida

`DONE`.

## Siguientes acciones permitidas

`pdi:product-status`, `pdi:product-next`, `pdi:change-new`.
