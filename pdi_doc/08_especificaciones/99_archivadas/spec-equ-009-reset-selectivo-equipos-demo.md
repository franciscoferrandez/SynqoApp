---
id: SPEC-EQU-009
nivel: N3
estado: cerrada
release: REL-003
---
# SPEC-EQU-009 — Limitar el reset horario a los equipos demo

## Objetivo

Conservar los equipos creados por personas usuarias en preproducción y restaurar cada hora únicamente los equipos de demostración identificados de forma inequívoca. El reset debe seguir retirando del juego público las modificaciones inapropiadas, sin destruir el trabajo de grupos reales.

Origen: petición expresa de la persona impulsora el 2026-10-12. El cambio se incorpora como prioritario a [REL-003 — Estabilización de Synqo](../../01_producto/10_entregas/rel-003-estabilizacion-synqo.md), con intención de desplegarlo independientemente en cuanto supere preparación, implementación y verificación.

## Clasificación

- **Tipo: evolución.** Cambia el comportamiento deseado de preproducción; el borrado global actual coincide con la intención documentada anteriormente.
- **Nivel: N3.** Modifica el límite de una operación destructiva recurrente sobre una base desplegada. Una identificación incorrecta puede producir pérdida irreversible de datos. El alcance funcional es pequeño, por lo que se mantiene una única SPEC; separar una carpeta con artefactos adicionales no aporta valor en esta fase.
- **Estado inicial: PREPARACION.** Inicio independiente por subagente. Preparación posterior: READY tras la aclaración humana sobre UUID conservados y la consolidación del baseline el 2026-10-12.

## Scope

- Acotar el borrado del Cron `reset-demo` de preproducción a los equipos demo.
- Preservar los datos funcionales de equipos ajenos a la demo y el pool separado de control de creación.
- Analizar alternativas de identificación/configuración y de comprobación de coincidencias antes de fijar el diseño.
- Definir fallos detectables y seguros cuando la identificación configurada no corresponde a los equipos esperados.
- Alinear los avisos y el temporizador con la persistencia de los equipos reales, según se determine durante la preparación.
- Preparar la configuración y el procedimiento operativo necesarios para desplegar este Change de forma inmediata e independiente una vez verificado.

## Fuera de scope

- Cambiar caducidad, retención o borrado normal de equipos.
- Añadir moderación, denuncias, permisos nuevos o administración de equipos.
- Cambiar el contenido de la fixture, su disponibilidad o los estados de sus consultas.
- Refactorizar globalmente API/WEB, cambiar hosting o introducir servicios nuevos.
- Ejecutar borrados, despliegues o cambios de configuración real durante `change-new`.

## Baseline relacionado

- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md).
- [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](../../03_requisitos/01_funcionales/EQU/rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md).
- [RF-EQU-009 — Limitar la creación de equipos por origen efímero](../../03_requisitos/01_funcionales/EQU/rf-equ-009-limitar-creacion-por-origen-efimero.md).
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md).
- [RN-EQU-003 — Borrado de equipos caducados](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md).
- [ADR-EQU-004 — Derivar credenciales estables para los equipos demo](../../05_investigacion-y-decisiones/05_adr/adr-equ-004-credenciales-estables-equipos-demo.md).

Contexto histórico, no nueva fuente normativa:

- [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md).
- [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../99_archivadas/spec-equ-006-juego-demo-preproduccion.md).
- [SPEC-EQU-008 — Hacer verosímil y variada la disponibilidad del juego demo](../99_archivadas/spec-equ-008-disponibilidad-fixture-demo.md).

## Módulos evaluados

- [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md) y [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md): comando, identificación y restauración transaccional, metadatos demo y pruebas de persistencia.
- [WEB — arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md): avisos y temporizador evaluados; sus textos actuales son coherentes y no requieren cambios de código.
- Operación: variables de entorno, IaC y procedimiento del Cron descritos en [Operación Railway de REL-002](../../09_operacion/01_despliegue/railway-rel-002.md).

## Criterios de aceptación

1. El reset remoto conserva todos los datos y enlaces de equipos no demo, incluidos homónimos; restaura solamente los dos demo configurados.
2. Los demo conservan sus UUID y rotan el enlace activo tras cada reset; los enlaces anteriores dejan de autorizar acceso. Sus datos dependientes modificados se sustituyen por la fixture actual y el pool no cambia.
3. Configuración ausente, inválida, duplicada, parcial o con UUID de equipo real produce error seguro sin modificar datos. Variable definida vacía produce éxito sin mutaciones ni carga.
4. Falta de equipos, duplicación de identidad demo o cantidades inesperadas durante actualización/borrado provoca error y rollback completo. Se prueban errores tras empezar las mutaciones.
5. Se conserva la exclusión de resets simultáneos, rollback de fixture, guardas de perfil, confirmación y ausencia de secretos en salida automatizada.
6. La inicialización manual solo carga en base sin equipos, con variable definida vacía y guardas remotas; devuelve los UUID que se configuran. El Cron no inicializa y el perfil local mantiene su contrato anterior.
7. La operación explica configuración/despliegue de HTTP y Cron, identidad estable, vacío y fallos; los avisos existentes de WEB indican reinicio de equipos de ejemplo.

