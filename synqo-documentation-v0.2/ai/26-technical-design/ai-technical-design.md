# 26 - AI Technical Design

## 1. Proposito

Este documento convierte `AI-F01` en un contrato tecnico implementable. Synqo usa el LLM solo como interprete de lenguaje natural hacia restricciones estructuradas; el dominio determinista valida, calcula y decide que acciones estan permitidas.

No introduce RAG, fine-tuning, agent loop, tools de mutacion ni acceso directo del modelo a PostgreSQL.

## 2. Decisiones

| ID | Decision | Motivo |
|---|---|---|
| `AI-TD-01` | El contrato canonico es `CoordinationIntent` version `coordination-intent.v1`. | Permite fake adapter, validacion de schema y evaluacion reproducible. |
| `AI-TD-02` | El LLM nunca recibe nombres, emails, tokens, ids, disponibilidad nominal, votos ni historico. | Respeta privacidad y mantiene el modelo como interprete. |
| `AI-TD-03` | `CandidateDateService` calcula candidatas tras validacion; el LLM no calcula disponibilidad. | Preserva determinismo y trazabilidad. |
| `AI-TD-04` | La API IA no muta dominio; crear propuesta usa el endpoint normal de propuestas. | Mantiene control humano y autorizacion existente. |
| `AI-TD-05` | Provider/modelo queda diferido detras de puerto `CoordinationIntentInterpreter`. | ADR-019 exige elegirlo por calidad, coste y latencia. |

## 3. Pipeline

```text
User text
  -> CoordinationInterpretationUseCase
  -> build allowed context
  -> CoordinationIntentInterpreter.interpret()
  -> schema validation
  -> domain validation
  -> CandidateDateService deterministic calculation
  -> response with interpretation + candidates
  -> user reviews
  -> normal proposal creation endpoint
```

Cada paso debe poder probarse con fake adapter.

## 4. CoordinationIntent

El schema definitivo esta en `coordination-intent.schema.json`.

Campos principales:

| Campo | Semantica |
|---|---|
| `schemaVersion` | Version exacta del contrato. Inicial: `coordination-intent.v1`. |
| `status` | `OK`, `NEEDS_CLARIFICATION` o `UNSUPPORTED`. |
| `dateRange.from/to` | Rango local del equipo, inclusivo, en zona horaria canonica del equipo. |
| `hardConstraints.minAvailable` | Minimo de participantes disponibles requerido para considerar una fecha. |
| `hardConstraints.maxUnavailable` | Maximo de participantes no disponibles permitido. |
| `hardConstraints.excludedDates` | Fechas locales excluidas por el usuario. |
| `preferences.preferredWeekdays` | Dias preferidos; ordenan o priorizan, no invalidan por si solos. |
| `candidateCount` | Cantidad deseada de candidatas a devolver. |
| `proposedTime` | Hora opcional `HH:mm` que se puede trasladar a opciones de propuesta; no crea franja. |
| `clarification` | Pregunta segura cuando falta o es ambiguo un dato. |
| `unsupportedReason` | Motivo cerrado para peticiones fuera del alcance del MVP. |

## 5. Catalogo cerrado de restricciones

| Restriccion | Campo | Tipo | Semantica |
|---|---|---|---|
| Rango explicito | `dateRange` | Hard | Limita fechas candidatas a `from..to` inclusivo. |
| Rango relativo resuelto | `dateRange` | Hard | "mañana", "proxima semana", "este finde" se resuelven con `currentDate`, locale y timezone del equipo. |
| Minimo disponible | `hardConstraints.minAvailable` | Hard | Fecha candidata debe tener al menos N `AVAILABLE`. |
| Maximo no disponible | `hardConstraints.maxUnavailable` | Hard | Fecha candidata no debe superar N `UNAVAILABLE`. |
| Fechas excluidas | `hardConstraints.excludedDates` | Hard | Fecha nunca se devuelve aunque tenga buena disponibilidad. |
| Dia preferido | `preferences.preferredWeekdays` | Preference | Ordena/desempata; no excluye otros dias por si sola. |
| Numero de candidatas | `candidateCount` | Output control | Limita candidatas devueltas tras calculo determinista. |
| Hora propuesta | `proposedTime` | Proposal hint | Se muestra al usuario y puede pasar a opciones de propuesta; no afecta disponibilidad general. |

No soportado en MVP:

- franjas horarias de disponibilidad general;
- recurrencia automatica;
- calendarios externos;
- reservas;
- destinatarios parciales arbitrarios;
- chat o notificaciones;
- preferencias por participante nominal;
- calculo por el LLM usando disponibilidad real.

## 6. Puerto y adapter

```ts
type CoordinationInterpreterInput = {
  text: string;
  locale: string;
  teamTimeZone: string;
  currentDate: string; // YYYY-MM-DD in team timezone
  schemaVersion: 'coordination-intent.v1';
  promptVersion: string;
  capabilities: CoordinationInterpreterCapabilities;
};

type CoordinationInterpreterResult = {
  rawProviderStatus: 'OK' | 'TIMEOUT' | 'PROVIDER_ERROR' | 'RATE_LIMITED';
  intent?: CoordinationIntent;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    estimatedCostMinor?: number;
  };
  latencyMs: number;
  provider: string;
  model: string;
};

interface CoordinationIntentInterpreter {
  interpret(input: CoordinationInterpreterInput): Promise<CoordinationInterpreterResult>;
}
```

