---
id: RN-EVT-002
estado: en_revision
---

# RN-EVT-002 — Conservación y recuperación de eventos rechazados

## Regla

Un evento provisional o definitivo puede rechazarse. El rechazo no borra sus datos. Un evento rechazado puede recuperarse: conserva la fecha que tuviera y vuelve siempre a provisional. Mientras está rechazado se clasifica en Archivados según [RF-EVT-002 — Listar y consultar eventos](../../01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md), no se puede editar y no aparece en la campanita ni en el detalle del día del calendario. Archivados también contiene definitivos vencidos y no sustituye el estado real del evento.

No se ofrece borrado individual de eventos; rechazo y recuperación son las acciones disponibles para retirarlo del uso activo y volver a incorporarlo.

## Justificación

El equipo puede descartar un plan sin perder su información y volver a considerarlo después.

## Excepciones

Si existe una consulta de fechas abierta vinculada, un único diálogo presenta inmediatamente dos acciones: rechazar el evento y desvincular la consulta, o rechazar ambos. Cancelar ese diálogo deja el evento y la consulta sin cambios.

## Origen

Decisiones expresas de la persona que impulsa Synqo sobre rechazo reversible, conservación de datos y contador del calendario.

## Relaciones

- [RF-EVT-003 — Rechazar y recuperar un evento](../../01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md)
