---
id: WF-CON-005
estado: en_revision
---

# WF-CON-005 — Confirmar la resolución de una consulta

## Flujo

[FLUJO-CON-003 — Resolver una consulta](../02_flujos/flujo-con-003-resolver-consulta.md).

## Estado representado

Consulta abierta de un equipo vigente. La persona ha iniciado su resolución bajo una identidad de participante seleccionada.

## Jerarquía

```text
┌──────────────────────────────────┐
│ Resolver: [título de consulta]   │
│ Actúas como: [participante]      │
│                                  │
│ Todas inicialmente sin marcar    │
│ [ ] Opción 1 · 3 votos · Ana...  │
│ [ ] Opción 2 · 1 voto · Luis     │
│ [+N] muestra votantes restantes  │
│ [Aceptar seleccionadas]          │
│ [Rechazar consulta]              │
│                                  │
│ Antes de registrar:              │
│ [Resultado elegido]              │
│ Esta consulta dejará de admitir  │
│ votos y no se reabrirá.          │
│                                  │
│ [Cancelar] [Confirmar resolución]│
└──────────────────────────────────┘
```

## Acciones

- Abrir un diálogo con todas las opciones inicialmente sin marcar, cada una con recuento y hasta tres votantes; «(+N)» muestra los restantes en la misma opción. Elegir aceptar una o varias opciones de la consulta o rechazarla.
- Revisar el resultado y la identidad activa antes de confirmarlo.
- Confirmar para registrar la resolución y abrir [WF-CON-003 — Consulta resuelta o rechazada](wf-con-003-consulta-cerrada.md).
- Cancelar la confirmación para mantener la consulta abierta sin cambiarla.

## Notas

**DEFINIDO:** aceptación de una o varias opciones o rechazo, incluso sin votos; diálogo de selección con todas las opciones inicialmente sin marcas de aceptación, recuentos y votantes públicos; confirmación previa; atribución a la identidad activa; cierre de votos y ausencia de reapertura. La selección para resolver es independiente del voto propio del participante.
