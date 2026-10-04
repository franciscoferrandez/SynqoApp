---
id: FLUJO-DIS-001
estado: en_revision
---

# FLUJO-DIS-001 — Marcar disponibilidad en el calendario

## Actor

[ACT-COO-002 — Usuario con acceso al equipo](../../01_producto/05_actores-personas/act-coo-002-usuario-con-acceso.md) bajo una identidad de participante seleccionada.

## Entrada

Calendario de disponibilidad, primera vista del equipo.

## Precondiciones

El equipo está vigente y hay una identidad de participante seleccionada en el navegador. El día elegido debe ser hoy o posterior para poder cambiar la disponibilidad según [RN-DIS-001 — Disponibilidad diaria del equipo](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md).

## Pasos

1. La persona recorre meses con los controles anterior y siguiente, en la vista de mes natural o en la del mes completado por semanas de lunes a domingo. Puede volver a «Hoy». Activa el día que quiere marcar o modificar, mediante toque o teclado.
2. Synqo abre el detalle del día (en móvil, como diálogo sobre el calendario) y muestra tres tarjetas con los recuentos y participantes agrupados por estado. La tarjeta de la marca propia usa el fondo de ese estado, conserva el borde izquierdo de color común a las tres tarjetas y muestra «Tú» primero con su acento habitual. Si el día admite cambios, esas mismas tarjetas permiten editar.
3. La persona pulsa una tarjeta para indicar o cambiar su marca. Si pulsa la tarjeta propia ya activa, retira la marca vigente y el día vuelve a «sin marcar» para ese participante.
4. El calendario refleja el valor vigente y actualiza inmediatamente el resumen, los recuentos y las listas de participantes del día conforme a [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md).
5. En móvil, la persona puede cerrar el diálogo y volver al día elegido del calendario.

## Resultado

La disponibilidad del participante para ese día queda indicada, modificada o desmarcada con independencia de las consultas. Si cambió el equipo, se reinicia su plazo de caducidad.

## Errores

- Si el equipo ha caducado, no se puede modificar la disponibilidad.
- Si el día ya es pasado en la zona aplicable, se puede consultar su desglose, pero no cambiar ni retirar la marca.
- Si falla el guardado, Synqo restaura la marca anterior en el detalle y el calendario, comunica el fallo y ofrece reintentar la misma acción. El reintento solo puede realizarse si el equipo y el día siguen admitiendo cambios.

## Cancelación

Si se abandona la selección sin elegir un valor, la disponibilidad vigente no cambia.

## RF/RN relacionados

- [RF-DIS-001 — Marcar y modificar disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RN-DIS-001 — Disponibilidad diaria del equipo](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md)
- [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
