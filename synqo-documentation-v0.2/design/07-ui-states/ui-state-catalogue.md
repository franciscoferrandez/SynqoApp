# Catálogo de estados UI

## Objetivo

Documentar los estados de interfaz de Synqo para cubrir carga, error, permisos, enlaces y lifecycles de dominio sin confundir fallos técnicos con estados normales del producto.

## Fuentes

- `product/08-lifecycles.md`
- `product/10-non-functional-requirements.md`
- `product/15-screen-specification.md`
- `design/06-interactions/interaction-patterns.md`

## Principios

- Un estado de negocio no debe presentarse como error técnico.
- Un error técnico recuperable debe ofrecer reintento y preservar contexto.
- Los enlaces inválidos, revocados y expirados tienen mensajes y acciones distintos.
- Los estados por color siempre requieren texto, icono o estructura redundante.
- Las respuestas y formularios pasan a lectura cuando la lifecycle ya no admite cambios.

## Estados transversales

| Estado | Uso | Mensaje base | Acciones disponibles | Acciones prohibidas | Navegación/contexto | Accesibilidad/responsive |
|---|---|---|---|---|---|---|
| `Empty` | Lista o vista sin elementos. | `Todavía no hay contenido aquí.` | Crear si hay permiso; volver; explorar sección relacionada. | Simular datos o ocultar la sección crítica. | Preserva filtros y ruta. | En móvil incluir acción primaria visible. |
| `Loading` | Operación inicial o submit. | `Cargando…` / verbo específico. | Cancelar solo si es seguro; esperar. | Doble submit; navegación destructiva sin aviso. | Mantiene ruta. | `aria-busy`; no anunciar cambios repetidos. |
| `Skeleton` | Carga con layout previsible. | Sin mensaje salvo región. | Ninguna directa. | Sustituir formularios ya editados. | Mantiene layout. | Respeta `prefers-reduced-motion`. |
| `Stale` | Datos visibles pero posiblemente antiguos. | `La información puede no estar actualizada.` | Actualizar; continuar en lectura. | Resolver o publicar basándose en datos obsoletos sin refrescar cuando afecte decisión. | Preserva vista y selección. | Usar `Alert` no intrusivo. |
| `Offline` | Sin conexión detectada. | `Sin conexión. Puedes revisar lo cargado.` | Reintentar; conservar cambios locales. | Confirmar operaciones que requieran servidor. | Preserva borradores locales. | Mensaje persistente; no solo toast. |
| `Retry` | Fallo recuperable. | `No se pudo completar. Inténtalo de nuevo.` | Reintentar; editar; cancelar. | Perder entrada local. | Preserva formulario/selección. | Botón `Reintentar` cercano al error. |
| `PermissionDenied` | Usuario sin permiso para acción/vista. | `No tienes permiso para esta acción.` | Volver; solicitar acceso fuera de MVP si existe; ver en lectura si procede. | Mostrar controles activos que fallarán. | Mantiene contexto para explicar bloqueo. | No usar solo icono de candado. |
| `NotFound` | Recurso inexistente o no visible. | `No encontramos este contenido.` | Volver a equipo/inicio; revisar enlace. | Revelar si existe en otro equipo. | No preserva detalle inexistente. | Mensaje neutro por privacidad. |
| `InvalidLink` | Link mal formado o desconocido. | `Este enlace no es válido.` | Volver al inicio; pedir nuevo enlace. | Identificar participante o mostrar datos. | No establece sesión. | Distinguir de expirado/revocado. |
| `RevokedLink` | Link válido en forma pero revocado. | `Este enlace fue revocado.` | Pedir nuevo enlace; volver. | Usar credencial antigua. | No establece sesión nueva. | Tratamiento de seguridad, no error genérico. |
| `ExpiredLink` | Link o recurso asociado ya expirado. | `Este enlace ha expirado.` | Volver; crear nuevo equipo/solicitud si aplica. | Reactivar automáticamente. | Puede explicar lifecycle. | Distinguir de equipo recuperable. |
| `GenericError` | Fallo no clasificado. | `Algo no ha ido bien.` | Reintentar; volver; reportar si existe. | Mostrar trazas técnicas al usuario. | Preserva contexto si hay datos locales. | `role=alert` si bloquea. |

