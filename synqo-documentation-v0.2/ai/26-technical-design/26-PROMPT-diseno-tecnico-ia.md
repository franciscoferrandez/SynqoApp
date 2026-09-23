# Prompt 26 — Diseno Tecnico Ia

## Objetivo

Convertir la especificación funcional del asistente de coordinación en un contrato técnico implementable, manteniendo el LLM como intérprete y no como decisor.

## Lee antes de empezar

- `product/18-ai-feature-specification.md`
- `architecture/adr/ADR-019-ai-integration.md`
- `technical-design/18-api/api-design.md`
- `security/23-privacy-retention/data-retention-and-privacy.md`
- `product/19-open-questions.md`

## Tarea

1. Define schema definitivo de `CoordinationIntent`: status, date range, hard constraints, preferences, candidateCount, proposedTime y clarification.
2. Define catálogo cerrado de restricciones soportadas y su semántica.
3. Especifica puerto `CoordinationIntentInterpreter` y responsabilidades del adapter/provider.
4. Diseña prompt template, contexto permitido, locale/timezone, few-shot examples y versionado de prompt/schema.
5. Define pipeline de structured output → schema validation → domain validation → deterministic candidate service.
6. Define fallos/fallbacks, timeouts, retries, coste/latencia y observabilidad.
7. No añadas tools de mutación, RAG, fine-tuning ni agent loop.

## Entregables mínimos

- `ai/26-technical-design/ai-technical-design.md`
- `ai/26-technical-design/coordination-intent.schema.json`
- `ai/26-technical-design/prompt-specification.md`

## Criterios de aceptación

- [ ] El LLM no recibe disponibilidad nominal.
- [ ] El contrato puede probarse con fake adapter.
- [ ] Toda salida termina validada antes del dominio.



## Reglas generales de trabajo

1. Trabaja **solo sobre documentación y artefactos de diseño** salvo que este prompt pida expresamente un prototipo estático o un fichero de contrato como `openapi.yaml`. No implementes funcionalidades de producción todavía.
2. Considera `PRD.md` y la carpeta `product/` como fuente de verdad funcional. Considera `architecture/` como fuente de verdad para las decisiones arquitectónicas ya adoptadas.
3. No inventes requisitos para rellenar huecos. Si una decisión sigue abierta, conserva o amplía un `OPEN-*`, explica el impacto y deja alternativas concretas. Si necesitas cerrar una decisión para avanzar, documenta la propuesta y su justificación antes de utilizarla.
4. Mantén la terminología del lenguaje ubicuo: `Equipo`, `Participante`, `Cuenta`, `Disponibilidad`, `Solicitud de disponibilidad`, `Consulta`, `Propuesta`, `Encuesta`, `Resultado`, `Resolución`, etc.
5. No confundas decisiones de producto con ADR. Una regla funcional va en `product/`; una decisión tecnológica o estructural significativa puede requerir ADR.
6. Reutiliza los IDs existentes (`OBJ-*`, `RF-*`, `RNF-*`, `RES-*`, `HU-*`, `OPEN-*`, `ADR-*`) y no los renumeres sin necesidad. Si introduces IDs nuevos, evita colisiones y actualiza trazabilidad.
7. Cuando el trabajo modifique una decisión ya documentada, actualiza también los documentos afectados en lugar de dejar contradicciones. Como mínimo revisa `PRD.md`, `product/17-traceability-matrix.md`, `traceability/product-architecture-map.md`, `architecture/decision-register.md` y `product/product-decision-register.md` cuando corresponda.
8. Mantén el MVP acotado. No introduzcas recurrencia automática, franjas horarias de disponibilidad general, chat, reservas, voto anónimo fuerte, subgrupos arbitrarios, RAG, agentes autónomos ni otras capacidades fuera de alcance salvo como backlog explícito.
9. Favorece KISS/YAGNI: especifica lo necesario para construir y validar Synqo, sin crear frameworks internos, abstracciones o procesos que no estén justificados por el producto.
10. Al terminar, deja el documento en estado utilizable por otra persona: objetivo, decisiones, reglas, ejemplos, casos límite, cuestiones abiertas y referencias cruzadas.

## Formato de cierre esperado

Al terminar la tarea, responde con un resumen que incluya: archivos creados/modificados, decisiones tomadas, decisiones que siguen abiertas, inconsistencias detectadas y cuál es el siguiente prompt numerado recomendado.
