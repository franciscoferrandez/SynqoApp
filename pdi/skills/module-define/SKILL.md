---
name: module-define
description: Definir un módulo de solución y sus contratos de arquitectura e implementación.
---

# Skill `module-define`

**Invocación mental:** `pdi:module-define`

En OpenCode, las referencias `pdi:<nombre>` se ejecutan como `<nombre>` porque su cargador de skills no aplica el espacio de nombres del plugin.

Antes de actuar, lee `<PDI_ROOT>/AGENTS.md` y `<PDI_ROOT>/skills/00_shared/CONTRACT.md`, donde `<PDI_ROOT>` se obtiene de la ruta real de esta skill.

## Propósito

Crear un módulo de solución real y sus dos contratos: arquitectura e implementación.

## Precondiciones

Existe una decisión de arquitectura que justifica el módulo.

## Contexto obligatorio

- arquitectura general;
- ADR/decisión origen;
- convenciones globales.

## Procedimiento

1. Elegir código estable del módulo.
2. Crear `<DOC>/06_arquitectura/03_modulos/<MODULO>/README.md` usando plantilla.
3. Crear `<DOC>/07_desarrollo/08_modulos/<MODULO>/README.md` usando plantilla.
4. Definir responsabilidades, dependencias, convenciones específicas, testing y comandos.
5. Enlazar ambos lados sin duplicar contenido.

## Prohibido

- crear módulos especulativos;
- copiar arquitectura completa en reglas de desarrollo.

## Gate / salida

`DONE` con módulo disponible para SPEC.

## Siguientes acciones permitidas

`pdi:baseline-check`, `pdi:change-prepare`.
