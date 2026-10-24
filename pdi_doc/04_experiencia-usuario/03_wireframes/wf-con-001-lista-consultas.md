---
id: WF-CON-001
estado: en_revision
---

# WF-CON-001 — Lista de consultas del equipo

## Flujo

[FLUJO-CON-004 — Crear una consulta con opciones de texto](../02_flujos/flujo-con-004-crear-consulta-texto.md); [FLUJO-CON-002 — Responder una consulta abierta](../02_flujos/flujo-con-002-responder-consulta.md); [FLUJO-CON-003 — Resolver una consulta](../02_flujos/flujo-con-003-resolver-consulta.md).

## Estado representado

Equipo vigente bajo una identidad seleccionada. Se ha abierto la sección visible «Consultas».

## Jerarquía

```text
┌──────────────────────────────────┐
│ [Nombre del equipo]     [Enlace]  │
│ Participas como: [Nombre ▼]      │
│ Caduca: [fecha local]            │
│                                  │
│ [Calendario]       [Consultas]   │
│                                  │
│ [Crear consulta]                 │
│                                  │
│ Activas · vigencia ascendente     │
│ [Título de consulta] [Abierta]   │
│ Vigencia: [fecha]                │
│                                  │
│ [Título] [Resuelta]              │
│ Vigencia: [fecha]                │
│ Opciones aceptadas: [fechas]     │
│                                  │
│ Archivadas · vigencia descendente│
│ [Título de consulta] [Rechazada] │
│ Vigencia: [fecha]                │
│ [Título fechas vencidas][Abierta]│
│ Vigencia: [última fecha ofrecida]│
│ [Cargar más] si queda historial  │
└──────────────────────────────────┘
```

## Acciones

- Abrir cualquier consulta identificada por su título para ver opciones, votos y resolución. En las resueltas, identificar las opciones aceptadas ya en el resumen de la lista.
- Crear desde esta sección una consulta de opciones de texto: «Crear consulta» abre directamente el diálogo con título breve y filas editables, sin selector de tipo. Las consultas de fechas se crean únicamente desde el botón del calendario; las existentes siguen disponibles en la lista y conservan su edición desde la ficha.
- Cambiar entre las secciones visibles «Calendario» y «Consultas».
- Consultar todas las «Activas» por vigencia ascendente y las «Archivadas» por vigencia descendente, conforme a [RF-CON-008 — Listar consultas por vigencia](../../03_requisitos/01_funcionales/CON/rf-con-008-listar-consultas-vigencia.md). Cada tarjeta muestra «Vigencia» con su fecha y conserva el badge del estado real.
- Ver inicialmente todas las archivadas de hoy y los seis días anteriores en la zona del equipo; «Cargar más» añade diez anteriores por pulsación, o las restantes. Mostrar carga en curso y evitar pulsaciones duplicadas. Ante error, conservar las tarjetas y ofrecer reintento sin duplicar resultados.
- Mantener accesible «Cargar más» aunque la ventana reciente no tenga elementos si existe historial anterior. Ocultar el botón cuando se agote, y omitir una sección vacía solo si tampoco ofrece historial cargable.
- Una consulta abierta archivada sigue admitiendo sus acciones vigentes desde la ficha. Al actualizarla o resolverla se recalcula su ubicación; las listas no introducen nuevos estados.

## Estado sin consultas

Si no existe ninguna consulta ni historial cargable, se muestra «Aún no hay consultas» con una explicación breve y un botón «Crear consulta» que abre directamente el mismo formulario de opciones de texto que la acción de cabecera. Una ventana reciente vacía con historial no activa este estado. La sección «Calendario» permanece accesible y es la única entrada de creación de fechas.

## Notas

**DEFINIDO:** por petición y respuestas del 2026-10-24, dos listas de vigencia calculada según el requisito enlazado sustituyen los tres grupos por estado. Se conservan títulos, estado real, resumen de aceptadas y acceso a las fichas de ambos tipos. Ambas acciones de creación abren directamente [WF-CON-006 — Crear una consulta con opciones de texto](wf-con-006-crear-consulta-texto.md), sin elección de tipo. Las fechas se crean exclusivamente mediante [WF-CON-004 — Crear una consulta de fechas](wf-con-004-crear-consulta-fechas.md); la edición desde la ficha sigue [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](wf-con-008-calendario-dialogo-consultas-fechas.md). No se añaden filtros ni etiquetas persistidas.
