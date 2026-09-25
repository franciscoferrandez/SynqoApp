# Design tokens de Synqo

## Objetivo

Definir la primera especificación de tokens semánticos de Synqo para tema claro y oscuro. Los valores propuestos sirven como base documental para implementación React, pero la API de componentes debe consumir tokens semánticos, no colores literales.

## Fuentes

- `design/02-visual-direction/visual-direction.md`
- `design/reference-assets/`
- `product/10-non-functional-requirements.md`
- `product/15-screen-specification.md`
- `product/16-wireframes/README.md`
- `architecture/adr/ADR-002A-frontend-react.md`

## Principios

- Los tokens deben cubrir coordinación, disponibilidad, resultados, resolución, pendientes, estados de UI y navegación.
- El color puede ser predominante, pero nunca el único codificador semántico (`RNF-A11Y-03`).
- Los nombres públicos son semánticos: `color.action.primary`, no `blue-500`.
- Los componentes de dominio usan tokens de dominio: `color.availability.available.*`, no tokens de estado genérico.
- Tema claro y oscuro comparten la misma estructura de tokens.
- La paleta base se inspira en los assets de referencia: índigo/navy para confianza, azul para acción, cian/menta para coordinación positiva y violeta como acento secundario. Los mockups no alteran flujos ni requisitos.

## Escalas base

Las escalas base no se exponen directamente como API de componente salvo durante implementación del tema. Son materia prima para alias semánticos.

### Color base

| Token base | Valor claro inicial | Valor oscuro inicial | Uso previsto |
|---|---:|---:|---|
| `color.base.navy.950` | `#07113F` | `#F8FAFF` | Texto principal en claro / texto sobre oscuro. |
| `color.base.navy.900` | `#0B1552` | `#E8EDFF` | Marca, encabezados, texto fuerte. |
| `color.base.navy.800` | `#16245F` | `#C9D4F8` | Texto secundario fuerte. |
| `color.base.blue.600` | `#315DFF` | `#6F8BFF` | Acción primaria e interacción. |
| `color.base.blue.500` | `#3B7CFF` | `#4F7DFF` | Hover, selección, foco. |
| `color.base.cyan.500` | `#25C7F3` | `#42D8FF` | Acento de coordinación. |
| `color.base.mint.500` | `#25D6A5` | `#56E8BF` | Disponible, éxito funcional. |
| `color.base.violet.500` | `#7657F5` | `#9B86FF` | Acento secundario y estados intermedios. |
| `color.base.amber.500` | `#F6B736` | `#FFD166` | Avisos y `Quizá`. |
| `color.base.rose.500` | `#E05A77` | `#FF8AA3` | No disponible / destructivo suave. |
| `color.base.slate.700` | `#46516F` | `#9EA9C8` | Texto secundario. |
| `color.base.slate.500` | `#6F7892` | `#7F8AA8` | Texto terciario. |
| `color.base.slate.300` | `#D7DDEA` | `#33405F` | Bordes. |
| `color.base.slate.100` | `#F3F6FC` | `#162036` | Superficie suave. |
| `color.base.white` | `#FFFFFF` | `#FFFFFF` | Blanco absoluto. |
| `color.base.black` | `#050914` | `#050914` | Fondo oscuro profundo. |

Los valores deberán validarse con contraste real durante implementación. Si un valor no alcanza WCAG 2.2 AA en su contexto, debe ajustarse conservando el nombre semántico.

## Tokens semánticos de color

### Superficies y texto

| Token | Tema claro | Tema oscuro | Notas |
|---|---:|---:|---|
| `color.background.app` | `#F6F9FF` | `#07101F` | Fondo general de app. |
| `color.background.subtle` | `#EEF4FF` | `#0D1729` | Bandas, navegación secundaria. |
| `color.surface.default` | `#FFFFFF` | `#101B2F` | Cards, paneles, formularios. |
| `color.surface.raised` | `#FFFFFF` | `#14213A` | Dialog, drawer, popover. |
| `color.surface.sunken` | `#F3F6FC` | `#0B1424` | Inputs, slots, celdas vacías. |
| `color.surface.brandSoft` | `#EAF2FF` | `#102047` | Fondos de énfasis de marca. |
| `color.border.default` | `#D7DDEA` | `#2A3652` | Separación normal. |
| `color.border.strong` | `#B8C2DA` | `#465272` | Controles activos o agrupaciones. |
| `color.text.primary` | `#07113F` | `#F8FAFF` | Texto principal. |
| `color.text.secondary` | `#46516F` | `#C9D4F8` | Texto de apoyo. |
| `color.text.tertiary` | `#6F7892` | `#9EA9C8` | Metadata, hints. |
| `color.text.inverse` | `#FFFFFF` | `#07113F` | Texto sobre fondos contrastados. |
| `color.text.disabled` | `#99A3BA` | `#65708C` | Deshabilitado. |

