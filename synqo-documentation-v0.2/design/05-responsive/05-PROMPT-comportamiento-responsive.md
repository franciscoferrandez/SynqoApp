# Prompt 05 — Comportamiento Responsive

## Objetivo

Definir cómo se adapta Synqo entre móvil, tablet y escritorio, manteniendo la misma arquitectura de información y evitando que cada breakpoint se convierta en una aplicación distinta.

## Lee antes de empezar

- `product/13-information-architecture.md`
- `product/15-screen-specification.md`
- `product/16-wireframes/README.md`
- `design/03-design-system/component-catalog.md`
- `design/04-calendar/calendar-specification.md`

## Tarea

1. Define breakpoints conceptuales y, más importante, reglas de reflow/compactación por tipo de contenido.
2. Especifica navegación global y de equipo en móvil/escritorio, incluyendo la propuesta `Inicio / Disponibilidad / Decisiones / Más`.
3. Documenta comportamiento responsive de calendario, listas, formularios, resultados, settings, tablas nominales y diálogos.
4. Define cuándo usar pantalla completa, sheet/drawer, dialog o navegación a nueva ruta en móvil.
5. Incluye reglas para orientación, zoom, tamaños táctiles y contenido largo/localización.

## Entregables mínimos

- `design/05-responsive/responsive-behaviour.md`

## Criterios de aceptación

- [ ] Todos los flujos críticos son realizables en 320–360px sin scroll horizontal funcional.
- [ ] No hay pérdida de información crítica al cambiar de viewport.
- [ ] El calendario tiene estrategia específica móvil y escritorio.



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
