# Synqo WEB

Aplicación Angular de Synqo. La creación de equipos, el acceso compartido, el calendario de disponibilidad y las consultas utilizan la API local.

## Preparación desde un clon limpio

Requiere Node 24.21.0 y npm 11.19.0. Con `nvm`, desde la raíz del repositorio:

```bash
nvm install 24.21.0
nvm use 24.21.0
npm ci
npm --prefix apps/web ci
```

`npm ci` en la raíz instala y activa los hooks de Lefthook. Si los hooks no se instalaron, ejecuta `npm run prepare` desde la raíz. Para el recorrido completo, arranca API y PostgreSQL como indica el [README principal](../../README.md).

## Arranque y comprobaciones

```bash
npm --prefix apps/web start
npm --prefix apps/web run lint
npm --prefix apps/web run format:check
npm --prefix apps/web run build
npm --prefix apps/web test
npm --prefix apps/web run test:e2e
```

El servidor abre en `http://localhost:4200/` y envía `/api` a `http://localhost:8000/` mediante el proxy local.

La pantalla de creación obtiene de `/api/configuration` el límite de equipos y su ventana vigentes, muestra esa información antes del envío y presenta el aviso genérico si la API responde que se alcanzó el límite. La clave first-party de origen se genera con Web Crypto y se conserva en `localStorage`; si no está disponible, la solicitud continúa sin esa señal y la API evalúa cualquier otra señal confiable.

Para aplicar correcciones explícitas:

```bash
npm --prefix apps/web run lint:fix
npm --prefix apps/web run format:fix
```

Para limpiar dependencias, caché y compilación desde la raíz:

```bash
rm -rf node_modules apps/web/node_modules apps/web/.angular apps/web/dist apps/web/coverage
```

La fuente Inter se sirve localmente desde `public/fonts/` junto con su licencia. El selector de tema recuerda la preferencia en este navegador.
