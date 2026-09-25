# Patrones de interacción

## Objetivo

Definir patrones operativos comunes para que guardar, responder, resolver, compartir y navegar en Synqo sean predecibles, accesibles y resistentes a errores recuperables.

## Fuentes

- `product/12-user-stories-and-acceptance-criteria.md`
- `product/14-user-flows.md`
- `product/15-screen-specification.md`
- `design/03-design-system/component-catalog.md`
- `design/05-responsive/responsive-behaviour.md`

## Principios

- Las interacciones críticas deben confirmar intención humana antes de cerrar, cancelar, revocar o resolver.
- La entrada del usuario no debe perderse ante errores recuperables siempre que sea posible.
- Las acciones de respuesta y edición son reversibles mientras la Consulta acepte participación.
- Al cerrarse, cancelarse o resolverse una Consulta, las superficies de respuesta pasan a lectura.
- La latencia no debe permitir doble envío ni hacer dudar de si una acción ocurrió.
- Synqo muestra resultados calculados, pero la Resolución siempre es una decisión explícita de una persona autorizada.

## Patrones de guardado

| Interacción | Patrón | Feedback | Error recuperable |
|---|---|---|---|
| Cambiar `Mi disponibilidad` por día | Guardado explícito en sheet/dialog; edición rápida puede usar optimistic update con estado pendiente. | `Guardando…`, estado pendiente en celda/fila, toast de éxito si el cambio no es obvio. | Mantener selección local y permitir reintentar o descartar. |
| Responder solicitud de disponibilidad | Guardado explícito del conjunto de días. | Botón loading, resumen de días cambiados si procede. | Conservar respuestas locales por día y marcar los días no guardados. |
| Crear solicitud | Submit explícito. | Botón loading; redirección a solicitud creada o confirmación. | Mantener formulario y errores por campo. |
| Seleccionar candidatas en disponibilidad colectiva | Estado local inmediato; no persiste por sí mismo como decisión. | Resumen `N fechas seleccionadas`; acción primaria habilitada. | No aplica persistencia hasta crear propuesta; conservar selección al fallar detalle nominal. |
| Crear propuesta | Submit explícito. | Botón loading; bloquear doble submit; navegar a la propuesta creada. | Conservar pregunta, fechas y horas; errores por opción. |
| Responder propuesta | Guardado explícito de todas las opciones visibles/respondidas. | Botón loading; confirmar `Respuesta guardada`. | Mantener selección local; indicar si la consulta se cerró mientras se editaba. |
| Crear encuesta | Submit explícito. | Botón loading; navegar a encuesta creada. | Conservar pregunta, opciones, tipo SINGLE/MULTIPLE y visibilidad de resultados. |
| Votar encuesta | Guardado explícito; SINGLE sustituye selección localmente antes de guardar. | Estado loading y confirmación. | Mantener voto local y permitir reintentar si la encuesta sigue abierta. |
| Settings administrables | Guardado explícito por sección o formulario. | `Cambios sin guardar`, botón loading, confirmación persistente breve. | Mantener valores editados y mostrar validaciones de configuración. |
| IA: interpretar restricciones | Acción explícita `Interpretar`. | Skeleton o loading en panel de interpretación. | Mantener texto original y permitir reintentar o continuar manualmente. |
| IA: buscar candidatos | Acción explícita tras revisar interpretación. | Loading separado del LLM; resultados como candidatos revisables. | Mantener interpretación validada y permitir ajustar restricciones. |

## Confirmaciones

### Requieren confirmación explícita

- Resolver propuesta o encuesta (`UF-10`, `UF-14`).
- Cancelar una Consulta (`UF-16`).
- Revocar enlace, credencial o acceso administrativo.
- Cambiar permisos que dejen a participantes sin capacidad previamente visible.
- Salir de una pantalla con cambios sin guardar.
- Reactivar equipo recuperable cuando la acción tenga consecuencias de lifecycle visibles.
- Operaciones administrativas destructivas o irreversibles.

