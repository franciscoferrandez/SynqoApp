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

Para inspeccionar la base de desarrollo desde HeidiSQL, crea una sesión de tipo PostgreSQL (TCP/IP) con servidor `127.0.0.1`, puerto `5433`, usuario `synqo`, contraseña `synqo-local` y base de datos `synqo`. Estos son los valores predeterminados de `compose.yaml`; si defines `POSTGRES_*` en `.env`, usa esos valores. El puerto `5432` es el que usa la API dentro de Docker, mientras que HeidiSQL se conecta al puerto `5433` publicado en el equipo. Las tablas funcionales incluyen `team`, `participant`, `availability`, `consultation`, `consultation_option`, `consultation_vote`, `consultation_vote_selection`, `consultation_resolution_option`, `team_mail_attempt` y el pool aislado `team_creation_origin_event`.

Las operaciones implementadas son `POST /api/teams`, `GET /api/teams/current`, `POST /api/teams/current/participants`, `GET /api/teams/current/availability`, `PUT /api/teams/current/availability/{date}/participants/{participantId}` y `GET`/`POST /api/teams/current/consultations`. El enlace conserva el secreto en el fragmento de URL. La API guarda solo su SHA-256 y exige Bearer para las operaciones del equipo.

La web muestra la confirmación después de crear un equipo. Una configuración interna puede registrar `TEAM_CREATION_CONFIRMATION` con `useValue: false` en `appConfig.providers` para abrir directamente el enlace; el valor predeterminado es `true`.

La limpieza de equipos caducados se ejecuta desde la raíz:

```sh
docker compose exec api php bin/console app:teams:cleanup
```

`TEAM_DELETION_RETENTION_DAYS` permite sustituir el valor inicial de `90` en `.env` sin cambiar código. Después de modificarlo, recrea el servicio API con `docker compose up -d api`. Debe ser un entero positivo; un valor vacío, cero, negativo o no entero rechaza la configuración al resolver el comando. El plazo cuenta días de 24 horas desde el instante efectivo de caducidad calculado en la zona del equipo y convertido a UTC; no cuenta desde la última lectura. El comando informa solo del número de equipos eliminados y se puede repetir: cada raíz se bloquea, se vuelve a comprobar su elegibilidad y se elimina en una transacción. PostgreSQL aplica las cascadas de sus datos dependientes; cualquier nueva tabla con datos del equipo debe mantener esa frontera mediante su FK.

El proceso elimina únicamente datos de la base activa; no implementa retención de copias de seguridad ni medidas de restauración.

En preproducción, el mismo comando tiene un perfil remoto protegido por configuración: exige `APP_ENV=prod`, `SYNQO_DEPLOYMENT_ENV=preproduction`, `DEMO_RESET_ENABLED=true`, `DEMO_ACCESS_SECRET` y la referencia al host privado de PostgreSQL esperado. La IaC conserva el secreto fuera del repositorio. Los tokens derivados solo se usan para los dos equipos demo; sus hashes son lo único que se guarda en la base. `--force` no omite esas comprobaciones. El reset horario es un servicio Cron independiente con activación manual; no se activa con el proceso HTTP ni con la configuración IaC predeterminada.


## Restaurar el juego demo local

Para cargar «La mesa del jueves» y «La banda del patio» con cuatro participantes por equipo, disponibilidades y consultas de fechas/texto, ejecuta desde la raíz:

```sh
docker compose exec -e SYNQO_DEPLOYMENT_ENV=development api php bin/console app:demo:reset
```

El comando **borra todos los equipos de la base de desarrollo conectada**, junto con sus participantes, disponibilidades, consultas, votos y eventos de correo, y carga el juego demo en una única transacción. Solicita confirmación, con respuesta negativa por defecto. Al terminar muestra los enlaces de los equipos únicamente en salida interactiva; trátalos como credenciales de acceso y evita guardar esa salida en logs. Las disponibilidades abarcan el mes anterior, el actual y los tres siguientes, con un patrón reproducible anclado al lunes UTC de la semana de ejecución. Las cuatro consultas se reparten entre ambos equipos e incluyen fechas futuras, texto y estados abierto, resuelto y rechazado.

Si necesitas una ejecución deliberada sin interacción:

```sh
docker compose exec -T -e SYNQO_DEPLOYMENT_ENV=development api php bin/console app:demo:reset --no-interaction --force
```

`--force` confirma el reemplazo, pero nunca omite las guardas: requiere `APP_ENV=dev`, `SYNQO_DEPLOYMENT_ENV=development`, PostgreSQL y host `database`, `localhost`, `127.0.0.1` o `::1`. Un entorno o conexión distintos fallan sin modificar datos y sin imprimir credenciales. No uses este comando para bases remotas ni producción. La ejecución no registra envíos de correo, no limpia el pool independiente de control de creación y no se programa al iniciar la aplicación. Si otra restauración mantiene el lock, el comando falla inmediatamente; un error de escritura revierte el reemplazo entero.

## Límite de creación por origen

La API usa `SYNQO_DEPLOYMENT_ENV` para escoger el valor predeterminado: desarrollo y preproducción permiten 2 equipos en 60 minutos; producción, 5 en 120 minutos. `TEAM_CREATION_LIMIT` y `TEAM_CREATION_WINDOW_MINUTES` permiten sustituir cada valor independientemente desde `.env`. Déjalas vacías para conservar el perfil. Tras modificar la configuración local, recrea el servicio con `docker compose up -d api`. Los overrides deben ser enteros positivos; una configuración inválida falla al iniciar la política. La purga se puede ejecutar manualmente con `docker compose exec api php bin/console app:creation-limits:purge`; no cambia el reset demo ni borra filas todavía vigentes.