### Marca y acción

| Token | Tema claro | Tema oscuro | Uso |
|---|---:|---:|---|
| `color.brand.primary` | `#315DFF` | `#6F8BFF` | Marca interactiva. |
| `color.brand.accent` | `#25C7F3` | `#42D8FF` | Acento Synqo. |
| `color.brand.mint` | `#25D6A5` | `#56E8BF` | Acento positivo. |
| `color.action.primary.background` | `#315DFF` | `#4F7DFF` | Botón primario. |
| `color.action.primary.backgroundHover` | `#244EE8` | `#6F8BFF` | Hover/pressed según contraste. |
| `color.action.primary.text` | `#FFFFFF` | `#FFFFFF` | Texto primario. |
| `color.action.secondary.background` | `#EEF4FF` | `#152444` | Botón secundario. |
| `color.action.secondary.text` | `#315DFF` | `#C9D4FF` | Texto secundario. |
| `color.action.ghost.text` | `#315DFF` | `#8EA3FF` | Acción discreta. |
| `color.focus.ring` | `#25C7F3` | `#42D8FF` | Foco visible. |

### Estados funcionales

| Token | Tema claro | Tema oscuro | Uso |
|---|---:|---:|---|
| `color.status.info.background` | `#EAF2FF` | `#12254A` | Información. |
| `color.status.info.foreground` | `#254AD6` | `#AFC0FF` | Información. |
| `color.status.success.background` | `#DDF9EF` | `#0F3A31` | Éxito/resolución positiva. |
| `color.status.success.foreground` | `#087D61` | `#7EF1CC` | Éxito/resolución positiva. |
| `color.status.warning.background` | `#FFF2CC` | `#4A3510` | Aviso/recuperable/deadline cercano. |
| `color.status.warning.foreground` | `#8A5A00` | `#FFD166` | Aviso. |
| `color.status.danger.background` | `#FFE8EE` | `#4A1624` | Error/cancelación/destructivo. |
| `color.status.danger.foreground` | `#B42348` | `#FF9DB2` | Error/cancelación/destructivo. |
| `color.status.neutral.background` | `#EEF1F7` | `#202B42` | Cerrado/sin respuesta/sin permisos. |
| `color.status.neutral.foreground` | `#46516F` | `#C9D4F8` | Cerrado/sin respuesta/sin permisos. |

### Disponibilidad

Cada estado de disponibilidad tiene tokens de fondo, texto, borde, símbolo y patrón. Los componentes deben usar al menos dos canales: color + texto/símbolo/patrón.

| Token | Tema claro | Tema oscuro | Canal |
|---|---:|---:|---|
| `color.availability.available.background` | `#DDF9EF` | `#113C33` | Fondo. |
| `color.availability.available.foreground` | `#087D61` | `#7EF1CC` | Texto/símbolo. |
| `color.availability.available.border` | `#25D6A5` | `#56E8BF` | Borde. |
| `color.availability.available.heatmapLow` | `#CFF6E8` | `#17382F` | Heatmap baja intensidad. |
| `color.availability.available.heatmapHigh` | `#25D6A5` | `#56E8BF` | Heatmap alta intensidad. |
| `color.availability.maybe.background` | `#FFF2CC` | `#463613` | Fondo. |
| `color.availability.maybe.foreground` | `#8A5A00` | `#FFD166` | Texto/símbolo. |
| `color.availability.maybe.border` | `#F6B736` | `#FFD166` | Borde. |
| `color.availability.maybe.pattern` | `diagonal` | `diagonal` | Patrón no cromático. |
| `color.availability.unavailable.background` | `#FFE8EE` | `#421724` | Fondo. |
| `color.availability.unavailable.foreground` | `#B42348` | `#FF9DB2` | Texto/símbolo. |
| `color.availability.unavailable.border` | `#E05A77` | `#FF8AA3` | Borde. |
| `color.availability.unanswered.background` | `#EEF1F7` | `#202B42` | Fondo. |
| `color.availability.unanswered.foreground` | `#5F6B84` | `#AAB5D1` | Texto/símbolo. |
| `color.availability.unanswered.border` | `#B8C2DA` | `#465272` | Borde. |
| `color.availability.unanswered.pattern` | `dotted` | `dotted` | Patrón no cromático. |

