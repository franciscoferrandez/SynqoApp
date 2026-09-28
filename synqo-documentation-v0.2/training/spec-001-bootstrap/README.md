# SPEC-001 — Bootstrap del repositorio y toolchain

> Fuente normativa: [SPEC-001](../../specs/SPEC-001-bootstrap-repository-toolchain.md). Esta guía usa su resultado integrado para explicar cómo se prepara un monolito modular antes de añadir producto.

## Qué aprende la persona

- Organizar un monorepo pnpm con web React/Vite y API NestJS.
- Ejecutar PostgreSQL, migraciones y pruebas desde comandos reproducibles.
- Distinguir pruebas unitarias, integración con Testcontainers y E2E con Playwright.

## Antes de empezar

El repositorio fija Node 24 y pnpm 12 en [package.json](../../../package.json) y `.nvmrc`.

```bash
nvm use
pnpm install --frozen-lockfile
pnpm db:up
pnpm db:migrate
pnpm dev:api
pnpm dev:web
```

La configuración de ejemplo de API está en [apps/api/.env.example](../../../apps/api/.env.example). Se copia a un archivo local no versionado; nunca se enseña ni sube una credencial real.

## Tecnologías y cómo encajan

| Tecnología o componente | Para qué se usa aquí | Idea clave para clase |
|---|---|---|
| Node.js + TypeScript | Runtime y lenguaje compartido por web y API. | TypeScript detecta incoherencias antes de ejecutar; Node ejecuta el servidor y las herramientas. |
| pnpm workspaces | Gestiona dependencias y scripts del monorepo. | Un único lockfile da instalaciones reproducibles sin perder paquetes independientes. |
| React + Vite | Interfaz web y servidor de desarrollo/build. | React compone pantallas a partir de estado; Vite ofrece iteración rápida y build de producción. |
| NestJS | Estructura modular de la API. | Controllers reciben HTTP; services concentran lógica; módulos conectan dependencias. |
| PostgreSQL | Persistencia relacional. | Las constraints y transacciones protegen invariantes que no deben depender solo de la interfaz. |
| MikroORM + migraciones | Evolución reproducible del esquema. | La migración describe cómo pasa una base existente a una versión nueva. |
| REST + OpenAPI | Contrato entre web y API. | El contrato evita que cada cliente invente rutas, cuerpos y errores. |
| Docker Compose | PostgreSQL local equivalente al servicio usado en desarrollo. | Reduce diferencias entre equipos sin instalar la base directamente en el sistema. |
| Vitest, Testing Library, Testcontainers y Playwright | Pirámide de pruebas. | Cada herramienta cubre un riesgo distinto; ninguna reemplaza por completo a las demás. |
| GitHub Actions | Ejecución de controles en cada PR. | CI detecta dependencias ocultas y evita depender de la máquina de quien desarrolla. |

## Mapa de artefactos

| Artefacto | Papel en la clase |
|---|---|
| [pnpm-workspace.yaml](../../../pnpm-workspace.yaml) | Declara los paquetes del workspace. |
| [apps/web](../../../apps/web) | Cliente React, Vite, Vitest y Playwright. |
| [apps/api](../../../apps/api) | API NestJS, MikroORM y Vitest. |
| [compose.yaml](../../../compose.yaml) | PostgreSQL de desarrollo. |
| [.github/workflows/ci.yml](../../../.github/workflows/ci.yml) | Calidad y smoke de navegador en CI. |

## Recorrido guiado

El script raíz `pnpm ci` agrupa formato, lint, tipos, pruebas, OpenAPI y build. La intención es que el PR ejecute la misma clase de verificaciones que el equipo puede ejecutar localmente.

La API se inicializa en [main.ts](../../../apps/api/src/main.ts): configura Helmet, CORS, logging, validation pipe y cierre ordenado. No es todavía lógica de negocio; es la infraestructura mínima para que las slices posteriores tengan un entorno verificable.

El test de integración de salud [health.integration-spec.ts](../../../apps/api/test/health.integration-spec.ts) levanta PostgreSQL real con Testcontainers. Es una buena ocasión para explicar por qué una base embebida o mocks no validan una conexión real.

## Verificación

```bash
pnpm ci
pnpm test:e2e
pnpm db:migrate
```

`ci.yml` prepara también la API y PostgreSQL para Playwright: un E2E que depende de una API no debe pasar solo porque una máquina local ya tenía un proceso levantado.

## Límites y siguiente paso

SPEC-001 no crea funcionalidad de coordinación. La primera funcionalidad aparece en [SPEC-002](../spec-002-quick-team/README.md).

## Ejercicios

<details>
<summary>1. Localiza qué comando se ejecuta en CI antes del build y qué riesgo reduce.</summary>

Guía: en [package.json](../../../package.json), `pnpm ci` ejecuta formato, lint, tipos, tests, integración, OpenAPI y después build. El build al final confirma que el artefacto se puede compilar, pero los pasos previos dan errores más rápidos y específicos.
</details>

<details>
<summary>2. Cambia temporalmente el puerto de PostgreSQL en tu configuración local y explica qué archivos deben conocerlo.</summary>

Guía: el puerto publicado se declara en [compose.yaml](../../../compose.yaml); la API se conecta mediante `DATABASE_URL` en su archivo local de entorno, basado en [.env.example](../../../apps/api/.env.example). No se debe modificar el valor por defecto compartido solo para una preferencia local.
</details>

<details>
<summary>3. Compara un test unitario de la web con un test de integración API y un E2E.</summary>

Guía: un unitario aísla un componente o función y da feedback rápido. La integración levanta dependencias reales —en este caso PostgreSQL con Testcontainers— para comprobar API y persistencia. El E2E automatiza el navegador y verifica el recorrido visible; es más lento y no reemplaza los dos anteriores.
</details>
