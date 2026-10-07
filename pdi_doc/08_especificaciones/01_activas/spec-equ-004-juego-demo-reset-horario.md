---
id: SPEC-EQU-004
nivel: N3
estado: ready
release: REL-002
---
# SPEC-EQU-004 — Carga manual del juego demo en desarrollo local

## Objetivo

Permitir restaurar a demanda el juego de prueba en la base de datos local de desarrollo, de modo que se pueda construir y comprobar el mismo contenido antes de desplegar la preproducción.

## Scope

- Crear el fixture funcional de dos equipos utilizables: un grupo de amistades que organiza cenas y una banda de música.
- Añadir participantes, disponibilidades deterministas y consultas de fechas/texto en distintos estados conforme a las decisiones aprobadas para REL-002.
- Proveer el comando manual `app:demo:reset` para borrar los equipos de la base local de desarrollo y volver a cargar el fixture de forma atómica.
- Restringir esta ejecución local a `APP_ENV=dev`, `SYNQO_DEPLOYMENT_ENV=development` y una conexión PostgreSQL local permitida (`database` de Compose, `localhost`, `127.0.0.1` o `::1`).
- Permitir inspeccionar los equipos cargados localmente sin implementar todavía el bloque informativo o el temporizador de preproducción.
- Mantener la lógica de creación/restauración reutilizable por la futura ejecución programada de preproducción, definida por [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](spec-equ-006-juego-demo-preproduccion.md).

## Fuera de scope

- Programar el comando en desarrollo, Railway u otro entorno.
- Conectar el repositorio, desplegar o crear recursos de Railway.
- Mostrar el bloque demo, enlaces públicos o temporizador en la interfaz; corresponde a [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](spec-equ-006-juego-demo-preproduccion.md).
- Ejecutar el reset contra producción o una base remota.
- Cambiar la caducidad normal de equipos o limpiar el pool efímero de control de creación de [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](spec-equ-005-limite-creacion-origen-efimero.md).

## Baseline relacionado

- [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
- [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](spec-equ-005-limite-creacion-origen-efimero.md)
- [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](spec-equ-006-juego-demo-preproduccion.md)

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md): fixture, reset transaccional y comando Symfony con protecciones de entorno/conexión.
- Desarrollo local: Compose y README para ejecutar el comando de forma intencional.

## Criterios de aceptación

1. La API ofrece el comando `app:demo:reset` para restaurar el juego de prueba a demanda en la base local de desarrollo.
2. En ejecución interactiva el comando confirma que se reemplazarán los equipos locales; en modo no interactivo requiere `--force`.
3. Para la invocación local, el comando falla sin modificar datos si `APP_ENV` no es `dev`, `SYNQO_DEPLOYMENT_ENV` no es `development`, o el host de PostgreSQL no pertenece a la lista local permitida. Las únicas otras condiciones admitidas son las guardas de preproducción definidas en [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](spec-equ-006-juego-demo-preproduccion.md). Cualquier otro entorno/host falla cerrado, con código no cero y sin mostrar credenciales.
4. El reemplazo de equipos y la carga completa del fixture ocurren en una sola transacción. Un error revierte el borrado y la carga. Un lock no bloqueante evita que dos resets se ejecuten simultáneamente.
5. El reset elimina datos funcionales asociados a los equipos, pero no trunca el esquema, no toca el pool de control de creación ni provoca envíos de correo.
6. El juego contiene “La mesa del jueves” (Ana, Luis, Marta y Pablo) y “La banda del patio” (Inés, Leo, Nuria y Tomás), con cuatro consultas: fechas abierta/resuelta y texto abierta/rechazada.
7. Las disponibilidades son deterministas y cubren desde el primer día del mes natural anterior hasta el último día del tercer mes futuro, calculadas mediante desplazamientos diarios desde el lunes UTC de la semana de ejecución e incluyendo -7, 7, 14 y los demás días equivalentes de la semana. Las opciones de consultas de fechas son futuras y se distribuyen en ese horizonte.
8. La ejecución informa que terminó correctamente y permite al desarrollador abrir los equipos recién creados. No registra sus bearer tokens en logs persistentes.
9. La operación se ejecuta solo cuando la persona desarrolladora invoca el comando; no se añade un cron local ni se ejecuta automáticamente al iniciar la aplicación.

