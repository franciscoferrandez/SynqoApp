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
│ Consulta de fechas/opciones [☰] │
│ [Título de consulta] [Abierta]  │
│                                  │
│ Elige una o varias fechas        │
│ [x] Opción 1  6 votos           │
│ Tú, Ana, Luis (+3)              │
│ [ ] Opción 2  1 voto            │
│ Irene                           │
│ Marcar/desmarcar aplica al acto │
│ (+3) muestra los demás aquí     │
│                                  │
└──────────────────────────────────┘
```

## Acciones

En consultas abiertas, el menú incluye «Editar consulta»: para texto sigue [WF-CON-007 — Editar una consulta con opciones de texto](wf-con-007-editar-consulta-texto.md); para fechas sigue [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](wf-con-008-calendario-dialogo-consultas-fechas.md). La última edición, cuando exista, se muestra con participante y momento; los votos siguen disponibles fuera del menú. Las consultas cerradas no ofrecen esta acción de edición.

El menú hamburguesa «Acciones de la consulta» se sitúa arriba a la derecha del encabezado. Ofrece «Resolver consulta» mientras está abierta. En consultas de fechas incluye «Elegir evento» sin vínculo, o «Cambiar evento» y «Quitar vínculo» con vínculo. Las consultas cerradas no ofrecen acciones de modificación. Los enlaces a eventos y los votos siguen visibles fuera del menú. Escape o clic exterior cierran el menú; cancelar diálogos devuelve el foco al disparador. Al completar la resolución, el menú desaparece y el foco vuelve a «Volver a Consultas».

- Registrar o cambiar un voto al marcar o desmarcar una o varias opciones mientras la consulta está abierta; toda la tarjeta de la opción es activable, excepto el control «(+N)»/«Ver menos» de votantes. Contadores y votantes se actualizan al momento.
- Seleccionar también una opción cuya fecha ya haya pasado, si la consulta sigue abierta.
- Retirar el voto completo desmarcando la última opción elegida, para volver a quedar sin respuesta.
- Ver directamente hasta tres votantes por opción y activar «(+N)», si existe, para mostrar el resto en la misma fila. La identidad activa, si votó esa opción, figura primero y enfatizada.
- Iniciar la resolución para aceptar una o varias opciones de la consulta o rechazarla, incluso sin votos previos; la selección y confirmación de la resolución se representan en [WF-CON-005 — Confirmar la resolución de una consulta](wf-con-005-confirmar-resolucion.md).

## Notas

**DEFINIDO:** selección múltiple incluso para opciones con fechas ya pasadas mientras la consulta esté abierta; registro y retirada inmediatos al marcar o desmarcar, incluida la retirada completa al desmarcar la última; contador y hasta tres votantes visibles junto a cada opción, con «(+N)» para mostrar los restantes en esa misma opción; identidad activa primero y con énfasis si votó; confirmación de la resolución y cierre de votos al resolver. La consulta cerrada tiene una propuesta separada en [WF-CON-003 — Consulta resuelta o rechazada](wf-con-003-consulta-cerrada.md).
