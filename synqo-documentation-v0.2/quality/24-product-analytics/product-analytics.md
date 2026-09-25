# 24 - Product Analytics

## 1. Proposito

Este documento convierte las metricas conceptuales del PRD en una taxonomia minima, medible y respetuosa con privacidad para validar Synqo durante el TFM.

La analitica de producto no es auditoria, no sustituye logs tecnicos y no debe capturar datos sin finalidad. Su objetivo es responder, con eventos agregables, si los recorridos principales de Synqo funcionan con baja friccion:

- `E2E-01`: coordinacion temporal.
- `E2E-02`: decision colectiva.
- `E2E-03`: uso administrable/persistente.
- Ruta IA del TFM como asistencia opcional.

## 2. Principios de privacidad

- No capturar nombres, emails, tokens, cookies, texto libre, titulos, descripciones, opciones, razones de resolucion ni prompts completos.
- No capturar disponibilidad nominal ni votos nominales.
- No capturar ids internos ni referencias publicas directamente.
- Usar identificadores pseudonimos no reversibles cuando haga falta medir continuidad.
- Preferir propiedades categoricas, booleanas, conteos y duraciones.
- Cada evento debe tener un proposito de medida explicito.
- Los eventos de equipos rapidos expirados deben respetar la politica de purga: solo metricas agregadas y trazas minimizadas.

## 3. Identidad y pseudonimizacion

| Identificador analitico | Alcance | Uso permitido | No permitido |
|---|---|---|---|
| `analyticsTeamId` | Equipo | Agrupar eventos de un equipo durante su vida util. | Derivarlo de `teamId`/`teamRef` sin HMAC/pepper o exponerlo al cliente como id estable reutilizable. |
| `analyticsActorId` | Participante/cuenta/admin pseudonimo | Medir continuidad, respuesta y friccion sin nombre/email. | Reutilizarlo entre equipos salvo cuenta global autenticada y con finalidad explicita. |
| `analyticsSessionId` | Sesion web efimera | Calcular abandono y tiempos de flujo. | Usarlo como tracking cross-site o conservarlo mas alla de la ventana necesaria. |
| `analyticsAccountId` | Cuenta, si existe | Medir vinculacion y uso agregado de cuenta. | Inferir identidad de participantes sin cuenta. |

Recomendacion de diseno: generar pseudonimos server-side con HMAC usando secreto de analitica y salt/version por entorno. La taxonomia no exige proveedor externo.

## 4. Propiedades comunes

### Permitidas en todos los eventos

| Propiedad | Tipo | Motivo |
|---|---|---|
| `schemaVersion` | string | Versionar la taxonomia. |
| `eventName` | string | Nombre estable del evento. |
| `occurredAt` | timestamp truncable | Orden temporal y duraciones. |
| `analyticsTeamId` | string/null | Agrupar por equipo cuando aplica. |
| `actorKind` | enum | `ANON`, `PARTICIPANT`, `ACCOUNT_PARTICIPANT`, `ADMIN`, `ACCOUNT_ADMIN`, `SYSTEM`. |
| `teamMode` | enum | `QUICK`, `MANAGED`. |
| `entrySurface` | enum/null | `PUBLIC_LINK`, `IDENTIFIED_LINK`, `ACCOUNT_HOME`, `TEAM_HOME`, `MANUAL`, `AI_ASSISTANT`. |
| `clientKind` | enum/null | `MOBILE_WEB`, `DESKTOP_WEB`, `TABLET_WEB`, si se detecta de forma minimizada. |
| `locale` | string/null | Solo locale de interfaz, no ubicacion precisa. |

### Prohibidas en todos los eventos

- `displayName`, email, telefono o identificadores de contacto.
- Token claro, token hash, cookies, authorization headers.
- `teamRef`, `participantRef`, `decisionRef`, `requestRef`, `linkId`.
- Texto libre: nombres de equipo, titulos, descripciones, opciones, razones, prompts IA.
- Estado nominal por participante o votos/opciones seleccionadas nominales.
- IP completa o user-agent completo.

## 5. Taxonomia de eventos

### Equipo e identidad

