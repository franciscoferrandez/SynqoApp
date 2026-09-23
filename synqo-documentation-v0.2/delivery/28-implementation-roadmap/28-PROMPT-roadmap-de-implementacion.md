# Prompt 28 — Roadmap De Implementacion

## Objetivo

Convertir toda la documentación cerrada en un plan incremental de implementación para Codex/terminal, priorizando vertical slices verificables y evitando construir infraestructura sin valor visible.

## Lee antes de empezar

- `README.md`
- `PRD.md`
- `product/17-traceability-matrix.md`
- `architecture/README.md`
- `technical-design/13-domain/domain-design.md`
- `technical-design/18-api/api-design.md`
- `quality/25-test-plan/test-plan.md`

## Tarea

1. Define prerequisitos documentales mínimos antes de iniciar código y señala cualquier bloqueador restante.
2. Divide implementación en vertical slices: bootstrap/repo, quick team + participant access, availability, requests/coincidences/calendar, proposal, survey, managed/admin, account linking, lifecycle/jobs, notifications, AI.
3. Para cada slice lista RF/HU, endpoints, UI, dominio, DB, tests y criterio de demo terminado.
4. Define orden de migraciones y estrategia de feature flags solo si realmente necesaria.
5. Incluye Definition of Done y Definition of Ready ligeras.
6. Crea un backlog técnico inicial sin estimaciones ficticias.

## Entregables mínimos

- `delivery/28-implementation-roadmap/implementation-roadmap.md`
- `delivery/28-implementation-roadmap/vertical-slices.md`

## Criterios de aceptación

- [ ] Cada slice produce valor demostrable end-to-end.
- [ ] El plan referencia requisitos existentes.
- [ ] No hay big-bang de backend antes de UI o viceversa.



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
