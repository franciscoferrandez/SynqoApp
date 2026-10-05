---
id: SPEC-EQU-001
nivel: N2
estado: cerrada
release: REL-001
---

# SPEC-EQU-001 — Arranque de equipo compartido en la demo local

## Objetivo

Continuar la realización de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) después de [SPEC-COO-001 — Base visual y navegación de Synqo](spec-coo-001-base-visual-y-navegacion.md): crear de verdad un equipo y su primer participante, conservarlos en PostgreSQL y abrir el equipo mediante su enlace desde otro navegador, conectando los recorridos visuales ya construidos.

## Scope

- API Symfony con persistencia PostgreSQL y comandos locales reproducibles, conectada a la web Angular existente.
- Configuración local de API y PostgreSQL con ejemplo versionado sin credenciales reales, dependencias bloqueadas, migraciones versionadas y comandos para iniciar, migrar, probar y reiniciar la base de prueba.
- Sustitución de la simulación del formulario y la confirmación por creación real, confirmación configurable y selección automática de la primera identidad; incluye la animación ilustrativa de placeholders aplazada desde [SPEC-COO-001 — Base visual y navegación de Synqo](spec-coo-001-base-visual-y-navegacion.md).
- Acceso por enlace, selección o creación de identidad en un navegador nuevo y cambio de identidad.
- Estados de enlace inexistente y equipo caducado, así como copia y compartición del enlace cuando el dispositivo lo permita.
- Pruebas significativas de API y de los recorridos del navegador de este alcance.

## Fuera de scope

La construcción inicial de layouts, temas y pantallas simuladas pertenece a [SPEC-COO-001 — Base visual y navegación de Synqo](spec-coo-001-base-visual-y-navegacion.md). Disponibilidad, calendario operativo y consultas se entregarán en Changes siguientes de la misma release. El envío real de correo, publicación pública y sustitución de enlace quedan fuera de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md). La limpieza definitiva de datos caducados podrá materializarse en un Change posterior de la misma release, antes de cerrarla.

## Baseline relacionado

- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../03_requisitos/01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RN-EQU-004 — Nombre de participante único en el equipo](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md)
- [RN-EQU-005 — Equipo con al menos un participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md)
- [WF-EQU-001 — Elección de identidad al entrar](../../04_experiencia-usuario/03_wireframes/wf-equ-001-entrada-identidad.md)
- [WF-EQU-002 — Creación de equipo rápido](../../04_experiencia-usuario/03_wireframes/wf-equ-002-crear-equipo.md)
- [MOCKUP-EQU-001 — Arranque directo de un equipo](../../04_experiencia-usuario/06_mockups/mockup-equ-001-arranque-equipo.md)
- [SPEC-COO-001 — Base visual y navegación de Synqo](spec-coo-001-base-visual-y-navegacion.md)
- [Estructura inicial del equipo](../../04_experiencia-usuario/01_arquitectura-informacion/estructura-equipo.md)
- [Sistema de diseño inicial de Synqo](../../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md)
- [ADR-COO-001 — Separar interfaz web y API para la demo local](../../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md)
- [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md)
- [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md)
- [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md)
- [Tecnologías de la demo local](../../06_arquitectura/08_tecnologias/demo-local.md)

## Módulos afectados

- [WEB](../../06_arquitectura/03_modulos/WEB/README.md)
- [API](../../06_arquitectura/03_modulos/API/README.md)

## Criterios de aceptación

