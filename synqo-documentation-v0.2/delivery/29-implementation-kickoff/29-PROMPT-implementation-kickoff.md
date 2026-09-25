Quiero preparar este repositorio para comenzar formalmente la fase de implementación de Synqo.

La fase de análisis y diseño está prácticamente completada y existe una documentación extensa dentro del repositorio, incluyendo producto, UX/UI, arquitectura, diseño técnico, seguridad, calidad, IA, trazabilidad, priorización MoSCoW y roadmap de implementación.

NO debes implementar todavía código de aplicación.

El objetivo de esta tarea es preparar toda la OPERATIVA DE IMPLEMENTACIÓN para trabajar posteriormente con Codex de forma disciplinada mediante:

- Waterfall a nivel macro del proyecto.
- Spec-Driven Development básico / Spec-First durante implementación.
- Control explícito de cambios sobre la baseline.
- Skills locales del repositorio para distintos tipos de trabajo.
- Verificación obligatoria antes de dar cualquier cambio por terminado.
- Documentación viva, evitando burocracia y duplicación innecesarias.
- Conservación estructurada de evidencia para la futura memoria del TFM.

Trabaja directamente sobre este repositorio.

---

# 1. INSPECCIONAR EL REPOSITORIO

Empieza por:

1. Ejecutar `git status`.
2. Inspeccionar la estructura del repositorio.
3. Localizar la raíz de Git.
4. Localizar la raíz real de la documentación.
5. Localizar todos los `AGENTS.md` existentes.
6. Localizar cualquier estructura existente de skills o instrucciones para agentes.

No asumas que la documentación está necesariamente en `/docs`.

Identifica la carpeta que contiene, entre otros documentos equivalentes:

- PRD.md
- WORKPLAN.md
- product/
- design/
- architecture/
- technical-design/
- security/
- quality/
- ai/
- delivery/

No modifiques archivos todavía.

---

# 2. COMPRENDER EL ESTADO ACTUAL

Antes de crear nueva estructura, revisa al menos:

- README.md
- PRD.md
- WORKPLAN.md
- WORKPLAN-IMPLEMENTATION-SUMMARY.md si existe
- DOCUMENTATION-STATUS.md si existe
- product/02-scope-and-mvp.md
- product/09-functional-requirements.md
- product/09b-requirements-prioritization.md
- product/10-non-functional-requirements.md
- product/12-user-stories-and-acceptance-criteria.md
- product/17-traceability-matrix.md
- product/19-open-questions.md
- product/product-decision-register.md si existe
- architecture/decision-register.md
- architecture/adr/ADR-020-development-process.md
- technical-design/13-domain/domain-design.md
- technical-design/13-domain/domain-invariants.md
- technical-design/14-state-machines/state-machines.md
- technical-design/15-authorization/authorization-rules.md
- technical-design/16-identity-sessions/identity-and-session-design.md
- technical-design/17-data-model/data-model.md
- technical-design/18-api/api-design.md
- technical-design/18-api/openapi.yaml
- quality/25-test-plan/test-plan.md
- quality/25-test-plan/test-traceability.md
- ai/26-technical-design/ai-technical-design.md
- ai/27-evaluation/ai-evaluation-plan.md
- delivery/28-implementation-roadmap/implementation-roadmap.md
- delivery/28-implementation-roadmap/vertical-slices.md

Si alguna ruta difiere, localiza el documento equivalente.

El propósito NO es reabrir el diseño.

Debes entender:

- qué está decidido;
- qué está diferido;
- qué está priorizado;
- qué está diseñado;
- qué se espera implementar;
- qué documentos son actualmente fuente de verdad;
- qué decisiones siguen abiertas pero no bloquean la implementación inicial.

---

# 3. METODOLOGÍA QUE DEBE QUEDAR FORMALIZADA

Formaliza esta metodología:

## Nivel macro — Waterfall

Las fases principales serán:

Requirements / Analysis
    ↓
Design
    ↓
Design Baseline
    ↓
Implementation
    ↓
Verification & Validation
    ↓
Deployment
    ↓
TFM Evaluation / As-Built Documentation

Análisis y diseño se consideran esencialmente completados.

La implementación debe trabajar contra una baseline documental estable.

Waterfall NO significa que debamos implementar todo antes de ejecutar tests.

Dentro de la fase Implementation se desarrollarán unidades pequeñas y verificables.

---

## Nivel micro — Spec-First SDD

Para funcionalidad nueva o cambios de comportamiento relevantes:

Specification
    ↓
Review / Ready
    ↓
Acceptance criteria + required tests
    ↓
Implementation
    ↓
Automated verification
    ↓
Human review
    ↓
Documentation consistency
    ↓
Verified

La dirección debe ser siempre:

SPEC → CODE

y nunca:

CODE → inventar posteriormente la SPEC

No implementar una feature sustancial si no existe una SPEC en estado Ready.

---

# 4. CREAR LA ESTRUCTURA DOCUMENTAL DE IMPLEMENTACIÓN

Integra la nueva estructura DENTRO de la raíz documental ya existente.

No reorganices ni renombres los documentos actuales salvo necesidad real.

