# 08 — Especificaciones de cambio

## Propósito

Aloja artefactos temporales/históricos de Change cuando no se usa un motor externo.

## Contiene

SPEC activas y archivadas.

## No contiene

verdad normativa del producto; esa vive en otras áreas.

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

`pdi:change-new` crea el mínimo artefacto necesario.

## Preguntas que debe realizar el LLM

¿Qué cambio concreto? ¿Qué nivel de riesgo?

## Mandamientos

1. Referenciar baseline, no duplicarlo.
2. Un solo archivo por defecto; separar solo por complejidad.

## Salidas posibles

SPEC

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/cambios/`
