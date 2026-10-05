---
id: SPEC-CON-002
nivel: N2
estado: cerrada
release: REL-001
---

# SPEC-CON-002 — Crear una consulta de fechas

## Objetivo

Realizar [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md) dentro de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md), permitiendo proponer manualmente de una a diez fechas desde el calendario de un equipo vigente.

## Clasificación

Change N2: añade persistencia tipada y operación API sobre consultas, además de una interacción de creación propia del calendario WEB.

## Scope

- Crear desde el calendario una consulta con título de hasta 250 caracteres y entre una y diez fechas distintas.
- Seleccionar fechas desde hoy en adelante; añadir y retirar fechas desde el calendario, conservarlas al navegar y mostrarlas en orden cronológico.
- Sustituir el detalle del día por el panel de creación; en móvil, ubicarlo bajo el calendario conforme al prototipo.
- Confirmar la creación y confirmar condicionalmente el abandono de un borrador según el flujo definido.
- Persistir la consulta y sus opciones tipadas, devolverlas en el listado existente y mostrarlas al recargar o abrir el enlace en otro navegador.
- Mantener el acceso, atribución de actividad y renovación de caducidad conforme a las operaciones de consulta existentes.

## Fuera de scope

- Registrar, modificar o mostrar votos; resolver o rechazar consultas.
- Cambiar la creación de consultas de texto o sus respuestas.
- Cambiar acceso, identidad, vigencia, disponibilidad o reglas de borrado.
- Cambiar requisitos normativos o aprobar artefactos actualmente en revisión.
- Una auditoría completa de conformidad WCAG de REL-001.

## Baseline relacionado

- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RF-CON-005 — Crear una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-005-crear-consulta-texto.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RN-CON-003 — Mínimo de una opción por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md)
- [RN-CON-004 — Fecha única entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-004-fecha-unica-consulta.md)
- [RN-CON-005 — Fechas propuestas desde hoy](../../03_requisitos/02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md)
- [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md)
- [RD-CON-003 — Título de la consulta](../../03_requisitos/03_datos/CON/rd-con-003-titulo-consulta.md)
- [RD-CON-004 — Momento de creación de la consulta](../../03_requisitos/03_datos/CON/rd-con-004-momento-creacion-consulta.md)
- [FLUJO-CON-001 — Crear una consulta de fechas](../../04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md)
- [WF-CON-004 — Crear una consulta de fechas](../../04_experiencia-usuario/03_wireframes/wf-con-004-crear-consulta-fechas.md)
- [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md)
- [SPEC-CON-001 — Crear una consulta con opciones de texto](../99_archivadas/spec-con-001-crear-consulta-texto.md)
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md)

## Módulos afectados

- [WEB](../../06_arquitectura/03_modulos/WEB/README.md)
- [API](../../06_arquitectura/03_modulos/API/README.md)

## Criterios de aceptación

1. Una identidad de participante seleccionada en un equipo vigente puede iniciar la creación desde el botón de icono dentro del calendario; el día abierto se deselecciona y el panel de detalle se reemplaza por el formulario de consulta.
2. El formulario permite un título de hasta 250 caracteres y empieza sin fechas seleccionadas. El botón de creación permanece desactivado hasta que hay título y al menos una fecha. El panel indica el máximo de diez fechas.
3. Pulsar una fecha admisible la añade; volver a pulsarla la retira. Una fecha no aparece dos veces. Al navegar entre meses las elecciones se conservan y se muestran en orden cronológico. Una undécima fecha no se añade; retirar una permite seleccionar otra.
4. WEB considera seleccionables hoy y fechas futuras según la zona horaria del dispositivo, usando la zona del equipo si no puede obtener la del dispositivo. Envía la zona efectiva con la creación; API valida la zona, formato estricto `YYYY-MM-DD` y que cada fecha siga siendo hoy o futura en esa zona al confirmar. Una fecha pasada se rechaza sin crear consulta ni opción ni renovar actividad.
5. Crear exige confirmación. Cancelar un borrador sin título ni fechas vuelve directamente al calendario. Si hay título o fechas, la confirmación enfoca inicialmente «Seguir editando» y ofrece «Abandonar edición»; seguir editando conserva íntegro el borrador.
6. API permite crear una consulta abierta `date` con una a diez fechas distintas, título válido, `participantId` perteneciente al equipo y Bearer válido. La escritura de consulta y opciones es atómica; la identidad creadora queda atribuida y la actividad del equipo solo avanza si se confirma la creación.
7. La API lista la consulta creada en `open`, con tipo `date`, fechas ISO y posiciones estables, ordenada por fecha de creación según el contrato de lista. Las consultas existentes de tipo `text` conservan su contrato de opciones `{id,text,position}`.
8. Tras confirmar, la consulta aparece en «Consultas»; permanece visible al recargar y al abrir el mismo equipo en otro contexto de navegador. Los errores de acceso, caducidad y transporte preservan el borrador cuando la persona puede continuar editándolo.
9. El panel sigue la disposición de [WF-CON-004 — Crear una consulta de fechas](../../04_experiencia-usuario/03_wireframes/wf-con-004-crear-consulta-fechas.md): junto al calendario en escritorio y debajo en móvil. El recorrido soporta teclado, controles con nombre/estado accesibles, foco adecuado y anuncios de error conforme al criterio aplicable de [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). Esta evidencia no se interpretará como auditoría completa WCAG de la entrega.

