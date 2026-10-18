---
id: RF-EVT-002
estado: en_revision
---

# RF-EVT-002 — Listar y consultar eventos

## Requisito

El sistema debe ofrecer una pestaña propia para consultar los eventos del equipo y separarlos entre eventos sin fecha definitiva, eventos con fecha definitiva futura, eventos con fecha definitiva pasada y eventos rechazados.

## Origen

- Petición expresa de la persona que impulsa Synqo para la nueva entrega de eventos.
- [HU-EVT-002 — Consultar los eventos del equipo](../../../01_producto/07_historias-usuario/hu-evt-002-consultar-eventos.md)

## Precondiciones

La persona tiene acceso al equipo vigente.

## Criterios de aceptación

- La pestaña permite entrar en la ficha de un evento y ver sus datos.
- La ficha muestra el participante y el momento de creación, así como el participante y el momento de la última modificación.
- Antes del primer cambio real del evento, la ficha no muestra datos de «última modificación».
- La ficha permite navegar a todas las consultas de fechas que hayan quedado vinculadas al evento, incluidas las resueltas y rechazadas; desde cada ficha de consulta se puede volver al evento.
- Los eventos sin fecha definitiva, incluidos los provisionales con fecha, se separan de los que tienen fecha definitiva.
- Los eventos con fecha definitiva se agrupan en futuros y pasados.
- Un evento provisional permanece entre los eventos sin fecha definitiva aunque su fecha informada ya sea pasada.
- La separación entre fecha definitiva futura y pasada toma el día actual en la zona horaria del equipo.
- Un evento definitivo fechado hoy en esa zona figura en «Futuros».
- Los eventos definitivos futuros se ordenan por fecha ascendente y los pasados por fecha descendente.
- Si varios definitivos tienen la misma fecha, se muestran primero los modificados más recientemente.
- Los eventos sin fecha definitiva y los rechazados se ordenan por el momento de la última modificación, desde el más reciente; para los que nunca se han modificado se usa su momento de creación.
- Los eventos rechazados tienen una agrupación propia.

## Casos límite

El cambio de un vínculo sin modificar los campos propios del evento no altera su momento de última modificación ni su posición por ese criterio.

## Relaciones

- [RD-EVT-001 — Datos del evento](../../03_datos/EVT/rd-evt-001-datos-evento.md)
- [RD-EVT-002 — Autoría y momentos del evento](../../03_datos/EVT/rd-evt-002-autoria-momentos-evento.md)
