---
id: RN-EQU-002
estado: en_revision
---

# RN-EQU-002 — Caducidad de equipos rápidos por inactividad

## Regla

En la primera entrega, un equipo rápido caduca tras tres meses naturales sin modificaciones. Crear el equipo inicia el plazo. Toda modificación de participantes, disponibilidades, votos, consultas o resoluciones reinicia el plazo. El mero acceso mediante el enlace no es actividad y no lo reinicia.

Una vez caducado, el equipo no puede recuperarse en esta fase. Su fecha prevista de caducidad equivale al vencimiento del plazo vigente si no se realizan nuevas modificaciones.

Al crear el equipo se intenta obtener su zona horaria; si no se consigue, se usa Europe/Madrid. La zona del equipo determina el cálculo de caducidad, no se muestra al usuario y este no puede cambiarla.

Para sumar los tres meses naturales se toma directamente el tercer mes posterior al de la creación o la última modificación que reinició el plazo, conservando el número de día cuando exista. Si ese mes no tiene dicho día, los días que excedan su último día se cuentan en el mes siguiente. Se aplica el mismo ajuste tanto para calcular la caducidad efectiva como para mostrar la fecha prevista.

El equipo permanece vigente hasta terminar el día de vencimiento calculado en la zona horaria del equipo. La caducidad ocurre al comenzar el día siguiente, a las 00:00 de esa zona.

## Justificación

Los equipos rápidos deben permitir coordinación inmediata sin registro y mostrar cuánto tiempo permanecerá accesible el espacio si deja de usarse.

## Casos límite

- Marcar o desmarcar disponibilidad cuenta como modificación; cambiar un voto abierto también.
- Un intento de modificación que falla y no se guarda no reinicia el plazo.
- Crear o modificar los datos de un participante del equipo cuenta como modificación.
- Seleccionar otra identidad activa guardada solo en el navegador no modifica el equipo ni reinicia el plazo.
- Leer el equipo, el visor o las consultas no cuenta como modificación.
- Una modificación el 31 de agosto vence el 1 de diciembre: noviembre tiene 30 días y el día sobrante pasa a diciembre.
- Una modificación el 30 de noviembre vence el 2 de marzo si el febrero de destino tiene 28 días, o el 1 de marzo si tiene 29.
- La zona horaria del dispositivo no cambia la caducidad calculada para el equipo, solo su presentación.
- Una modificación realizada durante el día de vencimiento, antes de las 00:00 del día siguiente en la zona del equipo, reinicia el plazo.

## Origen

Decisión expresa de quien impulsa Synqo sobre equipos rápidos, plazo de tres meses naturales y actividades que lo reinician.

## Relaciones

- [RF-EQU-003 — Acceder al equipo por enlace](../../01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RF-EQU-004 — Mostrar la fecha prevista de caducidad](../../01_funcionales/EQU/rf-equ-004-mostrar-caducidad.md)
- [RD-EQU-002 — Fecha prevista de caducidad del equipo](../../03_datos/EQU/rd-equ-002-caducidad-equipo.md)
- [RN-EQU-003 — Borrado de equipos caducados](rn-equ-003-borrado-equipo.md)