## Impacto baseline esperado

No se prevé cambio normativo: alcance, límites, unicidad, fechas válidas, confirmación, cancelación y disposición están definidos en los artefactos enlazados. El contrato técnico concreto de persistencia y transporte se fija aquí sin crear reglas de producto.

## Questions / Assumptions

- No hay decisiones bloqueantes pendientes. Los wireframes enlazados tienen estado documental `en_revision`; se respetará la indicación expresa vigente de la persona impulsora de aproximar la implementación al prototipo aceptado, sin elevar otros elementos en revisión a decisiones.
- El cliente envía `timeZone` como zona IANA efectiva del dispositivo; cuando no puede obtenerla, envía la zona IANA ya conocida del equipo. API valida el identificador antes de calcular «hoy». Esto permite hacer cumplir [RN-CON-005 — Fechas propuestas desde hoy](../../03_requisitos/02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md) en el momento de escritura.
- Para mantener el contrato existente, las solicitudes sin `type` siguen significando consulta `text`. Las solicitudes de fechas envían `type: "date"`, `participantId`, `title`, `options` (lista de fechas ISO `YYYY-MM-DD`) y `timeZone`.
- La respuesta de una opción de fecha será `{id, date, position}`. Las opciones de texto conservan `{id, text, position}`. El discriminador `type` indica cuál de las dos representaciones se aplica.
- En persistencia, la opción tendrá `option_text` nullable y `option_date DATE` nullable; exactamente uno tendrá valor. Una restricción única parcial por consulta y `option_date` protege la unicidad de fecha también ante escrituras concurrentes. La migración conserva intactas las filas de texto existentes y no altera IDs ni posiciones.
- La fecha es un día civil, sin hora ni conversión UTC. API calcula el día actual usando el reloj inyectado y la zona enviada; WEB ofrece el mismo criterio de manera anticipada, pero la validación de API es autoritativa.

## Research

- La API tiene `ConsultationService` para crear texto dentro de bloqueo/transacción del equipo y `OrmConsultationRepository` para persistir la consulta y opciones; el controlador pasa campos de entrada explícitos y `TeamOpenApiFactory` documenta contrato y tipo `text`.
- `consultation_option.option_text` es actualmente `NOT NULL`, limitada a 50 caracteres; el esquema permite consultas con tipo `date`, pero la opción aún solo representa texto. Por tanto, hace falta una migración compatible que añada almacenamiento DATE tipado y mantenga las filas actuales.
- Las operaciones de disponibilidad reciben una zona horaria; el calendario WEB conoce `timeZone` del equipo y puede intentar obtener la del dispositivo. El reloj API ya es inyectable.
- WEB tiene un calendario con botón de crear consulta deshabilitado, panel de detalle de día y una sección «Consultas» integrada en el layout. La consulta de texto ya usa la API de consultas, de modo que el nuevo tipo debe sumarse sin alterar el formulario ni la lista de texto.
- [SPEC-CON-001 — Crear una consulta con opciones de texto](../99_archivadas/spec-con-001-crear-consulta-texto.md) valida persistencia, autorización, renovación de actividad, Problem Details y agrupación/lista. Los nuevos casos deben ampliar esas pruebas con tipos fecha, límites, concurrencia de unicidad y zona horaria.

## Design / Structure

### API y base de datos

