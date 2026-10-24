---
id: SPEC-EVT-006
nivel: N2
estado: verificado
release: REL-004
---

# SPEC-EVT-006 — Eventos activos y archivados por vigencia calculada

## Objetivo y decisiones aprobadas

Petición y respuestas expresas del 2026-10-24: dos listas calculadas, Activos y Archivados, vigencia visible, ventana reciente y cargas anteriores. Sin persistir pseudoestados ni fecha de vigencia ni cambiar el ciclo de vida del evento.

## Fuentes y módulos

- [REL-004 — Eventos del equipo](../../01_producto/10_entregas/rel-004-eventos-del-equipo.md).
- [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md).
- [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md), [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md).
- [RD-EVT-002 — Autoría y momentos del evento](../../03_requisitos/03_datos/EVT/rd-evt-002-autoria-momentos-evento.md), [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md).
- [FLUJO-EVT-001 — Consultar y gestionar eventos](../../04_experiencia-usuario/02_flujos/flujo-evt-001-gestionar-eventos.md), [WF-EVT-001 — Lista de eventos del equipo](../../04_experiencia-usuario/03_wireframes/wf-evt-001-lista-eventos.md).
- [WF-EVT-002 — Ficha y edición de evento](../../04_experiencia-usuario/03_wireframes/wf-evt-002-ficha-evento.md): conservar acciones según estado real también desde Archivados.
- [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md), [API — desarrollo](../../07_desarrollo/08_modulos/API/README.md), [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — desarrollo](../../07_desarrollo/08_modulos/WEB/README.md).
- [SPEC-CON-008 — Consultas activas y archivadas por vigencia calculada](spec-con-008-consultas-activas-archivadas.md): comparte política temporal/cursor; no dependencia funcional. Coordinar archivos comunes sin escrituras simultáneas.

## Matriz y decisiones cerradas

| Estado y condición | Lista | Vigencia |
|---|---|---|
| Provisional sin fecha | Activos | Creación |
| Provisional con fecha, incluso pasada | Activos | Fecha del evento |
| Definitivo con fecha de hoy o futura | Activos | Fecha del evento |
| Definitivo con fecha pasada | Archivados | Fecha del evento |
| Rechazado, con o sin fecha | Archivados | Último rechazo |

Todas las fuentes se comparan por día civil: creación/rechazo se convierten a fecha en la zona del equipo; fecha de evento se conserva sin reinterpretarla como UTC. Hoy sigue vigente hasta comenzar mañana. Activos por día ASC y Archivados DESC; ID ASC como desempate técnico estable. No usar la hora ni última modificación de un evento no rechazado como criterio.

Mostrar todos los activos. Inicialmente, todos los archivados desde hoy menos seis días hasta hoy inclusive, aunque superen diez; cada Cargar más incorpora diez anteriores o los restantes. Mostrar «Vigencia» con esa fecha en cada tarjeta. Pseudoestado solo afecta ubicación: conservar edición, rechazo, recuperación, consultas vinculadas y calendario. Recuperar conserva fecha y devuelve provisional a Activos aunque esté vencida.

Todas las preguntas funcionales tienen respuesta expresa. Baseline-update sustituye las cuatro agrupaciones anteriores y sus órdenes. No requiere ADR: evoluciona lectura y presentación dentro de los módulos existentes; no se crea un nuevo estado de dominio.

## Investigación y restricciones

Exploración independiente de solo lectura: EventService calcula hoy con ClockInterface y zona del equipo, y ordena cuatro arrays completos del repositorio. TeamEventRecord conserva fecha, createdAt y lastModifiedAt; no hay rejectedAt ni historial. Rechazar siempre escribe lastModifiedAt y, mientras está rechazado, no se permite editar; la recuperación cambia estado y momento. Es suficiente para el último rechazo sin nueva columna.

