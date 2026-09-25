# 13 — Domain Invariants

## 1. Propósito

Este documento enumera invariantes de dominio y límites transaccionales que deben preservarse durante el diseño técnico posterior. No sustituye a los requisitos funcionales; los traduce a reglas implementables y testeables.

La prioridad inicial viene de `product/09b-requirements-prioritization.md`: los invariantes `Must` y los RNF `Release blocker` deben tratarse como condiciones de validez de la primera versión.

## 2. Invariantes globales

| ID | Invariante | Fuente principal | Implicación técnica |
|---|---|---|---|
| INV-GLO-01 | `Equipo` es el contexto principal de participantes, disponibilidad, consultas e histórico. | D-PROD-001, PRD | Toda entidad contextual debe poder validarse contra `teamId`. |
| INV-GLO-02 | `Cuenta`, `Participante` y `Administrador` son identidades distintas. | D-PROD-002, PRD | No usar `userId` genérico para autorización contextual. |
| INV-GLO-03 | La participación básica puede existir sin cuenta. | RF-ID-01, RF-ID-03 | Ningún flujo esencial debe requerir `accountId`. |
| INV-GLO-04 | Participar no equivale a administrar. | RF-ID-08 | Capacidades administrativas requieren prueba separada. |
| INV-GLO-05 | Toda autorización sensible se valida en servidor. | RNF-SEC-03, BR-RES-04 | La UI solo oculta acciones; la API decide. |
| INV-GLO-06 | No hay acceso entre equipos por enumeración o IDOR. | RNF-SEC-05 | Toda consulta/mutación comprueba equipo y capacidad contextual. |

## 3. Equipo y participantes

| ID | Invariante | Falla si... | Transacción afectada |
|---|---|---|---|
| INV-TEAM-01 | Todo equipo tiene modalidad `QUICK` o `MANAGED`. | Existe equipo sin modalidad o con modalidad mixta. | Crear equipo. |
| INV-TEAM-02 | Cada equipo tiene una zona horaria IANA canónica. | Se crean disponibilidades/propuestas sin zona estable. | Crear equipo, cambiar zona futura. |
| INV-TEAM-03 | Un equipo rápido no tiene administración formal. | Un enlace/admin persistente gobierna un rápido. | Crear equipo, verificar admin. |
| INV-TEAM-04 | Un equipo rápido siempre expira según política. | Cuenta o vinculación evita `Recoverable`/`Expired`. | Vincular cuenta, jobs de expiración. |
| INV-TEAM-05 | Un equipo rápido `Expired` no es recuperable. | Una sesión o enlace antiguo reabre el equipo. | Expirar equipo, canjear enlace. |
| INV-TEAM-06 | La expiración definitiva elimina o anonimiza irreversiblemente datos de dominio y credenciales. | Quedan tokens o PII recuperables innecesarios. | Job de expiración. |
| INV-TEAM-07 | Un equipo administrable requiere identidad administrativa verificable. | Se concede administración solo por conocer enlace público. | Crear/activar administrable. |
| INV-TEAM-08 | En MVP hay una única identidad administrativa primaria. | Se crean administradores equivalentes no modelados. | Verificación/recuperación admin. |
| INV-TEAM-09 | Un participante pertenece exactamente a un equipo. | Un participante local se comparte entre equipos. | Crear participante. |
| INV-TEAM-10 | Un participante puede existir sin cuenta. | `accountId` se vuelve obligatorio. | Crear/unirse como participante. |
| INV-TEAM-11 | Vincular cuenta no recrea participante ni histórico. | Cambia autoría o se duplica identidad local. | Vincular participante. |
| INV-TEAM-12 | No se vincula participante automáticamente por nombre. | Un usuario reclama identidad solo por display name. | Identificación/vinculación. |
| INV-TEAM-13 | Un participante inactivo no es destinatario futuro, pero permanece en histórico. | Se recalculan resultados pasados o se borra autoría. | Desactivar participante. |

## 4. Configuración y políticas

