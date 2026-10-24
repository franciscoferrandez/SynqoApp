---
id: WF-CON-004
estado: en_revision
---

# WF-CON-004 — Crear una consulta de fechas

## Flujo

[FLUJO-CON-001 — Crear una consulta de fechas](../02_flujos/flujo-con-001-crear-consulta.md).

## Estado representado

Equipo vigente bajo una identidad seleccionada. La persona ha pulsado el icono de crear consulta de fechas dentro del calendario. Se abre directamente el diálogo compartido en el mes visible, sin fechas incluidas; el día abierto no se añade automáticamente.

Esta entrada reutiliza [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](wf-con-008-calendario-dialogo-consultas-fechas.md), sin el paso de elección de tipo. Sustituye el panel de construcción anterior, también en móvil.

## Jerarquía

```text
Calendario principal · mes visible · botón Crear consulta de fechas
                         ↓
Diálogo Nueva consulta de fechas
Título breve [                                  ]
Fechas · hasta diez
[Anterior] [Mes visible al abrir] [Siguiente] [Hoy si procede]
[Calendario del equipo: selección por contorno, campanita, sin contadores]
[ ] Crear evento provisional
[Cancelar] [Crear consulta]
                         ↓ guardar directamente
Lista de Consultas · nueva consulta según vigencia calculada
```

## Acciones

- Escribir el título y pulsar días de hoy en adelante para añadirlos; volver a pulsar un día elegido para retirarlo. El mes y la selección del diálogo son independientes del calendario de fondo.
- Cambiar de mes sin perder selección. Las fechas incluidas se indican por contorno, sin tick ni lista apilada. Se aplican preferencias guardadas del equipo; la esquina se reserva a la campanita de eventos, sin recuentos.
- Mostrar la instrucción fija del máximo de diez fechas e impedir añadir una undécima; retirar una fecha permite elegir otra.
- Guardar directamente con título y al menos una fecha; navegar a la lista de Consultas conservando acceso e identidad del equipo y actualizando su caducidad.
- La consulta se ubica según [RF-CON-008 — Listar consultas por vigencia](../../03_requisitos/01_funcionales/CON/rf-con-008-listar-consultas-vigencia.md), sin forzar Activas si el día admitido por la zona del dispositivo ya ha vencido en la del equipo.
- Cancelar/Escape directamente si no hay título ni fechas. Con cambios, confirmar con «Seguir editando» enfocado inicialmente y «Descartar cambios». Volver al calendario de fondo preservando mes, día y preferencias; devolver foco al botón de creación.
- Si una fecha ya pasó al guardar, impedir la creación y conservar el borrador para corregirla. Los fallos de lectura/escritura del diálogo compartido ofrecen reintento sin perder cambios.

## Notas

**DEFINIDO:** respuestas expresas de la persona impulsora del 2026-10-21: reutilizar el diálogo, comenzar en el mes visible, sin fechas preseleccionadas y continuar en la lista de Consultas. Se aplican título, límites, fechas admisibles, evento opcional y guardado del [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md). No se define persistencia de borradores tras abandonar la vista.
