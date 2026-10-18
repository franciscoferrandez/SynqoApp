---
id: RF-EVT-004
estado: en_revision
---

# RF-EVT-004 — Mostrar eventos en el calendario

## Requisito

El sistema debe señalar los días con eventos mediante una campanita en la esquina superior derecha de la casilla del calendario y permitir consultar la información de esos eventos en el detalle del día.

## Origen

- Decisión expresa de la persona que impulsa Synqo sobre la visualización en calendario.
- [HU-EVT-002 — Consultar los eventos del equipo](../../../01_producto/07_historias-usuario/hu-evt-002-consultar-eventos.md)

## Precondiciones

La persona tiene acceso al equipo vigente y consulta su calendario.

## Criterios de aceptación

- Un día con eventos no rechazados se señala con una campanita en la esquina superior derecha de su casilla.
- Si hay más de un evento no rechazado ese día, la campanita muestra su número.
- La campanita y el detalle del día incluyen eventos provisionales con fecha y eventos definitivos de ese día.
- El detalle del día presenta información de los eventos incluidos para ese día.
- Los eventos rechazados no se incluyen en el contador de la campanita.
- Los eventos rechazados con fecha tampoco aparecen en el detalle del día; se consultan en la pestaña de eventos.

## Casos límite

La presentación visual de varios eventos en un mismo día se concretará en la experiencia de usuario de la entrega.

## Relaciones

- [RF-EVT-002 — Listar y consultar eventos](rf-evt-002-listar-consultar-eventos.md)
- [RD-EVT-001 — Datos del evento](../../03_datos/EVT/rd-evt-001-datos-evento.md)
