---
id: FLUJO-EVT-003
estado: en_revision
---

# FLUJO-EVT-003 — Vincular eventos y consultas de fechas

## Actor

Una persona con acceso al equipo vigente, bajo una identidad de participante seleccionada.

## Entrada

La persona inicia la creación de una consulta de fechas, abre una consulta de fechas abierta para resolverla o rechaza un evento con una consulta abierta vinculada.

## Precondiciones

- El equipo está vigente y la persona tiene acceso.
- Para crear o resolver una consulta, hay una identidad de participante seleccionada.
- La vinculación solo aplica a consultas de fechas abiertas. Las consultas de texto siguen su flujo actual.

## Pasos

### Crear una consulta con evento

1. La persona abre «Crear consulta de fechas» desde el calendario y completa el título y las fechas propuestas conforme al flujo existente.
2. De forma opcional activa «Crear evento provisional». Este switch sustituye al selector de eventos existentes. El nuevo evento se creará sin fecha asignada y con el mismo título que la consulta.
3. Puede desactivar el switch antes de confirmar para crear únicamente la consulta. Alternarlo no persiste ningún recurso.
4. Confirma la creación. Consulta, evento opcional y vínculo se guardan conjuntamente; si falla o cancela no queda ninguno creado parcialmente. Ambas fichas reflejan el vínculo.

### Cambiar o elegir evento antes de resolver

5. La persona abre una consulta de fechas abierta. La ficha muestra el evento vinculado, si existe.
6. Antes de iniciar la resolución, puede elegir otro evento elegible o retirar el vínculo desde el menú hamburguesa del encabezado de la ficha. «Cambiar evento» inicia el editor con el vínculo actual seleccionado, incluso tras la carga asíncrona o el reintento; si ya no es elegible, se representa como vínculo actual. Sin vínculo, «Elegir evento» inicia «Sin evento». «Quitar vínculo» selecciona explícitamente «Sin evento». Solo guardar confirma la elección; cancelar conserva la anterior. El modal de resolución no permite elegir, cambiar ni retirar eventos: solo muestra el título del asociado como etiqueta; sin vínculo no muestra nada relacionado con eventos.
7. Para resolver una consulta vinculada, selecciona exactamente una fecha. Para una consulta sin vínculo, se conserva el comportamiento existente de aceptar una o varias fechas.
8. Antes de confirmar, Synqo vuelve a comprobar el estado del evento vinculado:
   - Si sigue sin fecha o con fecha provisional, la confirmación indica que la fecha aceptada quedará asignada como definitiva al evento.
   - Si ya tiene fecha definitiva, Synqo avisa antes de confirmar que esta resolución no cambiará la fecha del evento. Conserva el vínculo; la consulta puede resolverse y el evento podrá modificarse desde su ficha.
   - Si excepcionalmente está rechazado, puede rechazar la consulta conservando la relación o cancelar para desvincular previamente desde la ficha y resolver después sin evento. El modal no modifica el vínculo.
9. La persona revisa y confirma la resolución. Si se acepta una fecha y el evento sigue sin fecha o provisional, esa fecha queda definitiva en el evento y la última modificación se atribuye a quien resuelve. Si la consulta se rechaza, el evento no cambia.
10. La consulta cerrada conserva la relación con el evento si no se retiró antes de la resolución. Desde cada ficha se puede abrir la otra; la ficha del evento permite consultar todas sus consultas cerradas vinculadas.
11. Cuando una consulta vinculada ya está cerrada, el evento puede asociarse a otra consulta de fechas abierta sin perder las relaciones cerradas anteriores.

### Rechazar un evento con consulta abierta vinculada

12. La persona activa «Rechazar evento» desde el menú hamburguesa de un evento que tiene una consulta de fechas abierta vinculada.
13. En un único diálogo elige una de estas acciones: rechazar el evento y desvincular la consulta, o rechazar tanto el evento como la consulta.
14. La persona confirma. En la primera opción, el evento queda rechazado y la consulta permanece abierta sin vínculo. En la segunda, ambos quedan rechazados y la relación se conserva como relación histórica navegable.

## Resultado

Los vínculos solo conectan un evento y una consulta abierta a la vez en cada lado. La consulta puede cambiar o quitar su evento antes del cierre. La resolución y el rechazo afectan al evento solo en los casos definidos en [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md). Las fichas permiten navegar en ambos sentidos por los vínculos que deban conservarse.

## Errores

- Si se intenta confirmar varias fechas en una consulta vinculada a un evento aún sin fecha o con fecha provisional, no se completa la resolución; la persona debe dejar una sola fecha seleccionada.
- Si el evento elegido deja de ser elegible antes de confirmar el vínculo —por ejemplo, se rechaza o se vincula a otra consulta abierta—, no se guarda un vínculo nuevo y se actualiza la lista de eventos elegibles.
- Si el evento vinculado cambia a definitivo antes de confirmar la resolución, se muestra el aviso definido y no se modifica su fecha desde la consulta.
- Si el evento vinculado está rechazado al resolver, se presentan las dos salidas definidas; si la persona cancela, consulta y evento quedan sin cambios.
- Si no se puede cargar o guardar el vínculo o la resolución, se informa del fallo y no se muestra el cambio como confirmado. Se permite volver a intentarlo cuando el estado actual de la consulta lo permita.
- Si el equipo ha caducado, no se continúa con la operación y se muestra el estado del equipo según el flujo de acceso existente.

## Cancelación

- Si se cancela la creación de consulta, aplica el comportamiento ya definido para conservar o descartar el borrador; no se crea consulta ni vínculo.
- Si se cancela el diálogo de resolución, la consulta permanece abierta y no se cambia el evento.
- Si se cancela el diálogo de evento rechazado, no cambia ni el evento ni la consulta.
- Si se retira o cambia el evento antes del cierre de la consulta, solo se guarda esa elección al confirmar la acción correspondiente; cancelar deja el vínculo previo intacto.

## Decisiones de interacción vigentes

- Por decisión expresa del 2026-10-19, la creación usa un switch opcional para un evento nuevo sin fecha y con el mismo título. Resolver muestra una etiqueta del asociado, si existe, sin selector; desvincular exige hacerlo previamente desde la ficha.
- La ficha abierta muestra el vínculo actual con acciones para cambiarlo o quitarlo. Los vínculos se vuelven a comprobar al guardar.
- El aviso de evento definitivo aparece antes de confirmar; el evento no cambia al resolver. Si el evento vinculado está rechazado, se presentan las dos salidas definidas en el paso 8.
- Las fichas muestran enlaces en ambos sentidos; el evento muestra sus consultas cerradas y, si tiene una, la consulta abierta vinculada.
- Las operaciones concurrentes se serializan en API; si el estado cambió, no se presenta como guardado y se actualiza la información.

El detalle visual se ajusta al sistema de diseño durante la implementación, sin cambiar estas reglas.

## RF/RN relacionados

- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md)
- [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md)
- [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md)
- [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md)
- [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md)
- [RN-CON-002 — Resolución de una consulta abierta](../../03_requisitos/02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md)
