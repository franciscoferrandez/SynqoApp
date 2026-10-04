---
name: baseline-check
description: Validar la coherencia documental o la preparación del Product Baseline para un incremento.
---

# Skill `baseline-check`

**Invocación mental:** `pdi:baseline-check`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Validar coherencia documental y, cuando se solicite, Baseline Readiness para el siguiente incremento.

## Precondiciones

Existe baseline parcial o completo.

## Contexto obligatorio

- convenciones;
- estado documental;
- catálogo de áreas, si existe;
- baseline relevante;
- siguiente objetivo/incremento si se evalúa readiness.

## Procedimiento

1. Ejecutar `python3 <PDI_ROOT>/scripts/validate_structure.py` desde el proyecto y buscar IDs duplicados, referencias sin enlace o con destino erróneo, denominaciones inconsistentes y conflictos conocidos. Usar `python3 <PDI_ROOT>/scripts/artifact_index.py` para localizar estados y enlaces explícitos del incremento; no tratar el índice como sustituto de la validación ni de la lectura semántica.
2. Contrastar las responsabilidades de los artefactos con los límites del catálogo; señalar para revisión un área que agrupe capacidades con reglas o ciclo de vida independientes, aunque sus IDs y rutas sean válidos. Esta comprobación requiere juicio semántico: el validador estructural no la sustituye.
3. Comprobar que artefactos requeridos por el siguiente incremento existen.
4. Comprobar preguntas bloqueantes y que sus decisiones, opciones conocidas e impacto estén persistidos en los artefactos afectados o en una PA enlazada cuando aún no exista el artefacto; señalar cualquier ausencia para `pdi:baseline-update` o la skill de preparación correspondiente.
5. Evaluar Baseline Readiness.
6. Distinguir defectos documentales de elementos simplemente no definidos porque aún no hacen falta.

## Prohibido

- exigir definición exhaustiva de todo el producto;
- aprobar omisiones sin motivo.

## Gate / salida

`READY`, `NOT_READY` o `READY_WITH_EXPLICIT_OMISSIONS` con razones.

## Siguientes acciones permitidas

`pdi:product-continue`, `pdi:product-release`, `pdi:change-new`.
