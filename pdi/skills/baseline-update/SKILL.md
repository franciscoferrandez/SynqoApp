---
name: baseline-update
description: Crear o modificar verdad normativa del Product Baseline siguiendo el Playbook documental.
---

# Skill `baseline-update`

**Invocación mental:** `pdi:baseline-update`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Crear o modificar una verdad normativa usando exactamente las reglas del Playbook documental.

## Precondiciones

Debe existir una verdad candidata suficientemente identificable; si no, primero discovery/preguntas.

## Contexto obligatorio

- convención documental;
- catálogo de áreas, si existe;
- README de categoría;
- artefactos equivalentes/relacionados;
- origen de la nueva verdad.

## Procedimiento

1. Clasificar el artefacto: producto, dominio, RF, RN, RD, RNF, RES, UX, ADR, arquitectura, etc.
2. Antes de asignar un ID, comprobar que el artefacto encaja en el alcance del área vigente según el catálogo y las convenciones. Si aparece una responsabilidad distinta, justificar el área nueva o el uso de una transversal y actualizar el catálogo en esta operación.
3. Buscar equivalencias, duplicados y conflictos.
4. Hacer solo las preguntas necesarias.
   Si falta una decisión que impide crear el artefacto normativo, registrar una PA con las opciones conocidas y el artefacto/gate bloqueado antes de devolver `BLOCKED`; si el artefacto ya existe, registrar allí el bloqueo sin convertir ninguna opción en verdad.
5. Si requiere decisión arquitectónica significativa, derivar a `architecture-decision`.
6. Crear/modificar/sustituir/obsoletar usando plantilla canónica.
7. Enlazar cada referencia a un artefacto existente con `[ID — denominación canónica](ruta/relativa.md)` al archivo de ese ID.
8. Si existe `<DOC>/00_gobierno/11_trazabilidad.md`, ajustar únicamente los enlaces y relaciones afectados por la nueva verdad. Mantenerlo como índice de enlaces a artefactos y SPEC, sin descripciones ni estados de delivery; no crearlo por esta operación. Para correcciones de área con cambio de IDs, registrar la equivalencia histórica y actualizar referencias y enlaces según el Playbook.
9. Ejecutar `python3 <PDI_ROOT>/scripts/validate_structure.py` y `pdi:baseline-check` focal o equivalente; corregir las referencias señaladas antes de terminar.
10. Devolver exactamente qué verdad cambió.

## Prohibido

- implementar código;
- usar una SPEC como segunda fuente normativa;
- convertir assumption en fact;
- reescribir semántica histórica sin sustitución.

## Gate / salida

`DONE`, `NO_CHANGE` o `BLOCKED`. La salida enumera artefactos normativos creados/modificados.

## Siguientes acciones permitidas

Volver a la skill que la invocó, `pdi:baseline-status` o `pdi:baseline-check`.
