# 18 — Especificación de IA

## AI-F01 — Asistente de coordinación en lenguaje natural

### Problema

Combinar periodos, mínimos de participantes, fechas excluidas, preferencias por día y cantidad de candidatos mediante controles manuales puede resultar tedioso. El lenguaje natural es adecuado para expresar esa intención, pero no para ejecutar directamente reglas de negocio.

### Principio

```text
Lenguaje natural
      ↓
     LLM
      ↓
restricciones estructuradas
      ↓
schema + domain validation
      ↓
motor determinista
      ↓
fechas candidatas
      ↓
usuario revisa
      ↓
flujo normal de propuesta
```

El LLM **interpreta**, Synqo **calcula** y el usuario **decide**.

## Contrato conceptual

```json
{
  "status": "ok",
  "dateRange": {"from": "2026-10-10", "to": "2026-10-20"},
  "candidateCount": 3,
  "constraints": {
    "minAvailable": 5,
    "maxUnavailable": 1,
    "excludedDates": ["2026-10-15"]
  },
  "preferences": {
    "preferredWeekdays": ["FRIDAY", "SATURDAY"]
  },
  "proposedTime": "20:00"
}
```

Estados de interpretación: `OK | NEEDS_CLARIFICATION | UNSUPPORTED`.

## Validación

1. **Schema:** tipos, enums, formatos, cardinalidades.
2. **Dominio:** rango válido, límites según participantes, fechas dentro del periodo, estados/políticas permitidos.
3. **Human-in-the-loop:** mostrar interpretación concreta antes de ejecutar.
4. **Cálculo:** CandidateDateService determinista sobre datos reales.

## Privacidad

El proveedor IA no necesita nombres, emails ni disponibilidad nominal. Contexto mínimo: texto del usuario, fecha actual, locale, zona horaria, vocabulario y capacidades soportadas.

## Seguridad

El modelo no tiene acceso directo a BD ni tools de mutación. El endpoint IA devuelve interpretación/candidatos, pero publicar una propuesta usa el endpoint de dominio convencional y sus permisos.

## No RAG / no fine-tuning / no agente

No existe un problema de recuperación documental que justifique RAG. Se comienza con prompt + structured output + examples + validación. Tampoco se necesita agent loop porque el flujo es fijo y acotado.

## Evaluación

Dataset etiquetado con rangos explícitos/relativos, weekdays, exclusiones, mínimos/máximos, preferencias, horas, ambigüedad, unsupported y prompt injection.

Métricas: schema validity rate, exact intent accuracy, field accuracy, clarification detection, unsupported detection, end-to-end task success, correction rate, latencia, tokens y coste.

## Testing

- unit: schema/domain validators y CandidateDateService;
- contract: adapter del proveedor;
- golden tests: texto → estructura esperada;
- integration: output → validation → candidate engine;
- E2E: texto → revisión → candidatos → propuesta;
- CI normal con fake adapter; evaluación real separada y controlada.

## Observabilidad y versionado

Registrar `provider`, `model`, `promptVersion`, `schemaVersion`, latencia, consumo y estado de validación evitando PII. Versionar prompts y schemas para comparar resultados sobre el mismo dataset.

## Fechas relativas

La interpretación de «mañana», «el próximo viernes» o «este fin de semana» requiere fecha actual, locale y zona horaria. La política concreta se mantiene como `OPEN-09`; las fechas concretas interpretadas se muestran siempre antes de aplicar.
