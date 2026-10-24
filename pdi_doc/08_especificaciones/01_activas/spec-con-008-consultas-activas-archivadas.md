---
id: SPEC-CON-008
nivel: N2
estado: verificado
release: REL-005
---

# SPEC-CON-008 — Consultas activas y archivadas por vigencia calculada

## Objetivo y decisiones aprobadas

Petición y respuestas expresas del 2026-10-24: dos listas calculadas, Activas y Archivadas, con vigencia visible. No persistir pseudoestados ni vigencia. Las respuestas interactivas completan los casos inicialmente omitidos, sin cambiar las acciones de dominio.

## Fuentes y módulos

- [REL-005 — Ajustes de funcionalidad de consultas](../../01_producto/10_entregas/rel-005-ajustes-funcionalidad-consultas.md).
- [RF-CON-008 — Listar consultas por vigencia](../../03_requisitos/01_funcionales/CON/rf-con-008-listar-consultas-vigencia.md).
- [RD-CON-004 — Momento de creación de la consulta](../../03_requisitos/03_datos/CON/rd-con-004-momento-creacion-consulta.md).
- [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_requisitos/03_datos/CON/rd-con-006-ultima-edicion-consulta.md).
- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md), [FLUJO-CON-001 — Crear una consulta de fechas](../../04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md) y [WF-CON-004 — Crear una consulta de fechas](../../04_experiencia-usuario/03_wireframes/wf-con-004-crear-consulta-fechas.md): actualizar destino nominal a la lista calculada sin cambiar el formulario ni la validación temporal de creación.
- [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md), [RN-CON-002 — Resolución de una consulta abierta](../../03_requisitos/02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md).
- [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md): la ocupación por una abierta no depende de su ubicación ni de la ventana cargada.
- [Estructura inicial del equipo](../../04_experiencia-usuario/01_arquitectura-informacion/estructura-equipo.md) y [WF-CON-001 — Lista de consultas del equipo](../../04_experiencia-usuario/03_wireframes/wf-con-001-lista-consultas.md).
- [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md), [API — desarrollo](../../07_desarrollo/08_modulos/API/README.md), [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — desarrollo](../../07_desarrollo/08_modulos/WEB/README.md).
- [SPEC-CON-007 — Separar las entradas de creación de consultas por tipo](spec-con-007-entradas-creacion-por-tipo.md): coordinar escrituras en la página y fixtures; no es dependencia funcional de las listas.
- [SPEC-EVT-006 — Eventos activos y archivados por vigencia calculada](spec-evt-006-eventos-activos-archivados.md): misma política temporal y de paginación; implementación independiente coordinando archivos comunes.

## Matriz y decisiones cerradas

| Tipo y condición | Lista | Vigencia |
|---|---|---|
| Texto abierta | Activas | Creación |
| Texto resuelta | Activas | Resolución |
| Cualquier tipo rechazada | Archivadas | Rechazo |
| Fechas abierta con alguna opción de hoy o posterior | Activas | Creación |
| Fechas abierta con todas las opciones pasadas | Archivadas | Última fecha ofrecida |
| Fechas resuelta con alguna aceptada de hoy o posterior | Activas | Última fecha aceptada |
| Fechas resuelta con todas las aceptadas pasadas | Archivadas | Última fecha aceptada |

Todas las fuentes son días civiles: convertir creación/resolución/rechazo a fecha en la zona del equipo; conservar las fechas civiles propuestas sin reinterpretarlas como UTC. Hoy sigue vigente hasta comenzar mañana. Activas ASC y Archivadas DESC por día; desempate técnico por ID ASC en ambas listas. No usar fecha de edición ni hora como criterio. No cambiar la validación de fechas de alta/edición por zona del dispositivo: si su día civil difiere del día del equipo, una alta válida puede quedar ya Archivada según esta matriz. No forzar Activas por tratarse de una consulta recién creada.

La ventana inicial es inclusiva desde hoy menos seis días hasta hoy: todos sus elementos, aunque superen diez. Cargar más añade diez anteriores o los restantes. Mostrar «Vigencia» con la fecha usada para ordenar. Las abiertas archivadas conservan voto, edición y resolución actuales. No trasladar votos, cerrar automáticamente, cambiar evento/vínculo ni reabrir consultas.

