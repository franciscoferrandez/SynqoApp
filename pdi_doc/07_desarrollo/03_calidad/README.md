# Calidad

## Propósito

Quality gates globales.

## Contiene

lint, static analysis, seguridad

## No contiene

decisiones de producto

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Define checks y umbrales.

## Preguntas que debe realizar el LLM

¿Qué debe pasar antes de merge?

## Mandamientos

1. Automatizar lo repetible.

## Salidas posibles

quality gates

## Convención vigente

Los [controles estáticos de la demo local](controles-estaticos-demo-local.md) fijan las herramientas de API y WEB, el hook previo al commit y la separación entre comprobar y corregir.

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/desarrollo/calidad.md`
