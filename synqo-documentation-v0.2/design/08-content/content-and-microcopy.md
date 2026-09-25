# Microcopy y contenido

## Objetivo

Definir el lenguaje de interfaz de Synqo para que la coordinación sea clara, breve y accionable, sin filtrar términos técnicos innecesarios ni confundir conceptos clave del dominio.

## Fuentes

- `product/05-ubiquitous-language.md`
- `product/07-business-rules.md`
- `product/13-information-architecture.md`
- `product/15-screen-specification.md`
- `design/07-ui-states/ui-state-catalogue.md`

## Principios de tono

- Breve: una frase principal y una acción clara.
- Claro: usar términos del producto cuando aportan precisión.
- No paternalista: explicar consecuencias sin dramatizar.
- Orientado a acción: cada estado debe indicar qué puede hacerse ahora.
- Honesto con la incertidumbre: distinguir `Quizá`, `Sin respuesta`, `Resultado` y `Decisión final`.
- Sin jerga técnica: evitar `OPEN`, `CLOSED`, `RESOLVED`, tokens, jobs, lifecycle o claims internos en UI.

## Etiquetas UX finales

| Dominio | Etiqueta UI | Uso |
|---|---|---|
| `Equipo` | Equipo | Contexto principal. No sustituir por "grupo" en navegación principal. |
| `Equipo rápido` | Equipo rápido | Badge y creación. Añadir "temporal" donde ayude. |
| `Equipo administrable` | Equipo administrable | Creación, configuración y badges. |
| `Participante` | Participante | Detalle, configuración y permisos. |
| `Cuenta` | Cuenta | Nivel global y vinculación. |
| `Consulta` | Decisión / Decisiones | Navegación y agrupación UX. Mantener Consulta en documentación técnica/producto. |
| `Propuesta` | Propuesta | Decisión con fechas. |
| `Encuesta` | Encuesta | Decisión con opciones genéricas. |
| `Resultado` | Resultado actual | Recuentos calculados. Nunca "decisión". |
| `Resolución` | Decisión final | Elección explícita registrada por persona autorizada. |
| `Disponible` | Disponible | Estado positivo. |
| `Quizá` | Quizá | Estado intermedio; no decir "casi disponible". |
| `No disponible` | No disponible | Estado negativo declarado. |
| `Sin respuesta` | Sin respuesta | Ausencia de dato; nunca "No". |
| `Solicitud de disponibilidad` | Solicitud de disponibilidad | Pantallas de solicitud/respuesta. |
| `Acceso identificado` | Enlace personal | UI de compartir/entrada cuando proceda. |
| `Acceso administrativo` | Acceso de administración | Verificación y recuperación. |

## Navegación y acciones

| Contexto | Etiqueta |
|---|---|
| Navegación móvil equipo | `Inicio`, `Disponibilidad`, `Decisiones`, `Más` |
| Disponibilidad individual | `Mi disponibilidad` |
| Disponibilidad agregada | `Disponibilidad del equipo` |
| Crear solicitud | `Solicitar disponibilidad` |
| Crear propuesta | `Proponer fechas` |
| Crear encuesta | `Crear encuesta` |
| Resolver Consulta | `Registrar decisión final` / `Resolver propuesta` / `Resolver encuesta` |
| Cancelar Consulta | `Cancelar propuesta` / `Cancelar encuesta` |
| Compartir equipo | `Compartir equipo` |
| Vincular equipo rápido | `Añadir a mi cuenta` |

La acción común `Crear` puede abrir opciones, pero cada opción debe usar el término específico.

## Onboarding y creación

### Equipo rápido

Título:

```text
Crear equipo rápido
```

Texto:

```text
Empieza sin cuenta. Este equipo es temporal y podrás compartirlo por enlace.
```

Aviso breve:

```text
Los equipos rápidos se conservan mientras haya actividad. Si pasan 30 días sin actividad, entran en recuperación.
```

No usar:

- `caducará pronto` sin fecha o contexto;
- `perderás todo` como amenaza;
- lenguaje de cuenta obligatoria.

### Equipo administrable

Título:

