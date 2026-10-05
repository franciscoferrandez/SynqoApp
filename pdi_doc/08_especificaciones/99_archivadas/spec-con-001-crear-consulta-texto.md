---
id: SPEC-CON-001
nivel: N2
estado: cerrada
release: REL-001
---

# SPEC-CON-001 — Crear una consulta con opciones de texto

## Objetivo

Realizar [RF-CON-005 — Crear una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-005-crear-consulta-texto.md) dentro de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md), permitiendo crear consultas de texto desde «Consultas» para un equipo vigente y una identidad seleccionada.

## Clasificación

Change de **realización N2**: combina persistencia y reglas de dominio en API con el diálogo y el recorrido de creación en WEB.

## Scope

- Crear una consulta con título y opciones de texto desde la sección «Consultas».
- Aplicar las reglas vigentes de cantidad, longitud, contenido y unicidad de las opciones.
- Persistir la consulta y sus opciones asociadas al equipo, respetando el acceso y la identidad seleccionada.
- Mostrar la consulta creada como abierta en la lista del equipo.
- Cubrir la confirmación, cancelación y errores del diálogo de creación.

## Fuera de scope

- Crear consultas de fechas.
- Registrar o cambiar votos.
- Ver el detalle de votos o resolver consultas.
- Cambiar las reglas normativas de consultas, opciones, acceso, caducidad o borrado.
- Auditoría completa de accesibilidad de la entrega, fuera de la evidencia específica de este recorrido.

## Baseline relacionado

- [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md)
- [RF-CON-005 — Crear una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-005-crear-consulta-texto.md)
- [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../03_requisitos/01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md)
- [RN-CON-003 — Mínimo de una opción por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md)
- [RN-CON-006 — Texto único entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md)
- [RN-CON-007 — Máximo de diez opciones por consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md)
- [RD-CON-003 — Título de la consulta](../../03_requisitos/03_datos/CON/rd-con-003-titulo-consulta.md)
- [RD-CON-005 — Texto de opción de una consulta](../../03_requisitos/03_datos/CON/rd-con-005-texto-opcion-consulta.md)
- [FLUJO-CON-004 — Crear una consulta con opciones de texto](../../04_experiencia-usuario/02_flujos/flujo-con-004-crear-consulta-texto.md)

## Módulos afectados

- [WEB](../../06_arquitectura/03_modulos/WEB/README.md)
- [API](../../06_arquitectura/03_modulos/API/README.md)

## Criterios de aceptación

1. Una identidad seleccionada de un equipo vigente puede abrir el diálogo desde «Consultas», introducir un título y crear entre una y diez opciones de texto, conservando el orden de alta.
2. WEB limita el título a 250 caracteres, cada opción a 50 y la adición a diez opciones, sin contadores ni avisos de longitud durante la escritura; no ofrece reordenación.
3. WEB impide confirmar cuando falta título, no hay opciones, queda una opción vacía o existen textos duplicados según [RN-CON-006 — Texto único entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md), e indica el campo u opción que debe corregirse.
4. Crear exige confirmación. Cancelar cierra directamente si no hay texto; si lo hay, enfoca inicialmente «Seguir editando» y permite «Abandonar edición» sin perder el borrador mientras el diálogo permanece abierto.
5. API verifica en cada operación el Bearer, la vigencia del equipo y que la identidad indicada pertenece al equipo. Una petición válida crea una consulta abierta de texto con sus opciones y atribuye la actividad a la identidad seleccionada.
6. La API rechaza entradas inválidas con Problem Details y no persiste consultas parciales ni actualiza la actividad del equipo cuando falla la validación o la persistencia.
7. La consulta creada aparece en «Abiertas» tras la confirmación y continúa visible en la misma posición relativa tras recargar o abrir el enlace desde otro navegador. Las consultas se ordenan de más reciente a más antigua dentro de cada estado según [RD-CON-004 — Momento de creación de la consulta](../../03_requisitos/03_datos/CON/rd-con-004-momento-creacion-consulta.md).
8. La vista sin consultas muestra el estado vacío y el botón «Crear consulta»; la creación de consultas de fechas sigue fuera de este Change.
9. El recorrido funciona en escritorio y navegador móvil, con teclado, nombres y estados accesibles, foco en los diálogos y anuncios de validación y error conforme a [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md).

## Impacto baseline esperado

Ningún cambio normativo esperado: el Change realiza requisitos, reglas, datos y UX ya definidos.

