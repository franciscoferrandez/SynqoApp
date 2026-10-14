---
id: SPEC-EQU-011
nivel: N3
estado: cerrada
release: REL-003
---
# SPEC-EQU-011 — Restaurar solo equipos demo en todos los entornos

## Objetivo

Hacer que el comando de reset restaure únicamente los dos equipos demo identificados explícitamente, conservando equipos y datos reales en desarrollo, preproducción y producción. Permitir programar el mismo reset cada hora en preproducción y producción, con guardas adecuadas para cada destino.

## Scope

- Exigir que `DEMO_TEAM_IDS` esté definida en cualquier ejecución de reset. Una lista de reset operativa contiene exactamente dos UUID distintos, normalizados antes de usarlos.
- Verificar que ambos UUID corresponden a las raíces demo y a sus credenciales derivadas del secreto propio del entorno. Una lista parcial, extra, duplicada, desconocida o real debe fallar sin cambios.
- Eliminar/restaurar en cascada solo datos dependientes de esas dos raíces. Comprobar el número afectado y abortar/revertir si no es exactamente dos.
- Mantener el UUID de las raíces demo y rotar su generación/token activo en cada reset, invalidando los enlaces anteriores sin guardar historial de tokens o caducidades.
- Permitir crear los equipos demo mediante inicialización no destructiva y mostrar sus UUID para copiar a `DEMO_TEAM_IDS`. La inicialización no borra ni modifica equipos existentes.
- Aplicar en todos los entornos los mismos límites de selección y borrado; eliminar el camino local que borra todos los equipos.
- Antes de mutar, mostrar el entorno con aviso textual y color: verde para desarrollo/otros, naranja para preproducción y rojo para producción. Pedir confirmación interactiva.
- En ejecución no interactiva, exigir `--force --no-interaction`; esos flags no omiten las guardas de UUID, credenciales, entorno ni conexión.
- En local, permitir simular el entorno de desarrollo, preproducción o producción solo contra PostgreSQL local. En remoto, exigir destino privado y entorno de despliegue coincidentes, con hosts permitidos separados por entorno.
- Dar soporte a un Cron cada hora en punto UTC (`0 * * * *`) tanto en preproducción como en producción. Cada Cron debe habilitarse por separado y solo después de inicialización, configuración de UUID/secretos y validación manual satisfactoria.

## Fuera de scope

- Elegir plataforma, crear o desplegar un entorno de producción, aplicar IaC de producción o activar ahora su Cron.
- Modificar equipos no listados en `DEMO_TEAM_IDS` o ampliar el conjunto demo.
- Compartir `DEMO_ACCESS_SECRET` entre entornos o guardar historial de enlaces revocados.
- Cambiar la caducidad normal de equipos reales.

## Baseline relacionado

