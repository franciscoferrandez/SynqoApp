---
name: change-converge
description: Detectar y resolver discrepancias entre baseline, SPEC, código, tests y delivery de un Change.
---

# Skill `change-converge`

**Invocación mental:** `pdi:change-converge`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Detectar y resolver discrepancias entre baseline, SPEC, código, tests y delivery esperado.

## Precondiciones

Verificación/validación suficiente para comparar.

## Contexto obligatorio

- baseline;
- SPEC;
- código;
- tests/evidencia;
- ADR;
- impacto esperado.

## Procedimiento

1. Comparar intención y realidad.
2. Detectar baseline drift.
3. Clasificar A código / B SPEC / C nueva información / D arquitectura / E baseline incorrecto / F fuera scope.
4. Resolver, no maquillar.
5. Si hay nueva verdad legítima, `pdi:baseline-update`.
6. Repetir verify si la resolución cambia implementación.
7. Declarar convergencia solo sin drift significativo abierto.

## Prohibido

- actualizar docs automáticamente para coincidir con código;
- ignorar tests de comportamiento antiguo.

## Gate / salida

`READY_FOR_CHANGE_CLOSE` o `BLOCKED`.

## Siguientes acciones permitidas

`pdi:change-close`, `pdi:change-prepare`, `pdi:baseline-update`, `pdi:change-verify`.
