# 01 — Producto

## Propósito

Define el problema, la visión, el alcance y las necesidades que justifican el producto.

## Contiene

- visión, problema, objetivos, alcance, actores, JTBD, HU, journeys, PRD y entregas.

## No contiene

- arquitectura técnica;
- clases, tablas o endpoints;
- estado de implementación de RF individuales.

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

Empieza por problema/visión y avanza hacia alcance, actores y necesidades. Consolida en PRD solo lo que ya haya sido definido.

## Preguntas que debe realizar el LLM

- ¿Qué problema existe?
- ¿Para quién?
- ¿Qué resultado buscamos?
- ¿Qué está dentro y fuera del primer alcance?

## Mandamientos

1. Problema antes que solución.
2. Alcance explícito.
3. No introducir tecnología.
4. No confundir deseo futuro con primera entrega.

## Salidas posibles

- artefactos de producto;
- referencias hacia dominio y requisitos.

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/producto/`
