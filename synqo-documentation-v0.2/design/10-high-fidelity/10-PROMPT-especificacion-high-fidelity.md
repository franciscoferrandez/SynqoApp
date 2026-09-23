# Prompt 10 — Especificacion High Fidelity

## Objetivo

Preparar la especificación necesaria para producir mockups high-fidelity de los recorridos críticos, aunque la herramienta final pueda ser Figma u otra externa al repositorio.

## Lee antes de empezar

- `product/16-wireframes/README.md`
- `design/02-visual-direction/visual-direction.md`
- `design/03-design-system/design-tokens.md`
- `design/03-design-system/component-catalog.md`
- `design/04-calendar/calendar-specification.md`
- `design/08-content/content-and-microcopy.md`
- `design/09-accessibility/accessibility-specification.md`

## Tarea

1. Define el set mínimo de pantallas high-fi: landing, selección tipo de equipo, team home, disponibilidad individual, colectiva, request, propuesta, encuesta, resultado/resolución, settings y AI assistant.
2. Para cada pantalla especifica viewport(s), datos de ejemplo, estados a representar y componentes requeridos.
3. Crea criterios de revisión visual y funcional contra RF/HU/flows.
4. Si no existe herramienta de diseño conectada, genera fichas de pantalla suficientemente precisas para reproducirlas en Figma o en un prototipo HTML sin reinterpretar decisiones.

## Entregables mínimos

- `design/10-high-fidelity/high-fidelity-screen-briefs.md`

## Criterios de aceptación

- [ ] Todas las pantallas críticas tienen brief.
- [ ] Cada brief referencia wireframe y requisitos.
- [ ] Incluye móvil y escritorio donde cambie sustancialmente la composición.



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
