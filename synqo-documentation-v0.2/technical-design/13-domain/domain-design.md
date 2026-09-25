# 13 — Domain Design

## 1. Propósito y alcance

Este documento transforma el modelo conceptual de Synqo en un diseño de dominio táctico implementable sobre NestJS, PostgreSQL y MikroORM. No define todavía el esquema físico definitivo ni una API pública; esos detalles quedan para los prompts 17 y 18.

El diseño prioriza el `Minimum Viable Validation` y el Target MVP documentados en `product/09b-requirements-prioritization.md`. Por tanto, los límites iniciales deben soportar equipos rápidos, participación sin cuenta, disponibilidad diaria, coincidencias deterministas, propuestas, encuestas, resultado/resolución y las garantías de seguridad y privacidad. Las capacidades `Should` y `Could` se modelan sin forzar complejidad temprana.

## 2. Principios tácticos

- `Equipo` es el contexto principal del producto.
- `Cuenta`, `Participante` y `Administrador` son identidades distintas.
- El modelo debe funcionar para participantes sin cuenta.
- Las reglas críticas se aplican en servidor, no solo en UI.
- El dominio calcula disponibilidad, coincidencias, votos y resultados de forma determinista.
- La IA puede producir restricciones estructuradas, pero no calcula, publica, resuelve ni muta el dominio.
- No se introduce CQRS, Event Sourcing, microservicios ni repositories genéricos. Se usa monolito modular con transacciones PostgreSQL/MikroORM.
- `Consulta` es vocabulario funcional compartido; no obliga por sí misma a herencia técnica, tabla única ni clase base profunda.

## 3. Contextos modulares pragmáticos

| Módulo | Responsabilidad | Núcleo inicial | Colaboradores |
|---|---|---|---|
| Identity & Access | Cuenta global, sesiones, enlaces opacos, identidad de participante y acceso administrativo. | Participación sin cuenta, canje de enlaces, vinculación segura. | Teams, Authorization. |
| Teams | Ciclo de vida del equipo, modalidad rápida/administrable, participantes, configuración y políticas. | Equipo rápido, participante activo/inactivo, zona horaria, políticas por defecto. | Identity & Access, Availability, Decisions. |
| Availability | Disponibilidad diaria, solicitudes, agregación y coincidencias. | Disponibilidad por día, estados, recuentos, ranking determinista. | Teams, Decisions. |
| Decisions | Consultas, propuestas, encuestas, respuestas, resultados y resoluciones. | Propuesta, encuesta, resultado calculado, resolución explícita. | Teams, Availability, Authorization. |
| Notifications | Email transaccional permitido y comunicación externa futura. | Verificación/recuperación administrativa; sin notificaciones automáticas de actividad en MVP. | Identity & Access, Teams. |
| AI Assistance | Interpretación de lenguaje natural en restricciones estructuradas. | Validación y entrega de restricciones; dominio determinista hace el cálculo. | Availability, Decisions. |

`Authorization` se implementa como capacidad transversal de aplicación/dominio, no como contexto de negocio separado. Sus reglas se concretarán en la fase 15.

## 4. Agregados y conceptos tácticos

### Team Aggregate

**Aggregate Root:** `Team`.

**Incluye conceptualmente:** modalidad, zona horaria, estado de lifecycle, configuración de equipo administrable, políticas de creación/resolución, estados de disponibilidad habilitados y participantes.

**Por qué es agregado:** concentra invariantes que condicionan casi todas las operaciones: modalidad rápida/administrable, temporalidad, zona horaria, identidad local, participantes activos y políticas.

**Entidades candidatas dentro del agregado:**

- `Participant`: identidad local del equipo. Puede existir sin cuenta y puede quedar inactiva.
- `TeamSettings`: configuración de equipo administrable.
- `AdministrativeIdentity`: identidad administrativa verificable primaria para MVP.

**Value Objects:**

- `TeamId`
- `TeamMode`
- `TeamLifecycleState`
- `IanaTimeZone`
- `EnabledAvailabilityStates`
- `TeamPolicy`
- `DisplayName`

**Invariantes principales:**

- Todo equipo es rápido o administrable.
- Un equipo rápido expira obligatoriamente y vincularlo a cuenta no cambia su lifecycle.
- Un equipo administrable requiere identidad administrativa verificable antes de otorgar administración persistente.
- Cada equipo tiene una zona horaria IANA canónica.
- Un participante pertenece exactamente a un equipo.
- No se reclama un participante por coincidencia de nombre.
- En equipo rápido los tres estados declarables están habilitados.
- En equipo administrable no pueden deshabilitarse simultáneamente `AVAILABLE` y `UNAVAILABLE`.

