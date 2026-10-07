# Despliegue

## Propósito

Proceso y rollback.

## Contiene

deploy/rollback

Para el piloto Railway consulta [Operación manual de Railway para REL-002](railway-rel-002.md).

## No contiene

CI completo duplicado

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Define pasos y verificaciones.

## Preguntas que debe realizar el LLM

¿Cómo sabemos que salió bien?

## Mandamientos

1. Rollback cuando riesgo lo exige.

## Salidas posibles

despliegue

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/operacion/despliegue.md`
