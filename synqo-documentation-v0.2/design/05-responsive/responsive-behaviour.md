# Comportamiento responsive

## Objetivo

Definir cómo se adapta Synqo entre móvil, tablet y escritorio sin cambiar la arquitectura de información ni perder información crítica. Las reglas de este documento aplican a pantallas de producto, diseño de componentes y futuros mockups high-fidelity.

## Fuentes

- `product/13-information-architecture.md`
- `product/15-screen-specification.md`
- `product/16-wireframes/README.md`
- `product/16-wireframes/*.md`
- `design/03-design-system/design-tokens.md`
- `design/03-design-system/component-catalog.md`
- `design/04-calendar/calendar-specification.md`

## Principios

- Mobile-first: todos los flujos críticos deben funcionar entre 320 y 360px sin scroll horizontal funcional.
- Misma información, distinta composición: un breakpoint puede cambiar orden, densidad o contenedor, pero no ocultar datos críticos.
- La navegación no debe crear aplicaciones distintas por viewport; conserva los mismos destinos y deep links.
- La vista `Lista` es una alternativa funcional completa al calendario compacto, no un fallback empobrecido.
- Las acciones primarias deben permanecer visibles y alcanzables sin tapar contenido esencial.
- El zoom del navegador y el texto largo/localizado son escenarios normales, no excepciones.

## Breakpoints conceptuales

Los tokens técnicos ya definidos son:

| Token | Umbral | Uso conceptual |
|---|---:|---|
| `breakpoint.mobile` | `0px` | Flujo vertical, una columna, navegación inferior de equipo. |
| `breakpoint.tablet` | `768px` | Dos zonas cuando aporta contexto: lista + detalle, contenido + panel. |
| `breakpoint.desktop` | `1024px` | Navegación lateral/top contextual, paneles laterales y comparación. |
| `breakpoint.wide` | `1280px` | Mayor densidad informativa sin aumentar tamaño tipográfico. |

Estos umbrales no sustituyen reglas de contenido: si un componente no cabe con texto real, debe compactarse o reflowar antes de provocar truncados críticos.

## Reglas generales de reflow

### 320-360px

- Una sola columna.
- Contenido principal antes que navegación secundaria.
- Acciones primarias con ancho completo cuando sean parte de un formulario o cierre de flujo.
- Controles de grupo en vertical salvo que cada opción conserve área táctil suficiente.
- No usar tablas horizontales para información operativa; convertirlas en listas de filas/card compactas.
- Evitar cabeceras sticky altas que reduzcan el espacio útil del calendario.

### 361-767px

- Mantener una columna, con más contenido visible por fila cuando el texto lo permita.
- Las acciones primarias pueden convivir con una secundaria si ambas conservan tamaño táctil.
- Bottom sheets pueden usar altura media o alta según contenido, pero siempre con scroll interno claro.

### 768-1023px

- Usar dos columnas o panel lateral solo cuando mejore continuidad del flujo.
- Mantener navegación principal de equipo visible como rail/sidebar compacto o top contextual, según pantalla.
- Detalles de día, resultados o settings pueden abrirse en side sheet en lugar de bottom sheet.

### 1024px+

- Usar layout de contenido + panel auxiliar para comparación, detalle o resumen de selección.
- Navegación de equipo visible sin depender de `Más`.
- Calendarios pueden mostrar mes completo con densidad compacta y panel lateral de detalle.

### 1280px+

- Aumentar ancho útil, no escala tipográfica.
- Permitir tres zonas solo si hay jerarquía clara: navegación, contenido principal, panel contextual.
- Limitar ancho de formularios para evitar líneas demasiado largas.

## Navegación

### Nivel global

En móvil:

- `Inicio global`, `Equipos` y `Cuenta` se muestran en navegación global ligera o menú superior, según el punto de entrada.
- Un deep link a equipo, solicitud, propuesta o encuesta evita el nivel global si no es necesario.

