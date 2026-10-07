---
id: SPEC-EQU-004
nivel: N3
estado: cerrado
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
- Mantener la lógica de creación/restauración reutilizable por la futura ejecución programada de preproducción, definida por [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../01_activas/spec-equ-006-juego-demo-preproduccion.md).

## Fuera de scope

- Programar el comando en desarrollo, Railway u otro entorno.
- Conectar el repositorio, desplegar o crear recursos de Railway.
- Mostrar el bloque demo, enlaces públicos o temporizador en la interfaz; corresponde a [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../01_activas/spec-equ-006-juego-demo-preproduccion.md).
- Ejecutar el reset contra producción o una base remota.
- Cambiar la caducidad normal de equipos o limpiar el pool efímero de control de creación de [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](spec-equ-005-limite-creacion-origen-efimero.md).

## Baseline relacionado

- [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
- [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](spec-equ-005-limite-creacion-origen-efimero.md)
- [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../01_activas/spec-equ-006-juego-demo-preproduccion.md)

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md): fixture, reset transaccional y comando Symfony con protecciones de entorno/conexión.
- Desarrollo local: Compose y README para ejecutar el comando de forma intencional.

## Criterios de aceptación

1. La API ofrece el comando `app:demo:reset` para restaurar el juego de prueba a demanda en la base local de desarrollo.
2. En ejecución interactiva el comando confirma que se reemplazarán los equipos locales; en modo no interactivo requiere `--force`.
3. Para la invocación local, el comando falla sin modificar datos si `APP_ENV` no es `dev`, `SYNQO_DEPLOYMENT_ENV` no es `development`, o el host de PostgreSQL no pertenece a la lista local permitida. Las únicas otras condiciones admitidas son las guardas de preproducción definidas en [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../01_activas/spec-equ-006-juego-demo-preproduccion.md). Cualquier otro entorno/host falla cerrado, con código no cero y sin mostrar credenciales.
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
- El comando Symfony `app:demo:reset` en este Change solo admite desarrollo local y valida `APP_ENV`, el entorno de despliegue y el host PostgreSQL antes de abrir la transacción. En modo interactivo pide confirmación; `--force` satisface esa confirmación en modo no interactivo, pero nunca omite las guardas locales. El perfil remoto de preproducción y sus guardas se añadirán en [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../01_activas/spec-equ-006-juego-demo-preproduccion.md), una vez satisfecho el gate de despliegue; ambos perfiles reutilizarán el caso de uso de restauración.
- La fixture recibe un instante/reloj inyectable para generar fechas reproducibles. La creación de fixture no usa la ruta de creación pública ni consume contadores IP/dispositivo.
- En desarrollo local el comando muestra los enlaces recién generados solo en la salida interactiva del CLI para permitir explorar los grupos. La futura SPEC de preproducción definirá cómo publicar enlaces estables sin exponer tokens en logs.
- No se añade lógica de temporizador ni configuración Railway en esta SPEC.

## Plan por slices

1. Inspeccionar relaciones y probar el aislamiento del pool; definir fixture con reloj inyectable.
2. Implementar el servicio de reset y comando con confirmación, doble guard local, lock y transacción.
3. Añadir pruebas de éxito, repetición, rollback, rechazo de entornos/hosts no locales, concurrencia y preservación del pool; probar manualmente el comando con Compose.
4. Documentar en README el comando destructivo y su confirmación, sin activar ejecución automática.

## Evidencia / Validation

Verificación ejecutada el 2026-10-07. Las operaciones con escritura se apuntaron explícitamente a la base PostgreSQL `synqo_test`; la base de desarrollo `synqo` no se utilizó.

