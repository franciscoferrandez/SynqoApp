# WORKPLAN — Completar el diseño de Synqo

Este índice está pensado para ejecutar las tareas desde Codex en terminal. Cada carpeta pendiente contiene un prompt autocontenido y referenciado contra la documentación ya consolidada.

## Uso recomendado

1. Trabaja sobre una rama de documentación.
2. Lee `AGENTS.md`.
3. Abre el prompt correspondiente y pásaselo a Codex desde la raíz del repositorio.
4. Revisa el diff antes de continuar al siguiente número.
5. No avances si el prompt actual deja una inconsistencia que bloquea al siguiente.

## Secuencia

- [ ] **01** — `planning/01-open-decisions/01-PROMPT-cerrar-decisiones-abiertas.md`
  - Objetivo: Cerrar, o dejar con plan de cierre verificable, las decisiones OPEN-01…OPEN-09 antes de que contaminen el diseño UI/técnico. El resultado debe convertir las decisiones suficientemente maduras en reglas/requisitos explícitos y mantener únicamente las que realmente requieran evidencia posterior.
  - Outputs esperados: `planning/01-open-decisions/open-decisions-resolution.md`, `product/19-open-questions.md (actualizado)`, `PRD.md (si procede)`, `product/product-decision-register.md (si procede)`
- [ ] **02** — `design/02-visual-direction/02-PROMPT-direccion-visual.md`
  - Objetivo: Definir la dirección visual de Synqo sin convertirla todavía en un design system completo. Debe traducir los principios del producto —baja fricción, claridad, coordinación, mobile-first y accesibilidad— a reglas visuales coherentes.
  - Outputs esperados: `design/02-visual-direction/visual-direction.md`
- [ ] **03** — `design/03-design-system/03-PROMPT-tokens-y-componentes.md`
  - Objetivo: Crear la primera especificación del design system de Synqo: tokens, primitives y catálogo de componentes que puedan implementarse en React sin acoplar el diseño a una librería concreta.
  - Outputs esperados: `design/03-design-system/design-tokens.md`, `design/03-design-system/component-catalog.md`
- [ ] **04** — `design/04-calendar/04-PROMPT-calendario-disponibilidad.md`
  - Objetivo: Diseñar en detalle el componente más característico de Synqo: calendario individual y colectivo, junto con su vista de lista equivalente, interacción por día, selección de candidatas y accesibilidad.
  - Outputs esperados: `design/04-calendar/calendar-specification.md`
- [ ] **05** — `design/05-responsive/05-PROMPT-comportamiento-responsive.md`
  - Objetivo: Definir cómo se adapta Synqo entre móvil, tablet y escritorio, manteniendo la misma arquitectura de información y evitando que cada breakpoint se convierta en una aplicación distinta.
  - Outputs esperados: `design/05-responsive/responsive-behaviour.md`
- [ ] **06** — `design/06-interactions/06-PROMPT-patrones-de-interaccion.md`
  - Objetivo: Especificar las microinteracciones y patrones operativos comunes para que guardar, responder, resolver, compartir y navegar sean predecibles.
  - Outputs esperados: `design/06-interactions/interaction-patterns.md`
- [ ] **07** — `design/07-ui-states/07-PROMPT-catalogo-estados-ui.md`
  - Objetivo: Crear un catálogo exhaustivo de estados de interfaz para evitar que solo se diseñe el happy path.
  - Outputs esperados: `design/07-ui-states/ui-state-catalogue.md`
- [ ] **08** — `design/08-content/08-PROMPT-microcopy-y-contenido.md`
  - Objetivo: Definir el lenguaje de interfaz de Synqo para que términos técnicos del dominio no se filtren innecesariamente al usuario y para que la temporalidad, permisos y resolución sean comprensibles.
  - Outputs esperados: `design/08-content/content-and-microcopy.md`