El esquema admite lastModifiedAt nulo: validar fixtures y datos afectados antes de aplicar la nueva proyección. Un rechazado sin momento de rechazo es inconsistente; no inventar una fecha de creación como rechazo ni omitirlo silenciosamente. Registrar la anomalía y escalar su corrección si aparece; probar que el ciclo normal siempre garantiza ese dato.

El endpoint /events/calendar es separado y no se modifica: sigue excluyendo rechazados y conserva sus rangos/indicadores. ConsultationDetailPage.loadEvents usa la lista general para el selector de vínculo. Migrarlo de unfinalized a active filtrando provisional y disponibilidad de vínculo. Mantener todos los provisionales, incluidos los pasados; no ofrecer definitivos o rechazados por el mero cambio de grupos.

La disponibilidad no se puede inferir del listado paginado de consultas: una abierta archivada anterior a la ventana sigue ocupando el evento. El primer Change de listas que se aplique añade openConsultationId (UUID o null) a los resúmenes de eventos de forma aditiva, también al contrato anterior de cuatro grupos si todavía existe. Derivarlo de la asociación única consultation.open_event_id filtrada por equipo, mediante proyección/join de lectura, sin columnas nuevas ni descargar historial. El otro Change lo reutiliza.

loadEvents deja de combinar consultas con eventos: consume solo los eventos y acepta provisional con openConsultationId null o igual a la consulta actual. Mantener asociado actual incluido y preseleccionado. La API conserva validación atómica de unicidad y conflicto de carrera. Este apoyo común garantiza que cualquiera de los dos órdenes de aplicación preserve la elegibilidad, incluso si el otro Change aún no está implementado.

## Diseño y contrato API

Conservar GET /api/teams/current/events y autorización Bearer/equipo vigente. Sustituir conjuntamente el contrato de lista, cliente y OpenAPI:

- Petición inicial sin cursor: respuesta con active (todos), archived (toda la ventana), archivedCursor (opaco o null) y listContext: today YYYY-MM-DD, timeZone, recentDays y loadMoreCount.
- Cada resumen conserva sus campos actuales y añade effectiveDate YYYY-MM-DD y openConsultationId UUID o null; no cambia status ni la fecha del evento.
- Petición con archivedCursor: respuesta con archived (hasta el lote configurado), archivedCursor y listContext; no repite active. El cliente usa un método específico para esta continuación y concatena por ID, sin vaciar activas.
- Cursor inicial representa la frontera estrictamente anterior al inicio de la ventana, incluso si la ventana está vacía. Continuaciones usan (effectiveDate DESC, id ASC): fecha menor, o misma fecha e ID mayor. Consultar lote + uno para saber si hay más; null indica agotado.
- Cursor versionado y validado incluye recurso, equipo, zona, día de referencia y frontera. Nunca contiene credenciales ni sustituye la autorización. Mantener filtros por equipo en todas las consultas. Cursor mal formado, de otro equipo/recurso o versión: 400 Problem Details. Si cambió el día o zona desde la carga inicial: 409 con type urn:synqo:problem:list-context-changed; la WEB reinicia desde la carga inicial sin mezclar ventanas.
- Una petición obtiene hoy una sola vez desde el reloj inyectado. No se promete una instantánea transaccional entre peticiones: los datos son vivos. Tras crear, editar, rechazar o recuperar un evento y al reabrir la lista, invalidar cursor y recargar desde inicio; una recarga del navegador también empieza en la ventana inicial. Descartar respuestas tardías de una generación anterior.

Derivar bucket/fecha en una proyección de lectura del repositorio y aplicar allí filtro, orden y límite de archivados; no cargar todo el historial en PHP o WEB para cortarlo después. Se permite QueryBuilder o DBAL parametrizado dentro del repositorio, sin trasladar SQL a servicio/controlador. Sin migración prevista; si la implementación detecta necesidad de persistir datos nuevos o cambiar reglas, escalar antes de ampliar scope.


## Constantes y presentación

