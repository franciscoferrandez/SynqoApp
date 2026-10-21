---
id: RN-CON-008
estado: en_revision
---

# RN-CON-008 — Edición de opciones y conservación de votos

## Regla

En una consulta de texto abierta, una opción conservada mantiene su identidad y las selecciones que la señalan. Solo se cambia su texto si no tiene votos en el momento de guardar. Las nuevas opciones se añaden al final; las conservadas mantienen su orden relativo. No se permite reordenarlas.

Se puede eliminar una opción con votos únicamente tras confirmar que se retiran esa opción y todas las selecciones que la señalan. Las demás selecciones de cada participante se conservan. Si un participante queda sin ninguna selección, queda sin respuesta vigente, como en la retirada completa de [RN-CON-001 — Votación múltiple y pública](rn-con-001-votacion-publica.md).

Título, cambios de opciones, retirada de selecciones, última edición y actividad se guardan conjuntamente. El incumplimiento de una regla deja todos esos datos sin cambios.

El estado y los votos actuales se comprueban al guardar. Si una opción ha recibido votos mientras se editaba su texto, se rechaza ese cambio. Si una opción marcada para eliminar recibe votos y esa retirada no se había confirmado, se exige la confirmación antes de guardar. Una confirmación se refiere a opciones concretas y a todos sus votos; no autoriza borrar votos de otras opciones. Un cambio en el número de votos de una opción ya confirmada no exige otra confirmación de esa misma retirada.

## Justificación

Los votos no se trasladan a respuestas de significado distinto. La retirada expresamente confirmada permite corregir las opciones disponibles conservando las demás respuestas del equipo.

## Excepciones

La edición de consultas de fechas o cerradas no forma parte de esta capacidad. Cambiar el título no reinicia los votos. Las reglas se aplican al estado persistido en el momento de guardar, no únicamente a los recuentos visibles cuando se abrió el formulario.

## Origen

Respuestas expresas de la persona impulsora del 2026-10-20 y 2026-10-21: bloquear cambios de texto con votos, permitir retirar opciones votadas con confirmación y conservar los demás votos.

## Relaciones

- [RF-CON-006 — Editar una consulta con opciones de texto](../../01_funcionales/CON/rf-con-006-editar-consulta-texto.md).
- [RN-CON-002 — Resolución de una consulta abierta](rn-con-002-resolucion-consulta.md).
