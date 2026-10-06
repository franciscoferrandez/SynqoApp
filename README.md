# Synqo

Synqo es una aplicación para tomar decisiones en grupo sin que las propuestas y respuestas se pierdan entre mensajes de chat. Cada equipo reúne la disponibilidad diaria de sus participantes en un calendario que ayuda a identificar fechas viables. El grupo puede proponer fechas u opciones de texto en consultas, votar y resolverlas.

El uso básico está pensado para empezar en minutos: crear un equipo, compartir su enlace y participar sin registro. Los votos son visibles para el equipo y una consulta puede terminar aceptando una o varias opciones o rechazándola.

Este proyecto forma parte de un trabajo de fin de máster sobre desarrollo con IA. La inteligencia artificial se utiliza como apoyo para analizar, diseñar, documentar, implementar y verificar. Las decisiones de producto y tecnología las valida la persona impulsora.

> **Estado actual:** la demo local permite crear equipos, compartir el enlace, marcar y consultar disponibilidad, y crear, votar y resolver consultas de texto o fechas con datos persistentes. El arranque completo y el uso adaptable están validados localmente. La accesibilidad de REL-001 se acepta con una excepción documentada basada en un smoke parcial y una revisión manual general; no se declara conformidad WCAG 2.2 AA. La entrega no está publicada.

---

## Índice

