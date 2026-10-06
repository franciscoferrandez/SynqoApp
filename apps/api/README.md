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

La base de prueba `synqo_test` se crea al inicializar PostgreSQL y se recrea con `composer db:reset:test`. El volumen local `synqo-equ-001_postgres-data` contiene los datos de desarrollo.

Para inspeccionar la base de desarrollo desde HeidiSQL, crea una sesión de tipo PostgreSQL (TCP/IP) con servidor `127.0.0.1`, puerto `5433`, usuario `synqo`, contraseña `synqo-local` y base de datos `synqo`. Estos son los valores predeterminados de `compose.yaml`; si defines `POSTGRES_*` en `.env`, usa esos valores. El puerto `5432` es el que usa la API dentro de Docker, mientras que HeidiSQL se conecta al puerto `5433` publicado en el equipo. Las tablas actuales incluyen `team`, `participant`, `availability`, `consultation`, `consultation_option` y `doctrine_migration_versions`.

Las operaciones implementadas son `POST /api/teams`, `GET /api/teams/current`, `POST /api/teams/current/participants`, `GET /api/teams/current/availability`, `PUT /api/teams/current/availability/{date}/participants/{participantId}` y `GET`/`POST /api/teams/current/consultations`. El enlace conserva el secreto en el fragmento de URL. La API guarda solo su SHA-256 y exige Bearer para las operaciones del equipo.

La web muestra la confirmación después de crear un equipo. Una configuración interna puede registrar `TEAM_CREATION_CONFIRMATION` con `useValue: false` en `appConfig.providers` para abrir directamente el enlace; el valor predeterminado es `true`.

La limpieza de equipos caducados se ejecuta desde la raíz:

```sh
docker compose exec api php bin/console app:teams:cleanup
```

`TEAM_DELETION_RETENTION_DAYS` permite sustituir el valor inicial de `90` en `.env` sin cambiar código. Después de modificarlo, recrea el servicio API con `docker compose up -d api`. Debe ser un entero positivo; un valor vacío, cero, negativo o no entero rechaza la configuración al resolver el comando. El plazo cuenta días de 24 horas desde el instante efectivo de caducidad calculado en la zona del equipo y convertido a UTC; no cuenta desde la última lectura. El comando informa solo del número de equipos eliminados y se puede repetir: cada raíz se bloquea, se vuelve a comprobar su elegibilidad y se elimina en una transacción. PostgreSQL aplica las cascadas de sus datos dependientes; cualquier nueva tabla con datos del equipo debe mantener esa frontera mediante su FK.

El proceso elimina únicamente datos de la base activa; no implementa retención de copias de seguridad ni medidas de restauración.
