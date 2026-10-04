# Scripts

Scripts auxiliares sin dependencias externas.

## Validación

```bash
python3 <PDI_ROOT>/scripts/validate_structure.py
```

Comprueba:

- estructura estática y README obligatorios;
- archivos vacíos;
- skills sin secciones mínimas;
- archivos `Zone.Identifier` generados durante la extracción de descargas de Windows;
- formato e IDs duplicados en Markdown del proyecto; las plantillas están en `<PDI_ROOT>/templates/`;
- códigos de área registrados en el catálogo y coherencia entre ID, nombre de archivo y carpeta de requisitos;
- referencias `ID — denominación` enlazadas al artefacto correcto, con la denominación canónica;
- existencia de `<PDI_ROOT>/AGENTS.md` y playbooks.

Para revisar solo los enlaces, ejecuta `python3 <PDI_ROOT>/scripts/artifact_links.py`. La opción `--fix` añade enlaces relativos cuando el ID y la denominación ya coinciden; revisa las incidencias restantes manualmente.

No determina si un área agrupa responsabilidades demasiado distintas; esa revisión semántica corresponde a `pdi:baseline-check`.

## Índice de artefactos

```bash
python3 <PDI_ROOT>/scripts/artifact_index.py
python3 <PDI_ROOT>/scripts/artifact_index.py --id REL-001
python3 <PDI_ROOT>/scripts/artifact_index.py --kind SPEC --status ready --summary
python3 <PDI_ROOT>/scripts/artifact_index.py --summary
```

Genera JSON en la salida estándar, o una lista legible con `--summary`, desde la carpeta documental de `.pdi/config.json` (`pdi_doc/` por defecto). Admite filtros `--id`, `--kind`, `--area` y `--status`, además de `--docs-dir` para consultar otra carpeta. No guarda una caché ni modifica Markdown. Incluye ID, título, ruta, tipo, área, estado explícito del encabezado, release declarada, enlaces directos entre artefactos y enlaces inversos. En una REL, `delivery_items` recoge únicamente las filas de su tabla «Alcance»: estado, SPEC enlazadas y dependencias enlazadas. Un enlace indica referencia documental, no prueba por sí mismo una dependencia funcional ni implementación. Los campos ausentes permanecen vacíos; para readiness, conflictos y evidencia sigue siendo necesario leer los documentos originales.

## OpenCode

Desde el proyecto, `python3 <PDI_ROOT>/scripts/expose_opencode.py` crea enlaces simbólicos a las skills del plugin en `.opencode/skills/`. Si no hay repositorio Git, OpenCode puede no descubrir las skills locales hasta inicializar uno.

## Extracción de descargas de Windows

Los archivos `*:Zone.Identifier` pueden aparecer al extraer un ZIP descargado en Windows. Para evitar que vuelvan a aparecer al extraer una copia confiable, revisa primero el origen del ZIP y desbloquéalo en PowerShell antes de extraerlo:

```powershell
Unblock-File -LiteralPath "C:\ruta\al\pdi.zip"
```

El patrón de `.gitignore` de la raíz del proyecto evita incorporar estos archivos al repositorio; el validador avisa si reaparecen en el árbol de trabajo. Ninguna de esas medidas impide que Windows vuelva a crearlos durante otra extracción de un ZIP marcado.