| Criterio | Evidencia | Resultado |
|---|---|---|
| 1. Comando manual para restaurar el fixture local | `ResetDemoCommand` registra `app:demo:reset`. Ejecución real con `APP_ENV=dev`, `SYNQO_DEPLOYMENT_ENV=development` y `DATABASE_URL` explícita de `synqo_test`: salida correcta “Juego demo restaurado correctamente: dos equipos.” | PASS |
| 2. Confirmación interactiva y `--force` no interactivo | `DemoResetTest::testCommandRequiresConfirmationAndNeverPrintsTokensInAutomation` comprueba que sin `--force` no interactivo no cambia IDs; cancelación interactiva tampoco cambia datos; `--force` funciona sin terminal y no muestra tokens; ejecución confirmada interactiva presenta los enlaces. PHPUnit focalizado: 7 tests, 78 assertions. | PASS |
| 3. Guardas de entorno y conexión | `DemoResetTest::testCommandRejectsUnsafeEnvironmentsWithoutModifyingData` rechaza perfiles incompatibles sin cambiar los equipos. `testHostGuardRejectsRemoteSocketAndNonPostgresWithoutConnecting` comprueba hosts permitidos/rechazados sin conectar y evita exponer secretos. Prueba manual con `APP_ENV=prod` devolvió exit 1 y mostró el mensaje genérico; la cuenta en `synqo_test` siguió en 2 equipos. | PASS |
| 4. Reemplazo atómico y exclusión mutua | `testFailureRollsBackDeletionAndPartialFixture` induce una escritura inválida y comprueba que permanecen IDs y disponibilidades anteriores. `testAdvisoryLockRejectsSimultaneousResetWithoutChangingData` retiene el lock desde otra conexión y comprueba rechazo sin cambios; luego un reset vuelve a funcionar. | PASS |
| 5. Borrado funcional acotado | `testRestoreIsCompleteRepeatableAndDoesNotSendMailOrTouchOtherTables` comprueba cero envíos y conservación de una fila real del pool `team_creation_origin_event`; el comando borra por la raíz `team` con cascadas y no trunca esquema. | PASS |
| 6. Dos equipos y cuatro consultas en estados/tipos requeridos | La prueba focalizada comprueba los equipos y ocho participantes, exactamente cuatro consultas, estados `open` (2), `resolved` (1), `rejected` (1), y doce votos. `DemoFixture` asigna consultas de fechas y de texto a ambos equipos. | PASS |
| 7. Calendario determinista y horizonte | `testFixtureIsDeterministicAcrossUtcBoundaryAndYearChange` comprueba repetibilidad, UTC, cambio de año, límites desde el mes anterior hasta el final del tercer mes futuro, desplazamientos semanales y opciones de fecha futuras dentro del horizonte. La prueba de persistencia verifica para el reloj fijado disponibilidad 2026-09-01 a 2027-01-31. | PASS |
| 8. Confirmación operativa y credenciales | La ejecución real no interactiva confirma éxito sin emitir tokens. En ejecución interactiva, el test verifica URLs para abrir ambos equipos. El test de persistencia comprueba que solo se almacena el hash SHA-256, y que el token no aparece en el verificador persistido. | PASS |
| 9. Invocación explícita, sin programación | `ResetDemoCommand` solo se ejecuta por invocación. La revisión de `compose.yaml` y del código confirma que no se añade cron ni arranque automático. | PASS |

Checks ejecutados: `docker compose exec -T api sh -c 'DATABASE_URL="postgresql://synqo:synqo-local@database:5432/synqo_test?serverVersion=18&charset=utf8" vendor/bin/phpunit tests/DemoResetTest.php'` (7 tests, 78 assertions); invocación real del comando con perfil local pero base `synqo_test`; rechazo real con perfil `APP_ENV=prod`; `composer cs:check` (101 archivos), `composer stan` (75 archivos), `composer rector:check`; y `doctrine:schema:validate --env=test` apuntado explícitamente a `synqo_test`. Todos pasaron; el comando inseguro falló como se esperaba con código 1 sin modificar el fixture. No se necesitó prueba WEB para este Change.

## Convergencia

Se compararon los nueve criterios con el código, las pruebas, [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md), [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md) y la SPEC futura de preproducción. El alcance implementa restauración manual local, con protección, transacción y calendario conforme a lo decidido. El ADR ya incluye expresamente el uso manual local; el reset programado, su perfil remoto y la interfaz pública permanecen fuera de scope en [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../01_activas/spec-equ-006-juego-demo-preproduccion.md). **Clasificación B — SPEC:** el párrafo de diseño anterior afirmaba que el comando ya admitía ambos perfiles; se corrigió para dejar claro que el comando de este Change solo admite perfil local y que el perfil remoto corresponde al Change futuro. Esto no cambia los criterios locales ni introduce una nueva verdad de producto. No hay baseline drift ni verdad normativa nueva que requiera `pdi:baseline-update`. **Convergencia PASS — READY_FOR_CHANGE_CLOSE (2026-10-07).**

## Resultado de cierre

**DONE — SPEC-EQU-004 cerrada el 2026-10-07 y archivada en `08_especificaciones/99_archivadas/`.** Los nueve criterios están en `PASS`; la suite focalizada y los checks aplicables pasan. La base de desarrollo local no se modificó y no se declara entregada la preproducción ni el reset programado. La evidencia de ejecución corresponde a `synqo_test`. El commit de implementación/documentación queda pendiente. La reparación de referencias compartidas y la ejecución del validador global se coordinaron con el agente que consolida el estado documental.
