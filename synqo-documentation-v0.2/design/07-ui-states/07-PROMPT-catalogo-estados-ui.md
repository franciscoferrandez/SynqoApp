# Prompt 07 — Catalogo Estados Ui

## Objetivo

Crear un catálogo exhaustivo de estados de interfaz para evitar que solo se diseñe el happy path.

## Lee antes de empezar

- `product/15-screen-specification.md`
- `product/08-lifecycles.md`
- `product/10-non-functional-requirements.md`
- `design/06-interactions/interaction-patterns.md`

## Tarea

1. Enumera estados transversales: empty, loading, skeleton, stale, offline, retry, permission denied, not found, invalid/revoked link y generic error.
2. Enumera estados de dominio: equipo active/recoverable/expired, managed pending verification, consulta open/closed/resolved/cancelled, deadline reached, no response y participant inactive.
3. Para cada estado define mensaje, acciones disponibles, acciones prohibidas, navegación y si debe preservar contexto.
4. Señala qué estados requieren variantes específicas por móvil/escritorio y cuáles deben tener tratamiento accesible.

## Entregables mínimos

- `design/07-ui-states/ui-state-catalogue.md`

## Criterios de aceptación

- [ ] Cubre todas las lifecycles documentadas.
- [ ] Distingue claramente error técnico de estado de negocio.
- [ ] Incluye link inválido, revocado y expirado como casos distintos.



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