| Evento | Cuando se emite | Proposito | Propiedades permitidas especificas | Prohibido |
|---|---|---|---|---|
| `team_created` | Equipo creado correctamente | Medir adopcion y mix rapido/administrable | `teamMode`, `createdWithAccount: boolean`, `adminVerificationRequired: boolean` | nombre del equipo, email admin |
| `managed_team_verified` | Email admin verificado y equipo activado | Medir friccion de administrable | `timeFromTeamCreatedSeconds`, `verificationAttemptBucket` | email, token |
| `participant_joined` | Participante local creado/identificado | Medir incorporacion sin cuenta | `joinedFrom`, `hasAccount: boolean`, `teamParticipantCountBucket` | displayName |
| `account_linked` | Participante o admin se vincula a cuenta | Medir tasa de vinculacion posterior | `linkType: PARTICIPANT_TO_ACCOUNT|ADMIN_TO_ACCOUNT`, `teamAgeBucket`, `teamMode` | account email, participantRef |
| `quick_team_reactivated` | Equipo rapido recoverable vuelve a active por accion humana | Medir reutilizacion real | `recoverableAgeBucket`, `reactivatedByKind` | nombres, ids directos |
| `quick_team_expired` | Equipo rapido pasa a `EXPIRED` | Medir temporalidad y purga | `ageSinceLastRelevantActivityBucket`, `participantCountBucket`, `domainRowsPurgedBucket` si se emite tras purga | datos de dominio purgados |

### Disponibilidad y solicitudes

| Evento | Cuando se emite | Proposito | Propiedades permitidas especificas | Prohibido |
|---|---|---|---|---|
| `availability_updated` | Participante guarda disponibilidad general | Medir actividad y friccion de respuesta | `daysTouchedBucket`, `source: DIRECT|REQUEST_RESPONSE`, `statusKindsUsedCount`, `timeFromJoinSeconds` | fechas exactas, estado por dia, participante nominal |
| `collective_availability_viewed` | Se consulta disponibilidad colectiva | Medir uso de "cuando podemos" | `viewMode: CALENDAR|LIST`, `dateRangeDaysBucket`, `participantCountBucket` | disponibilidad nominal |
| `availability_matches_viewed` | Se ven candidatas deterministas | Medir uso de coincidencias | `candidateCountBucket`, `dateRangeDaysBucket`, `hasTieLikeResult: boolean` | fechas concretas si no son necesarias |
| `availability_request_created` | Se crea solicitud | Medir uso de solicitudes | `rangeDaysBucket`, `hasDeadline: boolean`, `createdByPolicyKind` | titulo |
| `availability_request_responded` | Participante responde/actualiza desde solicitud | Medir tasa/tiempo de respuesta | `timeFromRequestCreatedSeconds`, `daysTouchedBucket` | estados por fecha |
| `availability_request_closed` | Solicitud se cierra por actor o deadline | Medir cierre y participacion | `closedBy: ACTOR|DEADLINE`, `responseRateBucket`, `timeToCloseSeconds` | lista nominal de pendientes |

### Propuestas

| Evento | Cuando se emite | Proposito | Propiedades permitidas especificas | Prohibido |
|---|---|---|---|---|
| `proposal_created` | Propuesta creada | Medir paso de coincidencias a consulta temporal | `optionCountBucket`, `hasTime: boolean`, `hasDeadline: boolean`, `createdFrom: MATCHES|MANUAL|AI_ASSISTANT` | titulo, descripcion, fechas exactas |
| `proposal_responded` | Participante responde propuesta | Medir tasa/tiempo de respuesta | `timeFromProposalCreatedSeconds`, `optionCountBucket`, `statusKindsUsedCount` | estados por opcion, fechas/opciones |
| `proposal_closed` | Participacion de propuesta se cierra sin resolver o antes de resolver | Medir deadlines/abandono | `closedBy: ACTOR|DEADLINE|RESOLUTION`, `responseRateBucket`, `timeToCloseSeconds` | participantes pendientes nominales |
| `proposal_resolved` | Resolucion explicita de propuesta | Medir decisiones completadas | `timeFromProposalCreatedSeconds`, `timeFromCloseSeconds`, `responseRateBucket`, `resolvedByKind`, `selectedOptionCount` | opcion seleccionada, razon |
| `proposal_cancelled` | Propuesta cancelada | Medir friccion/fallo | `timeFromProposalCreatedSeconds`, `responseRateBucket`, `cancelledByKind` | razon libre |

### Encuestas

