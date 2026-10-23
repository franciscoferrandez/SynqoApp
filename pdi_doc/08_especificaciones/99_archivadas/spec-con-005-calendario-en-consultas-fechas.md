---
id: SPEC-CON-005
nivel: N2
estado: cerrado
release: REL-005
---

# SPEC-CON-005 — Calendario en consultas de fechas

## Objetivo

Preparar la creación y edición de consultas de fechas desde Consultas mediante un diálogo con título y calendario de disponibilidad del equipo. Petición expresa de la persona impulsora del 2026-10-21. Mostrar un ejemplo interactivo en los mockups antes de implementar. La creación desde el calendario principal conserva su recorrido actual en este Change.

## Clasificación

Evolución N2: cambia el recorrido de creación e incorpora edición de opciones persistidas y votos. Un único Change, asignado a [REL-005 — Ajustes de funcionalidad de consultas](../../01_producto/10_entregas/rel-005-ajustes-funcionalidad-consultas.md). Inicio mediante `pdi:change-new`: READY_FOR_CHANGE_PREPARE. Preparación mediante `pdi:change-prepare` en curso.

## Scope confirmado

- Crear consultas de fechas desde la pantalla de Consultas, sin pasar obligatoriamente por el calendario principal.
- Diálogo con título y calendario que muestra la disponibilidad del equipo, respetando las preferencias locales aplicables, incluidas semanas completas y regla de cálculo.
- Mantener las fechas elegidas marcadas en el calendario, sin apilarlas en una lista de opciones.
- En el calendario del popup solo se muestra el color y el resultado de la regla de disponibilidad, sin recuentos ni contadores de ningún tipo, aunque estén activados en las preferencias.
- Elegir «Fechas» o «Texto» antes de abrir el formulario; no alternar tipos dentro del borrador.
- Leer las preferencias guardadas; modificarlas únicamente desde el calendario principal.
- Incluir edición desde Consultas: cualquier participante del equipo, solo consultas abiertas, título editable con votos, añadir y retirar fechas y confirmación únicamente para retiradas con votos, siguiendo las reglas de edición de texto expresamente aceptadas.
- Mantener la creación desde el calendario principal como está; se aplaza la reutilización del nuevo diálogo en esa entrada.
- Preparar un mockup interactivo y someterlo a revisión antes de cambiar código del producto.

## Fuera de scope

Implementación durante la preparación, cambios implícitos de reglas, nuevas dependencias significativas, commits sin petición expresa y regresiones visuales automáticas. No cambiar vínculos ni ciclo de vida de eventos por inferencia. Ninguna propuesta pendiente equivale a una decisión aprobada.

## Baseline relacionado

- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md).
- [RF-CON-007 — Editar una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-007-editar-consulta-fechas.md).
- [RN-CON-008 — Edición de opciones y conservación de votos](../../03_requisitos/02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md).
- [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_requisitos/03_datos/CON/rd-con-006-ultima-edicion-consulta.md), [RD-CON-003 — Título de la consulta](../../03_requisitos/03_datos/CON/rd-con-003-titulo-consulta.md).
- [FLUJO-CON-006 — Crear una consulta de fechas desde Consultas](../../04_experiencia-usuario/02_flujos/flujo-con-006-crear-consulta-fechas-desde-consultas.md).
- [FLUJO-CON-007 — Editar una consulta de fechas](../../04_experiencia-usuario/02_flujos/flujo-con-007-editar-consulta-fechas.md).
- [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](../../04_experiencia-usuario/03_wireframes/wf-con-008-calendario-dialogo-consultas-fechas.md).
- [RN-CON-005 — Fechas propuestas desde hoy](../../03_requisitos/02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md).
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md).
- [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md).
- [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md), [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md), [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md).
- [RF-CON-006 — Editar una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-006-editar-consulta-texto.md), como referencia para preguntas sobre edición; no autoriza editar fechas.
- [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md).
- [MOCKUP-CON-001 — Calendario en consultas de fechas](../../04_experiencia-usuario/06_mockups/mockup-con-001-calendario-consultas-fechas.md), aprobado con el ajuste de tick y campanita recogido abajo.

## Módulos afectados

WEB para creación, calendario, preferencias, selección y diálogos; API para edición de fechas. Los contratos y reglas de ambos módulos enlazados se han leído antes del diseño y la implementación.

## Questions / Assumptions

### Decisiones expresas de la primera ronda — 2026-10-21

