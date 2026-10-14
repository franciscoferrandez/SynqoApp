---
id: SPEC-EQU-010
nivel: N2
estado: cerrada
release: REL-003
---
# SPEC-EQU-010 — Configurar funciones por entorno y reproducirlas localmente

## Objetivo

Permitir ajustar cada función de Synqo por separado mediante variables de entorno y probar localmente comportamientos representativos de desarrollo, preproducción y producción sin usar servicios ni bases de datos remotos.

## Scope

- Mantener `SYNQO_DEPLOYMENT_ENV` como origen de los valores predeterminados; permitir overrides independientes por función.
- Configurar por separado el modo del correo al crear equipos y la presentación de los enlaces/avisos de demo.
- Separar la visibilidad del bloque demo de la existencia de un reset automático: el panel no debe afirmar que habrá un reset horario ni mostrar su temporizador si el schedule no está habilitado.
- Documentar ejemplos locales reproducibles para los tres entornos, usando PostgreSQL local y Mailpit.
- Conservar las variables existentes de límites y retención y sus defaults actuales.
- Mantener separados `APP_ENV` (modo Symfony) y `SYNQO_DEPLOYMENT_ENV` (valores funcionales); ninguno autoriza conexiones remotas ni operaciones destructivas.

## Fuera de scope

- Cambiar la política de borrado o programar el reset. Ese comportamiento se trata en el change separado de reset selectivo de equipos demo.
- Elegir un proveedor real de correo, desplegar una infraestructura de producción o aplicar IaC en Railway.
- Cambiar valores de negocio vigentes de límites o retención.

## Baseline relacionado

- [REL-003 — Estabilización de Synqo](../../01_producto/10_entregas/rel-003-estabilizacion-synqo.md)
- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md)
- [RF-EQU-009 — Limitar la creación de equipos por origen efímero](../../03_requisitos/01_funcionales/EQU/rf-equ-009-limitar-creacion-por-origen-efimero.md)
- [RN-EQU-003 — Borrado de equipos caducados](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md)
- [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md): defaults, validación, configuración pública y admisión/procesamiento del correo.
- [WEB](../../06_arquitectura/03_modulos/WEB/README.md): presentación del correo y del bloque de información demo.
- Compose y documentación de desarrollo/operación local.

## Criterios de aceptación

1. Cada función de este alcance tiene su propia variable; cambiar una no altera capacidades no relacionadas.
2. Sin override se mantienen los defaults vigentes de límites, retención y presentación demo, documentados y cubiertos por pruebas.
3. `TEAM_CREATION_EMAIL_MODE` reemplaza `TEAM_CREATION_EMAIL_ENABLED`. Si está ausente o vacía conserva el default del entorno; cualquier valor no vacío acepta solo `hidden`, `demo` o `send`. Valores no vacíos inválidos fallan de forma segura y no habilitan envío.
4. Default del correo: `send` en desarrollo, usando el transporte `MAILER_DSN` (Mailpit en Compose); `hidden` en preproducción, producción y pruebas. Una variable explícita puede cambiar el modo sin cambiar otros ajustes.
5. En modo `demo`, WEB muestra el campo y un aviso claro, pero no transmite ni persiste la dirección y no crea intento de correo. En `hidden` no presenta el campo y API rechaza el envío. En `send` conserva el flujo de [ADR-EQU-002](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md).
6. La configuración pública informa a WEB del modo efectivo y de la visibilidad del bloque demo, sin secretos ni caché que mantenga valores obsoletos.
7. `DEMO_PANEL_ENABLED` permite cambiar solo la presentación de enlaces/avisos demo; ausente conserva los defaults actuales por entorno y valor inválido mantiene el bloque oculto. Mostrar el panel no habilita un reset ni implica que exista un Cron.
8. `DEMO_RESET_SCHEDULE_ENABLED` controla solo la presentación del horario: con `true`, API publica temporizador/aviso horario; con `false`, no publica un próximo reset y el panel indica que no hay restauración automática. En desarrollo y pruebas el default es `false`; en preproducción solo es `true` si el Cron está habilitado; en producción el default es `false` y se establece `true` al activar el Cron. El override local puede simular esa presentación, pero por sí mismo no crea un Cron.
9. La documentación permite iniciar en local variantes representativas de development, preproduction y production contra PostgreSQL local y Mailpit; no requiere ni copia secretos o URLs remotos.
10. Los valores no vacíos inválidos fallan de forma segura; vacío equivale a no configurar el override y conserva el default del entorno. `APP_ENV` y `SYNQO_DEPLOYMENT_ENV` no autorizan conexiones remotas ni sustituyen guardas de seguridad.
11. Las pruebas cubren defaults, overrides independientes, valores inválidos, los tres modos de correo, configuración pública y ausencia de caché obsoleta; no cambian las pruebas específicas del reset.

