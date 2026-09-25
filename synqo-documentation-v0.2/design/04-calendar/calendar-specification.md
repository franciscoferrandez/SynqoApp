# Especificación de calendario de disponibilidad

## Objetivo

Diseñar el comportamiento de `Mi disponibilidad` y `Disponibilidad colectiva` en vistas `Calendario` y `Lista`, manteniendo paridad funcional, accesibilidad y conexión con creación de propuestas (`RF-PRO-12`).

## Fuentes

- `product/09-functional-requirements.md`
- `product/14-user-flows.md`
- `product/15-screen-specification.md`
- `product/16-wireframes/04-my-availability.md`
- `product/16-wireframes/05-collective-availability.md`
- `design/02-visual-direction/visual-direction.md`
- `design/03-design-system/design-tokens.md`
- `design/03-design-system/component-catalog.md`

## Principios

- Calendario y Lista son dos representaciones equivalentes de la misma disponibilidad por día.
- `Mi disponibilidad` edita estados individuales; `Disponibilidad colectiva` compara estados agregados y permite seleccionar fechas candidatas.
- La disponibilidad general es por día; no se introducen franjas horarias en MVP.
- `Sin respuesta` es ausencia de dato, nunca `No disponible`.
- `Quizá` es señal positiva débil, no disponibilidad plena.
- El color ayuda, pero cada estado debe tener texto, símbolo, borde/patrón o estructura redundante.

## Modelo de datos de UI

Ambos modos usan el mismo nivel temporal: día dentro de la zona horaria canónica del equipo.

```text
CalendarDay
- date
- inCurrentPeriod
- isToday
- isPast? [solo presentación; no implica bloqueo por sí mismo]
- isInLoadedRange
- isSelectableAsCandidate
- individualState? Disponible | Quizá | No disponible | Sin respuesta
- enabledStates
- collectiveCounts
  - available
  - maybe
  - unavailable
  - unanswered
- participantBreakdown? [solo al cargar detalle]
- disabledReason?
```

La UI no debe inferir permisos ni datos ausentes: recibe estados habilitados, capacidad de edición y acceso a detalle ya calculados por la aplicación.

## Modos

### Mi disponibilidad

Propósito: permitir que un participante indique o modifique su disponibilidad general por día.

Debe mostrar:

- estado del participante por día;
- leyenda completa;
- controles para cambiar estado;
- indicador de guardado/cambio pendiente cuando proceda;
- aviso si algunos estados están deshabilitados por configuración de equipo administrable.

No debe:

- modificar respuestas ya emitidas a propuestas;
- sugerir que disponibilidad general confirma una propuesta con hora;
- ocultar `Sin respuesta`.

### Disponibilidad colectiva

Propósito: comparar disponibilidad del equipo, abrir detalle nominal cuando proceda y seleccionar fechas candidatas para una propuesta.

Debe mostrar:

- recuentos separados de `Disponible`, `Quizá`, `No disponible` y `Sin respuesta`;
- intensidad visual basada principalmente en proporción favorable, sin mezclar `Quizá` con `Disponible`;
- detalle nominal al pulsar día, según permisos/acceso;
- selección de una o varias fechas;
- acción `Añadir a propuesta` en detalle y `Crear propuesta con N fechas` en selección acumulada.

No debe:

- resolver automáticamente una fecha;
- ocultar empates o incertidumbre;
- convertir `Sin respuesta` en voto negativo.

## Vistas

### Calendario

Uso principal: reconocimiento visual de patrones mensuales/semanales.

Estructura:

- encabezado con periodo visible y navegación temporal;
- selector `Calendario | Lista`;
- grid de días con encabezados de semana;
- leyenda persistente o fácilmente accesible;
- panel/sheet de detalle al activar un día.

En móvil, la vista puede mostrar un mes compacto o una semana expandida cuando el ancho sea muy estrecho. Debe mantener acceso rápido a cambio de periodo y leyenda.

### Lista

Uso principal: lectura explícita, accesibilidad y operación rápida.

Estructura:

- agrupación por semana o por rango solicitado;
- fila por día;
- estado individual o recuentos colectivos;
- acciones equivalentes al calendario;
- mismo selector `Calendario | Lista`.

La Lista no es una versión reducida: debe permitir editar disponibilidad propia, abrir detalle colectivo y seleccionar fechas candidatas igual que el Calendario.

## Navegación temporal

### Periodos

- `Calendario` usa mes como periodo principal.
- `Lista` usa semana como agrupación principal dentro del mismo contexto temporal.
- En móvil estrecho, el calendario puede ofrecer navegación semanal sin perder acceso al mes.

### Controles

- Anterior periodo.
- Siguiente periodo.
- Hoy.
- Etiqueta de periodo visible: `Octubre 2026`, `Semana del 12 oct`.
- Selector de vista `Calendario | Lista`.

### Conservación de contexto

Al cambiar `Calendario → Lista`:

- conservar fecha ancla: día seleccionado, hoy o primer día visible;
- desplazar la lista a la semana que contiene esa fecha;
- conservar selección de candidatas en modo colectivo.

Al cambiar `Lista → Calendario`:

- abrir el mes de la fecha ancla;
- mantener selección y foco razonable;
- conservar filtros/rango cargado.

### Hoy

`Hoy` debe:

- moverse a la fecha actual en zona horaria del equipo;
- tener marcador visual no dependiente solo de color;
- no sobrescribir selección ni estado.

### Fechas fuera de rango

Pueden aparecer por completitud del grid mensual.

- Baja prominencia.
- No editables ni seleccionables si están fuera del rango cargado o permitido.
- Deben anunciarse como "fuera del mes" o "fuera del rango".

### Carga incremental

Para rangos largos:

- cargar meses/semanas bajo demanda;
- mostrar `Skeleton` con layout estable;
- conservar datos ya cargados al navegar;
- si falla una carga, mostrar error recuperable por periodo, no vaciar todo el calendario.

## Semántica visual de día/celda

### Mi disponibilidad

Cada celda debe mostrar:

- número de día;
- estado actual mediante `AvailabilityState`;
- símbolo compacto (`✓`, `?`, `×`, `·`);
- estado seleccionado/foco si aplica;
- indicador de pendiente de guardado si existe.

Estados:

| Estado | Representación |
|---|---|
| `Disponible` | Fondo/borde `available`, símbolo `✓`, texto disponible en tooltip/screen reader. |
| `Quizá` | Fondo/borde `maybe`, símbolo `?`, patrón o borde discontinuo. |
| `No disponible` | Fondo/borde `unavailable`, símbolo `×`. |
| `Sin respuesta` | Fondo neutro, símbolo `·`, borde/patrón punteado o baja prominencia. |

Si un estado está deshabilitado en equipo administrable, no aparece como opción editable, pero días ya guardados con ese estado histórico deben mostrarse en modo lectura si existieran por compatibilidad futura.

### Disponibilidad colectiva

Cada celda debe mostrar como mínimo:

- número de día;
- recuento de `Disponible`;
- recuento de `Quizá` cuando sea mayor que cero;
- recuento de `No disponible` cuando sea relevante para comparación o mayor que cero;
- señal de `Sin respuesta` cuando exista y afecte a incertidumbre.

La intensidad visual se calcula para presentación con esta prioridad:

1. menos `No disponible`;
2. más `Disponible`;
3. más `Quizá`;
4. menos `Sin respuesta`;
5. fecha más próxima.

Esto refleja `RF-COI-05` sin convertir la fecha en decisión automática.

La celda colectiva puede usar heatmap de `Disponible`, pero debe mantener recuentos textuales/simbólicos. `Quizá` puede mostrarse como contador secundario; `Sin respuesta` como indicador de incertidumbre.

## Leyenda

La leyenda debe existir en ambos modos y vistas.

Debe incluir:

- símbolo;
- color/patrón;
- texto completo;
- explicación breve de `Sin respuesta` si hay espacio: "aún no ha respondido".

En móvil puede ser colapsable, pero nunca desaparecer por completo.