En desktop:

- La navegación global puede mostrarse en sidebar o top bar discreta.
- El inicio global prioriza pendientes y equipos vinculados, no métricas.

### Nivel equipo

La navegación móvil candidata se adopta como estructura principal:

```text
Inicio | Disponibilidad | Decisiones | Más
```

Reglas:

- `Inicio` lleva a `SCR-11`.
- `Disponibilidad` agrupa `Mi disponibilidad`, `Disponibilidad colectiva` y `Solicitudes`.
- `Decisiones` agrupa Propuestas y Encuestas.
- `Más` contiene `Histórico`, `Configuración` cuando aplique, participantes, acceso/seguridad y acciones menos frecuentes.
- La acción `Crear` no debe quedar enterrada en `Más` si es relevante para el contexto activo.

En desktop:

- Mostrar destinos de equipo como navegación lateral o tabs persistentes: `Inicio`, `Disponibilidad`, `Decisiones`, `Histórico`, `Configuración`.
- `Configuración` solo aparece cuando el equipo es administrable y el usuario tiene acceso.
- El destino activo debe ser textual/estructural, no solo cromático.

## Patrones por tipo de contenido

### Calendario

Móvil:

- El calendario puede mostrar mes compacto si las celdas conservan al menos `size.calendar.cell.mobile`.
- Si no cabe con contenido comprensible, usar semana expandida como representación primaria y mantener acceso al mes.
- La leyenda puede ser colapsable, pero debe estar accesible desde el mismo contexto.
- El detalle de día se abre en bottom sheet.
- La acción `Crear propuesta con N fechas` puede fijarse abajo si no tapa el calendario ni la lista.
- Los recuentos compactos pueden abreviarse: `6✓ 1? 1×`; el detalle y la lista muestran texto completo.

Tablet:

- Mes completo si cabe; detalle en side sheet o panel inferior según orientación.
- Selección de candidatas y resumen pueden convivir con el calendario si no reducen las celdas bajo el mínimo táctil.

Desktop:

- Mes completo con `size.calendar.cell.desktop` o superior.
- Detalle de día en panel lateral persistente cuando haya espacio.
- Leyenda visible junto al calendario o en bloque próximo.

En todas las anchuras:

- `Calendario` y `Lista` conservan paridad funcional.
- El cambio de vista preserva fecha ancla, foco razonable y selección de candidatas.
- La información por color siempre tiene texto, símbolo o patrón redundante.
- No se introducen franjas horarias de disponibilidad general.

### Listas

- En móvil, las listas usan filas de altura suficiente, con título, estado/recuento y acción explícita.
- En tablet/desktop, pueden agrupar metadata en columnas visuales si no se pierde lectura lineal.
- Las listas largas deben soportar carga incremental o paginación contextual sin cambiar el significado de filtros/rango.
- Una fila interactiva debe ser navegable por teclado y tener foco visible.

### Formularios

Móvil:

- Una columna.
- Labels visibles; placeholders no sustituyen label.
- Grupos `Radio`/`Checkbox` en vertical.
- Botón primario al final del flujo; puede ser sticky solo si el contenido sigue siendo legible.
- Fechas de propuesta se muestran como lista editable: fecha, hora opcional y acción de eliminar si existe.

Tablet/desktop:

- Dos columnas solo para campos independientes y de longitud corta.
- Mantener formularios de decisión, configuración sensible o resolución en densidad `comfortable`.
- El resumen o vista previa puede situarse en panel lateral si no bloquea la edición.

### Resultados y resolución

- `Resultado actual` y `Decisión final` se mantienen como bloques separados en todos los viewports.
- En móvil, `Resultado actual` aparece antes de acciones de resolución para que la decisión humana tenga contexto.
- En desktop, resultado y resolución pueden mostrarse lado a lado, pero no fusionarse.
- Los rankings o mejores candidatos no deben presentarse como resolución automática.

