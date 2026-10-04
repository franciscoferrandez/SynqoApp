---
id: SPEC-EQU-001
nivel: N2
estado: ready
release: REL-001
---

# SPEC-EQU-001 — Arranque de equipo compartido en la demo local

## Objetivo

Continuar la realización de [REL-001 — Demo local operativa de Synqo](../01_producto/10_entregas/rel-001-demo-local-operativa.md) después de [SPEC-COO-001 — Base visual y navegación de Synqo](99_archivadas/spec-coo-001-base-visual-y-navegacion.md): crear de verdad un equipo y su primer participante, conservarlos en PostgreSQL y abrir el equipo mediante su enlace desde otro navegador, conectando los recorridos visuales ya construidos.

## Scope

- API Symfony con persistencia PostgreSQL y comandos locales reproducibles, conectada a la web Angular existente.
- Configuración local de API y PostgreSQL con ejemplo versionado sin credenciales reales, dependencias bloqueadas, migraciones versionadas y comandos para iniciar, migrar, probar y reiniciar la base de prueba.
- Sustitución de la simulación del formulario y la confirmación por creación real, confirmación configurable y selección automática de la primera identidad; incluye la animación ilustrativa de placeholders aplazada desde [SPEC-COO-001 — Base visual y navegación de Synqo](99_archivadas/spec-coo-001-base-visual-y-navegacion.md).
- Acceso por enlace, selección o creación de identidad en un navegador nuevo y cambio de identidad.
- Estados de enlace inexistente y equipo caducado, así como copia y compartición del enlace cuando el dispositivo lo permita.
- Pruebas significativas de API y de los recorridos del navegador de este alcance.

## Fuera de scope

La construcción inicial de layouts, temas y pantallas simuladas pertenece a [SPEC-COO-001 — Base visual y navegación de Synqo](99_archivadas/spec-coo-001-base-visual-y-navegacion.md). Disponibilidad, calendario operativo y consultas se entregarán en Changes siguientes de la misma release. El envío real de correo, publicación pública y sustitución de enlace quedan fuera de [REL-001 — Demo local operativa de Synqo](../01_producto/10_entregas/rel-001-demo-local-operativa.md). La limpieza definitiva de datos caducados podrá materializarse en un Change posterior de la misma release, antes de cerrarla.

## Baseline relacionado

- [RF-EQU-001 — Crear un equipo sin registro](../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-002 — Incorporarse y elegir identidad de participante](../03_requisitos/01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RN-EQU-001 — Actuación bajo identidad de participante](../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RN-EQU-004 — Nombre de participante único en el equipo](../03_requisitos/02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md)
- [RN-EQU-005 — Equipo con al menos un participante](../03_requisitos/02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md)
- [WF-EQU-001 — Elección de identidad al entrar](../04_experiencia-usuario/03_wireframes/wf-equ-001-entrada-identidad.md)
- [WF-EQU-002 — Creación de equipo rápido](../04_experiencia-usuario/03_wireframes/wf-equ-002-crear-equipo.md)
- [MOCKUP-EQU-001 — Arranque directo de un equipo](../04_experiencia-usuario/06_mockups/mockup-equ-001-arranque-equipo.md)
- [SPEC-COO-001 — Base visual y navegación de Synqo](99_archivadas/spec-coo-001-base-visual-y-navegacion.md)
- [Estructura inicial del equipo](../04_experiencia-usuario/01_arquitectura-informacion/estructura-equipo.md)
- [Sistema de diseño inicial de Synqo](../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md)
- [ADR-COO-001 — Separar interfaz web y API para la demo local](../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md)
- [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md)
- [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md)
- [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md)
- [Tecnologías de la demo local](../06_arquitectura/08_tecnologias/demo-local.md)

## Módulos afectados

- [WEB](../06_arquitectura/03_modulos/WEB/README.md)
- [API](../06_arquitectura/03_modulos/API/README.md)

## Criterios de aceptación

