# Prompt 02 — Direccion Visual

## Objetivo

Definir la dirección visual de Synqo sin convertirla todavía en un design system completo. Debe traducir los principios del producto —baja fricción, claridad, coordinación, mobile-first y accesibilidad— a reglas visuales coherentes.

## Lee antes de empezar

- `PRD.md`
- `product/01-product-vision.md`
- `product/13-information-architecture.md`
- `product/15-screen-specification.md`
- `product/16-wireframes/README.md`
- `product/16-wireframes/03-team-home.md`
- `product/16-wireframes/04-my-availability.md`
- `product/16-wireframes/05-collective-availability.md`
- `product/10-non-functional-requirements.md`

## Tarea

1. Define atributos de marca y tono visual: claridad, densidad, jerarquía, grado de expresividad y sensación deseada, evitando marketing abstracto.
2. Propón principios de color para `Disponible`, `Quizá`, `No disponible` y `Sin respuesta`, asegurando que el color no sea el único canal semántico.
3. Define principios tipográficos, espaciado, superficies, iconografía, radios, elevación y densidad móvil/escritorio a nivel conceptual.
4. Describe qué debe diferenciar visualmente Equipo rápido, Equipo administrable, Consulta abierta/cerrada/resuelta/cancelada, Resultado y Resolución.
5. Incluye ejemplos de “hacer/no hacer” y criterios que permitan evaluar futuras pantallas.

## Entregables mínimos

- `design/02-visual-direction/visual-direction.md`

## Criterios de aceptación

- [ ] La dirección visual se deriva de requisitos existentes.
- [ ] Incluye reglas accesibles para estados de disponibilidad.
- [ ] No fija componentes o tokens prematuramente.
- [ ] Es utilizable como entrada del prompt 03.



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
