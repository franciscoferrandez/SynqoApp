---
id: WF-CON-006
estado: en_revision
---

# WF-CON-006 — Crear una consulta con opciones de texto

## Flujo

[FLUJO-CON-004 — Crear una consulta con opciones de texto](../02_flujos/flujo-con-004-crear-consulta-texto.md).

## Estado representado

Equipo vigente bajo una identidad seleccionada. La persona abre el diálogo «Crear consulta» desde «Consultas».

## Jerarquía

```text
┌───────────────────────────────────────────┐
│ Nueva consulta                         [×] │
│ Título breve [                         ]  │
│ Opciones · hasta 10                       │
│ [Texto de opción]             [×]        │
│ [Texto de opción]             [×]        │
│ [+ Añadir opción]                         │
│                 [Cancelar] [Crear consulta]│
└───────────────────────────────────────────┘
Al crear se abre una confirmación. Al cancelar solo se abre si el título o alguna opción tienen texto; presenta «Seguir editando» como opción enfocada inicialmente y «Abandonar edición». Sin texto, cancelar cierra directamente.
```

## Acciones

- Escribir un título y al menos una opción de texto no vacía.
- Añadir opciones, editar directamente su texto y eliminar filas.
- Mostrar una anotación discreta del máximo de diez opciones e impedir añadir una undécima. El título se limita a 250 caracteres y cada opción a 50 en los campos, sin contadores ni avisos de longitud al escribir.
- Las opciones permanecen en el orden en que se añaden; no hay controles para reordenarlas.
- Si dos opciones se duplican según [RN-CON-006 — Texto único entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md), se indica cuál debe corregirse y no se confirma la creación hasta que sean distintas.
- Confirmar creación para publicar la consulta abierta. Cancelar directamente sin texto o confirmar «Abandonar edición» cuando hay texto. «Seguir editando» conserva el borrador.

## Notas

**DEFINIDO:** diálogo desde «Consultas», título de hasta 250 caracteres, opciones textuales de hasta 50 caracteres editables y eliminables, entre una y diez opciones según [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md), anotación visible del máximo, textos únicos según [RN-CON-006 — Texto único entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md), confirmación al crear y confirmación condicional al cancelar. Comparte votación múltiple, visibilidad de votos y resolución con las consultas de fechas.
