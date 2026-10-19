---
id: RN-CON-002
estado: en_revision
---

# RN-CON-002 — Resolución de una consulta abierta

## Regla

Una consulta abierta puede resolverse en cualquier momento, con o sin votos: se aceptan una o varias de sus opciones propuestas o se rechaza la consulta. Cuando una consulta de fechas está vinculada a un evento, solo puede aceptarse una fecha según [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../EVT/rn-evt-003-vinculo-consulta-abierta.md); sin vínculo se mantiene la aceptación múltiple. La resolución se atribuye a la identidad de participante bajo la que actúa el usuario con acceso. Una consulta resuelta no se reabre en esta fase. Una consulta vinculada conserva, una vez resuelta o rechazada, la relación visible y navegable con el evento desde la ficha de ambos. El evento puede vincularse después a otra consulta abierta sin perder el acceso a sus consultas cerradas anteriores.

## Justificación

El equipo debe poder dejar constancia de la decisión sin depender de un número mínimo de votos.

## Excepciones

El posible rechazo posterior de una resolución es una propuesta sin reglas definidas y no forma parte de esta fase.

Rechazar una consulta vinculada no modifica el evento. Si un evento vinculado ya tiene fecha definitiva, se avisa antes de confirmar la resolución de que la consulta no cambiará esa fecha; la fecha se puede editar en la ficha del evento y la relación se conserva. Si el evento vinculado está rechazado, se puede rechazar la consulta conservando el vínculo o cancelar y retirarlo desde la ficha antes de resolver. El modal de resolución no permite elegir, cambiar ni quitar un evento; muestra solo la etiqueta del asociado, si lo hay. Cancelar deja ambos sin cambios.

Al rechazar un evento con una consulta abierta vinculada, se ofrece en un único diálogo rechazar el evento y desvincular la consulta o rechazar ambos. Cancelar ese diálogo deja la consulta y el evento sin cambios.

## Origen

- [INV-CON-002 — Resolución de la consulta](../../../02_dominio/05_invariantes/inv-con-002-resolucion-consulta.md)
- Aclaraciones expresas de la persona que impulsa Synqo sobre la resolución de consultas vinculadas a eventos.

## Relaciones

- [RF-CON-004 — Resolver una consulta](../../01_funcionales/CON/rf-con-004-resolver-consulta.md)
- [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../EVT/rn-evt-003-vinculo-consulta-abierta.md)
