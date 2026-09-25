# AGENTS.md — Synqo documentation workspace

Esta carpeta contiene la fuente de verdad documental de producto, diseño y arquitectura de Synqo. Las reglas globales del futuro código están en el [`AGENTS.md`](../AGENTS.md) de la raíz Git.

## Cómo trabajar

- Ejecuta los prompts numerados de `WORKPLAN.md` en orden salvo que exista una razón explícita para adelantar uno.
- Antes de ejecutar un prompt, lee este archivo y todos los documentos listados en su sección **Lee antes de empezar**.
- El objetivo de cada prompt es **modificar el workspace**, no responder únicamente con una propuesta en chat.
- Mantén los documentos Markdown legibles en Git y usa Mermaid para diagramas cuando sea suficiente.
- No cambies una decisión funcional consolidada silenciosamente. Si detectas un conflicto, crea una sección `Inconsistencia detectada`, propón la corrección y actualiza todas las referencias afectadas solo después de justificarla.
- No renumeres IDs de requisitos, historias, decisiones o ADR existentes salvo necesidad real.
- Conserva `product/19-open-questions.md` como registro de incertidumbre viva hasta que cada `OPEN-*` se cierre.
- Un ADR documenta una decisión arquitectónica significativa; no lo uses como cajón de reglas de producto.
- Evita generar código de producción mientras se ejecutan los prompts 01–27. El prompt 28 prepara el salto a implementación.
- La implementación posterior se gobierna por `IMPLEMENTATION-GUIDE.md`, `project/design-baseline.md`, `specs/` y las skills locales bajo `../.agents/skills/`.

## Fuente de verdad por tema

- Producto consolidado: `PRD.md`
- Requisitos y restricciones: `product/09-functional-requirements.md`, `product/10-non-functional-requirements.md`, `product/11-constraints.md`
- Lenguaje y dominio conceptual: `product/05-ubiquitous-language.md`, `product/06-conceptual-domain-model.md`
- Reglas/lifecycle: `product/07-business-rules.md`, `product/08-lifecycles.md`
- Historias/flows/UI: `product/12-user-stories-and-acceptance-criteria.md`, `product/14-user-flows.md`, `product/15-screen-specification.md`, `product/16-wireframes/`
- Arquitectura: `architecture/README.md`, `architecture/decision-register.md`, `architecture/adr/`
- IA funcional: `product/18-ai-feature-specification.md`
- Trazabilidad: `product/17-traceability-matrix.md`, `traceability/product-architecture-map.md`

## Referencias visuales aportadas

- Material de referencia visual: `design/reference-assets/`
- Finalidad: informar paleta, tema claro/oscuro, atmósfera visual, superficies y acentos para los prompts de diseño.
- Alcance: estos assets no son fuente de verdad funcional ni sustituyen `PRD.md`, `product/`, `architecture/`, wireframes funcionales ni `design/02-visual-direction/visual-direction.md`. Si contradicen documentación consolidada, prevalece la documentación.

## Política de actualización cruzada

Cuando una tarea cierre o cambie una decisión, busca y actualiza todas las referencias relevantes. Como mínimo revisa el PRD, requisitos, historias, flows, trazabilidad y ADR afectados. No dejes dos documentos con reglas incompatibles.