- Extender la creación existente con un discriminador opcional `type`; ausente equivale a `text` por compatibilidad. Para `date`, aceptar `participantId`, `title`, `options` como lista de valores civiles `YYYY-MM-DD` y `timeZone` IANA. La respuesta de creación y el listado exponen `type: date` y opciones `{id,date,position}`. Para `text`, preservar los cuerpos y respuestas vigentes.
- Añadir validación de fecha estricta, zona horaria válida, número de opciones de 1 a 10, duplicados y fecha mínima calculada en la zona efectiva al procesar la confirmación. Devolver `422 application/problem+json` indicando campos/opciones que deben corregirse.
- Mantener la verificación Bearer, vigencia y pertenencia de identidad dentro de la operación protegida. Ejecutar creación, opciones y renovación de actividad en una única transacción con el bloqueo de equipo existente; errores dejan estado y actividad intactos.
- Añadir una migración PostgreSQL que permita `option_text` nulo, añada `option_date DATE`, exija exactamente un valor de opción y cree unicidad por consulta/fecha para valores de fecha. Mantener clave, posición, FK/cascada y datos actuales de texto. No añadir tablas de votos ni resolución.
- Extender entidades Doctrine, repositorio, servicio, controlador, Problem Details y OpenAPI con ambos tipos. Exportar y contrastar OpenAPI frente a respuestas de API probadas.

### WEB

- Activar el botón con icono de crear consulta de fechas en el calendario. Al activarlo, deseleccionar el día abierto y sustituir su panel por el formulario previsto en WF-CON-004; en móvil, colocar el formulario bajo el calendario.
- Reutilizar el calendario, identidad, layout y cliente API existentes. Guardar la selección del borrador como fechas civiles, conmutar al pulsar, ordenar para presentar y conservar entre meses. No precargar marcas de disponibilidad como opciones.
- Obtener la zona horaria con `Intl.DateTimeFormat().resolvedOptions().timeZone`; si no está disponible o no es válida, usar `timeZone` del equipo. Enviar la zona efectiva al confirmar.
- Presentar confirmación de creación y cancelación condicional según el flujo. Mantener el título y fechas cuando se elige seguir editando o cuando falla la petición; mostrar y enfocar/ anunciar errores de campo sin perder selección.
- Al completar, cerrar el panel y actualizar/refrescar la lista real de consultas, manteniendo la representación existente de consultas de texto.

## Plan por slices

1. **Persistencia y reglas:** ampliar opción Doctrine con valor fecha, migración de compatibilidad y restricciones PostgreSQL; probar preservación de texto, forma de fecha, unicidad, cascada y rollback.
2. **API date:** agregar validación pura, discriminador compatible, validación de zona/fecha, escritura atómica, salida tipada y OpenAPI; probar autorización, expiración, límite/duplicidad, cruces de medianoche con reloj controlado y reintento/concurrencia.
3. **Calendario y composer:** implementar el estado de selección y panel conforme a WF-CON-004 en escritorio/móvil, con confirmación/cancelación, teclado, foco y errores; cubrir con pruebas WEB.
4. **Integración y regresión:** conectar creación/listado, comprobar que el tipo texto sigue operando, cubrir recarga/segundo navegador y todos los criterios con E2E.

## Evidencia / Validation

