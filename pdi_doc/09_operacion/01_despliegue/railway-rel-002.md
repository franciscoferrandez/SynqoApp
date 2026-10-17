# Operación de Railway para REL-002

Este documento concreta la preparación local de [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../../08_especificaciones/99_archivadas/spec-coo-006-railway-iac-operacion-rel-002.md), conforme a [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md) y [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md). El servicio está en marcha; el procedimiento distingue el auto-deploy de aplicación desde `main` de la aplicación manual de IaC.

## Límites antes de operar

- La aplicación está conectada a GitHub y se despliega automáticamente al llegar cambios a `main`. La persona impulsora ya se siente segura manejando Railway y revisará el entorno a diario mientras finaliza el TFM. Antes de cada merge/push a `main`, revisar CI, migraciones, efectos sobre PostgreSQL y el commit que quedará publicado. La categoría contractual exacta de source no se deduce del hecho de que ya esté desplegada; ver los límites de [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../../08_especificaciones/99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md).
- El despliegue habitual del código sigue GitHub. `railway up` queda reservado a la orden excepcional `deploy-local` del toolkit, que exige un árbol Git limpio y confirmación; los cambios de IaC siguen manuales: `railway config plan`, inspección y `railway config apply` interactivo.
- La persona impulsora ha verificado un crédito Trial de 5 USD durante un máximo de 30 días y el paso a Free con 1 USD mensual; no se contratará un plan de pago y se acepta que los workloads se detengan al agotarse los créditos. No es un hard limit configurable. Railway indica que los volúmenes stateful creados durante Trial se eliminan 30 días después de expirar los créditos si no se actualiza el plan. La persona impulsora acepta esta posible pérdida y recreará la base y los datos demo si ocurre. Fuentes: [Free Trial](https://docs.railway.com/pricing/free-trial), [Cost Control](https://docs.railway.com/pricing/cost-control), [CLI Usage](https://docs.railway.com/cli/usage).
- Las copias de PostgreSQL se dejan sin configurar. Antes de habilitar copias hay que comprobar el coste incremental, su retención y los controles visibles en la cuenta. Si no se confirma que caben dentro del mismo tope de 5 USD, permanecen desactivadas. La retención diaria documentada por Railway es de seis días; restaurar una copia puede reintroducir filas ya expiradas del pool temporal.
- Los Cron no forman parte del plan predeterminado y tienen opt-ins independientes. La purga se puede habilitar primero para comprobar el proceso cada cinco minutos; el reset destructivo horario solo se añade después de completar su validación manual según [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../../08_especificaciones/99_archivadas/spec-equ-006-juego-demo-preproduccion.md). La purga depende del contrato ya implementado en [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../../08_especificaciones/99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md).

## Herramientas locales

El toolkit de preproducción se inicia con `./railway-toolkit.sh --help`. Su procedimiento, comprobaciones y límites están en [Toolkit local de Railway](railway-toolkit.md). Los scripts no paran ni publican nada al mostrar ayuda o estado. Las operaciones remotas verifican el ID del proyecto Synqo y se limitan al entorno `preproduction`.

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

La app necesita variables protegidas fuera del repositorio. `APP_SECRET` se preserva como variable de Railway y se debe crear en el servicio HTTP antes del primer despliegue. `DEMO_ACCESS_SECRET` también se configura manualmente como variable protegida de al menos 32 bytes aleatorios; puede generarse localmente con `openssl rand -hex 32`, sin guardar ni compartir su valor. La IaC preserva ese secreto y los servicios lo referencian. `DEMO_TEAM_IDS` debe existir en HTTP y Cron: se deja vacía para una inicialización manual y luego contiene los dos UUID demo estables, separados por coma. El reset comprueba esos UUID y sus verificadores derivados del secreto del entorno. `DEMO_DATABASE_HOST` apunta al dominio privado de `synqo-postgres` (`${{synqo-postgres.RAILWAY_PRIVATE_DOMAIN}}`); preproducción comprueba ese hostname de Railway. Producción, si se configura más adelante, usará el mismo comando y un host privado exacto, sin depender de la plataforma. `TEAM_CREATION_EMAIL_MODE=hidden` y `MAILER_DSN=null://null` mantienen desactivado el correo real. Los límites siguen en `2/60`.

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

Revisar que solo se añade `synqo-creation-limits-purge` (`*/5 * * * *` UTC). Confirmar que el proceso termina y que conserva las filas vigentes del pool. Para ejecutar una prueba puntual del fixture, usar el comando remoto desde el servicio HTTP; requiere que el reset selectivo esté listo conforme a SPEC-EQU-011 y habilitar la variable solo para ese comando:

```sh
railway ssh --service synqo-http --environment preproduction -- sh -lc 'DEMO_RESET_ENABLED=true php bin/console app:demo:reset --force --no-interaction'
```

Revisar los enlaces públicos, los dos equipos, el pool y los logs sin exponer secretos. Solo después de que esta prueba manual sea satisfactoria y SPEC-EQU-011 haya sido verificada, habilitar el Cron con un plan separado:

```sh
SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON=1 railway config plan
SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON=1 railway config apply
```

Ese opt-in añade el Cron y establece `DEMO_RESET_SCHEDULE_ENABLED=true` en HTTP para publicar el temporizador. Sin Cron, la preproducción conserva el panel demo, pero la interfaz indica que no hay restauración automática. Producción puede usar este mismo comando desde cualquier scheduler; esta guía no crea su infraestructura.

El plan debe añadir únicamente `synqo-demo-reset` (`0 * * * *` UTC). Cada job usa la misma imagen y PostgreSQL privado; el reset lleva sus guardas de entorno y ambos procesos terminan al completar. No habilitar el reset recurrente si no aparece el guard de preproducción o la prueba manual falla.

Si el reset devuelve el mensaje genérico de perfil no autorizado, consultar las variables del servicio HTTP sin copiar valores secretos. `APP_ENV=prod`, `SYNQO_DEPLOYMENT_ENV=preproduction`, `RAILWAY_ENVIRONMENT_NAME=preproduction`, `DEMO_RESET_ENABLED=true`, el secreto de al menos 32 bytes, los dos UUID y `DEMO_DATABASE_HOST` coincidente con el host de `DATABASE_URL` son necesarios. Una variable ausente o distinta bloquea el reset antes de borrar o cargar datos. Generar el secreto localmente con `openssl rand -hex 32` y cargarlo como variable protegida; definir `DEMO_DATABASE_HOST` con la referencia Railway indicada arriba. Si la IaC del repositorio ya declara estas variables, revisar `railway config plan` y aplicar manualmente solo un plan entendido y limitado al entorno `preproduction`. Railway puede reiniciar/republicar el servicio al cambiar variables; después, repetir la comprobación segura y consultar los logs antes de volver a invocar el comando. No habilitar el Cron como método de prueba.

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


## Reset selectivo de demo — REL-003

El comportamiento vigente se rige por [ADR-EQU-005 — Conservar UUID y limitar el reset a los equipos demo configurados](../../05_investigacion-y-decisiones/05_adr/adr-equ-005-reset-demo-uuid-estables.md) y se entrega con [SPEC-EQU-009 — Limitar el reset horario a los equipos demo](../../08_especificaciones/99_archivadas/spec-equ-009-reset-selectivo-equipos-demo.md). Las instrucciones anteriores de carga inicial mediante reset normal quedan sustituidas para preproducción. La rotación de enlaces requiere aplicar la migración que añade `team.demo_access_generation`.

### Transición de los demo ya existentes

1. Pausar temporalmente el Cron antiguo desde Railway antes de conservar grupos reales. Mientras su imagen siga siendo la anterior, seguirá ejecutando el borrado global. No usar una variable nueva como protección frente al código antiguo, que la ignora.
2. Abrir los dos enlaces demo publicados y obtener el campo `id` de `GET /api/teams/current` en el inspector del navegador. Comprobar que ambos pertenecen a esos enlaces; los nombres solos no distinguen un homónimo. No copiar el Bearer ni URLs con tokens a logs. La lectura no modifica datos.
3. Crear `DEMO_TEAM_IDS=<uuid-demo-1>,<uuid-demo-2>` en `synqo-http`, preservando el mismo `DEMO_ACCESS_SECRET`. Referenciar exactamente ese valor en `synqo-demo-reset`, como declara la IaC. La variable debe existir incluso si se decide dejarla vacía para detener las mutaciones del nuevo reset. Ausente devuelve error, vacía devuelve éxito sin cambios, no vacía exige dos identidades demo válidas.
4. Desplegar el cambio de aplicación conforme al auto-deploy desde `main`. Revisar CI y, si se aplica IaC, inspeccionar primero el plan. Verificar el SHA de la nueva imagen **por separado** en HTTP y Cron; el auto-deploy de HTTP no acredita el del Cron. No reactivar un job con una imagen antigua. No se aplica IaC ni se publica desde esta preparación local.
5. Con la imagen nueva y la migración aplicada, invocar manualmente el reset normal desde HTTP con las guardas autorizadas, como en el comando de la sección de activación. Debe restaurar solo los dos demo, conservar sus UUID, invalidar los enlaces previos y publicar los nuevos en `/api/configuration`; mantener un equipo real de prueba y todos sus datos, y no alterar el pool de creación. Revisar salida/logs sin secretos.
6. Solo después de verificar ambos servicios y la conservación de datos, reanudar el Cron normal `app:demo:reset --force --no-interaction`, sin `--initialize`. Confirmar que una ejecución programada también conserva el equipo real. El temporizador cuenta hacia el siguiente punto de hora UTC y sigue describiendo los equipos de ejemplo.

### Primera carga manual

Definir `DEMO_TEAM_IDS` como cadena vacía en el HTTP y conservar el Cron detenido. Verificar las guardas remotas y ejecutar manualmente con `--initialize`. Si la base ya contiene equipos reales, añadir `--allow-non-empty`; el comando conservará sus datos y rechazará una carga cuando ya existan credenciales demo. Sin ese flag, exige una base sin equipos. La inicialización está disponible en cualquier perfil autorizado (local o preproducción); en Railway sigue siendo manual:

```sh
railway ssh --service synqo-http --environment preproduction -- sh -lc 'DEMO_RESET_ENABLED=true php bin/console app:demo:reset --initialize --allow-non-empty --force --no-interaction'
```

La inicialización adquiere el mismo advisory lock y un bloqueo de tabla. Con `--allow-non-empty` conserva todos los equipos existentes y comprueba que no haya credenciales demo ya cargadas. Muestra la línea `DEMO_TEAM_IDS=<uuid-1>,<uuid-2>` en salida automatizada, sin tokens. Copiarla al servicio HTTP y compartirla con el Cron antes de usar el reset normal. Todo reset que restaure equipos informa la misma línea. No hay inicialización automática ni carga parcial cuando falta un demo.

### Diagnóstico y recuperación del reset selectivo

Una lista inválida, falta de un UUID, selección de un equipo real o verificadores que no coincidan producen error no cero y conservan los datos. Un fallo durante la limpieza/actualización/carga revierte toda la transacción; la salida segura informa de discrepancias sin revelar conexión ni credenciales. No modificar la lista para incluir equipos ajenos como forma de evitar el error. Si se perdió una raíz demo, mantener el Cron detenido y resolver su recuperación de forma dirigida; no vaciar la base.

Cada reset conserva UUID y fecha de creación de las raíces, incrementa `demo_access_generation` y reemplaza el verificador activo. Los enlaces anteriores dejan de funcionar; `/api/configuration` lee esa versión y publica solo el enlace vigente. La migración inicializa el contador a cero, que mantiene válidos los enlaces existentes hasta el primer reset nuevo. No se guarda historial de caducidades ni de tokens.

Para un rollback de imagen, **mantener detenido el Cron**: una imagen anterior puede recuperar el borrado global y no reconocer la columna de versión, aunque conserve la nueva variable. Dejar `DEMO_TEAM_IDS` vacía solo neutraliza el reset nuevo. La rotación de `DEMO_ACCESS_SECRET` requiere procedimiento dirigido y coordinación HTTP/Cron; no se automatiza en este Change.

La preservación frente al reset horario no cambia la caducidad/retención del producto ni los límites de persistencia/créditos del hosting. El estado de entrega requiere evidencia de despliegue de ambos servicios y de la conservación tras el Cron; los checks locales por sí solos no permiten marcarlo ENTREGADO.
