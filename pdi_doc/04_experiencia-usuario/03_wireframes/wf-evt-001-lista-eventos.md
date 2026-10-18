---
id: WF-EVT-001
estado: en_revision
---

# WF-EVT-001 — Lista de eventos del equipo

## Flujo

[FLUJO-EVT-001 — Consultar y gestionar eventos](../02_flujos/flujo-evt-001-gestionar-eventos.md).

## Estado representado

Equipo vigente con identidad seleccionada. La pestaña «Eventos» está activa. La lista puede estar vacía o contener eventos en cualquiera de las agrupaciones.

## Jerarquía

```text
┌──────────────────────────────────────────┐
│ [Cabecera común: equipo, identidad, enlace]│
│ [Calendario] [Consultas] [Eventos]        │
│                                           │
│ Eventos                     [+ Crear evento]│
│ Organiza los planes del equipo.           │
│                                           │
│ Sin fecha definitiva                      │
│ [Título] [Provisional]                    │
│ [Fecha provisional, si existe]            │
│                                           │
│ Futuros                                    │
│ [Fecha] [Título] [Definitivo]             │
│                                           │
│ Pasados                                    │
│ [Fecha] [Título] [Definitivo]             │
│                                           │
│ Rechazados                                 │
│ [Título] [Rechazado]                      │
└──────────────────────────────────────────┘
```

En una pantalla estrecha se conserva el orden de lectura y cada tarjeta usa el ancho disponible. La acción «Crear evento» permanece accesible junto al encabezado de la lista.

## Acciones

- Abrir la ficha activando la tarjeta del evento.
- Crear un evento desde la acción principal.
- Cambiar a las demás secciones usando la navegación común del equipo.
- Mantener las agrupaciones y el orden definidos en [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md).

## Estado sin eventos

Si el equipo todavía no tiene eventos, se muestra un mensaje breve que explica que aún no hay eventos y la acción «Crear evento». No se muestran agrupaciones vacías.

Si una agrupación no tiene elementos, se omite esa agrupación.

## Notas

**DEFINIDO:** pestaña propia y agrupaciones conforme a [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md). Se omiten grupos vacíos. Si no hay eventos, se muestra un mensaje y el CTA «Crear evento». La cabecera y navegación del equipo siguen [Estructura inicial del equipo](../01_arquitectura-informacion/estructura-equipo.md).

**PROPUESTO para validar en la SPEC:** disposición de la acción de creación, tarjetas, texto de apoyo y distribución adaptable en móvil. Este Change no representa el calendario ni la integración con consultas.