Añade como mínimo:

project/
development/
specs/
changes/
implementation/
operations/
validation/
tfm/

La estructura esperada conceptualmente es:

<documentation-root>/
│
├── project/
│   └── design-baseline.md
│
├── development/
│   ├── spec-driven-development.md
│   └── definition-of-done.md
│
├── specs/
│   ├── README.md
│   ├── SPEC-TEMPLATE.md
│   └── spec-register.md
│
├── changes/
│   ├── README.md
│   └── CHANGE-REQUEST-TEMPLATE.md
│
├── implementation/
│   ├── status.md
│   └── deviations.md
│
├── operations/
│   └── README.md
│
├── validation/
│   └── README.md
│
└── tfm/
    ├── README.md
    ├── evidence-register.md
    ├── methodology-log.md
    ├── ai-assisted-development-log.md
    ├── milestone-register.md
    └── metrics-register.md

Además crea en la raíz documental:

IMPLEMENTATION-GUIDE.md

No generes documentación vacía por rellenar.

Los README de `operations/`, `validation/` y `tfm/` deben explicar claramente qué se documentará ahí cuando llegue la fase correspondiente.

---

# 5. DESIGN BASELINE

Crea:

`project/design-baseline.md`

Debe definir formalmente la baseline que gobierna la implementación.

Debe incluir:

- propósito;
- versión inicial: Design Baseline v1.0;
- fecha;
- estado;
- documentos normativos incluidos;
- requisitos;
- MoSCoW;
- producto;
- UX;
- dominio;
- reglas;
- estados;
- autorización;
- identidad;
- modelo de datos;
- OpenAPI;
- seguridad;
- testing;
- IA;
- roadmap;
- decisiones explícitamente diferidas;
- reglas para modificar la baseline.

NO inventes que una decisión está cerrada si los documentos dicen lo contrario.

Distingue:

### Baseline blocker
Impide empezar una implementación relacionada.

### Known deferred decision
Puede permanecer abierta sin bloquear los primeros slices.

La baseline debe establecer:

> Una implementación no puede contradecir silenciosamente la documentación baseline.

Si durante implementación se requiere un cambio, debe utilizarse Change Control.

No hagas Git tag automáticamente.

Indica al final una recomendación de tag futuro, por ejemplo:

`design-baseline-v1.0`

pero no lo crees.

---

# 6. IMPLEMENTATION-GUIDE.md

Este debe ser el DOCUMENTO PRINCIPAL DE ORIENTACIÓN para cualquier desarrollador o agente que empiece a implementar Synqo.

No debe repetir toda la documentación.

Debe funcionar como mapa operacional.

Incluye al menos:

## Estado del proyecto

Explica que:

- análisis está cerrado;
- diseño está cerrado suficientemente para comenzar implementación;
- implementación debe seguir la baseline.

## Metodología

Explica:

- Waterfall macro;
- Spec-First SDD micro;
- gestión de cambios;
- verificación;
- evidencia para TFM.

## Fuentes de verdad

Indica qué documento consultar según la pregunta.

Ejemplo conceptual:

Producto / alcance
→ PRD / scope

Regla de negocio
→ business rules

Prioridad
→ MoSCoW

Dominio
→ domain design + invariants

API
→ OpenAPI

Persistencia
→ data model

Seguridad
→ threat model + authorization

UI
→ design docs

IA
→ ai technical design

Tests
→ test plan

Orden de implementación
→ implementation roadmap / vertical slices

No obligues a leer todos los documentos para toda tarea.

## Tipos de trabajo

Distingue:

1. New feature / substantial behavior
2. Small change / bug fix
3. Baseline-changing request
4. Documentation-only change

Indica qué skill debe utilizarse en cada caso.

## Flujo SDD

Describe el workflow completo.

## Flujo de small change

Describe un workflow simplificado.

## Change Control

Explica cuándo es obligatorio.

## Definition of Done

Referencia al documento correspondiente.

## Evidencia TFM

Explica que:

- decisiones relevantes no deben quedar solo en chats o terminal;
- trabajo significativo debe dejar evidencia estructurada;
- no deben guardarse logs completos de Codex ni conversaciones enteras;
- Git sigue siendo fuente de verdad de cambios de código;
- los registros TFM solo indexan y contextualizan evidencia significativa.

## Git

Define:

- cambios pequeños y coherentes;
- commits con propósito claro;
- no reescribir historia;
- no force push;
- no `git reset --hard` ni `git clean -fd` automáticamente;
- revisar diff antes de terminar;
- no mezclar cambios no relacionados.

## Documentation sync

Define qué documentación debe revisarse según el tipo de cambio.

## Próximo paso recomendado

Debe terminar indicando:

1. seleccionar primer slice;
2. crear primera SPEC mediante `$synqo-spec-authoring`;
3. revisarla;
4. implementarla mediante `$synqo-sdd-implementation`.

---

# 7. DOCUMENTO SDD

Crea:

`development/spec-driven-development.md`

Debe establecer formalmente el proceso Spec-First de Synqo.

Incluye:

## Principios

