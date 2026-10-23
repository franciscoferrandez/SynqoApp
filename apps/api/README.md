# Synqo API

API Symfony 7.4 con Doctrine ORM y PostgreSQL 18. El código local se ejecuta en PHP 8.5 mediante Docker Compose; Angular se ejecuta en el host y redirige `/api` a `localhost:8000`.

Desde la raíz del repositorio:

```sh
cp .env.example .env
docker compose up -d --build
# MAIL_EVENT_KEY=$(openssl rand -base64 32) debe estar en el entorno o en el .env raíz
docker compose exec api composer install
docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction
docker compose run --rm api composer db:reset:test
docker compose run --rm api composer test
docker compose exec api php bin/console doctrine:schema:validate
```

La base de prueba `synqo_test` se crea al inicializar PostgreSQL y se recrea con `composer db:reset:test`. El volumen local `synqo-equ-001_postgres-data` contiene los datos de desarrollo. Con `APP_ENV=test`, Doctrine usa siempre `DATABASE_URL_TEST`, incluso al invocar `php bin/phpunit` directamente. PHPUnit y `composer db:reset:test` comprueban que apunta a `POSTGRES_TEST_DB` y no a la base de desarrollo; si falta o no coincide, se detienen antes de tocar datos. Ejecuta las pruebas dentro de Compose con `composer test`.

Para inspeccionar la base de desarrollo desde HeidiSQL, crea una sesión de tipo PostgreSQL (TCP/IP) con servidor `127.0.0.1`, puerto `5433`, usuario `synqo`, contraseña `synqo-local` y base de datos `synqo`. Estos son los valores predeterminados de `compose.yaml`; si defines `POSTGRES_*` en `.env`, usa esos valores. El puerto `5432` es el que usa la API dentro de Docker, mientras que HeidiSQL se conecta al puerto `5433` publicado en el equipo. Las tablas funcionales incluyen `team`, `participant`, `availability`, `consultation`, `consultation_option`, `consultation_vote`, `consultation_vote_selection`, `consultation_resolution_option`, `team_mail_attempt` y el pool aislado `team_creation_origin_event`.

Las operaciones implementadas son `POST /api/teams`, `GET /api/teams/current`, `POST /api/teams/current/participants`, `GET /api/teams/current/availability`, `PUT /api/teams/current/availability/{date}/participants/{participantId}` y `GET`/`POST /api/teams/current/consultations`. El enlace conserva el secreto en el fragmento de URL. La API guarda solo su SHA-256 y exige Bearer para las operaciones del equipo.

La web muestra la confirmación después de crear un equipo. Una configuración interna puede registrar `TEAM_CREATION_CONFIRMATION` con `useValue: false` en `appConfig.providers` para abrir directamente el enlace; el valor predeterminado es `true`.

La limpieza de equipos caducados se ejecuta desde la raíz:

```sh
docker compose exec api php bin/console app:teams:cleanup
```

`TEAM_DELETION_RETENTION_DAYS` permite sustituir el valor inicial de `90` en `.env` sin cambiar código. Después de modificarlo, recrea el servicio API con `docker compose up -d api`. Debe ser un entero positivo; un valor vacío, cero, negativo o no entero rechaza la configuración al resolver el comando. El plazo cuenta días de 24 horas desde el instante efectivo de caducidad calculado en la zona del equipo y convertido a UTC; no cuenta desde la última lectura. El comando informa solo del número de equipos eliminados y se puede repetir: cada raíz se bloquea, se vuelve a comprobar su elegibilidad y se elimina en una transacción. PostgreSQL aplica las cascadas de sus datos dependientes; cualquier nueva tabla con datos del equipo debe mantener esa frontera mediante su FK.

El proceso elimina únicamente datos de la base activa; no implementa retención de copias de seguridad ni medidas de restauración.

## Edición de consultas

`PATCH /api/teams/current/consultations/{consultationId}` aplica cambios explícitos de título y opciones mediante `optionChanges`, con IDs estables y confirmación específica de retiradas con votos. Para texto admite altas y cambios `{id,text}`; para fechas, altas `{id,date}` y retiradas, sin cambios de fecha sobre opciones existentes. `timeZone` es opcional al editar fechas y usa la zona del equipo si se omite. Solo las altas nuevas se validan desde hoy; las fechas pasadas conservadas y los reintentos idénticos mantienen su identidad y votos. Las entradas, respuestas y tipos de conflicto se publican en OpenAPI; las capacidades se definen en [RF-CON-006 — Editar una consulta con opciones de texto](../../pdi_doc/03_requisitos/01_funcionales/CON/rf-con-006-editar-consulta-texto.md) y [RF-CON-007 — Editar una consulta de fechas](../../pdi_doc/03_requisitos/01_funcionales/CON/rf-con-007-editar-consulta-fechas.md). La migración de última edición se aplica con el comando de migraciones habitual, sin resetear los datos existentes; la edición de fechas no requiere otra migración.

## Restaurar únicamente los equipos demo

`DEMO_TEAM_IDS` debe estar definida en el proceso que ejecuta el reset. Una cadena vacía, sin `--initialize`, termina correctamente sin borrar ni cargar datos. Una lista no vacía contiene exactamente los dos UUID distintos de los demo, separados por coma. Se validan sus verificadores contra `DEMO_ACCESS_SECRET`; nombres iguales no identifican equipos demo. Una lista parcial, inválida o con un equipo real falla sin cambios. La IaC preserva la variable del HTTP y la referencia desde el Cron; el HTTP puede servir peticiones aunque falte esta variable.