| ID | Invariante | Falla si... | Transacción afectada |
|---|---|---|---|
| INV-POL-01 | En equipo rápido, `AVAILABLE`, `MAYBE` y `UNAVAILABLE` están siempre habilitados. | Se deshabilita un estado en rápido. | Crear/actualizar equipo. |
| INV-POL-02 | En equipo administrable no pueden deshabilitarse simultáneamente `AVAILABLE` y `UNAVAILABLE`. | Queda solo `MAYBE` o ningún estado operativo. | Cambiar configuración. |
| INV-POL-03 | Las políticas administrables de creación son `EVERYONE` o `ADMINISTRATORS`. | Aparecen subconjuntos arbitrarios o roles genéricos. | Cambiar configuración. |
| INV-POL-04 | La política de resolución administrable es `EVERYONE` o `ADMINISTRATORS`. | Se resuelve con rol no modelado o subconjunto arbitrario. | Resolver consulta, cambiar configuración. |
| INV-POL-05 | En MVP, solicitudes y consultas se dirigen a todos los participantes activos. | Se seleccionan destinatarios parciales arbitrarios. | Crear solicitud/consulta. |

## 5. Disponibilidad y coincidencias

| ID | Invariante | Falla si... | Transacción afectada |
|---|---|---|---|
| INV-AVA-01 | La disponibilidad general es por día, no por franjas. | Se guarda hora/intervalo en disponibilidad general. | Actualizar disponibilidad. |
| INV-AVA-02 | Solo `AVAILABLE`, `MAYBE` y `UNAVAILABLE` son estados declarables. | Se declara `UNANSWERED`. | Actualizar disponibilidad. |
| INV-AVA-03 | `UNANSWERED` se deriva de ausencia de respuesta. | Se persiste como decisión negativa o estado editable. | Agregación/lectura. |
| INV-AVA-04 | `UNAVAILABLE` no equivale a `UNANSWERED`. | Cálculo o UI los fusiona. | Coincidencias/resultados. |
| INV-AVA-05 | `MAYBE` es señal positiva débil, no `AVAILABLE`. | Ranking o resultado lo cuenta como disponible pleno. | Ranking de coincidencias. |
| INV-AVA-06 | Cambiar disponibilidad general no modifica respuestas previas de propuestas. | Respuestas a propuestas se recalculan automáticamente. | Actualizar disponibilidad. |
| INV-AVA-07 | Las fechas se interpretan en la zona horaria canónica del equipo. | Usuario/servidor usan zonas distintas para la misma fecha. | Crear disponibilidad/propuesta/IA. |
| INV-AVA-08 | Los recuentos colectivos mantienen separados los cuatro estados. | Solo se guarda un score total. | Agregación. |
| INV-AVA-09 | La ordenación de candidatos es determinista. | Dos ejecuciones equivalentes ordenan distinto sin criterio. | Calcular coincidencias. |

## 6. Solicitudes de disponibilidad

| ID | Invariante | Falla si... | Transacción afectada |
|---|---|---|---|
| INV-REQ-01 | Una solicitud tiene intervalo inicio/fin válido. | Fin anterior a inicio o rango ausente. | Crear solicitud. |
| INV-REQ-02 | Responder solicitud actualiza disponibilidad general. | Se crea un estado paralelo de disponibilidad de solicitud. | Responder solicitud. |
| INV-REQ-03 | Una solicitud cerrada no acepta nuevas respuestas salvo reapertura explícitamente soportada. | Se modifica disponibilidad vía solicitud cerrada. | Responder/cerrar solicitud. |
| INV-REQ-04 | En MVP no hay notificaciones externas automáticas por solicitud. | Publicar solicitud dispara email/push de actividad. | Crear solicitud, jobs. |

## 7. Consulta, propuesta y encuesta

