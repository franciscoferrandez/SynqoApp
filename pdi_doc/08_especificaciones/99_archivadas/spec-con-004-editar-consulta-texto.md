---
id: SPEC-CON-004
nivel: N2
estado: cerrado
release: REL-005
---

# SPEC-CON-004 — Editar una consulta con opciones de texto

## Objetivo

Definir la edición del título y las opciones de una consulta genérica, por petición expresa de la persona impulsora el 2026-10-20. Las respuestas a las rondas interactivas concretan el alcance en consultas con opciones de texto.

## Clasificación

Evolución N2: cambia datos persistidos de consultas y puede afectar a opciones ya votadas, resoluciones, permisos y operaciones concurrentes. Una única SPEC. Preparada y cerrada inicialmente sin entrega asignada; asignada posteriormente a [REL-005 — Ajustes de funcionalidad de consultas](../../01_producto/10_entregas/rel-005-ajustes-funcionalidad-consultas.md) por petición expresa.

## Scope

Materializar [RF-CON-006 — Editar una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-006-editar-consulta-texto.md): entrada desde menú de la ficha, edición del título y opciones, confirmación únicamente para retirar opciones votadas, cancelación conforme a eventos y datos visibles de última edición. Preservar opciones, votos y acceso según el baseline enlazado. Incorporar operación API, migración de metadatos, WEB y pruebas funcionales.

## Fuera de scope

Edición de consultas de fechas, cambio de tipo de consulta, edición de eventos y cambios de vínculo. No incorporar estas capacidades salvo ampliación expresa del alcance. Se conservan los cambios anteriores pendientes de revisión. No hacer commits hasta nueva autorización. No ejecutar ni actualizar regresiones visuales por la instrucción vigente.

## Baseline relacionado

- [RF-CON-005 — Crear una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-005-crear-consulta-texto.md).
- [RN-CON-001 — Votación múltiple y pública](../../03_requisitos/02_reglas-negocio/CON/rn-con-001-votacion-publica.md), [RN-CON-002 — Resolución de una consulta abierta](../../03_requisitos/02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md).
- [RN-CON-003 — Mínimo de una opción por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md), [RN-CON-006 — Texto único entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md), [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md).
- [RD-CON-003 — Título de la consulta](../../03_requisitos/03_datos/CON/rd-con-003-titulo-consulta.md), [RD-CON-005 — Texto de opción de una consulta](../../03_requisitos/03_datos/CON/rd-con-005-texto-opcion-consulta.md).
- [FLUJO-CON-004 — Crear una consulta con opciones de texto](../../04_experiencia-usuario/02_flujos/flujo-con-004-crear-consulta-texto.md), [WF-CON-006 — Crear una consulta con opciones de texto](../../04_experiencia-usuario/03_wireframes/wf-con-006-crear-consulta-texto.md).
- [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md), [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md), [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md), [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md).
- [SPEC-EVT-005 — Acciones en fichas de eventos y consultas](../99_archivadas/spec-evt-005-acciones-eventos-consultas.md), como contexto del menú de acciones ya disponible en el árbol de trabajo, todavía sin commit.
- [RF-CON-006 — Editar una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-006-editar-consulta-texto.md), [RN-CON-008 — Edición de opciones y conservación de votos](../../03_requisitos/02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md), [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_requisitos/03_datos/CON/rd-con-006-ultima-edicion-consulta.md).
- [RD-CON-004 — Momento de creación de la consulta](../../03_requisitos/03_datos/CON/rd-con-004-momento-creacion-consulta.md), [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md).
- [FLUJO-CON-005 — Editar una consulta con opciones de texto](../../04_experiencia-usuario/02_flujos/flujo-con-005-editar-consulta-texto.md), [WF-CON-007 — Editar una consulta con opciones de texto](../../04_experiencia-usuario/03_wireframes/wf-con-007-editar-consulta-texto.md), [WF-CON-002 — Detalle de una consulta abierta](../../04_experiencia-usuario/03_wireframes/wf-con-002-detalle-consulta.md).
- [API — Convención HTTP](../../06_arquitectura/03_modulos/API/convencion-http.md).

