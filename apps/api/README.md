# Synqo API

API Symfony 7.4 con Doctrine ORM y PostgreSQL 18. El código local se ejecuta en PHP 8.5 mediante Docker Compose; Angular se ejecuta en el host y redirige `/api` a `localhost:8000`.

Desde la raíz del repositorio:

```sh
cp .env.example .env
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction
docker compose run --rm api composer db:reset:test
docker compose run --rm api composer test
docker compose exec api php bin/console doctrine:schema:validate
```

La base de prueba `synqo_test` se crea al inicializar PostgreSQL y se recrea con `composer db:reset:test`. El volumen local `synqo-equ-001_postgres-data` contiene los datos de desarrollo.

Para inspeccionar la base de desarrollo desde HeidiSQL, crea una sesión de tipo PostgreSQL (TCP/IP) con servidor `127.0.0.1`, puerto `5433`, usuario `synqo`, contraseña `synqo-local` y base de datos `synqo`. Estos son los valores predeterminados de `compose.yaml`; si defines `POSTGRES_*` en `.env`, usa esos valores. El puerto `5432` es el que usa la API dentro de Docker, mientras que HeidiSQL se conecta al puerto `5433` publicado en el equipo. Las tablas de este incremento son `team`, `participant` y `doctrine_migration_versions`.

Las operaciones implementadas son `POST /api/teams`, `GET /api/teams/current` y `POST /api/teams/current/participants`. El enlace conserva el secreto en el fragmento de URL. La API guarda solo su SHA-256 y exige Bearer para las operaciones del equipo.

La web muestra la confirmación después de crear un equipo. Una configuración interna puede registrar `TEAM_CREATION_CONFIRMATION` con `useValue: false` en `appConfig.providers` para abrir directamente el enlace; el valor predeterminado es `true`.
