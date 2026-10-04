---
id: WF-CON-002
estado: en_revision
---

# WF-CON-002 — Detalle de una consulta abierta

## Flujo

[FLUJO-CON-002 — Responder una consulta abierta](../02_flujos/flujo-con-002-responder-consulta.md); [FLUJO-CON-003 — Resolver una consulta](../02_flujos/flujo-con-003-resolver-consulta.md).

## Estado representado

Consulta de fechas o de opciones de texto abierta dentro de un equipo vigente, bajo una identidad de participante seleccionada.

## Jerarquía

```text
┌──────────────────────────────────┐
│ [Cabecera común del equipo]      │
│ [Volver a Consultas]             │
│ [Título de consulta]             │
│ Estado: Abierta                  │
│                                  │
│ Elige una o varias fechas        │
│ [x] Opción 1  6 votos           │
│ Tú, Ana, Luis (+3)              │
│ [ ] Opción 2  1 voto            │
│ Irene                           │
│ Marcar/desmarcar aplica al acto │
│ (+3) muestra los demás aquí     │
│                                  │
│ [Resolver consulta]              │
└──────────────────────────────────┘
```

## Acciones

- Registrar o cambiar un voto al marcar o desmarcar una o varias opciones mientras la consulta está abierta; toda la tarjeta de la opción es activable, excepto el control «(+N)»/«Ver menos» de votantes. Contadores y votantes se actualizan al momento.
- Seleccionar también una opción cuya fecha ya haya pasado, si la consulta sigue abierta.
- Retirar el voto completo desmarcando la última opción elegida, para volver a quedar sin respuesta.
- Ver directamente hasta tres votantes por opción y activar «(+N)», si existe, para mostrar el resto en la misma fila. La identidad activa, si votó esa opción, figura primero y enfatizada.
- Iniciar la resolución para aceptar una o varias opciones de la consulta o rechazarla, incluso sin votos previos; la selección y confirmación de la resolución se representan en [WF-CON-005 — Confirmar la resolución de una consulta](wf-con-005-confirmar-resolucion.md).

## Notas

**DEFINIDO:** selección múltiple incluso para opciones con fechas ya pasadas mientras la consulta esté abierta; registro y retirada inmediatos al marcar o desmarcar, incluida la retirada completa al desmarcar la última; contador y hasta tres votantes visibles junto a cada opción, con «(+N)» para mostrar los restantes en esa misma opción; identidad activa primero y con énfasis si votó; confirmación de la resolución y cierre de votos al resolver. La consulta cerrada tiene una propuesta separada en [WF-CON-003 — Consulta resuelta o rechazada](wf-con-003-consulta-cerrada.md).