## Origen de las decisiones — 2026-10-20 y 2026-10-21

Respuesta expresa de la persona impulsora a la primera ronda interactiva:

- Solo se editan consultas abiertas; resueltas y rechazadas quedan fuera de la edición.
- Puede editar cualquier participante del equipo con acceso e identidad seleccionada, sin restringirlo al creador.
- No se puede cambiar el texto de una opción con votos; sí el de una opción sin votos. No se ha autorizado retirar ni reinterpretar votos como efecto de renombrar una opción.

Respuesta expresa de la persona impulsora a la segunda ronda interactiva:

- Añadir y eliminar opciones, manteniendo el orden actual de las conservadas y añadiendo las nuevas al final. No incluir reordenación.
- Permitir eliminar opciones con votos, confirmando la eliminación y la retirada de sus votos. No se ha autorizado retirar votos de otras opciones.
- Permitir cambiar el título aunque ya haya votos, conservando todos los votos de las opciones que permanezcan.

Estas respuestas se consolidan mediante `pdi:baseline-update` en los artefactos relacionados, que son la fuente normativa de la capacidad.

Respuesta expresa de la persona impulsora a la tercera ronda interactiva:

- «Guardar consulta» guarda directamente, como la edición de eventos, sin confirmación general ni paso intermedio de resumen.
- Mostrar quién hizo la última edición y cuándo; conservar la autoría de creación.
- Para conflictos, tomar eventos como referencia. Tras investigar y explicar el comportamiento se resuelve expresamente en la ronda de aclaración.

Aclaración final expresa del 2026-10-21:

- Mantener confirmación únicamente al eliminar opciones con votos. Queda resuelta la aparente contradicción con el guardado directo general.
- Concurrencia «como esté en eventos», después de explicar que entre ediciones válidas prevalece el último guardado y no se exige versión esperada.
- Cancelación como eventos: cerrar directamente sin cambios; si los hay, ofrecer seguir editando o descartarlos.

## Questions / Assumptions

Sin preguntas funcionales bloqueantes. Los límites y la comparación de duplicados se reutilizan, sin ofrecer reordenación, historial ni edición de consultas de fechas. Durante la preparación, la entrega objetivo quedó sin asignar como planificación posterior no bloqueante; la asignación posterior se registra al final de esta SPEC. La autorización vigente para mantener el índice de trazabilidad sigue aplicando. No hay autorización para nuevos commits.

## Research inicial

Al iniciar la preparación, el baseline definía creación de consultas de texto, sus límites, votos y resolución, pero no su edición. Las opciones persistidas tienen ID propio y posición; los votos y las opciones aceptadas se relacionan por ID. Se preserva la identidad de opciones conservadas; no se sustituye toda la consulta mediante borrar y recrear.

El formulario de creación ya admite añadir/eliminar filas y edición directa de texto. El menú de la ficha ofrece el punto de entrada. `ConsultationService::mutate` aplica mutaciones bajo `withLockedTeam`, comprueba vigencia y actualiza caducidad solo cuando hay cambio. La entidad no tiene aún metadatos de última edición; requiere migración con campos nulos para filas existentes. El índice de posiciones de opciones es único por consulta; los cambios no deben violarlo durante el flush. Las selecciones de votos tienen FK a opciones y deben limpiarse también los votos que queden vacíos.

### Referencia de eventos para guardado, cancelación y conflictos

La edición de eventos guarda directamente y cierra el diálogo al confirmar la API. Al cancelar, compara contra el borrador inicial: si hay cambios solicita descartar o seguir editando; si no hay cambios, cierra directamente. Ante 409 conserva el formulario y muestra «El evento ha cambiado o no admite esta acción. Recarga la ficha e inténtalo de nuevo». Otros fallos también conservan los cambios para reintentar.

