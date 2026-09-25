# Synqo Design Baseline v1.0

**Fecha de establecimiento:** 2026-09-24
**Estado:** Active for implementation
**Alcance:** gobierna la implementación inicial del Target MVP y la entrega IA del TFM.

## Propósito

Esta baseline reúne las decisiones de producto, diseño y arquitectura que la implementación debe respetar. No sustituye los documentos fuente: los referencia y fija qué conjunto se considera estable para comenzar. Una implementación no puede contradecir silenciosamente la documentación baseline.

El análisis y el diseño están suficientemente cerrados para comenzar la fase de implementación. Las decisiones que sigan diferidas se mantienen explícitas y se clasifican según si bloquean o no un slice concreto.

## Documentos normativos incluidos

| Área | Fuente normativa |
|---|---|
| Producto y alcance | [`PRD.md`](../PRD.md), [`product/01-product-vision.md`](../product/01-product-vision.md), [`product/02-scope-and-mvp.md`](../product/02-scope-and-mvp.md) |
| Requisitos y prioridad | [`product/09-functional-requirements.md`](../product/09-functional-requirements.md), [`product/09b-requirements-prioritization.md`](../product/09b-requirements-prioritization.md), [`product/10-non-functional-requirements.md`](../product/10-non-functional-requirements.md) |
| Historias y UX | [`product/12-user-stories-and-acceptance-criteria.md`](../product/12-user-stories-and-acceptance-criteria.md), [`product/13-information-architecture.md`](../product/13-information-architecture.md), [`product/14-user-flows.md`](../product/14-user-flows.md), [`product/15-screen-specification.md`](../product/15-screen-specification.md), [`design/`](../design/) |
| Dominio y estados | [`product/05-ubiquitous-language.md`](../product/05-ubiquitous-language.md), [`product/07-business-rules.md`](../product/07-business-rules.md), [`product/08-lifecycles.md`](../product/08-lifecycles.md), [`technical-design/13-domain/domain-design.md`](../technical-design/13-domain/domain-design.md), [`technical-design/13-domain/domain-invariants.md`](../technical-design/13-domain/domain-invariants.md), [`technical-design/14-state-machines/state-machines.md`](../technical-design/14-state-machines/state-machines.md) |
| Autorización e identidad | [`technical-design/15-authorization/authorization-rules.md`](../technical-design/15-authorization/authorization-rules.md), [`technical-design/16-identity-sessions/identity-and-session-design.md`](../technical-design/16-identity-sessions/identity-and-session-design.md) |
| Persistencia y API | [`technical-design/17-data-model/data-model.md`](../technical-design/17-data-model/data-model.md), [`technical-design/18-api/api-design.md`](../technical-design/18-api/api-design.md), [`technical-design/18-api/openapi.yaml`](../technical-design/18-api/openapi.yaml) |
| Seguridad y calidad | [`security/`](../security/), [`quality/25-test-plan/test-plan.md`](../quality/25-test-plan/test-plan.md), [`quality/25-test-plan/test-traceability.md`](../quality/25-test-plan/test-traceability.md) |
| IA | [`ai/26-technical-design/ai-technical-design.md`](../ai/26-technical-design/ai-technical-design.md), [`ai/27-evaluation/ai-evaluation-plan.md`](../ai/27-evaluation/ai-evaluation-plan.md) |
| Orden de entrega | [`delivery/28-implementation-roadmap/implementation-roadmap.md`](../delivery/28-implementation-roadmap/implementation-roadmap.md), [`delivery/28-implementation-roadmap/vertical-slices.md`](../delivery/28-implementation-roadmap/vertical-slices.md) |

Cuando haya una referencia más específica para una pregunta, se consulta esa fuente y no se copia su contenido en esta baseline.

## Contenido consolidado de la baseline