- El formulario real exige nombre de equipo y del primer participante, ambos de hasta 50 caracteres. Una creación válida guarda juntos equipo, primer participante, UUID y verificador del enlace, y devuelve al navegador creador el enlace completo. No se crea un equipo parcial si falla la operación. Equipos diferentes pueden tener el mismo nombre.
- El navegador creador recuerda automáticamente al primer participante. Por defecto aparece la confirmación con el enlace y una acción para entrar al calendario; una configuración interna permite entrar directamente. El campo opcional de correo permanece visible, avisa de que la demo no enviará mensajes y descarta su contenido sin transmitirlo como parte de la creación.
- El enlace real tiene el formato y la comprobación de [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). La API no concede acceso con solo el UUID o una identidad recordada. Se puede recargar y abrir el mismo enlace desde otro navegador. Copiar conserva el enlace completo y compartir usa el diálogo del dispositivo cuando exista.
- En un navegador nuevo, antes de mostrar el contenido del equipo vigente se elige una identidad existente o se crea otra. La selección se recuerda por equipo y navegador, puede cambiarse desde el diálogo de la cabecera y no reinicia por sí sola la caducidad. Un nombre nuevo que ya exista en ese equipo, comparado sin mayúsculas, acentos ni espacios exteriores, se rechaza sin crear un duplicado. Si excepcionalmente no hay participantes, crear uno sigue siendo obligatorio antes de entrar.
- El equipo vigente muestra la fecha prevista de caducidad. Crear el equipo e incorporar un participante reinician el plazo según [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md); leerlo, recargarlo o cambiar solo la identidad local no lo hacen. La API aplica la vigencia con la zona del equipo y su reloj controlable.
- Un enlace de equipo caducado aún conservado muestra el mensaje de caducidad sin datos del equipo. Un enlace incorrecto, inexistente o de un equipo ya borrado muestra «No encontramos este equipo». Ninguno permite entrar al contenido. La creación y el acceso reales sustituyen la simulación de [SPEC-COO-001 — Base visual y navegación de Synqo](spec-coo-001-base-visual-y-navegacion.md) reutilizando sus layouts, temas y componentes comunes.
- El recorrido de creación y entrada es usable en móvil y escritorio, con teclado, foco y nombres accesibles; se contrasta con [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). Dos contextos de navegador prueban la persistencia y el uso compartido sin registro. Los comandos locales permiten arrancar, migrar y probar los módulos de forma reproducible.
- La API dispone de PHP CS Fixer, PHPStan y Rector configurados para el stack elegido. Sus comprobaciones se añaden al hook local sin modificar archivos y bloquean un commit que no las supere, según los [controles estáticos de la demo local](../../07_desarrollo/03_calidad/controles-estaticos-demo-local.md).
- Una instalación local nueva puede reconstruir la API y la base desde archivos versionados, aplicar las migraciones y reiniciar la base de prueba sin conservar datos anteriores. Las credenciales y valores sensibles locales no se versionan ni aparecen en logs de prueba.

## Impacto baseline esperado

Materialización del baseline vigente; cualquier hallazgo funcional nuevo requerirá `pdi:baseline-update` antes de implementarse.

## Questions / Assumptions

- El formato, transporte y verificación del enlace están aprobados en [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). El formato público y la documentación están aprobados en [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md).
- La estructura tecnológica y los principios de arquitectura están elegidos en [ADR-COO-001 — Separar interfaz web y API para la demo local](../../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md) y [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md). La persona que impulsa Synqo aprobó expresamente la estructura, persistencia, entradas, salidas y mapa de estados de este incremento.
- La selección de otra identidad existente cambia la preferencia local; no modifica por sí sola datos compartidos ni reinicia la caducidad, según [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md).

## Research necesario