El cliente de edición de eventos no envía una versión esperada. El bloqueo de equipo serializa mutaciones y se valida el estado actual, pero dos ediciones válidas de campos no se detectan como conflicto por el mero hecho de proceder de una ficha anterior: la última guardada prevalece. Esto no debe describirse como detección de toda edición concurrente. La adaptación a opciones de consulta debe además validar al guardar qué opciones tienen votos y si la consulta sigue abierta.

## Impacto baseline consolidado

Mediante `pdi:baseline-update` se crean la capacidad funcional, la regla de opciones/votos, los metadatos de última edición y el flujo/wireframe enlazados. Se amplían al guardado de ediciones las reglas vigentes de límites y unicidad; se enlaza la edición desde el wireframe de ficha y se explicita que el orden por creación permanece intacto. No se cambia la arquitectura ni se crea ADR.

## Módulos afectados

API: reglas de consulta, caso de uso, puerto/repositorio, entidades, migración, recurso de operaciones/controlador, OpenAPI y pruebas. WEB: cliente HTTP/tipos, acción de ficha, diálogo de edición y confirmación específica, metadatos y E2E. Se mantienen los contratos de creación, votos, resolución, eventos y vínculos.

## Criterios de aceptación

1. «Editar consulta» solo se ofrece para consultas abiertas de texto; cualquier participante del equipo con acceso puede editar, con independencia de la autoría. API impide editar fechas o consultas cerradas y aplica acceso/vigencia/aislamiento.
2. El título se puede cambiar con votos sin alterarlos. Se mantienen los límites vigentes de título, opciones y duplicados, también en API; los errores señalan los campos y no escriben parcialmente.
3. Se añaden opciones al final, se cambian textos sin votos y se retiran opciones conservando el orden e ID de las restantes. No hay reordenación, reinicio de votos ni sustitución global de opciones.
4. Los textos de opciones votadas son de solo lectura; recibir votos mientras se edita impide guardar su cambio de texto. La validación autoritativa usa el estado al guardar y conserva el borrador ante el conflicto.
5. Guardar es directo salvo retirada de opciones votadas. Ese caso muestra qué se retira y exige confirmación. Cancelar la confirmación no escribe; confirmar retira solo esas selecciones, conserva las demás y deja sin respuesta a quien quede sin selecciones. Una opción que recibe votos antes del guardado exige confirmación si su retirada no estaba confirmada.
6. Cancelar/Escape sin cambios cierra; con cambios permite seguir o descartar. Guardar correctamente cierra y actualiza la ficha; errores conservan el formulario. El foco retorna al menú al cerrar y las confirmaciones son operables con teclado.
7. La última edición registra participante y momento solo ante cambios efectivos del título/opciones. La creación, orden por creación y demás autorías permanecen intactos. Un no-op, reintento idéntico, lectura, cancelación o fallo no cambia metadatos ni caducidad; una edición efectiva sí actualiza actividad.
8. Las ediciones se serializan con votos/resolución y mantienen atomicidad. Sin comparación de versión de contenido: prevalece el último cambio válido guardado de un campo. No se sobrescriben campos no incluidos, ni se recrean opciones eliminadas por otra edición al intentar renombrarlas; cerrar la consulta impide un guardado posterior.
9. Contrato, migración, esquema y pruebas API/WEB/E2E coinciden; revisión independiente sin hallazgos graves y matriz `Acceptance criterion | Evidence | Result`. Cobertura de acceso, rollback, concurrencia, teclado y viewports claros/oscuros; sin ejecutar regresión visual ni realizar commit.

## Design / Structure

### Operación y contratos

`PATCH /api/teams/current/consultations/{consultationId}`, JSON y Bearer según la convención HTTP enlazada. La petición representa cambios explícitos del formulario, no un reemplazo de toda la consulta:

