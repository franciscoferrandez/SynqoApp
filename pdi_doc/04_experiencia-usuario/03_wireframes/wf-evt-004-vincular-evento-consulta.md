---
id: WF-EVT-004
estado: en_revision
---

# WF-EVT-004 — Vincular evento y consulta de fechas

## Flujo

[FLUJO-EVT-003 — Vincular eventos y consultas de fechas](../02_flujos/flujo-evt-003-vincular-evento-consulta.md); [FLUJO-CON-001 — Crear una consulta de fechas](../02_flujos/flujo-con-001-crear-consulta.md); [FLUJO-CON-003 — Resolver una consulta](../02_flujos/flujo-con-003-resolver-consulta.md).

## Estado representado

Equipo vigente con identidad seleccionada. La persona crea una consulta de fechas o resuelve una consulta abierta; alternativamente, rechaza un evento que tiene una consulta abierta vinculada.

## Jerarquía

### Crear una consulta

```text
┌───────────────────────────────┬──────────────────────────────┐
│ Calendario del mes            │ Nueva consulta de fechas     │
│ [Anterior] [Siguiente] [Hoy]  │ Título breve [            ]  │
│                               │ Evento (opcional)            │
│                               │ [Elegir evento          ▼]   │
│ [día] [día elegido] [día]      │                               │
│                               │ Fechas elegidas               │
│                               │ 1. [Fecha]                   │
│                               │ [Cancelar] [Crear consulta]  │
└───────────────────────────────┴──────────────────────────────┘
En móvil, el panel permanece debajo del calendario, como en WF-CON-004.
```

El control permite retirar una selección opcional y dejar la consulta sin evento. Solo ofrece eventos activos (no rechazados) del mismo equipo que no tengan fecha definitiva ni estén vinculados a otra consulta abierta. Los eventos rechazados deben recuperarse antes de ofrecerlos como vínculo nuevo.

### Resolver una consulta vinculada

```text
┌───────────────────────────────────────┐
│ Resolver: [título de consulta]        │
│ Evento: [Título] [Cambiar] [Quitar]   │
│                                       │
│ Elige una fecha                       │
│ [ ] Opción 1 · votos · participantes  │
│ [ ] Opción 2 · votos · participantes  │
│                                       │
│ [Aceptar fecha] [Rechazar consulta]   │
│                                       │
│ Resultado: [resumen]                  │
│ [Cancelar] [Confirmar resolución]     │
└───────────────────────────────────────┘
```

Cuando la consulta no tiene evento, se puede elegir uno al resolver. El vínculo puede cambiarse o quitarse mientras la consulta está abierta. Si queda vinculada al confirmar aceptación, solo se acepta una fecha.

### Avisos antes de resolver

```text
Evento ahora definitivo:
┌──────────────────────────────────────────────┐
│ El evento ya tiene fecha definitiva.         │
│ Resolver esta consulta no cambiará su fecha. │
│ El vínculo se conservará.                    │
│ [Volver] [Confirmar resolución]              │
└──────────────────────────────────────────────┘

Evento rechazado excepcionalmente aún vinculado:
┌──────────────────────────────────────────────┐
│ El evento está rechazado.                    │
│ [Desvincular y resolver aceptando fecha]     │
│ [Rechazar la consulta]                       │
│ [Cancelar]                                   │
└──────────────────────────────────────────────┘
```

Cancelar el segundo aviso deja la consulta y el evento sin cambios. Las frases son contenido explicativo del boceto; la redacción final se ajustará en la SPEC.

### Rechazar evento con consulta abierta vinculada

```text
┌──────────────────────────────────────────────┐
│ Rechazar [Título del evento]                 │
│ Esta consulta de fechas está abierta: [Título]│
│                                              │
│ ( ) Rechazar evento y desvincular consulta   │
│ ( ) Rechazar evento y consulta               │
│                                              │
│ [Cancelar] [Confirmar rechazo]               │
└──────────────────────────────────────────────┘
```

Cancelar no cambia ninguno de los dos. Si se rechazan ambos, la relación queda accesible como relación histórica.

### Fichas relacionadas

```text
Ficha de consulta cerrada:       Ficha de evento:
[Evento relacionado: Título →]   [Consultas relacionadas]
                                 [Consulta cerrada →]
                                 [Consulta cerrada →]
```

La ficha de consulta permite abrir el evento relacionado. La ficha del evento lista todas sus consultas ya cerradas y permite abrir cada una; cada consulta permite regresar a la ficha del evento.

## Acciones

- Al crear una consulta, elegir opcionalmente un evento elegible o dejar el control vacío; cambiarlo o quitarlo antes de confirmar.
- Al resolver una consulta abierta, elegir o cambiar un evento elegible, retirar el vínculo o continuar sin evento.
- Con evento vinculado, seleccionar una sola fecha para aceptar. Si la consulta no está vinculada, se conserva la selección múltiple actual.
- Confirmar la resolución; la fecha aceptada pasa a definitiva en el evento si continúa sin fecha o con fecha provisional.
- Leer el aviso y confirmar la resolución sin cambiar la fecha cuando el evento se haya vuelto definitivo.
- Si el evento está rechazado, elegir exactamente una de las dos acciones ofrecidas o cancelar sin cambios.
- Al rechazar un evento vinculado, elegir entre desvincular la consulta abierta o rechazar también la consulta; confirmar o cancelar sin cambios.
- Abrir las fichas vinculadas desde cualquiera de sus extremos; desde el evento consultar las relaciones cerradas anteriores.

## Estado sin eventos elegibles

Si no hay eventos elegibles, se indica que se puede crear o resolver la consulta sin vínculo; el selector no bloquea el recorrido.

## Notas

**DEFINIDO por requisitos y decisiones aprobadas:** vínculo opcional uno a uno con consulta abierta; solo se ofrecen eventos no rechazados, sin fecha o provisionales, que no estén vinculados a otra consulta abierta; los eventos rechazados deben recuperarse antes de ofrecerlos como vínculo nuevo; el vínculo puede cambiarse o retirarse mientras la consulta siga abierta; las consultas vinculadas requieren una sola fecha aceptada; al aceptar, la fecha queda definitiva en el evento si aún no era definitivo; si el evento ya es definitivo se avisa antes de confirmar y se conserva el vínculo; rechazar la consulta no modifica el evento; las relaciones históricas de consultas cerradas se conservan y son navegables desde ambos lados. Si el evento está rechazado al resolver, las dos salidas son desvincular y aceptar una fecha, o rechazar la consulta. Al rechazar un evento con una consulta abierta, las dos salidas son rechazar el evento y desvincular, o rechazar ambos. Cancelar cualquiera de esos diálogos no cambia los datos.

Las reglas se detallan en [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md), [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md), [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md) y [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md).

**Diseño de interacción concretado en [SPEC-EVT-003 — Vincular eventos y consultas de fechas](../../08_especificaciones/99_archivadas/spec-evt-003-vinculo-evento-consulta.md):** selector opcional, estado sin eventos elegibles, avisos previos a confirmación y navegación entre fichas. La regla de elegibilidad y la excepción para eventos ya vinculados están detalladas en [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md). El acabado visual final sigue el sistema de diseño común.