- La SPEC gobierna la implementación.
- Las SPEC referencian requisitos existentes, no los duplican.
- La SPEC no sustituye al PRD, dominio, OpenAPI u otros documentos fuente.
- No introducir requisitos nuevos silenciosamente.
- No ampliar alcance durante implementación.
- La IA genera o propone código; el desarrollador sigue siendo responsable de validarlo.
- Ninguna conversación con IA sustituye a la documentación de una decisión relevante.

## Lifecycle de una SPEC

Usa:

Planned
→ Draft
→ Ready
→ In Progress
→ Implemented
→ Verified

Permite también:

Superseded

Define claramente qué significa cada estado.

Especialmente:

### Ready
La SPEC contiene información suficiente para implementar.

### Verified
La implementación y las validaciones requeridas han pasado y la documentación está sincronizada.

## Workflow

Describe:

1. Select scope.
2. Trace requirements.
3. Draft spec.
4. Resolve ambiguities.
5. Mark Ready.
6. Implement.
7. Verify.
8. Update docs.
9. Preserve TFM evidence when relevant.
10. Mark Verified.

## Stop conditions

Codex debe detener implementación si:

- la SPEC contradice baseline;
- falta una decisión de producto necesaria;
- requiere cambiar un Must requirement;
- implica un cambio importante de dominio;
- cambia contrato API no contemplado;
- afecta autorización/seguridad de forma no diseñada;
- exige modificar la baseline.

En esos casos:

→ usar Change Control.

---

# 8. SPEC TEMPLATE

Crea:

`specs/SPEC-TEMPLATE.md`

La template debe ser práctica, no burocrática.

Debe incluir:

# SPEC-XXX — Title

## Metadata
- Status
- MoSCoW
- Owner
- Created
- Last updated

## Goal

## Scope

## Non-goals

## Related requirements
RF-...

## Related user stories
HU-...

## Related flows / screens

## Product and domain rules

Solo referencias + reglas específicas necesarias.

## Preconditions

## Functional behaviour

## Authorization

## API contract

Referenciar OpenAPI siempre que sea posible.

## Data / persistence

## UI behaviour

Cuando aplique.

## Errors and edge cases

## Security / privacy considerations

Cuando aplique.

## Acceptance criteria

Preferentemente Given / When / Then.

## Required tests

### Unit
### Integration
### UI/component
### E2E

Solo los que realmente correspondan.

## Documentation impact

## Implementation constraints

## Out of scope

## Traceability

- Requirements:
- User stories:
- Baseline:
- Change Request:
- ADR:
- Implementation commit:
- Verification evidence:

Los campos pueden ser `N/A` o `pending`.

## Implementation outcome

A completar al finalizar:

- Implemented as specified: Yes / No
- Deviations:
- Verification:
- Notes for TFM:

`Notes for TFM` debe contener únicamente observaciones realmente relevantes, no una narración del desarrollo.

## Definition of Done

Debe referenciar el DoD global y añadir únicamente condiciones específicas.

Evita copiar páginas enteras de otras specs.

Usa enlaces relativos.

---

# 9. SPEC REGISTER

Crea:

`specs/spec-register.md`

NO redactes todavía todas las SPEC.

Utiliza:

- implementation-roadmap.md
- vertical-slices.md
- MoSCoW
- trazabilidad

para proponer un registro inicial.

Columnas:

| ID | Title | Slice | Priority | Status | Depends on | Requirements |

Asigna IDs estables `SPEC-001`, `SPEC-002`, etc.

Todos deben comenzar como:

`Planned`

salvo que ya exista una spec equivalente.

El register debe establecer un orden inicial derivado de:

1. dependencias;
2. Must antes que Should/Could;
3. vertical slices;
4. riesgo técnico.

No cambies el roadmap existente.

El register es una traducción del roadmap a unidades SDD.

---

# 10. DEFINITION OF DONE

Crea:

`development/definition-of-done.md`

Debe ser común a todas las implementaciones.

Incluye como mínimo:

- SPEC válida cuando corresponde.
- Requisitos implementados.
- Criterios de aceptación satisfechos.
- Invariantes preservadas.
- Autorización server-side comprobada.
- Tests apropiados implementados.
- Tests existentes siguen pasando.
- Typecheck pasa.
- Lint pasa.
- Build pasa cuando exista.
- OpenAPI sincronizado cuando aplique.
- Migraciones cuando aplique.
- Seguridad revisada cuando aplique.
- Accesibilidad revisada para UI.
- No secretos introducidos.
- No TODO críticos sin registrar.
- Documentación afectada actualizada.
- Diff revisado.
- SPEC actualizada.
- Evidencia TFM registrada si el cambio es significativo.
- Verificación final realizada.

No inventes comandos que todavía no existan.

Cuando el proyecto tenga scripts reales, este documento deberá actualizarse con los comandos exactos.

---

# 11. CHANGE CONTROL

Crea:

`changes/README.md`

y:

`changes/CHANGE-REQUEST-TEMPLATE.md`

Usar Change Request cuando una implementación requiera modificar:

- objetivo de producto;
- alcance;
- RF;
- RNF crítico;
- Must de MoSCoW;
- regla de negocio;
- invariante;
- lifecycle;
- autorización;
- identidad;
- privacidad;
- contrato API público;
- estructura de datos relevante;
- ADR aceptado;
- seguridad;
- comportamiento IA especificado.

Formato:

CR-XXX — Title

## Status

Proposed / Accepted / Rejected / Implemented

## Problem

## Current baseline

## Proposed change

## Reason

## Impact

### Product
### Requirements
### UX
### Domain
### API
### Data
### Security
### Testing
### Documentation

## Alternatives

## Decision

## Affected files

## Related SPECs

## Related commits / PRs

## Baseline version before

## Baseline version after

## TFM relevance

## Migration / compatibility

cuando aplique.

Una CR aceptada debe actualizar los documentos fuente ANTES o junto a la implementación.

No utilizar Change Request para:

- typo;
- refactor interno sin cambio de comportamiento;
- corrección de bug que restaura el comportamiento ya especificado.

---

# 12. IMPLEMENTATION STATUS

Crea:

`implementation/status.md`

Debe funcionar como memoria de implementación viva.

Inicialmente:

Phase: Implementation preparation
Active SPEC: none
Last verified SPEC: none
Blocking issues: ...
Next recommended action: ...

Debe incluir secciones:

- Current phase
- Active work
- Completed specs
- Next specs
- Known blockers
- Accepted deviations
- Last validation
- Environment status

No debe sustituir Git ni el spec-register.

---

# 13. DEVIATIONS

Crea:

`implementation/deviations.md`

Formato:

| ID | SPEC | Designed | Implemented | Reason | Accepted | Docs affected |

Utilízalo cuando:

la implementación necesite diferir de una decisión de diseño por un motivo técnico menor que NO cambia el producto.

Si cambia baseline:

→ Change Request, no deviation.

---

# 14. OPERATIONS Y VALIDATION

Crea únicamente README orientativos.

## operations/README.md

Explica que durante Deployment contendrá, como mínimo:

- deployment.md
- runbook.md
- backup-and-restore.md

NO inventes todavía procedimientos que no existen.

## validation/README.md

Explica que durante Verification/Validation contendrá evidencia final:

- requirements-coverage.md
- validation-report.md
- security-validation.md
- accessibility-validation.md
- usability-results.md
- ai-evaluation-report.md
- as-built comparison cuando corresponda.

No generes resultados ficticios.

---

# 15. TFM EVIDENCE AND TRACEABILITY

Este repositorio debe conservar evidencia suficiente para reconstruir posteriormente el proceso seguido en la memoria del TFM.

El objetivo NO es almacenar logs completos, chats, prompts enteros ni duplicar Git.

El objetivo es conservar evidencia estructurada, ligera y trazable.

Crea:

tfm/
├── README.md
├── evidence-register.md
├── methodology-log.md
├── ai-assisted-development-log.md
├── milestone-register.md
└── metrics-register.md

---

## tfm/README.md

Explica el propósito de esta carpeta:

- servir como fuente para redactar posteriormente la memoria;
- conservar decisiones, hitos, validaciones y evidencia;
- NO sustituir Git, SPECs, ADRs, Change Requests ni informes de testing;
- referenciar esos artefactos en vez de duplicarlos;
- permitir reconstruir cronológicamente el proyecto;
- permitir analizar el uso de IA durante desarrollo;
- separar evidencia objetiva de interpretación posterior.

Debe indicar que los documentos finales de la memoria se generarán más adelante a partir de estas evidencias.

Debe incluir una regla:

> No dejar decisiones relevantes únicamente en conversaciones con IA o sesiones de terminal.

Cuando una conversación cambie producto, arquitectura, baseline o comportamiento relevante, el resultado debe quedar registrado en el artefacto adecuado.

---

## tfm/evidence-register.md

Debe ser un índice central de evidencias.

Formato recomendado:

| ID | Fecha | Tipo | Artefacto | Relacionado con | Evidencia | Observaciones |
|----|-------|------|-----------|-----------------|-----------|---------------|

Tipos posibles:

- REQUIREMENT
- DESIGN
- DECISION
- SPEC
- IMPLEMENTATION
- TEST
- SECURITY
- UX
- AI
- DEPLOYMENT
- CHANGE
- METRIC

Ejemplos futuros de evidencia:

- SPEC-003
- ADR-021
- CR-002
- commit SHA
- PR
- test report
- screenshot
- evaluation report
- deployment
- benchmark

NO crear evidencias ficticias.

Inicialmente registra únicamente artefactos ya existentes que tengan valor claro para reconstruir el proyecto.

---

## tfm/methodology-log.md

Debe permitir explicar posteriormente cómo se aplicó la metodología realmente.

Registrar hitos, no actividad diaria.

Formato:

| Fecha | Fase | Evento | Método aplicado | Resultado |
|-------|------|--------|-----------------|-----------|

Ejemplos futuros:

- Requirements baseline aprobada
- Design Baseline v1.0 aprobada
- inicio de Implementation
- SPEC-001 Ready
- primer vertical slice Verified
- inicio Verification
- primera release desplegada

