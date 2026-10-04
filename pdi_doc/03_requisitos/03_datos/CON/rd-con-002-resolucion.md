---
id: RD-CON-002
estado: en_revision
---

# RD-CON-002 — Resultado de la resolución

## Dato / información

Resultado registrado al resolver una consulta y la identidad de participante bajo la que actuó el usuario.

## Significado

El resultado expresa una o varias opciones propuestas aceptadas o el rechazo de la consulta.

## Integridad

Las opciones aceptadas pertenecen a la consulta resuelta. El resultado se atribuye a una identidad de participante de su equipo.

## Retención / ciclo de vida

En esta fase, la consulta resuelta no se reabre. Al caducar el equipo, el resultado queda inaccesible y se elimina con los demás datos del equipo según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

Los usuarios con acceso al equipo pueden conocer el resultado y la identidad de participante que lo registró. No se ha definido visibilidad fuera del equipo.

## Origen

- [INV-CON-002 — Resolución de la consulta](../../../02_dominio/05_invariantes/inv-con-002-resolucion-consulta.md)
