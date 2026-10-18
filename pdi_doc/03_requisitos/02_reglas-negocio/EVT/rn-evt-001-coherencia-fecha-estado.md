---
id: RN-EVT-001
estado: en_revision
---

# RN-EVT-001 — Coherencia entre fecha y estado del evento

## Regla

La fecha de un evento identifica un día completo, sin hora, y puede no estar asignada. Puede informarse una fecha pasada al crear o editar el evento. Un evento sin fecha es siempre provisional. Si se informa una fecha al crear el evento, esta queda provisional por defecto; más adelante puede pasar a definitiva.

## Justificación

La planificación puede empezar antes de decidir el día y una fecha prevista no equivale necesariamente a una fecha definitiva.

## Excepciones

El rechazo conserva los datos del evento y su recuperación lo deja provisional con la misma fecha según [RN-EVT-002 — Conservación y recuperación de eventos rechazados](rn-evt-002-rechazo-recuperacion.md).

## Origen

Petición expresa de la persona que impulsa Synqo: fecha nula siempre provisional y fecha provisional o definitiva cuando esté informada.

## Relaciones

- [RD-EVT-001 — Datos del evento](../../03_datos/EVT/rd-evt-001-datos-evento.md)
- [RF-EVT-001 — Crear y editar un evento](../../01_funcionales/EVT/rf-evt-001-crear-editar-evento.md)
