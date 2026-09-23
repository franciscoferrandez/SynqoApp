# Prompt 27 — Evaluacion Ia

## Objetivo

Diseñar el sistema de evaluación reproducible del intérprete de lenguaje natural y crear el dataset inicial versionado.

## Lee antes de empezar

- `product/18-ai-feature-specification.md`
- `ai/26-technical-design/ai-technical-design.md`
- `ai/26-technical-design/coordination-intent.schema.json`
- `sources-and-notes.md`

## Tarea

1. Define categorías del dataset: fechas explícitas/relativas, weekdays, exclusions, min available, max unavailable, preferences, time, combinaciones, ambiguity, unsupported y prompt injection.
2. Define ground truth y criterios de exact/field match, schema validity, clarification detection y unsupported detection.
3. Crea un dataset inicial pequeño pero representativo en JSONL o YAML, con locale/timezone/currentDate explícitos.
4. Define harness de evaluación conceptual, comparación entre prompt/model versions, coste y latencia.
5. Separa tests deterministas de CI de evaluaciones contra proveedor real.

## Entregables mínimos

- `ai/27-evaluation/ai-evaluation-plan.md`
- `ai/27-evaluation/evaluation-dataset.jsonl`
- `ai/27-evaluation/evaluation-report-template.md`

## Criterios de aceptación

- [ ] Los casos son reproducibles.
- [ ] Hay casos negativos/ambiguos/adversarios, no solo happy path.
- [ ] Las métricas permiten comparar versiones sin juicio manual exclusivo.



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