## Questions / Assumptions

- No hay decisiones bloqueantes pendientes. El contrato técnico se fija en esta SPEC para preparar la implementación y no introduce reglas de producto.
- La identidad seleccionada se envía como identificador de participante; API solo acepta participantes pertenecientes al equipo autorizado. Esto materializa [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md), no convierte la identidad local en una credencial.
- La consulta persistirá con un tipo que permita incorporar consultas de fechas después, pero este Change solo crea opciones de texto. La forma concreta de las opciones de fechas queda para el Change de [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md).

## Research necesario

El código actual contiene equipos y participantes persistidos en API, autorización Bearer en cada operación, `TeamService` con reloj inyectable y transacciones con bloqueo pesimista en `OrmTeamRepository`. WEB tiene `TeamLayout`, `TeamApi`, identidad en `localStorage` y `EmptySection` como contenido ilustrativo de la sección «Consultas».

No existen todavía entidades, migraciones, endpoints, servicios ni componentes reales de consultas. La migración inicial usa claves foráneas con `ON DELETE CASCADE`, por lo que las nuevas tablas deberán conservar la pertenencia al equipo y permitir el borrado futuro completo. OpenAPI se genera mediante `TeamOpenApiFactory`; los contratos de esta SPEC deberán añadirse allí y probarse contra las respuestas reales.

Las capacidades posteriores de voto, consulta de votos y resolución necesitan una consulta con estado, tipo, momento de creación y opciones ordenadas. Este Change no implementará esos comportamientos, pero la estructura no debe impedir que votos y resolución referencien las mismas opciones.

## Design / Structure

### API y persistencia

- Añadir un agregado persistido de consulta perteneciente a un equipo, con identificador, tipo (`text` en este Change), título, estado abierto y momento de creación. La relación con el equipo usa borrado en cascada.
- Añadir opciones persistidas pertenecientes a una consulta, con identificador, texto y posición estable. Una restricción única por consulta y posición conserva el orden; la unicidad funcional de texto se valida con la normalización definida por [RN-CON-006 — Texto único entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md), ignorando mayúsculas, acentos y espacios exteriores, sin alterar el texto mostrado.
- Encapsular creación, validación y actualización de actividad en un caso de uso de API. La operación adquiere el bloqueo del equipo, comprueba Bearer, vigencia e identidad, valida título/opciones, crea consulta y opciones en una única transacción y prorroga la actividad solo tras una creación efectiva.
- Exponer una operación protegida para listar las consultas del equipo y otra para crear una consulta de texto. La creación recibe `participantId`, `title` y una lista ordenada de `options`; la lectura devuelve consultas agrupadas por estado y opciones en orden. Los detalles exactos de DTO, nombres de campos y tipos de problema se fijan en OpenAPI durante la implementación conforme a [Convención HTTP de la API](../../06_arquitectura/03_modulos/API/convencion-http.md).
- API devuelve `201` para la creación, `200` para la lista, `400` para JSON mal formado, `401` sin Bearer, `404` para enlace inválido o identidad ajena, `410` para equipo caducado, `422` para datos inválidos y `500` para fallos inesperados. Todas las respuestas y errores llevan `Cache-Control: no-store`.

### WEB

- Sustituir la rama de consultas de `EmptySection` por la lista real y el diálogo de creación, manteniendo `TeamLayout`, las rutas existentes y la identidad recordada en navegador.
- `TeamApi` añade la lectura de consultas y la creación con el participante activo. Tras una creación confirmada, WEB incorpora la representación devuelta o recarga la lista; no calcula ni valida de forma autoritativa reglas compartidas.
- El diálogo usa controles nativos y conserva el borrador mientras se confirma la cancelación. Los errores `409`/`422` se asocian a las opciones afectadas; `401`, `404` y `410` reutilizan los estados de acceso del layout; los fallos de red o `500` muestran reintento sin borrar el borrador.
- La lista presenta el estado vacío o los grupos «Abiertas», «Resueltas» y «Rechazadas» sin grupos vacíos. En este Change solo habrá consultas abiertas, pero la representación debe tolerar los grupos posteriores sin inventar datos de resolución.

## Plan por slices

