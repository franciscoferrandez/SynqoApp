---
name: product-continue
description: Continuar la definición del Product Baseline desde su estado actual respetando los gates.
---

# Skill `product-continue`

**Invocación mental:** `pdi:product-continue`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Conducir la definición del Product Baseline desde el punto actual sin saltar fases bloqueantes.

## Precondiciones

- Existe la estructura inicial.
- Puede ejecutarse desde `inicio`.

## Contexto obligatorio

- estado documental;
- README de la fase actual;
- catálogo de áreas, si existe;
- artefactos ya definidos de fases anteriores.

## Procedimiento

1. Leer `02_estado-documentacion.md`.
2. Determinar la primera fase requerida no satisfecha para el perfil de baseline.
3. Leer su README.
4. Inventariar `DEFINIDO / PROPUESTO / NO_RESUELTO / CONFLICTO`.
5. Contrastar las capacidades definidas con el catálogo de áreas. Si aparece una responsabilidad con reglas o ciclo de vida propios, revisar su encaje antes de asignarle IDs; aplicar el criterio de las convenciones documentales sin crear áreas para propuestas aún no definidas.
6. Hacer preguntas concretas; presentar alternativas cuando ayude.
7. Crear artefactos solo cuando exista conocimiento real, usando `pdi:baseline-update` cuando tengan identidad normativa.
8. Evaluar gate de fase. Si una decisión lo bloquea, dejar antes de terminar el detalle de pregunta, impacto, opciones y gate en el artefacto afectado conforme al contrato común; el estado documental solo resume y enlaza ese bloqueo.
9. Actualizar estado documental y ejecutar `python3 <PDI_ROOT>/scripts/validate_structure.py`; corregir las referencias detectadas antes de terminar.
10. Informar de la siguiente fase; no ejecutarla si requiere gate humano no satisfecho.

## Prohibido

- asumir decisiones;
- crear tecnología/arquitectura prematura;
- marcar una fase completada por tener un archivo vacío.

## Gate / salida

`READY_FOR_PRODUCT_CONTINUE`, `READY_FOR_BASELINE_CHECK` o `BLOCKED`.

## Siguientes acciones permitidas

`pdi:product-continue`, `pdi:baseline-update`, `pdi:baseline-check`.