### Settings

Móvil:

- Configuración en secciones apiladas.
- `Más` puede abrir configuración, pero dentro de configuración debe existir navegación local clara.
- Cambios peligrosos o administrativos usan confirmación explícita.

Tablet/desktop:

- Se puede usar navegación secundaria lateral para `General`, `Disponibilidad`, `Permisos`, `Participantes`, `Acceso y seguridad`, `Administración`.
- El contenido de cada sección permanece en una columna o grid simple, evitando formularios anchos difíciles de escanear.

### Tablas nominales

Ejemplos: participantes por disponibilidad, participantes del equipo, detalle nominal de resultados.

Móvil:

- Convertir tabla en lista agrupada por estado o rol.
- Mostrar identidad, estado y acción principal; metadata secundaria pasa a segunda línea.
- No usar scroll horizontal para operar.

Tablet/desktop:

- Tabla real si aporta comparación.
- Columnas con prioridad: identidad, estado/respuesta, permisos/rol, acción.
- Acciones destructivas o administrativas siguen requiriendo confirmación.

### Diálogos, sheets y rutas

Usar bottom sheet en móvil cuando:

- se edita un día de disponibilidad;
- se revisa detalle breve de día;
- se elige una opción de un selector largo;
- la acción puede completarse sin abandonar el contexto.

Usar pantalla completa o nueva ruta en móvil cuando:

- el formulario es largo o tiene varios grupos de campos;
- se crea una propuesta, encuesta o solicitud;
- se responde una consulta con varias opciones;
- se configura un equipo administrable;
- hay deep link directo a la entidad.

Usar dialog cuando:

- hay confirmación breve;
- la acción es destructiva, irreversible o cierra respuestas;
- el contenido cabe sin scroll complejo.

Usar drawer/side sheet en tablet/desktop cuando:

- se abre detalle nominal;
- se inspecciona un día del calendario;
- se muestra resumen de selección;
- se mantiene el contexto principal visible.

## Reglas por pantalla crítica

| Pantalla | Móvil | Tablet/escritorio |
|---|---|---|
| `SCR-11 Inicio de equipo` | Pendientes arriba, luego coincidencias y decisiones activas; `Compartir` y `Crear` visibles. | Puede mostrar pendientes y coincidencias en columnas, con decisiones activas como lista amplia. |
| `SCR-12 Mi disponibilidad` | Calendario compacto o semana + lista equivalente; edición en bottom sheet. | Mes completo y detalle en side sheet/panel. |
| `SCR-13 Disponibilidad colectiva` | Recuentos compactos, selección visible, detalle en bottom sheet. | Calendario + panel de detalle/resumen de candidatas. |
| `SCR-14/16 Solicitudes` | Respuesta por días en lista vertical con controles por fila. | Lista con columnas compactas y acciones agrupadas. |
| `SCR-19 Crear propuesta` | Ruta/pantalla completa con lista de fechas; hora opcional inline. | Formulario con resumen lateral de fechas candidatas si procede. |
| `SCR-20 Responder propuesta` | Opciones por fecha apiladas, guardar visible al final. | Opciones en tabla/lista comparativa si mantiene claridad. |
| `SCR-21/22 Encuesta` | Opciones apiladas; selección única/múltiple clara. | Lista o tabla simple según número de opciones. |
| `SCR-23 Resolver consulta` | Resultado antes de decisión final; confirmación en dialog. | Resultado y resolución pueden coexistir, manteniendo separación visual. |
| `SCR-25 Participantes` | Lista agrupada; acciones en menú contextual/sheet. | Tabla nominal con acciones explícitas. |
| `SCR-26`…`SCR-30 Configuración` | Secciones apiladas y navegación local. | Navegación secundaria lateral y panel de sección. |
| `SCR-AI-01` | Textarea, interpretación y búsqueda en flujo vertical. | Entrada e interpretación pueden compartir pantalla; candidatos siguen viniendo del motor determinista. |