- **Producto:** Synqo coordina equipos y decisiones; `Equipo` es el contexto principal. El flujo manual funciona sin IA y sin cuenta global para la participación básica.
- **Alcance y MoSCoW:** el alcance deseado es el `Target MVP`; la prioridad operativa se toma de `09b-requirements-prioritization.md`. `Minimum Viable Validation` define lo que no debe sacrificarse bajo presión.
- **UX:** mobile-first, deep links, vistas Calendario y Lista, estados explícitos y color acompañado por texto/símbolos accesibles.
- **Dominio:** `Cuenta`, `Participante` y `Administrador` son conceptos distintos; el dominio es un monolito modular pragmático y determinista.
- **Reglas:** disponibilidad general por día; `Disponible`, `Quizá`, `No disponible` y `Sin respuesta` derivado; propuesta con fecha obligatoria y hora opcional; encuesta `SINGLE` o `MULTIPLE`; resultado separado de resolución; Synqo no decide automáticamente.
- **Estados:** se preservan los lifecycles de equipo, solicitudes y consultas definidos en `product/08-lifecycles.md` y `technical-design/14-state-machines/state-machines.md`.
- **Autorización:** toda operación sensible se autoriza en servidor y dentro del equipo; los enlaces se canjean por sesiones contextuales y se limpian de la URL.
- **Identidad:** la cuenta global es opcional para las capacidades esenciales; un participante sin cuenta conserva su identidad e histórico al vincularse posteriormente.
- **Datos:** PostgreSQL + MikroORM, identificadores internos UUID, referencias públicas opacas y constraints que refuerzan pertenencia, unicidad, lifecycle y resolución.
- **API:** REST JSON descrita por OpenAPI; el contrato implementable es `technical-design/18-api/openapi.yaml` junto con las reglas de dominio y autorización.
- **Seguridad:** aislamiento entre equipos, minimización de PII, no exposición de tokens, expiración/purga de equipos rápidos y controles de sesión documentados.
- **Testing:** Vitest, Testing Library, Testcontainers, Playwright y axe según el plan; las pruebas se eligen por riesgo y criterio de aceptación.
- **IA:** el LLM interpreta lenguaje natural a `CoordinationIntent`; schema y dominio validan; el motor determinista calcula; el usuario revisa; hay fallback manual y el proveedor no decide ni muta.
- **Roadmap:** se sigue `vertical-slices.md`, comenzando por Slice 0 y continuando por los slices que construyen el Minimum Viable Validation.

## Baseline blockers

Un `Baseline blocker` impide empezar un slice relacionado hasta cerrar la decisión o tramitar un cambio. En el establecimiento de v1.0 no se ha identificado un blocker global. Antes de cada slice deben revisarse sus dependencias y el estado de esta baseline.

Una ambigüedad pasa a blocker si afecta, por ejemplo, a una regla de producto necesaria, a una invariante, a la autorización, a un contrato API público o a la privacidad del slice.

## Known deferred decisions

Estas decisiones siguen diferidas en las fuentes y no bloquean Slice 0 ni los primeros slices, salvo que una SPEC las necesite de forma directa:

- esquema físico final más allá del modelo lógico y la estrategia de migraciones;
- identificadores públicos/internos concretos donde el diseño deja alternativas;
- proveedor y modelo LLM concretos;
- calendario externo, push y staging/IaC avanzada;
- evolución a múltiples administradores;
- detalles de detección técnica de actividad humana frente a previews/bots;
- restricciones futuras al cambiar la zona horaria de un equipo con histórico.

Una SPEC debe detenerse si una de estas decisiones deja de ser local y pasa a cambiar la baseline.

## Reglas de cambio

1. Toda implementación se compara con esta baseline y con sus fuentes normativas.
2. Un cambio de producto, requisito, `Must`, RNF crítico, regla, invariante, lifecycle, autorización, identidad, privacidad, contrato público, datos relevantes, seguridad o comportamiento IA requiere un `Change Request`.
3. La CR permanece `Proposed` hasta que el propietario humano tome una decisión. No se implementa mientras esté pendiente.
4. Una CR aceptada actualiza primero o junto a los documentos fuente, trazabilidad, SPECs y baseline versionada.
5. Una diferencia técnica menor que no cambia el producto se registra como deviation, no como cambio silencioso.
6. Los typos, refactors internos y correcciones que restauran el comportamiento especificado no requieren CR.

## Versionado

Esta baseline es `Design Baseline v1.0`. No se crea un tag automáticamente. Cuando la baseline esté aprobada para implementación, se recomienda crear el tag Git `design-baseline-v1.0`. Las revisiones posteriores deben conservar historial y declarar la versión anterior y nueva.
