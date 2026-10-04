# 10 — Historial

## Propósito

Conserva transiciones relevantes sin contaminar la vista vigente.

## Contiene

CAM, documentos históricos y migraciones documentales.

## No contiene

artefactos vigentes.

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Se usa al sustituir/obsoletar o registrar cambio transversal.

## Preguntas que debe realizar el LLM

¿Qué necesitamos recordar del pasado?

## Mandamientos

1. Historia no es fuente vigente.

## Salidas posibles

histórico

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/historial/`