- [ ] **09** — `design/09-accessibility/09-PROMPT-especificacion-accesibilidad.md`
  - Objetivo: Convertir el objetivo WCAG 2.2 AA en requisitos verificables de UI, con especial atención al calendario y a los estados por color.
  - Outputs esperados: `design/09-accessibility/accessibility-specification.md`, `design/09-accessibility/accessibility-checklist.md`
- [ ] **10** — `design/10-high-fidelity/10-PROMPT-especificacion-high-fidelity.md`
  - Objetivo: Preparar la especificación necesaria para producir mockups high-fidelity de los recorridos críticos, aunque la herramienta final pueda ser Figma u otra externa al repositorio.
  - Outputs esperados: `design/10-high-fidelity/high-fidelity-screen-briefs.md`
- [ ] **11** — `design/11-prototype/11-PROMPT-prototipo-interactivo.md`
  - Objetivo: Diseñar el prototipo navegable que permita validar los tres recorridos E2E principales antes de implementar el producto real.
  - Outputs esperados: `design/11-prototype/prototype-specification.md`, `design/11-prototype/test-scenarios.md`
- [ ] **12** — `design/12-usability/12-PROMPT-validacion-usabilidad.md`
  - Objetivo: Preparar y documentar una validación de usabilidad ligera pero defendible para el TFM, centrada en los riesgos de comprensión más importantes.
  - Outputs esperados: `design/12-usability/usability-test-plan.md`, `design/12-usability/findings-template.md`
- [ ] **13** — `technical-design/13-domain/13-PROMPT-diseno-de-dominio.md`
  - Objetivo: Transformar el modelo conceptual de producto en un diseño de dominio táctico implementable, sin forzar DDD ceremonial ni asumir que cada concepto necesita clase propia.
  - Outputs esperados: `technical-design/13-domain/domain-design.md`, `technical-design/13-domain/domain-invariants.md`
- [ ] **14** — `technical-design/14-state-machines/14-PROMPT-maquinas-de-estado.md`
  - Objetivo: Formalizar lifecycles como máquinas de estado implementables y testeables, separando estado de negocio, transición, actor, condición y efectos.
  - Outputs esperados: `technical-design/14-state-machines/state-machines.md`
- [ ] **15** — `technical-design/15-authorization/15-PROMPT-matriz-de-autorizacion.md`
  - Objetivo: Convertir ADR-022 y los permisos de producto en una matriz exhaustiva y reglas server-side implementables.
  - Outputs esperados: `technical-design/15-authorization/authorization-matrix.md`, `technical-design/15-authorization/authorization-rules.md`
- [ ] **16** — `technical-design/16-identity-sessions/16-PROMPT-identidad-sesiones-y-links.md`
  - Objetivo: Diseñar técnicamente cuentas, participant sessions, administrative sessions y enlaces opacos, conciliando ADR-008 y ADR-021.
  - Outputs esperados: `technical-design/16-identity-sessions/identity-and-session-design.md`
- [ ] **17** — `technical-design/17-data-model/17-PROMPT-modelo-de-datos-y-erd.md`
  - Objetivo: Diseñar el modelo lógico PostgreSQL/MikroORM a partir del dominio táctico, priorizando integridad, consultas de calendario/resultados y evolución del MVP.
  - Outputs esperados: `technical-design/17-data-model/data-model.md`, `technical-design/17-data-model/erd.md`
- [ ] **18** — `technical-design/18-api/18-PROMPT-contrato-api-openapi.md`
  - Objetivo: Diseñar la API REST pública/interna del frontend y producir un OpenAPI inicial consistente con el dominio, autorización y deep links.
  - Outputs esperados: `technical-design/18-api/api-design.md`, `technical-design/18-api/openapi.yaml`
- [ ] **19** — `technical-design/19-sequences/19-PROMPT-diagramas-de-secuencia.md`
  - Objetivo: Documentar interacciones runtime de los recorridos críticos para alinear frontend, API, dominio, persistencia, jobs y proveedores externos.
  - Outputs esperados: `technical-design/19-sequences/sequence-diagrams.md`