```json
{
  "participantId": "uuid-del-participante",
  "title": "Título nuevo, solo si cambió",
  "optionChanges": {
    "add": [{ "id": "uuid-nuevo-estable", "text": "Nueva opción" }],
    "update": [{ "id": "uuid-existente", "text": "Texto nuevo" }],
    "remove": ["uuid-a-retirar"]
  },
  "confirmedRemovalOptionIds": []
}
```

- `participantId` obligatorio; `title` opcional, con los límites vigentes. `optionChanges` y sus listas ausentes equivalen a listas vacías. `confirmedRemovalOptionIds` es opcional, por defecto vacía, y solo contiene IDs de la lista de retiradas. No hay campo de versión esperada ni campos para estado/tipo/vínculo.
- Cada opción nueva recibe un UUID en el borrador WEB, estable al reintentar la misma operación; no es una credencial. Validar IDs, pertenencia, listas sin duplicados y sin solapamientos entre añadir/modificar/retirar. No se aceptan IDs ya usados por otras consultas. Si un alta ya existe en esta misma consulta con el mismo texto, es un no-op de reintento; si difiere, devuelve conflicto, sin tratarla como un renombrado implícito.
- El título y los textos se conservan tal como se envían, siguiendo la creación existente; no se recortan al abrir o guardar. La comparación para decidir qué enviar usa los valores originales completos. La normalización vigente se utiliza únicamente para detectar duplicados, sin introducir cambios implícitos en datos antiguos ni en campos intactos.
- Las listas `update` solo incluyen textos efectivamente cambiados; conservar opciones no necesita enviarlas y no afecta a votos. Modificar una opción ausente devuelve conflicto, nunca la recrea. Una retirada ya aplicada es no-op. Las opciones añadidas por otra edición y no incluidas en la petición no se retiran implícitamente.
- Los cambios explícitos se aplican al estado vigente bajo el bloqueo de equipo. Dos cambios válidos del mismo título/texto se resuelven por el último guardado, mientras el resto del estado se conserva. Validar el resultado completo (cantidad, textos, duplicados) antes de mutar.
- Éxito `200 { consultation, expiresAt }`, con detalle y recuentos actuales. Añadir `lastModifiedBy: {id,name}|null` y `lastModifiedAt: string|null` a la representación de consulta sin cambiar sus campos existentes; fechas ISO 8601 y nombres serializados como los participantes existentes. El par permanece null hasta la primera edición efectiva. GET/listado y respuesta de edición coinciden.
- `400` JSON mal formado; `401` ausencia de Bearer; `404` enlace/recurso/participante no perteneciente al equipo; `410` caducado; `422` estructura, IDs o resultado inválidos (incluidos límites, duplicados o tipo de consulta no editable). `409` consulta cerrada o conflicto con estado actual de opciones. No se incorpora `403`.
- Un ID de alta ya usado en otra consulta es entrada inválida (`422`); reutilizar en la misma consulta un alta con texto diferente es conflicto (`409`). Las violaciones sobre opciones del resultado completo se identifican por `options.<UUID>`, para señalar la misma fila aunque otra edición haya añadido opciones; las validaciones estructurales usan `optionChanges.add/update.<índice>.<campo>`.
- Reutilizar `urn:synqo:problem:consultation-closed` al cerrar. Definir `urn:synqo:problem:consultation-edit-conflict` para renombrado con votos, opción ya eliminada o colisión de alta, incluyendo el detalle actual de la consulta tras verificar acceso. WEB conserva el borrador y puede recuperar el texto vigente de una opción bloqueada.
- Si falta confirmar alguna retirada que ahora tiene votos, devolver `409 urn:synqo:problem:consultation-removal-confirmation-required`, sin escritura, con `optionsWithVotes: [{id,text,count}]` para las retiradas votadas y pendientes. WEB muestra la confirmación y reenvía los mismos cambios con los IDs confirmados. Esta autorización se refiere a retirar esas opciones y todos sus votos actuales, no a congelar su recuento ni a autorizar otras opciones.
- Documentar entradas, extensiones Problem Details, respuestas y autenticación en OpenAPI; validar su exportación con pruebas de contrato.