Política compartida en Application/Listing: RECENT_DAYS = 7 y LOAD_MORE_COUNT = 10, cálculo de día/ventana y codec de cursor reutilizables. El primer Change aplicado crea el apoyo; el otro lo reutiliza. No duplicar literales equivalentes en repositorio o WEB. listContext expone los valores; probar valores alternativos para acreditar parametrización sin reescribir reglas. No añadir preferencias visibles ni localStorage.

Conservar tarjetas, estado real, enlaces y acciones; sustituir grupos por Activos/Archivados y añadir Vigencia. Cargar más tiene estado de carga, bloqueo de doble pulsación y reintento que conserva tarjetas. Si la ventana está vacía pero existe historial, mostrar su sección con botón; solo mostrar equipo sin eventos cuando tampoco haya activos ni historial. Mantener temas, anchuras y teclado actuales.

## Unidades y coordinación

API: EventController, EventService, EventRepository, OrmEventRepository, EventOperations, TeamOpenApiFactory, apoyo compartido de listado y doc/architecture/api.md. WEB: team-api.ts, events-page.ts y consultation-detail.ts para el selector. Actualizar contrato/fixtures antiguos unfinalized/future/past/rejected en tests API, E2E y documentación técnica; calendario conserva contrato separado.

El principal mantiene dominio, autorización, contrato y límites temporales. Delegar API, WEB y evidencia con propiedad de archivos disjunta; integrar secuencialmente team-api.ts, OpenAPI y apoyo compartido con el Change de consultas. No subagentes de subagentes. Ninguna exploración ha implementado código.

## Criterios de aceptación y evidencia prevista

| Acceptance criterion | Evidence | Result |
|---|---|---|
| Matriz completa, provisional vencido activo y rechazo con/sin fecha archivado por rechazo | EventApiTest con reloj fijo; EventListingApiTest comprueba fecha de rechazo y anomalía NULL con error genérico 500 | PASS |
| Fechas civiles y hoy por zona del equipo; medianoche, ventana inclusiva y cambio horario | EventListingApiTest: Madrid/DST, Los Ángeles, US/Eastern, GMT+0100 y offsets de ambos signos; límite de ventana | PASS |
| Activos completos ASC, archivados DESC, empates ID y Vigencia visible | EventApiTest, unitarias de página y events.spec.ts | PASS |
| Inicial >10, ventana vacía con historial, cargas 10/10/resto, agotado sin duplicados | EventListingApiTest: 13 recientes y 23 anteriores; E2E con 12/10/10/3 | PASS |
| Siete/diez parametrizables sin duplicar literales | Política compartida, API con configuración 3/2 y WEB con valores alternativos | PASS |
| Editar/rechazar/recuperar reclasifica sin guardar pseudoestado; rechazo conserva su momento | EventApiTest; events-real.spec.ts, incluido provisional vencido que vuelve a Activos; lectura no altera actividad | PASS |
| Cursor inválido/ajeno, autorización/caducidad y cambio de contexto | API 400/401/409/410, recurso/equipo/versión/zona/día; unitaria WEB de reinicio 409 | PASS |
| Errores conservan filas, doble pulsación y respuestas tardías controladas | events-page.spec.ts: reintento, deduplicación, bloqueo, generación y retorno de foco | PASS |
| Selector incluye provisionales pasados elegibles y asociado actual preseleccionado; excluye definitivos/rechazados y eventos ocupados por abierta archivada fuera de ventana en ambos órdenes de aplicación | API de ocupación, unitarias de selector y event-consultations.spec.ts; contrato anterior verificado en el Change de consultas | PASS |
| Calendario, navegación histórica, temas, cuatro anchuras y teclado conservados | Suite completa 191/191 E2E; matrices responsive y revisión independiente REVIEW_OK | PASS |

## Plan por slices y validación