La persona impulsora confirma creación y edición, acceso/estados/retiradas con votos equivalentes a texto, elección del tipo antes del formulario y lectura de preferencias sin controles para cambiarlas dentro del modal. Precisa: «Sólo tiene que verse en el calendario del popup el color y resultado de la regla, no veremos recuentos ni contadores de ningún tipo en esa vista». La reutilización desde el calendario principal queda fuera de este Change por respuesta expresa «Por ahora, solo desde Consultas».

### Decisiones expresas de la segunda ronda — 2026-10-21

- Conservar seleccionadas las fechas existentes ya pasadas y permitir retirarlas, confirmando si tienen votos. Las nuevas fechas solo podrán ser de hoy en adelante.
- Sustituir una fecha equivale a retirar la anterior y añadir otra: la nueva empieza sin votos, sin trasladar selecciones. Si la retirada tenía votos, exige la confirmación específica.
- Crear desde Consultas guarda directamente. El calendario principal conserva su recorrido y su confirmación actuales.

### Revisión visual y autorización — 2026-10-21

La persona impulsora aprueba expresamente la propuesta con un ajuste: eliminar el tick de selección y reservar esa esquina para la campanita cuando haya un evento en la fecha. La selección por contorno basta. Solicita definir e implementar con subagentes. Se conserva el calendario principal sin cambios, incluida su creación de consultas. No hay preguntas funcionales bloqueantes ni autorización de commit.

## Research necesario

Exploración independiente y de solo lectura de calendario, preferencias, creación, edición de texto y mockups existentes mediante subagentes. Contrastar el código con las fuentes: el baseline actual inicia creación desde el calendario y muestra opciones ordenadas en un panel; la petición propone un nuevo recorrido y representación. Consolidar la nueva intención mediante `pdi:baseline-update` tras resolver preguntas.

### Evidencia de exploración — 2026-10-21

Dos subagentes de solo lectura han contrastado producto y mockups. `apps/web/src/app/pages/availability-calendar.ts` contiene calendario, preferencias `synqo:calendar-view:v2` y creación actual; `consultations-page.ts` contiene el diálogo de creación de texto y `consultation-text-editor.ts` su edición. El calendario recuerda extensión, superposición, recuentos y regla; no debe equipararse disponibilidad a votos.

El prototipo `pdi_doc/04_experiencia-usuario/06_mockups/prototipo-ux-inicial.html` es autónomo, con CSS/JavaScript y diálogos nativos. Su ficha enlazada advierte que no representa todos los controles de preferencias incorporados posteriormente. El nuevo ejemplo deberá tomar como referencia también el calendario vigente, sin presentar ese prototipo histórico como copia actual del producto. No requiere build WEB para previsualizarse.

Las exploraciones confirman que el tratamiento de fechas pasadas en edición no está definido por la regla de creación, y que el nuevo diálogo requiere actualizar los recorridos normativos mediante `pdi:baseline-update`. La primera ronda resuelve el alcance y las preferencias; las preguntas restantes se registran arriba.

## Design / Structure

En preparación: ejemplo HTML autónomo para revisar creación y edición en móvil y escritorio, temas claro/oscuro, selección mantenida entre meses y aplicación de preferencias guardadas. Muestra únicamente el resumen del equipo, sin modo de edición de disponibilidad, superposición propia ni recuentos. La disponibilidad y la selección deben reconocerse por texto/símbolo además de color y contorno. Las preferencias de demostración se simulan fuera del diálogo sin sobrescribir las preferencias reales del producto.

El título y las selecciones pertenecen al borrador; deshacer la retirada de una fecha existente restaura la misma opción, también si es pasada, y sus votos. Las altas son fechas nuevas desde hoy. Mantener el switch vigente de creación opcional de evento provisional con el título de la consulta; editar la consulta no cambia el vínculo ni el evento asociado.

### Contrato de edición y persistencia

Ampliar `PATCH /api/teams/current/consultations/{consultationId}` sin cambiar el contrato de texto: `participantId`, `title?`, `optionChanges: {add,update,remove}` y `confirmedRemovalOptionIds?`. Para fechas, `add` contiene `{id,date}` (fecha civil ISO), `update` debe estar vacío y `remove` contiene IDs. No se añade un tipo editable; se comprueba el tipo persistido. Las entradas mixtas o de tipo incorrecto se rechazan con 422. WEB conserva UUID de altas durante reintentos.

