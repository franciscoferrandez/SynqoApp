---
id: RF-EQU-004
estado: en_revision
---

# RF-EQU-004 — Mostrar la fecha prevista de caducidad

## Requisito

El sistema debe mostrar en la pantalla del equipo rápido vigente la fecha en que caducará si no se realiza ninguna otra modificación.

## Origen

- [HU-EQU-005 — Conocer la caducidad prevista del equipo](../../../01_producto/07_historias-usuario/hu-equ-005-conocer-caducidad.md)

## Precondiciones

El usuario tiene acceso a un equipo vigente.

## Criterios de aceptación

- La pantalla del equipo muestra su fecha prevista de caducidad.
- Tras una modificación del equipo, la fecha mostrada refleja el nuevo plazo de tres meses naturales.
- Abrir el enlace sin modificar el equipo no altera la fecha mostrada.
- La fecha se muestra en la zona horaria del dispositivo que la consulta o, si no puede obtenerse, en la zona del equipo.

## Casos límite

La fecha aplica el desbordamiento de días y la zona del equipo definidos en [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md). La zona del equipo no se muestra al usuario ni puede cambiarla. El equipo sigue vigente hasta terminar el día de vencimiento en esa zona; la fecha local mostrada al usuario puede diferir por la conversión de zona horaria.

## Relaciones

- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RD-EQU-002 — Fecha prevista de caducidad del equipo](../../03_datos/EQU/rd-equ-002-caducidad-equipo.md)
