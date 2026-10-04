---
name: baseline-status
description: Consultar la verdad normativa disponible y su madurez sin modificar archivos.
---

# Skill `baseline-status`

**Invocación mental:** `pdi:baseline-status`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Resumir qué verdad normativa existe y la madurez de la definición, sin modificar nada.

## Precondiciones

Ninguna.

## Contexto obligatorio

- estado documental;
- índices/artefactos normativos;
- REL si existen.

## Procedimiento

1. Ejecutar `python3 <PDI_ROOT>/scripts/artifact_index.py --summary` desde el proyecto para localizar artefactos y estados; usar `--id <ID>` si hacen falta sus enlaces explícitos. El índice se genera en memoria; consultar los documentos originales para interpretar madurez, bloqueos y relaciones semánticas. Leer también el catálogo de áreas y el estado documental, que no se sustituyen por el índice.
2. Resumir áreas definidas.
3. Listar preguntas/conflictos bloqueantes.
4. Indicar perfil de readiness actual.
5. Separar claramente definición de delivery.
6. Si hay REL, resumir cobertura sin inferir de código salvo trazabilidad disponible.

## Prohibido

- modificar documentos;
- inventar porcentajes sin base.

## Gate / salida

`DONE` con estado legible y siguientes acciones sugeridas.

## Siguientes acciones permitidas

`pdi:product-continue`, `pdi:baseline-check`, `pdi:product-status`.
