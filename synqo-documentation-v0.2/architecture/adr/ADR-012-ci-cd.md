# ADR-012 — CI/CD con GitHub Actions

**Estado:** Accepted

## Contexto
Se necesita validar cada cambio y desplegar producción únicamente desde una rama estable.

## Alternativas consideradas
- GitHub Actions.
- CI específico del proveedor.
- Pipeline manual.

## Decisión
Usar GitHub Actions como CI principal.

## Pipeline mínimo
- install
- lint
- format check
- typecheck
- unit tests
- integration tests
- build frontend
- build backend
- OpenAPI generation/check
- CodeQL

E2E completos en merge a `main` o antes de producción.

## Justificación
Permite quality gates independientes del proveedor de hosting y deja trazabilidad del proceso.

## Consecuencias
### Positivas
- CI portable.
- Integración natural con PR.
- Automatización reproducible.

### Negativas / trade-offs
- Tiempo de CI.
- Hay que mantener workflows.

## Condiciones para revisar la decisión
Revisar solo si se migra el repositorio fuera de GitHub.