Se admite `timeZone?` válido para altas de fecha; si no se proporciona, usar la zona del equipo. El instante de validación es el reloj inyectado bajo el bloqueo de equipo. Validar formato, unicidad y cantidad del resultado completo, pero hoy/futuro solo en altas efectivamente nuevas: los reintentos de altas ya persistidas con mismo ID/fecha son no-op aunque la fecha haya pasado. Un ID existente con otra fecha devuelve conflicto, un ID ajeno entrada inválida. No se cambia una fecha existente ni se usa `text` para transportarla.

Reutilizar el flujo transaccional de texto: bloqueo de equipo, recarga vigente tras adquirirlo, validación completa antes de mutar, eliminación limitada a selecciones de opciones retiradas, limpieza de respuestas vacías, posiciones temporales negativas y compactación sin colisiones. Mantener identidad/orden relativo de conservadas y altas al final. Último guardado válido por campo explícito; no sobrescribir opciones ajenas al cambio, no recrear una opción original borrada al intentar actualizarla y no escribir si la consulta se cerró. Como en texto, el no-op de alta requiere que el ID siga existiendo con el mismo valor; no se introduce historial de IDs eliminados ni idempotencia global tras operaciones posteriores. Un no-op no actualiza última edición ni actividad; rollback revierte todas las escrituras y flush intermedios. No requiere migración de esquema.

Éxito y errores conservan formatos de edición existentes: 200 con `{consultation,expiresAt}`; 400 JSON, 401 credencial ausente, 404 recurso/actor ajeno, 410 equipo caducado, 422 estructura/resultado inválidos, 409 consulta cerrada/conflicto/confirmación pendiente. Extensión `optionsWithVotes` para fecha usa `{id,date,count}`; texto mantiene `{id,text,count}`. La información se entrega únicamente tras comprobar acceso. WEB no presenta esos recuentos en el calendario. Errores de opciones por `options.<UUID>` cuando corresponda. OpenAPI debe reflejar ambos tipos sin romper texto.

### Estructura WEB

Componente de diálogo de fechas compartido entre creación desde Consultas y edición desde ficha; el calendario principal conserva su compositor. Extraer utilidades realmente reutilizadas de fechas/preferencias evitando ciclos entre páginas. Leer disponibilidad y eventos de los endpoints existentes por intervalo visible, controlar respuestas obsoletas y errores con reintento sin perder borrador. Un fallo no se presenta como ausencia de eventos o disponibilidad. No mezclar la selección del borrador con votos/marcas reales. Leer preferencias con respaldo y no escribirlas desde el diálogo.

La selección usa contorno sin tick y el foco un contorno diferenciado. La esquina superior derecha contiene solo la campanita cuando hay eventos no rechazados, sin número; el nombre accesible del día informa del evento. El día sigue siendo una única acción de selección, sin abrir detalle de evento. Respetar diálogos, estados pendientes y devolución de foco del editor de texto/eventos. El formulario usa el título recibido sin recortarlo implícitamente y conserva el borrador ante errores, incluido fallo de recarga para editar.

## Criterios de aceptación propuestos para verificar

1. Desde Consultas, elegir Fechas o Texto antes del formulario. El recorrido de texto conserva sus reglas y la creación desde Calendario sigue funcionando sin alteraciones.
2. Crear fechas con título, entre una y diez fechas únicas y switch opcional de evento provisional, con guardado directo y sin peticiones durante la selección.
3. El diálogo usa la extensión de semanas y la regla guardadas, con respaldo ante almacenamiento inválido/no disponible. No muestra recuentos ni contadores ni cambia preferencias.
4. Las fechas incluidas permanecen marcadas al navegar meses, sin lista apilada ni tick; la campanita de eventos no rechazados ocupa la esquina superior derecha sin contador. Estado de disponibilidad, foco y selección son distinguibles sin depender solo del color.
5. Editar solo consultas de fechas abiertas por cualquier participante válido del equipo. Precargar título y fechas, incluidas las pasadas, y mostrar última edición efectiva conforme al requisito de datos.
6. Conservar identidad y votos de opciones restantes; altas sin votos, retirada votada confirmada por opción y sustitución sin transferencia. Deshacer en el borrador restaura la opción existente, sin recrearla.
7. Conservar las fechas pasadas existentes y admitir su retirada; validar hoy/futuro únicamente para altas al guardar. No rechazar cambios del título por conservar una fecha pasada.
8. Guardar edición directamente salvo retirada votada; cancelación/Escape y errores conservan el comportamiento acordado para texto. Probar cambios concurrentes de votos, edición y cierre, sin escritura parcial.
9. Crear evento y consulta de forma atómica cuando se active el switch; la edición no modifica el evento, su vínculo ni la resolución.
10. Mockup revisado antes de implementación; checks API/WEB y E2E de los recorridos afectados, teclado/foco y tamaños 390/768/769/1280, ambos temas. Sin regresión visual automática ni commits sin petición expresa.

