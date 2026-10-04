# Consulta — ciclo de vida conocido

**Origen:** [alcance conceptual de Synqo](../../01_producto/04_alcance/alcance-conceptual.md) y [glosario de coordinación](../01_glosario-dominio/glosario-coordinacion.md).

## Estados

| Estado | Significado |
|---|---|
| Abierta | Consulta que aún puede recibir votos y no ha sido resuelta. |
| Resuelta con opciones aceptadas | Se ha registrado una resolución que acepta una o varias opciones propuestas. |
| Rechazada | Se ha registrado una resolución que rechaza la consulta. |

## Transiciones conocidas

| Desde | Acción | Hacia | Condición conocida |
|---|---|---|---|
| Abierta | Aceptar una o varias opciones propuestas | Resuelta con opciones aceptadas | Actúa un usuario con acceso bajo una identidad de participante del equipo; no se exige haber recibido votos. |
| Abierta | Rechazar la consulta | Rechazada | Actúa un usuario con acceso bajo una identidad de participante del equipo; no se exige haber recibido votos. |

Una consulta requiere al menos una opción para crearse, aunque aún no haya recibido votos. El voto atribuido a un participante puede cambiarse o retirarse por completo mientras la consulta está abierta; tras retirarlo, el participante queda sin respuesta. Las opciones con fechas ya pasadas siguen votables mientras la consulta permanezca abierta. Una consulta abierta puede resolverse en cualquier momento, incluso antes de recibir votos. Antes de registrar una aceptación o rechazo se pide confirmación. En esta fase, una consulta resuelta no se reabre. No se han definido borradores.

**PROPUESTO, sin transición definida:** permitir rechazar una resolución después de registrarla. Falta precisar qué significaría ese rechazo y cómo afectaría a la consulta y sus votos.
