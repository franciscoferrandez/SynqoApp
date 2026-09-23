# Prompt 06 — Patrones De Interaccion

## Objetivo

Especificar las microinteracciones y patrones operativos comunes para que guardar, responder, resolver, compartir y navegar sean predecibles.

## Lee antes de empezar

- `product/14-user-flows.md`
- `product/15-screen-specification.md`
- `product/12-user-stories-and-acceptance-criteria.md`
- `design/03-design-system/component-catalog.md`
- `design/05-responsive/responsive-behaviour.md`

## Tarea

1. Define patrones de guardado: explícito, autosave, optimistic update, confirmación y manejo de error. Decide por tipo de interacción, no de forma global.
2. Define confirmaciones destructivas/irreversibles: resolver, cancelar, revocar, expirar/reactivar, salir con cambios.
3. Especifica feedback para loading, retry, latencia de red y doble submit.
4. Documenta interacción de compartir enlaces, copiar, abrir deep links y retornar al contexto anterior.
5. Define reglas de edición de respuestas abiertas y transición a read-only al cerrarse/resolverse.
6. Incluye focus management después de dialog/sheet y mensajes accesibles de éxito/error.

## Entregables mínimos

- `design/06-interactions/interaction-patterns.md`

## Criterios de aceptación

- [ ] Cada acción crítica tiene patrón de confirmación/feedback definido.
- [ ] Los patrones contemplan idempotencia y concurrencia desde UX.
- [ ] No se pierde entrada del usuario ante errores recuperables cuando sea posible.



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
