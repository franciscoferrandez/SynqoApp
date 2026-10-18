---
id: PA-EVT-001
estado: resuelta
impacto: alto
---

# PA-EVT-001 — ¿Cómo se definen los eventos y su vínculo con las consultas de fechas?

## Contexto

La persona que impulsa Synqo ha pedido una nueva entrega centrada en eventos del equipo: título, notas, fecha opcional, fecha provisional o definitiva, rechazo y una sección propia. Una consulta de fechas podrá vincularse a un evento al crearla o al resolverla, y la fecha elegida se trasladará al evento cuando corresponda. Estas indicaciones son el origen de la ampliación, pero dejan decisiones necesarias para concretar las reglas y la interfaz.

La [visión de Synqo](../01_producto/01_vision/vision.md) ya mencionaba la coordinación de fechas para eventos. Antes de esta ampliación, el [alcance conceptual de Synqo](../01_producto/04_alcance/alcance-conceptual.md) solo proponía notas sencillas asociadas a información acordada; ahora recoge las decisiones parciales sobre eventos mientras se resuelven los casos pendientes de esta PA. La [RF-CON-004 — Resolver una consulta](../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md) permite aceptar **una o varias** opciones si no hay un evento vinculado; para una consulta de fechas vinculada exige aceptar una sola fecha.

## Qué bloquea

No queda una decisión abierta de esta PA que bloquee la definición del Product Baseline de eventos. Se conserva el registro de las preguntas que motivaron la ampliación.

## Gate afectado

Definición del Product Baseline de eventos y preparación de los criterios de aceptación de las SPEC afectadas. Las respuestas finales permiten continuar este gate.

## Tipo

decisión_humana

## Respuestas aprobadas

La persona que impulsa Synqo ha decidido durante la definición de esta entrega:

