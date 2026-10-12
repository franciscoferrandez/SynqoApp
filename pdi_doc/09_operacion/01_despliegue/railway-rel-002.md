# Operación de Railway para REL-002

Este documento concreta la preparación local de [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../../08_especificaciones/99_archivadas/spec-coo-006-railway-iac-operacion-rel-002.md), conforme a [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md) y [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md). El servicio está en marcha; el procedimiento distingue el auto-deploy de aplicación desde `main` de la aplicación manual de IaC.

## Límites antes de operar

- La aplicación está conectada a GitHub y se despliega automáticamente al llegar cambios a `main`. La persona impulsora ya se siente segura manejando Railway y revisará el entorno a diario mientras finaliza el TFM. Antes de cada merge/push a `main`, revisar CI, migraciones, efectos sobre PostgreSQL y el commit que quedará publicado. La categoría contractual exacta de source no se deduce del hecho de que ya esté desplegada; ver los límites de [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../../08_especificaciones/99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md).
- No usar `railway up`. Los cambios de IaC siguen manuales: `railway config plan`, inspección y `railway config apply` interactivo.
- La persona impulsora ha verificado un crédito Trial de 5 USD durante un máximo de 30 días y el paso a Free con 1 USD mensual; no se contratará un plan de pago y se acepta que los workloads se detengan al agotarse los créditos. No es un hard limit configurable. Railway indica que los volúmenes stateful creados durante Trial se eliminan 30 días después de expirar los créditos si no se actualiza el plan. La persona impulsora acepta esta posible pérdida y recreará la base y los datos demo si ocurre. Fuentes: [Free Trial](https://docs.railway.com/pricing/free-trial), [Cost Control](https://docs.railway.com/pricing/cost-control), [CLI Usage](https://docs.railway.com/cli/usage).
- Las copias de PostgreSQL se dejan sin configurar. Antes de habilitar copias hay que comprobar el coste incremental, su retención y los controles visibles en la cuenta. Si no se confirma que caben dentro del mismo tope de 5 USD, permanecen desactivadas. La retención diaria documentada por Railway es de seis días; restaurar una copia puede reintroducir filas ya expiradas del pool temporal.
- Los Cron no forman parte del plan predeterminado y tienen opt-ins independientes. La purga se puede habilitar primero para comprobar el proceso cada cinco minutos; el reset destructivo horario solo se añade después de completar su validación manual según [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../../08_especificaciones/99_archivadas/spec-equ-006-juego-demo-preproduccion.md). La purga depende del contrato ya implementado en [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../../08_especificaciones/99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md).

## Herramientas locales

La definición está en `.railway/railway.ts` y utiliza el SDK de Railway fijado en `package-lock.json`. La CLI oficial se instala según la [guía vigente de instalación](https://docs.railway.com/cli); IaC requiere Railway CLI 5.42.1 o posterior. El login solo se realizará cuando se autorice la fase operativa. En el primer uso, `railway link` debe apuntar al workspace, proyecto y entorno `preproduction` correctos; su archivo local de vinculación queda ignorado por Git.

Desde el clon local, con Node 24.21.0:

```sh
nvm use 24.21.0
npm ci
npm --prefix apps/web ci
npm run railway:iac:check
```

El test local evalúa el grafo sin autenticar, enlazar ni comunicarse con Railway. Revisa que la configuración siga limitada al entorno preproduction, que no declare una fuente GitHub y que ambos Cron no aparezcan por defecto; además comprueba que la purga y el reset se habilitan con variables independientes.

Para construir la imagen local y probarla con un PostgreSQL efímero aislado:

```sh
npm run railway:image:smoke
```

El script crea una red y contenedores con sufijo aleatorio, ejecuta migraciones y comprueba WEB, API, healthcheck, 404 y avisos. Al terminar elimina solo esos contenedores y esa red; no usa la base de desarrollo ni Railway.

## Preparación y aplicación manual de IaC

La definición declara un proyecto `Synqo`, entorno `preproduction`, PostgreSQL 18 y un servicio HTTP combinado WEB/API. El servicio utiliza `Dockerfile.railway`, escucha en el puerto 8080, hace healthcheck en `/healthz` y ejecuta las migraciones Doctrine como pre-deploy command en cada deploy automático desde `main`. Doctrine tiene `server_version: '18'` fijado en la configuración de API, porque la URL de conexión generada por Railway no incluye `serverVersion`; este valor debe seguir la versión PostgreSQL declarada en IaC. La fuente GitHub está conectada; los cambios IaC se aplican manualmente y no se declaran copias de seguridad.

Antes de planificar, confirmar manualmente workspace/cuenta y que el proyecto/entorno enlazados son los previstos. Comprobar también créditos consumidos, plan/región disponibles, estado de persistencia y que el repositorio está en el commit que se pretende desplegar. La definición no fija región ni activa backups.

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

La app necesita variables protegidas fuera del repositorio. `APP_SECRET` se preserva como variable de Railway y se debe crear en el servicio HTTP antes del primer despliegue. `DEMO_ACCESS_SECRET` también se configura manualmente como variable protegida de al menos 32 bytes aleatorios; puede generarse localmente con `openssl rand -hex 32`, sin guardar ni compartir su valor. La IaC preserva ese secreto y los servicios lo referencian. Rotarlo invalida los enlaces demo hasta que un reset satisfactorio regenere las credenciales. `DEMO_DATABASE_HOST` debe apuntar al dominio privado del servicio `synqo-postgres`, mediante la referencia `${{synqo-postgres.RAILWAY_PRIVATE_DOMAIN}}`; el reset compara este valor con el host real de `DATABASE_URL` y solo admite PostgreSQL privado. La URL pública de la app se deriva de `RAILWAY_PUBLIC_DOMAIN`. El servicio usa `DATABASE_URL` referenciada desde PostgreSQL, `APP_ENV=prod`, `SYNQO_DEPLOYMENT_ENV=preproduction`, `TEAM_CREATION_EMAIL_ENABLED=false`, límites `2/60`, y `MAILER_DSN=null://null`. Así el correo real permanece desactivado y no requiere credenciales.

Tras el primer despliegue satisfactorio, generar manualmente un dominio Railway para `synqo-http` desde Settings → Networking → Public Networking → Generate Domain y seleccionar el puerto 8080 si Railway no lo detecta. Railway no asigna dominio al crear el servicio; al generarlo, `RAILWAY_PUBLIC_DOMAIN` alimenta `APP_PUBLIC_URL` y `DEFAULT_URI` en el siguiente runtime/deploy. No configurar un dominio personalizado.

## Primera conexión y publicación

GitHub ya está conectado y el auto-deploy desde `main` está activo. Antes de cada cambio que llegue a `main`, completar CI y revisar el cambio, las migraciones y los efectos de persistencia; ese push inicia el build/deploy. La categoría contractual exacta de source permanece según la excepción documentada en SPEC-COO-005 y no se presume resuelta por la disponibilidad del servicio.

Railway documenta que “Deploy Latest Commit” usa el último commit de la rama GitHub conectada y no ofrece elegir una rama arbitraria desde esa acción. El servicio sigue la rama conectada `main`; no se necesita pulsar “Deploy Latest Commit”. No se usa `railway up`.

La IaC deja `source` sin declarar en **cada** servicio HTTP y Cron. Crear `synqo-demo-reset` o `synqo-creation-limits-purge` mediante `config apply` configura el horario, el comando y el Dockerfile, pero no entrega una imagen ejecutable. La fuente de cada servicio Cron debe apuntar al repositorio y a `Dockerfile.railway` desde la raíz. Comprobar en cada servicio qué rama sigue y si su auto-deploy está habilitado; no asumir que el comportamiento del servicio HTTP se replica en los Cron. Tras actualizar la imagen que usan, comprobar en **Deployments** que existe un despliegue satisfactorio. Un evento **Cron Runs** con `Cron skipped: no running container and the deployment did not become ready` y sin logs de PHP indica que el comando programado aún no ha arrancado: revisar primero la fuente y el despliegue del servicio, no repetir el reset de datos. Railway describe la [fuente por servicio](https://docs.railway.com/services) y [cómo desactivar autodeploy](https://docs.railway.com/deployments/github-autodeploys).

Las migraciones se ejecutan en el pre-deploy de cada despliegue automático desde `main`. Antes de cada merge/push a esa rama, revisar localmente la lista y SQL de migraciones pendientes, compatibilidad hacia atrás y posibles cambios destructivos de datos/esquema. Si el resultado no se entiende, no integrar el cambio. El rollback de la imagen no revierte migraciones ni datos.

## Activación de Cron

Después del despliegue, las comprobaciones HTTP, DB y migraciones deben ser satisfactorias. Configurar primero solo la purga para probar su tarea no destructiva:

```sh
SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE=1 railway config plan
SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE=1 railway config apply
```

Revisar que solo se añade `synqo-creation-limits-purge` (`*/5 * * * *` UTC). Confirmar que el proceso termina y que conserva las filas vigentes del pool. Para ejecutar una prueba puntual del fixture, usar el comando remoto desde el servicio HTTP; requiere que el reset remoto esté listo conforme a SPEC-EQU-006 y habilitar la variable solo para ese comando:

```sh
railway ssh --service synqo-http --environment preproduction -- sh -lc 'DEMO_RESET_ENABLED=true php bin/console app:demo:reset --force --no-interaction'
```

Revisar los enlaces públicos, los dos equipos, el pool y los logs sin exponer secretos. Solo después de que esta prueba manual sea satisfactoria y SPEC-EQU-006 haya sido verificada, habilitar el Cron destructivo con un plan separado:

```sh
SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON=1 railway config plan
SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON=1 railway config apply
```

El plan debe añadir únicamente `synqo-demo-reset` (`0 * * * *` UTC). Cada job usa la misma imagen y PostgreSQL privado; el reset lleva sus guardas de entorno y ambos procesos terminan al completar. No habilitar el reset recurrente si no aparece el guard de preproducción o la prueba manual falla.

Si el reset devuelve el mensaje genérico de perfil no autorizado, consultar las variables del servicio HTTP sin copiar valores secretos. `APP_ENV`, `SYNQO_DEPLOYMENT_ENV` y `RAILWAY_ENVIRONMENT_NAME` deben indicar producción/preproducción; `DEMO_ACCESS_SECRET` debe existir y tener al menos 32 bytes; `DEMO_DATABASE_HOST` debe existir y coincidir exactamente con el hostname privado usado por `DATABASE_URL`. Una variable ausente o distinta bloquea el reset antes de borrar o cargar datos. Generar el secreto localmente con `openssl rand -hex 32` y cargarlo como variable protegida; definir `DEMO_DATABASE_HOST` con la referencia Railway indicada arriba. Si la IaC del repositorio ya declara estas variables, revisar `railway config plan` y aplicar manualmente solo un plan entendido y limitado al entorno `preproduction`. Railway puede reiniciar/republicar el servicio al cambiar variables; después, repetir la comprobación segura y consultar los logs antes de volver a invocar el comando. No habilitar el Cron como método de prueba.

## Comprobación inicial y operación

Tras cada despliegue automático desde `main`, verificar desde el dominio HTTPS asignado:

```sh
curl --fail --show-error --silent https://<dominio-railway>/healthz
curl --fail --show-error --silent https://<dominio-railway>/
curl --fail --show-error --silent https://<dominio-railway>/api/configuration
curl --include --silent https://<dominio-railway>/api/no-such-route
```

`/healthz` debe devolver `200`; `/` debe servir el `index.html` de Angular; `/api/configuration` debe devolver JSON con correo desactivado y límites preproduction `2/60`. `/api` debe redirigir a `/api/docs`, donde se publica la documentación de API Platform. Una ruta API inexistente anidada debe devolver `404` `application/problem+json`, nunca el HTML SPA. Comprobar los avisos públicos en `/SYNQO-LICENSE.txt`, `/THIRD_PARTY_NOTICES.txt`, `/3rdpartylicenses.txt` y `/ANGULAR-TEMPLATES-LICENSE.txt`.

En Railway, revisar estado/healthcheck y logs del servicio, conectividad PostgreSQL, resultado de migraciones y persistencia con una comprobación de lectura. No registrar ni copiar secretos desde la pestaña de variables o los logs. Cuando cada Cron esté habilitado, verificar por separado que su servicio concluye y revisar sus logs; Railway puede omitir una ejecución si la anterior sigue activa.

El primer healthcheck solo acredita que Caddy responde. No prueba por sí solo DB ni migraciones; esas comprobaciones son independientes. Correo está desactivado y no bloquea el piloto.

Si `GET /api/configuration` u otra ruta devuelve `500 application/problem+json`, obtener primero el request ID de la respuesta HTTP y consultar los logs del servicio en esa ventana:

```sh
railway logs --service synqo-http --environment preproduction --since 15m --lines 100
```

Tras desplegar una imagen con el manejador instrumentado, buscar `http.unhandled_exception`. El registro incluye únicamente clase de excepción, nombre de fichero y línea, método, nombre de ruta y request ID validado; omite mensaje, stack trace, query, cuerpo y credenciales. Correlacionar el request ID con la línea y revisar el commit activo antes de corregir. No habilitar `APP_DEBUG` públicamente ni copiar secretos a logs o incidencias. Si no aparece ningún registro, confirmar que la imagen activa contiene esta instrumentación y repetir la petición una sola vez para generar evidencia nueva.

## Recuperación

Para una regresión de aplicación, usar el panel de Railway para volver a una versión exitosa todavía dentro de la retención. Comprobar luego `/healthz`, WEB y rutas API. El rollback de Railway restaura imagen y variables de servicio; no es rollback de base, esquema ni datos. No restaurar PostgreSQL sin identificar la copia, fecha, alcance de pérdida y posible reaparición de filas expiradas. Para un plan IaC destructivo, no aplicar: primero volver a la definición anterior en Git y generar un plan nuevo para revisión.

## Límites aceptados y seguimiento

- La persona impulsora confirma el crédito Trial de 5 USD por hasta 30 días y Free con 1 USD mensual; no autoriza un plan de pago y acepta la parada de workloads al agotar créditos.
- La persona impulsora acepta la posible eliminación del volumen creado durante Trial y recrear la base PostgreSQL y el juego demo.
- El auto-deploy desde `main`, el servicio desplegado, las pruebas públicas y la ejecución de Cron están confirmados en la SPEC archivada; IaC permanece manual.
- La clasificación contractual exacta del source y los avisos del runtime conservan la excepción de SPEC-COO-005; esta aceptación operativa no es un dictamen jurídico.
- Correo real y backups de pago permanecen desactivados; no se fijan región ni dominio propio.

Fuentes de operación consultadas: [Railway IaC](https://docs.railway.com/infrastructure-as-code), [CLI](https://docs.railway.com/cli), [autodeploy GitHub](https://docs.railway.com/deployments/github-autodeploys), [acciones y rollback](https://docs.railway.com/deployments/deployment-actions), [Cron](https://docs.railway.com/cron-jobs), [variables](https://docs.railway.com/variables), [usage y hard limit](https://docs.railway.com/cli/usage), [backups PostgreSQL](https://docs.railway.com/guides/postgres-backups-restores).
