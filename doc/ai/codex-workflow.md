# Workflow multiagente de Codex para slices

## Alcance y fuentes

Esta configuración aplica a Codex CLI 0.160.0 en este repositorio. Complementa [AGENTS.md](../../AGENTS.md) y PDI; no sustituye las fuentes normativas. Las slices son pasos numerados de «Plan por slices» dentro de una SPEC; [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](../../pdi_doc/08_especificaciones/99_archivadas/spec-equ-001-arranque-equipo-local.md) es un ejemplo ya archivado. No existe por ahora un catálogo independiente de IDs `SLICE-XX`: el prompt debe identificar o permitir localizar sin ambigüedad la SPEC y el paso. Los requisitos están enlazados en «Baseline relacionado»; los criterios están en «Criterios de aceptación», normalmente para la SPEC completa, así que se seleccionan los pertinentes a la slice sin perder los transversales. «Evidencia / Validation» define comprobaciones de la SPEC. La [Definition of Done PDI](../../pdi_doc/07_desarrollo/07_definicion-de-terminado/README.md) actúa como gate de cierre, junto con la verificación concreta de cada criterio.

## Agentes y modelos

La selección procede del catálogo activo de `codex debug models` de esta instalación, no de IDs supuestos. `gpt-6.1-sol` es el modelo de trabajo más reciente y razonable para tareas exigentes; `gpt-6-luna` es rápido y económico para tareas acotadas. `gpt-6-astra` también está disponible, pero su mayor capacidad se reserva como escalado manual para casos excepcionalmente complejos. Cada rol usa un archivo de `.codex/agents/`.

| Rol | Modelo | Reasoning | Permiso previsto | Responsabilidad |
| --- | --- | --- | --- | --- |
| PRIMARY | `gpt-6.1-sol` | `high` | Permisos normales de la sesión | Lee la SPEC completa, decide, planifica, coordina e integra; acepta la slice. |
| `explorer` | `gpt-6-luna` | `medium` | `read-only` | Mapea código, rutas, convenciones y tests; no edita. |
| `implementer` | `gpt-6.1-sol` | `medium` | `workspace-write` | Implementa comportamiento ya decidido y localizado. |
| `test_writer` | `gpt-6-luna` | `medium` | `workspace-write` | Escribe tests de comportamiento explícito. |
| `validator` | `gpt-6-luna` | `low` | `workspace-write` | Ejecuta checks reales; no corrige código. |
| `reviewer` | `gpt-6.1-sol` | `high` | `read-only` | Revisa independientemente corrección, riesgos y cobertura. |

`implementer` usa el modelo fuerte con menos razonamiento porque no hay un modelo medio claramente mejor para esta tarea en el catálogo visible. El agente principal puede cambiar explícitamente de modelo/effort al escalar una tarea, siempre con un ID comprobado. Mantén las decisiones de alto riesgo en PRIMARY y somételas a REVIEWER.

## Routing, escalado y contexto

- **LOW:** exploración, validación, fixtures, mocks, builders, tests derivados directamente de criterios, documentación mecánica y transformaciones repetitivas. Preferir `gpt-6-luna`.
- **MEDIUM:** controladores, handlers, DTO, repositorios, servicios de aplicación, componentes, queries y mappings con reglas ya definidas. Usar `implementer`; ajustar esfuerzo o retener en PRIMARY si la complejidad crece.
- **HIGH:** invariantes, reglas de negocio, autorización, seguridad, concurrencia, carreras, idempotencia, lifecycle, máquinas de estados, migraciones delicadas, contratos entre slices, arquitectura, irreversibilidad o ambigüedad. Resolver en PRIMARY con modelo fuerte y revisar independientemente. No delegar estas decisiones para ahorrar tokens.

Todos los subagentes responden `ESCALATE: <motivo concreto>` ante una decisión necesaria no especificada. PRIMARY consulta la SPEC, baseline, ADR y código aceptado; si no puede resolver legítimamente, pregunta a la persona usuaria. Una suposición no se convierte en decisión silenciosa.

En cada delegación, enviar un TASK PACKET mínimo:

```text
Task: ...
Slice: ...
Spec: <ruta>
Relevant acceptance criteria: ...
Relevant requirements: ...
Relevant files: ...
Constraints: ...
Expected output: ...
Do not change: ...
Validation: ...
```

Usar sólo contexto pertinente; el agente puede leer más archivos si lo necesita. El límite es **3 subagentes abiertos simultáneamente**, además de PRIMARY. Prefiere 2–4 subagentes útiles por slice, lectura y análisis independientes en paralelo, y escrituras sin solapamiento de archivos ni de contexto delimitado. No permitir que los subagentes creen otros subagentes. Esta versión no expone un límite de profundidad configurable en `config.toml`; se impone mediante instrucciones.

## Secuencia de una slice

