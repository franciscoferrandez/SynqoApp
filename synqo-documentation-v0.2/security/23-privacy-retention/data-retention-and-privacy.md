# 23 - Data Retention and Privacy

## 1. Proposito

Este documento define la politica de minimizacion, conservacion, eliminacion y anonimizacion de datos de Synqo para el MVP. Concreta `OPEN-07`, `RNF-PRIV-*`, ADR-015 y el modelo de datos/jobs ya disenado.

No es asesoramiento juridico. Es una especificacion de producto y diseno tecnico para construir una version que minimice PII, sea coherente con GDPR y pueda implementarse con PostgreSQL, MikroORM y pg-boss.

## 2. Principios

- El `Equipo` es la frontera principal de datos.
- Las capacidades esenciales funcionan sin cuenta, por lo que los equipos rapidos deben evitar PII obligatoria.
- Los datos se conservan mientras sirven al proposito funcional documentado.
- Un equipo rapido expirado definitivamente no es recuperable.
- Tras expiracion definitiva de un equipo rapido, la politica preferente es **borrado fisico de datos de dominio y credenciales**.
- Solo pueden sobrevivir metricas agregadas y trazas operativas minimizadas, sin tokens ni PII innecesaria.
- `AGGREGATED` en encuestas no equivale a anonimato fuerte mientras el equipo existe.
- La IA recibe contexto minimo y nunca disponibilidad nominal salvo decision futura explicita.

## 3. Categorias de datos

