---
name: synqo-verification
description: Verifica cualquier cambio de código, tests, build, datos o comportamiento de Synqo antes de declararlo terminado.
---

# Synqo verification

1. Revisa `git diff`, alcance y cambios accidentales.
2. Descubre los scripts reales del repositorio; no inventes comandos.
3. Ejecuta las validaciones relevantes disponibles: format, lint, typecheck, unit, integration, UI, E2E y build según el cambio.
4. Si falla una validación, corrige y repite. No declares done con fallos relevantes.
5. Revisa el Baseline Conformance Preflight de la SPEC: confirma que las decisiones y dependencias relevantes estaban implementadas realmente y que su evidencia no era solo documental. Una divergencia fundacional invalida el cierre.
6. Revisa autorización/seguridad, OpenAPI, datos/migraciones, documentación y SPEC/CR/deviation cuando apliquen.
7. Revisa el diff final.
8. Registra evidencia objetiva: comando o suite, resultado, fecha y artefacto relacionado. Enlaza CI persistente si existe.
9. Actualiza `tfm/evidence-register.md` cuando el cambio sea significativo, sin copiar logs completos.

## Material formativo

Cuando la SPEC tenga guía docente, comprobar que sus enlaces internos y comandos existen, que los diagramas Mermaid son legibles y que las explicaciones corresponden al código y a la evidencia real. Corregir referencias obsoletas y confirmar que no expone secretos. No marcar una SPEC futura como `Verified` si falta su guía mínima.

Resume la evidencia y los límites de lo verificado. La verificación es obligatoria antes de cerrar un cambio de comportamiento.
