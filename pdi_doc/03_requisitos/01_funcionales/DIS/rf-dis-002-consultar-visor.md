---
id: RF-DIS-002
estado: en_revision
---

# RF-DIS-002 — Consultar el visor de disponibilidad

## Requisito

El sistema debe ofrecer a los usuarios con acceso a un equipo un calendario de disponibilidad por día que ayude a identificar posibles fechas para una consulta. El mismo calendario permite alternar entre el resumen del equipo y las marcas de la identidad activa.

## Origen

- [HU-DIS-002 — Consultar disponibilidad del equipo](../../../01_producto/07_historias-usuario/hu-dis-002-consultar-visor.md)
- Decisión expresa de quien impulsa Synqo: el detalle diario muestra los participantes agrupados por estado.
- Decisión expresa de quien impulsa Synqo: los recuentos se consultan al abrir el detalle del día, también en pantallas amplias.
- Decisión expresa de quien impulsa Synqo: la vista predeterminada muestra solo los días del mes natural; la vista alternativa mantiene el mismo mes pero completa su primera y última semana con los días de los meses vecinos, de lunes a domingo.
- Decisión expresa de quien impulsa Synqo: hay un control para volver a «Hoy».
- Decisión expresa de quien impulsa Synqo: «Mi disponibilidad» comparte calendario y detalle con la vista del equipo; solo cambia el estado mostrado en las casillas.

## Precondiciones

El usuario tiene acceso al equipo.

## Criterios de aceptación

- El calendario refleja la disponibilidad registrada para el equipo, separada de los votos de las consultas.
- Se puede alternar entre «Equipo», que representa el estado agregado, y «Mi disponibilidad», que representa la marca de la identidad activa o la ausencia de marca. El detalle de cualquier día sigue mostrando los recuentos y participantes de todo el equipo en ambos modos.
- Cada día permite conocer el estado agregado y los recuentos de las marcas disponibles, quizá y no disponibles conforme a [RN-DIS-002 — Resumen diario de disponibilidad](../../02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md).
- En cualquier tamaño de pantalla, la casilla del día muestra el estado correspondiente al modo activo («Equipo» o «Mi disponibilidad»); al activarla se muestran los tres recuentos y qué participantes marcaron cada estado.
- Al entrar, el calendario muestra el mes natural en curso. Sus controles anterior y siguiente recorren meses naturales en esa vista.
- El usuario puede activar una vista del mes con semanas completas: comienza el lunes de la semana que contiene el día 1 y termina el domingo de la semana que contiene el último día del mes. Los días añadidos de meses vecinos conservan su fecha real y pueden consultarse y marcarse según las mismas reglas temporales. Anterior y siguiente siguen recorriendo meses.
- El control «Hoy» aparece cuando el día actual no está entre las fechas visibles y vuelve a él sin cambiar el modo de presentación ni el alcance «Equipo»/«Mi disponibilidad», usando la zona horaria del dispositivo o, si no se obtiene, la del equipo.
- El visor permite reconocer fechas que podrían proponerse en una consulta.

## Casos límite

Si no hay marcas para un día, el calendario muestra un estado agregado neutro; al consultar su detalle, los recuentos son cero y las listas de participantes por estado están vacías. Las marcas «sin marcar» se ignoran. El visor no crea consultas automáticamente.

## Relaciones

- [RD-DIS-001 — Disponibilidad vigente por día](../../03_datos/DIS/rd-dis-001-disponibilidad.md)
- [RN-DIS-002 — Resumen diario de disponibilidad](../../02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md)
