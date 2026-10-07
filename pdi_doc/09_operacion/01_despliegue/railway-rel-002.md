# Operación manual de Railway para REL-002

Este documento concreta la preparación local de [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../../08_especificaciones/01_activas/spec-coo-006-railway-iac-operacion-rel-002.md), conforme a [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md) y [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md). Es un procedimiento preparado; no acredita recursos creados, cuenta vinculada ni despliegue real.

## Límites antes de operar

- No iniciar sesión, vincular el proyecto, conectar GitHub, subir código, crear servicios ni ejecutar `config apply` durante la fase de preparación. [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../../08_especificaciones/99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md) mantiene pendiente la clasificación efectiva del envío de código. La aprobación de una topología no concede ese permiso.
- Tampoco se debe ejecutar `railway up`: el código solo se publicará desde el panel después del gate de licencia y con autodeploy desactivado.
- El tope aprobado para REL-002 es 5 USD al mes. La documentación actual de Railway indica que el hard limit de compute se configura en dólares enteros y su mínimo es 10 USD; por tanto, no demuestra que se pueda aplicar el límite aprobado de 5 USD. Hasta confirmar un control efectivo de máximo 5 USD o recibir una decisión que cambie el límite, no activar recursos con coste potencial. El uso Free puede evaluarse primero; no subir a Hobby bajo la configuración documentada hoy.
- Las copias de PostgreSQL se dejan sin configurar. Antes de habilitar copias hay que comprobar el coste incremental, su retención y los controles visibles en la cuenta. Si no se confirma que caben dentro del mismo tope de 5 USD, permanecen desactivadas. La retención diaria documentada por Railway es de seis días; restaurar una copia puede reintroducir filas ya expiradas del pool temporal.
- Los Cron no forman parte del plan predeterminado. El job `app:demo:reset` solo se añade tras publicar y verificar la aplicación y completar [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../../08_especificaciones/01_activas/spec-equ-006-juego-demo-preproduccion.md). La purga depende del contrato ya implementado en [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../../08_especificaciones/99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md).

## Herramientas locales

