---
id: FLUJO-CON-001
estado: en_revision
---

# FLUJO-CON-001 — Crear una consulta de fechas

## Actor

[ACT-COO-002 — Usuario con acceso al equipo](../../01_producto/05_actores-personas/act-coo-002-usuario-con-acceso.md) bajo una identidad de participante seleccionada.

## Entrada

Vista de calendario de un equipo vigente; acción «Crear consulta de fechas». El calendario es el punto de entrada, pero la creación no exige seleccionar ni revisar un día antes.

## Precondiciones

El equipo está vigente y hay una identidad de participante seleccionada.

## Pasos

1. La persona pulsa el icono «Crear consulta de fechas» dentro del calendario. El día que estuviera seleccionado se deselecciona y el detalle del día deja paso al panel de creación, debajo del calendario en móvil.
2. Escribe un título de hasta 250 caracteres. Pulsa días de hoy en adelante para añadirlos y vuelve a pulsarlos para retirarlos. Puede recorrer varios meses; el panel mantiene la selección ordenada por fecha e indica que admite hasta diez opciones.
3. Pulsa «Crear consulta» con al menos una fecha y confirma la creación. La consulta queda abierta y aparece en «Consultas».

## Resultado

Existe una consulta abierta del equipo con título y al menos una opción de fecha. Su creación reinicia el plazo de caducidad del equipo.

## Errores

- Sin título o sin fechas, no se puede crear la consulta según [RN-CON-003 — Mínimo de una opción por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md).
- Pulsar una fecha elegida la retira, por lo que no se crean duplicados.
- Al llegar a diez fechas, no se añade una undécima según [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md).
- Si alguna opción corresponde a un día anterior a hoy en la zona aplicable al confirmar, se solicita corregirla y no se crea la consulta.
- Si el equipo ha caducado, no se puede crear la consulta.

## Cancelación

La persona puede cancelar desde el panel. Si el título no tiene texto y no hay fechas, vuelve directamente al calendario. Si hay título o fechas, se abre una confirmación con «Seguir editando» como acción enfocada inicialmente y «Abandonar edición» para descartar. Seguir editando conserva el borrador; abandonar vuelve al calendario sin nueva consulta. No se ha definido persistencia de borradores tras salir de la vista.

## RF/RN relacionados

- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RN-CON-003 — Mínimo de una opción por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md)
- [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md)
- [RN-CON-004 — Fecha única entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-004-fecha-unica-consulta.md)
- [RN-CON-005 — Fechas propuestas desde hoy](../../03_requisitos/02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md)
- [RD-CON-003 — Título de la consulta](../../03_requisitos/03_datos/CON/rd-con-003-titulo-consulta.md)
