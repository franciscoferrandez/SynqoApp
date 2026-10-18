---
id: RF-EVT-003
estado: en_revision
---

# RF-EVT-003 — Rechazar y recuperar un evento

## Requisito

El sistema debe permitir que cualquier persona con acceso al equipo rechace un evento y recupere uno rechazado, conservando sus datos.

## Origen

- Petición expresa y aclaración posterior de la persona que impulsa Synqo.
- [HU-EVT-001 — Gestionar los eventos del equipo](../../../01_producto/07_historias-usuario/hu-evt-001-gestionar-eventos.md)

## Precondiciones

La persona tiene acceso al equipo vigente.

## Criterios de aceptación

- Un evento rechazado pasa a la agrupación de rechazados y conserva título, notas y fecha informada.
- El evento rechazado puede recuperarse.
- Al recuperarlo conserva la fecha que tuviera y vuelve a provisional.
- Mientras está rechazado, no puede editarse; hay que recuperarlo primero.
- Un evento provisional o definitivo puede rechazarse.
- Si tiene una consulta de fechas abierta vinculada, un único diálogo ofrece inmediatamente rechazar solo el evento y desvincular la consulta, o rechazar tanto el evento como la consulta.
- Si se cancela la confirmación del rechazo de un evento con consulta vinculada, ni el evento ni la consulta cambian.
- La campanita del calendario no cuenta los eventos rechazados.
- Un evento no dispone de borrado individual; para retirarlo de las agrupaciones activas se rechaza y, si se desea, se recupera después.

## Casos límite

Al cancelar el diálogo, no se guarda ninguna de las dos acciones. Los detalles visuales del diálogo se concretarán en la experiencia de usuario de la entrega.

## Relaciones

- [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md)
- [RF-EVT-004 — Mostrar eventos en el calendario](rf-evt-004-mostrar-eventos-calendario.md)
