---
name: synqo-verification
description: Verifica cualquier cambio de código, tests, build, datos o comportamiento de Synqo antes de declararlo terminado.
---

# Synqo verification

1. Revisa `git diff`, alcance y cambios accidentales.
2. Descubre los scripts reales del repositorio; no inventes comandos.
3. Ejecuta las validaciones relevantes disponibles: format, lint, typecheck, unit, integration, UI, E2E y build según el cambio.
4. Si falla una validación, corrige y repite. No declares done con fallos relevantes.
5. Revisa autorización/seguridad, OpenAPI, datos/migraciones, documentación y SPEC/CR/deviation cuando apliquen.
6. Revisa el diff final.
7. Registra evidencia objetiva: comando o suite, resultado, fecha y artefacto relacionado. Enlaza CI persistente si existe.
8. Actualiza `tfm/evidence-register.md` cuando el cambio sea significativo, sin copiar logs completos.

Resume la evidencia y los límites de lo verificado. La verificación es obligatoria antes de cerrar un cambio de comportamiento.