En cualquier entorno se conservan las raíces demo, sus UUID y fecha de creación. Se eliminan y recargan sus datos dependientes en una transacción. Cada reset incrementa `demo_access_generation` y reemplaza el verificador activo: los enlaces anteriores caducan y `/api/configuration` publica los nuevos. No se guarda historial. Los equipos de usuarios y el pool de creación persisten y siguen sujetos a caducidad/retención normales; los UUID de participantes demo pueden cambiar.

El mismo comando selectivo se usa en desarrollo, preproducción y producción. En remoto exige perfil, secreto, los dos UUID y host de PostgreSQL autorizado para ese destino; producción verifica que el host exacto resuelva únicamente a direcciones privadas sin depender de una plataforma concreta. `--force --no-interaction` permite ejecutarlo desde un scheduler y no omite ninguna guarda. La IaC actual solo declara el Cron horario de preproducción y su activación sigue siendo independiente. Producción puede programar este comando con cualquier plataforma cuando tenga un entorno propio validado; este repositorio no crea ni activa ese entorno.

Para una **primera carga manual**, genera un valor con `openssl rand -hex 32`, guárdalo como `DEMO_ACCESS_SECRET` en el `.env` local y deja `DEMO_TEAM_IDS=` vacío. Recrea los servicios para que Compose les pase los cambios y ejecuta `app:demo:reset --initialize`. Por defecto exige que no haya equipos; si quieres conservar equipos existentes, añade `--allow-non-empty`. La salida muestra `DEMO_TEAM_IDS=<uuid-1>,<uuid-2>` sin tokens en modo no interactivo. Copia esos UUID al `.env` antes del reset siguiente y vuelve a recrear API. El Cron nunca usa `--initialize`. Cada reset conserva los UUID, incrementa `demo_access_generation` y sustituye el verificador; los enlaces anteriores dejan de funcionar y `/api/configuration` publica los nuevos. Solo se almacena la versión actual, no un historial. La [operación de Railway](../../pdi_doc/09_operacion/01_despliegue/railway-rel-002.md#reset-selectivo-de-demo--rel-003) detalla la configuración de preproducción.

Si hay una discrepancia se informa de la fase o cantidades esperadas/observadas y se devuelve error; se revierte cualquier limpieza parcial. `--force` no omite estas comprobaciones. No se cambia ni se rota el secreto durante esta transición: una rotación exige una intervención dirigida sobre los dos UUID y verificadores anteriores, separada del reset normal.

## Inicializar y restaurar el juego demo local

La carga inicial solo añade los dos equipos de ejemplo. En `.env` local, define un secreto para derivar sus enlaces y deja `DEMO_TEAM_IDS=` vacía. Aplica esos valores al contenedor:

```sh
docker compose up -d --force-recreate api
```

Después, desde la raíz, ejecuta:

```sh
docker compose exec -e DEMO_TEAM_IDS= api php bin/console app:demo:reset --initialize
```

La inicialización no borra datos. Sin `--allow-non-empty` exige una base sin equipos; al añadir ese flag permite conservar los equipos existentes, pero falla si ya hay alguno demo. Confirma la operación cuando pregunte. Al terminar imprime los dos UUID para que los copies a `DEMO_TEAM_IDS`; los enlaces con tokens aparecen solo en salida interactiva. Trátalos como credenciales y evita guardarlos en logs. La fixture contiene cuatro participantes por equipo, disponibilidades y consultas de fechas/texto.

Una vez guardados los UUID en `.env`, actualiza primero el contenedor API y restaura solo esos dos equipos:

```sh
docker compose up -d --force-recreate api
docker compose exec api php bin/console app:demo:reset
```

El comando solicita confirmación. En modo no interactivo añade `-T --force --no-interaction`. En local siempre exige `APP_ENV=dev` y PostgreSQL en un host local permitido, aunque cambies `SYNQO_DEPLOYMENT_ENV` para simular preproducción o producción. Solo borra los datos que dependen de los dos UUID indicados; los equipos reales y el pool independiente de creación permanecen. Si faltan UUID, no coinciden con las dos identidades demo o falla una escritura, no se aplica el reset.

Para probar la presentación de otros entornos, cambia en `.env` `SYNQO_DEPLOYMENT_ENV` a `preproduction` o `production`, y ajusta por separado `TEAM_CREATION_EMAIL_MODE`, `DEMO_PANEL_ENABLED` y `DEMO_RESET_SCHEDULE_ENABLED`; después recrea `api` y `mail-worker` con `docker compose up -d --force-recreate api mail-worker`. Vacío conserva el default del entorno: correo oculto fuera de desarrollo y panel demo visible por defecto en preproducción. Puedes usar `TEAM_CREATION_EMAIL_MODE=demo` para ver el campo y el aviso sin enviar ni guardar la dirección. `DEMO_RESET_SCHEDULE_ENABLED=true` solo simula el aviso y el temporizador en la interfaz local; no crea un Cron. Estas simulaciones siguen conectadas a PostgreSQL local y no habilitan ningún destino remoto.

## Límite de creación por origen

La API usa `SYNQO_DEPLOYMENT_ENV` para escoger el valor predeterminado: desarrollo y preproducción permiten 2 equipos en 60 minutos; producción, 5 en 120 minutos. `TEAM_CREATION_LIMIT` y `TEAM_CREATION_WINDOW_MINUTES` permiten sustituir cada valor independientemente desde `.env`. Déjalas vacías para conservar el perfil. Tras modificar la configuración local, recrea el servicio con `docker compose up -d api`. Los overrides deben ser enteros positivos; una configuración inválida falla al iniciar la política. La purga se puede ejecutar manualmente con `docker compose exec api php bin/console app:creation-limits:purge`; no cambia el reset demo ni borra filas todavía vigentes.
