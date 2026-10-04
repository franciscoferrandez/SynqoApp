# Equipo rápido — ciclo de vida conocido

**Origen:** decisión expresa de quien impulsa Synqo sobre acceso, actividad y caducidad de los equipos rápidos.

## Estados

| Estado | Significado |
|---|---|
| Vigente | El equipo es accesible mediante su enlace y se puede modificar bajo una identidad de participante. |
| Caducado | Han transcurrido tres meses naturales sin modificaciones. El equipo queda inaccesible y no se puede recuperar en esta fase; sus datos esperan el borrado. |
| Eliminado | Ha transcurrido el plazo adicional de borrado y se han eliminado todos los datos del equipo. |

## Transiciones conocidas

| Desde | Acción o condición | Hacia |
|---|---|---|
| Creación | Crear el equipo | Vigente |
| Vigente | Modificar participantes, disponibilidad, votos, consultas o resoluciones | Vigente; se reinicia el plazo de inactividad |
| Vigente | Transcurrir tres meses naturales sin modificaciones | Caducado |
| Caducado | Transcurrir el plazo adicional de borrado, inicialmente de 90 días y configurable internamente o mediante el entorno de la aplicación | Eliminado |

Abrir el enlace sin modificar el equipo no reinicia el plazo. La fecha prevista de caducidad se muestra mientras el equipo está vigente. No existe transición de recuperación desde «Caducado» en esta fase.

Cambiar únicamente la identidad activa recordada en el navegador tampoco modifica el equipo ni reinicia el plazo; crear o modificar los datos de un participante sí lo hace, según [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md).

Al sumar tres meses naturales, se toma directamente el tercer mes posterior a la creación o a la última modificación que reinició el plazo. Si ese mes no contiene el número de día de origen, los días sobrantes continúan en el mes siguiente, de acuerdo con [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md).

Al crear el equipo se intenta obtener su zona horaria y se usa Europe/Madrid si falla. Esa zona determina el calendario de caducidad. El usuario no la ve ni puede cambiarla. La fecha se muestra en la zona horaria del dispositivo que consulta o, si no puede obtenerse, en la del equipo.

El equipo permanece vigente durante todo el día de vencimiento en su zona horaria y pasa a «Caducado» al comenzar el día siguiente, a las 00:00 en esa zona.
