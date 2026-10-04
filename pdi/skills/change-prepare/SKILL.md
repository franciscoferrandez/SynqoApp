---
name: change-prepare
description: Preparar un Change hasta READY mediante preguntas, investigación, diseño y plan.
---

# Skill `change-prepare`

**Invocación mental:** `pdi:change-prepare`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Conseguir que un Change llegue a READY separando preguntas, research, design, structure y plan.

## Precondiciones

Change N1+ creado o necesidad N0 escalada.

## Contexto obligatorio

- SPEC;
- baseline relevante;
- READMEs de módulos/categorías;
- código solo cuando sea necesario para Research/Structure.

## Procedimiento

1. Questions: clasificar incertidumbres. Registrar en la SPEC cada decisión bloqueante con pregunta, motivo, opciones conocidas y gate afectado; mantenerla pendiente hasta obtener aprobación expresa.
2. Research: resolver investigables sin implementar.
3. Si aparece nueva verdad normativa, invocar `pdi:baseline-update` y reanudar.
4. Si aparece decisión arquitectónica, invocar `architecture-decision`.
5. Design: decidir solución.
6. Structure: identificar unidades/módulos afectados.
7. Plan: dividir en slices.
8. Comprobar módulos y reglas específicas.
9. Ejecutar DoR. Si falla por una decisión, comprobar que el bloqueo concreto figura en la SPEC antes de devolver `BLOCKED`.
10. Marcar READY solo si el gate pasa.
11. En la misma ejecución en que una SPEC pasa a READY, preguntar expresamente si se quiere crear o actualizar `<DOC>/00_gobierno/11_trazabilidad.md`; no posponer la pregunta a una consulta posterior. Si ya hay autorización expresa vigente para mantener este índice, actualizarlo en esa ejecución sin volver a preguntar. Es un índice opcional y no normativo: la respuesta no condiciona el DoR ni se interpreta el silencio como aprobación. Si se acepta, usar `<PDI_ROOT>/templates/gobierno/trazabilidad.md` cuando aún no exista y registrar una fila por cada relación directa entre la SPEC y un artefacto existente que esta referencia. Las celdas contienen solo enlaces `[ID — denominación canónica](ruta/relativa.md)`; no añadir descripciones, estados de delivery ni inferir relaciones ausentes. Si se rechaza, no crear ni modificar el índice.

## Prohibido

- modificar código productivo;
- usar Research para justificar solución preelegida;
- dejar preguntas bloqueantes abiertas y marcar READY.

## Gate / salida

`READY_FOR_CHANGE_APPLY` o `BLOCKED`.

## Siguientes acciones permitidas

`pdi:change-apply`, `pdi:baseline-update`, `architecture-decision`.
