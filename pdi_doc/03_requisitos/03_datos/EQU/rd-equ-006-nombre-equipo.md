---
id: RD-EQU-006
estado: en_revision
---

# RD-EQU-006 — Nombre del equipo

## Dato / información

Nombre indicado al crear un equipo.

## Significado

Denomina el espacio compartido para quienes acceden a él. Su identificación única se establece mediante [RD-EQU-007 — Identificador del equipo](rd-equ-007-identificador-equipo.md).

## Integridad

Es obligatorio al crear el equipo y admite hasta 50 caracteres en la primera entrega. Distintos equipos pueden tener el mismo nombre.

## Retención / ciclo de vida

Queda inaccesible al caducar y se elimina con el equipo según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

Visible para quienes tienen acceso al equipo.

## Origen

Decisión expresa de quien impulsa Synqo sobre el nombre obligatorio y su longitud.

## Relaciones

- [RF-EQU-001 — Crear un equipo sin registro](../../01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RD-EQU-007 — Identificador del equipo](rd-equ-007-identificador-equipo.md)