- El formulario real exige nombre de equipo y del primer participante, ambos de hasta 50 caracteres. Una creación válida guarda juntos equipo, primer participante, UUID y verificador del enlace, y devuelve al navegador creador el enlace completo. No se crea un equipo parcial si falla la operación. Equipos diferentes pueden tener el mismo nombre.
- El navegador creador recuerda automáticamente al primer participante. Por defecto aparece la confirmación con el enlace y una acción para entrar al calendario; una configuración interna permite entrar directamente. El campo opcional de correo permanece visible, avisa de que la demo no enviará mensajes y descarta su contenido sin transmitirlo como parte de la creación.
- El enlace real tiene el formato y la comprobación de [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). La API no concede acceso con solo el UUID o una identidad recordada. Se puede recargar y abrir el mismo enlace desde otro navegador. Copiar conserva el enlace completo y compartir usa el diálogo del dispositivo cuando exista.
- En un navegador nuevo, antes de mostrar el contenido del equipo vigente se elige una identidad existente o se crea otra. La selección se recuerda por equipo y navegador, puede cambiarse desde el diálogo de la cabecera y no reinicia por sí sola la caducidad. Un nombre nuevo que ya exista en ese equipo, comparado sin mayúsculas, acentos ni espacios exteriores, se rechaza sin crear un duplicado. Si excepcionalmente no hay participantes, crear uno sigue siendo obligatorio antes de entrar.
- El equipo vigente muestra la fecha prevista de caducidad. Crear el equipo e incorporar un participante reinician el plazo según [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md); leerlo, recargarlo o cambiar solo la identidad local no lo hacen. La API aplica la vigencia con la zona del equipo y su reloj controlable.
- Un enlace de equipo caducado aún conservado muestra el mensaje de caducidad sin datos del equipo. Un enlace incorrecto, inexistente o de un equipo ya borrado muestra «No encontramos este equipo». Ninguno permite entrar al contenido. La creación y el acceso reales sustituyen la simulación de [SPEC-COO-001 — Base visual y navegación de Synqo](99_archivadas/spec-coo-001-base-visual-y-navegacion.md) reutilizando sus layouts, temas y componentes comunes.
- El recorrido de creación y entrada es usable en móvil y escritorio, con teclado, foco y nombres accesibles; se contrasta con [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). Dos contextos de navegador prueban la persistencia y el uso compartido sin registro. Los comandos locales permiten arrancar, migrar y probar los módulos de forma reproducible.
- La API dispone de PHP CS Fixer, PHPStan y Rector configurados para el stack elegido. Sus comprobaciones se añaden al hook local sin modificar archivos y bloquean un commit que no las supere, según los [controles estáticos de la demo local](../07_desarrollo/03_calidad/controles-estaticos-demo-local.md).
- Una instalación local nueva puede reconstruir la API y la base desde archivos versionados, aplicar las migraciones y reiniciar la base de prueba sin conservar datos anteriores. Las credenciales y valores sensibles locales no se versionan ni aparecen en logs de prueba.

## Impacto baseline esperado

Materialización del baseline vigente; cualquier hallazgo funcional nuevo requerirá `pdi:baseline-update` antes de implementarse.

## Questions / Assumptions

- El formato, transporte y verificación del enlace están aprobados en [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). El formato público y la documentación están aprobados en [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md).
- La estructura tecnológica y los principios de arquitectura están elegidos en [ADR-COO-001 — Separar interfaz web y API para la demo local](../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md) y [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md). La persona que impulsa Synqo aprobó expresamente la estructura, persistencia, entradas, salidas y mapa de estados de este incremento.
- La selección de otra identidad existente cambia la preferencia local; no modifica por sí sola datos compartidos ni reinicia la caducidad, según [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md).

## Research necesario

