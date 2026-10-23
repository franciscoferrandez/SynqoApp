---
id: RF-CON-007
estado: en_revision
---

# RF-CON-007 — Editar una consulta de fechas

## Requisito

El sistema debe permitir que cualquier participante con acceso a un equipo vigente edite el título y las fechas de una consulta abierta desde su ficha, usando un diálogo con calendario de disponibilidad del equipo.

## Origen

Decisiones expresas de la persona impulsora del 2026-10-21: creación y edición de fechas desde Consultas, equivalencia con las reglas de edición de texto, conservación y retirada de fechas pasadas, sustitución sin trasladar votos y guardado directo salvo retiradas votadas.

## Precondiciones

Equipo vigente, acceso e identidad de participante del equipo seleccionada, y consulta de fechas abierta. No se restringe la edición a quien la creó.

## Criterios de aceptación

- «Editar consulta» se ofrece desde el menú de acciones de la ficha y carga título y fechas actuales en un diálogo. Las fechas incluidas quedan marcadas en el calendario sin lista apilada de opciones.
- El calendario muestra únicamente el resultado de disponibilidad del equipo, con color y estado reconocible sin depender solo del color. Lee las preferencias locales aplicables del visor, incluidas semanas completas y regla de cálculo; no ofrece controles para cambiarlas. No muestra modo propio, solapa, votos, recuentos ni contadores de ningún tipo, aunque estén activados en el calendario principal.
- Puede cambiarse el título aunque haya votos. Se aplican sus límites de [RD-CON-003 — Título de la consulta](../../03_datos/CON/rd-con-003-titulo-consulta.md).
- Se añaden fechas de hoy en adelante y se retiran fechas existentes, incluidas las pasadas, conforme a [RN-CON-005 — Fechas propuestas desde hoy](../../02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md). Al guardar, esa condición temporal se comprueba solo para las altas; las opciones conservadas no se invalidan por haber pasado.
- Sustituir una fecha es retirar su opción y añadir otra; no se trasladan votos. Las opciones conservadas mantienen identidad, orden relativo y votos; las altas se añaden al final. Se aplica [RN-CON-008 — Edición de opciones y conservación de votos](../../02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md).
- Pulsar una fecha existente la marca para retirar; volver a incluirla antes de guardar deshace esa retirada y recupera la misma opción, incluso pasada, con su identidad y votos. Una selección nueva que se desmarca desaparece del borrador.
- El resultado tiene entre una y diez fechas distintas según [RN-CON-003 — Mínimo de una opción por consulta](../../02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md), [RN-CON-007 — Máximo de diez opciones por consulta](../../02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md) y [RN-CON-004 — Fecha única entre opciones de una consulta](../../02_reglas-negocio/CON/rn-con-004-fecha-unica-consulta.md).
- «Guardar consulta» guarda directamente, salvo si se retiran opciones con votos: pide confirmar esas fechas y la eliminación de todos sus votos. Las restantes selecciones se conservan. Volver desde la confirmación mantiene el borrador. No se muestran contadores en el calendario del formulario.
- Cancelar o Escape sin cambios cierra directamente; con cambios ofrece seguir editando o descartar. No se persiste nada hasta guardar, y la operación se valida y guarda conjuntamente sin cambios parciales.
- La ficha muestra participante y momento de última edición efectiva según [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_datos/CON/rd-con-006-ultima-edicion-consulta.md). La creación permanece intacta y solo una edición efectiva registra actividad del equipo según [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md).
- Los errores conservan el formulario. Estado, opciones y votos se comprueban de nuevo al guardar. Si ya no es válida la edición se informa y ofrece recargar la ficha. Entre ediciones válidas simultáneas prevalece el último guardado de los campos afectados, como en eventos y texto; se conservan los campos no incluidos en esa edición.

## Casos límite

La selección usa el contorno del día sin tick, reservando la esquina superior derecha para la campanita de eventos no rechazados de [RF-EVT-004 — Mostrar eventos en el calendario](../EVT/rf-evt-004-mostrar-eventos-calendario.md). No muestra contadores de eventos ni abre un detalle al seleccionar la fecha. El foco de teclado se distingue del contorno de selección.

Las consultas cerradas no admiten edición. Editar no resuelve ni reabre la consulta, no modifica su vínculo ni el evento asociado y no convierte disponibilidad en votos. Una fecha no incluida antes de la edición que ya sea pasada no puede añadirse; deshacer una retirada de una opción original mantiene su identidad. Cambiar de mes no pierde el borrador.

## Relaciones

- [RF-CON-001 — Crear una consulta de fechas](rf-con-001-crear-consulta.md).
- [RF-CON-006 — Editar una consulta con opciones de texto](rf-con-006-editar-consulta-texto.md).
- [RF-DIS-002 — Consultar el visor de disponibilidad](../DIS/rf-dis-002-consultar-visor.md).
- [FLUJO-CON-007 — Editar una consulta de fechas](../../../04_experiencia-usuario/02_flujos/flujo-con-007-editar-consulta-fechas.md).
- [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](../../../04_experiencia-usuario/03_wireframes/wf-con-008-calendario-dialogo-consultas-fechas.md).