| ID | Invariante | Falla si... | Transacción afectada |
|---|---|---|---|
| INV-DEC-01 | Tipos MVP de consulta: `PROPOSAL` y `SURVEY`. | Se crea tipo no soportado. | Crear consulta. |
| INV-DEC-02 | Toda consulta pertenece a un equipo. | Consulta sin `teamId` o compartida entre equipos. | Crear consulta. |
| INV-DEC-03 | Participación y resolución son ejes separados. | Se confunde cerrar respuestas con decidir. | Cerrar/resolver. |
| INV-DEC-04 | Combinaciones válidas: `OPEN/PENDING`, `CLOSED/PENDING`, `CLOSED/RESOLVED`, `CLOSED/CANCELLED`. | Consulta `OPEN/RESOLVED` o `OPEN/CANCELLED`. | Cerrar/resolver/cancelar. |
| INV-DEC-05 | Resolver o cancelar fuerza participación `CLOSED`. | Consulta resuelta sigue aceptando respuestas. | Resolver/cancelar. |
| INV-DEC-06 | Una consulta cerrada no acepta nuevas respuestas ni cambios. | Reintentos o enlaces antiguos mutan estado cerrado. | Responder consulta. |
| INV-DEC-07 | Resultado y resolución son distintos. | Un ranking/empate decide automáticamente. | Calcular/resolver. |
| INV-DEC-08 | No hay desempates implícitos. | El sistema elige ganador por orden interno. | Calcular resultado/resolver. |
| INV-DEC-09 | No se modifican opciones sustancialmente si ya hay respuestas. | Cambia el significado de votos/respuestas existentes. | Editar consulta. |
| INV-DEC-10 | Ausencia de respuesta no es respuesta negativa. | Pendiente cuenta como no disponible o voto no. | Calcular resultado. |
| INV-DEC-11 | Participante incorporado durante apertura puede responder. | Se le bloquea por no estar al crear consulta. | Responder consulta. |
| INV-DEC-12 | Participante incorporado tras cierre no se añade retrospectivamente como pendiente. | Histórico cambia al entrar nuevos miembros. | Cerrar consulta, calcular pendientes. |

## 8. Propuestas

| ID | Invariante | Falla si... | Transacción afectada |
|---|---|---|---|
| INV-PRO-01 | Una propuesta tiene al menos dos opciones temporales. | Se crea con cero/una opción. | Crear propuesta. |
| INV-PRO-02 | Cada opción temporal tiene fecha obligatoria y hora opcional. | Se crea sin fecha o con intervalo. | Crear propuesta. |
| INV-PRO-03 | No hay franjas horarias en MVP. | Se guarda rango horario como opción. | Crear/editar propuesta. |
| INV-PRO-04 | La respuesta es independiente por opción. | Una respuesta global aplica a todas las opciones. | Responder propuesta. |
| INV-PRO-05 | Varias opciones pueden quedar `AVAILABLE` para un participante. | Se fuerza selección única en propuesta. | Responder propuesta. |
| INV-PRO-06 | La respuesta de propuesta es distinta de disponibilidad general. | Actualizar una altera la otra. | Responder propuesta, actualizar disponibilidad. |
| INV-PRO-07 | La resolución de propuesta selecciona exactamente una opción temporal. | Se resuelve con ninguna o varias opciones. | Resolver propuesta. |
| INV-PRO-08 | Las opciones temporales usan la zona horaria canónica del equipo. | La fecha/hora cambia por zona de cliente. | Crear/resolver propuesta. |

## 9. Encuestas

| ID | Invariante | Falla si... | Transacción afectada |
|---|---|---|---|
| INV-SUR-01 | Una encuesta se crea como `SINGLE` o `MULTIPLE`. | Se crea modalidad inexistente. | Crear encuesta. |
| INV-SUR-02 | `SINGLE` permite como máximo una opción por participante. | Un voto single selecciona varias. | Votar encuesta. |
| INV-SUR-03 | `MULTIPLE` permite varias opciones. | Se limita a una por error. | Votar encuesta. |
| INV-SUR-04 | La modalidad no cambia tras existir votos. | Se reinterpretan votos previos. | Editar encuesta. |
| INV-SUR-05 | La visibilidad puede ser `NOMINAL` o `AGGREGATED`. | Se promete anonimato fuerte. | Crear/mostrar encuesta. |
| INV-SUR-06 | `AGGREGATED` no significa anonimato fuerte. | Se elimina vínculo interno necesario o se comunica anonimato falso. | Mostrar resultados. |
| INV-SUR-07 | Resolución `SINGLE` contiene una opción; `MULTIPLE`, una o varias. | Resolución contradice modalidad. | Resolver encuesta. |