### Responsabilidades del puerto

- Recibir solo contexto permitido.
- Devolver resultado estructurado o fallo controlado.
- No acceder a DB.
- No ejecutar tools.
- No crear ni modificar dominio.

### Responsabilidades del caso de uso

- Autorizar `interpretCoordination`.
- Construir contexto minimo.
- Invocar adapter con timeout.
- Validar schema.
- Validar dominio.
- Calcular candidatas deterministas.
- Emitir respuesta API y eventos de observabilidad minimizados.

### Responsabilidades del adapter/provider

- Aplicar prompt template versionado.
- Solicitar structured output compatible con schema.
- Mapear errores provider a estados internos.
- Registrar metadata tecnica minimizada.
- No reintentar indefinidamente ni completar campos fuera del contrato.

## 7. Contexto permitido

Permitido:

- texto del usuario;
- `locale`;
- fecha actual en zona del equipo;
- zona horaria IANA del equipo;
- schema version y prompt version;
- lista de capacidades soportadas;
- limites globales: rango maximo, `candidateCount` maximo, weekdays soportados.

Prohibido:

- nombres de participantes;
- emails;
- disponibilidad nominal;
- votos/respuestas;
- tokens, cookies, ids internos o refs publicas;
- historico del equipo;
- datos de cuenta.

## 8. Validacion

### Schema validation

Rechaza:

- JSON invalido;
- propiedades extra;
- enums desconocidos;
- fechas/hora con formato invalido;
- `OK` sin `dateRange`;
- `NEEDS_CLARIFICATION` sin `clarification`;
- `UNSUPPORTED` sin `unsupportedReason`.

### Domain validation

Rechaza o transforma a respuesta controlada:

- `dateRange.from > dateRange.to`;
- rango superior al maximo permitido;
- fechas excluidas fuera del rango;
- `candidateCount` mayor que limite del producto;
- `minAvailable` mayor que participantes activos si ese dato se evalua despues de DB;
- `maxUnavailable` incoherente con participantes activos;
- `proposedTime` no permitido por formato;
- fecha relativa ambigua por timezone o locale.

### CandidateDateService

Entrada:

- `teamId` autorizado;
- `dateRange` validado;
- constraints/preferencias validadas;
- disponibilidad real consultada por el dominio.

Salida:

- candidatas con recuentos separados `AVAILABLE`, `MAYBE`, `UNAVAILABLE`, `UNANSWERED`;
- orden determinista existente;
- aplicacion de hard constraints y preferences;
- nunca resolucion automatica.

## 9. Fallbacks y errores

| Caso | Respuesta API | Comportamiento |
|---|---|---|
| Provider timeout | `status=UNSUPPORTED` o error controlado segun API final | UI muestra fallback manual. |
| Provider rate limit | Error controlado / retry no automatico para usuario | No bloquea flujo manual. |
| JSON invalido | `status=UNSUPPORTED`, reason `OUT_OF_SCOPE` o error interno mapeado | Registrar `schemaValidation=failed`. |
| Schema valido pero dominio invalido | `NEEDS_CLARIFICATION` si corregible; si no `UNSUPPORTED`. | No calcular candidatas. |
| Peticion fuera MVP | `UNSUPPORTED` con reason cerrado. | Explicar alternativa manual si existe. |
| Ambiguedad temporal | `NEEDS_CLARIFICATION`. | Preguntar sin inventar zona/rango. |

Timeout inicial recomendado: 8 segundos end-to-end para adapter. Reintentos: maximo 1 retry interno solo para errores transitorios seguros y siempre dentro del presupuesto de timeout. No reintentar prompts que ya devolvieron contenido invalido.

## 10. Coste, latencia y observabilidad

Registrar sin PII:

- provider;
- model;
- promptVersion;
- schemaVersion;
- status;
- schemaValidation result;
- domainValidation result;
- latency bucket o ms tecnico;
- input/output token counts si el proveedor los expone;
- estimated cost bucket;
- error category.

No registrar:

- prompt completo en produccion por defecto;
- texto usuario;
- structured output completo si puede contener texto usuario;
- disponibilidad nominal;
- nombres, emails, tokens.

## 11. Testing

Suites necesarias:

- schema tests contra `coordination-intent.schema.json`;
- domain validation tests con fake clock y zonas;
- fake adapter golden tests;
- provider adapter contract tests sin servicios reales en CI ordinaria;
- E2E-AI-01 con fake adapter;
- tests de prompt injection;
- tests de privacidad para comprobar contexto permitido.

## 12. Referencias

- `product/18-ai-feature-specification.md`
- `architecture/adr/ADR-019-ai-integration.md`
- `technical-design/18-api/api-design.md`
- `security/23-privacy-retention/data-retention-and-privacy.md`
- `quality/25-test-plan/test-plan.md`
