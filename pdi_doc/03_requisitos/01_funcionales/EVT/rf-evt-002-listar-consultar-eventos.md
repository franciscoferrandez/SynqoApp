---
id: RF-EVT-002
estado: en_revision
---

# RF-EVT-002 — Listar y consultar eventos

## Requisito

El sistema debe ofrecer una pestaña propia para consultar los eventos del equipo en dos listas, «Activos» y «Archivados», con una fecha de vigencia calculada para clasificar y ordenar cada evento. Estas agrupaciones son derivadas y no son estados persistidos del evento.

## Origen

- Petición expresa de la persona que impulsa Synqo para la nueva entrega de eventos.
- Decisiones expresas del 24 de octubre de 2026: sustituir las cuatro agrupaciones anteriores por listas de activos y archivados, con vigencia calculada, ventana reciente y carga incremental.
- [HU-EVT-002 — Consultar los eventos del equipo](../../../01_producto/07_historias-usuario/hu-evt-002-consultar-eventos.md)

## Precondiciones

La persona tiene acceso al equipo vigente.

## Criterios de aceptación

- La pestaña permite entrar en la ficha de un evento y ver sus datos.
- La ficha muestra el participante y el momento de creación, así como el participante y el momento de la última modificación.
- Antes del primer cambio real del evento, la ficha no muestra datos de «última modificación».
- La ficha permite navegar a todas las consultas de fechas que hayan quedado vinculadas al evento, incluidas las resueltas y rechazadas; desde cada ficha de consulta se puede volver al evento.
- La clasificación y la vigencia se calculan con la siguiente matriz, sin almacenar nuevos campos de agrupación ni de vigencia:

| Estado y fecha del evento | Lista | Fecha de vigencia |
|---|---|---|
| Provisional sin fecha | Activos | Momento de creación |
| Provisional con fecha, incluso pasada | Activos | Fecha del evento |
| Definitivo con fecha de hoy o futura | Activos | Fecha del evento |
| Definitivo con fecha pasada | Archivados | Fecha del evento |
| Rechazado, con fecha o sin ella | Archivados | Momento del último rechazo |

- Activos muestra todos sus elementos, ordenados por vigencia ascendente: primero los más antiguos o próximos.
- Archivados se ordena por vigencia descendente: primero los más recientes.
- Todas las fuentes de vigencia se comparan por día civil en la zona del equipo, sin tener en cuenta la hora. Los empates mantienen un orden estable.
- El día actual y los límites de fecha se calculan en la zona horaria del equipo. Una fecha de hoy sigue vigente hasta que comienza mañana en esa zona.
- La ventana inicial de Archivados comprende hoy y los seis días anteriores en la zona del equipo e incluye todos sus eventos, aunque sean más de diez. «Cargar más» incorpora diez eventos archivados más antiguos por activación, o los que resten si son menos, mientras queden resultados.
- Cada tarjeta muestra «Vigencia» y la fecha utilizada para ordenar el evento, además de su estado real.
- Los valores de siete días de ventana y diez elementos por carga se definen mediante constantes fácilmente parametrizables en la implementación.
- Archivar por clasificación calculada no rechaza ni modifica un evento ni impide las acciones permitidas por su estado real.

## Casos límite

Un provisional con fecha vencida sigue activo con esa misma fecha como vigencia. Recuperar un rechazado conserva la fecha y lo devuelve a Activos como provisional, según las reglas de recuperación existentes. El cambio de un vínculo sin modificar los campos propios del evento no altera su momento de última modificación ni su vigencia. Para un rechazado, el momento del último rechazo se obtiene del dato de última modificación mientras conserva ese estado; no se requiere un historial adicional.

## Relaciones

- [RD-EVT-001 — Datos del evento](../../03_datos/EVT/rd-evt-001-datos-evento.md)
- [RD-EVT-002 — Autoría y momentos del evento](../../03_datos/EVT/rd-evt-002-autoria-momentos-evento.md)
