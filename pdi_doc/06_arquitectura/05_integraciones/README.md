# Integraciones

## Propósito

Define contratos y comportamiento frente a sistemas externos.

## Contiene

contratos, timeouts, retries, versionado

## No contiene

reglas funcionales duplicadas

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Modela integración y fallos.

## Preguntas que debe realizar el LLM

¿Qué dependencia externa? ¿Qué pasa si falla?

## Mandamientos

1. Fallos explícitos.

## Salidas posibles

integraciones

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/arquitectura/integracion.md`