## Plan por slices

Plan aprobado por el alcance solicitado y el diseño anterior:

1. **HIGH / PRIMARY:** ampliar edición API a fechas conservando integridad, transacción, autorización, concurrencia y reintentos del modelo de texto. Definir primero el contrato y los errores sin sobrecargar implícitamente el campo de texto. Pruebas de fechas pasadas conservadas, altas, retiradas confirmadas, votos, rollback y carreras con cierre/edición/votación.
2. **MEDIUM:** calendario y borrador de fechas en diálogo de Consultas; entrada de elección de tipo y edición desde menú de ficha, preferencias solo de lectura y ocultación de recuentos. Reutilizar lo necesario sin sustituir la creación desde Calendario ni refactorizar fuera de alcance.
3. **LOW:** E2E focalizados y relacionados, accesibilidad automatizada parcial, documentación y evidencia. **HIGH / PRIMARY:** revisión independiente y matriz de aceptación, verificación, convergencia y cierre solo cuando corresponda. Sin commits ni visuales automáticas.

## Evidencia / Validation

En preparación se comprueban estructura documental, enlaces y el ejemplo HTML con datos ilustrativos. Las pruebas del ejemplo no acreditan la implementación ni la persistencia real.

### Evidencia de preparación — 2026-10-21

- `python3 pdi/scripts/validate_structure.py` y `git diff --check`: PASS. Enlaces relativos de los 22 Markdown modificados/nuevos: PASS, excluyendo ejemplos de sintaxis en código.
- Tras `source "$HOME/.nvm/nvm.sh" && nvm use`, Node 24.21.0: sintaxis JavaScript y smoke del mockup en Chromium mediante Playwright PASS. Creación directa con evento ilustrativo, conservación de selección, retirada/restauración de pasado, confirmación de opciones votadas al guardar y cancelación/Escape con descarte.
- Viewports 390/768/769/1280: sin desbordamiento horizontal global ni de etiquetas de estado. Foco de teclado diferenciado del contorno de selección y devolución al menú de acciones. Preferencias v2 leídas, reglas y semanas completas representadas, sin escribir preferencias del producto. Claro/oscuro comprobados dentro del alcance del ejemplo, sin declaración de conformidad WCAG global.
- No se han ejecutado tests API/WEB del producto: no hay código del producto modificado. No se han ejecutado ni actualizado regresiones visuales automáticas ni se ha hecho commit.
- Revisión independiente de preparación y mockup: REVIEW_OK, sin BLOCKER ni MAJOR pendientes. Corregidos foco de teclado, ajuste de etiquetas móviles y devolución del foco al menú visible al cerrar edición. No sustituye la aprobación visual humana ni la verificación de implementación.

| Acceptance criterion | Evidence | Result |
|---|---|---|
| Reglas funcionales concretadas | Dos rondas interactivas y actualización normativa de requisitos, reglas y UX enlazados | PASS |
| Ejemplo de creación y edición revisable | HTML autónomo y smoke de interacción, selección, preferencias, teclado y tamaños | PASS |
| Documentación y referencias coherentes | Validador estructural, enlaces y diff | PASS |
| Aprobación visual de la persona impulsora antes de implementar | Aprobación expresa con ajuste de selección sin tick y campanita aplicado al mockup | PASS |
| Funcionalidad implementada y verificada en el producto | Fuera de esta preparación; requiere diseño técnico y apply/verify posteriores | UNKNOWN |

La verificación de implementación deberá ejecutar API completa y checks Composer/esquema, tests WEB/lint/formato/build con NVM y E2E focalizados y relacionados. Cubrir especialmente ediciones concurrentes, rollback, metadatos, nuevas fechas y opciones pasadas conservadas, integración de evento y regresiones del calendario principal y de consultas de texto. No ejecutar ni actualizar regresiones visuales automáticas sin petición expresa.

## Gate de preparación