No quedan preguntas funcionales pendientes. Las elecciones no requieren ADR: lectura y paginación dentro de los módulos existentes. Baseline-update sustituye la norma anterior de tres grupos por estado y creación descendente; las SPEC archivadas conservan su evidencia histórica.

## Investigación

Exploración en subagente de solo lectura confirmada: Controller → ConsultationService → ConsultationRepository/OrmConsultationRepository → TeamApi → ConsultationsPage. La lista actual devuelve todos los grupos open/resolved/rejected. Existen ClockInterface, zona del equipo, createdAt, opciones DATE y resolution.resolvedAt para aceptación/rechazo. La última aceptada se agrega únicamente sobre la relación consultation_resolution_option, no sobre todas las propuestas. No hacen falta nuevas columnas.

## Diseño y contrato API

Conservar GET /api/teams/current/consultations y autorización Bearer/equipo vigente. Sustituir conjuntamente el contrato de lista, cliente y OpenAPI:

- Petición inicial sin cursor: respuesta con active (todos), archived (toda la ventana), archivedCursor (opaco o null) y listContext: today YYYY-MM-DD, timeZone, recentDays y loadMoreCount.
- Cada resumen conserva sus campos actuales y añade effectiveDate YYYY-MM-DD; no cambia state ni type.
- Petición con archivedCursor: respuesta con archived (hasta el lote configurado), archivedCursor y listContext; no repite active. El cliente usa un método específico para esta continuación y concatena por ID, sin vaciar activas.
- Cursor inicial representa la frontera estrictamente anterior al inicio de la ventana, incluso si la ventana está vacía. Continuaciones usan (effectiveDate DESC, id ASC): fecha menor, o misma fecha e ID mayor. Consultar lote + uno para saber si hay más; null indica agotado.
- Cursor versionado y validado incluye recurso, equipo, zona, día de referencia y frontera. Nunca contiene credenciales ni sustituye la autorización. Mantener filtros por equipo en todas las consultas. Cursor mal formado, de otro equipo/recurso o versión: 400 Problem Details. Si cambió el día o zona desde la carga inicial: 409 con type urn:synqo:problem:list-context-changed; la WEB reinicia desde la carga inicial sin mezclar ventanas.
- Una petición obtiene hoy una sola vez desde el reloj inyectado. No se promete una instantánea transaccional entre peticiones: los datos son vivos. Tras crear, editar o resolver y al reabrir la lista, invalidar cursor y recargar desde inicio; una recarga del navegador también empieza en la ventana inicial. Descartar respuestas tardías de una generación anterior.

Derivar bucket/fecha en una proyección de lectura del repositorio y aplicar allí filtro, orden y límite de archivadas; no cargar todo el historial en PHP o WEB para cortarlo después. Se permite QueryBuilder o DBAL parametrizado dentro del repositorio, sin trasladar SQL a servicio/controlador. Agregados separados de ofrecidas/aceptadas evitan duplicados por joins y pérdida de opciones. Sin migración prevista; si la implementación detecta necesidad de persistir datos nuevos o cambiar reglas, escalar antes de ampliar scope.

Compatibilidad temporal comprobada durante apply: el equipo admite zonas PHP válidas, incluidos alias y offsets fijos. Validar el cursor con DateTimeZone, sin restringirlo al catálogo IANA. En PostgreSQL, un offset textual positivo tiene semántica POSIX diferente de PHP: para zonas sin transiciones usar el offset fijo en segundos mediante make_interval; para zonas con transiciones usar su nombre. El helper de contexto es compartido y la expresión SQL permanece en el repositorio. Verificar ambos signos y alias cerca de medianoche sin cambiar la validación del equipo.

## Integración del selector de vínculo, independiente de la paginación

ConsultationDetailPage.loadEvents actualmente combina events con consultations.open para excluir eventos ocupados. Eso deja de ser válido al paginar: una abierta archivada anterior a la ventana sigue ocupando su evento. Como preparación técnica común de ambos Changes de listas, el primero que se aplique añade openConsultationId (UUID o null) al resumen de la lista de eventos, incluso si mantiene todavía los cuatro grupos anteriores. El otro Change reutiliza y conserva el campo. Derivarlo autoritativamente de la asociación única consultation.open_event_id, filtrada por equipo, mediante proyección/join de lectura; no añadir columna, ni cargar todas las consultas o páginas para inferirlo.

