---
name: change-apply
description: Implementar un Change preparado conforme a su SPEC, el baseline y las reglas de sus módulos.
---

# Skill `change-apply`

**Invocación mental:** `pdi:change-apply`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Implementar un Change READY por slices, respetando baseline, SPEC y reglas de cada módulo.

## Precondiciones

- estado READY;
- DoR PASS;
- módulos afectados definidos.

## Contexto obligatorio

- SPEC;
- plan;
- arquitectura y reglas de módulo;
- tests/código del slice.

## Procedimiento

1. Seleccionar siguiente slice.
2. Cargar contexto mínimo.
3. Implementar.
4. Añadir/actualizar tests.
5. Ejecutar checks.
6. Revisar diff y scope.
7. Registrar hallazgos/drift.
8. Commit coherente cuando proceda.
9. Repetir.

## Prohibido

- ampliar scope;
- cambiar baseline directamente;
- introducir dependencia significativa sin decisión;
- saltar STOP ante drift relevante.

## Gate / salida

`READY_FOR_CHANGE_VERIFY`, `BLOCKED` o vuelta a `pdi:change-prepare`.

## Siguientes acciones permitidas

`pdi:change-verify`, `pdi:change-prepare`, `pdi:baseline-update`.
