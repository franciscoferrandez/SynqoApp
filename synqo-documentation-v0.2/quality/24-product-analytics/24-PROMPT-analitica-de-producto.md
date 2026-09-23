# Prompt 24 — Analitica De Producto

## Objetivo

Convertir las métricas conceptuales del PRD en una taxonomía de eventos medible y respetuosa con privacidad para validar el producto durante el TFM.

## Lee antes de empezar

- `PRD.md`
- `product/03-users-and-scenarios.md`
- `product/17-traceability-matrix.md`
- `security/23-privacy-retention/data-retention-and-privacy.md`

## Tarea

1. Define eventos de producto estrictamente necesarios: team_created, availability_updated, request_created/responded, proposal_created/responded/resolved, survey_created/voted/resolved, account_linked, etc.
2. Para cada evento define propiedades permitidas/prohibidas, identidad pseudónima si aplica y propósito de medida.
3. Relaciona eventos con métricas del PRD y evita capturar texto libre, nombres o respuestas sensibles salvo justificación.
4. Define funnel de E2E-01/02/03 y métricas de fricción.
5. Propón una estrategia mínima de instrumentación; no elijas proveedor si no es necesario.

## Entregables mínimos

- `quality/24-product-analytics/product-analytics.md`

## Criterios de aceptación

- [ ] Cada métrica del PRD puede calcularse o se explica por qué se descarta.
- [ ] No se recopilan datos sin propósito.
- [ ] La taxonomía es estable y versionable.



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
