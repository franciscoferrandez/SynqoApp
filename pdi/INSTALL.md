# Instalar PDI

`pdi/` es la raíz del plugin. La documentación del proyecto se crea después mediante `pdi:init`; las skills y plantillas permanecen en el plugin.

## Codex

Desde la carpeta que contiene `pdi/`:

```bash
codex plugin marketplace add ./pdi
codex plugin add pdi@pdi-local
codex plugin list --json
```

Abre una sesión nueva y ejecuta `pdi:init`. El primer comando registra el catálogo local y el segundo instala el plugin en Codex. El mero hecho de tener la carpeta `pdi/` no lo instala.

## Claude Code

Desde la carpeta que contiene `pdi/`:

```bash
claude plugin marketplace add ./pdi
claude plugin install pdi@pdi-local
claude plugin list
```

Abre una sesión nueva y ejecuta `/pdi:init`. Para probarlo durante una sola sesión, Claude Code admite `claude --plugin-dir ./pdi` sin registrar un marketplace.

## OpenCode

OpenCode descubre `SKILL.md` en rutas de proyecto, pero su sistema de plugins no consume este paquete. Desde la raíz del proyecto, con PDI disponible en una ruta estable:

```bash
python3 <PDI_ROOT>/scripts/expose_opencode.py
```

El adaptador crea enlaces simbólicos en `.opencode/skills/`. En OpenCode las skills conservan sus nombres internos, como `init` y `product-continue`. El proyecto debe ser un repositorio Git para el descubrimiento local. Si cambia la ubicación de PDI, hay que renovar los enlaces.

## Otros agentes

Las skills siguen el formato Agent Skills. Cada agente necesita un método propio para descubrirlas; los manifiestos y comandos anteriores no garantizan instalación en otras herramientas.