| Evento | Cuando se emite | Proposito | Propiedades permitidas especificas | Prohibido |
|---|---|---|---|---|
| `survey_created` | Encuesta creada | Medir decisiones no temporales | `surveyMode: SINGLE|MULTIPLE`, `visibility: NOMINAL|AGGREGATED`, `optionCountBucket`, `hasDeadline: boolean` | titulo, opciones |
| `survey_voted` | Participante vota/actualiza voto | Medir tasa/tiempo de voto | `timeFromSurveyCreatedSeconds`, `selectionCountBucket`, `surveyMode` | opcion elegida |
| `survey_closed` | Participacion de encuesta se cierra | Medir cierre y participacion | `closedBy: ACTOR|DEADLINE|RESOLUTION`, `responseRateBucket`, `timeToCloseSeconds` | participantes pendientes nominales |
| `survey_resolved` | Resolucion explicita de encuesta | Medir decisiones completadas | `timeFromSurveyCreatedSeconds`, `timeFromCloseSeconds`, `responseRateBucket`, `surveyMode`, `selectedOptionCount` | opciones seleccionadas, razon |
| `survey_cancelled` | Encuesta cancelada | Medir friccion/fallo | `timeFromSurveyCreatedSeconds`, `responseRateBucket`, `surveyMode` | razon libre |

### Pendientes, historico e IA

| Evento | Cuando se emite | Proposito | Propiedades permitidas especificas | Prohibido |
|---|---|---|---|---|
| `pending_item_opened` | Usuario abre un pendiente | Medir utilidad de pendientes/deep links | `pendingKind: AVAILABILITY_REQUEST|PROPOSAL|SURVEY`, `openedFrom: TEAM_HOME|ACCOUNT_HOME|LINK`, `ageBucket` | titulo/ref |
| `history_viewed` | Usuario abre historico de equipo | Medir continuidad/reutilizacion | `filterKind`, `teamMode`, `resolvedItemCountBucket` | titulos o resultados nominales |
| `ai_interpretation_requested` | Usuario solicita interpretacion IA | Medir uso TFM | `textLengthBucket`, `locale`, `teamMode` | texto/prompt |
| `ai_interpretation_completed` | IA devuelve OK/clarificacion/unsupported/error | Medir calidad IA sin payload | `status: OK|NEEDS_CLARIFICATION|UNSUPPORTED|ERROR`, `latencyBucket`, `promptVersion`, `schemaVersion`, `candidateCountBucket` | texto original, salida completa si contiene contenido usuario |
| `ai_candidates_applied_to_proposal` | Usuario usa candidatos revisados para crear propuesta | Medir utilidad real de IA | `candidateCountBucket`, `timeFromInterpretationSeconds` | fechas concretas si no son necesarias |

## 6. Metricas del PRD

| Metrica PRD | Fuente | Calculable | Notas de privacidad |
|---|---|---|---|
| Tasa de respuesta | `availability_request_created/responded/closed`, `proposal_created/responded/resolved`, `survey_created/voted/resolved` | Si | Usar conteos agregados y buckets; no listas nominales. |
| Tiempo de respuesta | eventos `*_created` -> `*_responded` por pseudonimo contextual | Si | Guardar duraciones o timestamps truncados; no exponer identidad real. |
| Tiempo hasta propuesta | `team_created`/`availability_matches_viewed` -> `proposal_created` | Si | Puede calcularse por `analyticsTeamId`. |
| Tiempo hasta resolucion | `proposal_created/survey_created` -> `proposal_resolved/survey_resolved` | Si | No requiere opcion seleccionada. |
| Consultas resueltas | `proposal_resolved`, `survey_resolved` | Si | Por tipo, equipo y periodo. |
| Reutilizacion de equipos rapidos | `quick_team_reactivated`, eventos de actividad por `analyticsTeamId`, `quick_team_expired` | Si | Solo durante vida util; tras purga conservar agregados. |
| Proporcion de participantes sin cuenta | `participant_joined.hasAccount`, `account_linked` | Si | No requiere email ni nombre. |
| Tasa de vinculacion posterior | `participant_joined` -> `account_linked` | Si | Por equipo/periodo, con pseudonimo. |
| Asistencia IA sin bloquear flujo manual | `ai_*`, `proposal_created.createdFrom`, comparacion con flujos manuales | Si | No retener prompts completos en produccion. |

No se definen objetivos numericos en esta fase; el PRD pide observar sin fijar umbrales arbitrarios previos a medicion.

## 7. Funnels

### E2E-01 - Coordinacion temporal

| Paso | Evento principal | Metrica de friccion |
|---|---|---|
| Crear/abrir equipo rapido | `team_created` | abandono antes de primer participante adicional |
| Incorporar participantes | `participant_joined` | tiempo desde creacion a N participantes |
| Registrar disponibilidad | `availability_updated` | tasa de participantes con disponibilidad |
| Ver coincidencias | `availability_matches_viewed` | tiempo desde primera disponibilidad a matches |
| Crear propuesta | `proposal_created` | conversion matches -> propuesta |
| Responder propuesta | `proposal_responded` | tasa/tiempo de respuesta |
| Resolver | `proposal_resolved` | tiempo total a resolucion |