**Frontera transaccional mínima:**

- Crear equipo + creador/participante inicial.
- Verificar administración + activar equipo administrable.
- Cambiar configuración de equipo.
- Desactivar participante.
- Registrar actividad relevante de equipo rápido.

### Account Aggregate

**Aggregate Root:** `Account`.

**Incluye conceptualmente:** identidad global, credenciales/sesiones vinculadas, vínculos con participantes o administración cuando se demuestre control suficiente.

**Por qué es agregado:** mantiene identidad global y asociaciones persistentes, pero no sustituye al participante local.

**Value Objects:**

- `AccountId`
- `EmailAddress`
- `VerifiedEmail`

**Invariantes principales:**

- Una cuenta no es requisito para capacidades esenciales.
- Vincular participante a cuenta no recrea participante ni cambia histórico.
- Vincular equipo rápido o participación a cuenta no cambia modalidad ni expiración.

**Frontera transaccional mínima:**

- Crear cuenta.
- Vincular cuenta a participante.
- Vincular cuenta a administración.

La cuenta es `Could` dominante en la priorización, por lo que el diseño debe permitirla sin hacerla dependencia de flujos `Must`.

### Availability Aggregate

**Aggregate Root:** `AvailabilityEntry` por `Team + Participant + Date`.

**Incluye conceptualmente:** estado declarable de disponibilidad para un día en un equipo.

**Por qué no hacer del calendario un agregado:** el calendario es una vista/colección operativa. La invariancia real está en cada disponibilidad diaria y en la agregación determinista.

**Value Objects:**

- `LocalDate`
- `AvailabilityStatus`: `AVAILABLE | MAYBE | UNAVAILABLE`
- `DerivedAvailabilityStatus`: añade `UNANSWERED` solo para lectura/agregación.

**Domain Services:**

- `AvailabilityStatePolicy`: valida si un estado está habilitado en el equipo.
- `AvailabilityAggregationService`: calcula recuentos por fecha.
- `CandidateRankingService`: ordena fechas por menor `UNAVAILABLE`, mayor `AVAILABLE`, mayor `MAYBE`, menor `UNANSWERED` y fecha más próxima.

**Invariantes principales:**

- La disponibilidad general es exclusivamente por día.
- `UNANSWERED` no se persiste como respuesta declarada; se deriva por ausencia.
- Cambiar disponibilidad general no modifica respuestas de propuestas.
- `MAYBE` no equivale a `AVAILABLE`.

**Frontera transaccional mínima:**

- Upsert de disponibilidad diaria por participante y fecha.
- Respuesta a solicitud de disponibilidad que actualiza varias disponibilidades diarias.

### Availability Request Aggregate

**Aggregate Root:** `AvailabilityRequest`.

**Incluye conceptualmente:** intervalo, creador, estado abierto/cerrado y deadline opcional.

**Por qué es agregado separado:** la solicitud coordina la actualización de disponibilidad, pero sus respuestas no crean una disponibilidad paralela; aplican cambios sobre `AvailabilityEntry`.

**Value Objects:**

- `DateRange`
- `Deadline`
- `RequestState`

**Invariantes principales:**

- Tiene inicio y fin obligatorios.
- Se dirige a todos los participantes activos del equipo en MVP.
- Cerrada no acepta nuevas respuestas salvo reapertura explícitamente soportada.

**Frontera transaccional mínima:**

- Crear solicitud.
- Responder solicitud + actualizar disponibilidades del intervalo.
- Cerrar solicitud.

### Decision Aggregate

**Aggregate Root:** `DecisionProcess`.

`DecisionProcess` es el nombre técnico sugerido para la raíz de una `Consulta`. Evita que el término funcional `Consulta` obligue a una clase base ceremonial y evita nombrar todo como `Query`, que chocaría con terminología técnica.

**Especializaciones de comportamiento:**

- `ProposalDecision`: consulta de tipo propuesta con opciones temporales.
- `SurveyDecision`: consulta de tipo encuesta con opciones genéricas.

La implementación puede elegir en la fase de datos entre una raíz con discriminador, composición por tipo o tablas relacionadas. La decisión táctica aquí es que comparten una raíz transaccional para participación, respuestas, resultado y resolución, pero no requieren herencia profunda ni tabla única.

