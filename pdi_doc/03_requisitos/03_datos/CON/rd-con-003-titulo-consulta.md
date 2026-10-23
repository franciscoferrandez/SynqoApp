---
id: RD-CON-003
estado: en_revision
---

# RD-CON-003 — Título de la consulta

## Dato / información

Título breve escrito al crear una consulta de fechas o una consulta con opciones de texto, editable en las condiciones de [RF-CON-006 — Editar una consulta con opciones de texto](../../01_funcionales/CON/rf-con-006-editar-consulta-texto.md) y [RF-CON-007 — Editar una consulta de fechas](../../01_funcionales/CON/rf-con-007-editar-consulta-fechas.md), según el tipo de consulta.

## Significado

Identifica la consulta en la lista del equipo y facilita encontrarla entre otras consultas.

## Integridad

Cada consulta de la primera entrega tiene un título no vacío de hasta 250 caracteres; la edición mantiene ese límite. No se ha definido si títulos iguales entre consultas están permitidos.

## Retención / ciclo de vida

El título pertenece a los datos de la consulta y queda inaccesible y se elimina con el equipo según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

Visible para los usuarios con acceso al equipo.

## Origen

Decisión expresa de quien impulsa Synqo sobre la identificación de las consultas en la lista.

## Relaciones

- [RF-CON-001 — Crear una consulta de fechas](../../01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RF-CON-005 — Crear una consulta con opciones de texto](../../01_funcionales/CON/rf-con-005-crear-consulta-texto.md)
- [RF-CON-007 — Editar una consulta de fechas](../../01_funcionales/CON/rf-con-007-editar-consulta-fechas.md)