```text
Crear equipo administrable
```

Texto:

```text
Usa una identidad administrativa verificable para configurar permisos y mantener el equipo a largo plazo.
```

Verificación:

```text
Verifica tu email para activar la administración del equipo.
```

## Temporalidad, recuperación y expiración

| Estado | Mensaje recomendado | Acción |
|---|---|---|
| Equipo rápido activo | `Equipo rápido · temporal` | `Añadir a mi cuenta` si aplica. |
| Recuperable | `Este equipo está en periodo de recuperación. Confirma que sigues usándolo para reactivarlo.` | `Reactivar equipo` |
| Expirado | `Este equipo rápido ha expirado definitivamente. Sus datos ya no se pueden recuperar.` | `Crear nuevo equipo` |
| Vinculado a cuenta | `Añadido a tu cuenta. Sigue siendo un equipo rápido temporal.` | `Ver mis equipos` |

## Compartir y enlaces

### Compartir equipo

```text
Comparte este enlace con quienes vayan a participar en el equipo.
```

Acciones:

- `Copiar enlace`
- `Compartir`
- `Crear enlace personal` solo si el flujo lo soporta.

Éxito:

```text
Enlace copiado.
```

Fallo:

```text
No se pudo copiar automáticamente. Selecciona el enlace y cópialo manualmente.
```

### Enlaces inválidos/revocados/expirados

| Estado | Mensaje |
|---|---|
| Inválido | `Este enlace no es válido. Revisa que lo hayas copiado completo.` |
| Revocado | `Este enlace fue revocado. Pide un enlace nuevo para continuar.` |
| Expirado | `Este enlace ha expirado. Pide un enlace nuevo o vuelve al equipo si ya tienes acceso.` |

## Permisos

Principio: explicar la acción no disponible, no culpar al usuario.

Mensajes:

- `No puedes crear solicitudes en este equipo con tus permisos actuales.`
- `Solo la administración puede cambiar esta configuración.`
- `Esta acción ya no está disponible porque la consulta está cerrada.`
- `No tienes acceso a la configuración de este equipo.`

No usar:

- `Error 403`;
- `Forbidden`;
- `No autorizado` sin contexto.

## Resultado y decisión final

Regla obligatoria:

- `Resultado actual` = recuentos calculados.
- `Decisión final` = resolución humana registrada.

Textos:

```text
Resultado actual
```

```text
Todavía sin decisión final
```

```text
Decisión final registrada
```

```text
Esta opción tiene más disponibilidad, pero la decisión final todavía no se ha registrado.
```

No usar:

- `Ganador` para una opción no resuelta;
- `Mejor fecha decidida automáticamente`;
- `La IA ha elegido`.

## Resolución y cancelación

### Resolver propuesta

```text
Resolver propuesta
```

```text
La opción seleccionada quedará como decisión final y se cerrarán nuevas respuestas.
```

Acciones:

- `Cancelar`
- `Resolver propuesta`

### Resolver encuesta

```text
Resolver encuesta
```

```text
La selección quedará como decisión final y se cerrarán nuevas respuestas.
```

### Cancelar

```text
Cancelar propuesta
```

```text
La propuesta dejará de aceptar respuestas y se conservará en el histórico como cancelada.
```

No usar "eliminar" si el histórico se conserva.

## Disponibilidad

| Estado | Descripción breve | Texto accesible |
|---|---|---|
| Disponible | `Puedes ese día.` | `Disponible` |
| Quizá | `Puede que puedas.` | `Quizá` |
| No disponible | `No puedes ese día.` | `No disponible` |
| Sin respuesta | `Aún no hay respuesta.` | `Sin respuesta` |

Ayuda:

```text
Tu disponibilidad general ayuda a encontrar coincidencias. No cambia tus respuestas a propuestas concretas.
```

## Validaciones de formularios