1. **Modelo y reglas:** entidades/valores de consulta y opción, normalización de duplicados, validación de límites y migración con cascada; pruebas unitarias e integridad de persistencia.
2. **Contrato API:** servicio de creación y lectura, autorización Bearer, identidad de participante, bloqueo del equipo, actualización de actividad, Problem Details y OpenAPI; pruebas de integración de éxito, validación, acceso, caducidad, atomicidad y recarga.
3. **Lista WEB:** contratos de `TeamApi`, carga de consultas, estados vacío/carga/error y agrupación de abiertas respetando orden; pruebas de componente y navegación.
4. **Diálogo y recorrido:** filas editables, alta/baja de opciones, límites, duplicados, confirmación/cancelación condicional, foco y adaptación móvil; prueba E2E de creación, recarga y segundo navegador.

## Evidencia / Validation

- API: pruebas de reglas para título/opciones, límites 1/10, longitudes 250/50, opciones vacías, duplicados con mayúsculas, acentos y espacios exteriores, orden y tipo de consulta.
- API: integración PostgreSQL para persistencia, cascada futura por equipo, transacción atómica, participante ajeno, Bearer ausente/inválido, equipo caducado, actualización efectiva de actividad y lectura posterior desde otra sesión.
- Contrato: OpenAPI incluye cuerpos, respuestas, seguridad y problemas reales; una prueba contrasta la representación de lista y creación con el contrato documentado.
- WEB: pruebas de componente para límites, filas, validación, agrupación, borrador y foco; estados de acceso, error y reintento.
- E2E: crear una consulta de texto desde «Consultas», confirmar, verla abierta, recargar y abrir el mismo equipo en un segundo contexto; repetir el recorrido en viewport móvil y revisar teclado, nombres, foco y anuncios.
- Checks del proyecto: `docker compose exec api composer test`, `docker compose exec api composer cs:check`, `docker compose exec api composer stan`, `docker compose exec api composer rector:check`, `docker compose exec api php bin/console doctrine:schema:validate`, `npm --prefix apps/web test`, `npm --prefix apps/web run test:e2e`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run format:check` y `npm --prefix apps/web run build`.

## Registro de implementación — 2026-10-05

- **API:** creadas las entidades ORM de consulta y opción, migración, reglas de texto y duplicidad, repositorio transaccional, operaciones `GET`/`POST` protegidas, Problem Details y contrato OpenAPI. La consulta conserva la identidad creadora y actualiza la actividad solo al persistir una creación válida.
- **WEB:** sustituido el placeholder de «Consultas» por la lista agrupada y el formulario adaptable; incluye límites de opciones, validación de duplicados, confirmación, cancelación condicional, conservación del borrador ante errores y reintento.
- **Evidencia focal:** `composer test` (16 pruebas, 138 aserciones), `composer cs:check`, mapeo Doctrine, build WEB, pruebas WEB (4), lint, formato, y los 3 E2E de consultas pasan. La validación estructural PDI también pasa.
- **Límites detectados para la verificación:** `composer stan` aún falla en `AvailabilityRecord` (propiedades `id` y `team` escritas sin lectura); `composer rector:check` propone cambios en `AvailabilityService` y `DailyAvailability`. Ninguno de esos archivos pertenece a este Change. `doctrine:schema:validate` indica desfase y `doctrine:schema:update --dump-sql` solo propone renombrar dos índices preexistentes de disponibilidad. La suite E2E completa detectó fallos en pruebas de equipo ajenas a esta slice (selector ambiguo «Detalle del día», selector `.team-meta` inexistente y recorridos de alta de identidad que esperan un control separado del DOM); se detuvo tras 17 de 23 pruebas, con 12 PASS, 4 FAIL y 1 interrumpida.
- No se modificó la verdad normativa ni se registró drift de producto o arquitectura. Estos resultados no sustituyen `pdi:change-verify`.

## Informe de verificación — 2026-10-05

| Criterio | Estado | Evidencia |
|---|---|---|
| 1. Identidad de equipo vigente puede crear entre 1 y 10 opciones en orden | PASS | `TextConsultationRulesTest` acepta los límites 1/10; `ConsultationApiTest` crea con una y varias opciones y comprueba posición; E2E envía diez opciones ordenadas. |
| 2. Límites de texto, máximo de opciones y ausencia de reordenación | PASS | E2E comprueba `maxlength` 250/50 y que «Añadir opción» se desactiva en diez filas; inspección del diálogo confirma que no hay contadores ni controles de reordenación. |
| 3. Bloqueo e indicación de título, opciones vacías y duplicadas | PASS | E2E comprueba el error al perder foco del título, el aviso y `aria-invalid` de opción vacía, duplicidad de textos y cero opciones. La verificación detectó que el aviso de cero opciones era inalcanzable; se corrigió para mostrar «Añade al menos una opción» y el E2E lo confirma. |
| 4. Confirmación y cancelación condicional | PASS | E2E comprueba cierre directo de borrador vacío, confirmación al cancelar uno escrito, foco inicial en «Seguir editando» y conservación del texto. |
| 5. Bearer, vigencia, pertenencia e identidad creadora | PASS | `ConsultationApiTest` verifica credencial requerida, enlace inválido, identidad de otro equipo y equipo caducado; la creación válida devuelve la identidad creadora y actualiza actividad. |
| 6. Problemas HTTP y atomicidad ante validación/persistencia fallida | PASS | Pruebas de entrada inválida y JSON mal formado comprueban ausencia de escritura y renovación; `testPersistenceFailureRollsBackConsultationAndActivity` induce un error PostgreSQL durante HTTP y verifica respuesta 500, rollback de consulta/opciones y actividad intacta. |
| 7. Orden reciente, recarga y apertura en otro navegador | PASS | `ConsultationApiTest` comprueba orden descendente y vuelve a leer filas persistidas; E2E confirma recarga y apertura en un segundo contexto de navegador. |
| 8. Estado vacío y alcance solo de texto | PASS | E2E verifica estado vacío y CTA; API/OpenAPI exponen creación de tipo texto, sin operación de fechas. |
| 9. Teclado, nombres/estados, foco y anuncios en escritorio/móvil | PASS | E2E usa teclado, roles/nombres accesibles, foco de los diálogos, estado `aria-invalid`, alertas y viewport móvil sin desbordamiento. Es evidencia del recorrido especificado, no una auditoría completa WCAG de la entrega. |

**Validación integrada local — 2026-10-05:** en PostgreSQL efímera, `composer test` pasa (**30 pruebas, 249 aserciones**), junto con `composer cs:check`, `composer stan`, `composer rector:check`, `lint:container` y `doctrine:schema:validate`. WEB pasa build, 4 pruebas unitarias, lint y formato. La última suite E2E global terminó **30/31**: falló una vez la prueba de creación con la opción 10; repetida de forma aislada pasó (**1/1**), igual que los E2E de disponibilidad. El stack E2E usó API y PostgreSQL desechables; la base de desarrollo `synqo` conserva sus datos y tiene aplicadas las migraciones hasta `Version20261005160000`.

**Gate: READY_FOR_CHANGE_CONVERGE.** Los nueve criterios de esta SPEC están en `PASS`; la suite integrada completa, el esquema ORM y los checks globales pasan. La auditoría WCAG completa de REL-001 sigue pendiente, fuera del alcance de evidencia de conformidad global de esta SPEC.

## Convergence

| Aspecto | Clasificación | Resolución |
|---|---|---|
| Creación, lectura, acceso, persistencia y recorrido WEB/API | A — código | Los nueve criterios pasan con evidencia API, PostgreSQL y Playwright; el scope coincide con RF-CON-005 y sus reglas enlazadas. |
| Migración y mapeo ORM | A — código | `Version20261005160000` crea las tablas previstas; las FK aplican cascada y Doctrine confirma que el esquema local coincide con el mapeo. |
| Auditoría WCAG completa de REL-001 | F — fuera de scope de este Change | Se conserva como gate de la entrega. La evidencia de teclado, foco y anuncios de este recorrido no se presenta como certificación global WCAG. |

No queda drift significativo de producto, contrato o arquitectura en este alcance. No se requiere `pdi:baseline-update`. **Gate: READY_FOR_CHANGE_CLOSE.**

## Resultado de cierre

**DONE — Change cerrado y archivado el 2026-10-05.** Los nueve criterios están en `PASS`; PHPUnit (30 pruebas, 249 aserciones), validaciones API, esquema ORM, WEB y E2E: el último recorrido global obtuvo 30/31; la única prueba fallida pasó al repetirse aislada (1/1). Las migraciones están aplicadas en la base local `synqo` sin reiniciarla. La auditoría WCAG completa de REL-001 permanece pendiente; no se afirma conformidad global. La implementación quedó integrada posteriormente en `71f532a`; no se modifica el baseline.

## Definition of Ready

**Cierre:** `READY_FOR_CHANGE_CLOSE` → `DONE`.
