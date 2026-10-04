# 03 — Requisitos

## Propósito

Formaliza comportamiento, reglas, datos, calidad y restricciones verificables.

## Contiene

RF, RN, RD, RNF, RES y atributos de calidad.

## No contiene

soluciones técnicas salvo que sean una restricción real.

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Deriva desde producto/dominio, clasifica y valida cada elemento.

## Preguntas que debe realizar el LLM

¿Es comportamiento, regla, dato, calidad o restricción?

## Mandamientos

1. No mezclar tipos.
2. Verificable.
3. Casos límite explícitos.

## Salidas posibles

requisitos con ID por área

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/requisitos/`