## Interacción

### Pulsar un día en Mi disponibilidad

Abre selector de estado en sheet/dialog ligero:

- título con fecha;
- opciones habilitadas;
- estado actual seleccionado;
- acción guardar si el guardado no es inmediato;
- acción cancelar/cerrar;
- explicación si disponibilidad general no modifica propuestas ya respondidas.

Alternativa de edición rápida:

- en calendario/lista se puede permitir ciclo de estado o selección directa solo si sigue siendo comprensible y accesible;
- no usar gestos ocultos como único método.

### Pulsar un día en Disponibilidad colectiva

Abre detalle del día:

- fecha;
- recuentos por estado;
- detalle nominal si el acceso lo permite;
- participantes agrupados por estado;
- acción `Añadir a propuesta`;
- estado de selección actual.

Si el detalle nominal no está disponible, mostrar recuentos agregados y una explicación de visibilidad.

### Selección de candidatas

Reglas:

- solo en `Disponibilidad colectiva`;
- permite seleccionar una o varias fechas;
- selección persistente al cambiar Calendario/Lista;
- selección visible con borde fuerte, check o contador, no solo color;
- una fecha puede seleccionarse aunque no sea la mejor coincidencia, porque la decisión es humana;
- fechas fuera de rango, no cargadas o no seleccionables deben impedir selección con explicación.

Acciones:

- en detalle: `Añadir a propuesta`;
- en selección acumulada: `Crear propuesta con N fechas`;
- si N = 0, la acción está deshabilitada o ausente;
- si N = 1, permitir continuar solo si el flujo posterior exige añadir al menos otra opción antes de publicar, respetando `RF-PRO-01`.

La propuesta resultante usa fecha obligatoria y hora opcional; la hora se añade en el flujo de propuesta, no en el calendario.

## Teclado

Calendario:

- Tab entra/sale del calendario como región.
- Flechas mueven foco entre días.
- Home/End van al inicio/fin de semana.
- PageUp/PageDown cambian mes o semana según vista.
- Enter/Espacio activa día.
- Shift + flechas no se reserva para selección múltiple en MVP; usar controles explícitos.
- Esc cierra detalle/sheet.

Lista:

- Tab recorre acciones principales y filas interactivas.
- Flechas pueden moverse entre filas cuando el patrón sea listbox/grid accesible.
- Enter/Espacio activa fila o control enfocado.

El foco debe permanecer visible y volver al día/fila que abrió el detalle al cerrarlo.

## Screen reader

### Nombre accesible de celda individual

Formato recomendado:

```text
15 octubre 2026, Mi disponibilidad: Quizá. Activar para cambiar estado.
```

Para `Sin respuesta`:

```text
15 octubre 2026, sin respuesta. Activar para indicar disponibilidad.
```

### Nombre accesible de celda colectiva

Formato recomendado:

```text
14 octubre 2026, 7 disponible, 0 quizá, 0 no disponible, 1 sin respuesta. Activar para ver detalle.
```

Si seleccionada:

```text
14 octubre 2026, seleccionada para propuesta. 7 disponible, 0 quizá, 0 no disponible, 1 sin respuesta.
```

### Regiones

- El calendario debe tener nombre: `Calendario de mi disponibilidad` o `Calendario de disponibilidad del equipo`.
- La lista debe tener nombre equivalente.
- Cambios de mes/semana anuncian el nuevo periodo.
- Guardado correcto puede usar `Toast` con `role=status`.
- Errores de guardado deben ser persistentes y recuperables.

## Touch targets

- Celdas móviles: mínimo `size.calendar.cell.mobile` (44px).
- Controles principales: mínimo 40px; acción primaria idealmente 48px.
- Evitar controles adyacentes sin separación suficiente.
- En calendario compacto, si no cabe contenido textual, conservar símbolo/recuento y abrir detalle con texto completo.

## Alternativa accesible a color

Cada estado debe tener:

- texto en Lista o detalle;
- símbolo compacto;
- patrón/borde para `Quizá` y `Sin respuesta`;
- nombre accesible completo;
- leyenda visible.