## Impacto baseline esperado

RF-EQU-006 ya recoge los modos `hidden`, `demo` y `send`. Esta SPEC concreta sus defaults por entorno y la configuración independiente de la presentación demo. El reset selectivo universal se trata en SPEC-EQU-011 y en ADR-EQU-005; no se incorpora a esta SPEC.

## Questions / Assumptions

Las decisiones de modo demo del correo, envío mediante Mailpit en desarrollo y correo oculto por defecto en preproducción y producción fueron respondidas expresamente el 2026-10-14. Se asume que el default vigente del bloque demo se conserva y que su override no autoriza operaciones de reset. `DEMO_RESET_SCHEDULE_ENABLED` comunica a la interfaz si la infraestructura tiene un schedule activo; no controla ni crea ese schedule. En local puede activarse para probar la presentación, pero la documentación debe dejar claro que no ejecuta un Cron.

## Research necesario

- La inspección local confirma que `TEAM_CREATION_EMAIL_ENABLED` es el booleano actual y que WEB obtiene la configuración desde `/api/configuration`.
- Compose local usa Mailpit como transporte de correo.
- `TEAM_CREATION_LIMIT`, `TEAM_CREATION_WINDOW_MINUTES` y `TEAM_DELETION_RETENTION_DAYS` ya tienen overrides separados.
- El bloque demo depende actualmente de `SYNQO_DEPLOYMENT_ENV=preproduction` y de la configuración de UUID/secretos.
- No se necesita investigación externa para este cambio.

## Design / Structure

`SYNQO_DEPLOYMENT_ENV` proporciona defaults; variables específicas permiten ajustar una capacidad sin formar perfiles que alteren varias funciones. `APP_ENV` conserva su propósito de Symfony. Los valores de API son la fuente de verdad que WEB presenta. `MAILER_DSN` elige el transporte cuando el modo efectivo es `send`. La visibilidad del panel y la indicación de reset programado son estados separados; `DEMO_RESET_SCHEDULE_ENABLED` solo refleja una configuración real de Cron, cuya activación se define en SPEC-EQU-011.

## Plan por slices

1. **MEDIUM** — Resolver y validar defaults/overrides por función en API, reemplazando el booleano de correo.
2. **MEDIUM** — Publicar configuración efectiva y adaptar WEB a `hidden`, `demo` y `send`, con pruebas de que `demo` no transmite la dirección.
3. **LOW** — Añadir ejemplos locales de configuración y documentar desarrollo, preproducción y producción simulados con servicios locales.
4. **LOW** — Ejecutar pruebas API/WEB aplicables y validación documental.

## Evidencia / Validation

Validación local ejecutada el 2026-10-14. La configuración Compose usa el contenedor PostgreSQL local y Mailpit; las pruebas API mutan únicamente `synqo_test`. No se desplegó ningún servicio.

