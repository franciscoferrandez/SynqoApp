# 02 — Dominio

## Propósito

Construye el lenguaje y modelo conceptual compartido.

## Contiene

glosario, conceptos, relaciones, estados, invariantes y eventos conceptuales.

## No contiene

tablas, ORM, endpoints o clases concretas.

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Define vocabulario primero; después conceptos, relaciones, ciclos de vida e invariantes.

## Preguntas que debe realizar el LLM

¿Qué términos son esenciales? ¿Qué significan exactamente? ¿Qué nunca debería ser inválido?

## Mandamientos

1. Dominio ≠ persistencia.
2. Término único para concepto único.
3. Invariantes candidatas deben acabar en RN si son normativas.

## Salidas posibles

modelo de dominio

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/dominio/`