1. **SPEC:** localizar la SPEC y leerla completa, incluidos enlaces relevantes y estado de preparación PDI.
2. **ANALYSIS:** extraer objetivo, requisitos, criterios de aceptación, invariantes, restricciones, dependencias, riesgos e incógnitas.
3. **PLAN:** preparar pasos pequeños y verificables.
4. **RISK CLASSIFICATION:** marcar LOW/MEDIUM/HIGH y decidir qué conserva PRIMARY.
5. **DELEGATION:** crear TASK PACKET y usar los agentes adecuados sin sobredelegar.
6. **IMPLEMENTATION:** integrar incrementos dentro del alcance aprobado.
7. **TESTS:** probar comportamientos definidos; escalar cualquier expectativa no especificada.
8. **VALIDATION:** ejecutar checks aplicables con los comandos reales de abajo.
9. **INDEPENDENT REVIEW:** invocar `reviewer` al final, corregir BLOCKER/MAJOR y repetir las validaciones afectadas.
10. **ACCEPTANCE CRITERIA:** entregar matriz `Acceptance criterion | Evidence | Result` con PASS/FAIL/UNKNOWN. DONE requiere todos PASS, checks relevantes verdes, ningún escalado ni BLOCKER/MAJOR pendiente, scope correcto y decisiones arquitectónicas relevantes documentadas según PDI.

## Comandos reales de validación

Ejecutar sólo los checks aplicables. Node 24 es requisito de `apps/web`; PHP se ejecuta por Docker Compose. La CI está en [web.yml](../../.github/workflows/web.yml); el hook está en [lefthook.yml](../../lefthook.yml).

| Área | Comandos existentes |
| --- | --- |
| API tests | `docker compose run --rm api composer test` |
| API base de pruebas | `docker compose run --rm api composer db:reset:test` **sólo** sobre la base de pruebas y cuando haga falta prepararla; no resetear datos de desarrollo. |
| API análisis y formato | `docker compose run --rm --no-deps api sh -lc "composer cs:check && composer stan && composer rector:check"` |
| API esquema | `docker compose exec -T api php bin/console doctrine:schema:validate` con servicio iniciado. |
| Web unit tests | `npm --prefix apps/web test` |
| Web integración E2E | `npm --prefix apps/web run test:e2e` con API y PostgreSQL preparados. |
| Web lint | `npm --prefix apps/web run lint` |
| Web formato | `npm --prefix apps/web run format:check` |
| Web build/type check | `npm --prefix apps/web run build` |

La API usa PHPUnit, PHP CS Fixer, PHPStan, Rector y Doctrine; la web usa Vitest mediante Angular, Playwright, ESLint, Prettier y compilación Angular. El proyecto no tiene Makefile ni script independiente de type check; el build cubre la compilación TypeScript. Los checks de integración requieren preparar servicios y migraciones como documentan [API](../../apps/api/README.md) y [WEB](../../apps/web/README.md).

## Uso y diagnóstico

Prompt mínimo cuando la referencia sea inequívoca:

```text
Implementa SLICE-XX siguiendo su spec.
```

Si hay varias SPEC o numeraciones, especifica la ruta e índice, por ejemplo: `Implementa la slice 3 de <ruta-de-una-SPEC-activa> siguiendo su spec.` Pide al orchestrator que muestre la matriz final.

Si el routing falla: comprueba que Codex se inició desde la raíz confiable del repo, reinicia la sesión para recargar `.codex/config.toml` y `AGENTS.md`, ejecuta `codex --strict-config doctor --summary` y revisa los agentes con una tarea de lectura explícita. Inspecciona el evento real de spawn y la respuesta del subagente antes de atribuirle resultados: una afirmación del agente principal no basta. Revisa los TASK PACKET, respuestas `ESCALATE` y el resultado del reviewer; corrige instrucciones o el alcance del paquete, sin inventar un criterio. `codex debug models` permite revisar los IDs y esfuerzos disponibles; para cambiarlos, edita `model` y `model_reasoning_effort` en `.codex/config.toml` y los TOML de `.codex/agents/`, y valida en una sesión nueva.

## Límites de esta instalación

Los TOML de agentes soportan modelo, esfuerzo y sandbox por rol, pero los overrides vivos de permisos del agente padre pueden prevalecer sobre el sandbox del hijo. La restricción de `test_writer` a tests y la prohibición de editar del `validator` son instrucciones de comportamiento, no una allowlist de rutas aplicada por el sandbox. `validator` usa `workspace-write` porque tests, build y herramientas generan artefactos y pueden usar la base de pruebas. El límite de concurrencia cuenta hilos de subagentes abiertos, no garantiza que siempre se deleguen tres. La configuración de proyecto se carga en proyectos confiables; este repo figura como confiable en la configuración local inspeccionada. Las instrucciones del host o de la sesión pueden tener prioridad sobre AGENTS.md. En la prueba no destructiva de `codex exec --json` de esta instalación, el modelo afirmó haber delegado, pero el registro no mostró ningún evento `spawn`; con `--ephemeral` hubo además un error de almacén de sesiones. Por ello la sintaxis, los modelos y el registro de roles se validaron, pero el spawn efectivo queda pendiente de comprobar en una sesión interactiva nueva. No atribuyas trabajo a un subagente sin su evento y respuesta reales.

Fuentes oficiales de OpenAI Docs: [subagentes](https://learn.chatgpt.com/docs/agent-configuration/subagents), [referencia de configuración](https://learn.chatgpt.com/docs/config-file/config-reference) y [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
