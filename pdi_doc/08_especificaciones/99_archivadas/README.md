# SPEC archivadas

## Propósito

Conserva historia útil de cambios cerrados.

## Contiene

SPEC y evidencia histórica.

## No contiene

verdad vigente.

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

`pdi:change-close` mueve/cierra cuando aplica.

## Preguntas que debe realizar el LLM

¿Aporta trazabilidad/auditoría?

## Mandamientos

1. No cargar por defecto en futuros changes.

## Salidas posibles

histórico de cambios

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/cambios/spec.md`
