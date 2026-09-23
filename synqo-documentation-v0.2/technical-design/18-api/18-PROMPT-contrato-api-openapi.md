# Prompt 18 — Contrato Api Openapi

## Objetivo

Diseñar la API REST pública/interna del frontend y producir un OpenAPI inicial consistente con el dominio, autorización y deep links.

## Lee antes de empezar

- `architecture/adr/ADR-006-api-style.md`
- `technical-design/13-domain/domain-design.md`
- `technical-design/15-authorization/authorization-matrix.md`
- `technical-design/16-identity-sessions/identity-and-session-design.md`
- `technical-design/17-data-model/data-model.md`
- `product/09-functional-requirements.md`

## Tarea

1. Define recursos y endpoints para teams, participants, availability, availability requests, consultations/proposals/surveys, responses, resolutions, account linking, admin verification/recovery y AI interpretation.
2. Define request/response DTOs, errores, códigos HTTP, paginación cuando aplique, idempotency y optimistic concurrency donde sea necesaria.
3. Evita exponer el esquema de DB como API. Usa contratos de producto.
4. Distingue endpoints de lectura/sugerencia IA de mutaciones reales.
5. Genera OpenAPI 3.x válido y un documento de decisiones de diseño API.

## Entregables mínimos

- `technical-design/18-api/api-design.md`
- `technical-design/18-api/openapi.yaml`

## Criterios de aceptación

- [ ] OpenAPI cubre E2E-01/02/03.
- [ ] Errores de autorización, conflicto y validación están definidos.
- [ ] Las operaciones críticas soportan reintentos seguros o documentan por qué no.



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
