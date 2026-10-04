---
id: RD-EQU-007
estado: en_revision
---

# RD-EQU-007 — Identificador del equipo

## Dato / información

UUID único generado al crear cada equipo.

## Significado

Identifica al equipo con independencia de su nombre, que puede coincidir con el de otros equipos.

## Integridad

Cada equipo tiene un UUID propio. El enlace de acceso generado para el equipo también debe identificarlo de forma única; no se ha definido que el UUID figure en la dirección del enlace ni una versión concreta de UUID.

## Retención / ciclo de vida

El identificador acompaña al equipo hasta su eliminación según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

No se ha definido si el UUID se muestra a los usuarios; el enlace de acceso sí puede compartirse.

## Origen

Decisión expresa de quien impulsa Synqo sobre nombres repetibles, UUID generado y enlace de acceso único.

## Relaciones

- [RF-EQU-001 — Crear un equipo sin registro](../../01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../../01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
