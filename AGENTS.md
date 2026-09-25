# Project

Synqo es una aplicación web de coordinación de equipos y decisiones colectivas. El stack aprobado es React + TypeScript + Vite, NestJS + TypeScript, PostgreSQL + MikroORM y REST/OpenAPI, en un monolito modular.

# Sources of truth

- Documentación: [`synqo-documentation-v0.2/`](synqo-documentation-v0.2/)
- Guía operativa: [`synqo-documentation-v0.2/IMPLEMENTATION-GUIDE.md`](synqo-documentation-v0.2/IMPLEMENTATION-GUIDE.md)
- Baseline: [`synqo-documentation-v0.2/project/design-baseline.md`](synqo-documentation-v0.2/project/design-baseline.md)

Carga contexto específico bajo demanda; no leas toda la documentación para cada tarea.

# Mandatory skill routing

- Nueva feature o comportamiento sustancial: usa `$synqo-spec-authoring` primero. Cuando la SPEC esté `Ready`, usa `$synqo-sdd-implementation`.
- Bug fix, ajuste pequeño o refactor local: usa `$synqo-small-change`.
- Cualquier cambio que afecte la baseline: usa `$synqo-change-control` antes de implementar.
- Cualquier cambio de código, tests, build, datos o comportamiento: usa `$synqo-verification` antes de declararlo terminado.

# Core rules

- No inventes decisiones de producto ni cambies requisitos silenciosamente.
- No omitas autorización server-side ni implementes requisitos `Won't`.
- Prefiere KISS/YAGNI; no introduzcas complejidad arquitectónica sin necesidad documentada.
- Mantén el alcance acotado y actualiza documentación cuando cambien contratos o comportamiento.
- Preserva compatibilidad salvo que una SPEC o CR indique lo contrario.
- Nunca expongas secretos.
- Revisa el diff antes de terminar.
- Conserva evidencia TFM para trabajo significativo y no registres actividad trivial.
- No dejes decisiones significativas solo en chats o terminales ni dupliques la historia Git.
- Antes de cambios relevantes, comprueba rama y workspace; usa ramas cortas y PR según `synqo-documentation-v0.2/IMPLEMENTATION-GUIDE.md`.
- No crees o cambies de rama automáticamente sin autorización explícita; si el trabajo relevante está en `main`, detente y pregunta.

# Git safety

- No force push ni reescritura de historia.
- No uses `git reset --hard` ni `git clean -fd` automáticamente.
- No descartes cambios no relacionados del usuario.
