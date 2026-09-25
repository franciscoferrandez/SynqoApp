# Prompt 03 — Tokens Y Componentes

## Objetivo

Crear la primera especificación del design system de Synqo: tokens, primitives y catálogo de componentes que puedan implementarse en React sin acoplar el diseño a una librería concreta.

## Lee antes de empezar

- `design/02-visual-direction/visual-direction.md`
- `design/reference-assets/README.md`
- `product/15-screen-specification.md`
- `product/16-wireframes/README.md`
- `product/10-non-functional-requirements.md`
- `architecture/adr/ADR-002A-frontend-react.md`

## Tarea

1. Define tokens semánticos de color, tipografía, espaciado, tamaños, radios, bordes, elevación y motion. Usa nombres semánticos y evita depender de colores literales en la API de componentes.
   - Si existen assets en `design/reference-assets/`, úsalos como referencia visual para paleta, tema claro/oscuro, superficies y acentos, respetando el alcance descrito en su `README.md`.
2. Especifica componentes base: Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Tabs, Badge, Card, Alert, Dialog, Drawer/Sheet, Tooltip, Toast, Skeleton y navegación.
3. Especifica componentes de dominio: AvailabilityState, AvailabilityLegend, TeamTypeBadge, ConsultationTypeBadge, ParticipationStatus, ResolutionStatus, ParticipantAvatar/Identity, ResultSummary y PendingAction.
4. Para cada componente documenta propósito, variantes, estados, accesibilidad, contenido permitido, comportamiento responsive y eventos relevantes.
5. Distingue componentes que pueden salir de una librería base de los que deben ser propios de Synqo.

## Entregables mínimos

- `design/03-design-system/design-tokens.md`
- `design/03-design-system/component-catalog.md`

## Criterios de aceptación

- [ ] Los tokens permiten representar todos los estados de disponibilidad sin depender solo de color.
- [ ] El catálogo cubre las pantallas del MVP.
- [ ] Los componentes de dominio no filtran decisiones técnicas del backend.
- [ ] Incluye criterios de accesibilidad por componente.



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
