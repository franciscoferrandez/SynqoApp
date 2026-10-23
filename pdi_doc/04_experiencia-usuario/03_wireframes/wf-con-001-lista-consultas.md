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
│ Abiertas                         │
│ [Título de consulta] [Abierta]   │
│                                  │
│ Resueltas                        │
│ [Título] [Resuelta]              │
│ Opciones aceptadas: [fechas]     │
│                                  │
│ Rechazadas                       │
│ [Título de consulta] [Rechazada] │
└──────────────────────────────────┘
```

## Acciones

- Abrir cualquier consulta identificada por su título para ver opciones, votos y resolución. En las resueltas, identificar las opciones aceptadas ya en el resumen de la lista.
- Crear desde esta sección una consulta eligiendo «Fechas» o «Texto» antes de abrir su formulario. Ambos tipos llevan título breve y al menos una opción; fechas usa un calendario en diálogo y texto conserva filas editables.
- Cambiar entre las secciones visibles «Calendario» y «Consultas».
- Encontrar primero las consultas abiertas, seguidas por dos grupos visibles de resueltas y rechazadas; dentro de cada estado, verlas de más reciente a más antigua según su fecha de creación.

## Estado sin consultas

Si todavía no existe ninguna consulta, se muestra «Aún no hay consultas» con una explicación breve y un botón «Crear consulta» que ofrece los mismos dos tipos. Los grupos «Abiertas», «Resueltas» y «Rechazadas» no aparecen vacíos. La sección «Calendario» permanece accesible y conserva su entrada de creación de fechas.

## Notas

**DEFINIDO:** cabecera común sobre las dos secciones visibles, títulos escritos al crear consultas, tres grupos visibles en orden «Abiertas», «Resueltas» y «Rechazadas» cuando hay consultas, resumen de opciones aceptadas en cada consulta resuelta y acceso al detalle tanto de resueltas como de rechazadas, y orden descendente por momento de creación dentro de cada grupo según [RD-CON-004 — Momento de creación de la consulta](../../03_requisitos/03_datos/CON/rd-con-004-momento-creacion-consulta.md). Sin consultas se muestra un mensaje breve y «Crear consulta». Elegir «Texto» lleva a [WF-CON-006 — Crear una consulta con opciones de texto](wf-con-006-crear-consulta-texto.md); elegir «Fechas» lleva a [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](wf-con-008-calendario-dialogo-consultas-fechas.md). La entrada adicional desde el calendario se conserva mediante [WF-CON-004 — Crear una consulta de fechas](wf-con-004-crear-consulta-fechas.md). **PROPUESTO:** forma visual de distinguir estados y disposición de la elección del tipo. No se ha definido filtrado ni clasificación mediante etiquetas en esta fase.