Debe permitir demostrar posteriormente la combinación:

Waterfall macro
+
Spec-First SDD micro
+
Change Control
+
Verification

No usarlo como diario personal.

---

## tfm/ai-assisted-development-log.md

Este artefacto es especialmente importante porque el TFM trata sobre desarrollo de software con IA.

NO almacenar conversaciones completas con Codex.

Registrar solamente usos relevantes de IA.

Formato:

| ID | Fecha | Herramienta | Actividad | Artefacto | Intervención humana | Resultado |
|----|-------|-------------|-----------|-----------|---------------------|-----------|

Campos:

### Herramienta

Ejemplo:
Codex

No fijar modelo si no puede conocerse de forma fiable.

### Actividad

Ejemplos:

- generación de SPEC
- implementación
- generación de tests
- refactor
- revisión
- documentación
- análisis de error
- propuesta de arquitectura
- debugging

### Artefacto

SPEC / commit / PR / documento relacionado.

### Intervención humana

Resumen breve:

- revisado sin cambios;
- corregida decisión X;
- rechazado enfoque Y;
- solicitado cambio Z;
- corregido error de interpretación;
- limitada ampliación de alcance.

### Resultado

Accepted / Modified / Rejected.

El propósito es poder analizar posteriormente:

- qué tareas fueron asistidas por IA;
- dónde fue necesaria revisión humana;
- qué tipo de errores o desviaciones aparecieron;
- qué aportó realmente la IA al proceso;
- qué tipos de tarea funcionaron mejor con asistencia IA.

NO registrar secretos, código sensible ni prompts completos.

---

## tfm/milestone-register.md

Registrar únicamente hitos significativos.

Formato:

| ID | Hito | Fecha | Estado | Evidencia |
|----|------|-------|--------|-----------|

Preparar inicialmente:

M-01 Requirements baseline
M-02 Design baseline
M-03 Implementation started
M-04 First vertical slice
M-05 Core MVP complete
M-06 AI feature complete
M-07 Verification complete
M-08 Deployment
M-09 Final evaluation

Solo marcar como completados los que realmente lo estén.

---

## tfm/metrics-register.md

Preparar el lugar donde ir acumulando métricas utilizadas posteriormente en la memoria.

NO inventar valores.

Posibles métricas:

### Desarrollo

- número de SPEC;
- SPEC Verified / total;
- Change Requests;
- desviaciones;
- bugs encontrados;
- lead time por SPEC cuando pueda medirse;
- cobertura de tests cuando exista.

### Calidad

- unit/integration/E2E tests;
- build failures;
- defects encontrados durante verification;
- requisitos Must implementados;
- requisitos Should implementados.

### IA de desarrollo

- tareas asistidas por IA;
- resultados Accepted / Modified / Rejected;
- incidencias atribuibles a generación IA cuando puedan identificarse;
- tipos de tareas asistidas.

### IA de producto

- schema-valid rate;
- exact match;
- field accuracy;
- clarification detection;
- unsupported detection;
- latency;
- token usage;
- cost.

No medir por medir.

Usar solo métricas que tengan sentido y para las que exista una fuente objetiva.

---

# 16. CREAR SKILLS LOCALES DE CODEX

Crea skills DE REPOSITORIO bajo:

`.agents/skills/`

No uses skills globales del usuario para reglas específicas de Synqo.

Cada skill debe vivir en su propia carpeta y tener:

`SKILL.md`

con frontmatter:

---
name: ...
description: ...
---

Las descriptions deben indicar claramente:

- qué hace;
- cuándo debe utilizarse.

Mantén cada SKILL.md relativamente conciso.

No copies toda la documentación del proyecto dentro de la skill.

La skill debe indicar QUÉ documentos leer según el trabajo.

Crea exactamente estas skills:

1. synqo-spec-authoring
2. synqo-sdd-implementation
3. synqo-small-change
4. synqo-change-control
5. synqo-verification

---

# 17. SKILL — synqo-spec-authoring

Ruta:

`.agents/skills/synqo-spec-authoring/SKILL.md`

Propósito:

Preparar una SPEC implementable a partir de:

- spec-register;
- roadmap;
- requisitos;
- historias;
- reglas;
- diseño;
- contratos técnicos.

Debe utilizarse cuando:

- se va a empezar una nueva feature;
- se va a implementar un nuevo vertical slice;
- existe trabajo sustancial que todavía no tiene SPEC Ready.

Workflow:

1. Identificar SPEC en spec-register.
2. Leer únicamente documentos relevantes.
3. Recuperar RF/HU/MoSCoW.
4. Recuperar reglas de dominio.
5. Recuperar authorization.
6. Recuperar OpenAPI/data/UI relevantes.
7. Redactar SPEC desde SPEC-TEMPLATE.
8. Detectar contradicciones/ambigüedades.
9. No inventar decisiones.
10. Si bloqueada, dejar SPEC Draft y explicar blocker.
11. Si suficientemente definida, marcar Ready.
12. Actualizar spec-register.
13. Actualizar implementation/status.md.
14. Añadir entrada mínima a tfm/evidence-register.md.
15. Registrar uso relevante de IA en tfm/ai-assisted-development-log.md.
16. Si constituye un hito relevante, actualizar methodology-log.md.