La definición está en `.railway/railway.ts` y utiliza el SDK de Railway fijado en `package-lock.json`. La CLI oficial se instala según la [guía vigente de instalación](https://docs.railway.com/cli); IaC requiere Railway CLI 5.42.1 o posterior. El login solo se realizará cuando se autorice la fase operativa. En el primer uso, `railway link` debe apuntar al workspace, proyecto y entorno `preproduction` correctos; su archivo local de vinculación queda ignorado por Git.

Desde el clon local, con Node 24.21.0:

```sh
nvm use 24.21.0
npm ci
npm --prefix apps/web ci
npm run railway:iac:check
```

El test local evalúa el grafo sin autenticar, enlazar ni comunicarse con Railway. Revisa que la configuración siga limitada al entorno preproduction, que no declare una fuente GitHub y que los dos Cron no aparezcan por defecto.

Para construir la imagen local y probarla con un PostgreSQL efímero aislado:

```sh
npm run railway:image:smoke
```

El script crea una red y contenedores con sufijo aleatorio, ejecuta migraciones y comprueba WEB, API, healthcheck, 404 y avisos. Al terminar elimina solo esos contenedores y esa red; no usa la base de desarrollo ni Railway.

## Preparación y aplicación manual de IaC

La definición declara un proyecto `Synqo`, entorno `preproduction`, PostgreSQL 18 y un servicio HTTP combinado WEB/API. El servicio utiliza `Dockerfile.railway`, escucha en el puerto 8080, hace healthcheck en `/healthz` y ejecuta las migraciones Doctrine como pre-deploy command durante una publicación iniciada manualmente. No se declaran fuente de código, credenciales, dominio, copias de seguridad ni triggers automáticos.

Antes de planificar, confirmar manualmente workspace/cuenta y que el proyecto/entorno enlazados son los previstos. Comprobar también el límite de gasto, plan/región disponibles, fuente GitHub ausente hasta completar el gate, estado de persistencia y que el repositorio está en el commit que se pretende revisar. La definición no fija región ni activa backups.

```sh
railway login
railway link
railway config plan
```

Inspeccionar todo el plan y detenerse ante servicios que se eliminen o sustituyan, cambios de volumen/PostgreSQL, borrado de datos, cambios de dominio inesperados o valores secretos no esperados. `plan` no reemplaza la revisión de costes y persistencia en el panel. Aplicar solo tras aclarar cualquier diferencia y aceptar interactivamente el plan:

```sh
railway config apply
```

No añadir `--yes` ni `--confirm-destructive`. No aplicar desde una sesión vinculada a otro proyecto o entorno. Tras el primer apply, volver a planificar y verificar que no quedan cambios inesperados.

La app necesita variables protegidas fuera del repositorio. `APP_SECRET` se preserva como variable de Railway y se debe crear en el servicio HTTP antes del primer despliegue. La URL pública de la app se deriva de `RAILWAY_PUBLIC_DOMAIN`. El servicio usa `DATABASE_URL` referenciada desde PostgreSQL, `APP_ENV=prod`, `SYNQO_DEPLOYMENT_ENV=preproduction`, `TEAM_CREATION_EMAIL_ENABLED=false`, límites `2/60`, y `MAILER_DSN=null://null`. Así el correo real permanece desactivado y no requiere credenciales.

Tras el primer despliegue satisfactorio, generar manualmente un dominio Railway para `synqo-http` desde Settings → Networking → Public Networking → Generate Domain y seleccionar el puerto 8080 si Railway no lo detecta. Railway no asigna dominio al crear el servicio; al generarlo, `RAILWAY_PUBLIC_DOMAIN` alimenta `APP_PUBLIC_URL` y `DEFAULT_URI` en el siguiente runtime/deploy. No configurar un dominio personalizado.

## Primera conexión y publicación

La clasificación del repositorio para Railway no se ha determinado. No conectar GitHub hasta que se resuelva el gate de licencia y se confirme en la interfaz vigente que la conexión no dispara build o deploy antes de permitir desactivar el autodeploy. Al conectar, comprobar en los ajustes del servicio que los despliegues automáticos están desactivados antes de continuar; si la interfaz no permite comprobarlo sin iniciar una publicación, detenerse.

Railway documenta que “Deploy Latest Commit” usa el último commit de la rama GitHub conectada y no ofrece elegir una rama arbitraria desde esa acción. Antes de pulsarlo, verificar que esa rama por defecto contiene exactamente la versión revisada y que la fuente ya fue autorizada. El paso de despliegue es siempre manual en el panel; no se usa `railway up`.

Las migraciones se ejecutan en el pre-deploy de la publicación manual. Antes de cada publicación, revisar localmente la lista y SQL de las migraciones pendientes, compatibilidad hacia atrás y posibles cambios destructivos de datos/esquema. Si el resultado no se entiende, no iniciar el deploy. El rollback de la imagen no revierte migraciones ni datos.

## Activación de Cron

Después del despliegue, las comprobaciones HTTP, DB y migraciones deben ser satisfactorias y SPEC-EQU-006 debe estar verificada. Solo entonces se puede incluir la tarea programada en un plan explícito:

```sh
SYNQO_ENABLE_PREPRODUCTION_CRONS=1 railway config plan
SYNQO_ENABLE_PREPRODUCTION_CRONS=1 railway config apply
```

Revisar en el plan que solo se añaden `synqo-demo-reset` (`0 * * * *` UTC) y `synqo-creation-limits-purge` (`*/5 * * * *` UTC), sin cambios colaterales. Los dos jobs utilizan la misma imagen, el mismo PostgreSQL privado y procesos de consola que finalizan al completar. Si el reset programado no está autorizado por SPEC-EQU-006 o no aparece su guard de preproducción, no habilitar esta opción.

## Comprobación inicial y operación

Tras cada publicación manual, verificar desde el dominio HTTPS asignado:

```sh
curl --fail --show-error --silent https://<dominio-railway>/healthz
curl --fail --show-error --silent https://<dominio-railway>/
curl --fail --show-error --silent https://<dominio-railway>/api/configuration
curl --include --silent https://<dominio-railway>/api/no-such-route
```

`/healthz` debe devolver `200`; `/` debe servir el `index.html` de Angular; `/api/configuration` debe devolver JSON con correo desactivado y límites preproduction `2/60`. Una ruta API inexistente anidada debe devolver `404` `application/problem+json`, nunca el HTML SPA. `/api` es el endpoint de documentación de API Platform y no es una URL de prueba de 404. Comprobar los avisos públicos en `/SYNQO-LICENSE.txt`, `/THIRD_PARTY_NOTICES.txt`, `/3rdpartylicenses.txt` y `/ANGULAR-TEMPLATES-LICENSE.txt`.

En Railway, revisar estado/healthcheck y logs del servicio, conectividad PostgreSQL, resultado de migraciones y persistencia con una comprobación de lectura. No registrar ni copiar secretos desde la pestaña de variables o los logs. Cuando los Cron estén habilitados, verificar que los dos servicios concluyen y revisar sus logs en una ejecución; Railway puede omitir una ejecución si la anterior sigue activa.

El primer healthcheck solo acredita que Caddy responde. No prueba por sí solo DB ni migraciones; esas comprobaciones son independientes. Correo está desactivado y no bloquea el piloto.

## Recuperación

Para una regresión de aplicación, usar el panel de Railway para volver a una versión exitosa todavía dentro de la retención. Comprobar luego `/healthz`, WEB y rutas API. El rollback de Railway restaura imagen y variables de servicio; no es rollback de base, esquema ni datos. No restaurar PostgreSQL sin identificar la copia, fecha, alcance de pérdida y posible reaparición de filas expiradas. Para un plan IaC destructivo, no aplicar: primero volver a la definición anterior en Git y generar un plan nuevo para revisión.

## Límites y evidencia pendiente

- No se han verificado en una cuenta real el coste, hard limit, región, retención de imágenes, acceso a correo ni defaults de backups. El tope de 5 USD no se considera garantizado por el hard limit documentado actualmente.
- No se ha conectado GitHub ni probado si la conexión inicia un primer build; la fuente sigue sujeta al gate de licencia.
- No se han creado recursos, medido consumo ni verificado URLs/logs reales.
- La imagen local incluye avisos de API y WEB. Hay que completar la comprobación de licencias del runtime FrankenPHP/Caddy/Debian antes de permitir transferencia externa de la imagen/source.
- El cambio no selecciona ni configura una región, dominio propio, proveedor de correo o copias de seguridad.

Fuentes de operación consultadas: [Railway IaC](https://docs.railway.com/infrastructure-as-code), [CLI](https://docs.railway.com/cli), [autodeploy GitHub](https://docs.railway.com/deployments/github-autodeploys), [acciones y rollback](https://docs.railway.com/deployments/deployment-actions), [Cron](https://docs.railway.com/cron-jobs), [variables](https://docs.railway.com/variables), [usage y hard limit](https://docs.railway.com/cli/usage), [backups PostgreSQL](https://docs.railway.com/guides/postgres-backups-restores).
