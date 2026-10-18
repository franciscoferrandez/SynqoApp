---
id: FLUJO-EVT-001
estado: en_revision
---

# FLUJO-EVT-001 — Consultar y gestionar eventos

## Actor

Una persona con acceso al equipo vigente, usando una identidad de participante seleccionada.

## Entrada

La persona abre la pestaña «Eventos» desde cualquier sección del equipo, o vuelve a ella desde una ficha.

## Precondiciones

- El equipo está vigente y la persona tiene acceso.
- Para crear o editar, hay una identidad de participante seleccionada.

## Pasos

1. La persona abre «Eventos» y revisa las agrupaciones disponibles: «Sin fecha definitiva», «Futuros», «Pasados» y «Rechazados».
2. Para crear, activa «Crear evento». Synqo presenta un formulario con título, notas opcionales, fecha opcional y estado. Si se informa fecha, el estado inicial seleccionado es provisional, aunque se puede elegir definitivo. Sin fecha, el evento permanece provisional y el estado se muestra fijo.
3. La persona completa el título y, si quiere, notas, fecha y estado; revisa la fecha y el estado antes de guardar.
4. Synqo valida el formulario. Si es válido, guarda el evento y abre su ficha. La lista lo incluye en la agrupación que corresponda.
5. Para consultar uno existente, la persona abre su tarjeta y revisa título, notas, fecha, estado, autoría y consultas relacionadas cuando existan.
6. Para editar un evento activo, activa «Editar», modifica título, notas, fecha o estado y guarda. Synqo actualiza la ficha y el grupo de la lista si el cambio afecta a la clasificación u orden.
7. Si la persona cancela la edición y hay cambios sin guardar, Synqo pide confirmar que desea descartarlos. Si confirma, descarta los cambios y vuelve a la ficha; si vuelve a la edición, conserva el borrador.
8. Para rechazar un evento, la persona activa «Rechazar» y confirma la acción. Synqo conserva los datos y lo muestra en «Rechazados».
9. Para recuperar uno rechazado, la persona lo abre desde «Rechazados», activa «Recuperar» y confirma la acción. Synqo conserva la fecha, deja el estado provisional y mueve el evento a la agrupación que corresponda.
10. Desde la ficha, la persona vuelve a la lista de eventos; desde la lista puede cambiar a Calendario o Consultas mediante la navegación común del equipo.

## Resultado

El evento creado o modificado conserva los valores actuales y la autoría y momentos correspondientes. Rechazarlo o recuperarlo cambia su ciclo de vida sin borrar sus datos. La lista refleja el estado y la fecha actuales.

## Errores

- Si el título supera 250 caracteres o las notas superan 5000, se indica el límite junto al campo y no se guarda el formulario.
- Si falta el título, se señala el campo requerido y se conserva el resto de los valores introducidos.
- Si no se pueden cargar eventos, se informa del problema y se ofrece reintentar.
- Si no se puede guardar, rechazar o recuperar por un error del servicio, se informa sin descartar el contenido del formulario cuando corresponda; la ficha permite reintentar la acción.
- Si el equipo ha caducado, no se continúa con la acción y se presenta el estado del equipo según el flujo de acceso existente.
- Si el evento ya no está disponible al guardar una edición o una acción de ciclo de vida, se informa y se permite volver a cargar la lista.

## Cancelación

- Cancelar la creación sin cambios vuelve a la lista. Si hay cambios sin guardar, Synqo pide confirmar que desea descartarlos. Si confirma, vuelve a la lista sin crear evento; si vuelve al formulario, conserva el borrador.
- Cancelar la edición sin cambios vuelve a la ficha. Si hay cambios sin guardar, Synqo pide confirmar que desea descartarlos. Si confirma, vuelve a la ficha; si vuelve a la edición, conserva el borrador.
- Cancelar la confirmación de rechazo o recuperación no cambia el evento.

## Propuestas UX por confirmar

- En este Change no se crea ni se modifica el vínculo con consultas; por ello, el caso de rechazo de evento con consulta abierta de [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md) queda fuera de este flujo y debe tratarse al preparar el Change de integración de consultas.

## RF/RN relacionados

- [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md)
- [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md)
- [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md)
- [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md)
- [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md)
