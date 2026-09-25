# Synqo Implementation Guide

## Estado del proyecto

El análisis está cerrado y el diseño está suficientemente cerrado para comenzar la implementación. La implementación debe trabajar contra [`project/design-baseline.md`](project/design-baseline.md), no reinterpretar Synqo desde cero. El código de aplicación aún no se ha iniciado.

## Metodología

El proyecto usa Waterfall a nivel macro: Requirements/Analysis -> Design -> Design Baseline -> Implementation -> Verification & Validation -> Deployment -> TFM Evaluation / As-Built Documentation. Waterfall no significa esperar al final para probar: dentro de Implementation se entregan unidades pequeñas y verificables.

A nivel micro se usa Spec-First SDD: `Specification -> Review/Ready -> Acceptance criteria + tests -> Implementation -> automated verification -> human review -> documentation sync -> Verified`. Los cambios sobre la baseline pasan por Change Control y el trabajo significativo deja evidencia TFM estructurada.

## Fuentes de verdad

| Pregunta | Fuente |
|---|---|
| Producto y alcance | [`PRD.md`](PRD.md), [`product/02-scope-and-mvp.md`](product/02-scope-and-mvp.md) |
| Requisito | [`product/09-functional-requirements.md`](product/09-functional-requirements.md), [`product/10-non-functional-requirements.md`](product/10-non-functional-requirements.md) |
| Prioridad | [`product/09b-requirements-prioritization.md`](product/09b-requirements-prioritization.md) |
| Regla de negocio | [`product/07-business-rules.md`](product/07-business-rules.md) |
| Dominio e invariantes | [`technical-design/13-domain/domain-design.md`](technical-design/13-domain/domain-design.md), [`technical-design/13-domain/domain-invariants.md`](technical-design/13-domain/domain-invariants.md) |
| Estados | [`product/08-lifecycles.md`](product/08-lifecycles.md), [`technical-design/14-state-machines/state-machines.md`](technical-design/14-state-machines/state-machines.md) |
| Autorización e identidad | [`technical-design/15-authorization/authorization-rules.md`](technical-design/15-authorization/authorization-rules.md), [`technical-design/16-identity-sessions/identity-and-session-design.md`](technical-design/16-identity-sessions/identity-and-session-design.md) |
| Persistencia | [`technical-design/17-data-model/data-model.md`](technical-design/17-data-model/data-model.md) |
| API | [`technical-design/18-api/openapi.yaml`](technical-design/18-api/openapi.yaml), [`technical-design/18-api/api-design.md`](technical-design/18-api/api-design.md) |
| UX/UI | [`product/13-information-architecture.md`](product/13-information-architecture.md), [`product/14-user-flows.md`](product/14-user-flows.md), [`product/15-screen-specification.md`](product/15-screen-specification.md), [`design/`](design/) |
| Seguridad | [`security/`](security/) y autorización |
| Testing | [`quality/25-test-plan/test-plan.md`](quality/25-test-plan/test-plan.md), [`quality/25-test-plan/test-traceability.md`](quality/25-test-plan/test-traceability.md) |
| IA | [`ai/26-technical-design/ai-technical-design.md`](ai/26-technical-design/ai-technical-design.md), [`ai/27-evaluation/ai-evaluation-plan.md`](ai/27-evaluation/ai-evaluation-plan.md) |
| Orden | [`delivery/28-implementation-roadmap/implementation-roadmap.md`](delivery/28-implementation-roadmap/implementation-roadmap.md), [`delivery/28-implementation-roadmap/vertical-slices.md`](delivery/28-implementation-roadmap/vertical-slices.md), [`specs/spec-register.md`](specs/spec-register.md) |

No es necesario leer todo el repositorio para cada tarea: se cargan las fuentes relevantes según la SPEC o tipo de cambio.

## Tipos de trabajo y routing

La skill puede seleccionarse automáticamente por estas reglas, pero durante el trabajo estructurado es recomendable invocarla explícitamente. La invocación no sustituye sus condiciones de entrada.