## Impacto baseline esperado

Actualiza [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md) para permitir, además del reset horario de preproducción, el mismo proceso invocado manualmente y con guardas en la base local de desarrollo. No amplía el reset a producción ni a bases remotas.

## Questions / Assumptions

- La carga local se inicia manualmente y sustituye los equipos funcionales existentes de esa base; por eso el comando confirma en modo interactivo y exige `--force` sin terminal.
- El proceso de fixture/restauración será compartido con el uso programado posterior, pero su schedule y cualquier presentación WEB no forman parte de este Change.
- Se conservan las decisiones ya aprobadas sobre nombres, participantes, estados, fechas y horizonte del juego de ejemplo. No hay decisiones humanas pendientes.

## Research

- El esquema actual usa `team` como raíz y cascadas para sus datos funcionales. El comando `app:teams:cleanup` solo elimina equipos caducados y no es adecuado para restaurar el juego.
- Compose expone PostgreSQL en el servicio `database` y por defecto publica `localhost:5433`; ambos son destinos locales previstos. El comando valida el host antes de cualquier borrado para impedir que una configuración accidental apunte a un servidor remoto.
- El pool efímero de SPEC-EQU-005 no tendrá FK/cascada desde `team`; la restauración no debe eliminar ni recrear esa tabla.

## Design / Structure

- Un caso de uso de aplicación coordina una transacción, adquiere `pg_try_advisory_xact_lock`, elimina los equipos raíz, crea el fixture y confirma. Si no adquiere el lock o falla cualquier escritura, no deja una restauración parcial.
- El comando Symfony `app:demo:reset` comparte el mismo caso de uso para dos perfiles explícitos: desarrollo local (guardas de APP_ENV, deployment env y host local) y preproducción (guardas fijadas por SPEC-EQU-006). Verifica perfil y conexión antes de abrir la transacción. En modo interactivo local pide confirmación; `--force` satisface esa confirmación para pruebas y el futuro job, pero nunca omite las guardas de entorno/conexión.
- La fixture recibe un instante/reloj inyectable para generar fechas reproducibles. La creación de fixture no usa la ruta de creación pública ni consume contadores IP/dispositivo.
- En desarrollo local el comando muestra los enlaces recién generados solo en la salida interactiva del CLI para permitir explorar los grupos. La futura SPEC de preproducción definirá cómo publicar enlaces estables sin exponer tokens en logs.
- No se añade lógica de temporizador ni configuración Railway en esta SPEC.

## Plan por slices

1. Inspeccionar relaciones y probar el aislamiento del pool; definir fixture con reloj inyectable.
2. Implementar el servicio de reset y comando con confirmación, doble guard local, lock y transacción.
3. Añadir pruebas de éxito, repetición, rollback, rechazo de entornos/hosts no locales, concurrencia y preservación del pool; probar manualmente el comando con Compose.
4. Documentar en README el comando destructivo y su confirmación, sin activar ejecución automática.

## Evidencia / Validation

No se ha cambiado código ni se han ejecutado pruebas en este Change. La inspección inicial de entidades/migraciones y `compose.yaml` confirma una base local `database` y borrado en cascada desde equipos. La validación de implementación requerirá PostgreSQL de pruebas, prueba de rollback y demostración de rechazo de DSN remoto antes de cerrar.

## Convergence

**DoR: READY_FOR_CHANGE_APPLY.** La implementación local no depende de que exista Railway ni de que se despliegue la aplicación. El reset programado y la interfaz de preproducción quedan separados en SPEC-EQU-006 y no bloquean este Change.

## Resultado de cierre

Pendiente de implementación, verificación y cierre PDI.