| Categoria | Ejemplos | Proposito | Base funcional en Synqo | Retencion MVP | Eliminacion/anonimizacion | Acceso |
|---|---|---|---|---|---|---|
| Cuenta | `accounts.emailNormalized`, verificacion, sesiones de cuenta | Identidad global, agregacion de pendientes/historico vinculado | Cuenta opcional y continuidad entre equipos | Mientras la cuenta exista o hasta baja/deshabilitacion futura | Baja futura: eliminar/anonimizar cuenta y revocar sesiones; no borra automaticamente historico local de equipos administrables sin politica especifica | Titular de cuenta; sistema; soporte minimo futuro |
| Participante local | `participants.displayName`, estado activo, `joinedAt` | Identidad local dentro de equipo y autoria | Participacion sin cuenta | Mientras exista el equipo; en rapido hasta purga definitiva | Rapido expirado: borrado fisico con el equipo. Administrable: conservar para historico mientras equipo exista; inactivo no se elimina ordinariamente | Participantes activos del equipo segun matriz; admin donde proceda |
| Email administrativo | `administrative_identities.emailNormalized` | Verificar/recuperar administracion | Equipo administrable sin cuenta | Mientras el equipo administrable este activo/verificado | Archivo/baja futura del equipo: anonimizar o eliminar segun politica futura; tokens asociados se purgan | Administrador verificado; sistema; proveedor email para envio |
| Disponibilidad general | `availability_entries` por dia/estado | Responder "cuando podemos" y calcular coincidencias | Coordinacion temporal | Mientras el equipo exista; rapido hasta purga definitiva | Rapido expirado: borrado fisico. Administrable: conservar mientras equipo exista para historico/continuidad | Participante propio; colectivo del equipo segun permisos |
| Solicitudes de disponibilidad | `availability_requests`, snapshots de destinatarios | Pedir actualizacion de disponibilidad y mostrar progreso | Flujo de disponibilidad | Mientras el equipo exista; rapido hasta purga definitiva | Rapido expirado: borrado fisico junto con snapshots | Participantes activos/admin segun matriz |
| Consultas y opciones | `decision_processes`, `decision_options`, detalles de propuesta/encuesta | Propuestas, encuestas, deadlines, resultado/resolucion | Decisiones del equipo | Mientras el equipo exista; rapido hasta purga definitiva | Rapido expirado: borrado fisico | Participantes activos/admin segun matriz |
| Respuestas y votos | `decision_responses`, `proposal_response_options`, `survey_response_options` | Resultado, pendientes, historico y resolucion | Responder propuestas/encuestas | Mientras el equipo exista; rapido hasta purga definitiva | Rapido expirado: borrado fisico. `AGGREGATED` solo oculta presentacion, no borra vinculo interno mientras vive el equipo | Participante propio; resultado nominal/agregado segun visibilidad y permisos |
| Resoluciones e historico | `decision_resolutions`, snapshots de resultado, historico de equipo | Mantener decision explicita y trazabilidad de equipo | Diferenciar resultado/resolucion | Mientras el equipo exista; rapido hasta purga definitiva | Rapido expirado: borrado fisico; pueden sobrevivir contadores agregados no reversibles | Participantes activos/admin; cuenta vinculada solo para agregados autorizados |
| Tokens y sesiones | `access_credentials`, `*_sessions`, token hashes, metadata de TTL | Acceso, deep links, verificacion, recovery, seguridad | Identidad contextual y acceso sin cuenta | Hasta expiracion/revocacion + retencion corta de seguridad | Purga periodica. Rapido expirado: revocacion inmediata y borrado fisico de credenciales/sesiones del equipo | Sistema; nunca usuario final en claro |
| Audit entries | `domain_audit_entries` minimizadas | Diagnostico, seguridad, repudiacion minima | Operaciones sensibles y jobs | Equipos vivos: mientras equipo exista o ventana operacional. Rapido expirado: conservar solo si queda sin PII | Para rapido expirado, eliminar entradas con actor/resource identificable o anonimizar a contadores/eventos sin actor | Operacion/sistema; no UI normal |
| Logs tecnicos | logs JSON, errores, correlation id | Diagnostico y seguridad | Operacion del servicio | Retencion corta configurable por entorno | Redaccion de tokens/emails/cookies; rotacion y expiracion automatica | Equipo tecnico autorizado |
| Telemetria/product analytics | eventos agregados, latencia, funnels | Validar producto/TFM sin PII innecesaria | Medicion de adopcion y calidad | Agregada y limitada; detalle en fase 24 | No incluir tokens, emails, nombres ni payloads nominales; agregacion por periodo/capacidad | Equipo de producto/TFM |
| Prompts IA y resultados | texto usuario, metadata proveedor/modelo, structured output | Interpretar lenguaje natural y evaluar IA | AI-F01 / TFM | No retener prompt completo por defecto en produccion; dataset evaluacion versionado separado y curado | En produccion registrar metadata minimizada; texto solo en modo diagnostico/evaluacion con consentimiento o dataset curado | Servicio IA; evaluacion TFM controlada |
| Datos enviados a proveedores | email, links, texto IA, metadata IdP | Email transaccional, auth, IA | Integraciones externas aceptadas | Segun proveedor y configuracion contractual | Minimizar payload; no enviar tokens salvo link necesario por email; no enviar disponibilidad nominal al LLM | Proveedor correspondiente y sistema |

## 4. Politica para equipos rapidos

### 4.1 Lifecycle de privacidad

| Estado | Politica |
|---|---|
| `ACTIVE` | Mantener datos necesarios para disponibilidad, consultas, historico, links y sesiones. |
| `RECOVERABLE` | Mantener datos completos para permitir reactivacion humana valida. No exponer como activo normal sin accion de reactivacion. |
| `EXPIRED` | Estado terminal. Revocar credenciales y sesiones inmediatamente. Encolar purga irreversible. |
| Purga completada | Borrado fisico de datos de dominio y credenciales del equipo rapido. Solo pueden quedar metricas agregadas y trazas tecnicas minimizadas sin PII/tokens. |

### 4.2 Decision de cierre de `OPEN-07`

`OPEN-07` queda cerrado con esta politica:

