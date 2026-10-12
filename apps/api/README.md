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

En preproducción, el mismo comando tiene un perfil remoto protegido por configuración: exige `APP_ENV=prod`, `SYNQO_DEPLOYMENT_ENV=preproduction`, `DEMO_RESET_ENABLED=true`, `DEMO_ACCESS_SECRET`, `DEMO_TEAM_IDS` explícita y la referencia al host privado de PostgreSQL esperado. La IaC conserva el secreto fuera del repositorio. Los tokens derivados solo se usan para los dos equipos demo; sus hashes son lo único que se guarda en la base. `--force` no omite esas comprobaciones. El reset horario es un servicio Cron independiente con activación manual; no se activa con el proceso HTTP ni con la configuración IaC predeterminada.


## Restaurar únicamente los demo de preproducción

`DEMO_TEAM_IDS` debe estar definida en el proceso que ejecuta el reset. Una cadena vacía termina correctamente sin borrar ni cargar datos. Una lista no vacía contiene exactamente los dos UUID distintos de los demo, separados por coma. Se validan sus verificadores contra `DEMO_ACCESS_SECRET`; nombres iguales no identifican equipos demo. Una lista parcial, inválida o con un equipo real falla sin cambios. La IaC preserva la variable del HTTP y la referencia desde el Cron; el HTTP puede servir peticiones aunque falte esta variable.

En preproducción se conservan las raíces demo, sus UUID y fecha de creación. Se eliminan y recargan sus datos dependientes en una transacción. Cada reset incrementa `demo_access_generation` y reemplaza el verificador activo: los enlaces anteriores caducan y `/api/configuration` publica los nuevos. No se guarda historial. Los equipos de usuarios y el pool de creación persisten y siguen sujetos a caducidad/retención normales; los UUID de participantes demo pueden cambiar.

Para una **primera carga manual**, definir `DEMO_TEAM_IDS` como cadena vacía y ejecutar `app:demo:reset --initialize --force --no-interaction` con las guardas del perfil. Por defecto exige que no haya equipos; si deben conservarse equipos existentes, añadir `--allow-non-empty`. La salida muestra una línea `DEMO_TEAM_IDS=<uuid-1>,<uuid-2>` sin tokens para copiar en HTTP y Cron. El Cron nunca usa `--initialize`. En preproducción, cada reset conserva UUID, incrementa `demo_access_generation` y sustituye el verificador; los enlaces anteriores dejan de funcionar y `/api/configuration` publica los nuevos. Solo se almacena la versión actual, no un historial. La [operación de Railway](../../pdi_doc/09_operacion/01_despliegue/railway-rel-002.md#reset-selectivo-de-demo--rel-003) detalla la transición y el despliegue de ambos servicios.

Si hay una discrepancia se informa de la fase o cantidades esperadas/observadas y se devuelve error; se revierte cualquier limpieza parcial. `--force` no omite estas comprobaciones. No se cambia ni se rota el secreto durante esta transición: una rotación exige una intervención dirigida sobre los dos UUID y verificadores anteriores, separada del reset normal.

## Restaurar el juego demo local

Para cargar «La mesa del jueves» y «La banda del patio» con cuatro participantes por equipo, disponibilidades y consultas de fechas/texto, ejecuta desde la raíz:

```sh
docker compose exec -e SYNQO_DEPLOYMENT_ENV=development api php bin/console app:demo:reset
```

El comando **borra todos los equipos de la base de desarrollo conectada**, junto con sus participantes, disponibilidades, consultas, votos y eventos de correo, y carga el juego demo en una única transacción. Solicita confirmación, con respuesta negativa por defecto. Al terminar imprime siempre `DEMO_TEAM_IDS=<uuid-1>,<uuid-2>`; los enlaces con tokens aparecen únicamente en salida interactiva. Trata esos enlaces como credenciales y evita guardar esa salida en logs. Las disponibilidades abarcan el mes anterior, el actual y los tres siguientes, con un patrón reproducible anclado al lunes UTC de la semana de ejecución. Las cuatro consultas se reparten entre ambos equipos e incluyen fechas futuras, texto y estados abierto, resuelto y rechazado.

Si necesitas una ejecución deliberada sin interacción:

```sh
docker compose exec -T -e SYNQO_DEPLOYMENT_ENV=development api php bin/console app:demo:reset --no-interaction --force
```

`--force` confirma el reemplazo, pero nunca omite las guardas: requiere `APP_ENV=dev`, `SYNQO_DEPLOYMENT_ENV=development`, PostgreSQL y host `database`, `localhost`, `127.0.0.1` o `::1`. Un entorno o conexión distintos fallan sin modificar datos y sin imprimir credenciales. No uses este comando para bases remotas ni producción. La ejecución no registra envíos de correo, no limpia el pool independiente de control de creación y no se programa al iniciar la aplicación. Si otra restauración mantiene el lock, el comando falla inmediatamente; un error de escritura revierte el reemplazo entero.

## Límite de creación por origen

La API usa `SYNQO_DEPLOYMENT_ENV` para escoger el valor predeterminado: desarrollo y preproducción permiten 2 equipos en 60 minutos; producción, 5 en 120 minutos. `TEAM_CREATION_LIMIT` y `TEAM_CREATION_WINDOW_MINUTES` permiten sustituir cada valor independientemente desde `.env`. Déjalas vacías para conservar el perfil. Tras modificar la configuración local, recrea el servicio con `docker compose up -d api`. Los overrides deben ser enteros positivos; una configuración inválida falla al iniciar la política. La purga se puede ejecutar manualmente con `docker compose exec api php bin/console app:creation-limits:purge`; no cambia el reset demo ni borra filas todavía vigentes.