**Entidades candidatas dentro del agregado:**

- `DecisionOption`
- `DecisionResponse`
- `Resolution`

**Value Objects:**

- `DecisionType`: `PROPOSAL | SURVEY`
- `ParticipationState`: `OPEN | CLOSED`
- `ResolutionState`: `PENDING | RESOLVED | CANCELLED`
- `ProposalOption`: fecha obligatoria + hora opcional.
- `SurveyMode`: `SINGLE | MULTIPLE`
- `SurveyVisibility`: `NOMINAL | AGGREGATED`
- `ResponseStatus`
- `ResultSnapshot`

**Domain Services:**

- `DecisionResultCalculator`: calcula resultados de propuesta/encuesta.
- `ResolutionPolicy`: valida quién puede resolver según modalidad/política.
- `DecisionOptionMutationPolicy`: impide cambios sustanciales de opciones con respuestas.

**Invariantes principales:**

- Toda consulta pertenece a un equipo.
- Tipos MVP: propuesta y encuesta.
- Participación y resolución son ejes distintos.
- Resolver o cancelar fuerza `CLOSED`.
- Una consulta cerrada no acepta nuevas respuestas ni cambios.
- Resultado calculado no es resolución.
- Synqo no aplica desempates implícitos.
- Una propuesta tiene al menos dos opciones temporales, fecha obligatoria y hora opcional; no franjas.
- Una respuesta de propuesta es independiente de la disponibilidad general.
- Una encuesta `SINGLE` permite como máximo una selección; `MULTIPLE` permite varias.
- La modalidad de encuesta no cambia tras existir votos.

**Frontera transaccional mínima:**

- Crear propuesta/encuesta con opciones.
- Responder o modificar respuesta.
- Cerrar por deadline o acción explícita.
- Resolver/cancelar + cerrar participación + guardar resolución.

### Access Credential / Session

No se modela como agregado de negocio central en esta fase. Es una preocupación de Identity & Access con persistencia propia y reglas de seguridad. Debe permitir:

- enlaces opacos acotados;
- canje a sesión;
- URL limpia posterior;
- revocación cuando el modelo lo permita;
- autorización server-side.

Su detalle se cerrará en las fases 15 y 16.

## 5. Decisión sobre `Consulta`

### Alternativas consideradas

| Alternativa | Ventajas | Problemas |
|---|---|---|
| Herencia técnica `Consulta -> Propuesta/Encuesta` | Refleja el vocabulario funcional directamente. | Puede acoplar persistencia y código a una jerarquía prematura; no aporta por sí misma reglas nuevas. |
| Tabla/clase única con discriminador | Simplifica lifecycle compartido y resolución. | Puede acumular campos nulos o validaciones condicionales si se fuerza demasiado. |
| Agregados totalmente separados para propuesta y encuesta | Modelos específicos y simples por tipo. | Duplica lifecycle, respuestas, resultado, resolución y autorización. |
| Raíz táctica común `DecisionProcess` con comportamiento por tipo | Comparte invariantes reales sin imponer herencia profunda ni esquema físico definitivo. | Exige disciplina para que las reglas específicas no se dispersen. |

### Decisión

Usar `Consulta` como concepto de producto y `DecisionProcess` como raíz táctica común para diseño de dominio. La implementación no queda obligada a una jerarquía de clases ni a una tabla única; la fase de datos decidirá el mapeo físico más simple para MikroORM/PostgreSQL.

## 6. Casos de uso principales