Migrar loadEvents a una única lectura de eventos, sin forkJoin con el historial de consultas. Filtrar provisional y (openConsultationId es null o coincide con la consulta actual). Mientras siga vigente el contrato anterior de eventos usar unfinalized; después usar active. El asociado actual debe permanecer incluido y preseleccionado, y otro ocupado por una abierta archivada fuera de ventana debe excluirse. La API de cambio de vínculo mantiene su comprobación atómica y conflicto ante carreras. Este apoyo es aditivo: los dos órdenes de aplicación conservan el selector funcional sin depender de completar el otro Change.

## Constantes y presentación

Política compartida de listados en Application/Listing: RECENT_DAYS = 7 y LOAD_MORE_COUNT = 10, con cálculo de día/ventana y codec de cursor reutilizables. El primer Change aplicado crea este apoyo; el otro lo reutiliza. No introducir números mágicos equivalentes en repositorio o WEB ni duplicar políticas de consultas/eventos. Exponer valores en listContext; probar otra configuración en tests para demostrar que se ajustan sin reescribir reglas. Sin preferencias nuevas en localStorage.

Conservar tarjetas y navegación existentes, cambiar encabezados a Activas/Archivadas y añadir Vigencia. Conservar badge real y resumen de aceptadas. Cargar más queda dentro de Archivadas, con carga, bloqueo de doble pulsación y reintento accesible; mantener filas ante errores. Ventana vacía con historial conserva botón. Mensaje «Aún no hay consultas» solo si no hay activas, recientes ni historial anterior. Mantener temas y anchuras actuales; este cambio no rediseña formularios.

## Unidades y coordinación

API: ConsultationController, ConsultationService, puerto ConsultationRepository, OrmConsultationRepository, operaciones API Platform, TeamOpenApiFactory, política/cursor de listado y doc/architecture/api.md; EventRepository/OrmEventRepository y resumen de eventos para openConsultationId si aún no existe. WEB: team-api.ts, consultations-page.ts, consultation-detail.ts y sus tests/fixtures. Tests API: ConsultationApiTest, ConsultationDecisionApiTest y contrato TeamApiTest; WEB/E2E de consultas, fechas, navegación, responsive, accesibilidad, rendimiento y referencias que asuman tres grupos.

El principal mantiene contratos, reglas temporales, autorización y concurrencia. Repartir API, WEB y evidencia en tareas acotadas; nadie escribe simultáneamente team-api.ts, OpenAPI, apoyo compartido ni la página con otro Change. Integrar esos archivos secuencialmente. Las exploraciones se han realizado de forma independiente; no subagentes de subagentes.

## Criterios de aceptación y evidencia prevista

| Acceptance criterion | Evidence | Result |
|---|---|---|
| Toda la matriz, rechazos y última aceptada frente a última propuesta | ConsultationListingApiTest::testMatrixUsesTeamCivilDatesAndLatestAcceptedRatherThanOfferedWithoutWriting | PASS |
| Día del equipo, hoy, medianoche y ventana inclusiva de siete días | ListPolicyTest y ConsultationListingApiTest: DST, offsets, alias y creación en día distinto del dispositivo | PASS |
| Activas completas ASC, archivadas DESC, empate ID estable, Vigencia visible | API de matriz/empates y consultation-listing.spec.ts | PASS |
| Inicial >10, ventana vacía con anteriores, cargas 10/10/resto y agotado sin duplicados | API y E2E de doce recientes y veintitrés anteriores | PASS |
| Parámetros ajustables sin literales duplicados | ListPolicyTest y API con política alternativa | PASS |
| Pseudoestado no escribe, abierta archivada conserva voto/editar/resolver y puede volver activa | API compara datos/actividad y E2E de abierta archivada editada/votada | PASS |
| Autorización, acceso caducado, cursor inválido/ajeno y cambio de contexto | API 400/401/404/409/410 y E2E de reinicio | PASS |
| Selector excluye eventos ocupados por abiertas archivadas fuera de ventana y conserva asociado actual preseleccionado, en ambos órdenes de aplicación | Campo aditivo de eventos, API de ocupación y E2E de selector sin leer el historial; el contrato de dos grupos se revalida en el Change de eventos | PASS |
| Reintento conserva filas, doble pulsación, respuesta tardía y navegación | Ocho unitarias de página/selector y seis E2E de listado, incluido foco al volver de historial | PASS |
| Creación, evento asociado, detalle, teclado, cuatro anchuras y dos temas conservados | 189 casos E2E verificados y revisión independiente REVIEW_OK | PASS |