1. MEDIUM — Política/cursor compartidos, proyección paginada, Controller/contrato/OpenAPI y tests de matriz/orden/ventana. El principal revisa HIGH autorización y semántica de rechazo antes de integrar.
2. MEDIUM — Cliente/página, Vigencia/carga/reintento y actualización del selector de vínculo. Coordinar archivos comunes con consultas; no cambiar componentes de calendario.
3. MEDIUM — E2E, API real, fixtures y regresiones relevantes, revisión independiente, matriz y convergencia. Escalar cualquier inconsistencia real de momentos en rechazados; no ampliar scope por ocultarla.

En apply: docker compose exec -T api composer test, y dentro del servicio api composer cs:check, stan, rector:check y php bin/console doctrine:schema:validate --env=test. Desde raíz activar source "$HOME/.nvm/nvm.sh" && nvm use antes de npm --prefix apps/web test, run lint, run format:check y run build; ejecutar E2E focalizados de eventos, vínculos/calendario y reales según scripts. Referencias visuales requieren tratamiento expreso durante apply; esta preparación no ejecuta ni actualiza snapshots ni realiza commit.

## Gate de preparación

**READY_FOR_CHANGE_APPLY**, 2026-10-24: decisiones expresas, baseline actualizado, contrato de lectura y plan verificable. Evidencia de implementación UNKNOWN; revisión de preparación no equivale a validación funcional. Índice opcional mantenido por autorización vigente. No implementar en esta operación.

## Evidencia de preparación — 2026-10-24

Exploración delegada y revisión independiente completadas: REVIEW_OK, sin BLOCKER/MAJOR ni decisiones funcionales abiertas. Validación documental: python3 pdi/scripts/validate_structure.py PASS (69 directorios, 17 skills), python3 pdi/scripts/artifact_links.py sin incidencias y git diff --check PASS. Baseline, release e índice de trazabilidad actualizados. No se han ejecutado tests de producto ni alterado código, snapshots, commits o despliegues; estos resultados acreditan preparación y no sustituyen apply/verify.

## Ejecución de apply — 2026-10-24

Implementación delegada con propiedad disjunta de API, WEB y tests; revisión independiente de solo lectura. El principal conserva las decisiones de dominio, autorización y contrato. Se reutilizan ListPolicy, ListContext y ListCursor introducidos por [SPEC-CON-008 — Consultas activas y archivadas por vigencia calculada](spec-con-008-consultas-activas-archivadas.md), incluida la compatibilidad temporal de alias y offsets PHP mediante intervalos PostgreSQL. Sin migraciones ni cambios del ciclo de vida.

Comprobación previa de solo lectura sobre desarrollo: SELECT COUNT(*) FROM team_event WHERE status = 'rejected' AND last_modified_at IS NULL, resultado **0**. La proyección incluye una guarda para detectar esa inconsistencia sin inventar fechas; el manejador existente devuelve el error genérico y registra la excepción. Las pruebas usan la base synqo_test aislada, sin limpiar ni modificar datos de desarrollo.

Con NVM activado: npm --prefix apps/web test, **61 pruebas PASS**; lint, format:check y build PASS (497,67 kB iniciales). docker compose exec -T api composer test, **219 tests / 2394 assertions PASS**; cs:check, stan, rector:check y doctrine:schema:validate --env=test PASS. La focal de API verifica 35 tests / 520 assertions. Los E2E focalizados de eventos, vínculos y calendario pasan 28/28, incluidos tres recorridos reales con PostgreSQL. Revisión independiente final de código/tests: REVIEW_OK, sin hallazgos pendientes.

Suite final con NVM: WEB_TEST_PORT=4210 npm --prefix apps/web run test:e2e -- --workers=1, **191/191 PASS en 5,8 minutos**, con API/PostgreSQL y Mailpit reales. Benchmark automatizado 12,9 s, PASS. Se ajustaron los fixtures al nuevo contrato sin cambiar los criterios funcionales. Convergencia funcional PASS, sin drift significativo ni escalados pendientes. La referencia Symfony autogenerada fuera de scope se restaura antes del commit. La regresión visual y el cierre documental se harán después del tercer commit funcional, conforme a la secuencia autorizada; las releases siguen en implementación.
