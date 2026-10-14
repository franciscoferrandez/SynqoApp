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
npm --prefix apps/web run test:visual
```

El servidor abre en `http://localhost:4200/` y envía `/api` a `http://localhost:8000/` mediante el proxy local.

La pantalla de creación obtiene de `/api/configuration` los límites vigentes y el modo del correo (`hidden`, `demo` o `send`). En `demo` muestra el campo con un aviso y no envía la dirección a la API; en `hidden` oculta el campo, y en `send` utiliza el flujo de correo habitual. El panel de enlaces demo y el temporizador del próximo reset se configuran por separado: un panel visible sin Cron explica que no hay restauración automática. La clave first-party de origen se genera con Web Crypto y se conserva en `localStorage`; si no está disponible, la solicitud continúa sin esa señal y la API evalúa cualquier otra señal confiable.

### Comparación visual

`npm --prefix apps/web run test:visual` compara 96 capturas en Chromium: veinticuatro pantallas/casuísticas en 390×844 y 1280×800, cada una en claro y oscuro. Usa respuestas API fijas y una fecha/zona horaria controladas; no necesita API, correo ni PostgreSQL. El navegador corre dentro de la imagen oficial Playwright `v1.63.0-noble`, igual que en CI. La primera ejecución descarga esa imagen y puede tardar más.

Las referencias están en `e2e/visual-regressions.spec.ts-snapshots/`. Para regenerarlas intencionadamente, ejecuta `npm --prefix apps/web run test:visual:update`. Revisa el diff de todas las imágenes antes de conservarlo; la actualización genera candidatos, no los aprueba. Vuelve a ejecutar `test:visual` en modo normal. Playwright deja el informe y las imágenes `actual`, `expected` y `diff` en `playwright-report/` y `test-results/` cuando hay diferencias. Los argumentos se pueden acotar, por ejemplo `npm --prefix apps/web run test:visual -- --grep "calendario"`.

Lefthook ejecuta la comparación en `pre-push`: el push normal se detiene si no pasa, pero los commits siguen permitidos. CI repite la misma comparación. Para instalar o actualizar los hooks del clon, ejecuta `npm run prepare` desde la raíz. Como todo hook local de Git, `pre-push` puede omitirse deliberadamente con las opciones de bypass de Git; CI conserva el control remoto.

La presentación en desarrollo, preproducción y producción se ajusta con variables independientes y puede simularse localmente contra PostgreSQL local. La misma configuración pública puede incluir enlaces a los dos equipos demo y, solo si `DEMO_RESET_SCHEDULE_ENABLED` está activo, el instante del siguiente reset horario UTC. El cliente no genera ni almacena los tokens demo; la guía de [API](../api/README.md#inicializar-y-restaurar-el-juego-demo-local) recoge los ejemplos.

En desarrollo, la herramienta de recorte de la brandboard se abre directamente en <http://localhost:4200/desarrollo/brandboard>. No tiene enlace en la navegación. Sus coordenadas y destinos de salida se editan en `src/app/dev/brandboard/brandboard-crops.json`; cada salida admite `scale`, `width`, `height` o ambas dimensiones. Si solo se indica ancho o alto, la otra medida se calcula manteniendo la proporción; si se indican las dos, se usan como tamaño máximo y el recorte se centra en un PNG transparente sin deformarlo. El botón escribe los PNG en `public/` usando el pequeño servicio local iniciado por `npm start`. La ruta y el servicio no se incluyen en la aplicación desplegada.

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
