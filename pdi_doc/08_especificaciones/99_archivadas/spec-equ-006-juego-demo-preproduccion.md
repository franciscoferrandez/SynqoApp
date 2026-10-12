---
id: SPEC-EQU-006
nivel: N3
estado: cerrado
release: REL-002
---
# SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción

## Objetivo

Publicar el juego de ejemplo en la preproducción y ejecutar de forma horaria el mismo proceso de restauración preparado para desarrollo local, con los enlaces y temporizador visibles para quien prueba la aplicación.

## Scope

- Reutilizar la fixture y el comando `app:demo:reset` de [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md).
- Configurar el job de Railway para ejecutar el reset en preproducción a cada hora en punto UTC.
- Publicar enlaces directos a los dos equipos en el bloque de demo de la pantalla de creación e informar que se borran los cambios en el siguiente reset.
- Mostrar el tiempo al siguiente punto horario UTC en ese bloque y en la barra superior general de las pantallas de equipo.
- Preservar el pool de control de creación de [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md).

## Fuera de scope

- Crear o cambiar la fixture y el comportamiento local manual del reset, definidos por [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md).
- Desplegar la aplicación, conectar la fuente, crear recursos Railway o cambiar configuración real de cuenta.
- Automatizar el despliegue de la aplicación.
- Recuperar automáticamente una ejecución Cron retrasada o fallida; el temporizador continúa hacia la siguiente hora.

## Baseline relacionado

- [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md)
- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](../../03_requisitos/01_funcionales/EQU/rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
- [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md)
- [ADR-EQU-004 — Derivar credenciales estables para los equipos demo](../../05_investigacion-y-decisiones/05_adr/adr-equ-004-credenciales-estables-equipos-demo.md)
- [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md)
- [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md)
- [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../99_archivadas/spec-coo-006-railway-iac-operacion-rel-002.md)

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md): lectura de enlaces demo y datos del siguiente reset.
- [WEB](../../06_arquitectura/03_modulos/WEB/README.md): bloque demo en creación y temporizador compartido.
- Operación: Cron configurado en IaC por [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../99_archivadas/spec-coo-006-railway-iac-operacion-rel-002.md).

## Impacto baseline esperado

La capacidad concreta de publicar enlaces demo en preproducción se mantiene dentro de esta entrega. [ADR-EQU-004 — Derivar credenciales estables para los equipos demo](../../05_investigacion-y-decisiones/05_adr/adr-equ-004-credenciales-estables-equipos-demo.md) amplía el contrato arquitectónico de API solo para las dos identidades demo; el acceso de equipos normales no cambia.

## Criterios de aceptación

1. Tras desplegar la aplicación y la infraestructura de preproducción, Railway ejecuta `app:demo:reset --force --no-interaction` con schedule `0 * * * *` UTC.
2. El perfil de reset remoto exige `APP_ENV=prod`, `SYNQO_DEPLOYMENT_ENV=preproduction`, `DEMO_RESET_ENABLED=true` y la conexión privada de PostgreSQL del entorno de preproducción; una configuración ausente/incorrecta falla cerrada y no modifica datos. `--force` no omite estas guardas.
3. La ejecución utiliza la misma lógica de restauración y fixture implementada y probada en SPEC-EQU-004; una ejecución fallida no deja borrado parcial ni toca el pool de SPEC-EQU-005. La verificación manual en preproducción comprueba que las filas vigentes de `team_creation_origin_event` siguen intactas tras el reset.
4. En la pantalla de creación se muestran el aviso de borrado horario y enlaces a “La mesa del jueves” y “La banda del patio”. Los enlaces permiten usar los equipos como equipos normales hasta el siguiente reset.
5. El bloque de demo y la barra superior de las pantallas de equipo muestran el tiempo hasta el siguiente punto horario UTC.
6. Si el job se retrasa o falla, no se muestra un estado de error especial ni se bloquea la aplicación; la cuenta atrás continúa hacia la siguiente hora UTC.
7. Los enlaces y tokens de acceso no se exponen en logs; las respuestas de metadatos de demo no se almacenan en caché.
8. Antes de habilitar el schedule recurrente, la operación se verifica en la preproducción desplegada: reset manual con protección de las filas vigentes del pool, comprobación de routing/IP de cliente confiable (o su omisión segura mientras no se valide el proxy), ejecución de `app:creation-limits:purge` que elimina vencidas y conserva vigentes, y disponibilidad del comando en el Cron cada cinco minutos UTC configurado por [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../99_archivadas/spec-coo-006-railway-iac-operacion-rel-002.md). Se registra la evidencia runtime de cada integración.

