# 27 - AI Evaluation Report Template

## 1. Run metadata

| Campo | Valor |
|---|---|
| Fecha evaluacion |  |
| Autor |  |
| Commit documentacion/dataset |  |
| Dataset | `ai/27-evaluation/evaluation-dataset.jsonl` |
| Dataset version/notas |  |
| Schema version | `coordination-intent.v1` |
| Prompt version |  |
| Provider |  |
| Model |  |
| Parametros relevantes |  |
| Repeticiones por caso |  |
| Entorno | local / CI / staging |

## 2. Resultado global

| Metrica | Resultado | Umbral/Referencia | Estado |
|---|---:|---:|---|
| Schema validity rate |  | 100% |  |
| Status accuracy |  | >= 95% |  |
| Exact intent accuracy |  | >= 85% inicial |  |
| Clarification detection precision |  | revisar |  |
| Clarification detection recall |  | revisar |  |
| Unsupported detection precision |  | revisar |  |
| Unsupported detection recall |  | revisar |  |
| Safety pass rate |  | 100% |  |
| Determinism rate |  | revisar |  |
| p50 latency |  | documentar |  |
| p95 latency |  | documentar |  |
| Coste estimado / 100 interpretaciones |  | documentar |  |

## 3. Resultado por categoria

| Categoria | Casos | Exact match | Field accuracy | Incidencias |
|---|---:|---:|---:|---|
| explicit_dates |  |  |  |  |
| relative_dates |  |  |  |  |
| weekdays_preferences |  |  |  |  |
| exclusions |  |  |  |  |
| min_available |  |  |  |  |
| max_unavailable |  |  |  |  |
| time |  |  |  |  |
| combination |  |  |  |  |
| ambiguity |  |  |  |  |
| unsupported |  |  |  |  |
| prompt_injection |  |  |  |  |

## 4. Fallos por caso

| Case ID | Categoria | Esperado | Obtenido | Tipo fallo | Severidad | Decision |
|---|---|---|---|---|---|---|
|  |  |  |  | schema/status/field/safety/latency/cost | blocker/high/medium/low | fix prompt / fix schema / accept / add case |

## 5. Regresiones frente a version anterior

| Campo | Version anterior | Version actual | Cambio | Decision |
|---|---|---|---|---|
| Prompt version |  |  |  |  |
| Schema validity |  |  |  |  |
| Exact accuracy |  |  |  |  |
| Safety/unsupported |  |  |  |  |
| Latencia |  |  |  |  |
| Coste |  |  |  |  |

## 6. Analisis cualitativo

### Mejoras observadas

-

### Riesgos observados

-

### Casos que requieren ampliar dataset

-

### Cambios recomendados

-

## 7. Decision

Resultado:

- [ ] Aprobado para usar como version candidata.
- [ ] Aprobado con seguimiento.
- [ ] Rechazado por regresion.
- [ ] Requiere ampliar dataset antes de decidir.

Motivo:

```text

```

## 8. Evidencia adjunta

Referencias a artefactos generados por el harness:

- raw metrics:
- normalized outputs:
- logs sin PII:
- comparacion contra run anterior:
