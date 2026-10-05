---
id: SPEC-DIS-001
nivel: N2
estado: cerrada
release: REL-001
---

# SPEC-DIS-001 — Disponibilidad diaria y visor del equipo

## Objetivo

Realizar la disponibilidad diaria compartida y su consulta en el calendario del equipo para avanzar [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md), a partir del acceso y la selección de identidad ya entregados en [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](../99_archivadas/spec-equ-001-arranque-equipo-local.md).

## Clasificación

Change de **realización N2**: combina persistencia y reglas temporales en API con interacción y visor en WEB. Afecta a dos módulos y requiere validar acceso, datos compartidos y recuperación tras fallos.

## Scope

- Marcar, modificar y retirar la disponibilidad de la identidad activa según [RF-DIS-001 — Marcar y modificar disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md).
- Consultar en el calendario el estado agregado y el estado de la identidad activa, con detalle diario, según [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md).
- Persistir las marcas por equipo, participante y día, y reflejar los cambios entre navegadores con acceso al equipo.

## Fuera de scope

Crear consultas de fechas o texto, votar, resolver consultas y borrar definitivamente equipos caducados. Esas capacidades figuran como entregas pendientes independientes en [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md).

## Baseline relacionado

- [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md)
- [RF-DIS-001 — Marcar y modificar disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RN-DIS-001 — Disponibilidad diaria del equipo](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md)
- [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md)
- [RD-DIS-001 — Disponibilidad vigente por día](../../03_requisitos/03_datos/DIS/rd-dis-001-disponibilidad.md)
- [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md)
- [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md)
- [FLUJO-DIS-001 — Marcar disponibilidad en el calendario](../../04_experiencia-usuario/02_flujos/flujo-dis-001-marcar-disponibilidad.md)
- [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md)
- [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md)
- [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md)
- [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md)
- [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md)
- [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](../99_archivadas/spec-equ-001-arranque-equipo-local.md)

## Módulos afectados

- [WEB](../../06_arquitectura/03_modulos/WEB/README.md)
- [API](../../06_arquitectura/03_modulos/API/README.md)

## Criterios de aceptación del Change

1. Una identidad seleccionada puede marcar un día actual o futuro como disponible, quizá o no disponible, cambiar la marca y retirarla pulsando de nuevo la opción activa. «Sin marcar» es ausencia de marca; no se presenta como cuarta tarjeta de edición.
2. La API impide modificar días anteriores a «hoy» en la zona del dispositivo comunicada por WEB; si no se obtiene, usa la zona del equipo. El mismo día pasado continúa consultable. El control usa el reloj del servidor y comprueba la regla de nuevo en cada escritura.
3. Las marcas se guardan por equipo, participante y fecha sin mezclarse con votos. Una recarga o apertura del enlace desde otro navegador devuelve los datos confirmados. Una lectura no reinicia la caducidad; una marca, cambio o retirada efectiva sí la reinicia. Una escritura fallida o idéntica al valor vigente no la reinicia.
4. El resumen de cada día muestra el estado más restrictivo indicado y los tres recuentos según [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md); sin marcas muestra un estado neutro. El detalle agrupa los participantes por estado, omite a quienes no marcaron y muestra «Tú» primero dentro de su grupo.
5. El calendario abre en el mes natural actual. Permite recorrer meses, alternar entre días del mes y semanas completas de lunes a domingo, y regresar a «Hoy» cuando queda fuera de las fechas visibles. Los días vecinos conservan su fecha real.
6. «Equipo» muestra el agregado en las casillas; «Mi disponibilidad» muestra la marca de la identidad activa o su ausencia. Cambiar de modo o identidad no altera el desglose compartido del detalle ni los datos persistidos.
7. Seleccionar un día abre el detalle. En móvil se presenta como diálogo sobre el calendario y se cierra devolviendo el foco al día seleccionado. Los días pasados se distinguen visualmente y muestran las tarjetas sin permitir cambios.
8. Un cambio se refleja de inmediato en casilla, recuentos y detalle. Si la API falla, WEB restaura el estado anterior y ofrece reintentar la misma acción solo si el equipo y la fecha aún la permiten. Un error de acceso o caducidad lleva al estado de enlace correspondiente.
9. El recorrido se puede usar en escritorio y navegador móvil, en ambos temas, con teclado, nombres y estados accesibles, foco y anuncios de cambios y errores. La auditoría completa de conformidad WCAG de la entrega sigue el gate de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md).

