---
id: RF-CON-001
estado: en_revision
---

# RF-CON-001 — Crear una consulta de fechas

## Requisito

El sistema debe permitir que un usuario con acceso al equipo construya desde el calendario una consulta con un título breve y opciones de fecha, sin exigir registro. El botón «Crear consulta de fechas» del calendario es la única entrada de creación de este tipo.

## Origen

- [HU-CON-001 — Crear una consulta de fecha](../../../01_producto/07_historias-usuario/hu-con-001-crear-consulta-de-fecha.md)
- Ajuste expreso de la persona impulsora el 2026-10-19 tras probar en local: sustituir la selección por la creación opcional de un evento; el evento usa el mismo título de la consulta.
- Decisiones expresas del 2026-10-21: reutilizar el diálogo desde Calendario, abrir su mes visible sin fechas seleccionadas y continuar en la lista de Consultas tras guardar.
- Decisiones expresas del 2026-10-21: añadir creación desde Consultas con calendario en diálogo y guardado directo, conservando el recorrido del calendario principal.
- Ajuste expreso del 2026-10-24: reservar la creación de consultas de fechas al botón del calendario, conservando su comportamiento actual. Sustituye la entrada adicional desde Consultas acordada el 2026-10-21; la edición de consultas de fechas desde su ficha se conserva.

## Precondiciones

El usuario tiene acceso al equipo y actúa bajo una identidad de participante del equipo.

## Criterios de aceptación

- La consulta creada pertenece al equipo y puede recibir votos.
- Al crear una consulta de fechas, un switch opcional permite crear a la vez un evento provisional sin fecha asignada, con el mismo título de la consulta, asociado a ella. No se selecciona un evento existente en este formulario. Con el switch desactivado se crea únicamente la consulta. El evento y la consulta se guardan juntos al confirmar; cancelar o fallar no deja un evento huérfano ni una consulta parcial.
- La persona escribe un título breve al crear la consulta y ese título la identifica en la lista del equipo.
- El título admite hasta 250 caracteres según [RD-CON-003 — Título de la consulta](../../03_datos/CON/rd-con-003-titulo-consulta.md).
- La consulta puede crearse con una a diez opciones de fecha según [RN-CON-003 — Mínimo de una opción por consulta](../../02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md) y [RN-CON-007 — Máximo de diez opciones por consulta](../../02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md). El formulario indica visualmente el máximo.
- Cada fecha puede aparecer una sola vez entre las opciones de una consulta.
- Al crear la consulta, todas sus opciones corresponden a hoy o a fechas futuras según la zona horaria del dispositivo o, si no se obtiene, la del equipo.
- Desde «Consultas» no se crean consultas de fechas ni se ofrece una elección de tipo: su acción de creación abre directamente el formulario de opciones de texto. Las consultas de fechas existentes conservan su edición desde la ficha según [RF-CON-007 — Editar una consulta de fechas](rf-con-007-editar-consulta-fechas.md).
- El calendario del diálogo respeta las preferencias locales aplicables del visor, incluidas semanas completas y regla de disponibilidad del equipo, según [RF-DIS-002 — Consultar el visor de disponibilidad](../DIS/rf-dis-002-consultar-visor.md). Solo lee esas preferencias; se cambian desde el calendario principal. Cada día muestra el color y el resultado de la regla sin depender exclusivamente del color. No muestra votos, recuentos ni contadores de ningún tipo, aunque las preferencias permitan mostrarlos en el calendario principal.
- El diálogo muestra únicamente el resultado del equipo, sin modo de disponibilidad propia ni solapa del calendario opuesto. Las preferencias de superposición o de recuentos no añaden esos elementos a esta vista.
- La selección comienza sin fechas. Pulsar un día admisible lo añade; pulsarlo de nuevo lo retira. Se conserva la selección entre meses. En el diálogo las fechas incluidas quedan marcadas en el calendario, sin apilarlas en una lista de opciones.
- «Crear consulta» guarda directamente sin confirmación general desde el diálogo abierto por el calendario. El switch opcional de evento provisional se conserva.
- El botón «Crear consulta de fechas» del calendario principal abre directamente el mismo diálogo de fechas, sin elegir tipo. Se inicia en el mes visible del calendario principal y sin fechas incluidas, aunque estuviera abierto el detalle de un día. El borrador y su navegación temporal son independientes del calendario de fondo; se sustituye el antiguo panel de construcción por este diálogo, también en móvil.
- Cancelar abandona directamente si el título está vacío y no hay fechas seleccionadas; si hay título o fechas, se confirma el descarte con «Seguir editando» como opción inicial y «Descartar cambios» como acción definitiva. Cerrar o descartar vuelve al calendario de origen conservando su mes, día y preferencias y devuelve el foco al botón de creación. Tras guardar desde el calendario, se abre la lista de Consultas conservando el acceso al equipo; la consulta aparece en la lista que corresponda según [RF-CON-008 — Listar consultas por vigencia](rf-con-008-listar-consultas-vigencia.md).

## Casos límite

En el calendario del diálogo compartido, la selección se representa con el contorno del día, sin tick. La esquina superior derecha se reserva para una campanita cuando la fecha tiene al menos un evento no rechazado, conforme a [RF-EVT-004 — Mostrar eventos en el calendario](../EVT/rf-evt-004-mostrar-eventos-calendario.md). No se muestran contadores de eventos. Pulsar el día mantiene la acción de seleccionar o retirar la fecha, sin abrir otro detalle.

El mínimo es una opción para cualquier tipo de consulta y el máximo de esta entrega es diez. Si se intenta añadir una fecha ya presente, no se añade una segunda opción con esa fecha. Si alguna fecha ha pasado al confirmar la creación, la consulta no se crea hasta corregirla. El vínculo con el evento puede cambiarse o retirarse mientras la consulta siga abierta. Cambiar solo ese vínculo no cuenta como última modificación del evento.

## Relaciones

- [RN-CON-003 — Mínimo de una opción por consulta](../../02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md)
- [RN-CON-007 — Máximo de diez opciones por consulta](../../02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md)
- [RN-CON-004 — Fecha única entre opciones de una consulta](../../02_reglas-negocio/CON/rn-con-004-fecha-unica-consulta.md)
- [RN-CON-005 — Fechas propuestas desde hoy](../../02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md)
- [RD-CON-003 — Título de la consulta](../../03_datos/CON/rd-con-003-titulo-consulta.md)
- [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md)
- [RD-EVT-002 — Autoría y momentos del evento](../../03_datos/EVT/rd-evt-002-autoria-momentos-evento.md)
- [FLUJO-CON-001 — Crear una consulta de fechas](../../../04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md)
- [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](../../../04_experiencia-usuario/03_wireframes/wf-con-008-calendario-dialogo-consultas-fechas.md)
