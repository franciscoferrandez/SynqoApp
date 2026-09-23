# ADR-019 — LLM para interpretación de restricciones de coordinación

**Estado:** Accepted — rewritten

## Contexto
El core de Synqo es determinista. Sin embargo, expresar varias restricciones temporales en lenguaje natural puede aportar valor: «busca tres fechas entre el 10 y el 20, mejor viernes, con al menos cinco disponibles».

## Alternativas consideradas
- Sin IA: filtros manuales solamente.
- LLM como intérprete hacia output estructurado.
- LLM calculando/recomendando directamente fechas.
- Agente autónomo con tools.
- RAG/fine-tuning inicial.

## Decisión
Usar un LLM únicamente como **intérprete de lenguaje natural → restricciones estructuradas** detrás del puerto `CoordinationIntentInterpreter`.

El pipeline será:
`texto → LLM → structured output → schema validation → domain validation → CandidateDateService determinista`.

El modelo no contará disponibilidad, no accederá directamente a PostgreSQL, no tendrá tools de mutación y no publicará/resolverá consultas. El usuario revisará la interpretación antes de aplicarla.

El proveedor/modelo concreto permanece diferido y se seleccionará mediante evaluación de calidad, coste y latencia.

## Justificación
La IA se aplica al problema probabilístico (comprensión de lenguaje) y no a reglas reproducibles. El flujo manual permanece disponible ante fallo.

## Consecuencias
Se requieren schema/versionado de prompt, evaluación con dataset etiquetado, telemetría específica y tratamiento de `NEEDS_CLARIFICATION`/`UNSUPPORTED`.