| Situación | Primera skill | Siguiente paso | Condición de parada |
|---|---|---|---|
| Nueva feature o comportamiento sustancial | `$synqo-spec-authoring` | `$synqo-sdd-implementation` cuando la SPEC esté `Ready` | No implementar sin SPEC `Ready`. |
| Nuevo vertical slice | `$synqo-spec-authoring` | SDD implementation y Verification | Respetar dependencias y DoR del slice. |
| Bug que restaura comportamiento existente | `$synqo-small-change` | `$synqo-verification` | Si cambia comportamiento, derivar a CR. |
| Ajuste visual, typo o refactor local | `$synqo-small-change` | Verification según impacto | No crear SPEC si no aporta valor. |
| Cambio de requisito, alcance o baseline | `$synqo-change-control` | Actualizar fuentes y crear/ajustar SPEC | No implementar una CR `Proposed`. |
| Decisión abierta durante diseño o implementación | Registrar `OPEN-*` y usar `$synqo-change-control` si afecta baseline | Decisión humana y sincronización documental | Detenerse si es `Blocked`. |
| ADR arquitectónico | Documentar ADR junto al diseño técnico | Actualizar baseline/SPEC si aplica | No usar ADR para reglas locales o cada detalle. |
| Cambio de código, tests, build, datos o comportamiento | `$synqo-verification` al cierre | Registrar evidencia objetiva | No declarar done con fallos relevantes. |
| Cambio solo documental | Editar la fuente adecuada | Revisar enlaces y coherencia | CR si cambia la baseline. |

### Árbol de decisión rápido

```text
¿Cambia el comportamiento esperado?
├─ No → small change o documentación → verificar según impacto.
└─ Sí
   ¿Cambia la Design Baseline?
   ├─ Sí → Change Control → decisión humana → SPEC si aplica → implementación.
   └─ No
      ¿Es una feature o unidad sustancial?
      ├─ Sí → SPEC authoring → Ready → SDD implementation → Verification.
      └─ No → small change → Verification.
```

### Invocaciones de referencia

Para comenzar el trabajo actual:

```text
Usa $synqo-spec-authoring para preparar SPEC-001 — Bootstrap del repositorio y toolchain.
No implementes código todavía. Déjala en Draft o Ready según la información disponible.
```

### Prompt recomendado para una nueva sesión

Para iniciar una sesión limpia con la primera SPEC:

```text
Lee AGENTS.md y synqo-documentation-v0.2/IMPLEMENTATION-GUIDE.md.

Quiero preparar SPEC-001 — Bootstrap del repositorio y toolchain.

Usa $synqo-spec-authoring.
No implementes código todavía.
Haz el branch preflight, revisa el spec-register y redacta la SPEC desde SPEC-TEMPLATE.
Detente cuando la SPEC esté Draft o Ready, según la información disponible.
```

Este prompt prepara y registra la SPEC, pero no crea el monorepo ni implementa la Slice 0. Si el branch preflight requiere crear o cambiar de rama, el agente debe detenerse y pedir autorización explícita.

Para continuar una SPEC aprobada:

```text
Lee AGENTS.md y synqo-documentation-v0.2/IMPLEMENTATION-GUIDE.md.

Quiero implementar SPEC-001 — Bootstrap del repositorio y toolchain.

Usa $synqo-sdd-implementation.
La SPEC está en Ready y el PR de documentación ya está integrado en main.
Haz el branch preflight antes de tocar código.
Si estás en main y necesitas crear o cambiar de rama, detente y pídeme autorización explícita.
Cuando exista una rama autorizada, cambia la SPEC a In Progress, implementa solo su alcance y crea o ajusta los tests requeridos.
No implementes funcionalidades de SPEC-002 ni posteriores.
Respeta la Design Baseline y detente si el trabajo requiere cambiarla o abrir una Change Request.
Al terminar la implementación, deja la SPEC en Implemented y detente para que se ejecute $synqo-verification.
```

Este prompt inicia la implementación de una SPEC `Ready`; no autoriza por sí mismo la creación o el cambio de rama. La rama de implementación recomendada es `feat/SPEC-001-bootstrap`.

Para cerrar la unidad:

```text
Usa $synqo-verification para verificar SPEC-001.
Revisa el diff, descubre los comandos reales y registra la evidencia objetiva.
```

Para una corrección pequeña:

```text
Usa $synqo-small-change para corregir [problema].
No crees una SPEC salvo que el comportamiento esperado cambie.
```