- API unitarias: límites 1/10, título de 250 y rechazo de 251, fechas ISO válidas/inválidas, fechas repetidas, ayer/hoy/mañana en varias zonas, zona IANA inválida y cambio de día entre selección y confirmación.
- PostgreSQL/Doctrine: migrar una base con consultas de texto existentes; verificar datos, IDs, orden y lectura intactos; crear consulta fecha y verificar `DATE`, restricción única, transacción/rollback y cascada de equipo. Ejecutar `doctrine:schema:validate` tras la migración.
- API de integración: Bearer ausente/inválido, enlace no encontrado, participante ajeno, equipo caducado, fecha pasada, tipo inválido, carga inválida, persistencia sin parciales y actividad solo al crear; listado distingue correctamente `text` y `date`.
- OpenAPI: contrato de ambos cuerpos y respuestas, campo de zona, seguridad, límites, formato fecha, códigos/problem details y compatibilidad del POST de texto sin `type`.
- WEB: pruebas de selección/toggle/orden/máximo/navegación, zona local con fallback, panel de escritorio/móvil, acción deshabilitada, confirmaciones, conservación de borrador, teclado, foco y anuncios.
- Playwright: crear fecha, verla en Consultas, recargar y abrir en contexto nuevo; probar cancelación vacía/no vacía, selección en meses distintos, límite 10 y validación cuando una fecha deja de ser admisible; smoke de creación de texto.
- Comandos API reales: `docker compose exec api composer test`, `docker compose exec api composer cs:check`, `docker compose exec api composer stan`, `docker compose exec api composer rector:check`, `docker compose exec api php bin/console lint:container`, `docker compose exec api php bin/console doctrine:schema:validate`.
- Comandos WEB reales: `npm --prefix apps/web test`, `npm --prefix apps/web run test:e2e`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run format:check`, `npm --prefix apps/web run build`. Usar Node 22 para los comandos WEB.
- Repositorio: `python3 pdi/scripts/validate_structure.py` y `python3 pdi/scripts/artifact_index.py --id REL-001`.

## Registro de implementación — 2026-10-05

- **Slice 1 — Persistencia y reglas: implementada.** `ConsultationOptionRecord` representa texto o fecha civil; migración `Version20261005170000` permite datos tipados, conserva las filas de texto, impone exactamente un valor y unicidad parcial de fecha. `ConsultationApiTest` verifica fecha `DATE`, compatibilidad textual, restricción única, restricción de tipo y persistencia/cascada.
- **Slice 2 — API date: implementada.** El campo `type` ausente conserva `text`; `date` requiere zona IANA, fechas ISO estrictas y entre 1 y 10 valores distintos. La fecha mínima se calcula en la zona enviada dentro del bloqueo transaccional, antes de persistir o actualizar actividad. Respuesta, listado y OpenAPI distinguen opciones de fecha/texto.
- **Slice 3 — Calendario y composer: implementada.** El icono activa selección manual y el panel reemplaza el detalle; fechas ordenadas, límite 10, confirmación y cancelación condicional. En móvil, el composer queda debajo del calendario, acorde a WF-CON-004.
- **Slice 4 — Integración y regresión: implementación completada.** Al cerrar apply, Playwright focal cubría alta, navegación entre meses, respuesta/listado de fecha, confirmación, cancelación y borrador móvil; PHPUnit cubría persistencia, autorización, fechas/zona horaria, actividad y compatibilidad de texto. La verificación formal amplió la cobertura E2E a recarga, segundo contexto y errores anunciados; `TeamCleanupTest` añade cascada de opciones tipadas de fecha sin introducir tablas de votos/resoluciones.
- Checks de apply ejecutados inicialmente: API, 35 pruebas / 291 aserciones, CS Fixer, PHPStan, Rector y esquema Doctrine sincronizado; WEB, 4 pruebas unitarias, lint, formato y build. El E2E focal inicial pasó 3/3. La validación formal y sus pruebas ampliadas se registran a continuación.
- No se modifica el baseline ni se amplía scope. Los criterios sobre votos/resoluciones de SPEC-EQU-002 siguen parciales mientras esos conceptos no se implementen.

## Convergence

Al verificar, contrastar criterios, contrato OpenAPI, migración real/mapeo ORM, UX frente al wireframe enlazado y regresiones de texto. Registrar cualquier límite de accesibilidad global como fuera de scope, sin convertir evidencia focal en afirmación de conformidad completa.

La comparación inicial detectó que [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md) seguía `PLANIFICADO` en [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) pese a tener implementación verificada. Se actualizó el estado a `VALIDADO`, acotado a la creación de consultas de fechas; los votos y la resolución permanecen en sus requisitos planificados.

| Aspecto | Clasificación | Resolución |
|---|---|---|
| Reglas, API, persistencia y UX de creación de consultas de fechas | Sin drift — código conforme | Tests, migración y criterios de aceptación respaldan la implementación. |
| Votos y resolución | F — fuera del scope de SPEC-CON-002 | No se añaden como comportamiento implementado; siguen pendientes en [RF-CON-002 — Registrar y cambiar un voto](../../03_requisitos/01_funcionales/CON/rf-con-002-votar.md) y [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md). |
| Estado de delivery en REL-001 | Desfase de delivery, sin drift normativo | Corregido a `VALIDADO` para la creación cubierta por esta SPEC, sin cambiar el baseline. |
| Arquitectura y contrato API | Sin drift | Dominio, aplicación, persistencia y transporte siguen separados; OpenAPI y compatibilidad del tipo texto están probados. No se requiere ADR ni `pdi:baseline-update`. |

## Resultado de verificación — 2026-10-05

| Criterio de aceptación | Evidencia | Resultado |
|---|---|---|
| 1. Inicio desde calendario, identidad y sustitución del detalle | `date-consultations.spec.ts` ejecuta el flujo con teclado, comprueba que ningún día queda seleccionado al abrir el composer y navega a Consultas después de crear. Suite focal actual: 4/4. | PASS |
| 2. Título, estado inicial del formulario, activación y máximo | La prueba focal comprueba el botón desactivado al abrir el formulario y tras escribir solo el título, y activado tras seleccionar una fecha. El componente limita a 250 caracteres y muestra el máximo 10; API rechaza título 251 y más de 10 opciones. E2E 4/4 y API 35/291. | PASS |
| 3. Añadir/quitar, unicidad, orden, navegación y límite 10 | Playwright cubre selección con teclado, conservar fechas al cambiar de mes, orden cronológico, bloqueo de la undécima fecha y selección tras retirar una; E2E focal 4/4. API verifica unicidad en dominio y base de datos; suite API 35/291. | PASS |
| 4. Zona efectiva y rechazo de fechas no admisibles sin mutación parcial | `ConsultationApiTest::testCreatesListsAndValidatesDateConsultationsInTheSubmittedTimeZone` cubre el cambio de día entre zonas, fechas ISO inválidas, ayer, duplicados, zona no válida, ausencia de persistencia parcial y actividad intacta. Los tests API pasaron durante apply (35 pruebas, 291 aserciones). | PASS |
| 5. Confirmación y cancelación condicional conservando borrador y foco | E2E cubre confirmación de creación, cancelación vacía y con borrador, foco inicial en «Seguir editando» y conservación de título/fecha. Suite focal 4/4. | PASS |
| 6. Creación API autorizada, atómica y atribuida | `ConsultationApiTest` comprueba creación, participante, Bearer, persistencia de consulta y opciones, renovación de actividad solo al confirmar e invariantes ante errores; API 35 pruebas / 291 aserciones. | PASS |
| 7. Lista tipada y compatibilidad con consultas de texto | `ConsultationApiTest` crea y vuelve a listar consulta de fecha con opciones ISO/posiciones y conserva creación/lista textual; `TeamApiTest` contrasta OpenAPI. API 35/291. | PASS |
| 8. Consulta disponible tras confirmar, recargar y abrir otro navegador | E2E verifica tras crear que la lista vuelve a solicitarse al recargar y al abrir un segundo `BrowserContext`; ambas lecturas reciben la consulta. `ConsultationApiTest` confirma create/list persistidos en PostgreSQL. La lectura WEB usa respuestas simuladas y la persistencia se verifica en la integración API, no en un E2E único de extremo a extremo. | PASS |
| 9. Disposición escritorio/móvil, teclado, nombres, foco y anuncios | E2E comprueba composición móvil de una columna, controles localizables por nombre accesible, activación por teclado, foco inicial en confirmación de cancelación y `role=alert` al fallar la creación preservando borrador. E2E 4/4. No es auditoría WCAG completa. | PASS |

### Checks de esta verificación

- API: `docker compose exec -T api composer test` PASS, 35 pruebas / 291 aserciones; `composer cs:check`, `composer stan` y `composer rector:check` PASS; `lint:container` y `doctrine:schema:validate` PASS.
- PostgreSQL/Doctrine: `doctrine:migrations:status` indica aplicada `Version20261005170000`, 4/4 migraciones; validación de esquema PASS en la base `synqo` y bajo `--env=test`.
- WEB con Node 22: 4 pruebas unitarias, lint, Prettier y build PASS.
- E2E Playwright focal actual: 4/4 PASS. Incluye estado inicial desactivado, alta/lista, recarga y segundo contexto con rutas simuladas, recorrido móvil, error HTTP anunciado con borrador preservado y máximo de 10.
- `python3 pdi/scripts/validate_structure.py`, Prettier del archivo E2E y `git diff --check`: PASS.

**Gate: READY_FOR_CHANGE_CONVERGE.** Los nueve criterios tienen evidencia PASS. La persistencia se verifica en la integración API PostgreSQL y la restauración de lista tras recarga/segundo contexto en E2E con respuestas HTTP simuladas; no se afirma que exista una E2E única conectada a PostgreSQL.

**Gate de convergencia: READY_FOR_CHANGE_CLOSE.** El drift de delivery fue corregido. No queda drift significativo de baseline, SPEC, implementación, tests o arquitectura en el alcance; la auditoría WCAG global y los votos/resolución permanecen fuera de esta SPEC.

## Resultado de cierre

**DONE — Change cerrado y archivado el 2026-10-05.** Los nueve criterios pasan; API (35 pruebas, 291 aserciones), checks estáticos, esquema/migración Doctrine, WEB y E2E focal (4/4) están validados. `RF-CON-001` queda `VALIDADO` en `REL-001`. No se modificó el baseline. Los votos, resolución y auditoría WCAG global permanecen como trabajo posterior según sus requisitos. Sin commit asociado todavía.

## Definition of Ready

- Spec concreta y vinculada a requisitos, reglas, flujo, wireframe y módulos definidos.
- No quedan decisiones funcionales o arquitectónicas bloqueantes.
- Investigación suficiente para precisar cambios de esquema, API, UX, transacción, compatibilidad y pruebas.
- Slices implementables y evidencia de validación definida con comandos existentes.
- El alcance no requiere modificar el baseline.

**Gate de preparación (histórico): READY_FOR_CHANGE_APPLY.**
