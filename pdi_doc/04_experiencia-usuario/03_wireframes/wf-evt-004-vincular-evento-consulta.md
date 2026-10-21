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
│                               │ [○] Crear evento provisional │
│                               │ Mismo título, sin fecha      │
│ [día] [día elegido] [día]      │                               │
│                               │ Fechas elegidas               │
│                               │ 1. [Fecha]                   │
│                               │ [Cancelar] [Crear consulta]  │
└───────────────────────────────┴──────────────────────────────┘
En móvil, el panel permanece debajo del calendario, como en WF-CON-004.
```

El switch es opcional y comienza desactivado. Activarlo crea al confirmar un evento provisional sin fecha y con el mismo título de la consulta, asociado a ella. No hay selector de eventos existentes. Cancelar o fallar no crea parcialmente la consulta ni el evento.

### Mantener el vínculo desde la ficha

En una consulta de fechas abierta, el menú hamburguesa del encabezado ofrece «Elegir evento» si no hay vínculo, o «Cambiar evento» y «Quitar vínculo» si existe. El evento vinculado sigue visible como enlace en la ficha. «Cambiar evento» abre el editor con el evento actual seleccionado, también después de cargar o reintentar las opciones. Si el actual ya no es elegible para vínculos nuevos, sigue figurando como vínculo actual. Sin vínculo, el editor empieza en «Sin evento»; «Quitar vínculo» también inicia esa selección explícitamente. Guardar confirma la elección; cancelar no modifica el vínculo. Guardar el valor actual lo conserva.

### Resolver una consulta vinculada

```text
┌───────────────────────────────────────┐
│ Resolver: [título de consulta]        │
│ Evento asociado: [Título]            │
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

La etiqueta es informativa: no hay selector ni acciones para elegir, cambiar o retirar el evento dentro del modal. Si no hay vínculo, se omite por completo esa fila y se conserva la aceptación de varias fechas. Para resolver sin afectar al evento hay que retirar previamente el vínculo desde la ficha de la consulta abierta. Con vínculo solo se acepta una fecha, según las reglas de estado del evento.

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
│ Para aceptar sin evento, cancela y quita     │
│ el vínculo desde la ficha de la consulta.   │
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

- Al crear una consulta, activar opcionalmente el switch para crear un evento nuevo sin fecha, con el mismo título. Desactivarlo crea solo la consulta.
- Antes de resolver, mantener o retirar el vínculo desde la ficha. En resolución solo se muestra la etiqueta del asociado, si existe.
- Con evento vinculado, seleccionar una sola fecha para aceptar. Si la consulta no está vinculada, se conserva la selección múltiple actual.
- Confirmar la resolución; la fecha aceptada pasa a definitiva en el evento si continúa sin fecha o con fecha provisional.
- Leer el aviso y confirmar la resolución sin cambiar la fecha cuando el evento se haya vuelto definitivo.
- Si el evento está rechazado, rechazar la consulta conservando la relación o cancelar y desvincular antes desde su ficha.
- Al rechazar un evento vinculado, elegir entre desvincular la consulta abierta o rechazar también la consulta; confirmar o cancelar sin cambios.
- Abrir las fichas vinculadas desde cualquiera de sus extremos; desde el evento consultar las relaciones cerradas anteriores.

## Consulta sin evento asociado

La creación ofrece el switch aunque no existan eventos previos. La resolución no muestra etiqueta, selector ni mensajes de vínculo vacío. El editor de vínculo de la ficha conserva sus estados de carga, vacío, error y reintento para eventos existentes.

La organización de acciones en el menú de la ficha y la preselección del evento actual se concretan en [SPEC-EVT-005 — Acciones en fichas de eventos y consultas](../../08_especificaciones/99_archivadas/spec-evt-005-acciones-eventos-consultas.md). Se mantiene la navegación visible entre fichas.

## Notas

La creación conjunta y la resolución sin selector corresponden a la decisión expresa del 2026-10-19. La ficha de la consulta abierta sigue siendo el lugar para mantener el vínculo; las reglas de estado y conservación histórica se consultan en los requisitos relacionados.

Las reglas se detallan en [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md), [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md), [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md) y [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md).

La realización anterior se conserva como historia en [SPEC-EVT-003 — Vincular eventos y consultas de fechas](../../08_especificaciones/99_archivadas/spec-evt-003-vinculo-evento-consulta.md). La evolución de este recorrido se concreta en [SPEC-EVT-004 — Crear evento desde consulta y simplificar resolución](../../08_especificaciones/99_archivadas/spec-evt-004-crear-evento-desde-consulta.md). El acabado visual final sigue el sistema de diseño común.