La persona que impulsa Synqo eligió PHP 8.5, API Platform 5 y PostgreSQL 18, y confirmó Symfony 7.4 LTS tras comparar su plazo de soporte con Symfony 8.1. La combinación y la ejecución de API/PostgreSQL con Docker Compose, con Angular local, constan en las [tecnologías de la demo local](../../06_arquitectura/08_tecnologias/demo-local.md). La [guía oficial de API Platform](https://api-platform.com/docs/core/getting-started/) admite Symfony 7.4; las ramas principales concretas se comprobarán conjuntamente al fijar dependencias.

API Platform permite declarar solo las [operaciones](https://api-platform.com/docs/core/operations/) que se desean exponer, separar el contrato público de Doctrine mediante [DTO y proveedores/procesadores](https://api-platform.com/docs/main/core/dto/), y configurar [formatos de respuesta y error](https://api-platform.com/docs/core/content-negotiation/). Esto permite mantener el núcleo de reglas independiente de HTTP y evitar operaciones CRUD abiertas por defecto. [OpenAPI](https://api-platform.com/docs/core/openapi/) puede exportarse desde las operaciones declaradas; habrá que comprobar que refleje cuerpos y errores reales. La integración no debe añadir dependencias nativas de móvil a la web; la reutilización futura se verificará cuando se defina el empaquetado.

## Design / Structure

**Estructura aprobada:** colocar la API en `apps/api/` y la web en `apps/web/`, agrupadas bajo `apps/` por decisión posterior de quien impulsa Synqo durante este Change. El código del servidor separa reglas de equipo y participante, casos de uso de creación/lectura/incorporación, adaptadores HTTP de API Platform y persistencia Doctrine. Reloj, generación de UUID y generación del valor de acceso se inyectan en los casos de uso. La web usa un cliente HTTP de equipo separado de sus componentes, aprovecha los layouts existentes y guarda únicamente la identidad seleccionada para cada equipo en el navegador. El valor de acceso permanece en el fragmento y se transmite como Bearer en cada operación protegida según [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).

**Operaciones aprobadas para este incremento:**

| Operación | Finalidad | Acceso |
|---|---|---|
| `POST /api/teams` | Crear equipo y primer participante en una transacción; devolver datos de confirmación y enlace completo. | Sin enlace previo |
| `GET /api/teams/current` | Consultar nombre, vigencia, fecha prevista de caducidad y participantes del equipo del enlace. | Bearer válido |
| `POST /api/teams/current/participants` | Añadir participante con nombre único dentro del equipo y devolver la identidad creada. | Bearer válido |

La elección de una identidad existente y su cambio son acciones locales del navegador: no necesitan endpoints de sesión. No se exponen listado global de equipos, edición o borrado de equipo, ni operaciones CRUD por defecto. El correo opcional se descarta en la web.

**Persistencia aprobada:** tabla de equipo con UUID, nombre, zona horaria, instante de creación y última actividad, y verificador SHA-256 del enlace; tabla de participante con UUID, UUID de equipo, nombre visible y nombre normalizado. Una restricción única sobre `(equipo, nombre normalizado)` protege la regla de duplicados incluso ante solicitudes simultáneas. La fecha prevista de caducidad se calcula desde la última actividad y la zona del equipo; no depende del reloj del navegador. La transacción de creación guarda equipo y primer participante juntos. El valor original del enlace no se guarda en PostgreSQL ni en el almacenamiento local del navegador.

**Entradas y salidas aprobadas:** `POST /api/teams` recibe `name`, `firstParticipantName` y `timeZone` opcional; devuelve `id`, `name`, `timeZone`, `expiresAt`, `firstParticipant` (`id`, `name`) y `accessUrl` completo. `GET /api/teams/current` devuelve `id`, `name`, `timeZone`, `expiresAt` y `participants` (lista de `id` y `name`). `POST /api/teams/current/participants` recibe `name` y devuelve `participant` (`id`, `name`) y `expiresAt` actualizado. `id` es UUID; `expiresAt` es un instante ISO 8601. `timeZone` se usa internamente para la presentación y no se muestra como campo visible al usuario. La API valida la zona recibida y usa Europe/Madrid si no obtiene una válida. El navegador formatea el instante de caducidad en su zona o, si no puede obtenerla, en la del equipo.

**Estados HTTP de estas operaciones:** `POST /api/teams` y `POST /api/teams/current/participants` devuelven `201`; `GET /api/teams/current` devuelve `200`. El nombre de participante duplicado produce `409`. En operaciones protegidas, la ausencia de Bearer produce `401`, el valor inválido o un equipo inexistente o ya borrado produce `404`, y el equipo caducado aún conservado produce `410`. La entrada que no supera validaciones produce `422`; el JSON mal formado, `400`; un fallo interno, `500`. Ninguna de estas operaciones usa `403`. Formato Problem Details, campos de `violations`, cabeceras, caché e interpretación web siguen la [convención HTTP común](../../06_arquitectura/03_modulos/API/convencion-http.md). OpenAPI declara solo las respuestas aplicables a cada operación y sus tipos de problema distinguibles.

## Plan por slices

**Secuencia aprobada para este Change:**

1. Crear el proyecto API con dependencias bloqueadas y configuración local de ejemplo; preparar migraciones y reinicio de base de prueba, PHP CS Fixer, PHPStan y Rector; ampliar el hook local y probar reglas de nombre, enlace y caducidad sin interfaz.
2. Exponer creación de equipo y lectura protegida, conectar formulario y confirmación reales, y sustituir las rutas ilustrativas del recorrido.
3. Incorporar lista y creación de participantes, selección local y cambio de identidad; probar duplicados y el estado excepcional sin participantes.
4. Integrar caducidad y estados de enlace, copia y compartición; verificar dos navegadores, recarga, móvil, teclado y accesibilidad del recorrido.

## Definition of Ready

**READY_FOR_CHANGE_APPLY.** Están aprobados stack, entorno local, formato y contrato de API, operaciones, estructura y persistencia. Los criterios de aceptación, el mapa de respuestas/errores, los módulos afectados, los cuatro slices y la evidencia requerida están concretados. La revisión focal del baseline no presenta una decisión bloqueante para este incremento. Por instrucción expresa de quien impulsa Synqo, esta preparación no inicia implementación.

## Evidencia / Validation

Pruebas de reglas puras para nombres normalizados y fechas de vencimiento, incluidas zonas horarias y días que exceden el mes de destino. Pruebas de integración de API con PostgreSQL para creación atómica, enlace válido, ausente, alterado, caducado y borrado, protección de lecturas y escrituras, y creación simultánea de participantes con nombre equivalente. Verificar desde una instalación local nueva que los comandos documentados preparan la API, aplican migraciones y reinician la base de prueba; revisar que no se versionan ni registran credenciales. Ejecutar PHP CS Fixer en modo check, PHPStan y Rector en modo dry-run; comprobar que el hook impide el commit ante una infracción de API sin alterar archivos. Recorrido de navegador con dos contextos: crear, copiar y abrir enlace, elegir o crear identidad, recargar y cambiarla; verificar que una lectura o cambio local no reinicia el plazo. Revisión en móvil y escritorio de foco, teclado, nombres accesibles y contraste del recorrido real. El cierre documentará la evidencia de estas comprobaciones y cualquier omisión explícita.


### Verificación local del 5 de octubre de 2026

**Gate: FAIL.** Se verificó la rama `feat/SPEC-EQU-001` en `dfc0ce6`. Los checks automatizados pasan, pero hay discrepancias funcionales y evidencia requerida incompleta. Esta matriz evalúa los nueve criterios anteriores, en el mismo orden; `PARTIAL` no equivale a cumplimiento.

| Criterio | Estado | Evidencia y límite |
|---|---|---|
| 1. Creación completa y válida | PARTIAL | `TeamApiTest.php` prueba persistencia ORM y rollback ante ID de participante repetido; `team-flow.spec.ts` crea un equipo real. Faltan dos equipos con el mismo nombre y fallo a través del endpoint. |
| 2. Confirmación, primera identidad y correo | PARTIAL | Playwright comprueba confirmación, recuerdo de la primera identidad y que el correo no sale en el POST. `TEAM_CREATION_CONFIRMATION` tiene rama de entrada directa sin prueba. |
| 3. Enlace, protección, copia y compartición | PARTIAL | Prueba API de Bearer ausente/alterado en lectura y E2E de copia exacta y segundo navegador. Falta comprobar UUID solo, equipo borrado, autorización en cada escritura y `navigator.share` disponible. |
| 4. Selección y creación de identidad | FAIL | El E2E prueba diálogo, duplicado equivalente, alta y recarga. En `team-layout.ts`, un ID recordado que ya no existe conserva `participantId`; cerrar el diálogo deja entrar sin identidad válida, incluso si no hay participantes. Falta cubrir ese estado y la selección de otra identidad existente. |
| 5. Caducidad y actividad | FAIL | PHPUnit cubre dos desbordamientos de mes; una lectura no cambia `last_activity_at`. `team-layout.ts` presenta la fecha siempre en la zona del equipo, aunque la SPEC pide la zona del navegador con respaldo. La comprobación de vigencia y la escritura no comparten protección transaccional; falta probar límites con reloj controlado y concurrencia. |
| 6. Estados 404 y 410 | PARTIAL | La API prueba token inválido y equipo caducado; Playwright prueba pantallas sin contenido del equipo con respuestas simuladas. Falta el caso real de equipo borrado y la comprobación de todas las escrituras protegidas. |
| 7. Dos navegadores, móvil y accesibilidad | PARTIAL | Playwright pasa con dos contextos, viewport móvil/escritorio, algunas comprobaciones de foco y ausencia de overflow. No hay auditoría de contraste, lector de pantalla ni recorrido completo de teclado y WCAG 2.2 AA. Varias activaciones E2E usan `evaluate(...click())`. |
| 8. Controles estáticos y hook | PARTIAL | PHP CS Fixer, PHPStan y Rector pasan; el hook se ejecutó correctamente en commits anteriores. No se ha probado que rechace una infracción de API sin modificar archivos. |
| 9. Instalación limpia y secretos | FAIL | `composer db:reset:test` recreó y migró `synqo_test`; después, `composer test` pasó. `apps/api/README.md` documenta `composer test` antes de `db:reset:test`, de modo que una instalación nueva intenta probar tablas aún no migradas. No se ejecutó una reconstrucción aislada desde clon limpio. |

**Checks ejecutados:** `composer cs:check`, `composer stan`, `composer rector:check`, `composer test` (5 pruebas, 40 aserciones) y `doctrine:schema:validate` en API; `lint`, `format:check`, `build`, `test` (2 pruebas) y `test:e2e` (5 recorridos) en WEB; `composer db:reset:test` seguido de `composer test` (5 pruebas). Todos terminaron correctamente. PostgreSQL local conservó la base de desarrollo; el reinicio afectó solo a `synqo_test`.

**Hallazgos transversales para volver a apply:** `team-layout.ts` trata red/500 como enlace no disponible y no interpreta `401`/`404`/`410` tras añadir participante; las validaciones `422` no se asocian a campos. `TeamOpenApiFactory.php` omite propiedades de participantes, elementos de la lista y estructura `violations`. Estas discrepancias afectan a la [convención HTTP común](../../06_arquitectura/03_modulos/API/convencion-http.md) y al contrato de la SPEC. El índice único de participante protege la integridad, pero falta la prueba de altas simultáneas y del resultado HTTP bajo carrera.

**Siguiente paso permitido:** `pdi:change-apply` para resolver los `FAIL` y completar la evidencia; después repetir `pdi:change-verify`. No se declara `READY_FOR_CHANGE_CONVERGE`.

### Correcciones aplicadas tras la verificación del 5 de octubre de 2026

La selección local ahora descarta identidades que ya no figuran en el equipo y oculta la cabecera y el contenido hasta elegir o crear una identidad válida, también cuando la lista llega vacía. El cierre del diálogo sin identidad devuelve al inicio. La fecha se presenta en la zona del navegador y usa la del equipo si aquella no está disponible. Los estados `401`, `404` y `410` durante la incorporación sustituyen el contenido por su pantalla de acceso; fallos de red y `500` permiten reintentar, mientras que `422` asocia mensajes y foco a los campos. Al entrar en una pantalla de enlace, el foco pasa a su título.

En la API, el alta de participante adquiere un bloqueo pesimista sobre el equipo, refresca su estado y consulta el reloj dentro de la transacción antes de actualizar la actividad. El índice único sigue resolviendo nombres equivalentes concurrentes con `409`. OpenAPI ahora describe los objetos de participante, los elementos de la lista, campos obligatorios y `violations`. El README ejecuta la migración de la base de prueba antes de PHPUnit.

**Evidencia automatizada de apply:** PHP CS Fixer, PHPStan, Rector, PHPUnit (9 pruebas, 74 aserciones) y validación de esquema Doctrine correctos; la prueba de dos procesos obtuvo una creación y un duplicado para nombres equivalentes. En WEB pasaron lint, formato, build, 4 pruebas unitarias y 20 recorridos Playwright, incluidos dos navegadores, zona distinta, identidad obsoleta/vacía, copia y compartir, errores HTTP y foco. El hook rechazó una infracción PHP temporal en el área API sin crear un commit ni modificar el archivo. Se reconstruyó la imagen API y se ejecutaron `composer install`, `db:reset:test` y tests desde una copia aislada sin `vendor` ni cachés.

**Límites a comprobar en `change-verify`:** la prueba concurrente inicia dos procesos, pero no fuerza que uno espere sobre un bloqueo previamente retenido; el rollback por fallo de inserción se comprueba en repositorio, no inyectando el fallo desde HTTP. Sigue pendiente una auditoría manual completa de contraste y lector de pantalla conforme a WCAG 2.2 AA. La revisión independiente no halló `BLOCKER` ni `MAJOR`; su observación menor sobre foco se corrigió y se volvió a probar.

**Gate de apply:** `READY_FOR_CHANGE_VERIFY` al completar la instalación aislada y repetir la validación documental. Esta nota no sustituye una nueva ejecución de `pdi:change-verify` ni reinterpreta la matriz histórica anterior.

### Segunda verificación local del 5 de octubre de 2026

**Gate: FAIL por evidencia de accesibilidad incompleta.** Se verificó `f7625a1` con el árbol de trabajo limpio. La siguiente matriz evalúa los nueve criterios anteriores, en el mismo orden. `PARTIAL` no equivale a cumplimiento.

| Criterio | Estado | Evidencia y límite |
|---|---|---|
| 1. Creación completa y válida | PASS | Integración API comprueba persistencia ORM, rollback de equipo ante fallo al insertar el primer participante, dos equipos con el mismo nombre y `422` sin escritura parcial; Playwright crea un equipo real. El fallo de inserción se induce en repositorio, frontera transaccional utilizada por el endpoint. |
| 2. Confirmación, primera identidad y correo | PASS | Playwright comprueba confirmación, primer participante recordado y ausencia de correo en el POST; prueba de componente cubre la configuración de entrada directa. |
| 3. Enlace, protección, copia y compartición | PASS | API comprueba Bearer ausente, inválido, UUID solo, caducado y borrado en lectura y escritura. Playwright comprueba dos navegadores, recarga, copia exacta y `navigator.share` disponible en confirmación y equipo. |
| 4. Selección y creación de identidad | PASS | Playwright cubre selección y cambio de identidad existente, alta, nombre equivalente rechazado, identidad local obsoleta y equipo sin participantes; el contenido no aparece antes de una elección válida. |
| 5. Caducidad y actividad | PASS | PHPUnit cubre desbordamientos de mes, lectura sin actualización de actividad y rechazo justo al inicio de la caducidad con reloj controlado. WEB comprueba zona del navegador y respaldo del equipo. El código bloquea y refresca el equipo antes de consultar el reloj y escribir; dos procesos prueban nombre equivalente concurrente. La prueba no fuerza una espera sobre un bloqueo retenido previamente. |
| 6. Estados 404 y 410 | PASS | API comprueba enlace inválido, equipo caducado y borrado. Playwright comprueba que `401`, `404` y `410`, tanto en lectura como en alta, retiran el contenido, muestran el estado apropiado y enfocan el título. |
| 7. Dos navegadores, móvil y accesibilidad | PARTIAL | Playwright cubre dos contextos, anchos móvil/escritorio, teclado en el recorrido principal, foco, nombres accesibles de controles principales y ausencia de desbordamiento. La comprobación de pares de tokens de texto en temas claro/oscuro supera 4,5:1; no existe auditoría completa de contraste por componente, lector de pantalla, ampliación y todos los criterios A/AA aplicables de [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). |
| 8. Controles estáticos y hook | PASS | PHP CS Fixer, PHPStan y Rector pasan. Una infracción PHP temporal preparada en un índice Git aislado fue rechazada por `api-check` sin alterar archivos ni crear un commit. |
| 9. Instalación limpia y secretos | PASS | Desde copia aislada sin `vendor` ni cachés: `composer install`, recreación/migración de `synqo_test` y PHPUnit correctos. Imagen Docker reconstruida, esquema Doctrine válido; revisión de archivos versionados y del código no encontró credenciales reales ni registro del Bearer. |

**Checks repetidos:** API `composer cs:check`, `composer stan`, `composer rector:check`, `composer test` (9 pruebas, 74 aserciones) y `doctrine:schema:validate --env=test`; WEB `lint`, `format:check`, `build`, `test` (4 pruebas) y `test:e2e` (20 recorridos). Todos correctos. La revisión de seguridad comprobó tres rutas expuestas, Bearer en operaciones protegidas, `Cache-Control: no-store`, almacenamiento exclusivo del verificador e índice único de nombre normalizado. No se requirió una prueba de rendimiento específica para este alcance.

**Siguiente acción:** completar y registrar la auditoría de accesibilidad del recorrido real, corregir sus hallazgos mediante `pdi:change-apply` si los hubiera y repetir `pdi:change-verify`. No se declara `READY_FOR_CHANGE_CONVERGE`.

### Aceptación expresa del límite de verificación

El 5 de octubre de 2026, la persona que impulsa Synqo aceptó cerrar este Change con el criterio 7 en `PARTIAL` y consideró no crítico ese límite para avanzar. **Omisión activa:** la auditoría completa de accesibilidad WCAG 2.2 AA del recorrido real queda pendiente para la entrega. Esta aceptación no convierte el criterio en `PASS`, no acredita conformidad de [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) y no reduce el requisito normativo. El resto de criterios están en `PASS`; con esta excepción explícita, el gate pasa a `READY_FOR_CHANGE_CONVERGE`.

## Convergence

| Aspecto | Clasificación | Resolución |
|---|---|---|
| Discrepancias funcionales de identidad, caducidad, errores HTTP, OpenAPI y arranque desde cero | A — código | Corregidas en `f7625a1` y verificadas en la segunda matriz. No requieren cambiar la SPEC ni el baseline. |
| Auditoría WCAG 2.2 AA completa | F — pendiente de la entrega | Omisión activa aceptada expresamente para este Change. [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) conserva la accesibilidad global como PLANIFICADO. Cualquier hallazgo posterior en estas pantallas deberá corregirse antes de declarar la entrega conforme. |
| Prueba que fuerce espera sobre bloqueo y fallo transaccional inducido por HTTP | Sin drift | Son límites de profundidad de la evidencia, registrados en verify. Las pruebas existentes y la revisión de código sostienen los criterios funcionales; no introducen una regla o decisión nueva. |

No queda drift significativo de producto, arquitectura o contrato dentro del alcance aceptado. No se descubrió verdad normativa nueva y no procede `pdi:baseline-update`. **Gate: READY_FOR_CHANGE_CLOSE con la omisión activa anterior.**

## Resultado de cierre

**DONE — Change cerrado y archivado el 2026-10-05 con excepción de evidencia aceptada.** Los criterios 1–6 y 8–9 están en `PASS`; el criterio 7 permanece en `PARTIAL`. La auditoría WCAG 2.2 AA sigue pendiente para la entrega y no se afirma conformidad. Commits locales de implementación y configuración relacionada: `84951d9`, `a23bfde`, `dfc0ce6` y `f7625a1`. No hay evidencia de ejecución del CI remoto ni de integración en `main`, por lo que el delivery se actualiza a VALIDADO, no ENTREGADO. No se modifica el baseline. El siguiente Change de la release deberá seleccionarse mediante `pdi:product-next`.