### Persistencia e integridad

Ampliar las entidades de consulta/opciones y el puerto existente, conservando las reglas comprobables fuera del transporte. Migración que añade `last_modified_by_participant_id` nullable con FK de participante y `last_modified_at` nullable; datos existentes sin última edición. Seguir los patrones de FK y borrado de las entidades actuales, con índices nombrados explícitamente. Sin tabla de historial ni revisión de contenido.

Título/opciones/votos vacíos/metadatos/actividad se confirman en una única transacción de `withLockedTeam`. Recalcular votos bajo el bloqueo, verificar que el actor pertenece al equipo y que la consulta sigue abierta. Conservar IDs y orden; resolver el índice único de posición durante cambios de colección sin estados intermedios inválidos ni commits parciales. Un reintento sin cambios efectivos devuelve el estado vigente sin generar nueva autoría/actividad.

### WEB y accesibilidad

Añadir «Editar consulta» al menú de consultas de texto abiertas. Cargar el detalle vigente al abrir y usar un borrador con IDs, estado inicial y marcas de retirada; la creación conserva su recorrido. Se pueden compartir controles realmente reutilizados sin refactorizar el módulo completo. Las opciones votadas usan campos de solo lectura, con explicación y retirada disponible; nuevas opciones al final, retiradas reversibles dentro del borrador. No enviar peticiones mientras se escribe o se marca una retirada.

El límite de opciones se aplica al resultado activo del borrador, excluyendo las marcadas para retirar. Una fila nueva eliminada antes de guardar no genera alta ni retirada en API. Deshacer una retirada que excedería el máximo exige corregir el borrador antes de guardar, sin descartar silenciosamente otras filas.

Guardar los cambios explícitos directamente; solo la retirada con votos abre su confirmación. Volver desde ella conserva el borrador; nunca confirma otros cambios por separado. Ante conflicto conservar datos introducidos y mostrar la acción permitida: recuperar texto actual para una opción que ahora tenga votos, o recargar ficha si desapareció/se cerró. Recargar no descarta silenciosamente un borrador: usa la misma salida de descarte elegida para eventos. El contenido cerrado no se reabre para reintentar.

Reutilizar patrón de diálogos nativos, estados pendientes, resumen accesible y foco de eventos. Deshabilitar envíos dobles durante escritura. Mostrar última edición solo si existe, también en ficha cerrada. Cubrir 390/768/769/1280, claro/oscuro, teclado, foco, reflujo y errores. No alterar navegación/votos/resolución de fechas.

## Plan por slices

1. **HIGH / PRIMARY:** reglas, operación atómica, contrato, migración y metadatos. Cerrar implementación con pruebas API de acceso, selección por IDs, retirada confirmada, rollback y no-op; pruebas de concurrencia serializada. La interpretación de autorización, concurrencia y transacción permanece en PRIMARY.
2. **MEDIUM:** diálogo WEB y metadatos, usando el contrato fijado; tareas localizadas de implementación, tests y validación mediante el workflow de subagentes del repositorio, con propiedad disjunta y sin subagentes de subagentes. **LOW:** E2E derivados de los criterios.
3. **LOW:** checks aplicables, E2E focalizados y relacionados/reales, revisión independiente y matriz de aceptación. **HIGH / PRIMARY:** aceptación de integridad, drift y gate de cierre. Sin commits ni regresiones visuales.

## Evidencia / Validation prevista