## Impacto baseline esperado y discrepancia detectada

La intención vigente en [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md) y [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](../../03_requisitos/01_funcionales/EQU/rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md) contempla una limpieza del contenido de aplicación y un temporizador general. La solicitud actual cambia esa intención: los equipos reales deben persistir entre resets. El código actual confirma el comportamiento previo: `OrmDemoResetRepository::replace()` ejecuta `DELETE FROM team` dentro de una transacción.

El inicio detectó esta discrepancia. Durante la preparación del 2026-10-12, `pdi:baseline-update` incorpora la decisión humana en el requisito funcional y registra la sustitución parcial del alcance global en el ADR de despliegue, conservando su historia. Las SPEC cerradas se conservan como historia. El contrato técnico aprobado queda consolidado en el ADR enlazado.

## Propuesta original de la persona impulsora — histórica

Evaluar una variable de entorno que tenga que estar definida incluso si está vacía. Si enumera dos equipos, una cantidad distinta de equipos eliminados debería producir un error que permita detectar identificaciones que no coinciden. Fue una propuesta inicial; la aclaración posterior sobre UUID estables y el ADR enlazado resuelven su contrato. La cantidad se comprueba sobre las raíces restauradas, ya que no se borran filas de equipo.

## Decisiones resueltas

- El 2026-10-12 la persona impulsora elige UUID configurados y conservación de las raíces, con limpieza desde sus siguientes niveles en cascada. Se consolida con `pdi:architecture-decision` y `pdi:baseline-update` en [ADR-EQU-005 — Conservar UUID y limitar el reset a los equipos demo configurados](../../05_investigacion-y-decisiones/05_adr/adr-equ-005-reset-demo-uuid-estables.md).
- No se cambia el reset local ni el contrato HTTP. Los textos actuales de WEB ya identifican los equipos de ejemplo.
- Carga inicial separada manual, limitada a base vacía; recuperación de bases parcialmente cargadas y automatización de rotación quedan fuera de scope.
- La persona impulsora autoriza actualizar el índice de trazabilidad en la misma preparación.
- No quedan decisiones bloqueantes ni escalados abiertos.

## Research — alternativas y evidencia

| Alternativa | Ventajas | Coste / límites |
|---|---|---|
| Hashes ya derivados de `DEMO_ACCESS_SECRET` | Identifica los demo existentes; no depende del nombre ni de los UUID regenerados. No exige migración ni otra variable. | El reset normal estricto necesita los dos equipos ya cargados y el mismo secreto. Carga inicial, ausencia parcial y rotación necesitan una operación dirigida separada. |
| Variable obligatoria con claves lógicas demo | Hace explícito qué fixture se permite restaurar; distingue ausente de vacía, con vacío como ausencia de mutaciones si se aprueba. | Las claves aún deben resolverse a identidades de base; usando hashes tiene los mismos límites de inicialización y rotación. Añade sincronización de configuración entre servicios. |
| Variable con UUID de equipo y raíces conservadas | Permite selección explícita y estable. Se reutiliza el verificador existente como defensa adicional. | Requiere cambiar el reset para conservar las raíces y limpiar sus dependientes; no necesita migración. Seleccionada tras la aclaración humana. |
| Campo persistente de identidad demo | Independiente de secretos y nombres; puede imponer unicidad. | Requiere migración, asignación inequívoca de los demo existentes y cambio de persistencia. Mayor coste para el cambio urgente. |
| Nombres de equipo | Fácil de configurar. | Descartable por seguridad: el nombre no es único y cualquier usuario puede crear un homónimo. |

Evidencia local: `DemoFixture::accessKey()` proporciona las claves `friends` y `band`; el repositorio regenera los UUID; `PublicConfigurationController` ya busca por hashes derivados; `team.access_verifier` no tiene índice único. El borrado de la raíz aplica cascadas a participantes, disponibilidades, consultas, opciones, votos, resoluciones e intentos de correo; el pool `team_creation_origin_event` no depende de esa raíz.