**PASS — READY_FOR_CHANGE_APPLY**, 2026-10-21. Preguntas funcionales resueltas, baseline consolidado, propuesta visual aprobada con ajuste de tick/campanita incorporado al alcance, módulos API/WEB definidos y contrato, integridad, plan y validación fijados. Mantener el índice de trazabilidad por autorización vigente. La implementación se autoriza expresamente en esta sesión, sin commit ni regresiones visuales automáticas.

## Verificación de implementación — 2026-10-21

| Acceptance criterion | Evidence | Result |
|---|---|---|
| 1. Elegir tipo y conservar recorridos anteriores | [E2E de fechas](../../../apps/web/e2e/consultation-dates.spec.ts), [creación de texto](../../../apps/web/e2e/consultations.spec.ts) y [creación desde calendario](../../../apps/web/e2e/date-consultations.spec.ts). El compositor principal conserva su comportamiento; solo comparte utilidades de fechas/preferencias extraídas. | PASS |
| 2. Creación directa, límites y evento opcional | E2E de fechas y [navegador con API real](../../../apps/web/e2e/consultation-dates-real.spec.ts): selección entre meses, envío único sin confirmación general y evento provisional con mismo título. La API valida cantidad, fechas únicas y título. | PASS |
| 3. Preferencias de lectura y ausencia de contadores | E2E con semanas completas y mediana, preferencias corruptas y almacenamiento inaccesible. Pruebas y smoke independiente comprueban respaldo sin escritura y ocultación de recuentos/superposición. | PASS |
| 4. Selección sin tick, campanita, teclado y meses | E2E comprueba `aria-pressed`, campana en fecha seleccionada, selección mantenida entre meses y Space. Smoke independiente verifica foco separado y etiquetas sin desbordamiento en ambos temas y cuatro tamaños. | PASS |
| 5. Acceso, estados, actores y última edición | [Pruebas API de fechas](../../../apps/api/tests/ConsultationDateEditingApiTest.php): actor distinto del creador, aislamiento, credenciales, caducidad, consulta cerrada y metadatos. Integración real conserva creación y muestra última edición. | PASS |
| 6. Identidad, votos, retiradas y sustitución | API y E2E conservan IDs/orden/votos restantes y restauran una retirada del borrador. Una retirada con votos confirma solo las opciones afectadas; si llegan votos antes de guardar, el 409 solicita confirmación sin perder cambios. Nuevas fechas no reciben votos anteriores. | PASS |
| 7. Fechas pasadas, zona horaria y reintentos | API conserva fechas pasadas y permite retirarlas, valida hoy/futuro solo en altas nuevas y prueba zona de dispositivo/respaldo de equipo. [Unitarias WEB](../../../apps/web/src/app/pages/consultation-date-editor.spec.ts) prueban UUID estable y reintento tras medianoche frente a alta nunca enviada que ya pasó. | PASS |
| 8. Guardado, cancelación, errores, atomicidad y concurrencia | E2E comprueba cancelación/Escape, descarte, errores de carga/escritura y reintento. [Pruebas de concurrencia](../../../apps/api/tests/ConsultationEditingConcurrencyTest.php) cubren ambos órdenes entre edición/cierre, retirada/voto, alta/voto y altas de la misma fecha; API fuerza fallo SQL y comprueba rollback de opciones, votos, metadatos y actividad. | PASS |
| 9. Evento y vínculo intactos al editar | Integración real y API crean evento y consulta conjuntamente; editar título/fechas conserva el evento provisional, su título original y vínculo. Regresiones de resolución, rechazo coordinado e historial pasan. | PASS |
| 10. Propuesta aprobada, checks y revisión | Aprobación visual expresa con ajuste aplicado, API completa, checks Composer/esquema, WEB y E2E focalizados/reales/relacionados. Revisión final independiente REVIEW_OK sin hallazgos pendientes. Sin commit ni regresión visual automática. | PASS |

### Comandos y resultados

