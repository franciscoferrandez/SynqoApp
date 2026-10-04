# Módulos de solución

## Propósito

Define dinámicamente unidades como BACKEND, FRONTEND, MOBILE, BACKOFFICE u otras.

## Contiene

subcarpetas de módulos reales

## No contiene

módulos especulativos

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Cuando se decide un módulo, crea su carpeta y contrato.

## Preguntas que debe realizar el LLM

¿Qué responsabilidad y límites tiene?

## Mandamientos

1. No crear módulo sin necesidad.
2. Cada módulo tiene arquitectura + reglas de implementación.

## Salidas posibles

módulos

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/arquitectura/modulo.md`