### No requieren confirmación adicional

- Cambiar una respuesta mientras la Consulta sigue abierta, si hay guardado explícito.
- Editar disponibilidad general mientras no modifique respuestas específicas.
- Copiar un enlace.
- Cambiar entre `Calendario` y `Lista` cuando se conserva contexto.

### Estructura de confirmación

El dialog debe incluir:

- acción en lenguaje de usuario;
- consecuencia principal;
- elemento afectado;
- acción primaria clara;
- acción secundaria de cancelar;
- foco inicial en la acción segura salvo cuando el patrón del componente exija otra cosa.

Ejemplo para resolución:

```text
Resolver propuesta
La opción "15 oct · 19:00" quedará como decisión final y se cerrarán nuevas respuestas.
[Cancelar] [Resolver propuesta]
```

## Loading, retry y latencia

- Un submit bloquea el botón que lo originó y muestra estado loading.
- No bloquear toda la pantalla si solo se guarda una parte.
- Si una operación tarda más de lo esperado, mantener texto de progreso específico: `Guardando respuesta…`, `Publicando propuesta…`.
- El doble submit se evita deshabilitando la acción y usando feedback visible.
- Las operaciones reintentables muestran `Reintentar` cerca del error.
- Un error de red debe distinguirse de una validación de dominio o falta de permisos.
- Los skeletons conservan layout; no reemplazan formularios ya editados.

## Idempotencia y concurrencia desde UX

- Repetir una acción de submit por latencia no debe crear duplicados visibles.
- Si una Consulta se cierra mientras el usuario responde, Synqo debe informar el cambio y pasar la vista a lectura.
- Si una Resolución ya existe al intentar resolver, mostrar la resolución actual y retirar el formulario de resolución.
- Si un enlace fue revocado o expiró, mostrar estado específico en vez de error genérico.
- Si los permisos cambian durante la sesión, explicar que la acción ya no está disponible.
- Los estados pendientes locales nunca deben presentarse como guardados.

## Compartir y deep links

### Compartir enlaces

- `Compartir` abre un sheet/dialog con enlace, copia y explicación breve del alcance.
- `Copiar enlace` usa feedback inmediato: `Enlace copiado`.
- Si copiar falla, mostrar el enlace seleccionable y una instrucción alternativa.
- Enlaces personalizados deben diferenciarse de enlaces públicos cuando la UI los exponga.
- No revelar más identidad o permisos de los necesarios en la superficie de compartir.

### Abrir deep links

- Validar enlace y equipo antes de mostrar acción objetivo.
- Si se requiere identificación, pedirla antes de la acción y retornar al destino.
- Tras responder desde un deep link, ofrecer volver al contexto anterior: propuesta, equipo o inicio.
- Si el enlace está inválido, revocado o expirado, mostrar estado dedicado con siguiente paso posible.

## Edición y lectura

| Estado | Respuestas | Resultados | Resolución |
|---|---|---|---|
| Consulta abierta | Editables según permisos. | Visibles según configuración. | Puede estar pendiente. |
| Participación cerrada por deadline | Read-only. | Visibles según configuración. | Pendiente hasta decisión humana o cancelación. |
| Consulta resuelta | Read-only. | Históricos. | Mostrar decisión final destacada. |
| Consulta cancelada | Read-only. | Históricos si proceden. | Mostrar cancelación, no decisión final. |

Reglas:

- No ocultar respuestas previas al pasar a read-only.
- Mostrar por qué una acción ya no está disponible.
- Conservar separación entre `Resultado actual` y `Decisión final`.
- Una respuesta específica a propuesta no cambia al editar disponibilidad general.

## Navegación y cambios sin guardar

