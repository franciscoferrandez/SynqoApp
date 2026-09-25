# Synqo

Monorepo de Synqo con una aplicación web React/Vite y una API NestJS. La Slice 0 solo
proporciona el toolchain, el app shell y un healthcheck técnico; todavía no contiene
funcionalidades de producto.

## Requisitos

- Node.js `24.21.0` LTS (ver `.nvmrc`).
- pnpm `12.6.0`, activado con Corepack.
- Docker Compose para PostgreSQL local.

```bash
nvm use
corepack enable
pnpm install
```

## Inicio diario

Desde un checkout ya instalado, abre una terminal en la raíz y ejecuta:

```bash
source /home/fran/.nvm/nvm.sh
nvm use
pnpm db:up
```

Cuando Docker indique que PostgreSQL está saludable, arranca cada aplicación en su
propia terminal, cargando antes el mismo runtime:

```bash
source /home/fran/.nvm/nvm.sh
nvm use
pnpm dev:api
```

```bash
source /home/fran/.nvm/nvm.sh
nvm use
pnpm dev:web
```

La API escucha en `http://localhost:3000`; `GET /health` solo informa éxito cuando
PostgreSQL está disponible. La web se sirve por defecto en `http://localhost:5173`.

Al terminar la sesión, detén las aplicaciones con `Ctrl+C` y baja solamente la
infraestructura local con:

```bash
pnpm db:down
```

## Calidad

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm openapi:check
pnpm build
```

`pnpm run ci` ejecuta los checks reproducibles sin navegador. Antes de ejecutar el smoke
E2E local, instala Chromium con `pnpm --filter @synqo/web exec playwright install chromium`.

## Variables de entorno

La configuración de ejemplo de la API está en
[`apps/api/.env.example`](apps/api/.env.example). No se deben versionar archivos `.env`
con credenciales reales.