- API/PostgreSQL: cualquier participante válido, Bearer ausente/inválido, equipo caducado/ajeno, participante ajeno, fechas/cerradas, límites/normalización, IDs ajenos/duplicados, no-op, metadatos/creación/orden, reintentos de altas/retiradas y fallo forzado que pruebe rollback de todo el conjunto.
- Votos: impedir renombrado con votos; conservar identidades/recuentos ajenos; retirar una opción de participante multivoto sin perder otras; retirada de su última selección; falta de confirmación sin escrituras. Carreras en ambos órdenes con voto, retirada de votos, otra edición y resolución, usando conexiones/transacciones reales cuando corresponda.
- WEB/E2E: menú por tipo/estado, campos actuales, título con votos, altas/retiradas/deshacer, solo lectura, validaciones, confirmación limitada, cancelación en cada nivel, error/reintento, votos que llegan con diálogo abierto, ficha recargada/segundo participante, historial y regresiones de creación/resolución/vínculos.
- Ejecutar `docker compose exec -T api composer test`, checks Composer `cs:check`, `stan`, `rector:check`, y `doctrine:schema:validate --env=test`; verificar migración sobre base de pruebas, sin resetear desarrollo.
- Antes de todos los checks WEB, `source "$HOME/.nvm/nvm.sh" && nvm use` desde raíz. Tests WEB, lint, `format:check`, build, E2E focalizados y después los relacionados. Anotar versiones/herramientas de accesibilidad automatizada, alcance y resultado; no declarar conformidad global.
- Regresión visual: `omitido_activamente` por instrucción vigente, sin ejecutar ni actualizar snapshots. No se han ejecutado tests de implementación en preparación.

## Convergence prevista

Contrastar baseline, contrato exportado, código, tests y UX. Volver a prepare/baseline-update si aparece una decisión nueva; no acomodar las reglas al código. Conservar los cambios de la evolución anterior, las SPEC archivadas y los estados de release existentes. Asignación de entrega posterior; no marcar ninguna entrega ENTREGADA. Cerrar únicamente después de verify y converge PASS.

## Gate de preparación

**PASS — READY_FOR_CHANGE_APPLY**, preparación cerrada el 2026-10-21. Las preguntas y la contradicción de confirmación están resueltas expresamente; baseline funcional/UX consolidado, módulos, contrato, diseño, riesgos, plan y validación identificados. El índice existente se mantiene con la autorización expresa vigente. No hay nueva decisión arquitectónica significativa ni dependencia. Solo documentación en esta preparación: implementación, verificación funcional y cierre quedan pendientes. No se ha realizado commit.

### Comprobaciones de preparación

- `python3 pdi/scripts/validate_structure.py`: PASS.
- `python3 pdi/scripts/artifact_index.py --id SPEC-CON-004 --summary`: identifica la SPEC preparada y su ubicación activa.
- Comprobación de enlaces relativos de todos los Markdown modificados/nuevos y `git diff --check`: PASS.
- Revisión focal equivalente a `pdi:baseline-check`: área CON adecuada, IDs nuevos sin duplicados, RF/RN/RD/flujo/wireframes enlazados, límites coherentes entre creación/edición y decisiones finales de confirmación/concurrencia/cancelación trazadas. No quedan preguntas bloqueantes. La política de eventos se ha inspeccionado como evidencia, sin modificarla.
- No se han ejecutado tests API/WEB: no hay implementación nueva que verificar en esta fase. El plan de evidencia funcional sigue pendiente de ejecución durante apply/verify.

## Verificación de implementación — 2026-10-21

