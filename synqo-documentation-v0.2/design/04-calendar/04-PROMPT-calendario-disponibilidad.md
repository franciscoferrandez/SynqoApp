# Prompt 04 — Calendario Disponibilidad

## Objetivo

Diseñar en detalle el componente más característico de Synqo: calendario individual y colectivo, junto con su vista de lista equivalente, interacción por día, selección de candidatas y accesibilidad.

## Lee antes de empezar

- `product/09-functional-requirements.md`
- `product/14-user-flows.md`
- `product/15-screen-specification.md`
- `product/16-wireframes/04-my-availability.md`
- `product/16-wireframes/05-collective-availability.md`
- `design/02-visual-direction/visual-direction.md`
- `design/03-design-system/design-tokens.md`
- `design/03-design-system/component-catalog.md`

## Tarea

1. Especifica los modos `Mi disponibilidad` y `Disponibilidad colectiva`, y dentro de cada uno las vistas `Calendario` y `Lista`.
2. Define navegación temporal mensual/semanal, conservación de contexto al cambiar de vista, hoy, fechas fuera de rango y carga incremental.
3. Detalla semántica visual de cada celda/día: estado individual, intensidad colectiva, conteos mínimos visibles, leyenda, no respuesta y selección de candidatas.
4. Define interacción al pulsar un día, selección de una o varias fechas, acceso a detalle nominal y acción `Añadir a propuesta`/`Crear propuesta con N fechas`.
5. Especifica teclado, focus, screen reader, touch targets y alternativa accesible a la información cromática.
6. Incluye casos límite: equipos grandes, días sin datos, estados deshabilitados en equipo administrable, meses con cambio DST, rangos largos y móvil estrecho.

## Entregables mínimos

- `design/04-calendar/calendar-specification.md`

## Criterios de aceptación

- [ ] El calendario individual y colectivo usan el mismo modelo de datos pero distinta semántica visual.
- [ ] Existe paridad funcional calendario/lista.
- [ ] La selección de candidatas conecta con RF-PRO-12.
- [ ] El diseño es usable con teclado y lector de pantalla.



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
