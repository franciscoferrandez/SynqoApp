---
id: RN-EVT-003
estado: en_revision
---

# RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta

## Regla

Un evento puede estar vinculado como máximo a una consulta de fechas abierta y una consulta de fechas abierta puede estar vinculada como máximo a un evento. Tras cerrar una consulta, el evento puede vincularse a otra abierta y conserva las relaciones con todas las anteriores cerradas. Al crear la consulta o al elegir un vínculo nuevo al resolverla mientras siga abierta, solo se ofrecen eventos sin fecha o con fecha provisional que no estén rechazados ni vinculados a otra consulta de fechas abierta. Un evento rechazado debe recuperarse antes de poder elegirse como vínculo nuevo. Tampoco se ofrece como vínculo nuevo un evento que ya tiene fecha definitiva. Estas restricciones de selección no eliminan la excepción del evento previamente vinculado que se rechaza antes de resolver la consulta: ese caso se trata en la sección Excepciones.

El vínculo puede cambiarse o retirarse antes de resolver. Cambiar solo el vínculo sin modificar campos propios del evento no cambia su dato de última modificación ni su orden basado en él. Al resolver una consulta vinculada a un evento sin fecha o con fecha provisional, solo se puede aceptar una fecha; esa fecha sustituye la provisional si la había y queda definitiva en el evento. La última modificación del evento se atribuye al participante que resolvió la consulta según [RD-EVT-002 — Autoría y momentos del evento](../../03_datos/EVT/rd-evt-002-autoria-momentos-evento.md). Rechazar la consulta no modifica el evento.

Todas las consultas previamente vinculadas siguen visibles desde la ficha del evento después de resolverse o rechazarse. Las fichas del evento y de cada consulta vinculada permiten navegar en ambos sentidos.

## Justificación

El resultado de la consulta debe poder asignar una fecha inequívoca al evento sin perder la posibilidad de corregir el vínculo antes de resolver.

## Excepciones

Si el evento previamente vinculado pasa a tener fecha definitiva antes de confirmar la resolución, se avisa antes de confirmarla de que esa fecha no se puede cambiar mediante la consulta. El vínculo se conserva, la consulta puede quedar resuelta y la persona podrá modificar la fecha desde la ficha del evento si lo desea. Si, de forma excepcional, el evento continúa vinculado aunque ya esté rechazado al resolver, se ofrecerá desvincularlo y resolver aceptando la fecha o rechazar también la consulta. Cancelar ese aviso deja ambos sin cambios.

## Origen

Petición y aclaraciones expresas de la persona que impulsa Synqo durante la definición de la nueva entrega de eventos. La exclusión de eventos rechazados como vínculos nuevos se aprobó expresamente durante la preparación de SPEC-EVT-003: primero hay que recuperar el evento.

## Relaciones

- [RF-CON-004 — Resolver una consulta](../../01_funcionales/CON/rf-con-004-resolver-consulta.md)
- [RF-CON-001 — Crear una consulta de fechas](../../01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RF-EVT-001 — Crear y editar un evento](../../01_funcionales/EVT/rf-evt-001-crear-editar-evento.md)
