---
id: FLUJO-CON-001
estado: en_revision
---

# FLUJO-CON-001 — Crear una consulta de fechas

## Actor

[ACT-COO-002 — Usuario con acceso al equipo](../../01_producto/05_actores-personas/act-coo-002-usuario-con-acceso.md) bajo una identidad de participante seleccionada.

## Entrada

Vista de calendario de un equipo vigente; acción «Crear consulta de fechas». Este flujo conserva la entrada del calendario principal y no exige seleccionar ni revisar un día antes. La entrada adicional desde Consultas se define en [FLUJO-CON-006 — Crear una consulta de fechas desde Consultas](flujo-con-006-crear-consulta-fechas-desde-consultas.md).

## Precondiciones

El equipo está vigente y hay una identidad de participante seleccionada.

## Pasos

1. La persona pulsa el icono «Crear consulta de fechas» dentro del calendario. Se abre directamente el diálogo de fechas compartido, sin elegir tipo, en el mismo mes visible y sin fechas seleccionadas. El día abierto en el calendario de fondo no se incluye automáticamente.
2. Escribe un título de hasta 250 caracteres. Pulsa días de hoy en adelante para añadirlos y vuelve a pulsarlos para retirarlos. Puede recorrer varios meses dentro del diálogo sin alterar el mes del calendario de fondo. Las fechas incluidas quedan marcadas sin lista apilada ni contadores; el máximo se comunica como instrucción fija. Se aplican las preferencias guardadas, selección sin tick y campanita de eventos del [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](../03_wireframes/wf-con-008-calendario-dialogo-consultas-fechas.md).
3. Opcionalmente activa «Crear evento provisional». No elige un evento existente: al confirmar se creará uno sin fecha, con el mismo título de la consulta. Desactivar el switch conserva la creación de una consulta sin evento.
4. Pulsa «Crear consulta» con al menos una fecha; se guarda directamente sin confirmación general. La consulta y, si se activó el switch, el evento y su vínculo se guardan juntos. Se actualiza la caducidad del equipo y se navega a la lista de Consultas, con la nueva consulta en Abiertas y manteniendo el valor de acceso.

## Resultado

Existe una consulta abierta del equipo con título y al menos una opción de fecha. Su creación reinicia el plazo de caducidad del equipo.

## Errores

- Sin título o sin fechas, no se puede crear la consulta según [RN-CON-003 — Mínimo de una opción por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md).
- Pulsar una fecha elegida la retira, por lo que no se crean duplicados.
- Al llegar a diez fechas, no se añade una undécima según [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md).
- Si alguna opción corresponde a un día anterior a hoy en la zona aplicable al confirmar, se solicita corregirla y no se crea la consulta.
- Si el equipo ha caducado, no se puede crear la consulta.

## Cancelación

La persona puede cancelar o pulsar Escape en el diálogo. Si el título no tiene texto y no hay fechas, vuelve directamente al calendario. Si hay título o fechas, se abre una confirmación con «Seguir editando» como acción enfocada inicialmente y «Descartar cambios» para abandonar. Seguir editando conserva el borrador; descartar vuelve al calendario de fondo con su mes, día y preferencias intactos y sin nueva consulta. El foco vuelve al botón de creación. No se ha definido persistencia de borradores tras salir de la vista.

## RF/RN relacionados

- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RN-CON-003 — Mínimo de una opción por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md)
- [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md)
- [RN-CON-004 — Fecha única entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-004-fecha-unica-consulta.md)
- [RN-CON-005 — Fechas propuestas desde hoy](../../03_requisitos/02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md)
- [RD-CON-003 — Título de la consulta](../../03_requisitos/03_datos/CON/rd-con-003-titulo-consulta.md)