- Cambiar entre vistas equivalentes (`Calendario`/`Lista`) conserva cambios pendientes si pertenecen al mismo contexto.
- Navegar fuera de un formulario con cambios sin guardar abre confirmación.
- Cerrar sheet/dialog con cambios pendientes pide confirmación o conserva borrador local si el patrón lo define.
- El botón Atrás del navegador debe respetar deep links y no perder entrada sin aviso.

## Focus management

- Al abrir dialog/sheet, mover foco al título o primer control relevante.
- Al cerrar, devolver foco al elemento que lo abrió.
- Después de guardar correctamente, devolver foco al área modificada o a la acción siguiente natural.
- Después de error, mover foco al resumen de error o primer campo inválido.
- Los toasts de éxito usan `role=status`; errores persistentes usan `alert` o mensaje asociado al campo.

## Mensajes accesibles

- Éxito breve: `Respuesta guardada`, `Enlace copiado`, `Propuesta publicada`.
- Error recuperable: `No se pudo guardar. Revisa tu conexión y vuelve a intentarlo.`
- Concurrencia: `Esta propuesta se cerró mientras la estabas respondiendo. Tus cambios no se han guardado.`
- Sin permisos: `Esta acción ya no está disponible con tus permisos actuales.`
- Read-only: `Esta consulta está cerrada. Puedes consultar los resultados, pero no responder.`

## Patrones por acción crítica

| Acción | Confirmación | Feedback principal | Read-only/concurrencia |
|---|---|---|---|
| Guardar disponibilidad | No, salvo salir con cambios. | Celda/fila pendiente + éxito/error. | No altera propuestas respondidas. |
| Publicar solicitud | Submit explícito. | Loading + pantalla de solicitud. | Si permisos cambian, explicar bloqueo. |
| Publicar propuesta | Submit explícito. | Loading + propuesta creada. | Validar mínimo de opciones antes de publicar. |
| Publicar encuesta | Submit explícito. | Loading + encuesta creada. | Mantener tipo SINGLE/MULTIPLE. |
| Responder propuesta | Sin confirmación adicional. | Guardado explícito. | Si cierra, pasar a lectura. |
| Votar encuesta | Sin confirmación adicional. | Guardado explícito. | Si cierra, pasar a lectura. |
| Resolver Consulta | Confirmación obligatoria. | Loading + resolución final. | Si ya resuelta, mostrar resolución existente. |
| Cancelar Consulta | Confirmación obligatoria. | Loading + estado cancelado. | Histórico conserva información previa. |
| Revocar enlace | Confirmación obligatoria. | Loading + enlace revocado. | Deep links futuros muestran estado revocado. |
| Copiar enlace | No. | Toast/status. | Si falla, enlace seleccionable. |

## Decisiones de interacción

| ID | Decisión |
|---|---|
| `INT-01` | Crear, responder, votar y configurar usan guardado explícito por defecto. |
| `INT-02` | Cambios de disponibilidad pueden usar feedback optimista solo si se distinguen de guardado confirmado. |
| `INT-03` | Resolver, cancelar y revocar siempre requieren confirmación explícita. |
| `INT-04` | Los errores recuperables conservan la entrada local siempre que sea posible. |
| `INT-05` | Deep links retornan al contexto objetivo y explican estados inválidos/revocados/expirados. |
| `INT-06` | Las superficies de respuesta pasan a read-only al cerrarse, resolverse o cancelarse la Consulta. |

## Cuestiones abiertas

No hay decisiones bloqueantes para esta fase. La redacción exacta de microcopy se concretará en `design/08-content/08-PROMPT-microcopy-y-contenido.md`.

## Referencias cruzadas

- `UF-05`…`UF-16`
- `UF-20`
- `UF-21`
- `UF-AI-01`
- `HU-DIS-01`…`HU-DIS-03`
- `HU-PRO-01`…`HU-PRO-04`
- `HU-ENC-01`…`HU-ENC-05`
- `HU-CON-01`…`HU-CON-03`
- `SCR-12`…`SCR-23`
- `SCR-AI-01`