La información de intensidad colectiva debe poder leerse como recuentos; el heatmap nunca es la única fuente.

## Casos límite

### Equipos grandes

- La celda muestra recuentos, no nombres.
- El detalle nominal agrupa por estado y puede virtualizar/listar progresivamente.
- Mostrar resumen: `27 disponible · 8 quizá · 3 no · 12 sin respuesta`.
- Participantes históricos/inactivos no deben mezclarse con destinatarios activos para disponibilidad futura.

### Días sin datos

- Mostrar `Sin respuesta` en Mi disponibilidad si el participante no declaró estado.
- Mostrar todos los participantes activos como `Sin respuesta` en colectivo cuando no hay respuestas.
- No usar estado vacío ambiguo.

### Estados deshabilitados en equipo administrable

- En edición individual solo aparecen estados habilitados.
- La leyenda puede mostrar únicamente estados habilitados más `Sin respuesta`.
- Si `Quizá` está deshabilitado, no aparece como opción nueva.
- Los recuentos colectivos siguen separados por los estados aplicables.

### Cambio DST

- La disponibilidad es por día en zona horaria del equipo.
- El calendario no debe mostrar días duplicados ni ausentes por cambio horario.
- La etiqueta de fecha se calcula con la zona IANA del equipo.
- La hora opcional de propuesta se define después, en flujo de propuesta.

### Rangos largos

- Carga incremental por mes/semana.
- Mantener selección aunque el usuario navegue fuera del periodo visible.
- Resumen de selección accesible: `3 fechas seleccionadas`.
- Acción para limpiar selección.

### Móvil estrecho

- Priorizar semana o mes compacto con detalle en bottom sheet.
- Recuentos colectivos pueden abreviarse: `6✓ 1? 1×`.
- La Lista debe ofrecer texto completo cuando el calendario compacto no quepa.
- Acción `Crear propuesta con N fechas` puede fijarse al borde inferior si no tapa contenido.

### Error de carga o guardado

- Error de carga de periodo: mostrar bloque recuperable con reintento.
- Error de guardado de estado: conservar cambio local como pendiente o revertir explícitamente con mensaje claro.
- No perder selección de candidatas por error de detalle nominal.

## Componentes usados

- `Tabs` para alternar `Calendario | Lista`.
- `AvailabilityState` para estado individual y símbolos.
- `AvailabilityLegend` para leyenda.
- `AvailabilityCalendarCell` para celda de calendario.
- `CollectiveDayBreakdown` para detalle colectivo.
- `ResultSummary` para recuentos.
- `ParticipantAvatar/Identity` para detalle nominal.
- `Button`, `IconButton`, `Drawer/Sheet`, `Dialog`, `Toast`, `Skeleton`, `Alert`.

## Decisiones de diseño

| ID | Decisión |
|---|---|
| `CAL-01` | Calendario y Lista tienen paridad funcional en ambos modos. |
| `CAL-02` | `Mi disponibilidad` usa semántica de edición individual; `Disponibilidad colectiva` usa semántica de comparación y selección. |
| `CAL-03` | La intensidad colectiva no mezcla `Quizá` con `Disponible`; muestra recuentos separados. |
| `CAL-04` | La selección de candidatas pertenece solo a disponibilidad colectiva y conecta con creación de propuesta. |
| `CAL-05` | El detalle nominal se abre bajo demanda y respeta visibilidad/acceso. |
| `CAL-06` | El calendario se opera con teclado, lector de pantalla y alternativa textual completa mediante Lista/detalle. |

## Referencias cruzadas

- `RF-DIS-01`…`RF-DIS-13`
- `RF-COI-01`…`RF-COI-06`
- `RF-PRO-12`
- `RF-PRO-14`
- `RNF-US-04`
- `RNF-US-06`
- `RNF-US-07`
- `RNF-A11Y-01`…`RNF-A11Y-03`
- `UF-05`
- `UF-07`
- `SCR-12`
- `SCR-13`
