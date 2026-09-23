# Prompt 08 — Microcopy Y Contenido

## Objetivo

Definir el lenguaje de interfaz de Synqo para que términos técnicos del dominio no se filtren innecesariamente al usuario y para que la temporalidad, permisos y resolución sean comprensibles.

## Lee antes de empezar

- `product/05-ubiquitous-language.md`
- `product/13-information-architecture.md`
- `product/15-screen-specification.md`
- `product/07-business-rules.md`
- `design/07-ui-states/ui-state-catalogue.md`

## Tarea

1. Crea guía de tono y principios de microcopy: breve, clara, no paternalista, orientada a acción.
2. Decide etiquetas UX finales para Equipo/grupo, Consulta/Decisiones, Propuesta, Encuesta, Resultado, Resolución, Disponible/Quizá/No disponible/Sin respuesta.
3. Redacta textos de onboarding rápido/administrable, temporalidad, verificación, compartir, permisos, errores, resolución, cancelación, expiración y recuperación.
4. Crea mensajes de validación de formularios y estados vacíos.
5. Incluye glosario `dominio → etiqueta UI` cuando difieran.

## Entregables mínimos

- `design/08-content/content-and-microcopy.md`

## Criterios de aceptación

- [ ] No confunde Resultado con Decisión final.
- [ ] La temporalidad del equipo rápido queda clara sin lenguaje alarmista.
- [ ] Las etiquetas son consistentes con el lenguaje ubicuo.



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
