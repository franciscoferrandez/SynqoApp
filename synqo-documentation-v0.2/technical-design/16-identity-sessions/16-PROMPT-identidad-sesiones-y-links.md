# Prompt 16 — Identidad Sesiones Y Links

## Objetivo

Diseñar técnicamente cuentas, participant sessions, administrative sessions y enlaces opacos, conciliando ADR-008 y ADR-021.

## Lee antes de empezar

- `architecture/adr/ADR-008-authentication.md`
- `architecture/adr/ADR-021-access-links.md`
- `architecture/adr/ADR-015-security.md`
- `product/05-ubiquitous-language.md`
- `product/14-user-flows.md`
- `technical-design/15-authorization/authorization-matrix.md`

## Tarea

1. Define credenciales y sesiones: account session, participant session, admin session, public link, identified link, verification/recovery link.
2. Para cada una documenta emisión, almacenamiento, hashing, TTL, rotación, revocación, one-time use, cookie attributes y clean redirect.
3. Define cómo conviven sesiones de distintos equipos y qué ocurre al vincular participant↔account.
4. Detalla mecanismos contra fixation, replay, token leakage y enumeración.
5. Define flows técnicos de create managed + verify, recovery admin, identified link y account linking.

## Entregables mínimos

- `technical-design/16-identity-sessions/identity-and-session-design.md`

## Criterios de aceptación

- [ ] Ninguna capacidad administrativa depende de un bearer link permanente.
- [ ] Los tokens sensibles no permanecen en URL tras intercambio.
- [ ] La vinculación conserva participantId e histórico.



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