- API completa: `docker compose run --rm api composer test` — 125 tests, 1054 assertions.
- PHP: `composer cs:check`, `composer stan`, `composer rector:check` y `php bin/console lint:container` — PASS.
- WEB con Node 24.21.0: `npm test` — 17 tests; `npm run lint` y `npm run format:check` — PASS; `npm run build` — PASS.
- IaC preproducción: `npm run railway:iac:check` — 4 tests y TypeScript — PASS.
- `npm run railway:image:smoke` — PASS; build de imagen, migraciones en PostgreSQL efímero y comprobaciones HTTP de health, SPA, configuración pública, documentación y 404.
- Revisión independiente: `REVIEW_OK`, sin hallazgos BLOCKER/MAJOR. No se desplegó ningún servicio.
- `docker compose config -q` y `git diff --check` — PASS.

| Criterio de aceptación | Evidencia | Resultado |
|---|---|---|
| 1. Variables independientes | `FunctionalConfigurationTest::testDefaultsAndIndependentOverrides` verifica overrides de correo, panel y schedule independientes. | PASS |
| 2. Defaults actuales | La misma prueba comprueba defaults en development, preproduction, production y test; `testEmptyComposeVariablesRetainDefaultsForEveryEnvironment` prueba los valores vacíos de Compose. | PASS |
| 3. Modos válidos y fail-closed | `testInvalidExplicitValuesFailClosed` comprueba valores desconocidos; la suite cubre los tres modos admitidos. | PASS |
| 4. Correo por entorno y transporte | Defaults `send`/`hidden` en la prueba anterior; Compose usa Mailpit y Railway declara `hidden` con `null://null`. | PASS |
| 5. Modo demo y envío seguro | `create-page.spec.ts` comprueba aviso y omisión de la dirección; API valida rechazo antes de persistencia y worker sin descifrado/envío en `demo`/`hidden`. | PASS |
| 6. Configuración pública sin caché ni secretos | `PublicConfigurationControllerTest` valida el modo efectivo, `no-store` y contrato sin secretos. | PASS |
| 7. Panel independiente del reset | `FunctionalConfigurationTest` cubre defaults, override, valor inválido y schedule independiente; controller/WEB presentan panel sin prometer Cron. | PASS |
| 8. Horario solo cuando hay schedule | La configuración resuelve schedule verdadero/falso por separado; `demo-reset-timer.spec.ts` y `create-page.spec.ts` comprueban ausencia/presencia de temporizador y aviso. | PASS |
| 9. Simulación local de entornos | `apps/api/README.md`, `.env.example` y `compose.yaml` documentan/preparan los tres valores de `SYNQO_DEPLOYMENT_ENV`, usando PostgreSQL local y Mailpit. | PASS |
| 10. Valores inválidos y límites de seguridad | `FunctionalConfigurationTest::testInvalidExplicitValuesFailClosed`; tests de perfiles de reset verifican que los nombres de entorno no autorizan una conexión remota. | PASS |
| 11. Cobertura de modos y contratos | API completa (125/1054) y WEB (17) pasan; cubren defaults, modos, configuración y flujo de creación/worker. | PASS |

## Convergence

`pdi:change-converge`: PASS. El baseline RF-EQU-006 describe los tres modos; la SPEC concreta defaults y flags independientes. Código API, configuración pública, WEB, Compose, IaC de preproducción y las guías coinciden. El cambio no modifica límites ni retención. La salida de schedule solo refleja un Cron activado; la simulación local no lo crea. No hay discrepancias ni escalados abiertos.

**READY_FOR_CHANGE_CLOSE.**

## Resultado de cierre

**Change verificado, convergido y cerrado localmente el 2026-10-14.** Todos los criterios están en PASS y las suites/checks aplicables pasan. El correo externo sigue oculto hasta configurar un transporte; no se declara despliegue. En REL-003 queda `VALIDADO`, no `ENTREGADO`, pendiente de publicar este commit y comprobar el entorno correspondiente.

**Gate de cierre: CLOSED.** Verificación y convergencia completadas localmente.
