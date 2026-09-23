# Prompt 25 — Plan De Testing

## Objetivo

Convertir ADR-014 y la trazabilidad funcional en un plan ejecutable de tests por nivel, incluyendo seguridad, accesibilidad, concurrencia y fallos de proveedor.

## Lee antes de empezar

- `architecture/adr/ADR-014-testing.md`
- `product/17-traceability-matrix.md`
- `technical-design/13-domain/domain-invariants.md`
- `technical-design/14-state-machines/state-machines.md`
- `technical-design/18-api/openapi.yaml`
- `security/22-threat-model/threat-model.md`
- `design/09-accessibility/accessibility-checklist.md`

## Tarea

1. Define qué se prueba en unit, domain, repository/integration, API, component/integration UI y Playwright E2E.
2. Mapea invariantes y RF críticos a suites concretas.
3. Especifica E2E-01/02/03 y escenarios de identified links, permisos, deadline, concurrent resolution, retry/idempotency y quick lifecycle.
4. Define estrategia Testcontainers PostgreSQL, fake clock y test data builders/fixtures.
5. Incluye accesibilidad automatizada/manual y tests derivados del threat model.
6. Define quality gates de CI razonables sin obsesionarse con porcentaje de cobertura.

## Entregables mínimos

- `quality/25-test-plan/test-plan.md`
- `quality/25-test-plan/test-traceability.md`

## Criterios de aceptación

- [ ] Los tres E2E del PRD están cubiertos.
- [ ] Cada invariancia crítica tiene test previsto.
- [ ] La estrategia no depende de servicios externos en CI ordinaria.



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
