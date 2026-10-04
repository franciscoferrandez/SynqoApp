---
name: init
description: Inicializar la documentación PDI en la carpeta del proyecto elegida por la persona usuaria.
---

# Skill `pdi:init`

**Invocación:** `pdi:init`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

## Propósito

Crear una copia inicial de `<PDI_ROOT>/dist_docs/` en la carpeta documental del proyecto, registrar la ubicación en `<PROYECTO>/.pdi/config.json` y facilitar a los agentes una guía mínima para consultar esa documentación.

## Precondiciones

- Las skills PDI están cargadas por el plugin en Codex o Claude Code, o mediante el adaptador de OpenCode; la raíz PDI contiene `dist_docs/` y `scripts/init.py`.
- El proyecto aún no tiene `.pdi/config.json` ni una carpeta documental en la ruta elegida.

## Contexto obligatorio

- `README.md` y `dist_docs/README.md` de la raíz del plugin PDI;
- instrucciones de la persona usuaria sobre la ubicación documental.

## Procedimiento

1. Preguntar en qué carpeta del proyecto debe instalarse la documentación; ofrecer `pdi_doc` como valor predeterminado. Si la ruta ya fue indicada, usarla sin volver a preguntar.
2. Resolver `<PDI_ROOT>` como dos niveles por encima de la ruta real del archivo de esta skill (`skills/init/SKILL.md`), siguiendo enlaces simbólicos si los hay. Desde la raíz del proyecto, ejecutar `python3 <PDI_ROOT>/scripts/init.py --docs-dir <carpeta>`.
3. Comprobar que existen `<carpeta>/README.md` y `.pdi/config.json` con la ruta elegida. Si no existía `AGENTS.md` en la raíz, comprobar que se creó desde `<PDI_ROOT>/templates/AGENTS.project.md`; si existía, conservarlo e indicar la guía que debe incorporar. Ese archivo orienta sobre la documentación del proyecto, no sobre el uso de PDI.
4. Indicar la siguiente acción `pdi:product-continue`.

Las plantillas permanecen en `<PDI_ROOT>/templates/` para uso interno del framework.

## Prohibido

- Sobrescribir una carpeta documental existente.
- Sobrescribir un `AGENTS.md` existente en el proyecto.
- Copiar las skills del plugin al proyecto.
- Copiar plantillas a la raíz del proyecto.
- Instalar decisiones concretas de otro producto.

## Gate / salida

`DONE` si se creó la estructura y se registró su ubicación; `BLOCKED` si hay un destino ocupado o faltan archivos de distribución.
