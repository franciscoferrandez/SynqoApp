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
│ Activos                                   │
│ [Título] [Estado real]                    │
│ [Fecha del evento, si existe]             │
│ Vigencia: [fecha de vigencia]             │
│ [Resto de eventos activos]                │
│                                           │
│ Archivados                                │
│ [Título] [Estado real]                    │
│ [Fecha del evento, si existe]             │
│ Vigencia: [fecha de vigencia]             │
│ [Resto de archivados cargados]            │
│ [Cargar más, si quedan resultados]        │
└──────────────────────────────────────────┘
```

En una pantalla estrecha se conserva el orden de lectura y cada tarjeta usa el ancho disponible. La acción «Crear evento» permanece accesible junto al encabezado de la lista.

## Acciones

- Abrir la ficha activando la tarjeta del evento.
- Crear un evento desde la acción principal.
- Cargar más archivados conservando los que ya están visibles; durante la carga se evita repetir la acción y, si falla, se permite reintentar sin perder resultados.
- Cambiar a las demás secciones usando la navegación común del equipo.
- Mantener las agrupaciones y el orden definidos en [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md).

## Estado sin eventos

Si el equipo todavía no tiene eventos, se muestra un mensaje breve que explica que aún no hay eventos y la acción «Crear evento». No se muestran agrupaciones vacías.

Si Activos no tiene elementos, se omite esa lista. Archivados se omite sólo si no contiene elementos visibles ni quedan archivados anteriores: cuando la ventana reciente está vacía pero existe historial, se mantiene accesible «Cargar más».

## Notas

**DEFINIDO:** pestaña propia y agrupaciones conforme a [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md). Si no hay eventos, se muestra un mensaje y el CTA «Crear evento». La cabecera y navegación del equipo siguen [Estructura inicial del equipo](../01_arquitectura-informacion/estructura-equipo.md).

Activos y Archivados no sustituyen la etiqueta del estado real en las tarjetas. Cada tarjeta muestra «Vigencia» y la fecha usada para ordenarla. La carga inicial incluye todos los archivados de la ventana reciente; cada activación de «Cargar más» añade el bloque de archivados anteriores definido en el requisito de listado.

**PROPUESTO para validar en la SPEC:** disposición de la acción de creación, tarjetas, texto de apoyo y distribución adaptable en móvil. Este Change no representa el calendario ni la integración con consultas.