- `docker compose exec -T api composer test`: **198 tests, 2071 assertions PASS**. `composer cs:check`, `composer stan`, `composer rector:check` y `php bin/console doctrine:schema:validate --env=test`: PASS dentro del servicio API. Los 500 provocados por pruebas de rollback son intencionados. Sin migración de esquema.
- Antes de los checks WEB: `source "$HOME/.nvm/nvm.sh" && nvm use` desde raíz, Node 24.21.0/npm 11.19.0. Tests WEB: **33 PASS** (26 existentes y siete nuevos). `lint`, `format:check` y `build`: PASS. Build inicial **503,04 kB**, aviso sobre 500 kB; presupuesto conservado. El editor de fechas se carga de forma diferida, sin nuevas dependencias.
- Desde `apps/web`, `WEB_TEST_PORT=4200 npx playwright test e2e/consultation-dates.spec.ts e2e/consultation-editing-responsive.spec.ts e2e/consultations.spec.ts e2e/consultation-editing.spec.ts --workers=1 --output=/tmp/synqo-con005-focused-final2 --reporter=list`: **33/33 PASS**. Ocho casos nuevos incluyen almacenamiento inválido/inaccesible, guardado, cancelación, errores y matriz de tamaños/temas. Prettier sobre los siete archivos E2E nuevos/modificados: PASS.
- Regresión relacionada de 112 casos: calendario/eventos, creación y resolución de consultas, edición de texto, vínculos, responsive, accesibilidad parcial y recorrido móvil. Primer pase: **109 PASS y tres fallos**. Se corrige una reapertura textual que omitía elegir «Texto» y se verifica el archivo completo (4/4 en el pase focal). Los otros dos fallos son el límite de creación del entorno de desarrollo: se repite `mobile-journey.spec.ts` completo en el perfil de pruebas, **6/6 PASS**. No se modifican límites de desarrollo ni se resetean sus datos.
- Con `docker compose --profile e2e up -d api-e2e`, contenedor `web-visual-test`, `WEB_PROXY_CONFIG=proxy.e2e.conf.json` y Playwright con un worker: pruebas reales de fechas (HTTP y navegador), edición de texto y eventos, **cinco casos distintos PASS**. El navegador crea desde Consultas y confirma una retirada votada; comprueba persistencia, autorías y vínculo. Corregidas las fixtures de fecha localizada y UUID repetido; la repetición HTTP final con `--grep "through the API"` pasa sin resetear la base de pruebas. El perfil utiliza exclusivamente la base de pruebas; `api-e2e` se detiene al terminar.
- Accesibilidad automatizada parcial: ESLint 10.12.0/angular-eslint 21.4.0 con comprobaciones de plantillas, y Playwright 1.63.0 para teclado, nombres, selección, foco, reflujo y etiquetas en 390×844, 768×1024, 769×1024 y 1280×800, ambos temas. PASS; no acredita conformidad WCAG global.
- Revisión independiente final: **REVIEW_OK**. Corregidos y revalidados reintento tras medianoche, desbordamiento de etiquetas móviles y referencias de título/conflictos; restaurado el diff autogenerado de `config/reference.php`. Estructura PDI, enlaces y `git diff --check`: PASS.
- Regresión visual: `omitido_activamente` por instrucción vigente, sin ejecutar ni actualizar snapshots. Sigue pendiente antes del cierre de la release. Sin commit ni despliegue.

## Convergencia y cierre — 2026-10-21

`pdi:change-verify`: PASS, diez criterios verificados. `pdi:change-converge`: PASS. Código, contrato, pruebas y baseline coinciden con las decisiones expresas. Las correcciones de fixtures y precisión documental no introducen reglas nuevas. Se mantiene el compositor del calendario principal y la edición de texto. No hay drift significativo ni decisión arquitectónica pendiente; no se crea ADR.

**DONE — Change cerrado y archivado localmente mediante `pdi:change-close`.** Se reparan enlaces e índice de trazabilidad y se actualiza [REL-005 — Ajustes de funcionalidad de consultas](../../01_producto/10_entregas/rel-005-ajustes-funcionalidad-consultas.md) a capacidad VALIDADO localmente, sin declarar la entrega ENTREGADA. La release sigue abierta para acumular sus siguientes Changes y coordinar el despliegue con la de eventos. La revisión visual de release y el despliegue siguen pendientes. No se ha realizado commit.

## Validación de la persona impulsora — 2026-10-21

Tras probar la implementación, la persona impulsora confirma «me gusta como ha quedado» y solicita validar y cerrar si queda algo pendiente. Se registra la aceptación local de la creación y edición de consultas de fechas, incluida la selección sin tick y la campanita de eventos. Los diez criterios funcionales están PASS y la revisión independiente no tiene hallazgos pendientes: se confirma el cierre archivado, sin trabajo funcional pendiente de este Change.

La revisión de release, las regresiones visuales omitidas por instrucción vigente y el despliegue se mantienen en la entrega enlazada. Esta confirmación solo modifica documentación; se conserva la evidencia técnica existente sin repetir pruebas de código inalterado. Sin commit.