La recomendación inicial de selector por hashes y sustitución de raíces se descartó tras la aclaración humana. La alternativa seleccionada conserva los UUID configurados, contrasta sus hashes y verifica la actualización real de cada raíz y la limpieza completa de sus dependientes dentro de la transacción. Se mantiene la exclusión con advisory lock transaccional y el bloqueo de filas; la carga inicial añade bloqueo de tabla para impedir creaciones concurrentes, según [PostgreSQL 18 — Explicit Locking](https://www.postgresql.org/docs/18/explicit-locking.html).

## Experiencia y compatibilidad investigadas

La WEB ya presenta «Estos equipos se reinician cada hora» en creación y «Reinicio de equipos de ejemplo» en la barra de equipo. Puede mantenerse ese contrato y su temporizador general sin afirmar que el grupo real vaya a perder datos. No hace falta cambiar metadatos HTTP ni presentación para el objetivo mínimo. El alcance acordado mantiene el reset manual local destructivo y sus confirmaciones; los cambios se limitan al perfil de preproducción.

## Diseño y estructura

Realiza [ADR-EQU-005 — Conservar UUID y limitar el reset a los equipos demo configurados](../../05_investigacion-y-decisiones/05_adr/adr-equ-005-reset-demo-uuid-estables.md), sin duplicar su contrato normativo.

Unidades afectadas: repositorio de reset, servicio y comando de aplicación/CLI, parser de lista y error seguro, cableado Symfony, configuración IaC, tests de integración y runbook/README. No cambia esquema ni WEB. Antes de la limpieza se bloquean las raíces; se comprueban identidades y cantidad. Se limpian explícitamente las tres raíces de dependientes directos (`consultation`, `availability`, `team_mail_attempt`) y después `participant`, con cascadas hacia niveles posteriores. Se comprueba que no quedan filas anteriores antes de persistir el fixture. La actualización condicionada de las dos raíces confirma el número real de equipos restaurados; no se compara con el número variable de hijos.

## Plan por slices

| Slice | Riesgo | Trabajo / evidencia |
|---|---|---|
| 1 | HIGH | Parser y contrato remoto; repositorio con raíces estables, limpieza dirigida, conteos, transacción/locks; inicialización limitada; comando y diagnóstico. Decisiones de dominio/concurrencia en agente principal. |
| 2 | LOW | Pruebas PostgreSQL: conservación completa de equipo real homónimo, resets repetidos con UUID estables, config/faltantes/identidad equivocada, rollback de fixture y mutación suprimida, locks e inicialización con base ocupada; salida segura. |
| 3 | LOW | Configuración IaC con variable preservada/referenciada; README/runbook y trazabilidad; checks API/IaC/documentales, criterios y convergencia. |

## Validación prevista

- `docker compose run --rm api composer test` (base aislada `synqo_test`; no reset de desarrollo).
- `docker compose run --rm --no-deps api sh -lc "composer cs:check && composer stan && composer rector:check"`.
- `python3 /home/fran/.codex/plugins/cache/pdi-local/pdi/1.1.1/scripts/validate_structure.py` y `git diff --check`.
- El despliegue se comprueba separadamente en HTTP **y** en el servicio Cron: actualizar solo HTTP no garantiza que deje de ejecutarse una imagen antigua del reset. No se declara ENTREGADO ni se ejecuta un reset remoto durante preparación.


## DoR

PASS: objetivo/alcance autorizados, baseline vigente consolidado, identidad/cantidad y bootstrap resueltos, módulos leídos, plan y pruebas definidos. N3: la aclaración humana aprueba la opción de UUID estables; no se autoriza ninguna operación destructiva remota por preparar/implementar. Trazabilidad autorizada expresamente.

**READY_FOR_CHANGE_APPLY.**

## Evidencia de inicio

- Lectura del baseline relacionado, las SPEC históricas y las reglas de API/WEB.
- Inspección de solo lectura de `OrmDemoResetRepository` y `DemoResetService`: borrado global protegido por transacción, advisory lock y guardas de perfil.
- `python3 /home/fran/.codex/plugins/cache/pdi-local/pdi/1.1.1/scripts/validate_structure.py`: PASS, después de corregir dos denominaciones canónicas de las referencias.

## Resultado histórico de inicio

**READY_FOR_CHANGE_PREPARE.** Necesidad comprendida, Change creado con alcance inicial y decisiones explícitas. Siguiente acción permitida: `pdi:change-prepare`; el gate de implementación estaba pendiente en ese momento y se superó posteriormente durante la preparación.


## Evidencia / Validation — 2026-10-12

Implementación en [OrmDemoResetRepository](../../../apps/api/src/Infrastructure/Persistence/OrmDemoResetRepository.php), [ResetDemoCommand](../../../apps/api/src/Infrastructure/Console/ResetDemoCommand.php) y [DemoTeamSelection](../../../apps/api/src/Application/Demo/DemoTeamSelection.php), con el cableado y la configuración operativa declarados.

- `docker compose run --rm --no-deps api composer test`: PASS, **110 tests y 814 aserciones** sobre la base aislada de pruebas. No se borró ni cargó la base de desarrollo o Railway.
- `docker compose run --rm --no-deps api sh -lc "composer cs:check && composer stan && composer rector:check"`: PASS para la versión inicial; verificación de seguimiento registrada abajo.
- `npm run railway:iac:check`: PASS, cuatro tests y comprobación TypeScript. La variable se preserva en HTTP y se referencia desde Cron.
- `npm run railway:image:smoke`: PASS, imagen construida, migraciones en PostgreSQL efímero, WEB/health/configuración/docs/404 y avisos de distribución. No se conecta a Railway.
- Validación estructural PDI y `git diff --check`: PASS.
- Revisión independiente del subagente que inició el Change: sin BLOCKER ni MAJOR. Detectó dos MINOR de notas antiguas de preparación; se corrigieron como historia antes del cierre. No quedan hallazgos abiertos.

| Criterio de aceptación | Evidencia | Resultado |
|---|---|---|
| 1. Conservación de equipos reales y homónimos | `DemoSelectiveResetTest::testResetPreservesEveryRealTeamTableAndStableDemoRoots` compara snapshots de todas las tablas del grupo real y del pool, y verifica que su enlace continúa funcionando. `testUuidOfRealHomonymousTeamIsRejected` impide seleccionarlo accidentalmente. | PASS |
| 2. UUID demo estables, token rotado y fixture restaurada | `DemoSelectiveResetTest::testResetPreservesEveryRealTeamTableAndRotatesTokensOnStableDemoRoots` comprueba raíces iguales, tokens diferentes, revocación del anterior, generación 3 y dependientes renovados. `DemoResetTest::testPreproductionFixtureRotatesDerivedTokensWithoutChangingRootsOrStoringThem` comprueba que el verificador almacenado corresponde al token vigente. `PublicConfigurationControllerTest` comprueba la publicación del token derivado de la generación actual. | PASS |
| 3. Configuración obligatoria, inválida y vacía | `testAbsentInvalidPartialOrDuplicateConfigurationNeverMutates` cubre ausente, whitespace, formato, lista parcial/duplicada/excesiva y vacío. `DemoResetConfigurationTest` prueba la distinción con el cableado Symfony real sin abrir conexión. | PASS |
| 4. Identidades, cantidades y rollback | `testMissingOrWrongDemoIdentityNeverMutates` cubre faltante y dos UUID con un mismo hash. Triggers suprimen actualización de raíz y borrado de hijos; se comparan snapshots tras rollback. La restricción de fixture comprueba rollback de raíces y dependientes tras empezar las mutaciones. | PASS |
| 5. Concurrencia, guardas y salida segura | Pruebas existentes de guards/perfiles/confirmación y las nuevas de lock, diagnóstico y salida; los logs automatizados no incluyen tokens. | PASS |
| 6. Inicialización manual segura y compatibilidad local | `testConcurrentResetIsRejectedAndInitializationCannotTouchOccupiedDatabase`, `testInitializationExcludesConcurrentNormalTeamCreation`, `testAllowNonEmptyInitializationAddsDemoWithoutChangingExistingTeam` y `testCommandShowsSafeMismatchAndInitializationIdsWithoutTokens` cubren tabla vacía/poblada, preservación de equipos, exclusión concurrente, IDs y ausencia de tokens. IaC mantiene el comando Cron sin inicialización. | PASS |
| 7. Operación y experiencia coherentes | Runbook y README actualizados; tests IaC prueban preservación/referencia. Inspección de textos existentes en creación y barra de equipo: hablan del reinicio de equipos de ejemplo. | PASS |

**Verificación PASS — READY_FOR_CHANGE_CONVERGE.**

## Convergencia

`pdi:change-converge`: PASS. El comportamiento selectivo de preproducción realiza el requisito funcional vigente y la decisión de UUID conservados, ambos consolidados antes de implementar mediante `pdi:baseline-update`. Las menciones de borrado global y rotación por reset normal en ADR anteriores quedan explícitamente sustituidas como historia. La SPEC refleja la alternativa finalmente elegida; código y tests corresponden al mismo alcance. WEB y esquema no cambian; la compatibilidad local está comprobada. El delivery distingue validación local y despliegue. No hay drift significativo ni escalados pendientes.

**READY_FOR_CHANGE_CLOSE.**

## Seguimiento solicitado después del cierre — 2026-10-12

La persona impulsora precisa que la inicialización no debe quedar limitada a preproducción y solicita un flag explícito para permitirla en bases que ya contienen equipos. Se aplica `--allow-non-empty` solo junto a `--initialize`; conserva las filas existentes, bloquea creaciones concurrentes y rechaza credenciales demo ya presentes. Se elimina la restricción de perfil preproduction para la operación manual, manteniendo todas las guardas de entorno/conexión del comando.

También solicita que el enlace activo cambie en cada reset y que los anteriores dejen de funcionar, sin guardar historial ni acumular filas. Aclaración humana del 2026-10-12: confirma esa revocación y pide conservar únicamente el enlace activo. La implementación añade `team.demo_access_generation`, deriva el token con HMAC del secreto, identidad lógica y generación, y reemplaza el verificador en la raíz estable dentro de la transacción del reset. `/api/configuration` lee UUID y generación para servir el enlace vigente. La migración inicializa la generación a cero para conservar los enlaces ya publicados hasta el primer reset posterior al despliegue. La inicialización acepta `--allow-non-empty` como operación manual para agregar demo sin tocar otros equipos.

Este seguimiento modificó el resultado previamente validado. El incremento de generación reemplaza en la misma fila el verificador actual; almacenar cada caducidad o cada hash en una tabla histórica se descarta porque acumularía precisamente los registros que se desea evitar. La expiración por tiempo sin rotar el token tampoco satisface la revocación inmediata de enlaces anteriores.

### Verificación técnica del seguimiento — 2026-10-12

- `docker compose run --rm api composer db:reset:test`: PASS; recreó únicamente `synqo_test` y aplicó las ocho migraciones hasta `Version20261012143000`.
- `docker compose run --rm api composer test`: PASS, **112 tests y 824 aserciones**.
- `docker compose run --rm --no-deps api sh -lc "composer cs:check && composer stan && composer rector:check"`: PASS; formato limpio, PHPStan sin errores en 79 archivos y Rector sin cambios propuestos.
- `docker compose run --rm -e APP_ENV=test -e DATABASE_URL='postgresql://synqo:synqo-local@database:5432/synqo_test?serverVersion=18&charset=utf8' api php bin/console doctrine:schema:validate --env=test`: PASS; mapeo y esquema de `synqo_test` sincronizados.
- `npm run railway:iac:check`: PASS; cuatro pruebas IaC y compilación TypeScript.
- `npm run railway:image:smoke`: PASS; build, migraciones en PostgreSQL efímero, health, SPA, configuración/docs/404 y avisos de distribución.
- Validador estructural PDI y `git diff --check`: PASS.
- No se ejecutó ningún comando contra Railway ni se aplicó la migración a la base de desarrollo.

| Criterio del seguimiento | Evidencia | Resultado |
|---|---|---|
| Inicialización manual fuera de preproducción y con equipos existentes mediante flag explícito, conservándolos | `testInitializationIsNotLimitedToPreproduction` y `testAllowNonEmptyInitializationAddsDemoWithoutChangingExistingTeam`; suite completa PASS. | PASS |
| Cada reset conserva UUID, revoca token anterior y publica el actual sin guardar historial de tokens | Tests de reset verifican UUID estables, rechazo del token anterior, cambio de token/generación y verificador vigente; `PublicConfigurationControllerTest` publica URL derivada de la generación. Esquema contiene solo el contador por raíz. | PASS |

**READY_FOR_CHANGE_CONVERGE.**

## Convergencia del seguimiento — 2026-10-12

Comparación del baseline actualizado, ADR-EQU-005, esta SPEC, implementación, migración, tests y delivery: PASS. La inicialización y la rotación de token por generación están presentes en código y documentadas; los tests prueban preservación de equipos, revocación del token anterior y publicación del vigente. La columna nueva está cubierta por la migración aplicada en test y en el smoke efímero. La experiencia mantiene el mensaje de reset referido a equipos demo y el runbook describe la transición. No quedan discrepancias significativas abiertas.

**READY_FOR_CHANGE_CLOSE.**

## Resultado de cierre

**Seguimiento convergido y verificado localmente el 2026-10-12.** La versión inicial y la ampliación pasan los checks anotados; queda disponible el gate de cierre PDI. No se ha hecho commit, push, aplicación de IaC ni reset remoto. La REL queda VALIDADO, no ENTREGADO, hasta desplegar y comprobar HTTP/Cron en preproducción.
