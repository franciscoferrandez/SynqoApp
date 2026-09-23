# Prompt 17 — Modelo De Datos Y Erd

## Objetivo

Diseñar el modelo lógico PostgreSQL/MikroORM a partir del dominio táctico, priorizando integridad, consultas de calendario/resultados y evolución del MVP.

## Lee antes de empezar

- `architecture/adr/ADR-005-persistence.md`
- `technical-design/13-domain/domain-design.md`
- `technical-design/14-state-machines/state-machines.md`
- `technical-design/16-identity-sessions/identity-and-session-design.md`
- `product/07-business-rules.md`

## Tarea

1. Propón tablas/entidades persistentes, claves, FK, nullability, uniques, checks y timestamps.
2. Define representación de Team type/policies, Participants, Accounts, admins, Availability por fecha, Requests, Consultations/Proposals/Surveys, Options, Responses, Votes/availability statuses y Resolution.
3. Compara alternativas de persistencia para Proposal/Survey bajo Consulta y justifica la elegida.
4. Diseña índices para calendario, pendientes, consultas activas, resultados y jobs de lifecycle.
5. Define estrategia de soft delete/inactive vs delete real y campos relevantes para retención.
6. Incluye ERD Mermaid y notas de migración/evolución.

## Entregables mínimos

- `technical-design/17-data-model/data-model.md`
- `technical-design/17-data-model/erd.md`

## Criterios de aceptación

- [ ] Las constraints de DB apoyan invariantes críticas.
- [ ] Las consultas clave tienen índices previstos.
- [ ] No se duplica disponibilidad al responder Requests.



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
