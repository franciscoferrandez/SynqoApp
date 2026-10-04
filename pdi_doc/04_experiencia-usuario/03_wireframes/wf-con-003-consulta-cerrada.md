---
id: WF-CON-003
estado: en_revision
---

# WF-CON-003 — Consulta resuelta o rechazada

## Flujo

[FLUJO-CON-003 — Resolver una consulta](../02_flujos/flujo-con-003-resolver-consulta.md).

## Estado representado

Consulta de fechas o de opciones de texto de un equipo vigente, cerrada mediante aceptación de una o varias opciones o mediante rechazo.

## Jerarquía

```text
┌──────────────────────────────────┐
│ [Cabecera común del equipo]      │
│ [Volver a Consultas]             │
│ [Título de consulta]             │
│ Estado: Resuelta / Rechazada     │
│                                  │
│ Resultado                        │
│ [Opciones aceptadas / Rechazo]   │
│ Resolvió: [participante]         │
│                                  │
│ Opción 1           [3 votos]     │
│ Opción 2           [1 voto]      │
│ Hasta 3 votantes y (+N)          │
└──────────────────────────────────┘
```

## Acciones

- Ver el resultado registrado de la consulta.
- Ver qué participante registró la resolución.
- Ver el recuento y hasta tres votantes de cada opción; si hay más, activar «(+N)» para ver los restantes en la misma opción.
- Volver a la sección «Consultas» del equipo.

## Notas

**DEFINIDO:** la consulta cerrada muestra el resultado y quién lo registró, no admite votos nuevos ni cambios de voto y no se reabre en esta fase; las votaciones son públicas dentro del equipo. **PROPUESTO:** orden de resultado, opciones y contadores en pantalla. El posible rechazo posterior de una resolución sigue fuera del alcance definido.
