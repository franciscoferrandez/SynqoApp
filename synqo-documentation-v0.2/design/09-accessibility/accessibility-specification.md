# Especificación de accesibilidad

## Objetivo

Convertir el objetivo WCAG 2.2 AA de Synqo en requisitos verificables para UI, con foco especial en calendario, disponibilidad por estados, formularios y decisiones.

## Fuentes

- `product/10-non-functional-requirements.md`
- `design/03-design-system/component-catalog.md`
- `design/04-calendar/calendar-specification.md`
- `design/05-responsive/responsive-behaviour.md`
- `design/06-interactions/interaction-patterns.md`

## Requisitos generales

| ID | Requisito | Verificación |
|---|---|---|
| `A11Y-UI-01` | Toda operación principal debe poder completarse con teclado. | Prueba manual por flujo. |
| `A11Y-UI-02` | El foco visible debe ser perceptible en todo control interactivo. | Inspección visual y prueba keyboard-only. |
| `A11Y-UI-03` | Ningún significado esencial depende solo del color. | Revisión con color desactivado/simulador. |
| `A11Y-UI-04` | Texto normal y controles cumplen contraste WCAG AA. | Medición de contraste en temas claro/oscuro. |
| `A11Y-UI-05` | Headings y landmarks describen la estructura de página. | Inspección semántica. |
| `A11Y-UI-06` | Formularios tienen labels visibles o nombres accesibles equivalentes. | Axe/manual. |
| `A11Y-UI-07` | Errores se asocian al campo y se anuncian. | Prueba con lector de pantalla. |
| `A11Y-UI-08` | Responsive a 320px y zoom 200% no introduce scroll horizontal funcional. | Prueba viewport/zoom. |

## Contraste y color

- Texto normal: contraste mínimo 4.5:1.
- Texto grande o iconos significativos: mínimo 3:1.
- Bordes de foco y estados interactivos: mínimo 3:1 respecto al fondo adyacente.
- Estados de disponibilidad: color + símbolo + texto o patrón.
- Heatmaps y rankings: recuentos textuales visibles o accesibles.
- Tema claro y oscuro se validan por separado.

## Representación no cromática de disponibilidad

| Estado | Símbolo | Patrón/estructura | Texto requerido |
|---|---|---|---|
| Disponible | `✓` | Borde sólido o relleno estable. | `Disponible` |
| Quizá | `?` | Borde discontinuo o patrón suave. | `Quizá` |
| No disponible | `×` | Borde/estado negativo claro. | `No disponible` |
| Sin respuesta | `·` | Baja prominencia o punteado. | `Sin respuesta` |

El calendario compacto puede abreviar visualmente, pero la Lista, detalle, tooltip accesible o nombre accesible debe contener texto completo.

## Navegación y estructura

- Debe existir enlace de salto al contenido principal en páginas con navegación persistente.
- Landmarks mínimos: `header`/banner cuando exista, `nav`, `main`, y `complementary` para panel lateral contextual si aplica.
- Headings siguen orden lógico sin saltar niveles por estilo visual.
- El título de página o pantalla debe coincidir con el contexto: `Mi disponibilidad`, `Disponibilidad del equipo`, `Decisiones`, etc.
- Navegación activa se indica con texto/estructura, no solo color.

## Orden de tabulación

- El orden sigue la lectura visual y la prioridad de tarea.
- Acciones primarias aparecen después de los campos que las alimentan.
- Controles ocultos por responsive no deben permanecer en el tab order.
- Al cambiar de vista `Calendario | Lista`, el foco se conserva o se mueve al encabezado de la vista nueva.
- Al cerrar dialog/sheet, el foco vuelve al disparador.

## Calendario

### Patrón semántico

El calendario puede implementarse como grid ARIA o tabla semántica siempre que cumpla:

- nombre accesible de región: `Calendario de mi disponibilidad` o `Calendario de disponibilidad del equipo`;
- encabezados de semana asociados a columnas;
- cada día interactivo tiene nombre accesible completo;
- el día actual se anuncia como `hoy`;
- fechas fuera del mes/rango se anuncian como tales;
- selección de candidatas usa estado accesible (`aria-selected` o texto equivalente).

### Teclado