Símbolos normativos:

| Estado | Símbolo compacto | Texto corto | Texto completo |
|---|---|---|---|
| `Disponible` | `✓` | `Sí` | `Disponible` |
| `Quizá` | `?` | `Quizá` | `Quizá` |
| `No disponible` | `×` | `No` | `No disponible` |
| `Sin respuesta` | `·` | `Sin resp.` | `Sin respuesta` |

### Dominio

| Token | Tema claro | Tema oscuro | Uso |
|---|---:|---:|---|
| `color.team.quick.background` | `#EAF2FF` | `#102047` | Badge equipo rápido. |
| `color.team.quick.foreground` | `#254AD6` | `#AFC0FF` | Badge equipo rápido. |
| `color.team.managed.background` | `#EEF1F7` | `#202B42` | Badge administrable. |
| `color.team.managed.foreground` | `#16245F` | `#E8EDFF` | Badge administrable. |
| `color.consultation.open.background` | `#DDF9EF` | `#0F3A31` | Consulta abierta. |
| `color.consultation.closed.background` | `#EEF1F7` | `#202B42` | Cerrada pendiente. |
| `color.consultation.resolved.background` | `#EAF2FF` | `#12254A` | Resuelta. |
| `color.consultation.cancelled.background` | `#FFE8EE` | `#4A1624` | Cancelada. |
| `color.resolution.highlight.background` | `#DDF9EF` | `#0F3A31` | Resolución final. |
| `color.result.background` | `#F3F6FC` | `#162036` | Resultado calculado. |
| `color.pending.background` | `#EAF2FF` | `#12254A` | Acción pendiente. |
| `color.ai.background` | `#F1ECFF` | `#251B47` | Asistente IA discreto. |

## Tipografía

### Familias

| Token | Valor | Uso |
|---|---|---|
| `font.family.ui` | System UI / Inter-compatible sans-serif | Producto. |
| `font.family.brand` | Igual a UI salvo branding externo | No depender de fuente propietaria. |
| `font.family.mono` | System monospace | Datos técnicos puntuales, no UI principal. |

### Escala

| Token | Tamaño | Línea | Peso recomendado | Uso |
|---|---:|---:|---:|---|
| `font.size.2xs` | 11px | 16px | 500 | Badges compactos, metadata densa. |
| `font.size.xs` | 12px | 16px | 400/500 | Ayudas, etiquetas, recuentos. |
| `font.size.sm` | 14px | 20px | 400/500 | Texto base móvil, filas, controles. |
| `font.size.md` | 16px | 24px | 400/500 | Texto base, inputs. |
| `font.size.lg` | 18px | 28px | 600 | Subtítulos y bloques. |
| `font.size.xl` | 22px | 30px | 700 | Título de pantalla o consulta. |
| `font.size.2xl` | 28px | 36px | 700 | Título destacado en pantallas no densas. |

No usar escalas hero dentro de pantallas operativas del producto.

## Espaciado

| Token | Valor | Uso |
|---|---:|---|
| `space.0` | 0 | Reset. |
| `space.1` | 4px | Separación mínima. |
| `space.2` | 8px | Separación compacta. |
| `space.3` | 12px | Filas densas, badges. |
| `space.4` | 16px | Espaciado base móvil. |
| `space.5` | 20px | Cards y grupos. |
| `space.6` | 24px | Secciones. |
| `space.8` | 32px | Separación amplia. |
| `space.10` | 40px | Layout desktop. |
| `space.12` | 48px | Secciones no densas. |

## Tamaños

