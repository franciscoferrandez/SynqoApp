# Prompt 23 — Privacidad Y Retencion

## Objetivo

Definir minimización, conservación y eliminación/anominización de datos, especialmente para equipos rápidos y datos enviados a proveedores externos.

## Lee antes de empezar

- `PRD.md`
- `product/19-open-questions.md`
- `architecture/adr/ADR-015-security.md`
- `technical-design/17-data-model/data-model.md`
- `technical-design/20-jobs-events/jobs-and-events.md`
- `product/18-ai-feature-specification.md`

## Tarea

1. Inventaría categorías de datos: cuentas, participant names, admin emails, availability, votes, history, tokens, logs, telemetry y prompts IA.
2. Define propósito, base funcional, retención, eliminación/anominización y acceso para cada categoría a nivel de diseño.
3. Cierra política post-expiry de equipos rápidos y cómo se ejecuta técnicamente.
4. Define qué datos pueden enviarse a Resend/IdP/LLM y aplica minimización.
5. Documenta consideraciones GDPR relevantes sin convertir el documento en asesoría jurídica.

## Entregables mínimos

- `security/23-privacy-retention/data-retention-and-privacy.md`

## Criterios de aceptación

- [ ] OPEN-07 queda cerrado o con criterio de cierre.
- [ ] La política es implementable con el modelo de datos/jobs.
- [ ] La IA no recibe disponibilidad nominal salvo decisión futura explícita.



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
