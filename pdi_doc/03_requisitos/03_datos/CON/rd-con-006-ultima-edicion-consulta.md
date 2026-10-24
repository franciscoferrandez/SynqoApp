---
id: RD-CON-006
estado: en_revision
---

# RD-CON-006 — Autoría y momento de última edición de la consulta

## Dato / información

Identidad de participante y momento de la última edición efectiva del título o las opciones de una consulta de texto o de fechas.

## Significado

Permite reconocer en la ficha quién registró la edición más reciente y cuándo. No constituye un historial de versiones.

## Integridad

El participante pertenece al equipo de la consulta. Antes de la primera edición efectiva no existe este dato y no se muestra un bloque vacío. Guardar datos sin cambios no altera la última edición. Votar, resolver o modificar un vínculo con un evento no constituye una edición del título o las opciones y no cambia este dato.

La autoría y el momento de creación permanecen intactos según [RD-CON-004 — Momento de creación de la consulta](rd-con-004-momento-creacion-consulta.md). La edición no se usa como fuente de vigencia. Cambiar fechas puede modificar la clasificación y su vigencia derivada según [RF-CON-008 — Listar consultas por vigencia](../../01_funcionales/CON/rf-con-008-listar-consultas-vigencia.md), sin cambiar la creación. La última edición permanece visible después del cierre de la consulta.

## Retención / ciclo de vida

Acompaña a la consulta y se elimina con el equipo según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md). No se guardan versiones anteriores de este dato.

## Privacidad

Visible en la ficha para quienes tienen acceso al equipo.

## Origen

Respuesta expresa de la persona impulsora del 2026-10-20: mostrar quién hizo la última edición y cuándo, conservando la autoría de creación, siguiendo el patrón de eventos.

Ampliación expresa del 2026-10-21: aplicar las mismas reglas de edición a consultas de fechas.

## Relaciones

- [RF-CON-006 — Editar una consulta con opciones de texto](../../01_funcionales/CON/rf-con-006-editar-consulta-texto.md).
- [RF-CON-007 — Editar una consulta de fechas](../../01_funcionales/CON/rf-con-007-editar-consulta-fechas.md).
