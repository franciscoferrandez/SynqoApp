# Sistema de diseño

## Propósito

Define tokens y componentes reutilizables.

## Contiene

tokens, componentes, estados

## No contiene

pantallas específicas

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Deriva de dirección visual y necesidades.

## Preguntas que debe realizar el LLM

¿Qué debe reutilizarse?

## Mandamientos

1. No duplicar tokens locales.

## Salidas posibles

design system

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/ux/sistema-diseno.md`
