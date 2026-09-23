# Prompt 12 — Validacion Usabilidad

## Objetivo

Preparar y documentar una validación de usabilidad ligera pero defendible para el TFM, centrada en los riesgos de comprensión más importantes.

## Lee antes de empezar

- `design/11-prototype/prototype-specification.md`
- `product/03-users-and-scenarios.md`
- `product/04-jobs-to-be-done.md`
- `PRD.md`

## Tarea

1. Define objetivos de investigación y preguntas: comprensión rápido/administrable, disponibilidad vs respuesta de propuesta, resultado vs resolución, uso del calendario y acceso sin cuenta.
2. Define perfiles de participantes de prueba, tareas, guion moderado/no moderado y métricas cualitativas/cuantitativas simples.
3. Crea plantilla para registrar observaciones, errores, tiempo, dudas y comentarios.
4. Define un criterio para transformar hallazgos en cambios de producto/diseño y mantener trazabilidad.

## Entregables mínimos

- `design/12-usability/usability-test-plan.md`
- `design/12-usability/findings-template.md`

## Criterios de aceptación

- [ ] Las tareas corresponden a JTBD reales.
- [ ] No se pide opinión estética como sustituto de usabilidad.
- [ ] Los hallazgos pueden trazarse a documentos afectados.



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
