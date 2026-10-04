# Synqo WEB

Vista previa visual de [SPEC-COO-001 — Base visual y navegación de Synqo](../pdi_doc/08_especificaciones/99_archivadas/spec-coo-001-base-visual-y-navegacion.md). No crea equipos ni ofrece enlaces de acceso reales.

## Preparación desde un clon limpio

Requiere Node 24.21.0 y npm 11.19.0. Con `nvm`, desde la raíz del repositorio:

```bash
nvm install 24.21.0
nvm use 24.21.0
npm ci
npm --prefix web ci
```

`npm ci` en la raíz instala y activa los hooks de Lefthook. Si los hooks no se instalaron, ejecuta `npm run prepare` desde la raíz.

## Arranque y comprobaciones

```bash
npm --prefix web start
npm --prefix web run lint
npm --prefix web run format:check
npm --prefix web run build
npm --prefix web test
```

El servidor abre en `http://localhost:4200/`. Las rutas directas de la vista previa son `/`, `/_preview/confirmacion`, `/_preview/equipo/calendario`, `/_preview/equipo/consultas`, `/_preview/caducado` y `/_preview/no-encontrado`.

Para aplicar correcciones explícitas:

```bash
npm --prefix web run lint:fix
npm --prefix web run format:fix
```

Para limpiar dependencias, caché y compilación desde la raíz:

```bash
rm -rf node_modules web/node_modules web/.angular web/dist web/coverage
```

La fuente Inter se sirve localmente desde `public/fonts/` junto con su licencia. El selector recuerda el tema en este navegador; el formulario descarta sus valores y la confirmación usa datos fijos.
