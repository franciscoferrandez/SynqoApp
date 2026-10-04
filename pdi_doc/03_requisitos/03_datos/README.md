# Requisitos de datos

## Propósito

Define significado, integridad y ciclo de vida de información.

## Contiene

RD por área

## No contiene

schema físico salvo decisión posterior

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Define qué debe conservarse y garantías.

## Preguntas que debe realizar el LLM

¿Qué dato? ¿Integridad? ¿Retención?

## Mandamientos

1. Dato conceptual antes que tabla.

## Salidas posibles

RD

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/requisitos/rd.md`