MUY IMPORTANTE:

Esta skill NO implementa código de aplicación.

Debe detenerse al conseguir una SPEC Ready.

---

# 18. SKILL — synqo-sdd-implementation

Ruta:

`.agents/skills/synqo-sdd-implementation/SKILL.md`

Propósito:

Implementar una SPEC Ready siguiendo Spec-First.

Solo debe utilizarse si existe una SPEC en estado Ready.

Workflow mínimo:

1. Leer AGENTS.md.
2. Leer SPEC completa.
3. Leer únicamente documentos enlazados por la SPEC necesarios para la tarea.
4. Comprobar que sigue siendo coherente con baseline.
5. Cambiar SPEC a In Progress.
6. Inspeccionar código existente.
7. Crear/ajustar tests según criterios de aceptación.
8. Implementar el cambio mínimo suficiente.
9. No ampliar alcance.
10. Ejecutar verificaciones aplicables.
11. Corregir fallos antes de continuar.
12. Revisar documentación impactada.
13. Actualizar SPEC a Implemented.
14. Invocar `$synqo-verification`.
15. Solo tras verificación satisfactoria marcar SPEC Verified.
16. Actualizar spec-register.
17. Actualizar implementation/status.md.
18. Registrar evidencia objetiva en tfm/evidence-register.md.
19. Registrar uso relevante de Codex en tfm/ai-assisted-development-log.md.
20. Actualizar métricas únicamente si existe un dato objetivo.
21. Actualizar milestone-register si se ha alcanzado un hito.

NO inventar SHA si todavía no existe commit.

Si el commit se realiza después de la ejecución de la skill, permitir:

`pending commit reference`

y completarlo posteriormente.

Si descubre que la SPEC requiere cambiar baseline:

DETENER.

Invocar / recomendar:

`$synqo-change-control`

No modificar silenciosamente la baseline.

---

# 19. SKILL — synqo-small-change

Ruta:

`.agents/skills/synqo-small-change/SKILL.md`

Propósito:

Resolver:

- bug fixes;
- pequeños ajustes visuales;
- correcciones de texto;
- refactors locales;
- mejoras pequeñas;
- mantenimiento;
- cambios técnicos reversibles;

cuando NO justifican una nueva SPEC completa.

Workflow:

1. Entender el comportamiento esperado existente.
2. Localizar requisito/spec/documento relevante solo si es necesario.
3. Reproducir el problema cuando sea posible.
4. Añadir test de regresión si tiene valor.
5. Realizar el cambio mínimo.
6. Ejecutar tests/verificaciones afectadas.
7. Revisar impacto documental.
8. Actualizar documentación SOLO si el comportamiento, contrato o instrucciones han cambiado.
9. Invocar `$synqo-verification`.
10. Registrar evidencia TFM SOLO si el cambio es significativo.

NO crear una SPEC innecesaria para:

- typo;
- CSS menor;
- refactor;
- bug que restaura comportamiento ya especificado.

NO generar evidencia TFM para cambios triviales.

Registrar únicamente cuando el cambio sea relevante para:

- un requisito;
- un bug significativo;
- una decisión técnica;
- una observación útil sobre desarrollo asistido por IA.

PERO:

si el supuesto “fix” cambia comportamiento esperado, reglas, API, datos, permisos, alcance o baseline:

DETENER.

Usar:

`$synqo-change-control`

y posiblemente después:

`$synqo-spec-authoring`.

---

# 20. SKILL — synqo-change-control

Ruta:

`.agents/skills/synqo-change-control/SKILL.md`

Propósito:

Gestionar cambios que afectan la Design Baseline.

Workflow:

1. Detectar documentos afectados.
2. Crear CR desde template.
3. Documentar estado actual.
4. Describir cambio.
5. Analizar impacto.
6. Identificar RF/HU/UX/domain/API/data/security/tests afectados.
7. Proponer alternativas.
8. NO implementar mientras CR permanezca Proposed.
9. Si el usuario/propietario acepta:
   - marcar Accepted;
   - actualizar documentos baseline;
   - actualizar trazabilidad;
   - actualizar spec-register si aplica;
   - crear/actualizar SPEC;
   - registrar necesidad de ADR si es arquitectónica;
   - registrar CR en tfm/evidence-register.md;
   - actualizar methodology-log.md si altera baseline;
   - registrar decisión humana relevante en ai-assisted-development-log.md cuando la IA haya participado en el análisis.
10. No crear ADR para decisiones locales o puramente funcionales.

La skill debe dejar explícito cuándo necesita una decisión humana.

---

# 21. SKILL — synqo-verification

Ruta:

`.agents/skills/synqo-verification/SKILL.md`

Propósito:

Realizar la verificación final obligatoria de cualquier cambio de código, tests, build, datos o comportamiento.

Workflow:

1. Revisar `git diff`.
2. Confirmar alcance.
3. Detectar cambios accidentales.
4. Ejecutar las verificaciones disponibles y relevantes:
   - format
   - lint
   - typecheck
   - unit tests
   - integration tests
   - UI tests
   - E2E
   - build
   según corresponda.