## Orientación

- En móvil vertical se prioriza una columna y acciones claras.
- En móvil horizontal no se asume espacio de tablet: mantener navegación móvil salvo que haya ancho útil suficiente.
- En tablet horizontal puede activarse layout de dos zonas.
- Un cambio de orientación conserva ruta, formulario, selección y foco razonable.
- El calendario recalcula celdas sin perder fecha ancla ni selección.

## Zoom, texto largo y localización

- La UI debe tolerar zoom del navegador sin scroll horizontal funcional.
- No usar tamaños de fuente dependientes del viewport.
- Los botones permiten salto de línea si el texto localizado crece.
- Fechas, nombres de participante y nombres de equipo pueden truncarse solo si existe texto completo en detalle, tooltip accesible o contexto próximo.
- Las abreviaturas de disponibilidad solo se usan donde haya leyenda o detalle completo disponible.
- Los contadores deben conservar significado con pluralización y locale.

## Tamaños táctiles

- Celdas de calendario móvil: mínimo `size.calendar.cell.mobile` (`44px`).
- Controles principales: mínimo 40px, ideal 48px en acciones primarias móviles.
- `IconButton` mantiene área táctil aunque el icono sea menor.
- Controles adyacentes necesitan separación suficiente para evitar errores de toque.
- Acciones peligrosas no deben estar pegadas a acciones primarias sin separación o confirmación.

## Carga, vacío y error

- Skeletons mantienen el layout esperado del viewport activo.
- Un error de carga parcial no debe vaciar toda la pantalla si hay datos previos útiles.
- Estados vacíos explican el siguiente paso con una acción concreta cuando exista.
- Toasts móviles no deben tapar navegación inferior ni acciones sticky críticas.
- Errores de formulario se muestran junto al campo y resumen si el formulario es largo.

## Decisiones responsive

| ID | Decisión |
|---|---|
| `RESP-01` | Synqo usa los breakpoints ya definidos en tokens, pero prioriza reglas de contenido sobre umbrales rígidos. |
| `RESP-02` | La navegación móvil de equipo adopta `Inicio | Disponibilidad | Decisiones | Más`. |
| `RESP-03` | El calendario móvil puede alternar mes compacto, semana expandida y lista equivalente sin perder funcionalidad. |
| `RESP-04` | Tablas nominales se convierten en listas agrupadas en móvil; no hay scroll horizontal operativo. |
| `RESP-05` | Bottom sheet se reserva para detalle/edición contextual breve; flujos largos usan ruta o pantalla completa. |
| `RESP-06` | Resultado y Resolución mantienen separación responsive en todos los tamaños. |

## Criterios verificables

- En 320px, `Inicio de equipo`, `Mi disponibilidad`, `Disponibilidad colectiva`, respuesta a propuesta, creación de propuesta y settings son operables sin scroll horizontal funcional.
- El cambio de viewport no pierde selección de candidatas, fecha ancla, respuestas en edición ni estado de formulario.
- La navegación móvil permite llegar a Inicio, Disponibilidad, Decisiones, Histórico y Configuración cuando correspondan.
- La información crítica de disponibilidad puede leerse sin depender solo de color.
- Los modales/sheets devuelven foco al elemento que los abrió.

## Cuestiones abiertas

No hay decisiones bloqueantes para esta fase. Los detalles verificables de contraste, foco, orden de tabulación exacto y checklist WCAG quedan para `design/09-accessibility/09-PROMPT-especificacion-accesibilidad.md`.

## Referencias cruzadas

- `SCR-11`…`SCR-30`
- `SCR-AI-01`
- `CAL-01`…`CAL-06`
- `RNF-US-04`
- `RNF-US-06`
- `RNF-US-07`
- `RNF-A11Y-01`…`RNF-A11Y-03`