## Estados de dominio

### Equipo rápido

| Estado | Mensaje base | Acciones disponibles | Acciones prohibidas | Navegación/contexto | Accesibilidad/responsive |
|---|---|---|---|---|---|
| `Active` | `Equipo rápido · temporal.` | Compartir, disponibilidad, solicitudes, propuestas, encuestas, vincular a cuenta. | Ocultar temporalidad. | Navegación normal de equipo. | `TeamTypeBadge` visible. |
| `Recoverable` | `Este equipo rápido está en periodo de recuperación.` | Reactivar con interacción humana válida; consultar información permitida; volver. | Reactivar por visita pasiva, bot, preview o job. | Preservar destino tras reactivar. | Alert persistente, acción clara. |
| `Expired` | `Este equipo rápido ha expirado definitivamente.` | Volver; crear nuevo equipo. | Recuperar datos, credenciales o respuestas. | No preservar acciones internas. | No presentar como error técnico; explicar irreversibilidad. |

### Equipo administrable

| Estado | Mensaje base | Acciones disponibles | Acciones prohibidas | Navegación/contexto | Accesibilidad/responsive |
|---|---|---|---|---|---|
| `PendingVerification` | `Verifica la identidad administrativa para activar la administración.` | Reenviar/verificar si procede; volver; leer instrucciones. | Acceso administrativo persistente antes de verificar. | Preserva creación/configuración pendiente. | Pantalla `SCR-05`, foco en acción de verificación. |
| `Active` | `Equipo administrable.` | Configuración, permisos, participantes, acceso y seguridad según permisos. | Mostrar configuración a quien no tenga acceso. | Navegación normal. | Badge explícito. |
| `Archived` futuro | `Equipo archivado.` | No se diseña para MVP salvo como nota futura. | Implementar controles MVP. | Fuera de alcance. | Backlog, no UI requerida ahora. |

### Solicitud de disponibilidad

| Estado | Mensaje base | Acciones disponibles | Acciones prohibidas | Navegación/contexto | Accesibilidad/responsive |
|---|---|---|---|---|---|
| `Open` | `Solicitud abierta.` | Responder, editar respuesta, compartir si hay permiso. | Resolver como Consulta. | Deep link lleva a responder. | Lista de días operable en móvil. |
| `Closed` | `Solicitud cerrada.` | Ver respuestas/resultado si procede. | Enviar o editar disponibilidad desde esa solicitud. | Mantener lectura histórica. | Controles en read-only. |

### Consulta

La Consulta combina participación y resolución.

| Estado | Mensaje base | Acciones disponibles | Acciones prohibidas | Navegación/contexto | Accesibilidad/responsive |
|---|---|---|---|---|---|
| `OPEN + PENDING` | `Consulta abierta.` | Responder/votar, editar respuesta, ver resultados si configuración lo permite, cancelar/resolver según permisos. | Presentar resultado como decisión final. | Deep link a acción objetivo. | Acciones visibles y separadas de resultado. |
| `CLOSED + PENDING` | `La participación está cerrada. Falta decisión final.` | Ver resultados; resolver/cancelar si hay permiso. | Responder o editar respuesta. | Preserva detalle de Consulta. | `ParticipationStatus` cerrado y `ResolutionStatus` pendiente. |
| `CLOSED + RESOLVED` | `Decisión final registrada.` | Ver resultado histórico y resolución. | Editar respuestas, cambiar resolución sin flujo futuro explícito. | Va a histórico/detalle. | Resolución destacada sin ocultar resultado. |
| `CLOSED + CANCELLED` | `Consulta cancelada.` | Ver histórico si procede. | Responder, resolver o presentar decisión final. | Va a histórico/detalle. | Estado neutral/danger según contexto; texto obligatorio. |

### Deadline reached