- Para equipos rapidos expirados definitivamente se adopta **borrado fisico preferente** de datos de dominio, identidades locales, disponibilidad, solicitudes, consultas, respuestas, resoluciones, sesiones y credenciales.
- La anonimizacion se reserva solo para trazas operativas o metricas agregadas donde el borrado fisico impida operar o medir el sistema, y siempre sin nombres, emails, tokens, ids publicos reutilizables ni payloads nominales.
- Si un participante de equipo rapido estaba vinculado a una cuenta, el vinculo local se borra con el equipo; la cuenta global puede conservarse, pero pierde ese equipo en sus agregados.
- Un equipo rapido purgado no puede recuperarse ni convertirse posteriormente en administrable.

### 4.3 Ejecucion tecnica

`JOB-LIFE-02 purge.expiredQuickTeam` ejecuta la purga de forma idempotente:

1. Verifica que `teams.mode=QUICK` y `quickState=EXPIRED`.
2. Revoca sesiones y credenciales del equipo si aun no fueron revocadas.
3. Borra, dentro de transacciones acotadas, datos dependientes del equipo:
   - sesiones contextuales;
   - `access_credentials`;
   - enlaces participante-cuenta locales;
   - disponibilidad y solicitudes;
   - consultas, opciones, respuestas, votos y resoluciones;
   - participantes;
   - audit entries con actor/recurso identificable;
   - equipo.
4. Registra solo resultado operacional minimizado: `teamId` interno si todavia es necesario durante la ejecucion, modo, filas afectadas por tipo, duracion y errores sin PII.
5. Si hay fallo parcial, el job puede reintentarse; las operaciones deben tolerar filas ya eliminadas.

Cuando se prefiera evitar delete cascades implicitas opacas, la implementacion debe borrar por orden explicito y usar FK `ON DELETE CASCADE` solo como red de seguridad ya prevista por el modelo.

## 5. Equipos administrables

Los equipos administrables son persistentes en el MVP. No se define borrado real ordinario en esta fase porque archivo/restauracion queda fuera del MVP. Mientras el equipo exista:

- se conserva historico para continuidad y trazabilidad del equipo;
- participantes inactivos permanecen para no reescribir decisiones pasadas;
- emails administrativos se conservan como prueba de administracion y canal de recovery;
- tokens/sesiones caducados se limpian segun politica de credenciales.

Una politica futura de archivo/baja de equipo administrable debera definir exportacion, retencion, eliminacion o anonimizacion antes de implementarse.

## 6. Tokens, sesiones y credenciales

| Dato | Retencion | Politica |
|---|---|---|
| Token claro | No se persiste | Solo existe en URL/email hasta canje; se redacciona en logs. |
| Token hash | Hasta expiracion/revocacion + ventana corta de seguridad | Purga por `cleanup.credentialsAndSessions`. |
| `VerificationLink` / `RecoveryLink` | TTL corto; one-time | Marcar `usedAt` y purgar hash/metadata tras ventana operacional. |
| `IdentifiedLink` | TTL 7 dias default, maximo 30 si UX lo exige | Revocable; hash y metadata purgados al expirar/revocar segun cleanup. |
| Sesiones contextuales | TTL definido en fase 16 | Revocar por logout, expiracion, recovery o equipo rapido expirado. |
| Metadata anti-abuso | Minimizada | `ipPrefix` y `userAgentHash`, sin IP completa salvo necesidad operacional justificada. |

Ventana corta de seguridad significa conservar solo metadata necesaria para detectar replay/abuso reciente. La duracion exacta es parametro operativo, no debe extenderse para guardar PII por comodidad.

## 7. Proveedores externos

### Resend / Mailpit

Puede recibir:

- email administrativo o email de cuenta necesario para el envio;
- asunto y plantilla transaccional minima;
- enlace de verificacion/recovery/cuenta con token opaco cuando sea imprescindible;
- locale o variables de plantilla no sensibles.

No debe recibir:

- disponibilidad nominal;
- votos/respuestas;
- directorio de participantes;
- tokens adicionales o secretos internos;
- historico del equipo.

### IdP / autenticacion de cuenta

Si se usa IdP u OIDC:

- enviar solo identificadores necesarios para autenticar cuenta;
- no enviar `ParticipantSession`, disponibilidad, votos ni historico de equipo;
- la cuenta autenticada no sustituye permisos contextuales de participante/admin.

### Proveedor LLM

Puede recibir:

- texto libre introducido por el usuario para interpretar;
- fecha actual, locale y zona horaria del equipo;
- vocabulario de estados/capacidades soportadas;
- schema/version de prompt;
- limites estructurales necesarios, por ejemplo rango maximo permitido o numero maximo de candidatos.

No debe recibir:

- nombres de participantes;
- emails;
- disponibilidad nominal;
- votos o respuestas nominales;
- tokens, cookies, ids internos o public refs sensibles;
- historico del equipo.

El calculo de candidatos se realiza en Synqo tras validar la salida estructurada. Si en una evolucion futura se quisiera enviar agregados de disponibilidad al LLM, requerira decision explicita, revision de privacidad y actualizacion de este documento.

## 8. Logs, auditoria y telemetria

### Logs tecnicos

- Redaccion obligatoria de tokens, cookies, authorization headers, emails y query params sensibles.
- No registrar request/response completo en canje, recovery, verificacion, IA ni mutaciones con payload nominal.
- Correlation id y codigos de error estables son preferibles a payloads.

### Auditoria de dominio

Se auditan operaciones sensibles: cambios de settings, resolucion/cancelacion, recovery/verificacion, revocacion de links, purga y rechazos relevantes. La auditoria no es event sourcing ni fuente para reconstruir dominio.

Para equipos rapidos purgados, la auditoria identificable se elimina o se transforma en conteos operativos no reversibles.

### Telemetria de producto

La telemetria debe medir uso sin incluir nombres, emails, tokens, disponibilidad nominal ni votos nominales. La fase 24 concretara taxonomia de eventos; este documento fija el limite de privacidad.

## 9. Consideraciones GDPR de diseno

Estas pautas orientan el diseno, sin sustituir revision legal:

- **Minimizacion:** no pedir cuenta/email para participar en equipos rapidos.
- **Limitacion de finalidad:** cada categoria de datos tiene proposito funcional explicito.
- **Limitacion de conservacion:** equipos rapidos tienen expiracion y purga irreversible.
- **Integridad y confidencialidad:** autorizacion por equipo, tokens hasheados, logs redaccionados.
- **Transparencia:** la UI debe comunicar temporalidad de equipos rapidos y que encuesta agregada no implica anonimato fuerte.
- **Derechos de usuario:** una cuenta futura debe permitir gestionar cuenta; en equipos locales sin cuenta, la prueba de control es la sesion/link contextual.
- **Procesadores:** Resend/IdP/LLM deben configurarse con minimizacion de payload y contratos/configuracion acordes antes de produccion.

## 10. Controles de aceptacion

- `OPEN-07` cerrado con borrado fisico preferente para equipos rapidos expirados.
- `purge.expiredQuickTeam` puede implementarse con tablas y jobs existentes.
- `cleanup.credentialsAndSessions` cubre credenciales/sesiones caducadas sin token claro.
- IA no recibe disponibilidad nominal, nombres ni emails.
- Resend recibe solo datos necesarios para email transaccional.
- Logs y telemetria excluyen tokens y PII innecesaria.
- Los documentos de modelo/jobs no mantienen "fase 23" como decision pendiente.

## 11. Referencias

- `PRD.md`
- `product/19-open-questions.md`
- `product/10-non-functional-requirements.md`
- `architecture/adr/ADR-015-security.md`
- `technical-design/17-data-model/data-model.md`
- `technical-design/20-jobs-events/jobs-and-events.md`
- `product/18-ai-feature-specification.md`
