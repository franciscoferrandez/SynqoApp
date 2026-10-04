# Gates

## Baseline Readiness

Pregunta:

> ¿El siguiente incremento puede implementarse sin inventar decisiones relevantes?

Estados:

```text
READY
NOT_READY
READY_WITH_EXPLICIT_OMISSIONS
```

Mínimos a revisar:

- objetivo;
- alcance;
- dominio relevante;
- RF/RN;
- RNF críticos;
- restricciones;
- UX aplicable;
- arquitectura bloqueante;
- testing;
- preguntas abiertas.

## Change Ready / DoR

No se implementa un Change N2/N3 si existen:

- preguntas bloqueantes;
- scope ambiguo;
- criterios sin definir;
- arquitectura requerida sin resolver;
- módulos afectados sin reglas mínimas;
- riesgo alto sin plan.

## Change Done / DoD

Según nivel:

- implementación;
- tests;
- validación;
- análisis estático/seguridad/performance aplicables;
- migración;
- convergencia;
- drift resuelto;
- delivery coverage actualizado;
- baseline actualizado solo si realmente cambió la verdad normativa.