| Campo/contexto | Mensaje |
|---|---|
| Nombre de equipo vacío | `Escribe un nombre para el equipo.` |
| Identificación de participante vacía | `Escribe cómo quieres aparecer en este equipo.` |
| Email administrativo vacío | `Escribe un email para verificar la administración.` |
| Email inválido | `Escribe un email válido.` |
| Propuesta con menos de dos fechas | `Añade al menos dos fechas para publicar la propuesta.` |
| Opción de propuesta sin fecha | `Cada opción necesita una fecha.` |
| Hora inválida | `Usa una hora válida o deja el campo vacío.` |
| Encuesta sin pregunta | `Escribe la pregunta de la encuesta.` |
| Encuesta con menos de dos opciones | `Añade al menos dos opciones.` |
| Opción duplicada | `Ya existe una opción con ese texto.` |
| Deadline inválido | `Elige una fecha límite válida o deja el campo vacío.` |
| Configuración de disponibilidad inválida | `Mantén al menos Disponible o No disponible activo.` |
| Cambios sin guardar | `Tienes cambios sin guardar.` |

## Estados vacíos

| Contexto | Mensaje | Acción |
|---|---|---|
| Inicio global sin equipos | `Aún no tienes equipos vinculados.` | `Crear equipo` |
| Inicio de equipo sin pendientes | `No hay nada pendiente ahora.` | `Ver disponibilidad` |
| Sin disponibilidad | `Todavía no hay disponibilidad indicada para este rango.` | `Indicar disponibilidad` |
| Sin decisiones | `Aún no hay propuestas ni encuestas.` | `Crear` |
| Sin histórico | `Todavía no hay decisiones cerradas.` | Volver a `Decisiones` |
| Sin participantes visibles | `Todavía no hay participantes visibles.` | `Compartir equipo` si procede. |
| IA sin candidatos | `No encontramos fechas con esas restricciones.` | `Ajustar restricciones` |

## Errores y recuperación

| Caso | Mensaje | Acción |
|---|---|---|
| Error recuperable | `No se pudo completar. Inténtalo de nuevo.` | `Reintentar` |
| Sin conexión | `Sin conexión. Puedes revisar lo cargado y volver a intentarlo cuando tengas conexión.` | `Reintentar` |
| Datos desactualizados | `La información ha cambiado. Actualiza antes de continuar.` | `Actualizar` |
| Consulta cerrada durante edición | `Esta consulta se cerró mientras respondías. Tus cambios no se han guardado.` | `Ver resultados` |
| Fallo IA | `No se pudo usar el asistente ahora. Puedes seguir seleccionando fechas manualmente.` | `Seleccionar manualmente` |

## Glosario dominio → UI

| Dominio | UI |
|---|---|
| Consulta | Decisión / Decisiones |
| Resolución | Decisión final |
| Resultado | Resultado actual |
| Access token/link | Enlace |
| Administrative identity | Identidad administrativa |
| PendingVerification | Verificación pendiente |
| Recoverable | En recuperación |
| Expired | Expirado definitivamente |
| OPEN | Abierta |
| CLOSED | Cerrada |
| RESOLVED | Resuelta |
| CANCELLED | Cancelada |
| UNANSWERED | Sin respuesta |

## Decisiones de contenido

| ID | Decisión |
|---|---|
| `CONTENT-01` | `Equipo` se mantiene como etiqueta UI principal; no se sustituye por grupo. |
| `CONTENT-02` | `Decisiones` es la etiqueta de navegación para Propuestas y Encuestas; `Consulta` queda como término de dominio. |
| `CONTENT-03` | UI usa `Resultado actual` y `Decisión final` para separar cálculo y resolución. |
| `CONTENT-04` | El equipo rápido se comunica como temporal sin lenguaje alarmista. |
| `CONTENT-05` | `Sin respuesta` siempre se nombra explícitamente y nunca se abrevia como `No`. |

## Cuestiones abiertas

No hay decisiones bloqueantes. Los textos podrán ajustarse tras validación de usabilidad sin cambiar las decisiones semánticas.

## Referencias cruzadas

- `BR-EQ-07`…`BR-EQ-09`
- `BR-DIS-01`…`BR-DIS-10`
- `BR-CON-02`
- `BR-RES-01`
- `RNF-US-02`…`RNF-US-05`
- `STATE-01`…`STATE-05`
