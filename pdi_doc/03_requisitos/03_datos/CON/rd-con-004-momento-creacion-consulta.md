---
id: RD-CON-004
estado: en_revision
---

# RD-CON-004 — Momento de creación de la consulta

## Dato / información

Momento en que se crea una consulta del equipo.

## Significado

Permite ordenar las consultas de cada estado desde la más reciente a la más antigua según su creación.

## Integridad

Cada consulta conserva su momento de creación. Los votos y la resolución posteriores no lo modifican ni alteran ese criterio de orden.

## Retención / ciclo de vida

El dato pertenece a la consulta; queda inaccesible al caducar el equipo y se elimina con él según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

Se utiliza para ordenar la lista visible a los usuarios con acceso al equipo. No se ha definido mostrar el momento exacto en pantalla.

## Origen

Decisión expresa de quien impulsa Synqo sobre el orden de las consultas dentro de cada estado.

## Relaciones

- [WF-CON-001 — Lista de consultas del equipo](../../../04_experiencia-usuario/03_wireframes/wf-con-001-lista-consultas.md)
