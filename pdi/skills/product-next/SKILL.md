---
name: product-next
description: Identificar candidatos para el siguiente Change según release, dependencias y bloqueos.
---

# Skill `product-next`

**Invocación mental:** `pdi:product-next`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Presentar candidatos pendientes para el siguiente Change según release, dependencias y bloqueos.

## Precondiciones

Existe REL con elementos pendientes.

## Contexto obligatorio

- REL;
- dependencias;
- preguntas abiertas;
- baseline readiness de candidatos.

## Procedimiento

1. Ejecutar `python3 <PDI_ROOT>/scripts/artifact_index.py --id <REL-ID>` desde el proyecto para localizar estados de delivery y dependencias explícitas; contrastarlos con la REL, las preguntas abiertas y el baseline antes de filtrar elementos ya entregados o bloqueados.
2. Identificar dependencias satisfechas.
3. Señalar candidatos y razones.
4. No decidir por el usuario cuando existen alternativas funcionalmente distintas.
5. Indicar qué candidato requiere más definición antes de Change.

## Prohibido

- inventar prioridad de negocio;
- ocultar bloqueos.

## Gate / salida

`DONE` con candidatos, no con una decisión irreversible.

## Siguientes acciones permitidas

`pdi:change-new`, `pdi:product-continue`, `pdi:baseline-update`.