Para un cambio que contradice el diseño:

```text
Usa $synqo-change-control para analizar [cambio].
No implementes mientras la CR esté Proposed.
```

## Estados de una SPEC

```text
Planned → Draft → Ready → In Progress → Implemented → Verified
                         └──────────────→ Superseded
```

- `Planned`: unidad identificada en el registro.
- `Draft`: especificación en elaboración o bloqueada.
- `Ready`: implementable sin inventar decisiones.
- `In Progress`: implementación iniciada.
- `Implemented`: código terminado según revisión inicial.
- `Verified`: validaciones, revisión humana y documentación sincronizadas.
- `Superseded`: reemplazada, conservando la relación y el motivo.

Una SPEC puede volver a `Draft` si aparece una ambigüedad. No se salta de `Planned` directamente a código.

## Flujo SDD

1. Seleccionar una unidad `Planned` del [`spec-register.md`](specs/spec-register.md), respetando dependencias, prioridad y riesgo.
2. Invocar `$synqo-spec-authoring`.
3. Trazar requisitos, historias, flows, diseño, autorización, datos, API y tests relevantes.
4. Redactar la SPEC y resolver ambigüedades con el propietario.
5. Marcar `Ready` solo cuando sea implementable.
6. Invocar `$synqo-sdd-implementation`.
7. Marcar `In Progress`, crear/ajustar tests e implementar el mínimo suficiente.
8. Revisar contratos, autorización, seguridad, datos y documentación.
9. Marcar `Implemented` y ejecutar `$synqo-verification`.
10. Registrar evidencia objetiva, actualizar el registro y marcar `Verified` solo cuando todo sea satisfactorio.

No implementar una feature sustancial sin SPEC `Ready`. Si la SPEC contradice la baseline, necesita una decisión de producto, cambia un `Must`, dominio, API, autorización o seguridad diseñada, se detiene el trabajo y se abre una CR.

## Flujo de small change

1. Entender y reproducir el comportamiento.
2. Localizar la fuente relevante y añadir regresión si aporta valor.
3. Realizar el cambio mínimo.
4. Ejecutar verificaciones afectadas.
5. Revisar documentación y pasar por `$synqo-verification`.

No crear una SPEC innecesaria para cambios triviales. Si cambia el comportamiento esperado, se deriva a Change Control y, si corresponde, a SPEC authoring.

## Flujo de Change Control

1. Detectar que la petición afecta la baseline.
2. Invocar `$synqo-change-control`.
3. Crear una CR `Proposed` desde [`CHANGE-REQUEST-TEMPLATE.md`](changes/CHANGE-REQUEST-TEMPLATE.md).
4. Analizar alternativas e impacto en producto, requisitos, UX, dominio, API, datos, seguridad, testing y documentación.
5. Esperar la decisión humana.
6. Si se acepta, actualizar primero o junto a las fuentes, baseline, trazabilidad y SPEC.
7. Implementar y verificar el cambio.

Una decisión abierta `Blocked` detiene la unidad. Una decisión `Deferred` permite continuar solo si la SPEC documenta sus límites y no inventa el comportamiento pendiente.

## Definition of Done

La referencia común es [`development/definition-of-done.md`](development/definition-of-done.md). Incluye criterios de aceptación, invariantes, autorización server-side, tests, typecheck/lint/build cuando existan, contratos, seguridad, accesibilidad, documentación, diff, SPEC y evidencia TFM cuando corresponda.

## Evidencia TFM

Las decisiones relevantes no deben quedar solo en chats o terminal. El trabajo significativo se indexa en [`tfm/evidence-register.md`](tfm/evidence-register.md), con metodología, uso relevante de IA, hitos y métricas objetivas en los registros correspondientes. No se guardan conversaciones completas, prompts enteros ni logs completos. Git sigue siendo la fuente de verdad de cambios de código; los registros TFM contextualizan y enlazan evidencia.

## Git y sincronización documental

Mantener cambios pequeños y coherentes, commits con propósito claro, sin reescribir historia ni force push. No usar automáticamente `git reset --hard` ni `git clean -fd`, ni descartar cambios ajenos. Revisar el diff antes de terminar y no mezclar cambios no relacionados.

### Estrategia de ramas

