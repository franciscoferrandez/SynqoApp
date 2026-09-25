---
name: synqo-spec-authoring
description: Prepara una SPEC implementable para una feature o vertical slice de Synqo; úsala antes de implementar trabajo sustancial sin SPEC Ready.
---

# Synqo SPEC authoring

No implementes código de aplicación. Detente al conseguir una SPEC `Ready` o deja `Draft` con el blocker explícito.

1. Lee [`synqo-documentation-v0.2/IMPLEMENTATION-GUIDE.md`](../../../synqo-documentation-v0.2/IMPLEMENTATION-GUIDE.md), `specs/spec-register.md` y la SPEC/roadmap relevante.
2. Carga solo los RF/HU/MoSCoW, reglas de dominio, autorización, OpenAPI, datos y UX necesarios.
3. Redacta desde [`synqo-documentation-v0.2/specs/SPEC-TEMPLATE.md`](../../../synqo-documentation-v0.2/specs/SPEC-TEMPLATE.md), referenciando fuentes en vez de duplicarlas.
4. Detecta contradicciones y no inventes decisiones. Si falta una decisión que bloquea, permanece `Draft` y deriva a `$synqo-change-control` cuando afecte baseline.
5. Si es implementable, marca `Ready`, actualiza `spec-register.md` y `implementation/status.md`.
6. Registra evidencia mínima en `tfm/evidence-register.md`; registra uso relevante de IA y un hito metodológico solo cuando corresponda.

La SPEC debe incluir criterios de aceptación, tests requeridos, autorización, impacto documental y trazabilidad. No cambies el roadmap ni la baseline silenciosamente.
