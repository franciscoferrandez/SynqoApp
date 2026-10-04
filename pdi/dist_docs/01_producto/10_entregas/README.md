# Entregas / Releases

## Propósito

Define conjuntos de capacidades objetivo y sigue su delivery.

## Contiene

REL, alcance de entrega, dependencias y estados de delivery

## No contiene

definición normativa de RF/RN

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Selecciona elementos ya definidos o explícitamente previstos y asigna estados de delivery.

## Preguntas que debe realizar el LLM

¿Qué mínimo debe estar entregado? ¿Qué dependencias existen?

## Mandamientos

1. REL no redefine RF.
2. Delivery no altera estado documental.

## Salidas posibles

REL y catálogo de pendientes

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/producto/release.md`