- [ ] **20** — `technical-design/20-jobs-events/20-PROMPT-jobs-y-eventos.md`
  - Objetivo: Concretar el uso de pg-boss y eventos internos, evitando convertir todo el dominio en event-driven sin necesidad.
  - Outputs esperados: `technical-design/20-jobs-events/jobs-and-events.md`
- [ ] **21** — `technical-design/21-notifications/21-PROMPT-matriz-de-notificaciones.md`
  - Objetivo: Cerrar la política de comunicación externa y diseñar notificaciones transaccionales sin convertir Synqo en una plataforma de mensajería.
  - Outputs esperados: `technical-design/21-notifications/notification-matrix.md`, `technical-design/21-notifications/email-template-catalogue.md`
- [ ] **22** — `security/22-threat-model/22-PROMPT-threat-model.md`
  - Objetivo: Crear un threat model práctico de Synqo centrado en enlaces bearer, identidades locales, autorización por equipo y superficies públicas.
  - Outputs esperados: `security/22-threat-model/threat-model.md`, `security/22-threat-model/security-checklist.md`
- [ ] **23** — `security/23-privacy-retention/23-PROMPT-privacidad-y-retencion.md`
  - Objetivo: Definir minimización, conservación y eliminación/anominización de datos, especialmente para equipos rápidos y datos enviados a proveedores externos.
  - Outputs esperados: `security/23-privacy-retention/data-retention-and-privacy.md`
- [ ] **24** — `quality/24-product-analytics/24-PROMPT-analitica-de-producto.md`
  - Objetivo: Convertir las métricas conceptuales del PRD en una taxonomía de eventos medible y respetuosa con privacidad para validar el producto durante el TFM.
  - Outputs esperados: `quality/24-product-analytics/product-analytics.md`
- [ ] **25** — `quality/25-test-plan/25-PROMPT-plan-de-testing.md`
  - Objetivo: Convertir ADR-014 y la trazabilidad funcional en un plan ejecutable de tests por nivel, incluyendo seguridad, accesibilidad, concurrencia y fallos de proveedor.
  - Outputs esperados: `quality/25-test-plan/test-plan.md`, `quality/25-test-plan/test-traceability.md`
- [ ] **26** — `ai/26-technical-design/26-PROMPT-diseno-tecnico-ia.md`
  - Objetivo: Convertir la especificación funcional del asistente de coordinación en un contrato técnico implementable, manteniendo el LLM como intérprete y no como decisor.
  - Outputs esperados: `ai/26-technical-design/ai-technical-design.md`, `ai/26-technical-design/coordination-intent.schema.json`, `ai/26-technical-design/prompt-specification.md`
- [ ] **27** — `ai/27-evaluation/27-PROMPT-evaluacion-ia.md`
  - Objetivo: Diseñar el sistema de evaluación reproducible del intérprete de lenguaje natural y crear el dataset inicial versionado.
  - Outputs esperados: `ai/27-evaluation/ai-evaluation-plan.md`, `ai/27-evaluation/evaluation-dataset.jsonl`, `ai/27-evaluation/evaluation-report-template.md`
- [ ] **28** — `delivery/28-implementation-roadmap/28-PROMPT-roadmap-de-implementacion.md`
  - Objetivo: Convertir toda la documentación cerrada en un plan incremental de implementación para Codex/terminal, priorizando vertical slices verificables y evitando construir infraestructura sin valor visible.
  - Outputs esperados: `delivery/28-implementation-roadmap/implementation-roadmap.md`, `delivery/28-implementation-roadmap/vertical-slices.md`

## Hitos sugeridos

- **Hito A — Diseño de producto/UI listo:** prompts 01–12.
- **Hito B — Diseño técnico core listo para comenzar implementación:** prompts 13–19.
- **Hito C — Operación, seguridad y calidad listas:** prompts 20–25.
- **Hito D — IA especificada/evaluable:** prompts 26–27.
- **Hito E — Preparado para implementación incremental:** prompt 28.