5. No inventar comandos: descubrir scripts reales del repo.
6. Si una validación falla:
   - corregir;
   - volver a ejecutar.
7. Comprobar autorización/seguridad si el cambio toca esa superficie.
8. Comprobar OpenAPI/data model/migrations cuando aplique.
9. Comprobar documentación.
10. Comprobar SPEC/CR/deviation si aplica.
11. Revisar `git diff` final.
12. Registrar evidencia objetiva de las validaciones relevantes.
13. Actualizar tfm/evidence-register.md cuando corresponda.
14. No copiar logs completos.
15. Registrar:
   - comando o suite;
   - resultado;
   - fecha;
   - artefacto relacionado.
16. Si existe salida persistente de CI, enlazarla o referenciarla.
17. Mostrar evidencia resumida.

No declarar “done” con tests relevantes fallando.

---

# 22. AGENTS.md DEL REPOSITORIO

Es MUY IMPORTANTE que exista un `AGENTS.md` aplicable desde la raíz del repositorio.

Inspecciona los AGENTS.md existentes.

Si el único AGENTS.md está dentro de la carpeta de documentación y por tanto no gobierna todo el futuro código:

crea un `AGENTS.md` en la raíz Git.

No borres información útil del existente.

Distribuye responsabilidades:

## Root AGENTS.md
Reglas globales del repositorio.

## Documentation-local AGENTS.md
Solo reglas específicas de edición documental, si aportan valor.

El AGENTS raíz debe ser BREVE.

Debe incluir:

# Project

Resumen muy corto de Synqo y stack aprobado.

# Sources of truth

Referenciar:

- documentation root;
- IMPLEMENTATION-GUIDE.md;
- design-baseline.md.

# Mandatory skill routing

Incluye reglas explícitas:

- New feature or substantial behavior:
  use `$synqo-spec-authoring` first.
  Once SPEC is Ready, use `$synqo-sdd-implementation`.

- Bug fix, small adjustment or local refactor:
  use `$synqo-small-change`.

- Any requested change that affects baseline:
  use `$synqo-change-control` before implementation.

- Any code/test/build/data behavior change:
  use `$synqo-verification` before declaring completion.

# Core rules

- Do not invent product decisions.
- Do not silently change requirements.
- Do not bypass server-side authorization.
- Do not implement Won't requirements.
- Prefer KISS/YAGNI.
- Do not introduce architectural complexity without documented need.
- Keep changes scoped.
- Update documentation when contracts/behavior change.
- Preserve backward compatibility unless spec/change request says otherwise.
- Never expose secrets.
- Review diff before finishing.
- Preserve TFM evidence for significant work following repository evidence rules.
- Do not log trivial activity.
- Do not duplicate Git history.
- Do not leave significant decisions only in chats or terminal sessions.

# Git safety

- no force push;
- no history rewrite;
- no reset --hard automatically;
- no clean -fd automatically;
- do not discard unrelated user changes.

NO pongas en AGENTS.md largas listas de documentos que siempre haya que leer.

Las skills deben cargar contexto específico bajo demanda.

---

# 23. REGISTRO DE DECISIONES HUMANAS

Cuando Codex encuentre una decisión que requiera intervención humana y el usuario elija una alternativa, la decisión relevante debe quedar en el artefacto adecuado:

- Product decision → product decision register
- Architecture decision → ADR
- Baseline modification → Change Request
- Implementation-only deviation → deviations.md
- SPEC-specific clarification → SPEC

No dejar decisiones significativas únicamente en el chat o terminal.

Cuando la IA participe de forma relevante en el análisis:

registrar el resultado en:

`tfm/ai-assisted-development-log.md`

sin almacenar la conversación completa.

---

# 24. EVIDENCIA GIT

Git sigue siendo la fuente de verdad temporal para cambios de código.

NO duplicar el diff en Markdown.

Cuando exista commit, utilizar SHA o enlace al PR como evidencia.

Recomendar que commits relacionados con trabajo estructurado incluyan referencias como:

SPEC-004
CR-002
ADR-021

cuando corresponda.

No exigir identificadores en commits triviales.

No inventar SHA ni PR inexistentes.

---

# 25. REVISAR ADR-020

Revisa:

`architecture/adr/ADR-020-development-process.md`

Existe una decisión previa sobre proceso de desarrollo.

No la reemplaces sin analizarla.

Actualízala o extiéndela si es necesario para reflejar:

- Waterfall macro;
- Spec-First SDD durante implementation;
- control de cambios;
- Git/PR approach ya aprobado;
- verificación;
- conservación de evidencia para TFM como consecuencia operativa, no como decisión arquitectónica principal.

Preserva el historial y las decisiones compatibles existentes.

Si el formato ADR requiere cambio de estado/fecha, hazlo correctamente.

No abras un ADR nuevo si ADR-020 puede representar coherentemente la decisión.

---

# 26. ACTUALIZAR README / WORKPLAN

Actualiza la documentación principal para que el punto de entrada quede claro.

