---
id: RF-DIS-001
estado: en_revision
---

# RF-DIS-001 — Marcar y modificar disponibilidad

## Requisito

El sistema debe permitir que un usuario con acceso al equipo indique o cambie la disponibilidad de un participante para hoy o una fecha futura y retire la marca para volver a «sin marcar».

## Origen

- [HU-DIS-001 — Indicar disponibilidad del equipo](../../../01_producto/07_historias-usuario/hu-dis-001-disponibilidad-del-equipo.md)
- Decisión expresa de quien impulsa Synqo: solo hoy o fechas futuras admiten cambios, según la zona del dispositivo o, si no está disponible, la del equipo.
- Decisión expresa de quien impulsa Synqo: la marca vigente se retira pulsando de nuevo su opción activa en el detalle diario.
- Decisión expresa de quien impulsa Synqo: ante un fallo de guardado se restaura la marca anterior y se ofrece reintentar.

## Precondiciones

El equipo está vigente, el usuario tiene acceso y ha seleccionado una identidad de participante del equipo.

## Criterios de aceptación

- Para un día del equipo puede indicarse disponible, quizá o no disponible.
- Desde el calendario, al activar un día se puede elegir disponible, quizá o no disponible para la identidad seleccionada.
- Pulsar de nuevo la opción de disponibilidad que ya está marcada para ese participante y día retira la marca vigente y lo devuelve a «sin marcar», sin ofrecer una cuarta opción de selección.
- Una marca existente puede modificarse o retirarse mientras el equipo esté vigente y el usuario tenga acceso.
- No se puede crear, modificar ni retirar una marca de un día anterior a hoy en la zona horaria del dispositivo; si no se obtiene esa zona, se utiliza la del equipo.
- La disponibilidad se mantiene en el equipo con independencia de las consultas.
- El cambio se refleja al instante en el calendario y el detalle. Si no puede guardarse, se restaura el valor anterior, se informa del fallo y se ofrece reintentar la misma acción mientras siga permitida.

## Casos límite

La ausencia de marca corresponde a «sin marcar», según el glosario de dominio. Una marca que pasa a corresponder a un día pasado permanece consultable mientras exista el equipo, pero deja de ser editable.
Una acción que no llegó a guardarse no se considera una modificación efectiva del equipo.

## Relaciones

- [RN-DIS-001 — Disponibilidad diaria del equipo](../../02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md)
- [RD-DIS-001 — Disponibilidad vigente por día](../../03_datos/DIS/rd-dis-001-disponibilidad.md)