## Dependencias y gate de ejecución

Este Change no bloquea la implementación local de SPEC-EQU-004. Su verificación end-to-end y la activación del Cron requieren que el servicio HTTP y PostgreSQL de preproducción estén desplegados conforme a SPEC-COO-006 y que se haya satisfecho el gate de clasificación/transferencia definido por [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md). No se conectará ni enviará código a Railway durante esta preparación.

## Questions / Assumptions

- La hora de reset es cada hora en punto UTC; retrasos u omisiones del Cron son una limitación aceptada para el piloto.
- El dataset y el proceso de restauración son propiedad de SPEC-EQU-004. Esta SPEC solo los activa en el entorno desplegado y presenta su acceso.
- La activación recurrente se hace después de que la aplicación esté desplegada y la primera ejecución se haya verificado manualmente.

## Design / Structure

Railway ejecutará un proceso Cron separado con la misma imagen WEB/API, en vez de ejecutar el comando dentro del proceso HTTP. El job pasa las guardas de preproducción —incluido `DEMO_RESET_ENABLED=true` y el uso de PostgreSQL privado de preproducción— y reutiliza `app:demo:reset`; no duplica el borrado ni la fixture. El reset mantiene su transacción y exclusión mutua ya probadas en SPEC-EQU-004, y no modifica el pool de SPEC-EQU-005. HTTP y Cron reciben `DEMO_ACCESS_SECRET` como variable protegida compartida, preservada fuera del código y fuera del estado IaC. La derivación de credenciales de fixture y el acceso a enlaces públicos se rigen por [ADR-EQU-004 — Derivar credenciales estables para los equipos demo](../../05_investigacion-y-decisiones/05_adr/adr-equ-004-credenciales-estables-equipos-demo.md). `GET /api/configuration` expone en preproducción un objeto `demo` con `nextResetAt` UTC y enlaces vigentes; si no está configurado el secreto o los dos equipos no están cargados con las credenciales esperadas, devuelve una lista vacía. La respuesta se marca `no-store` y no incluye otros datos privados. WEB dibuja la cuenta atrás desde ese instante tanto en creación como en la barra superior. Esta entrega acepta que el contador avance aunque el Cron falle.

## Plan por slices