- [Objetivo](#objetivo)
- [Primera entrega](#primera-entrega)
- [Funcionamiento previsto](#funcionamiento-previsto)
- [Tecnologías y arquitectura](#tecnologías-y-arquitectura)
- [Documentación de los módulos](#documentación-de-los-módulos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo local](#desarrollo-local)
- [Calidad y reglas de implementación](#calidad-y-reglas-de-implementación)
- [Máster desarrollo IA](#máster-desarrollo-ia)
- [Evolución futura](#evolución-futura)

---

## Objetivo

Facilitar que varias personas encuentren una fecha y tomen decisiones compartidas desde un lugar común. La disponibilidad pertenece al equipo y se actualiza con independencia de las consultas; el calendario sirve para reconocer las fechas prometedoras antes de proponerlas. La [visión de Synqo](pdi_doc/01_producto/01_vision/vision.md) y el [problema de coordinación](pdi_doc/01_producto/02_problema-oportunidad/problema-coordinacion-disponibilidad.md) desarrollan este propósito.

## Primera entrega

La primera entrega será una **demo operativa en un entorno local de desarrollo**. Permitirá crear equipos y participantes, abrir un equipo desde otro navegador mediante un enlace, indicar disponibilidad por día, consultar el calendario y crear, votar y resolver consultas de fechas o de opciones de texto. Los datos deberán persistir. El alcance y su seguimiento están en [REL-001 — Demo local operativa de Synqo](pdi_doc/01_producto/10_entregas/rel-001-demo-local-operativa.md).

El envío opcional del enlace del equipo por correo se prueba en local con Mailpit; la publicación en Internet, la entrega garantizada al buzón y una aplicación móvil instalable quedan para entregas posteriores. La web de esta demo está adaptada para navegadores móviles: hasta 768 CSS px inclusive se usa la presentación móvil y desde 769 px la de escritorio. Los recorridos se verificaron con Chromium y viewports emulados; no se afirma cobertura de hardware móvil nativo. El detalle de delivery está en [REL-001 — Demo local operativa de Synqo](pdi_doc/01_producto/10_entregas/rel-001-demo-local-operativa.md).

## Funcionamiento previsto

1. Una persona crea un equipo indicando el nombre del equipo y el del primer participante.
2. Comparte el enlace; quien entra elige una identidad existente o crea otra.
3. Los participantes marcan su disponibilidad diaria. El calendario resume las marcas del equipo.
4. Una persona crea manualmente una consulta con fechas seleccionadas o con opciones de texto.
5. El equipo vota de forma visible y puede cambiar sus votos mientras la consulta siga abierta.
6. Una persona con acceso resuelve la consulta aceptando una o varias opciones, o la rechaza.

El [alcance conceptual](pdi_doc/01_producto/04_alcance/alcance-conceptual.md) recoge las reglas y límites de estas capacidades. La dirección de la interfaz puede explorarse desde el [índice de mockups](pdi_doc/04_experiencia-usuario/06_mockups/index.html); los mockups son una referencia visual y no una aplicación funcional.

## Tecnologías y arquitectura

| Módulo | Tecnología actual | Responsabilidad y arquitectura |
|---|---|---|
| [WEB](doc/architecture/web.md) | Angular 21, TypeScript y Node.js 24.21 | Navegación, presentación, preferencias locales y cliente HTTP. |
| [API](doc/architecture/api.md) | PHP 8.5, Symfony 7.4 y API Platform 5 | Operaciones HTTP, casos de uso, reglas del dominio y persistencia ORM. |
| Persistencia | PostgreSQL 18 y Doctrine ORM | Guarda equipos, participantes, disponibilidad, consultas, opciones de texto o fecha, votos y resoluciones. |

WEB consume JSON de API y envía el valor de acceso como Bearer desde el fragmento del enlace. API responde con JSON o Problem Details y publica su contrato OpenAPI. La arquitectura separa presentación, casos de uso, dominio y adaptadores; los detalles están en las páginas de [WEB](doc/architecture/web.md) y [API](doc/architecture/api.md), los [principios de implementación](pdi_doc/07_desarrollo/01_principios-y-convenciones/arquitectura-limpia-y-ddd.md) y la [convención HTTP](pdi_doc/06_arquitectura/03_modulos/API/convencion-http.md).

## Documentación de los módulos

- [Arquitectura y componentes de API](doc/architecture/api.md): operaciones HTTP, reglas, persistencia y limpieza de equipos.
- [Arquitectura y componentes de WEB](doc/architecture/web.md): rutas, calendario, consultas y cliente HTTP.
- [Documentación PDI del producto](pdi_doc/README.md): requisitos, experiencia, decisiones y especificaciones.

## Estructura del proyecto

```text
pdi_doc/                    documentación de producto y solución de Synqo
pdi/                    plugin reutilizable de diseño e implementación
doc/                    arquitectura de módulos, workflow de IA y registro del TFM
doc/tfm/                materiales del trabajo de fin de máster
apps/api/               API Symfony y adaptador PostgreSQL
apps/web/               aplicación Angular
README.md
```

Este es el repositorio [SynqoApp](https://github.com/franciscoferrandez/SynqoApp).

## Desarrollo local

### Requisitos

- Docker con Docker Compose.
- Node.js `24.21.0` y npm `11.19.0` para WEB; la versión de Node está fijada en `apps/web/.nvmrc`.
- `nvm` es opcional y facilita instalar la versión indicada.

### Instalación y arranque

Desde la raíz del repositorio, en un clon nuevo:

```bash
nvm install 24.21.0
nvm use 24.21.0
npm ci
npm --prefix apps/web ci
cp .env.example .env
echo "MAIL_EVENT_KEY=$(openssl rand -base64 32)" >> .env
docker compose up -d --build database api mail-worker mailpit
docker compose exec api composer install
docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction
npm --prefix apps/web start
```

WEB abre en <http://localhost:4200>. API queda en <http://localhost:8000>; el proxy Angular reenvía `/api` a esa dirección. Swagger/OpenAPI se sirve en `/api/docs`. La base publica el puerto `5433` del equipo y escucha en `5432` dentro de Docker.

Mailpit recibe el correo de desarrollo (SMTP solo dentro de la red de Compose) y muestra los mensajes en <http://localhost:8025>; el servicio `mail-worker` procesa un único intento por envío pendiente. `MAIL_EVENT_KEY` (base64 de 32 bytes, no versionada) protege la dirección y el enlace mientras esperan; sin ella, crear un equipo con correo falla. Usa solo direcciones de prueba: Mailpit conserva copias visibles para quien acceda al entorno local. `MAIL_EVENT_TTL_SECONDS` (1800 por defecto) fija el plazo global de un envío.

`.env.example` contiene valores locales de ejemplo. Ajusta `POSTGRES_DB`, `POSTGRES_TEST_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `API_PORT`, `APP_ENV`, `APP_SECRET`, `APP_PUBLIC_URL` o `TEAM_DELETION_RETENTION_DAYS` en `.env` si el entorno lo necesita; no uses estos valores locales en despliegues.

### Scripts y comandos de desarrollo

**Raíz del repositorio:** `npm ci` instala Lefthook y ejecuta `npm run prepare`, que instala los hooks Git. `npm run prepare` permite reinstalarlos si hace falta. No hay scripts de build o test definidos en el `package.json` raíz.

**WEB** (`apps/web/package.json`):

| Comando | Uso |
|---|---|
| `npm --prefix apps/web start` | Servidor Angular de desarrollo con proxy para `/api`. |
| `npm --prefix apps/web run build` | Compilación de producción. |
| `npm --prefix apps/web run watch` | Compilación de desarrollo en modo observación. |
| `npm --prefix apps/web test` | Pruebas unitarias y de componentes, sin modo watch. |
| `npm --prefix apps/web run test:e2e` | Recorridos Playwright en Chromium; si falta el navegador, instala con `(cd apps/web && npx playwright install chromium)`. |
| `CI=1 npm --prefix apps/web run test:e2e -- --workers=1` | Suite E2E completa en modo CI con un worker. Requiere API/PostgreSQL y los servicios locales de correo levantados según la sección de instalación. Genera `apps/web/playwright-report/`; GitHub Actions conserva el informe como artefacto incluso si una prueba falla. |
| `CI=1 npm --prefix apps/web run test:e2e -- startup-benchmark.spec.ts --workers=1` | Ejecuta el recorrido completo de arranque con WEB/API/correo reales. Informa duración automatizada, semana evaluada y resultado del recibo; menos de 150 s satisface el criterio automático, sin afirmar que sea tiempo humano ni entrega al buzón. |
| `CI=1 npm --prefix apps/web run test:e2e -- accessibility-smoke.spec.ts mobile-journey.spec.ts --workers=1` | Smoke parcial de accesibilidad y recorridos responsive. Cubre 390, 768, 769 y 1280 CSS px; no acredita conformidad WCAG 2.2 AA. Para cambios futuros, documentar además una ejecución de herramientas automatizadas con herramienta/versión, alcance y resultado; esto satisface el paso automatizado del proyecto, no demuestra conformidad ni reemplaza revisión manual. |
| `npm --prefix apps/web run test:e2e -- screenshot-capability.spec.ts` | Comprueba que Chromium pueda capturar una página como PNG; también se ejecuta en la suite e2e completa. |
| `npm --prefix apps/web run lint` / `lint:fix` | ESLint; el segundo aplica correcciones. |
| `npm --prefix apps/web run format:check` / `format:fix` | Comprobar o aplicar Prettier. |

**API** (`apps/api/composer.json`, ejecutado en el contenedor `api`):

| Comando | Uso |
|---|---|
| `docker compose exec api composer cs:check` / `cs:fix` | Comprobar o aplicar PHP CS Fixer. |
| `docker compose exec api composer stan` | Análisis estático PHPStan. |
| `docker compose exec api composer rector:check` | Comprobar Rector en modo dry-run. |
| `docker compose exec api composer test` | PHPUnit. |
| `docker compose exec api composer db:reset:test` | Borrar y reconstruir `synqo_test`, aplicar migraciones. Ejecuta este comando antes de PHPUnit si la base de prueba está vacía; elimina los datos de esa base. |
| `docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction` | Aplicar migraciones a la base configurada por `DATABASE_URL` (local de desarrollo). |
| `docker compose exec api php bin/console doctrine:schema:validate` | Validar mapeo Doctrine frente al esquema conectado. |
| `docker compose exec api php bin/console debug:router` | Listar rutas Symfony y API Platform. |
| `docker compose exec api php bin/console app:mail:process --once` | Procesar a mano los envíos pendientes y cerrar los vencidos (el servicio `mail-worker` lo hace en continuo). |
| `docker compose exec api php bin/console app:teams:cleanup` | Borrar de la base activa los equipos cuyo plazo de retención tras caducar ha vencido. Ejecutarlo manualmente; no hay programación automática. |

**Docker Compose:** `docker compose ps` lista servicios; `docker compose logs -f api database` sigue sus logs; `docker compose stop` y `start` paran o reanudan los servicios; `docker compose down` los elimina y conserva el volumen de PostgreSQL. `docker compose down -v` elimina también ese volumen y todos los datos locales.

**Git y hooks:** al instalar las dependencias de la raíz (`npm ci`), `npm run prepare` ejecuta `lefthook install` y registra los hooks de Git para este clon. La configuración está en [`lefthook.yml`](lefthook.yml):

- **`pre-commit` en WEB:** si entre los archivos preparados hay alguno bajo `apps/web/`, Lefthook ejecuta `scripts/check-staged-web.mjs` y después, en ese orden, `lint`, `format:check` y `build` de WEB. Si falla un comando, el hook termina con error y Git no crea el commit.
- **`pre-commit` en API:** si hay archivos preparados bajo `apps/api/`, ejecuta `scripts/check-staged-api.mjs` y luego `composer cs:check`, `composer stan` y `composer rector:check` dentro de un contenedor API temporal. Compose lo construye si hace falta y elimina el contenedor al acabar; el servicio no necesita estar levantado, aunque sí Docker.
- **Cambios en ambos módulos:** se ejecutan ambas validaciones. Si el commit no contiene cambios de WEB ni API, esos comandos no se activan.
- **Preparación parcial:** cada `check-staged-*.mjs` compara los archivos staged del módulo con los cambios aún unstaged. Si un mismo archivo tiene cambios preparados y pendientes, rechaza el commit para evitar validar una versión diferente de la que se va a confirmar; prepara el archivo completo o separa los cambios antes de reintentar.
- **`commit-msg`:** valida el mensaje con `scripts/check-commit-message.mjs`; un mensaje que no cumpla Conventional Commits en castellano bloquea el commit.

Los hooks se ejecutan automáticamente al hacer `git commit`; el pre-commit también puede ejecutarse manualmente con `npx lefthook run pre-commit`. Para validar un mensaje manualmente: `node scripts/check-commit-message.mjs <ruta-al-archivo-del-mensaje>`. Para revisar un rango de commits: `node scripts/check-commit-range.mjs <SHA-base-completo>`. Los scripts `check-staged-web.mjs` y `check-staged-api.mjs` son comprobaciones internas para evitar mezclar versiones staged y unstaged de un mismo archivo.

GitHub Actions define el pipeline en [`.github/workflows/web.yml`](.github/workflows/web.yml): instala Node y Chromium, prepara Docker/API/PostgreSQL, migra y prueba API, ejecuta E2E, revisa mensajes de commit y corre los checks WEB. Se activa en `push` a `main` y en Pull Requests.

### Acceso a PostgreSQL desde HeidiSQL

Crea una conexión **PostgreSQL (TCP/IP)** con servidor `127.0.0.1`, puerto `5433`, base `synqo`, usuario `synqo` y contraseña `synqo-local`, si conservas los valores de `.env.example`. Si cambias `POSTGRES_*` o `POSTGRES_PORT`, introduce esos valores. `synqo_test` es exclusiva de pruebas; `db:reset:test` la borra y recrea.

La demo también permite marcar disponibilidad y crear, votar y resolver consultas de texto y fechas. Consulta la [arquitectura WEB](doc/architecture/web.md) y la [arquitectura API](doc/architecture/api.md); el estado de cada capacidad y sus pendientes se sigue en [REL-001 — Demo local operativa de Synqo](pdi_doc/01_producto/10_entregas/rel-001-demo-local-operativa.md).

## Calidad y reglas de implementación

- **Código y arquitectura:** mantener reglas y casos de uso separados de los adaptadores; introducir interfaces cuando protejan una frontera real. Reutilizar en Angular los layouts, temas y componentes que comparten comportamiento. Véanse las [reglas de API](pdi_doc/07_desarrollo/08_modulos/API/README.md) y [WEB](pdi_doc/07_desarrollo/08_modulos/WEB/README.md).
- **Comprobaciones:** PHP CS Fixer, PHPStan y Rector para API; ESLint con `angular-eslint`, Prettier y compilación estricta para la web. El hook previo al commit comprueba cambios WEB y API sin aplicar correcciones automáticas. Los comandos de corrección son explícitos, según los [controles estáticos](pdi_doc/07_desarrollo/03_calidad/controles-estaticos-demo-local.md).
- **Pruebas:** reglas puras, integración con PostgreSQL y recorridos entre contextos de navegador. Los recorridos responsive están comprobados en Chromium; la accesibilidad de REL-001 se aceptó con una excepción documentada y no se declara conformidad WCAG 2.2 AA. El proceso automatizado futuro está definido en la [estrategia de pruebas](pdi_doc/07_desarrollo/02_testing/estrategia-demo-local.md).
- **Cambios:** avanzar por especificaciones preparadas, comprobar cada incremento antes de cerrarlo y usar la [convención de commits](pdi_doc/07_desarrollo/04_git/convencion-commits.md) en todo el repositorio.

## Máster desarrollo IA

El [registro de ayuda de la IA a la toma de decisiones](doc/tfm/registro-decisiones-ia.md) resume hitos verificables en entradas breves: qué problema se abordó, qué aportó la IA y qué decisión se tomó. Su primera entrada describe la creación del plugin PDI y el problema de separación entre framework reutilizable y documentación de producto que resuelve. El [PDF de documentación del TFM](doc/tfm/Documentacion-TFM-2.pdf) se conserva en la misma carpeta.

El método PDI, sus skills y plantillas se encuentran en [pdi/](pdi/README.md). El [índice de trazabilidad](pdi_doc/00_gobierno/11_trazabilidad.md) permite seguir las relaciones directas entre las especificaciones activas o archivadas y los artefactos que las sustentan.

## Evolución futura

Después de la demo local se prevén un piloto publicado con proveedor de correo real y una aplicación móvil instalable. También se ha registrado la necesidad de sustituir un enlace de acceso comprometido. Las posibilidades adicionales, como notas, etiquetas o consultas de respuesta única, permanecen fuera de la primera entrega y no están aprobadas como funciones inmediatas. Véase el [alcance conceptual](pdi_doc/01_producto/04_alcance/alcance-conceptual.md).