| Acceptance criterion | Evidence | Result |
|---|---|---|
| 1. Acceso e identidad, tipo/estado y entrada desde menú | [Pruebas API de edición](../../../apps/api/tests/ConsultationEditingApiTest.php) verifican actor distinto del creador, ausencia/alteración de Bearer, aislamiento, caducidad, fechas y consultas cerradas. [E2E de edición](../../../apps/web/e2e/consultation-editing.spec.ts) verifica el menú condicionado. | PASS |
| 2. Título con votos, límites y errores sin escrituras parciales | API comprueba título, máximo/mínimo, opciones vacías/largas y duplicados con conservación del estado. E2E comprueba errores por campo, incluido `options.<UUID>` ante un duplicado que aparece al guardar. | PASS |
| 3. Identidad, orden y cambios explícitos de opciones | API/E2E comprueban altas al final, renombrado sin votos y retiradas conservando los IDs/votos restantes. La respuesta tras retirar una opción intermedia sigue siendo una lista JSON y mantiene posiciones consecutivas. | PASS |
| 4. Texto votado protegido al guardar | API rechaza el cambio sin persistir el resto. [Pruebas de concurrencia](../../../apps/api/tests/ConsultationEditingConcurrencyTest.php) ejecutan ambos órdenes de voto/edición y retirada de voto/edición. E2E recibe un voto con el formulario abierto, conserva el borrador y permite recuperar el texto actual. | PASS |
| 5. Confirmación limitada a retiradas con votos | API y E2E comprueban respuesta específica sin escrituras, confirmación por ID, conservación de selecciones ajenas y eliminación de votos vacíos. La carrera retirada/voto se comprueba en ambos órdenes. [E2E real](../../../apps/web/e2e/consultation-editing-real.spec.ts) verifica el estado persistido con dos participantes. | PASS |
| 6. Guardado directo, cancelación, errores y foco | E2E comprueba guardado sin confirmación general, descarte/continuación, fallos de carga/escritura y reintento. [Matriz responsive](../../../apps/web/e2e/consultation-editing-responsive.spec.ts) verifica teclado, foco y reflujo en cuatro tamaños y ambos temas. | PASS |
| 7. Metadatos, creación, no-op y actividad | API y E2E comprueban última edición, creación intacta, orden de consultas, reintentos de altas/retiradas y no-op. La regresión de títulos/opciones con espacios comprueba que campos intactos no se recortan ni se envían como cambios. | PASS |
| 8. Serialización, atomicidad y último cambio válido | Cinco pruebas de concurrencia cubren ambos órdenes entre votos, edición, retirada y resolución, preservando cambios de campos distintos. Un fallo SQL forzado en el guardado final revierte opciones, selecciones, título, metadatos y actividad, incluidos los flush intermedios de posiciones. | PASS |
| 9. Contrato, checks, integración y revisión | API completa y checks estáticos/esquema, WEB, 21 E2E mock, uno real y 58 regresiones relacionadas PASS. Revisión independiente final REVIEW_OK sin hallazgos pendientes. Validación documental, enlaces y diff correctos. No se ejecutaron visuales ni se hizo commit. | PASS |

### Evidencia ejecutada

