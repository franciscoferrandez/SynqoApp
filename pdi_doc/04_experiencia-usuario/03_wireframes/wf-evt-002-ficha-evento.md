---
id: WF-EVT-002
estado: en_revision
---

# WF-EVT-002 — Ficha y edición de evento

## Flujo

[FLUJO-EVT-001 — Consultar y gestionar eventos](../02_flujos/flujo-evt-001-gestionar-eventos.md).

## Estado representado

La persona ha abierto un evento desde la lista. La ficha puede estar en consulta, edición o recuperación desde la agrupación de rechazados.

## Jerarquía

```text
┌──────────────────────────────────────────┐
│ [Cabecera común: equipo, identidad, enlace]│
│ [Volver a Eventos]                       │
│                                          │
│ [Título del evento]       [Estado]       │
│                                          │
│ Fecha                                    │
│ 14 oct 2026                              │
│                                          │
│ Notas                                    │
│ Texto de las notas, si existe.           │
│                                          │
│ Creado por [participante] · [momento]    │
│ Modificado por [participante] · [momento]│
│ (solo tras un cambio real)               │
│                                          │
│ [Editar] [Rechazar]                      │
└──────────────────────────────────────────┘
```

Para un evento rechazado, la ficha conserva sus datos, indica «Rechazado» y ofrece «Recuperar». No ofrece edición hasta que se recupere.

La edición propuesta ocupa el mismo espacio de contenido, manteniendo la cabecera común y el regreso a «Eventos»:

```text
┌──────────────────────────────────────────┐
│ [Cabecera común del equipo]              │
│ [Cancelar y volver a ficha]              │
│ Editar evento                            │
│                                          │
│ Título*                                  │
│ [____________________________________]   │
│                                          │
│ Notas                                    │
│ [____________________________________]   │
│ [____________________________________]   │
│                                          │
│ Fecha                                    │
│ [Sin fecha / selector de fecha]          │
│ Estado                                   │
│ [Provisional / Definitivo, si hay fecha] │
│                                          │
│ [Guardar cambios]                        │
└──────────────────────────────────────────┘
```

La creación utiliza los mismos campos con encabezado «Crear evento» y acción «Crear evento». La fecha puede quedar vacía. Al crear con fecha, «Provisional» aparece seleccionado por defecto y se puede elegir «Definitivo». Se admite una fecha pasada. Sin fecha el estado activo es provisional según [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md); en ese caso se muestra como valor fijo.

En móvil, los campos y botones se apilan en una columna y ocupan el ancho disponible. Los errores se muestran junto al campo o acción correspondiente.

## Acciones

- Volver a la lista sin modificar el evento.
- Editar título, notas, fecha y estado; guardar los cambios o cancelar.
- Rechazar un evento activo mediante una confirmación; si se cancela, el evento no cambia.
- Recuperar un evento rechazado mediante una confirmación; si se cancela, el evento no cambia. Al recuperarlo conserva su fecha y pasa a provisional.
- Consultar participante y momento de creación y, tras una modificación real, participante y momento de última modificación.

## Estado sin datos opcionales

Si el evento no tiene fecha, se muestra «Sin fecha». Si no tiene notas, se omite el bloque de notas. Si nunca se ha modificado, no se presenta la sección de última modificación.

## Notas

**DEFINIDO por requisitos:** título obligatorio de hasta 250 caracteres, notas de texto plano opcionales de hasta 5000 caracteres, fecha opcional, estado provisional por defecto al crear con fecha, edición de los campos desde la ficha, autoría y momentos, y ciclo de rechazo y recuperación. Las reglas detalladas están en [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md), [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md), [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md) y [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md).

**DEFINIDO:** omitir el bloque de notas cuando no haya notas; confirmar el rechazo y la recuperación; si se cancela cualquiera de esas confirmaciones, no cambiar el evento.

**PROPUESTO para validar en la SPEC:** editar en la misma vista de ficha y disponer los campos en una columna. **DEFINIDO:** sin fecha, el estado activo se muestra fijo como provisional; se omite la última modificación hasta que ocurra un cambio real. Las confirmaciones al salir de la creación o edición con cambios sin guardar quedan resueltas en [FLUJO-EVT-001 — Consultar y gestionar eventos](../02_flujos/flujo-evt-001-gestionar-eventos.md).

Este Change no muestra enlaces de consultas relacionadas ni el caso de rechazo con consulta abierta; la integración de consultas queda fuera de su alcance.
