---
id: RD-CON-005
estado: en_revision
---

# RD-CON-005 — Texto de opción de una consulta

## Dato / información

Texto escrito para cada opción de una consulta que no es de fechas.

## Significado

Identifica la respuesta que se puede votar y, si corresponde, aceptar al resolver la consulta.

## Integridad

Cada opción de texto tiene contenido no vacío y admite hasta 50 caracteres en la primera entrega. Dentro de una misma consulta, los textos cumplen [RN-CON-006 — Texto único entre opciones de una consulta](../../02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md).

## Retención / ciclo de vida

El texto pertenece a la consulta y queda inaccesible y se elimina con el equipo según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

Visible para quienes tienen acceso al equipo.

## Origen

Decisión expresa de quien impulsa Synqo sobre la longitud de las opciones de texto.

## Relaciones

- [RF-CON-005 — Crear una consulta con opciones de texto](../../01_funcionales/CON/rf-con-005-crear-consulta-texto.md)