| Tecla | Comportamiento |
|---|---|
| `Tab` | Entra y sale del calendario como región o foco roving. |
| Flechas | Mueven foco entre días. |
| `Home` / `End` | Inicio/fin de semana. |
| `PageUp` / `PageDown` | Mes o semana anterior/siguiente según vista. |
| `Enter` / `Espacio` | Activa día o alterna selección cuando procede. |
| `Esc` | Cierra sheet/dialog de detalle. |

Selección múltiple de fechas:

- Debe existir acción explícita `Añadir a propuesta` o control equivalente.
- No depender de gestos ocultos ni combinaciones con modificadores.
- El resumen `N fechas seleccionadas` debe ser visible y anunciado cuando cambie.
- La selección persiste al alternar `Calendario` y `Lista`.

### Nombres accesibles

Individual:

```text
15 octubre 2026, Mi disponibilidad: Quizá. Activar para cambiar estado.
```

Colectivo:

```text
14 octubre 2026, 7 disponible, 0 quizá, 0 no disponible, 1 sin respuesta. Activar para ver detalle.
```

Seleccionada:

```text
14 octubre 2026, seleccionada para propuesta. 7 disponible, 0 quizá, 0 no disponible, 1 sin respuesta.
```

## Dialogs, sheets y toasts

### Dialogs y sheets

- Título accesible obligatorio.
- Focus trap mientras estén abiertos.
- Cierre con `Esc` salvo acción crítica en curso.
- Foco inicial en título, primer campo o acción segura según contexto.
- Foco de retorno al disparador.
- Confirmaciones destructivas usan acción primaria explícita y cancelación clara.

### Toasts y live regions

- Éxitos no bloqueantes: `role=status` o live region polite.
- Errores persistentes: `role=alert` o mensaje asociado al campo.
- No usar toast como única comunicación de error que requiera acción.
- No anunciar cada skeleton.
- Cambios de mes/semana o selección de candidatas deben anunciarse de forma breve.

## Formularios

- Cada campo tiene label visible.
- Placeholders son ayudas, no labels.
- Descripciones y errores se asocian al campo.
- Radios y checkboxes forman grupos con nombre accesible.
- Validaciones muestran mensaje textual, no solo borde/color.
- Submit con loading conserva nombre y comunica progreso.
- Cambios sin guardar se comunican antes de abandonar.

## Resultados gráficos y tablas nominales

- Recuentos y rankings se expresan como texto.
- Empates se nombran explícitamente.
- `Resultado actual` y `Decisión final` son encabezados o regiones separadas.
- Tablas nominales tienen encabezados asociados en desktop.
- En móvil, listas agrupadas conservan nombre, estado/respuesta y acción.
- Avatares/iniciales no son única identificación; debe existir nombre accesible.

## Estados UI

- Enlace inválido, revocado y expirado tienen mensajes distintos.
- `Sin respuesta` no se representa como `No disponible`.
- Estados read-only explican por qué no se puede actuar.
- Equipo rápido `Recoverable` muestra acción de reactivación clara; `Expired` no ofrece recuperación.
- Errores recuperables conservan entrada y ofrecen reintento.

## Responsive, zoom y movimiento

- A 320px no debe haber scroll horizontal funcional.
- A zoom 200%, los controles siguen visibles y operables.
- Touch targets principales: mínimo 40px; calendario móvil 44px.
- Animaciones respetan `prefers-reduced-motion`.
- Sheets móviles no deben ocultar el botón de cierre ni la acción principal.

## Decisiones de accesibilidad

| ID | Decisión |
|---|---|
| `A11Y-01` | WCAG 2.2 AA es el criterio mínimo de aceptación UI. |
| `A11Y-02` | El calendario debe ser operable íntegramente con teclado mediante foco roving o tabla/grid accesible. |
| `A11Y-03` | Los cuatro estados de disponibilidad usan canal no cromático obligatorio. |
| `A11Y-04` | Toasts son solo feedback no crítico; errores accionables son persistentes. |
| `A11Y-05` | Lista y detalle actúan como alternativa textual completa al calendario compacto. |

## Cuestiones abiertas

No hay decisiones bloqueantes. La herramienta exacta de auditoría automática se definirá en implementación, siempre que cubra los criterios de esta especificación.

## Referencias cruzadas

- `RNF-A11Y-01`
- `RNF-A11Y-02`
- `RNF-A11Y-03`
- `RNF-US-04`
- `RNF-US-06`
- `RNF-US-07`
- `CAL-01`…`CAL-06`
- `RESP-01`…`RESP-06`
- `INT-01`…`INT-06`
