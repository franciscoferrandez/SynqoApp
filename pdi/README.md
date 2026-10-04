# PDI — Product Design and Implementation

PDI reúne las reglas, playbooks, plantillas y skills para definir el Product Baseline, preparar entregas y materializar cambios. Esta carpeta describe el framework; la documentación normativa del producto vive en la carpeta indicada por `.pdi/config.json`, o en `pdi_doc/` por defecto (como en este proyecto).

## Estructura

```text
pdi/                  plugin y framework
pdi/skills/           skills compartidas por los agentes compatibles
pdi/dist_docs/        estructura documental inicial
pdi/templates/        plantillas internas
pdi/playbooks/        reglas del proceso
pdi/scripts/          inicialización y validación
```

## Inicialización de un proyecto

Sigue primero [Instalar PDI](INSTALL.md) para cargar el plugin en tu agente.

Instala o carga el plugin PDI en tu agente y ejecuta `pdi:init` (en Claude Code, `/pdi:init`). La skill pregunta la carpeta documental, con `pdi_doc` por defecto, y copia `dist_docs/` al proyecto. La configuración queda en `<PROYECTO>/.pdi/config.json`. También crea un `AGENTS.md` mínimo para orientar sobre la documentación si no existe uno; si existe, lo conserva e indica qué guía incorporar. Las skills, plantillas, playbooks y scripts permanecen dentro del plugin.

El paquete incluye `plugin.json` para Codex y `.claude-plugin/plugin.json` para Claude Code. Cada plataforma requiere su propio mecanismo de instalación o carga; `init` no copia skills al proyecto.

### OpenCode

OpenCode descubre skills en `.opencode/skills/`, pero su sistema de plugins no instala este paquete de skills. Para usar la misma fuente PDI, ejecuta desde el proyecto `python3 <PDI_ROOT>/scripts/expose_opencode.py`. Crea enlaces simbólicos a las skills del plugin sin duplicar sus archivos; OpenCode las muestra con sus nombres internos (`init`, `product-continue`, etc.). Se detiene ante nombres ocupados. Si se actualiza el plugin y cambia su ubicación, vuelve a crear los enlaces con el script tras retirar los anteriores.

Este repositorio conserva `pdi_doc/` como documentación activa de Synqo. Las skills se cargan desde la instalación del plugin; `.agents/skills/` no contiene copias locales de PDI.

## Compatibilidad

| Agente | Carga de skills | Invocación de init |
|---|---|---|
| Codex | Plugin PDI (`plugin.json`) | `pdi:init` |
| Claude Code | Plugin PDI (`.claude-plugin/plugin.json`) | `/pdi:init` |
| OpenCode | Enlaces creados por `expose_opencode.py` | Skill `init` |
| Otros | Si admiten Agent Skills, adaptar la instalación a su mecanismo de descubrimiento | Depende del agente |

El formato de las skills es común, pero el formato de plugin y su espacio de nombres no son universales. OpenCode requiere un repositorio Git para descubrir las skills locales del proyecto mediante el adaptador.

## Uso

```text
pdi:product-continue → pdi:baseline-status → pdi:baseline-check
pdi:baseline-update
pdi:product-release → pdi:product-status → pdi:product-next
pdi:change-new → pdi:change-prepare → pdi:change-apply
→ pdi:change-verify → pdi:change-converge → pdi:change-close
```

Lee `AGENTS.md` dentro del plugin PDI y después el `README.md` de la carpeta documental configurada. `pdi:baseline-update` es la puerta para modificar verdad normativa. Para validar la instalación usa `python3 <PDI_ROOT>/scripts/validate_structure.py` desde el proyecto.