### E2E-02 - Decision colectiva

| Paso | Evento principal | Metrica de friccion |
|---|---|---|
| Crear encuesta | `survey_created` | tiempo desde equipo activo a encuesta |
| Votar | `survey_voted` | tasa/tiempo de voto |
| Ver/cerrar resultado | `survey_closed` opcional | cierre por deadline vs actor |
| Resolver | `survey_resolved` | tiempo a resolucion y conversion voto -> resolucion |

### E2E-03 - Uso administrable/persistente

| Paso | Evento principal | Metrica de friccion |
|---|---|---|
| Crear administrable | `team_created(teamMode=MANAGED)` | inicio de flujo |
| Verificar admin | `managed_team_verified` | tiempo a verificacion |
| Incorporar participantes | `participant_joined` | conversion equipo verificado -> participantes |
| Configurar/usar | eventos de solicitud/consulta/resolucion | actividad continuada |
| Vincular cuenta | `account_linked` | tasa de continuidad |

### Ruta IA TFM

| Paso | Evento principal | Metrica de friccion/calidad |
|---|---|---|
| Solicitar interpretacion | `ai_interpretation_requested` | adopcion de IA |
| Recibir resultado | `ai_interpretation_completed` | status, latencia, errores |
| Usar candidatos | `ai_candidates_applied_to_proposal` + `proposal_created(createdFrom=AI_ASSISTANT)` | utilidad real de IA |
| Resolver propuesta | `proposal_resolved` | comparacion con flujo manual sin capturar contenido |

## 8. Buckets recomendados

Para reducir sensibilidad y estabilizar reporting:

| Tipo | Buckets |
|---|---|
| Conteos de participantes | `1`, `2-3`, `4-6`, `7-12`, `13+` |
| Opciones/candidatos | `1`, `2`, `3-5`, `6-10`, `11+` |
| Dias/rangos | `1`, `2-3`, `4-7`, `8-14`, `15-30`, `31+` |
| Duraciones | `<1m`, `1-5m`, `5-30m`, `30m-2h`, `2h-24h`, `1-7d`, `7d+` |
| Ratio de respuesta | `0%`, `1-33%`, `34-66%`, `67-99%`, `100%` |
| Longitud texto IA | `1-50`, `51-150`, `151-300`, `301+` caracteres |

Si una metrica necesita precision para calculo interno, se puede calcular server-side y emitir el bucket, no el valor bruto.

## 9. Estrategia minima de instrumentacion

- Instrumentar en servidor los eventos de dominio completados, despues de commit.
- Instrumentar en cliente solo interacciones de vista/funnel que no existan como evento de dominio, por ejemplo `collective_availability_viewed`, `pending_item_opened` o `history_viewed`.
- Enviar eventos mediante un puerto interno `ProductAnalyticsPort` o equivalente, sin elegir proveedor en esta fase.
- Validar eventos contra un schema versionado antes de aceptarlos.
- Mantener allowlist de propiedades por evento; descartar propiedades no reconocidas.
- Separar product analytics de audit logs y security logs.
- En tests y desarrollo permitir sink local/fake.
- En produccion aplicar muestreo o agregacion si el volumen no aporta valor adicional.

## 10. Versionado y gobernanza

- `schemaVersion` inicial: `product-analytics.v1`.
- Los nombres de eventos son `snake_case` y no se renombran sin deprecacion.
- Propiedades nuevas deben tener proposito de medida y revision de privacidad.
- Propiedades prohibidas se rechazan antes de persistir/enviar.
- Cambios de significado requieren version nueva.
- La fase 25 debe incluir tests de contrato para schemas de eventos y redaccion de datos sensibles.

## 11. Eventos descartados deliberadamente

| Evento no capturado | Motivo |
|---|---|
| Clicks genericos de navegacion | Ruido sin relacion directa con metricas PRD. |
| Texto de busqueda/filtros libres | Riesgo de PII y bajo valor para MVP. |
| Fechas exactas de disponibilidad/propuesta | Pueden revelar patrones personales; buckets bastan. |
| Opcion seleccionada en encuesta/propuesta | Es dato sensible de decision; no hace falta para metricas PRD. |
| Directorio de participantes visto por nombre | No aporta metrica necesaria y expone comportamiento nominal. |
| Prompt IA completo en produccion | Riesgo de PII; la evaluacion IA usara dataset controlado. |

## 12. Referencias

- `PRD.md`
- `product/03-users-and-scenarios.md`
- `product/17-traceability-matrix.md`
- `security/23-privacy-retention/data-retention-and-privacy.md`
