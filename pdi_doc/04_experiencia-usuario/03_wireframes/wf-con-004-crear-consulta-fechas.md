---
id: WF-CON-004
estado: en_revision
---

# WF-CON-004 — Crear una consulta de fechas

## Flujo

[FLUJO-CON-001 — Crear una consulta de fechas](../02_flujos/flujo-con-001-crear-consulta.md).

## Estado representado

Equipo vigente bajo una identidad seleccionada. La persona ha pulsado el icono de crear consulta de fechas dentro del calendario. La selección empieza vacía y el día que estuviera abierto queda deseleccionado.

## Jerarquía

```text
┌───────────────────────────────┬──────────────────────────────┐
│ Calendario del mes            │ Nueva consulta de fechas     │
│ [Anterior] [Siguiente] [Hoy]  │ Título breve [            ]  │
│                               │ Hasta 10 fechas              │
│                               │ Fechas elegidas, en orden    │
│ [día] [día elegido] [día]      │ 1. [Fecha]                  │
│ [día] [día] [día elegido]      │ 2. [Fecha]                  │
│                               │ [Cancelar] [Crear consulta] │
└───────────────────────────────┴──────────────────────────────┘
En móvil, el panel de creación se muestra debajo del calendario.
```

## Acciones

- Escribir el título y pulsar días de hoy en adelante para añadirlos; volver a pulsar un día elegido para retirarlo.
- Cambiar de mes sin perder la selección. La lista mantiene orden cronológico y cada fecha figura una sola vez.
- Mostrar una anotación discreta del máximo de diez fechas e impedir añadir una undécima; retirar una fecha permite elegir otra.
- Crear con título y al menos una fecha, tras una confirmación; la consulta aparece en «Consultas».
- Cancelar directamente si no hay título ni fechas. Con título o fechas, mostrar confirmación con «Seguir editando» como opción enfocada inicialmente y «Abandonar edición»; seguir editando conserva el borrador.
- Si al confirmar una fecha ya pasó en la zona aplicable, impedir la creación y señalarla para corregirla.

## Notas

**DEFINIDO:** selección manual en el propio calendario, panel de creación sustituyendo al detalle diario, panel debajo del calendario en móvil, título de hasta 250 caracteres, entre una y diez fechas, anotación visible del máximo, sin duplicados, confirmación para crear y confirmación condicional para cancelar. Las fechas admisibles son de hoy en adelante según la zona del dispositivo o la del equipo como respaldo. No se ha definido persistencia de borradores tras abandonar la vista.