README debe enlazar al menos:

- PRD
- WORKPLAN histórico de diseño
- IMPLEMENTATION-GUIDE
- design-baseline
- spec-register
- tfm/README.md

No reescribas el README entero si no hace falta.

WORKPLAN:

No renumeres las 28 fases ya realizadas.

Añade una sección final indicando:

Design phase completed.

Implementation governed by:

- IMPLEMENTATION-GUIDE.md
- specs/spec-register.md
- implementation/status.md
- tfm/evidence-register.md

El WORKPLAN de diseño deja de ser el backlog activo de implementación.

---

# 27. DOCUMENTATION STATUS

Si existe DOCUMENTATION-STATUS.md:

actualízalo para mostrar claramente:

Analysis: complete
Product design: complete
Technical design: complete
Implementation preparation: complete tras esta tarea
Implementation: not started
Verification: not started
Deployment: not started
TFM evidence collection: active

Respeta cualquier matiz real encontrado en la documentación.

---

# 28. FUTURA MEMORIA DEL TFM

`tfm/README.md` debe indicar que, al finalizar el proyecto, estas evidencias servirán para generar al menos:

- metodología aplicada;
- evolución del proyecto;
- decisiones de diseño;
- implementación;
- uso de IA durante el desarrollo;
- validación;
- evaluación de la funcionalidad IA;
- desviaciones respecto al diseño inicial;
- resultados;
- limitaciones;
- trabajo futuro;
- comparación entre diseño y sistema realmente construido.

NO generar ahora esos capítulos finales.

NO redactar la memoria del TFM en esta tarea.

---

# 29. EVITAR SOBRE-DOCUMENTACIÓN

Esta tarea NO debe crear:

- una SPEC por cada requisito;
- un documento por cada clase;
- diagramas de clases exhaustivos;
- documentación duplicada;
- procedimientos operativos ficticios;
- comandos inexistentes;
- resultados de testing inexistentes;
- métricas inventadas;
- evidencias ficticias;
- registros de cada interacción con Codex;
- logs completos de terminal;
- chats completos.

Las nuevas piezas deben actuar como:

- workflow;
- plantilla;
- índice;
- control;
- memoria viva;
- evidencia estructurada.

El código seguirá siendo la fuente de verdad de detalles de implementación locales.

Git seguirá siendo la fuente de verdad de cambios de código.

---

# 30. AUDITORÍA FINAL

Antes de terminar:

1. Revisa todos los archivos creados.
2. Revisa todos los archivos modificados.
3. Comprueba enlaces relativos.
4. Comprueba que skills no duplican AGENTS.
5. Comprueba que AGENTS no sobrecarga contexto.
6. Comprueba que `synqo-sdd-implementation` NO permite implementar sin SPEC Ready.
7. Comprueba que `synqo-small-change` no obliga a crear SPEC para trivialidades.
8. Comprueba que cambio de baseline deriva a Change Control.
9. Comprueba que Verification es obligatoria antes de terminar cambios de código.
10. Comprueba que trabajo significativo deja evidencia TFM.
11. Comprueba que trabajo trivial NO genera ruido en TFM.
12. Comprueba que no se almacenan conversaciones completas de IA.
13. Comprueba coherencia con ADR-020.
14. Comprueba coherencia con MoSCoW.
15. Comprueba coherencia con implementation roadmap.
16. Comprueba que SPEC-TEMPLATE contiene Traceability.
17. Comprueba que CHANGE-REQUEST-TEMPLATE contiene campos de baseline y TFM relevance.
18. Comprueba que milestone-register no marca hitos no alcanzados.
19. Comprueba que metrics-register no contiene valores inventados.
20. Ejecuta `git status`.
21. Ejecuta `git diff --stat`.
22. Revisa `git diff`.

No hagas commit automáticamente durante esta tarea salvo que mis instrucciones globales del repositorio exijan explícitamente hacerlo.

---

# 31. SALIDA FINAL

Al terminar responde con:

## Operativa creada

Resumen.

## Estructura nueva

Tree únicamente de los archivos/carpetas creados.

## Skills

Tabla:

| Skill | Cuándo se usa | Resultado |

## AGENTS routing

Resume las reglas de selección.

## Metodología

Explica en 5-10 líneas cómo queda:

Waterfall macro
+
Spec-First SDD micro
+
Change Control
+
Verification
+
TFM Evidence Collection

## Baseline

Indica:

- qué entra en Design Baseline v1.0;
- blockers si existen;
- decisiones diferidas no bloqueantes.

## Evidencia TFM

Indica:

- qué registros se han creado;
- qué tipo de información guardará cada uno;
- qué información deliberadamente NO se guardará;
- cómo se relacionará con Git, SPEC, ADR y CR.

## Próximo paso

Indica exactamente cuál debería ser la primera SPEC a preparar según:

- vertical-slices;
- dependencies;
- MoSCoW;
- roadmap.

NO la implementes.

## Archivos modificados

Lista.

## Git

Resumen de:

- git status
- git diff --stat

Empieza ahora inspeccionando el repositorio y leyendo los AGENTS.md existentes.