## Impacto baseline esperado

Ninguna regla normativa nueva: este Change realiza los dos RF y sus reglas, datos y UX enlazados. Las decisiones de ruta, forma de respuesta y esquema de persistencia que siguen son contrato técnico de esta SPEC, no nuevas reglas de producto.

## Questions / Assumptions

- **Identidad y acceso — resuelto:** la identidad activa indica bajo qué participante se escribe; el Bearer del enlace autoriza la operación. La identidad recordada no es una credencial, conforme a [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md) y [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).
- **Zona del dispositivo — resuelto técnicamente:** WEB enviará una zona IANA opcional en la mutación. La API usará esa zona solo para determinar si la fecha admite edición; si el navegador no la obtiene, usará la zona ya guardada del equipo. Una zona enviada pero inválida dará `422`. El enlace compartido no acredita la zona física del dispositivo; este contrato transporta el dato requerido por [RN-DIS-001 — Disponibilidad diaria del equipo](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md) sin tratarlo como credencial.
- **Cambios simultáneos — resuelto técnicamente:** la base conserva un único valor vigente por participante y día. Las escrituras se serializan para el mismo equipo; gana la última escritura confirmada. La respuesta devuelve el día autoritativo y WEB lo reconcilia con su estado optimista. No se introduce historial ni resolución de conflictos entre navegadores porque [RD-DIS-001 — Disponibilidad vigente por día](../../03_requisitos/03_datos/DIS/rd-dis-001-disponibilidad.md) no los prevé.
- **Consultas — fuera de scope:** el acceso visual a «Crear consulta de fechas» puede permanecer informativo/inactivo durante este Change; el visor no crea ni vota consultas. La capacidad se entregará al preparar [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md).
- **Decisiones bloqueantes:** ninguna identificada para los dos RF. Las copias, borrado definitivo y correo no forman parte de este Change. Si al implementarlo aparece una regla no deducible del baseline, se registrará y escalará antes de continuar.

## Research necesario

La base Angular ya tiene `TeamLayout`, `TeamApi` y una sección de calendario ilustrativa en `apps/web/src/app/pages/empty-section.ts`. API ya verifica Bearer, vigencia y equipo, usa Doctrine ORM, un reloj inyectado y bloqueo transaccional en `TeamService` y `OrmTeamRepository`. No existen operaciones ni tabla de disponibilidad. Se reutilizarán los contratos de WEB/API, el layout y la [convención HTTP común](../../06_arquitectura/03_modulos/API/convencion-http.md), sin añadir un módulo tecnológico distinto.

La revisión focal del [estado de la documentación](../../00_gobierno/02_estado-documentacion.md) declara `NOT_READY` para la entrega completa y señala expresamente que el calendario real necesita su propio Change. Los requisitos, el flujo y el wireframe enlazados proporcionan la definición funcional de este incremento; la auditoría de toda la entrega conserva su estado pendiente.

## Design / Structure

### API y persistencia

- Añadir una entidad Doctrine de disponibilidad diaria y una migración. Una fila representa una marca vigente con equipo, participante, día civil (`date`) y estado `available`, `maybe` o `unavailable`. Una restricción única sobre equipo, participante y día impide dos marcas vigentes; retirar la marca elimina la fila. Verificar que el participante pertenece al equipo antes de leer o escribir, y enlazar su borrado al del equipo/participante. El cálculo de resumen vive en API y no en WEB.
- Incorporar un caso de uso y un repositorio de disponibilidad con reglas de fecha, resumen y escritura atómica. Reutilizar la comprobación del enlace y la caducidad existentes. La escritura bloquea el equipo y verifica vigencia, identidad, fecha y valor antes de modificar; guarda marca y última actividad en la misma transacción. Una lectura no toca última actividad. El reloj es inyectable. Las operaciones no exponen CRUD automático de Doctrine.
- `GET /api/teams/current/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` exige Bearer y devuelve `200` con `days`, un elemento por fecha del intervalo inclusivo. Cada elemento contiene `date`, `state` agregado (`available`, `maybe`, `unavailable` o `null`), `counts` para los tres estados y `marks` con `participantId`, `participantName` y `state` para las marcas existentes. La API admite intervalos de hasta 42 días inclusivos, suficientes para cualquier mes completado por semanas; valida formato, orden y límite antes de consultar.
- `PUT /api/teams/current/availability/{date}/participants/{participantId}` exige Bearer y recibe JSON `{ "state": "available" | "maybe" | "unavailable" | null, "timeZone"?: "Europe/Madrid" }`. `null` retira la marca. Devuelve `200` con `day` en la misma forma de lectura y `expiresAt` actualizado. Repetir exactamente el estado vigente es una escritura idempotente sin modificación ni prórroga. Un participante ausente o ajeno al equipo produce `404` genérico.
- Errores aplicables: `400` para JSON o parámetros de consulta mal formados; `401` sin Bearer; `404` para enlace inválido, equipo borrado o participante ajeno; `410` para equipo caducado aún conservado; `422` para estado, fecha o zona inválidos y para un día ya pasado; `500` para fallo inesperado. Las respuestas y errores siguen Problem Details, `Cache-Control: no-store`, los tipos y campos estables de la [convención HTTP común](../../06_arquitectura/03_modulos/API/convencion-http.md). OpenAPI documenta cuerpos, parámetros y estados reales. No se usa `403`: seleccionar identidad no crea un permiso diferente del enlace.