- [REL-003 — Estabilización de Synqo](../../01_producto/10_entregas/rel-003-estabilizacion-synqo.md)
- [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](../../03_requisitos/01_funcionales/EQU/rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md)
- [RN-EQU-003 — Borrado de equipos caducados](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md)
- [ADR-EQU-004 — Derivar credenciales estables para los equipos demo](../../05_investigacion-y-decisiones/05_adr/adr-equ-004-credenciales-estables-equipos-demo.md)
- [ADR-EQU-005 — Conservar UUID y limitar el reset a los equipos demo configurados](../../05_investigacion-y-decisiones/05_adr/adr-equ-005-reset-demo-uuid-estables.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
- [API](../../06_arquitectura/03_modulos/API/README.md)
- [Operación de Railway para REL-002](../../09_operacion/01_despliegue/railway-rel-002.md)

## Criterios de aceptación

1. El comando no tiene ninguna rama que borre todos los equipos. Solo selecciona las dos raíces UUID enumeradas en `DEMO_TEAM_IDS` y verificadas como demo con el secreto del entorno.
2. La variable ausente produce error. Si está definida pero vacía, el reset ordinario (sin `--initialize`) termina sin mutaciones ni carga, como modo seguro de preparación. `--initialize` requiere esa variable definida y vacía para crear la fixture. Para un reset efectivo debe contener exactamente dos UUID distintos; lista parcial, extra, duplicada, malformada o con un equipo real produce fallo sin mutaciones. El formato admite espacios alrededor y normaliza mayúsculas. Los Cron solo se habilitan cuando hay dos UUID configurados.
3. La transacción restaura los datos demo previstos y elimina dependencias únicamente en cascada desde esas raíces. Si no encuentra exactamente dos raíces o el conteo de raíces afectadas no es dos, revierte todo y devuelve error.
4. Cada reset conserva los UUID de las raíces, incrementa su generación y hace inválidos los enlaces previos. El enlace nuevo se deriva sin registrar historial de tokens ni de caducidades.
5. La inicialización crea ambos equipos demo solo si todavía no existe ninguno demo; si detecta alguno cargado, falla sin cambios. No borra ni cambia otros registros y devuelve los dos UUID creados de forma visible. Su modo de inicialización no se puede usar como atajo para resetear equipos no demo.
6. La inicialización deja operar posteriormente con esos UUID en `DEMO_TEAM_IDS`; los UUID creados no rotan en cada reset.
7. El mismo comportamiento selectivo rige para ejecución local de desarrollo, simulaciones locales de preproducción/producción, preproducción remota y producción remota.
8. Una simulación local con `SYNQO_DEPLOYMENT_ENV=preproduction` o `production` solo opera contra PostgreSQL local permitido. Un valor de entorno no convierte una base remota en local.
9. Una conexión remota solo se autoriza con `APP_ENV=prod`, `DEMO_RESET_ENABLED=true`, `SYNQO_DEPLOYMENT_ENV` coincidente, PostgreSQL, `DEMO_DATABASE_HOST` exacto frente al host conectado y las credenciales/UUID demo propios del entorno. En Railway preproduction se conserva además la comprobación de `RAILWAY_ENVIRONMENT_NAME`; producción no depende de una variable específica de plataforma ni acepta hosts locales, desconocidos o cruces entre entornos.
10. Antes de solicitar confirmación, el comando informa el nombre del entorno y muestra el aviso acordado: desarrollo/otros en verde, preproducción en naranja y producción en rojo. También comunica el entorno en texto accesible.
11. El modo interactivo requiere confirmación explícita antes de mutar. Un proceso no interactivo falla salvo que reciba `--force --no-interaction`; esa combinación no evita ninguna otra guarda.
12. El Cron de preproducción y el Cron de producción llaman al mismo comando selectivo con los flags no interactivos requeridos. Preproducción conserva la programación Railway existente `0 * * * *` UTC; producción puede usar cualquier plataforma y la SPEC no añade configuración de scheduler específica de proveedor. `DEMO_RESET_SCHEDULE_ENABLED` en HTTP refleja si el Cron correspondiente está realmente habilitado; no autoriza el comando ni crea la programación.
13. Ningún schedule se habilita hasta que sus dos UUID, secreto propio, destino y una ejecución manual validada estén configurados. La disponibilidad del comando no implica que exista o se despliegue infraestructura de producción.
14. Las pruebas demuestran que un reset exitoso cambia datos de los dos demos y deja intactos equipos y dependencias no demo; ante lista incorrecta, credencial, entorno, host o conteo no válido, no queda ningún cambio parcial.

## Impacto baseline esperado

RF-EQU-008 y ADR-EQU-005 ya fijan selección demo y preservación de grupos reales; esta SPEC extiende el contrato a todos los entornos, incluyendo desarrollo y producción. ADR-COO-004 ya fija Cron horario UTC en preproducción; esta evolución extiende la capacidad y cadencia a producción, sujeta a configurar un entorno independiente. El baseline de configuración general se trata por separado en SPEC-EQU-010.

## Questions / Assumptions

El 2026-10-14 la persona impulsora confirmó que el reset debe comportarse igual en cualquier entorno, con los avisos/confirmaciones indicados, y que producción también puede tener Cron horario usando cualquier plataforma. Se asume la cadencia vigente de preproducción: una vez por hora, en punto UTC. Cada Cron requiere habilitación independiente y configuración validada. El scheduler de producción se configurará cuando se elija/plantee su infraestructura; este Change deja el comando listo para que lo invoque.

## Research necesario

- El comando actual protege el reset remoto de preproducción, pero el camino local de desarrollo tiene reglas diferentes y aún permite el reset global.
- El repositorio contiene la configuración IaC de preproducción y un Cron de reset horario. No hay que modificar infraestructura real de producción en este Change.
- ADR-EQU-005 documenta generación de token, cascada de datos y UUID configurados.
- Antes de aplicar el Change se debe revisar el flujo de inicialización, transacción/conteos reales de borrado y los destinos permitidos definidos por entorno.

## Design / Structure

`DEMO_TEAM_IDS` es la lista explícita de raíces autorizadas a resetear; el secreto y la generación actual verifican su identidad demo. El comando valida todos los destinos antes de abrir una transacción y hace la restauración/cambio de generación en una transacción única. El Cron es solo un disparador del mismo comando y no tiene una ruta de borrado distinta.

## Plan por slices

1. **HIGH** — Alinear validación de `DEMO_TEAM_IDS`, propiedad demo y guardas de conexión para ejecución local, remota y simulada.
2. **HIGH** — Hacer selectiva y transaccional la restauración; comprobar exactamente dos raíces, rotar generación y proteger cualquier otro equipo.
3. **MEDIUM** — Completar inicialización no destructiva, salida de UUID, confirmación, colores y requisitos de modo no interactivo.
4. **HIGH** — Hacer el comando invocable por un scheduler externo independiente de proveedor, reforzar la guarda genérica de producción y conservar sin cambios el Cron Railway de preproducción; no crear ni aplicar entorno de producción.
5. **HIGH** — Añadir pruebas de protección de datos no demo, rollback ante discrepancias y matriz de destinos; validar IaC y guía operativa.

## Evidencia / Validation

Validación local ejecutada el 2026-10-14. Las pruebas transaccionales usan exclusivamente la base PostgreSQL `synqo_test`; no hubo acceso a bases remotas ni resets en la base local de desarrollo.

- API completa: `docker compose run --rm api composer test` — 125 tests, 1054 assertions.
- Reset focal: 37 tests, 318 assertions; cubre protección de otras tablas, rollback, inicialización, errores de UUID/secreto y rotación.
- PHP: `composer cs:check`, `composer stan`, `composer rector:check` y `php bin/console lint:container` — PASS.
- IaC preproducción: `npm run railway:iac:check` — 4 tests y TypeScript — PASS; Cron ausente por defecto y opt-in separado.
- `npm run railway:image:smoke` — PASS; build de imagen, migraciones en PostgreSQL efímero y comprobaciones HTTP de health, SPA, configuración pública, documentación y 404.
- Revisión independiente: `REVIEW_OK`, sin hallazgos BLOCKER/MAJOR. No se desplegó ni se ejecutó el reset/scheduler remoto. La rama DNS productiva se revisó por código y clasificación de IP; no se simuló resolución DNS privada en pruebas deterministas.
- `docker compose config -q` y `git diff --check` — PASS.

| Criterio de aceptación | Evidencia | Resultado |
|---|---|---|
| 1. Solo dos UUID demo | `DemoSelectiveResetTest` verifica identidades y listas configuradas; no existe `DELETE FROM team` y los equipos reales se comparan por snapshot. | PASS |
| 2. Lista obligatoria, vacía o inválida | Tests de selección prueban variable ausente, vacía, parcial, extra, repetida, malformada y normalización; vacío ordinario no muta. | PASS |
| 3. Transacción, cascada y conteo | Tests de snapshots y triggers de fallo comprueban que dependencias demo se restauran y que un fallo revierte toda la operación; raíces se bloquean y cuentan. | PASS |
| 4. UUID estable y token rotado | Pruebas de reset validan UUID conservados, incremento de generación, enlace previo rechazado y ausencia de historial. | PASS |
| 5. Inicialización no destructiva | Tests de inicialización vacía y `--allow-non-empty` preservan datos existentes y rechazan credenciales demo ya cargadas; salida muestra UUID sin tokens en automatización. | PASS |
| 6. Uso posterior de UUID | El test de reset repetible reutiliza la selección devuelta al inicializar y verifica raíces estables. | PASS |
| 7. Misma selección en todos los perfiles | `testEveryEnvironmentPreservesRealDataAndRequiresItsOwnSecret` ejecuta reset en development, preproduction y production contra PostgreSQL local. | PASS |
| 8. Simulación local solo con PostgreSQL local | `DemoResetProfilesTest::testLocalSimulationRequiresLocalPostgresForEveryEnvironment` prueba los tres valores y rechaza remoto. | PASS |
| 9. Guardas remotas y producción neutral | Tests de perfiles comprueban APP/deployment, flag, secreto, PostgreSQL, host coincidente y redes privadas; production no consulta variable de proveedor. Railway preproduction mantiene su nombre de entorno/host privado. | PASS |
| 10. Aviso y color por entorno | Tests del comando comprueban texto, colores green/orange/red y nombre accesible. | PASS |
| 11. Confirmación y flags automáticos | `DemoResetProfilesTest::testAutomationRequiresBothFlagsAndInteractiveForceStillAsks` demuestra confirmación interactiva y exige ambos flags sin interacción. | PASS |
| 12. Scheduler reutiliza el comando | IaC comprueba comando `app:demo:reset --force --no-interaction` y Cron UTC preproduction; production puede invocar el mismo comando sin integración de proveedor. | PASS |
| 13. Activación independiente y sin producción desplegada | IaC mantiene el Cron apagado por defecto y opt-in preproduction; la SPEC excluye recursos de producción y documenta configuración posterior externa. | PASS |
| 14. Protección de datos y rollback | Suite completa y `DemoSelectiveResetTest` comparan snapshots completos de equipo no demo tras éxito/error y verifican rollback en fallos de escritura. | PASS |

## Convergence

`pdi:change-converge`: PASS. ADR-EQU-005, RF-EQU-008, el contrato API/WEB, el reset y la operación coinciden: se conservan raíces demo, se eliminan sus datos dependientes y se preservan todos los equipos reales. Las guardas remotas distinguen preproducción Railway y producción privada independiente de proveedor. `DEMO_RESET_SCHEDULE_ENABLED` refleja el mismo opt-in que crea el Cron de preproducción. Producción no recibe infraestructura ni despliegue en este Change. No hay drift ni hallazgos BLOCKER/MAJOR pendientes.

**READY_FOR_CHANGE_CLOSE.**

## Resultado de cierre

**Change verificado, convergido y cerrado localmente el 2026-10-14.** Todos los criterios están en PASS con pruebas locales, incluidas las transaccionales y las de protección de equipos reales. No se accedió a Railway ni a producción; la decisión acordada acepta evidencia de desarrollo local. REL-003 queda `VALIDADO`, no `ENTREGADO`, pendiente del commit/despliegue y validación operativa del Cron en el entorno configurado.

**Gate de cierre: CLOSED.** Verificación y convergencia completadas localmente.
