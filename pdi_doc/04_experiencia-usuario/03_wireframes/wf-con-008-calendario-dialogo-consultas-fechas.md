---
id: WF-CON-008
estado: en_revision
---

# WF-CON-008 — Crear y editar consultas de fechas en un diálogo

## Flujo

[FLUJO-CON-006 — Crear una consulta de fechas desde Consultas](../02_flujos/flujo-con-006-crear-consulta-fechas-desde-consultas.md); [FLUJO-CON-007 — Editar una consulta de fechas](../02_flujos/flujo-con-007-editar-consulta-fechas.md).

## Estado representado

Creación tras elegir «Fechas» desde Consultas o directamente desde el botón del calendario, y edición desde el menú de una consulta de fechas abierta. La creación comienza sin selección; desde Calendario abre su mes visible y desde Consultas el mes de hoy. La edición carga las fechas actuales, también pasadas.

## Jerarquía

```text
Crear consulta (paso previo al formulario)
¿Qué quieres consultar?
[Fechas] [Texto]

Nueva consulta de fechas / Editar consulta
Título [                                      ]
Fechas · hasta diez
Disponibilidad del equipo
[Anterior] [Mes y año] [Siguiente] [Hoy si procede]
 Lu    Ma    Mi    Ju    Vi    Sá    Do
[día] [día] [día] [día] [día] [día] [día]
      [fecha incluida: contorno de selección, sin tick]
      [esquina superior derecha: campanita si hay evento]
      [estado del equipo: icono/texto y color]
Pulsa una fecha para incluirla o retirarla.
[ ] Crear evento provisional (solo creación)
[Cancelar] [Crear consulta / Guardar consulta]

Solo al retirar opciones con votos:
Retirar fechas y sus votos
[Fechas que se retirarán]
Se eliminarán estas opciones y todos sus votos.
Las demás selecciones se conservan.
[Volver a editar] [Retirar fechas y guardar]
```

## Acciones

- Seleccionar fechas por casilla sin abrir detalle de disponibilidad ni alterar marcas. Conservar selecciones entre meses, sin listado apilado ni recuento de fechas elegidas. El máximo se comunica como instrucción fija, no como contador.
- Usar las preferencias guardadas de semanas completas y regla del equipo; no ofrecer menú de preferencias, modo propio, solapa ni números de disponibilidad o votos. Los números del día y del año identifican fechas; no son contadores. Las casillas muestran únicamente el color y resultado de la regla, incluido neutro cuando no hay marcas, más la selección del borrador.
- Distinguir selección y disponibilidad también sin color: contorno y estado accesible para selección, sin tick; foco de teclado independiente. Reservar la esquina superior derecha para una campanita si hay eventos no rechazados, sin contador, conforme a [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md). Los controles y estados deben cumplir [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md).
- Al crear: fechas desde hoy, switch opcional de evento provisional con mismo título y sin fecha, y guardado directo desde ambas entradas. El formulario de texto conserva su confirmación. Desde Calendario no se elige tipo; al guardar se abre la lista de Consultas. Cancelar conserva mes, día y preferencias del calendario de fondo y devuelve el foco al botón que abrió el formulario.
- Al editar: retirar fechas originales incluso pasadas, deshacer la retirada recuperando identidad y votos, y añadir fechas nuevas desde hoy. Guardar directamente salvo retiradas votadas, que exigen confirmación. No trasladar votos al sustituir una fecha.
- Cancelar/Escape conserva el patrón de edición de texto: directo sin cambios; confirmación de descarte con cambios. Foco inicial en título, retorno al disparador al cerrar y conservación del borrador ante errores o al volver desde confirmaciones.
- Adaptar a móvil manteniendo legibles las casillas y acciones; usar desplazamiento interior si hace falta. La persona impulsora aprueba el ejemplo con el ajuste de selección sin tick y campanita de eventos el 2026-10-21; este wireframe registra su jerarquía y comportamiento.

## Notas

Reglas en [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md) y [RF-CON-007 — Editar una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-007-editar-consulta-fechas.md). [WF-CON-004 — Crear una consulta de fechas](wf-con-004-crear-consulta-fechas.md) concreta el contexto inicial y la navegación de la entrada desde el calendario principal. Se mantienen los tokens y temas del sistema de diseño existente.