### WEB

- Sustituir solo la rama de calendario de `EmptySection` por un componente de disponibilidad; conservar la sección de consultas y el `TeamLayout`. `TeamApi` añade lectura del intervalo y escritura del día. El `TeamLayout` comparte equipo e identidad activa con la vista hija y actualiza la fecha de caducidad tras una mutación confirmada.
- Calcular los días del mes por fecha civil y zona aplicable, sin convertir la fecha `YYYY-MM-DD` en un instante UTC para decidir «hoy». Pedir a la API el intervalo visible al entrar o cambiar de mes/modo; mostrar carga, estado vacío y error con reintento. La representación del día usa el agregado que entrega API o la marca de la identidad activa; el detalle conserva los recuentos y nombres del equipo en ambos modos.
- Mantener selección y modo al actualizar datos. Al editar, actualizar de forma optimista la casilla y el detalle; al confirmar, reconciliar con el día devuelto y la fecha de caducidad; al fallar, restaurar el día anterior y mostrar el aviso con «Reintentar» conforme a la variante validada del [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md). Volver a comprobar elegibilidad temporal antes del reintento.
- Conservar la estructura visual del calendario aprobado: encabezado del mes, controles de navegación, alcance y extensión, cuadrícula de lunes a domingo y panel de detalle en escritorio. En móvil, detalle en diálogo centrado con cierre y retorno de foco. Cada día y control dispone de nombre, estado y foco perceptibles; el color no es la única señal del estado.

## Plan por slices

1. **Reglas y datos:** migración Doctrine, modelo de marca vigente, cálculo de «hoy» y resumen, repositorio y pruebas de reglas puras y de integridad con PostgreSQL.
2. **Contrato API:** lectura del intervalo y mutación protegida con reloj/lock, caducidad y actividad; OpenAPI y pruebas de integración de acceso, validación, concurrencia, lectura tras recarga y no modificación en errores.
3. **Visor WEB:** reemplazar calendario ilustrativo por cuadrícula real, navegación de meses, semanas completas, «Hoy», modos y detalle; pruebas de componentes de fechas, agregados, identidad y estados de carga.
4. **Edición y recorrido:** conectar las tres tarjetas, actualización optimista, rollback y reintento, caducidad en cabecera y diálogo móvil; probar dos navegadores, teclado, foco y tamaños móvil/escritorio con los comandos del proyecto.

## Evidencia / Validation

