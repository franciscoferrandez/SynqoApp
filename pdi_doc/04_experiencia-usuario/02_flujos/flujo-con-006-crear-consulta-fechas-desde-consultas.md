---
id: FLUJO-CON-006
estado: en_revision
---

# FLUJO-CON-006 — Crear una consulta de fechas desde Consultas

## Actor

[ACT-COO-002 — Usuario con acceso al equipo](../../01_producto/05_actores-personas/act-coo-002-usuario-con-acceso.md) bajo una identidad de participante seleccionada.

## Entrada

Sección «Consultas» de un equipo vigente, acción «Crear consulta», elección «Fechas» antes de abrir el formulario. «Texto» conduce a su flujo existente; no se alterna el tipo dentro del borrador.

## Precondiciones

Las de [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md).

## Pasos

1. Tras elegir «Fechas», se abre un diálogo con título, calendario y selección vacía. Se leen las preferencias locales aplicables: semanas completas y regla del equipo. Las preferencias se modifican desde el calendario principal.
2. La persona escribe el título y pulsa fechas de hoy en adelante para incluirlas o retirarlas. Puede cambiar de mes sin perder lo seleccionado. Las fechas elegidas permanecen marcadas en sus casillas; no se apilan en una lista. El calendario muestra solo color y resultado del equipo, sin votos, recuentos ni contadores de ningún tipo, ni modo propio o solapa.
3. Puede activar el switch «Crear evento provisional»: se creará sin fecha, con el mismo título, asociado a la consulta. No se elige un evento existente.
4. Pulsa «Crear consulta» con título y entre una y diez fechas diferentes. Se guarda directamente, sin confirmación general. La consulta y, si procede, el evento y el vínculo se guardan conjuntamente.
5. El diálogo se cierra y la consulta aparece abierta en Consultas, disponible para votar.

## Resultado

Consulta de fechas abierta y actividad del equipo actualizada. La disponibilidad solo se utiliza como referencia; no se convierte en votos ni se modifica.

## Errores

- Título o fechas inválidos: informar, conservar el borrador y no guardar parcialmente. Impedir una undécima fecha y las fechas duplicadas.
- Una fecha nueva ha pasado al guardar según la zona aplicable: señalar que debe retirarse o sustituirse; no crear parcialmente.
- Fallo al leer preferencias: usar los valores predeterminados del calendario principal; no bloquear la selección.
- Fallo de servicio: conservar el formulario para reintentar. Equipo caducado o falta de acceso: aplicar el recorrido común de acceso sin crear datos.

## Cancelación

Cancelar o Escape sin título ni fechas cierra directamente. Si hay título o fechas, ofrecer «Seguir editando» como acción inicial y «Abandonar edición» para descartar. Continuar conserva título, selección y switch; descartar no crea consulta ni evento. No se define persistencia del borrador al abandonar la vista.

## RF/RN relacionados

- [RN-CON-005 — Fechas propuestas desde hoy](../../03_requisitos/02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md).
- [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md).
- [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](../03_wireframes/wf-con-008-calendario-dialogo-consultas-fechas.md).
- [FLUJO-CON-001 — Crear una consulta de fechas](flujo-con-001-crear-consulta.md), recorrido desde el calendario principal que se conserva.
- [FLUJO-CON-004 — Crear una consulta con opciones de texto](flujo-con-004-crear-consulta-texto.md).
