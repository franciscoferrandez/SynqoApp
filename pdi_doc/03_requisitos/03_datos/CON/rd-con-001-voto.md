---
id: RD-CON-001
estado: en_revision
---

# RD-CON-001 — Voto atribuido a participante

## Dato / información

Selección de una o varias opciones de una consulta, atribuida a una identidad de participante del equipo.

## Significado

Es la respuesta registrada de un participante a una consulta; no equivale a su disponibilidad general.

## Integridad

Las opciones seleccionadas pertenecen a la misma consulta y la identidad de participante pertenece a su equipo. Los recuentos por opción corresponden a los votos vigentes de participantes que la seleccionan.

## Retención / ciclo de vida

La selección vigente puede cambiar o retirarse por completo mientras la consulta está abierta. Tras retirarla, el participante queda sin voto vigente en esa consulta. No se ha definido el historial de cambios. Al caducar el equipo, el voto queda inaccesible y se elimina con los demás datos del equipo según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

El voto y la identidad de participante a la que se atribuye son visibles para los usuarios con acceso al equipo.

## Origen

- [INV-CON-001 — Voto atribuido a participante del equipo](../../../02_dominio/05_invariantes/inv-con-001-voto-atribuido.md)
