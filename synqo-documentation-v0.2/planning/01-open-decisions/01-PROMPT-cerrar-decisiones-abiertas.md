# Prompt 01 — Cerrar Decisiones Abiertas

## Objetivo

Cerrar, o dejar con plan de cierre verificable, las decisiones OPEN-01…OPEN-09 antes de que contaminen el diseño UI/técnico. El resultado debe convertir las decisiones suficientemente maduras en reglas/requisitos explícitos y mantener únicamente las que realmente requieran evidencia posterior.

## Lee antes de empezar

- `PRD.md`
- `product/19-open-questions.md`
- `product/07-business-rules.md`
- `product/08-lifecycles.md`
- `product/09-functional-requirements.md`
- `product/10-non-functional-requirements.md`
- `product/11-constraints.md`
- `product/product-decision-register.md`
- `architecture/adr-reconciliation.md`

## Tarea

1. Revisa OPEN-01…OPEN-09 uno por uno y clasifica cada uno como: cerrar ahora, cerrar con valor provisional de MVP, o mantener abierto por requerir evidencia/implementación.
2. Para los que puedan cerrarse, documenta una propuesta concreta y consistente con baja fricción, equipos rápidos temporales y equipos administrables persistentes. No uses valores arbitrarios sin justificar el trade-off.
3. Presta especial atención a permisos en equipos rápidos, número de administradores, defaults de permisos, tratamiento de `Quizá`, expiración/retención, notificaciones y zona horaria.
4. Actualiza reglas, requisitos, historias y PRD donde una decisión pase a estar cerrada. Si una decisión afecta arquitectura, señala si requiere revisar un ADR existente o crear uno nuevo; no lo crees si no hay decisión arquitectónica real.
5. Genera una tabla final de decisiones con: estado, decisión, razón, documentos impactados y riesgo residual.

## Entregables mínimos

- `planning/01-open-decisions/open-decisions-resolution.md`
- `product/19-open-questions.md (actualizado)`
- `PRD.md (si procede)`
- `product/product-decision-register.md (si procede)`

## Criterios de aceptación

- [ ] Cada OPEN tiene estado explícito y justificado.
- [ ] No se han introducido contradicciones con RF/HU/ADRs.
- [ ] Las decisiones cerradas están propagadas a la documentación afectada.
- [ ] Las decisiones que siguen abiertas tienen criterio concreto de cierre.



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