- API: probar estados y recuentos neutro/mixto, fecha pasada y borde de día en dos zonas, fallback de zona, días vecinos, autorización, equipo caducado y borrado, participante ajeno, unicidad y escrituras concurrentes. Verificar que la lectura y el `PUT` idéntico no renuevan caducidad y que una escritura efectiva sí; comprobar rollback completo ante fallo de guardado.
- WEB: pruebas de componentes para mes natural, semanas completas, «Hoy», modos, cambio de identidad, detalle, estado optimista y restauración/reintento; recorrido Playwright con dos contextos, recarga, días pasados y móvil. Revisar manualmente foco, teclado, anuncios y contraste de los controles nuevos en ambos temas; la auditoría WCAG completa de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) queda pendiente para la release.
- Comandos existentes: `docker compose exec api composer db:reset:test`, `docker compose exec api composer test`, `docker compose exec api composer cs:check`, `docker compose exec api composer stan`, `docker compose exec api composer rector:check`, `docker compose exec api php bin/console doctrine:schema:validate`, `npm --prefix apps/web test`, `npm --prefix apps/web run test:e2e`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run format:check` y `npm --prefix apps/web run build`. La base de prueba puede reiniciarse; no reiniciar la base de desarrollo para validar.
- `pdi:change-verify` contrastará cada criterio anterior con pruebas, contrato OpenAPI, comportamiento en navegador y baseline. `pdi:change-converge` resolverá discrepancias antes del cierre.

## Registro de apply — 2026-10-05

Los cuatro slices tienen implementación de producto en la rama aislada `change/dis-001-apply`, pendiente de integración y de la fase posterior de verificación. El estado documental continúa `ready`; este registro no declara criterios de aceptación superados ni cierra el Change.

- **Reglas y datos:** entidad Doctrine y migración de marcas vigentes, unicidad por equipo/participante/fecha, borrado en cascada, fechas civiles y resumen diario en dominio. El repositorio comprueba pertenencia y persiste la marca con la actividad dentro de la transacción que bloquea el equipo.
- **Contrato API:** recursos públicos separados de la entidad; lectura del intervalo inclusivo de hasta 42 días y escritura con Bearer, vigencia, pertenencia, reloj inyectado y zona IANA opcional. Las escrituras efectivas renuevan actividad; la lectura y los valores idénticos la conservan. El controlador diferencia intervalo o JSON malformado (`400`) de entrada de mutación inválida (`422`) y mantiene Problem Details y `no-store`. Se amplía OpenAPI con ambas operaciones y sus esquemas.
- **Visor WEB:** componente propio para la ruta de calendario; mes natural inicial, semanas completas, fechas vecinas reales, navegación y retorno a hoy, alcance equipo/identidad, detalle con recuentos compartidos y «Tú» primero. El cálculo de hoy usa la zona del dispositivo o la del equipo; la aritmética de cuadrícula usa fechas civiles independientes de la zona del navegador.
- **Edición y recorrido:** tres tarjetas permiten marcar, cambiar y retirar; estado optimista, reconciliación con el día autoritativo, actualización de caducidad, restauración y reintento de la misma acción mientras siga permitida. Las lecturas solicitadas durante una escritura esperan su resultado para conservar el estado optimista. El detalle móvil se abre en un diálogo nativo y devuelve el foco a la casilla al cerrar; los avisos y estados se anuncian dentro del detalle. Se trasladan controles de icono, colores de estado y aviso rosado de fallo de la variante vigente del prototipo aceptado.

**Alcance de esta fase, por instrucción expresa de la persona usuaria:** solo implementación. La creación de pruebas, los checks técnicos, la matriz de aceptación y la revisión independiente se reservan para la verificación posterior. La validación estructural documental también queda pospuesta por esa instrucción; no se cambian enlaces normativos existentes ni el baseline.

**Ejecuciones tempranas anteriores a esa instrucción:** `npm --prefix apps/web run build` completó en una versión intermedia. `npm --prefix apps/web test` ejecutó once pruebas, con un fallo de `ExpressionChangedAfterItHasBeenCheckedError` al invocar directamente la edición optimista en una prueba nueva. El archivo nuevo de pruebas se retiró del alcance al recibir la instrucción; se añadió una notificación explícita de cambio al iniciar la edición, sin repetir esa ejecución. Estos resultados intermedios no verifican el estado final de la rama. No se ejecutaron comandos Compose, reinicios de base, E2E ni checks PHP; no hay PHP local disponible. No se añadieron ni modificaron pruebas en el resultado de apply.

**Pendientes concretos para la fase siguiente:** integrar con la capacidad de borrado de equipos, ejecutar la migración y comprobar esquema, integridad, concurrencia y rollback en PostgreSQL; preparar la evidencia WEB/API y comprobar el recorrido móvil/escritorio en ambos temas. La prueba existente `TeamApiTest::testOpenApiListsOnlyTheTeamOperations` contiene una expectativa de tres rutas que deberá revisarse en la fase de pruebas al añadir estas dos operaciones. No se identificaron decisiones nuevas de producto ni drift normativo durante apply.

### Verificación local — 2026-10-05 (actualizada)

**Gate: FAIL.** Los criterios 1–8 tienen evidencia funcional en pruebas API, PostgreSQL y navegador. El criterio 9 queda `PARTIAL`: foco, nombres, estados y regiones de anuncio están comprobados en navegador; falta comprobar la salida hablada con tecnología de asistencia y completar la auditoría WCAG. Las siete pruebas E2E de disponibilidad pasan; la suite global tiene además un fallo de consultas fuera del scope DIS. No hay hallazgos independientes `BLOCKER` ni `MAJOR`. El Change no queda listo para convergencia.

| Criterio | Estado | Evidencia y límite |
|---|---|---|
| 1. Marcar, cambiar y retirar | PASS | PHPUnit verifica persistencia y mutaciones; E2E cubre marcar, cambiar, retirar al pulsar la opción activa y recargar el enlace. |
| 2. Fecha editable y zona horaria | PASS | `AvailabilityApiTest` cubre fechas pasadas, zona inválida, hoy del dispositivo cerca de medianoche UTC, zona del equipo como fallback y lectura de una marca de un día pasado. |
| 3. Persistencia, actividad y concurrencia | PASS | PHPUnit comprueba idempotencia, renovación solo en cambios efectivos y rollback. La prueba concurrente mantiene bloqueada la fila de equipo, observa dos sesiones PostgreSQL esperando el lock y confirma ambas escrituras con una sola marca final. E2E confirma persistencia al reabrir el enlace en otro contexto. |
| 4. Agregado y detalle | PASS | PHPUnit prueba resumen neutro, recuentos y estado más restrictivo. E2E con dos identidades confirma el recuento compartido, omite una tercera sin marca y pone «Tú» primero en el grupo propio. |
| 5. Navegación del calendario | PASS | E2E recorre meses, comprueba semanas completas de lunes a domingo, fecha visible de hoy y retorno a «Hoy»; las fechas del calendario conservan representación civil `YYYY-MM-DD`. |
| 6. Equipo / Mi disponibilidad | PASS | E2E alterna modos y dos contextos de identidad; el detalle compartido conserva los datos. |
| 7. Detalle, móvil y días pasados | PASS | E2E verifica diálogo móvil, cierre con retorno de foco y controles deshabilitados para un día pasado; API rechaza su escritura. |
| 8. Optimismo, fallo y reintento | PASS | E2E fuerza un `500`, comprueba restauración y reintenta la misma acción. PHPUnit fuerza un error PostgreSQL y confirma rollback de marca y actividad. |
| 9. Responsive, temas y accesibilidad | PARTIAL | La suite E2E cubre móvil, teclado, cierre de diálogo con retorno de foco, nombres/estados y tema oscuro. Chromium expone los días como botones con nombre accesible y `aria-pressed`; las tarjetas también exponen `aria-pressed` y hay regiones `status`/`alert`. Las combinaciones de texto/estado revisadas superan 4.5:1 en claro y oscuro. La prueba focal del 2026-10-05 confirma que el día seleccionado conserva una marca interior y muestra, al recibir foco por teclado, un anillo exterior de 3 px con el token `--focus` y separación de 3 px. No hay lector de pantalla instalado para comprobar anuncios de voz y esta ejecución no repite la revisión integral de accesibilidad; la conformidad WCAG completa sigue siendo un gate de REL-001. |

**Checks ejecutados — 2026-10-05:** `synqo_test` tenía una conexión inactiva de HeidiSQL y no se cerró ni reinició. Para API se creó una base temporal `synqo_verify_dis_20261005_dis001`, se aplicaron las tres migraciones hasta `Version20261005160000` y luego se eliminó: PHPUnit (**30 pruebas, 249 aserciones**), `composer cs:check`, `composer stan`, `composer rector:check`, `lint:container` y `doctrine:schema:validate` pasan. WEB con Node 22: pruebas unitarias (**4/4**), lint, format y build pasan. Playwright global terminó con **30/31**: las siete pruebas de disponibilidad pasan; falla una prueba de consultas, fuera del scope DIS, al no encontrar el campo «Texto de la opción 10» en `consultations.spec.ts`. Playwright integrado usa la API local y sus pruebas crean datos de prueba en la base de desarrollo; esta base no se reinició ni se limpió.

**Comprobación de accesibilidad — 2026-10-05:** Chromium Accessibility Tree confirma rol/nombre del botón de día (`lunes, 5 de octubre de 2026: ✓ Disponible`) y controles de estado. Las pruebas WEB usan nombres accesibles para activar controles y verifican `aria-pressed`; el E2E comprueba anuncios de guardado y alertas de fallo. La prueba focal de foco pasa: el día seleccionado conserva el indicador interior y el foco de teclado presenta anillo exterior de 3 px, color `--focus` y offset de 3 px. Los contrastes de texto/estado medidos en claro y oscuro y los tamaños adaptables constan en la revisión focal anterior. No hay Orca ni otro lector de pantalla instalado, por lo que no se verificó la salida hablada; la auditoría completa de criterios WCAG tampoco forma parte de esta ejecución. El criterio 9 permanece `PARTIAL`. El revisor independiente mantiene un hallazgo `MINOR` sobre integridad ante asociación equipo/participante cruzada por SQL directo; la API rechaza esa asociación y no se encontró camino HTTP que la permita.

**Siguiente paso:** resolver o aceptar explícitamente el resultado `PARTIAL` del criterio 9 antes de `pdi:change-converge`. La suite global también conserva el fallo de consultas fuera del scope DIS. Resultado de esta verificación: `FAIL`; no se declara `READY_FOR_CHANGE_CONVERGE` ni conformidad WCAG 2.2 AA.
## Definition of Ready

**READY_FOR_CHANGE_APPLY.** Objetivo, scope y exclusiones delimitados; requisitos, reglas, datos, UX y módulos WEB/API enlazados; contratos, persistencia, slices y evidencia definidos. No se han encontrado preguntas funcionales bloqueantes en este alcance. El estado global `NOT_READY` de la release corresponde a capacidades posteriores y auditoría completa, no impide preparar este incremento focal. La validación estructural de PDI no detecta enlaces rotos ni denominaciones incorrectas.

## Convergence

### Aceptación expresa del resultado parcial

El 5 de octubre de 2026, la persona impulsora acepta avanzar con el criterio 9 en `PARTIAL` y considera no crítico ese resultado para este Change. **Omisión activa:** queda pendiente comprobar la salida hablada con tecnología de asistencia y completar la auditoría WCAG 2.2 AA de la entrega. Esta aceptación no convierte el criterio en `PASS`, no acredita conformidad de [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) ni reduce el requisito vigente; la auditoría continúa como gate de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md).

### Comparación y resolución

| Aspecto | Clasificación | Resolución |
|---|---|---|
| Requisitos de disponibilidad diaria, persistencia, agregación y recorrido WEB | A — código | API, migraciones y recorrido WEB coinciden con la SPEC; criterios 1–8 están en `PASS` con las pruebas registradas. No requiere cambio del baseline. |
| Foco del día seleccionado | A — código | La marca interior de selección y el anillo exterior de foco de teclado se verifican con Playwright; no queda discrepancia en este punto. |
| Criterio 9 y auditoría WCAG completa | F — omisión aceptada para este Change | El resultado `PARTIAL` se acepta expresamente para avanzar. Se mantiene pendiente la evidencia de tecnología asistiva y la auditoría completa a nivel de REL-001. |
| Fallo en Playwright de creación de consulta de texto | F — fuera de scope | El recorrido DIS pasa 7/7. La suite global falla únicamente en `consultations.spec.ts` al buscar la opción 10; pertenece a consultas y no altera evidencia ni comportamiento cubierto por SPEC-DIS-001. Debe atenderse en el Change de consultas correspondiente. |
| Integridad ante asociación equipo/participante por SQL directo | Sin drift significativo | La API valida la pertenencia y no se halló una ruta HTTP que permita asociar una marca al participante de otro equipo. Se conserva el hallazgo `MINOR` del revisor como límite de integridad ante escrituras SQL directas; no contradice el contrato de operaciones del Change. |

No se encontró drift significativo de producto, arquitectura o contrato dentro del scope aceptado. No apareció nueva verdad normativa y no procede `pdi:baseline-update`. **Gate: READY_FOR_CHANGE_CLOSE con la omisión activa de accesibilidad descrita arriba.**

## Resultado de cierre

**DONE — Change cerrado y archivado el 2026-10-05 con aceptación expresa del criterio 9 en `PARTIAL`.** Los criterios 1–8 están en `PASS`; no se declara conformidad WCAG 2.2 AA. La accesibilidad completa sigue pendiente para REL-001. La verificación se realizó localmente; no se registra commit ni integración en `main`, por lo que el delivery queda `VALIDADO`, no `ENTREGADO`. El fallo de E2E de consultas queda fuera del scope de este Change y registrado para atenderse desde esa capacidad. No se modifica el baseline.
