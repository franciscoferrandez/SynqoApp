---
id: RF-CON-008
estado: en_revision
---

# RF-CON-008 — Listar consultas por vigencia

## Requisito

El sistema debe mostrar las consultas del equipo en dos listas, «Activas» y «Archivadas», calculando su vigencia a partir de sus datos. Esta clasificación no cambia el estado de la consulta ni las acciones disponibles según ese estado.

## Origen

Petición y respuestas expresas de la persona impulsora del 2026-10-24: clasificación calculada, orden por vigencia, día del equipo, ventana reciente, cargas adicionales y fecha visible.

## Precondiciones

La persona tiene acceso al equipo vigente.

## Criterios de aceptación

| Tipo y estado | Lista | Fecha de vigencia |
|---|---|---|
| Texto abierta | Activas | Creación |
| Texto resuelta | Activas | Resolución |
| Cualquier tipo rechazada | Archivadas | Rechazo |
| Fechas abierta con alguna opción de hoy o posterior | Activas | Creación |
| Fechas abierta con todas las opciones pasadas | Archivadas | Última fecha ofrecida |
| Fechas resuelta con alguna aceptada de hoy o posterior | Activas | Última fecha aceptada |
| Fechas resuelta con todas las aceptadas pasadas | Archivadas | Última fecha aceptada |

- Hoy sigue vigente hasta terminar el día en la zona horaria del equipo.
- Todas las activas aparecen, ordenadas por vigencia ascendente. Las archivadas se ordenan por vigencia descendente.
- La carga inicial incluye todas las archivadas cuya vigencia corresponda a hoy o los seis días anteriores, aunque haya más de diez. «Cargar más» añade las diez siguientes más antiguas, o las restantes si hay menos, hasta agotar el historial.
- Si la ventana reciente está vacía pero existe historial anterior, debe poderse cargar. No se muestra un falso estado de equipo sin consultas.
- Cada tarjeta muestra «Vigencia» y la fecha utilizada para ordenar; conserva el estado real y, si está resuelta, el resumen de opciones aceptadas.
- Una consulta abierta archivada conserva las acciones vigentes de votar, editar y resolver. Incorporar una fecha vigente puede devolverla a Activas; resolver o rechazar vuelve a calcular su ubicación sin alterar los votos por el mero cambio de lista.
- Archivar no exige una acción manual, no cierra la consulta ni modifica su evento asociado. La clasificación y su vigencia no se almacenan como estados o datos nuevos.
- La ventana de siete días y el lote de diez son parámetros internos fácilmente ajustables; no se añade configuración visible al participante.

## Casos límite

Las fechas aceptadas se obtienen exclusivamente de las opciones aceptadas, aunque existan propuestas posteriores no aceptadas. Editar título o votos no cambia la fecha de creación ni la de resolución. Los errores al cargar más permiten reintentar conservando lo ya visible y sin duplicar elementos.

Todas las fuentes se comparan por día civil en la zona del equipo, sin tener en cuenta la hora. Los elementos con la misma fecha mantienen un desempate estable.

## Relaciones

- [RD-CON-004 — Momento de creación de la consulta](../../03_datos/CON/rd-con-004-momento-creacion-consulta.md).
- [RF-CON-004 — Resolver una consulta](rf-con-004-resolver-consulta.md).
- [WF-CON-001 — Lista de consultas del equipo](../../../04_experiencia-usuario/03_wireframes/wf-con-001-lista-consultas.md).
