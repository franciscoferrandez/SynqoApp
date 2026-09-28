---
name: synqo-sdd-implementation
description: Implementa una SPEC Ready de Synqo siguiendo Spec-First, con alcance mínimo y verificación obligatoria.
---

# Synqo SDD implementation

Solo se puede usar si existe una SPEC en estado `Ready`.

1. Lee el `AGENTS.md` aplicable y la SPEC completa; carga únicamente sus fuentes enlazadas necesarias.
2. Comprueba rama, estado del workspace, cambios ajenos y política de branch preflight en `IMPLEMENTATION-GUIDE.md`.
3. Si el cambio requiere rama y no existe autorización para crear/cambiarla, detente y pregunta. No implementes una feature relevante sobre `main` protegida.
4. Completa el **Baseline Conformance Preflight** de `IMPLEMENTATION-GUIDE.md`: para cada prerrequisito y decisión previa relevante, verifica código/configuración de ejecución, migraciones, contratos, autorización y pruebas. Un estado documental `Verified` no basta.
5. Si falta el cimiento o existe divergencia, detente: no cambies la SPEC a `In Progress`, no construyas encima y registra evidencia del `Fail`. Corrige primero la unidad fundacional afectada.
6. Comprueba coherencia con `project/design-baseline.md` y detente si hay conflicto.
7. Cambia la SPEC a `In Progress`, inspecciona el código y crea/ajusta tests según aceptación.
8. Implementa el cambio mínimo sin ampliar alcance.
9. Ejecuta verificaciones disponibles y corrige fallos.
10. Revisa autorización, seguridad, OpenAPI, datos, migraciones y documentación cuando apliquen.
11. Marca `Implemented`, invoca `$synqo-verification` y solo tras resultado satisfactorio marca `Verified`.
12. Actualiza `spec-register.md`, `implementation/status.md` y la evidencia TFM objetiva. Actualiza métricas e hitos solo con datos reales.

## Material formativo

Completa la guía docente creada para la SPEC: prerrequisitos y comandos reales, mapa enlazado de artefactos, recorrido de decisiones o fragmentos pequeños, verificaciones y límites hacia slices posteriores. Usa Mermaid solo si aclara materialmente un flujo, decisión, secuencia o relación. La guía explica; no sustituye ni duplica la SPEC, ADR, OpenAPI o código, ni contiene secretos.

Si requiere cambiar baseline, detente e invoca `$synqo-change-control`. No inventes SHA: usa `pending commit reference` hasta que exista commit.