La persona que impulsa Synqo eligió PHP 8.5, API Platform 5 y PostgreSQL 18, y confirmó Symfony 7.4 LTS tras comparar su plazo de soporte con Symfony 8.1. La combinación y la ejecución de API/PostgreSQL con Docker Compose, con Angular local, constan en las [tecnologías de la demo local](../06_arquitectura/08_tecnologias/demo-local.md). La [guía oficial de API Platform](https://api-platform.com/docs/core/getting-started/) admite Symfony 7.4; las ramas principales concretas se comprobarán conjuntamente al fijar dependencias.

API Platform permite declarar solo las [operaciones](https://api-platform.com/docs/core/operations/) que se desean exponer, separar el contrato público de Doctrine mediante [DTO y proveedores/procesadores](https://api-platform.com/docs/main/core/dto/), y configurar [formatos de respuesta y error](https://api-platform.com/docs/core/content-negotiation/). Esto permite mantener el núcleo de reglas independiente de HTTP y evitar operaciones CRUD abiertas por defecto. [OpenAPI](https://api-platform.com/docs/core/openapi/) puede exportarse desde las operaciones declaradas; habrá que comprobar que refleje cuerpos y errores reales. La integración no debe añadir dependencias nativas de móvil a la web; la reutilización futura se verificará cuando se defina el empaquetado.

## Design / Structure

**Estructura aprobada:** colocar la API en `api/` en la raíz, junto a `web/`. El código del servidor separa reglas de equipo y participante, casos de uso de creación/lectura/incorporación, adaptadores HTTP de API Platform y persistencia Doctrine. Reloj, generación de UUID y generación del valor de acceso se inyectan en los casos de uso. La web usa un cliente HTTP de equipo separado de sus componentes, aprovecha los layouts existentes y guarda únicamente la identidad seleccionada para cada equipo en el navegador. El valor de acceso permanece en el fragmento y se transmite como Bearer en cada operación protegida según [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).

**Operaciones aprobadas para este incremento:**

| Operación | Finalidad | Acceso |
|---|---|---|
| `POST /api/teams` | Crear equipo y primer participante en una transacción; devolver datos de confirmación y enlace completo. | Sin enlace previo |
| `GET /api/teams/current` | Consultar nombre, vigencia, fecha prevista de caducidad y participantes del equipo del enlace. | Bearer válido |
| `POST /api/teams/current/participants` | Añadir participante con nombre único dentro del equipo y devolver la identidad creada. | Bearer válido |

La elección de una identidad existente y su cambio son acciones locales del navegador: no necesitan endpoints de sesión. No se exponen listado global de equipos, edición o borrado de equipo, ni operaciones CRUD por defecto. El correo opcional se descarta en la web.

**Persistencia aprobada:** tabla de equipo con UUID, nombre, zona horaria, instante de creación y última actividad, y verificador SHA-256 del enlace; tabla de participante con UUID, UUID de equipo, nombre visible y nombre normalizado. Una restricción única sobre `(equipo, nombre normalizado)` protege la regla de duplicados incluso ante solicitudes simultáneas. La fecha prevista de caducidad se calcula desde la última actividad y la zona del equipo; no depende del reloj del navegador. La transacción de creación guarda equipo y primer participante juntos. El valor original del enlace no se guarda en PostgreSQL ni en el almacenamiento local del navegador.

**Entradas y salidas aprobadas:** `POST /api/teams` recibe `name`, `firstParticipantName` y `timeZone` opcional; devuelve `id`, `name`, `timeZone`, `expiresAt`, `firstParticipant` (`id`, `name`) y `accessUrl` completo. `GET /api/teams/current` devuelve `id`, `name`, `timeZone`, `expiresAt` y `participants` (lista de `id` y `name`). `POST /api/teams/current/participants` recibe `name` y devuelve `participant` (`id`, `name`) y `expiresAt` actualizado. `id` es UUID; `expiresAt` es un instante ISO 8601. `timeZone` se usa internamente para la presentación y no se muestra como campo visible al usuario. La API valida la zona recibida y usa Europe/Madrid si no obtiene una válida. El navegador formatea el instante de caducidad en su zona o, si no puede obtenerla, en la del equipo.

**Estados HTTP de estas operaciones:** `POST /api/teams` y `POST /api/teams/current/participants` devuelven `201`; `GET /api/teams/current` devuelve `200`. El nombre de participante duplicado produce `409`. En operaciones protegidas, la ausencia de Bearer produce `401`, el valor inválido o un equipo inexistente o ya borrado produce `404`, y el equipo caducado aún conservado produce `410`. La entrada que no supera validaciones produce `422`; el JSON mal formado, `400`; un fallo interno, `500`. Ninguna de estas operaciones usa `403`. Formato Problem Details, campos de `violations`, cabeceras, caché e interpretación web siguen la [convención HTTP común](../06_arquitectura/03_modulos/API/convencion-http.md). OpenAPI declara solo las respuestas aplicables a cada operación y sus tipos de problema distinguibles.

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

## Convergence

Pendiente.

## Resultado de cierre

Pendiente.