1. Una consulta de fechas vinculada a un evento exige aceptar **una sola fecha** al resolverla.
2. La fecha asignada al evento por la resolución queda **definitiva**.
3. Los eventos aparecen en el calendario mediante una **campanita en la esquina superior derecha del día**. Si hay más de un evento ese día, la campanita muestra un contador. La información de los eventos de ese día se presenta en el detalle del día.
4. Un evento rechazado **conserva sus datos y puede recuperarse**.
5. **Cualquier persona con acceso al equipo** puede gestionar sus eventos.
6. La fecha de un evento expresa **solo el día**, sin hora.
7. Un evento puede tener vinculada **como máximo una consulta de fechas abierta**, y una consulta puede vincularse **como máximo a un evento**.
8. El vínculo entre consulta y evento puede **modificarse o eliminarse antes de resolver** la consulta.
9. El rechazo de una consulta vinculada **no altera el evento**.
10. Si, excepcionalmente, el evento vinculado ya está rechazado al resolver la consulta, se ofrecerá **desvincular el evento y resolver la consulta aceptando una fecha**, o **rechazar la consulta**. Es una defensa para ese estado excepcional; cancelar el aviso deja ambos sin cambios.
11. La ficha permite editar **título, notas, fecha y estado**, incluso cuando la fecha del evento es definitiva.
12. La campanita del calendario **no cuenta los eventos rechazados**.
13. Recuperar un evento rechazado **conserva su fecha y lo deja provisional**, incluso si antes de rechazarlo era definitivo.
14. La separación entre eventos definitivos futuros y pasados usa el día actual en **la zona horaria del equipo**.
15. Elegir un evento «a posteriori» significa elegirlo **al resolver una consulta aún abierta**; no incluye vincular consultas ya resueltas.
16. Un evento provisional cuya fecha haya pasado permanece en el grupo **«Sin fecha definitiva»**.
17. Al rechazar un evento que tenga una consulta de fechas abierta vinculada, se presenta **inmediatamente** la elección entre desvincular la consulta o rechazarla también.
18. Se puede crear un evento con fecha pasada y también asignarle una fecha pasada al editarlo.
19. Un evento rechazado **no se puede editar** hasta recuperarlo.
20. Las ediciones conservan **solo el valor actual** de los campos, sin historial de versiones.
21. La campanita y el detalle del día muestran tanto eventos **provisionales con fecha** como **definitivos**.
22. Los eventos rechazados con fecha quedan fuera del detalle del día; se consultan **solo en la pestaña Eventos**.
23. Las notas son opcionales, de texto plano y admiten hasta **5000 caracteres**; el título admite hasta **250 caracteres**.
24. Al seleccionar un evento nuevo para una consulta, **no se ofrecen eventos con fecha definitiva**. Si uno previamente vinculado pasa a definitivo antes de resolver, la consulta sí puede resolverse con aviso y sin cambiar la fecha del evento.
25. Los eventos definitivos futuros se ordenan por **fecha ascendente** y los pasados por **fecha descendente**. Los grupos sin fecha definitiva y rechazados muestran primero los **más recientes**.
26. Un evento con fecha definitiva de **hoy** se incluye en «Futuros» según la zona horaria del equipo.
27. No hay borrado individual de eventos; se usan rechazo y recuperación.
28. La ficha muestra **participante y momento de creación** y, cuando exista un cambio real, **participante y momento de última modificación**, sin historial de versiones.
29. En los grupos sin fecha definitiva y rechazados, «más reciente» significa **última modificación**.
30. Si una consulta asigna fecha a un evento, la última modificación se atribuye al **participante que resolvió la consulta**.
31. Cancelar la confirmación del rechazo de un evento con consulta vinculada deja **evento y consulta sin cambios**.
32. Si se informa una fecha al crear un evento, queda **provisional por defecto**.
33. Una consulta vinculada que después se resuelva o rechace **sigue visible desde la ficha del evento**.
34. Si un evento previamente vinculado pasa a definitivo antes de confirmar la resolución, se muestra el **aviso antes de confirmar** y se **conserva la relación** aunque la consulta no cambie la fecha del evento.
35. Un evento se puede rechazar desde **provisional o definitivo**.
36. Para rechazar un evento con consulta abierta vinculada hay **un único diálogo** que permite rechazar solo el evento y desvincular la consulta o rechazar ambos; cancelar deja ambos sin cambios.
37. En un empate de fecha entre eventos definitivos, aparece primero el **modificado más recientemente**.
38. Antes de un cambio real posterior a la creación, no se muestra **«última modificación»**; ese dato todavía está ausente.
39. Las fichas de evento y consulta vinculados permiten **navegar en ambos sentidos**.
40. Si aparece el caso excepcional de evento ya rechazado pero aún vinculado al resolver, **cancelar el aviso no cambia** ni evento ni consulta.
41. Un evento puede vincularse a **consultas de fechas sucesivas**, con máximo una abierta a la vez. Conserva los vínculos con **todas** las anteriores cerradas, que se muestran en su ficha.
42. Vincular, cambiar o quitar una consulta **sin cambiar campos propios del evento** no actualiza «última modificación» ni su orden basado en ese dato.
43. Para ordenar un evento que nunca se ha modificado se usa el **momento de creación**, sin mostrar un campo de «última modificación» inexistente.

Estas respuestas recogen las decisiones expresas de la persona que impulsa Synqo. No determinan por extensión detalles de implementación ajenos a su alcance.

## Preguntas que quedaron resueltas

1. **Cambios solo en el vínculo.** Se consideraron contarlos como modificación del evento o conservar el dato de sus campos propios. Se aprobó conservar el dato y su orden: el vínculo por sí solo no los altera.
2. **Consultas sucesivas e historial de vínculos.** Se consideró limitar el evento a una consulta durante toda su vida o permitir consultas sucesivas con una sola abierta. Se aprobó la segunda opción y mostrar todos los vínculos cerrados en su ficha.

## Resolución

Cuarenta y tres puntos aprobados, recogidos arriba. Las preguntas de esta PA están resueltas. Las decisiones deben estar reflejadas en el Product Baseline y las SPEC aplicables; esta PA conserva su origen y alternativas consideradas, sin funcionar como una segunda fuente normativa.