- `docker compose exec -T api composer test -- --filter='ConsultationEditing(Api|Concurrency)Test'`: 14 tests, 250 assertions PASS. `docker compose exec -T api composer test`: 185 tests, 1781 assertions PASS. Los errores 500 provocados por las pruebas de rollback son intencionados y forman parte de las aserciones.
- En API, `composer cs:check`, `composer stan`, `composer rector:check` y `php bin/console doctrine:schema:validate --env=test`: PASS. `Version20261021120000` se aplicó con `doctrine:migrations:migrate --env=test --no-interaction` y, para la revisión local, `--env=dev --no-interaction`. Migración aditiva, sin reset de datos.
- Antes de cada check WEB: `source "$HOME/.nvm/nvm.sh" && nvm use` desde raíz, Node 24.21.0/npm 11.19.0. `npm --prefix apps/web test`: 26 PASS. `lint`, `format:check` y `build`: PASS, incluyendo build final tras correcciones de espacios y errores por opción.
- Desde `apps/web`, `npx playwright test e2e/consultation-editing.spec.ts e2e/consultation-editing-responsive.spec.ts --workers=1 --output=/tmp/synqo-con004-e2e --reporter=list`: 21/21 PASS (13 funcionales y 8 combinaciones de viewport/tema). Prettier sobre los nuevos E2E: PASS.
- Con `docker compose --profile e2e up -d api-e2e`, dentro de `web-visual-test`, `WEB_PROXY_CONFIG=proxy.e2e.conf.json npx playwright test e2e/consultation-editing-real.spec.ts --workers=1 --output=/tmp/synqo-con004-real --reporter=list`: 1/1 PASS contra API/PostgreSQL de pruebas. Retirada por otro participante con conservación de los votos restantes y los metadatos de creación.
- En el mismo perfil aislado, `WEB_PROXY_CONFIG=proxy.e2e.conf.json npx playwright test e2e/event-consultations.spec.ts e2e/date-consultations.spec.ts e2e/consultations.spec.ts e2e/consultation-decisions.spec.ts e2e/accessibility-smoke.spec.ts e2e/mobile-journey.spec.ts e2e/events-real.spec.ts e2e/calendar-events.spec.ts --workers=2 --output=/tmp/synqo-con004-related --reporter=list`: 58/58 PASS, incluidos consultas de fechas, creación, resolución, vínculos/historial, ambos rechazos coordinados, calendario, accesibilidad y recorridos móviles/reales. Ningún reset de desarrollo; el perfil utiliza solo la base de pruebas.
- Accesibilidad automatizada parcial: ESLint 10.12.0/angular-eslint 21.4.0 con `templateAccessibility`, PASS; Playwright 1.63.0 verifica controles nombrados, teclado, foco y reflujo en 390×844, 768×1024, 769×1024 y 1280×800, claro/oscuro. No acredita conformidad WCAG global.
- Revisión independiente: REVIEW_OK. Corregidos antes de aceptar: recorte implícito de campos intactos, asociación de errores a IDs estables y serialización de opciones tras retirar filas intermedias. Las pruebas de regresión cubren los tres casos.
- Regresión visual: `omitido_activamente` conforme a la instrucción vigente. Sin snapshots ejecutados ni actualizados y sin commits.

## Resultado de convergencia y cierre — 2026-10-21

`pdi:change-verify`: PASS. Nueve criterios PASS; API completa 185 tests/1781 assertions, WEB 26 tests y 80 casos E2E verificados (21 nuevos con fixtures, uno nuevo real y 58 relacionados). Los checks estáticos, formato, build y esquema pasan. Revisión independiente final `REVIEW_OK`, sin BLOCKER, MAJOR ni MINOR pendientes.

`pdi:change-converge`: PASS. Código, contrato exportado, migración y pruebas coinciden con el baseline y las decisiones expresas. Los ajustes de apply corrigen defectos de implementación y precisan rutas de validación y conflictos; no introducen reglas nuevas. Se mantienen el tratamiento de eventos, los votos y la resolución de fechas, el orden por creación y los cambios anteriores pendientes de revisión. No hay drift ni decisiones arquitectónicas pendientes; no se crea ADR.

**DONE — Change cerrado y archivado localmente mediante `pdi:change-close`.** Se reparan las referencias del índice existente. En el momento del cierre la entrega seguía sin asignar; no se alteraron los estados de ninguna release ni se acreditó despliegue. La migración aditiva está disponible en desarrollo para revisión local. No se ha realizado commit; se conserva la instrucción de esperar a la revisión de la persona impulsora. Las regresiones visuales siguen pendientes conforme a la instrucción vigente. El servicio temporal `api-e2e` se detiene al terminar.

## Asignación de entrega — 2026-10-21

Después del cierre, la persona impulsora solicita abrir una entrega de ajustes funcionales de consultas. Se asigna esta SPEC a [REL-005 — Ajustes de funcionalidad de consultas](../../01_producto/10_entregas/rel-005-ajustes-funcionalidad-consultas.md), como primer ajuste VALIDADO localmente. La nueva entrega puede avanzar en paralelo y compartir despliegue con REL-004. Esta asignación no cambia el alcance, la evidencia ni el cierre del Change; no acredita despliegue ni autoriza commits.
