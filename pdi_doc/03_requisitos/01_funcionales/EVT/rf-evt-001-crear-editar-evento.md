---
id: RF-EVT-001
estado: en_revision
---

# RF-EVT-001 — Crear y editar un evento

## Requisito

El sistema debe permitir que cualquier persona con acceso al equipo cree un evento con título y notas opcionales, con o sin fecha, y edite título, notas, fecha y estado desde su ficha, incluso si la fecha ya es definitiva.

## Origen

- Petición expresa de la persona que impulsa Synqo para la nueva entrega de eventos.
- [HU-EVT-001 — Gestionar los eventos del equipo](../../../01_producto/07_historias-usuario/hu-evt-001-gestionar-eventos.md)

## Precondiciones

La persona tiene acceso al equipo vigente.

## Criterios de aceptación

- Un evento creado pertenece al equipo y su ficha presenta título, notas, fecha si está informada y estado.
- El título admite hasta 250 caracteres; las notas son texto plano opcional de hasta 5000 caracteres.
- La fecha puede quedar sin asignar al crear el evento.
- Si se informa una fecha al crearlo, esta queda provisional de forma predeterminada.
- Puede asignarse una fecha pasada al crear el evento o al editar su ficha.
- Desde la ficha pueden modificarse título, notas, fecha y estado, incluida una fecha definitiva.
- Para editar un evento rechazado primero hay que recuperarlo.
- Cualquier persona con acceso al equipo puede realizar esas acciones.

## Casos límite

Un evento sin fecha siempre es provisional según [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md). Solo se conserva el valor actual de sus campos, sin historial de versiones. Si una consulta asigna la fecha, la última modificación se atribuye al participante que la resolvió según [RD-EVT-002 — Autoría y momentos del evento](../../03_datos/EVT/rd-evt-002-autoria-momentos-evento.md).

## Relaciones

- [RD-EVT-001 — Datos del evento](../../03_datos/EVT/rd-evt-001-datos-evento.md)
- [RD-EVT-002 — Autoría y momentos del evento](../../03_datos/EVT/rd-evt-002-autoria-momentos-evento.md)
- [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md)