## 10. IA

| ID | Invariante | Falla si... | Transacción afectada |
|---|---|---|---|
| INV-AI-01 | El LLM no calcula disponibilidad, coincidencias ni votos. | Un resultado IA sustituye el cálculo determinista. | Interpretar/calc candidatos. |
| INV-AI-02 | El LLM no publica, resuelve, cancela ni muta el dominio. | Una respuesta IA ejecuta comandos de dominio. | Cualquier flujo IA. |
| INV-AI-03 | El flujo manual permanece disponible. | Fallo de proveedor bloquea coordinar. | Crear propuesta manual. |
| INV-AI-04 | La IA recibe contexto mínimo y sin disponibilidad nominal innecesaria. | Se envía PII o datos nominales no necesarios. | Llamada a proveedor IA. |
| INV-AI-05 | Las fechas relativas se resuelven con fecha actual, locale de interfaz y zona horaria del equipo. | “mañana” produce fecha distinta según cliente/servidor. | Interpretar restricciones. |
| INV-AI-06 | El usuario revisa fechas concretas antes de aplicar. | Se crea propuesta sin revisión humana. | Crear desde IA. |

## 11. Límites transaccionales recomendados

| ID | Operación | Debe incluir en la misma transacción | Puede quedar fuera |
|---|---|---|---|
| TX-01 | Crear equipo rápido | Equipo, configuración rápida, participante inicial, actividad relevante inicial. | Envío/visualización de enlace. |
| TX-02 | Crear equipo administrable | Equipo pendiente, email administrativo objetivo, token/verificación inicial. | Entrega efectiva del email. |
| TX-03 | Verificar administración | Validar token, activar administración primaria, establecer políticas por defecto, invalidar token usado. | Email de confirmación. |
| TX-04 | Identificar participante | Crear/recuperar participante local y sesión/acceso identificado. | Métricas analíticas. |
| TX-05 | Vincular participante a cuenta | Prueba de cuenta, participante local, vínculo, auditoría mínima. | Recalcular vistas agregadas. |
| TX-06 | Responder solicitud | Validar solicitud abierta y actualizar disponibilidades del intervalo. | Cálculo posterior de vistas si es derivado. |
| TX-07 | Actualizar disponibilidad | Upsert de estados diarios del participante y actividad relevante. | Recalcular cache de calendario si existe. |
| TX-08 | Crear consulta | Consulta, opciones, creador, estado inicial y actividad relevante. | Notificaciones externas, fuera de MVP. |
| TX-09 | Responder consulta | Consulta abierta, respuesta/voto idempotente y actividad relevante. | Recalcular materializado si no es necesario. |
| TX-10 | Cerrar por deadline | Cambio a `CLOSED/PENDING` y auditoría mínima. | Email/push de cierre, fuera de MVP. |
| TX-11 | Resolver consulta | Bloquear consulta, validar permiso, cerrar participación, registrar resolución y snapshot/contexto mínimo. | Métricas agregadas. |
| TX-12 | Cancelar consulta | Bloquear consulta, cerrar participación, registrar cancelación y motivo opcional. | Métricas agregadas. |
| TX-13 | Cambiar configuración | Equipo administrable, políticas, estados habilitados y auditoría. | Re-render de UI. |
| TX-14 | Expirar equipo rápido | Cambiar lifecycle, invalidar credenciales, eliminar/anonimizar dominio y PII según política. | Métricas agregadas sin PII. |

## 12. Reglas de diseño para tests posteriores

- Cada `INV-*` `Must` debe mapearse al menos a un test unitario de dominio o de aplicación en la fase de testing.
- Cada `TX-*` crítico debe tener test de integración con PostgreSQL/Testcontainers cuando haya implementación.
- La resolución concurrente debe probarse con dos intentos simultáneos.
- La idempotencia de respuestas debe cubrir reintentos de red y doble submit.
- Las reglas IA deben probar que el fallback manual no depende del proveedor.
