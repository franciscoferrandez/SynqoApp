# Prompt 21 — Matriz De Notificaciones

## Objetivo

Cerrar la política de comunicación externa y diseñar notificaciones transaccionales sin convertir Synqo en una plataforma de mensajería.

## Lee antes de empezar

- `architecture/adr/ADR-017-email-notifications.md`
- `product/19-open-questions.md`
- `product/09-functional-requirements.md`
- `technical-design/20-jobs-events/jobs-and-events.md`
- `design/08-content/content-and-microcopy.md`

## Tarea

1. Distingue email transaccional obligatorio (verificación, recuperación, passwordless si aplica) de notificaciones de producto opcionales.
2. Crea matriz evento × canal × destinatario × obligatoriedad × opt-out × deep link.
3. Decide qué eventos del MVP generan solo pendiente in-app, qué se comparte manualmente y cuáles justifican email.
4. Define contenido mínimo y seguridad de enlaces en plantillas.
5. Crea catálogo inicial de plantillas con subject, propósito y variables, sin diseñar HTML final si no es necesario.

## Entregables mínimos

- `technical-design/21-notifications/notification-matrix.md`
- `technical-design/21-notifications/email-template-catalogue.md`

## Criterios de aceptación

- [ ] OPEN-08 queda cerrado o acotado.
- [ ] No se envían emails innecesarios a participantes sin email.
- [ ] Cada email contiene solo datos mínimos.



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
