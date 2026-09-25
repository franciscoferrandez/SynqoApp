---
name: synqo-sdd-implementation
description: Implementa una SPEC Ready de Synqo siguiendo Spec-First, con alcance mínimo y verificación obligatoria.
---

# Synqo SDD implementation

Solo se puede usar si existe una SPEC en estado `Ready`.

1. Lee el `AGENTS.md` aplicable y la SPEC completa; carga únicamente sus fuentes enlazadas necesarias.
2. Comprueba rama, estado del workspace, cambios ajenos y política de branch preflight en `IMPLEMENTATION-GUIDE.md`.
3. Si el cambio requiere rama y no existe autorización para crear/cambiarla, detente y pregunta. No implementes una feature relevante sobre `main` protegida.
4. Comprueba coherencia con `project/design-baseline.md` y detente si hay conflicto.
5. Cambia la SPEC a `In Progress`, inspecciona el código y crea/ajusta tests según aceptación.
6. Implementa el cambio mínimo sin ampliar alcance.
7. Ejecuta verificaciones disponibles y corrige fallos.
8. Revisa autorización, seguridad, OpenAPI, datos, migraciones y documentación cuando apliquen.
9. Marca `Implemented`, invoca `$synqo-verification` y solo tras resultado satisfactorio marca `Verified`.
10. Actualiza `spec-register.md`, `implementation/status.md` y la evidencia TFM objetiva. Actualiza métricas e hitos solo con datos reales.

Si requiere cambiar baseline, detente e invoca `$synqo-change-control`. No inventes SHA: usa `pending commit reference` hasta que exista commit.