| Token | Valor | Uso |
|---|---:|---|
| `size.control.sm` | 32px | Controles densos. |
| `size.control.md` | 40px | Controles por defecto. |
| `size.control.lg` | 48px | Controles táctiles destacados. |
| `size.icon.sm` | 16px | Iconos inline. |
| `size.icon.md` | 20px | Iconos en controles. |
| `size.icon.lg` | 24px | Navegación y estados. |
| `size.avatar.sm` | 24px | Listas densas. |
| `size.avatar.md` | 32px | Listas normales. |
| `size.avatar.lg` | 40px | Detalle de participante. |
| `size.calendar.cell.mobile` | 44px | Toque mínimo de calendario móvil. |
| `size.calendar.cell.desktop` | 36px | Calendario denso desktop. |

## Radios

| Token | Valor | Uso |
|---|---:|---|
| `radius.none` | 0 | Grids o divisores. |
| `radius.xs` | 4px | Badges pequeños. |
| `radius.sm` | 6px | Inputs compactos. |
| `radius.md` | 8px | Cards y controles por defecto. |
| `radius.lg` | 12px | Dialogs, drawers, cards destacadas. |
| `radius.full` | 999px | Avatares, pills. |

Los componentes repetibles usan preferentemente `radius.md` o menor, salvo pills/avatares.

## Bordes

| Token | Valor | Uso |
|---|---|---|
| `border.width.none` | `0` | Sin borde. |
| `border.width.hairline` | `1px` | Separación normal. |
| `border.width.strong` | `2px` | Selección/foco/estado fuerte. |
| `border.style.default` | `solid` | General. |
| `border.style.maybe` | `dashed` | Apoyo no cromático para `Quizá`. |
| `border.style.unanswered` | `dotted` | Apoyo no cromático para `Sin respuesta`. |

## Elevación

| Token | Valor conceptual | Uso |
|---|---|---|
| `shadow.none` | Sin sombra. | Layout normal. |
| `shadow.sm` | Sombra mínima. | Header sticky, cards interactivas suaves. |
| `shadow.md` | Sombra moderada. | Popover, menú, toast. |
| `shadow.lg` | Sombra alta. | Dialog, drawer/sheet. |

La elevación no debe ser el mecanismo principal de jerarquía en pantallas densas.

## Motion

| Token | Valor | Uso |
|---|---:|---|
| `motion.duration.instant` | 80ms | Feedback inmediato. |
| `motion.duration.fast` | 140ms | Hover, pressed, foco. |
| `motion.duration.normal` | 200ms | Drawer, dialog, toast. |
| `motion.duration.slow` | 320ms | Transiciones mayores poco frecuentes. |
| `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | General. |
| `motion.easing.exit` | `cubic-bezier(0.4, 0, 1, 1)` | Salida. |

Debe respetarse `prefers-reduced-motion`: reducir transformaciones y conservar cambios de estado visibles.

## Z-index conceptual

| Token | Orden |
|---|---:|
| `z.base` | 0 |
| `z.sticky` | 10 |
| `z.dropdown` | 20 |
| `z.toast` | 30 |
| `z.drawer` | 40 |
| `z.dialog` | 50 |

## Breakpoints

| Token | Valor | Uso |
|---|---:|---|
| `breakpoint.mobile` | 0px | Base. |
| `breakpoint.tablet` | 768px | Navegación y layout de dos zonas. |
| `breakpoint.desktop` | 1024px | Paneles laterales y comparación. |
| `breakpoint.wide` | 1280px | Densidad desktop amplia. |

## Densidad

| Token | Descripción |
|---|---|
| `density.comfortable` | Creación, resolución, configuración sensible. |
| `density.default` | Pantallas generales. |
| `density.compact` | Calendarios, tablas, resultados y listas comparativas. |

## Reglas de uso

- Ningún componente debe recibir `blue`, `green` o `red` como variante pública. Debe recibir intención: `primary`, `available`, `warning`, `resolved`.
- `AvailabilityState` debe combinar `color.availability.*`, símbolo normativo y etiqueta disponible para lector de pantalla.
- `ResultSummary` usa tokens de resultado; `ResolutionStatus` usa tokens de resolución. No mezclar.
- Los tokens de tema oscuro no son inversión automática del tema claro; deben preservar contraste y jerarquía.
- La paleta de referencia puede evolucionar, pero los nombres semánticos deben mantenerse salvo necesidad real.