| Estado | Mensaje base | Acciones disponibles | Acciones prohibidas | Navegación/contexto | Accesibilidad/responsive |
|---|---|---|---|---|---|
| `DeadlineReached` | `El plazo de participación ha terminado.` | Ver resultados; resolver/cancelar si hay permiso. | Responder o votar. | Mantiene detalle de Consulta. | Mensaje persistente; no toast efímero. |

### Disponibilidad y participación

| Estado | Mensaje base | Acciones disponibles | Acciones prohibidas | Navegación/contexto | Accesibilidad/responsive |
|---|---|---|---|---|---|
| `NoResponse` | `Sin respuesta.` | Indicar disponibilidad/respuesta si la ventana está abierta. | Tratar como `No disponible`. | Preserva calendario/lista. | Símbolo/texto/patrón, no solo color. |
| `ParticipantInactive` | `Participante inactivo.` | Ver histórico cuando proceda. | Incluir en destinatarios activos futuros o disponibilidad futura. | Mantiene registros históricos. | Distinguir de participante activo sin respuesta. |

## Enlaces: inválido, revocado y expirado

| Caso | Causa | Mensaje | Acción primaria | Acción secundaria |
|---|---|---|---|---|
| Inválido | Token mal formado, inexistente o no reconocible. | `Este enlace no es válido.` | Volver al inicio. | Pedir un enlace nuevo. |
| Revocado | Token reconocido pero deshabilitado. | `Este enlace fue revocado.` | Pedir un enlace nuevo. | Volver al equipo si ya hay acceso por otra vía. |
| Expirado | Token o recurso superó su vigencia. | `Este enlace ha expirado.` | Volver al inicio/equipo. | Crear o solicitar nuevo acceso si procede. |

Estos casos no deben compartir un único `GenericError`, porque tienen implicaciones distintas de seguridad, privacidad y recuperación.

## Variantes responsive

- `Empty`, `PermissionDenied`, `InvalidLink`, `RevokedLink`, `ExpiredLink` y `Expired` pueden ocupar pantalla completa en móvil.
- `Loading`, `Retry`, `Stale` y errores parciales deben poder aparecer dentro de regiones sin desplazar toda la pantalla.
- En desktop, estados bloqueantes pueden aparecer en panel principal con navegación lateral visible si no compromete privacidad.
- Los estados de calendario (`NoResponse`, loading parcial, retry de periodo) deben preservar fecha ancla y selección.

## Tratamiento accesible

- Estados bloqueantes usan título visible y texto descriptivo.
- Errores recuperables usan `role=alert` si requieren acción inmediata.
- Éxitos y cambios no bloqueantes usan `role=status`.
- Estados por color requieren texto y/o símbolo.
- Al pasar a read-only, el foco no debe quedarse en un control deshabilitado; debe moverse al mensaje o primer elemento útil.
- Enlaces inválidos/revocados/expirados no deben crear bucles de foco ni reintentos automáticos.

## Decisiones de estado

| ID | Decisión |
|---|---|
| `STATE-01` | Los estados técnicos y los estados de negocio se documentan y renderizan de forma separada. |
| `STATE-02` | Enlace inválido, revocado y expirado son tres estados distintos. |
| `STATE-03` | Equipo rápido `Recoverable` es estado accionable; `Expired` es terminal e irreversible. |
| `STATE-04` | Consulta cerrada pendiente de resolución es read-only para respuestas, pero accionable para resolver/cancelar según permisos. |
| `STATE-05` | `Sin respuesta` es estado de ausencia de dato, no error ni voto negativo. |

## Cuestiones abiertas

No hay decisiones bloqueantes. El copy final de cada mensaje se refinará en el prompt de microcopy.

## Referencias cruzadas

- `SCR-05`
- `SCR-12`…`SCR-24`
- `SCR-29`
- `SCR-30`
- `RNF-US-04`
- `RNF-A11Y-01`…`RNF-A11Y-03`
- `RNF-REL-01`
- `RNF-REL-02`
- `INT-01`…`INT-06`
