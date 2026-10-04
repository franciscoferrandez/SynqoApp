---
name: change-verify
description: Verificar con evidencia técnica que un Change cumple su SPEC y el baseline aplicable.
---

# Skill `change-verify`

**Invocación mental:** `pdi:change-verify`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Comprobar evidencia técnica y validar que la implementación cumple la SPEC/baseline aplicable.

## Precondiciones

Implementación terminada o slice candidato a cierre.

## Contexto obligatorio

- SPEC;
- criterios;
- código/tests;
- estrategia de testing;
- módulos afectados.

## Procedimiento

1. Ejecutar tests aplicables.
2. Evaluar criterios de aceptación.
3. Registrar PASS/FAIL/PARTIAL/NOT_TESTED/NOT_APPLICABLE con evidencia.
4. Ejecutar checks de seguridad/performance/migración cuando apliquen.
5. Si falla, volver a apply; si descubre nueva verdad, baseline-update/prepare.

## Prohibido

- declarar PASS sin evidencia;
- cambiar criterio para acomodar resultado.

## Gate / salida

`READY_FOR_CHANGE_CONVERGE`, `BLOCKED` o `FAIL`.

## Siguientes acciones permitidas

`pdi:change-converge`, `pdi:change-apply`, `pdi:baseline-update`.