| Caso de uso | Módulo | Reglas de dominio | Aplicación/infraestructura |
|---|---|---|---|
| Crear equipo rápido | Teams | Modalidad rápida, defaults, zona horaria, participante inicial. | Crear sesión/enlace, persistir transacción. |
| Crear equipo administrable | Teams | Requiere email verificable antes de administración persistente. | Enviar email de verificación. |
| Verificar administración | Teams / Identity & Access | Activar administración primaria y políticas por defecto. | Validar token, abrir sesión administrativa. |
| Unirse/identificarse como participante | Teams | Identidad local única, sin apropiación por nombre. | Canje de enlace/sesión. |
| Vincular participante a cuenta | Identity & Access | No recrear participante ni histórico. | Autenticación de cuenta, auditoría. |
| Actualizar disponibilidad | Availability | Día, estado habilitado, zona horaria del equipo. | Autorización y upsert transaccional. |
| Crear solicitud | Availability | Intervalo válido, destinatarios activos del equipo. | Autorización, deep link interno. |
| Responder solicitud | Availability | Actualiza disponibilidad general. | Persistir varias fechas de forma atómica. |
| Calcular coincidencias | Availability | Recuentos separados y ranking determinista. | Consulta optimizada, cache solo si se justifica. |
| Crear propuesta | Decisions | Mínimo dos opciones, fecha obligatoria, hora opcional, sin franjas. | Autorización y persistencia. |
| Responder propuesta | Decisions | Respuesta por opción, independiente de disponibilidad general. | Idempotencia ante reintentos. |
| Crear encuesta | Decisions | `SINGLE`/`MULTIPLE`, visibilidad, opciones suficientes. | Autorización y persistencia. |
| Votar encuesta | Decisions | Restricción de selección según modalidad. | Idempotencia y concurrencia. |
| Resolver consulta | Decisions | Resultado distinto de resolución, permisos, cierre automático, sin desempate implícito. | Transacción con bloqueo optimista/pesimista según fase 17. |
| Expirar equipo rápido | Teams | Estado no recuperable y eliminación/anonimización irreversible. | Job pg-boss, redacción de tokens/PII. |
| Interpretar petición IA | AI Assistance | El dominio valida restricciones y calcula resultados. | Llamada a proveedor, validación schema, observabilidad sin PII. |

## 7. Dominio vs aplicación vs infraestructura

### Dominio

- Entidades, value objects y reglas invariantes.
- Validación de modalidad, estados, opciones, respuestas y resolución.
- Cálculo determinista de coincidencias, resultados y ranking.
- Políticas puras cuando no requieren IO externo.

### Aplicación

- Orquestación de casos de uso.
- Apertura y cierre de transacciones.
- Autorización contextual usando reglas del dominio y sesión actual.
- Idempotencia de comandos expuestos por API.
- Coordinación entre agregados, por ejemplo responder solicitud y actualizar varias disponibilidades.

### Infraestructura

- Persistencia MikroORM/PostgreSQL.
- Envío de email transaccional.
- Jobs pg-boss.
- Integración con proveedor IA.
- Logging, auditoría técnica y redacción de datos sensibles.

## 8. Límites transaccionales críticos

| Operación | Transacción mínima | Riesgo que evita |
|---|---|---|
| Crear equipo rápido | Equipo + participante inicial + acceso inicial. | Equipo inaccesible o participante huérfano. |
| Verificar administración | Token/verificación + estado administrable + sesión/capacidad admin. | Administración persistente sin prueba válida. |
| Vincular participante a cuenta | Cuenta + participante + prueba de control. | Apropiación de identidad local o pérdida de histórico. |
| Actualizar disponibilidad | Una o varias entradas de disponibilidad del participante. | Estados parciales en respuesta a solicitud. |
| Responder consulta | Consulta abierta + respuesta única por participante/opción o voto. | Respuestas duplicadas o cambios tras cierre. |
| Resolver/cancelar consulta | Consulta + estado cerrado + resolución/cancelación + snapshot mínimo. | Resultado/resolución inconsistentes ante concurrencia. |
| Cambiar configuración de equipo | Equipo administrable + políticas/estados habilitados. | Configuraciones inválidas que rompen flujos posteriores. |
| Expirar equipo rápido | Estado expirado + eliminación/anonimización + invalidación de credenciales. | Recuperación indebida o fuga de PII/tokens. |

## 9. Persistencia y repositorios

La fase 13 no define el esquema físico definitivo. Aun así, para mantener KISS:

- cada módulo NestJS expone casos de uso de aplicación y oculta detalles de MikroORM;
- se evitan repositories genéricos tipo CRUD universal;
- los métodos de persistencia se orientan a casos de uso e invariantes (`findActiveTeamForParticipant`, `saveDecisionResponse`, `lockDecisionForResolution`, etc.);
- las transacciones se abren en la capa de aplicación y protegen invariantes que cruzan entidades;
- se permiten constraints de base de datos para unicidad, FK, estados y consistencia simple, reforzando el dominio.

## 10. Cuestiones para fases posteriores

- Estrategia exacta de identificadores públicos/internos: fase 16/17.
- Estrategia de bloqueo para concurrencia de resolución: fase 17.
- Mapeo físico de `DecisionProcess`, propuesta y encuesta: fase 17.
- Matriz exhaustiva de autorización contextual: fase 15.
- Contrato REST y OpenAPI: fase 18.
- Jobs de expiración y deadlines: fase 20.
- Email transaccional permitido: fase 21.