## Plan por slices y validación

1. MEDIUM — Política temporal/cursor y proyección API, contrato/OpenAPI y tests de matriz/ventana/empates/aislamiento. Revisión HIGH del principal para autorización y clasificación; sin decisiones de dominio delegadas.
2. MEDIUM — WEB consume contrato, dos listas/Vigencia/carga incremental, navegación, errores y fixtures. Separar archivos del trabajo API y coordinar los comunes con los otros Changes.
3. MEDIUM — Tests E2E con API real y reloj/datos controlados; revisión independiente, matriz real y convergencia documental. No declarar cierre con UNKNOWN.

En apply: docker compose exec -T api composer test; composer cs:check, stan, rector:check y php bin/console doctrine:schema:validate --env=test dentro del servicio api. Desde raíz activar source "$HOME/.nvm/nvm.sh" && nvm use antes de npm --prefix apps/web test, run lint, run format:check y run build; ejecutar E2E focalizados, reales y relacionados según scripts del proyecto. Cambios visuales deben revisarse expresamente durante apply; esta preparación no ejecuta ni actualiza snapshots ni realiza commit.

## Gate de preparación

READY_FOR_CHANGE_PREPARE completado; **READY_FOR_CHANGE_APPLY**, 2026-10-24. Todas las decisiones funcionales tienen respuesta expresa; baseline, contrato, unidades y plan están definidos. La evidencia de implementación permanece UNKNOWN. Mantener el índice de trazabilidad según autorización vigente. No implementar por esta operación de preparación.

## Evidencia de preparación — 2026-10-24

Exploración delegada y revisión independiente completadas: REVIEW_OK, sin BLOCKER/MAJOR ni decisiones funcionales abiertas. Validación documental: python3 pdi/scripts/validate_structure.py PASS (69 directorios, 17 skills), python3 pdi/scripts/artifact_links.py sin incidencias y git diff --check PASS. Baseline, release e índice de trazabilidad actualizados. No se han ejecutado tests de producto ni alterado código, snapshots, commits o despliegues; estos resultados acreditan preparación y no sustituyen apply/verify.

## Apply, verify y convergencia funcional — 2026-10-24

Implementación API, WEB y E2E en subagentes con archivos disjuntos y revisión independiente REVIEW_OK. Resueltos los hallazgos de foco tras reiniciar la ventana y separación del esquema OpenAPI de calendario respecto de los metadatos de lista. Un subagente de tests añadió el caso de alta válida por zona del dispositivo que nace archivada según el día del equipo. Sin decisiones funcionales nuevas, migraciones ni drift normativo.

Validación final: docker compose exec -T api composer test, **210 tests / 2206 assertions PASS**; doctrine:schema:validate --env=test PASS. Composer cs:check, stan y rector:check PASS. Con NVM: 51 unitarias WEB PASS, lint/formato/build PASS (495,01 kB antes del último ajuste de foco; el hook revalida el artefacto final). Suite WEB_TEST_PORT=4210 npm --prefix apps/web run test:e2e -- --workers=1: 188 de 189 PASS; el único fallo era el selector antiguo del benchmark. Corregidos sus encabezados y expectativas de estados, repetición focal PASS en 14,3 s. Quedan verificados los 189 casos, con API/PostgreSQL y correo Mailpit reales; 35 focalizados también verificados.

La continuación del subagente E2E falló por límite de uso; el principal ejecutó la suite y corrigió el fixture restante, sin atribuir esa ejecución al subagente. Se conservan todos los datos de desarrollo y se usa synqo_test aislada para las pruebas. La referencia Symfony autogenerada fuera de scope se restaura antes del commit.

Convergencia funcional PASS. Screenshots y cierre documental se ejecutarán al final de las tres implementaciones conforme a la instrucción expresa; no se declara ENTREGADA la release.