Synqo usa trunk-based development: `main` es la única rama permanente y debe permanecer siempre estable y desplegable. El trabajo se realiza en ramas temporales y cortas, creadas desde `main`, y se integra mediante Pull Request.

```text
main
├── feat/<cambio>
├── fix/<problema>
├── chore/<mantenimiento>
└── docs/<documentación>
```

Reglas operativas:

- No hacer push directo a `main`; debe estar protegida.
- Cada rama debe cubrir un cambio coherente y tener una vida corta.
- Abrir un Pull Request hacia `main` para los cambios relevantes.
- Exigir revisión y CI verde antes de fusionar; como mínimo lint, tests y build cuando existan.
- Preferir `squash merge` para mantener un historial legible y eliminar la rama después de fusionarla.
- Usar Conventional Commits y tags SemVer para releases (`v0.1.0`, `v0.2.0`).
- Redactar en español los mensajes de commit, títulos y descripciones de Pull Request, salvo nombres técnicos, identificadores, comandos o términos propios del código.
- No crear ramas permanentes `develop`, `staging` o por entorno sin una necesidad documentada.

Formato recomendado para commits y Pull Requests:

```text
docs(SPEC-001): preparar la SPEC de bootstrap
```

- El asunto del commit debe ser imperativo, breve y preferentemente no superar 72 caracteres.
- El cuerpo del commit es opcional y solo debe añadirse cuando explique contexto o una decisión relevante.
- El título del Pull Request debe describir el objetivo en una línea y referenciar `SPEC-XXX` o `CR-XXX`.
- La descripción del Pull Request debe resumir objetivo, cambios, verificaciones ejecutadas y fuera de alcance.
- No existe una longitud rígida para la descripción; debe ser tan breve como permita revisar el cambio sin abrir archivos innecesariamente.

Nomenclatura recomendada:

```text
feat/decision-voting
fix/invalid-permission-check
chore/update-dependencies
docs/branching-strategy
```

Para trabajo trazable con SPECs y CRs, se recomienda añadir el identificador:

```text
docs/SPEC-001-bootstrap
feat/SPEC-001-bootstrap
fix/SPEC-001-regression
change/CR-001-update-contract
```

Antes de crear o cambiar de rama, el agente debe comprobar la rama actual, el estado del workspace, los cambios no relacionados, la rama base y la autorización del propietario. No debe hacer checkout destructivo, resetear, limpiar ni sobrescribir cambios ajenos.

La preparación de una SPEC puede realizarse en una rama `docs/...` si el trabajo documental se revisa por PR. La implementación de una SPEC debe realizarse en una rama `feat/SPEC-XXX-...`; si el agente está en `main` y no tiene autorización para crear/cambiar de rama, debe detenerse y preguntar antes de tocar código. No se crean ramas automáticamente por inferencia.

Un cambio `Proposed` no se implementa. Una CR aceptada usa `change/CR-XXX-...` cuando el propietario autoriza esa rama. Los commits y PRs deben referenciar `SPEC-XXX` o `CR-XXX` cuando corresponda.

Las ramas `release/<versión>` y `hotfix/<problema>` se reservan para cuando exista una necesidad real de preparar una release o corregir una incidencia crítica. Los entornos deben desplegar commits concretos de `main` o ramas de preview, no requieren una rama permanente por entorno.

Flujo básico:

```bash
git switch main
git pull --ff-only
git switch -c feat/nombre-del-cambio
# trabajo, tests y commits
git push -u origin feat/nombre-del-cambio
# abrir Pull Request hacia main
```

Después de un cambio, revisar según corresponda: requisitos/prioridad, reglas/dominio, OpenAPI/datos, autorización/seguridad, UX, tests, roadmap, SPEC/CR/deviation y evidencia TFM. El código es la fuente de verdad de detalles locales y no se duplica en Markdown.

## Próximo paso recomendado

1. Seleccionar `SPEC-001` — Bootstrap del repositorio y toolchain, según el orden de `vertical-slices.md` y sus dependencias.
2. Preparar la primera SPEC mediante `$synqo-spec-authoring`.
3. Revisarla y marcarla `Ready` solo cuando sea implementable.
4. Implementarla mediante `$synqo-sdd-implementation` y verificarla con `$synqo-verification`.
