---
id: FLUJO-CON-004
estado: en_revision
---

# FLUJO-CON-004 — Crear una consulta con opciones de texto

## Actor

[ACT-COO-002 — Usuario con acceso al equipo](../../01_producto/05_actores-personas/act-coo-002-usuario-con-acceso.md) bajo una identidad de participante seleccionada.

## Entrada

Sección «Consultas» de un equipo vigente; acción «Crear consulta».

## Precondiciones

El equipo está vigente y hay una identidad de participante seleccionada.

## Pasos

1. La persona pulsa «Crear consulta» desde «Consultas» y se abre un diálogo.
2. Escribe un título de hasta 250 caracteres y hasta diez opciones de texto de 50 caracteres cada una. Puede añadir filas, editar el texto en cada una y eliminar opciones; el diálogo indica el máximo de diez opciones.
3. Pulsa «Crear consulta» y confirma la creación. La consulta aparece abierta y el equipo puede votarla.

## Resultado

Existe una consulta abierta con título y al menos una opción de texto. Su creación reinicia el plazo de caducidad del equipo.

## Errores

- Si falta título, no hay opciones o queda alguna opción vacía, se indica qué completar y no se crea la consulta.
- Si hay dos opciones de texto duplicadas según [RN-CON-006 — Texto único entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md), se pide modificar una y no se crea la consulta mientras coincidan.
- Al llegar a diez opciones, no se permite añadir una más según [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md). Los campos limitan la longitud de entrada sin contadores ni avisos de longitud durante la escritura.
- Si el equipo ha caducado, no se crea la consulta.

## Cancelación

La persona puede cancelar sin confirmación cuando ni el título ni ninguna opción tienen texto. Si hay texto en cualquiera de ellos, se abre una confirmación con «Seguir editando» como acción enfocada inicialmente y «Abandonar edición» para descartar. Seguir editando conserva lo escrito; abandonar cierra el diálogo sin crear una consulta. No se ha definido persistencia de borradores tras salir de la vista.

## RF/RN relacionados

- [RF-CON-005 — Crear una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-005-crear-consulta-texto.md)
- [RN-CON-003 — Mínimo de una opción por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md)
- [RN-CON-006 — Texto único entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md)
- [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