1. Definir y probar el contrato público no-cache de metadatos demo, incluidos los enlaces vigentes y el siguiente límite horario UTC.
2. Extender el reset con una guarda remota explícita para `APP_ENV=prod`, `SYNQO_DEPLOYMENT_ENV=preproduction`, `DEMO_RESET_ENABLED=true` y host PostgreSQL privado permitido; probar configuración ausente/incorrecta y preservar el perfil local de SPEC-EQU-004.
3. Añadir en WEB el bloque de enlaces/aviso y el temporizador común; comprobar los breakpoints usuales, estados de carga/error y controles automatizados de accesibilidad del proyecto.
4. Configurar en IaC el Cron horario y la purga cada cinco minutos con guards explícitos, el mismo artefacto, variables separadas por job y cierre de conexiones. Mantener ambos desactivados en el plan ordinario; permitir habilitar y verificar primero la purga con su propio opt-in, y habilitar el reset horario con un opt-in distinto solo tras completar la prueba manual.
5. Tras resolver el gate de transferencia/clasificación y disponer de un runtime autorizado, verificar en Railway los enlaces, reset manual, preservación del pool, routing/IP, purga y logs. Ejecutar el reset manual por SSH contra el servicio HTTP con la variable de guard habilitada solo para ese comando; usar la configuración de Cron recurrente separadamente y activarla solo tras la verificación manual satisfactoria. Railway documenta la ejecución de comandos remotos mediante [`railway ssh`](https://docs.railway.com/cli/ssh).

## Evidencia / Validation

La implementación local está aplicada en el código de API/WEB e IaC. La comprobación del API requiere primero reconstruir `synqo_test` con el comando `composer db:reset:test`; esa operación solo afecta a la base de test. El operador ejecutó el reset manual remoto desde Railway y recibió `[OK] Juego demo restaurado correctamente: dos equipos.` El 2026-10-12 informó que conectó la fuente de los dos servicios Cron y aportó sus salidas: varias ejecuciones de `Deleted 0 expired creation-origin events.` y una de `[OK] Juego demo restaurado correctamente: dos equipos.`. También confirmó que comprobó después los enlaces demo y que cargaban correctamente. En una verificación manual adicional, confirmó que los horarios y el tratamiento de IP estaban correctos, y aportó una captura de una fila `device` del pool que permaneció tras el reset manual. La captura muestra `created_at` 2026-10-12 19:37:16; el digest no se transcribe para evitar registrar una señal pseudónima innecesaria. Esto acredita la ejecución de los procesos, la disponibilidad de los equipos y la preservación observada del pool.

Verificación local ejecutada el 2026-10-08: `docker compose exec -T api composer test` (97 tests, 722 aserciones), `composer cs:check`, `composer stan`, `composer rector:check`, `npm --prefix apps/web test` (16 tests), `npm --prefix apps/web run format:check`, `npm --prefix apps/web run lint`, `npm run railway:iac:check` (4 tests más TypeScript), `npm run railway:image:smoke`, `python3 pdi/scripts/validate_structure.py` y `git diff --check`; todos pasan. La primera ejecución API descubrió que la base `synqo_test` estaba desactualizada; se recreó únicamente esa base mediante el script documentado y se repitió la suite completa satisfactoriamente.

Esta SPEC separa los criterios que requieren una aplicación desplegada de la carga local cubierta por SPEC-EQU-004 y el control funcional local cubierto por SPEC-EQU-005. El operador reportó dos ejecuciones manuales de `app:creation-limits:purge` en Railway: una eliminó una fila vencida y otra eliminó cero. Un primer intento del reset fue bloqueado por configuración: `DEMO_ACCESS_SECRET` faltaba o era demasiado corto y `DEMO_DATABASE_HOST` faltaba. Tras corregirla, el reset manual finalizó con `[OK] Juego demo restaurado correctamente: dos equipos.`, evidencia de que las guardas permitieron la operación y que el comando cargó los dos equipos. `GET /api/configuration` respondió `500` en varias comprobaciones, pero en la consulta pública del 2026-10-08 a las 16:03 UTC devolvió `200` con límites `2/60`, correo desactivado, `nextResetAt` y dos enlaces demo válidos para el dominio público. Esto demuestra que el mensaje de WEB “No se pudo comprobar el límite” correspondía a un fallo temporal al cargar la configuración pública, no a que el usuario hubiera superado el rate limit. No se confirmó el SHA servido por la respuesta satisfactoria ni la estabilidad del endpoint. Los logs del servicio entre 15:25 y 15:35 UTC solo muestran migración aplicada y arranque normal, sin excepción correlacionada; el filtro HTTP por request ID no devolvió entradas. El despliegue activo observado antes era `4449ecf883f1df803b2b5c04dd17e10c6398c85b`; `APP_PUBLIC_URL`, `TEAM_CREATION_LIMIT` y `TEAM_CREATION_WINDOW_MINUTES` están presentes y tienen formato válido. El manejador HTTP devuelve un error genérico sin registrar la excepción; una instrumentación segura está implementada localmente y publicada en `a445574`, pero no se confirmó si ya sirve la respuesta 200. Al 2026-10-08 no se habían probado el Cron, la preservación de filas vigentes, routing/IP ni la programación de la purga; el gate de clasificación/source seguía sin reconciliar. La verificación end-to-end de este Change requiere un runtime autorizado y la operación manual definida abajo.

Comprobación pública de solo lectura del 2026-10-12: `/healthz`, `/api/configuration`, `/api/docs` y el aviso propio respondieron `200`; la configuración devolvió `Cache-Control: no-store, private`, correo desactivado, límite `2/60`, siguiente punto horario UTC y los dos enlaces demo. Cada enlace permitió leer por API su equipo UTC con cuatro participantes, consultas de fecha/texto en los estados previstos y 31 días de disponibilidad marcados en octubre. En navegador Chromium, la pantalla de creación mostró los dos enlaces, el aviso, el límite y la cuenta atrás en vistas de 390 y 1440 píxeles; la pantalla del equipo mostró el temporizador en cabecera. No se imprimieron tokens ni enlaces de acceso. El operador aportó salidas de Railway de ambos Cron: varias ejecuciones de purga con `Deleted 0 expired creation-origin events.` y una de reset con `[OK] Juego demo restaurado correctamente: dos equipos.`. Confirmó que revisó los horarios, el tratamiento de IP y que los enlaces demo cargaban tras el reset. Una captura posterior al reset muestra que una fila de tipo `device` del pool seguía presente (creada el 2026-10-12 19:37:16; el digest se omite). La persona impulsora confirma que las comprobaciones restantes están correctas.

| Criterio | Evidencia local | Resultado |
|---|---|---|
| 1. Reset horario Railway | IaC tiene opt-in separado y schedule `0 * * * *`; los logs aportados muestran una ejecución correcta y el operador confirmó la revisión del horario | PASS — verificación operativa reportada |
| 2. Guardas seguras para reset remoto | Tests API verifican perfil de entorno, secreto y host privado esperado; `--force` no salta guardas | PASS local |
| 3. Reset comparte fixture y preserva pool | Tests API locales verifican derivación estable y no modificación del pool; captura posterior al reset muestra una fila vigente de tipo `device` aún presente | PASS — verificación operativa reportada |
| 4. Enlaces y aviso en creación | Test WEB local; API pública y Chromium en 390/1440 píxeles muestran ambos enlaces, aviso y equipos accesibles | PASS público |
| 5. Temporizador en creación y pantalla de equipo | Test WEB local; Chromium muestra la cuenta atrás en creación y cabecera de equipo | PASS público |
| 6. Fallo/retraso no bloquea y contador continúa | El temporizador calcula el siguiente límite horario; la UI no depende del estado del Cron | PASS local |
| 7. Sin tokens en logs y sin caché | El reset no imprime tokens; controller usa `Cache-Control: no-store`; el manejador registra solo clase de excepción, fichero/línea, método, ruta y request ID; test confirma que omite el mensaje que contenía un token | PASS local |
| 8. Reset manual, pool, routing/IP y purga comprobados en Railway | Los logs aportados muestran ejecución satisfactoria del reset y varias purgas; el operador confirmó enlaces operativos, revisión del horario y tratamiento correcto de IP; captura posterior al reset muestra una fila vigente del pool conservada; una purga manual anterior eliminó una fila vencida (`Deleted 1`) | PASS — comprobaciones de runtime reportadas por la persona impulsora |

**Gate de verificación: READY_FOR_CHANGE_CONVERGE.** Los criterios de esta SPEC cuentan con evidencia local y pública, además de las comprobaciones operativas reportadas por la persona impulsora: reset y purga ejecutados, enlaces accesibles, horario y tratamiento de IP revisados y fila vigente del pool preservada. Los fallos `500` del 2026-10-08 son históricos; la comprobación pública del 2026-10-12 devolvió `200`. El Change puede pasar a convergencia PDI; los gates globales de Railway y clasificación de source que pertenecen a SPEC-COO-006/005 siguen documentados allí y no se declaran resueltos por esta verificación.

**Siguiente paso:** ejecutar `change-converge` y, si la convergencia queda limpia, `change-close`. La confirmación de la persona impulsora y la captura se conservan como evidencia reportada; el digest del dispositivo no se registra.

## Convergencia

Se compararon los ocho criterios con el código, las pruebas, la configuración IaC, la evidencia pública del 2026-10-12, las salidas de los dos Cron y las comprobaciones manuales reportadas por la persona impulsora. No se detecta discrepancia entre la intención de la SPEC y la implementación. La captura muestra una fila de tipo `device` conservada después del reset manual; se omite su digest. La persona impulsora confirma como correctos el horario y el tratamiento de IP, y que los enlaces demo siguen accesibles después del reset. Los fallos históricos de `/api/configuration` del 2026-10-08 no se reproducen en la comprobación pública posterior del 2026-10-12. Los gates generales de coste, source/licencia, persistencia y recuperación de Railway continúan separados bajo [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../99_archivadas/spec-coo-006-railway-iac-operacion-rel-002.md) y no forman parte del cierre funcional de esta SPEC. No hay baseline drift ni verdad normativa nueva que requiera `pdi:baseline-update`. **Convergencia PASS — READY_FOR_CHANGE_CLOSE (2026-10-12).**

## Resultado de cierre

**DONE — SPEC-EQU-006 cerrada el 2026-10-12 y archivada.** Los ocho criterios están en PASS con pruebas locales, comprobación pública y evidencia operativa reportada por la persona impulsora. La ejecución del reset y la purga, los enlaces, el temporizador, la preservación observada de una fila vigente del pool, el horario y el tratamiento de IP quedan verificados para preproducción. En la fecha de cierre de esta SPEC no se declaraba REL-002 entregada; la entrega global se cerró posteriormente el 2026-10-12 según [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md). Esta verificación funcional no sustituye los gates independientes de infraestructura recogidos en [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](spec-coo-006-railway-iac-operacion-rel-002.md), que también quedó cerrada.
