---
name: change-new
description: Iniciar un Change con los artefactos proporcionales a su alcance y riesgo.
---

# Skill `change-new`

**Invocación mental:** `pdi:change-new`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Iniciar un cambio con la burocracia mínima proporcional a su riesgo.

## Precondiciones

Existe al menos baseline suficiente para comprender la necesidad; si no, derivar a `pdi:product-continue`.

## Contexto obligatorio

- necesidad;
- baseline relevante;
- REL objetivo si existe.

## Procedimiento

1. Expresar objetivo.
2. Clasificar N0/N1/N2/N3.
3. Determinar si es realización, evolución o discovery.
4. N0: no crear SPEC salvo necesidad.
5. N1/N2: crear un único archivo SPEC por defecto.
6. N3: crear carpeta y artefactos separados cuando ayude.
7. Registrar scope/fuera de scope, baseline relacionado y módulos candidatos.
8. Estado inicial = PREPARACION.

## Prohibido

- diseñar/implementar en la misma operación;
- crear muchos archivos por rutina.

## Gate / salida

`READY_FOR_CHANGE_PREPARE`, `NO_CHANGE` o `BLOCKED`.

## Siguientes acciones permitidas

`pdi:change-prepare`.
