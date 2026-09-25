# Catálogo de componentes de Synqo

## Objetivo

Definir el catálogo inicial de componentes base y de dominio para Synqo. Los componentes deben poder implementarse en React, con apoyo posible de una librería controlable, sin acoplar la documentación a una librería concreta.

## Principios

- Los componentes base pueden apoyarse en una librería UI siempre que permitan control de tokens, accesibilidad y composición.
- Los componentes de dominio son propios de Synqo porque codifican lenguaje ubicuo, estados y reglas visuales del producto.
- Ningún componente filtra decisiones técnicas del backend: expone conceptos de producto, no nombres de tablas, endpoints ni agregados.
- Todos los componentes deben funcionar con tema claro y oscuro.
- Todos los estados interactivos deben tener foco visible y alternativa no cromática.

## Componentes base

| Componente | Origen recomendado | Propósito | Variantes | Estados | Accesibilidad | Contenido permitido | Responsive | Eventos relevantes |
|---|---|---|---|---|---|---|---|---|
| `Button` | Librería base controlada | Ejecutar acciones principales o secundarias. | `primary`, `secondary`, `ghost`, `danger`, `success`; tamaños `sm/md/lg`; ancho completo opcional. | default, hover, active, focus, disabled, loading. | Elemento `button`; nombre accesible obligatorio; no depender solo de icono; loading anuncia progreso si bloquea. | Texto corto, icono inicial/final opcional, spinner. | En móvil puede ocupar ancho completo en acciones principales; en desktop ancho intrínseco. | `onClick`, submit de formulario. |
| `IconButton` | Librería base controlada | Acción compacta con icono. | `primary`, `secondary`, `ghost`, `danger`; tamaños `sm/md/lg`. | default, hover, active, focus, disabled, loading, selected cuando aplique. | `aria-label` obligatorio; tooltip recomendado en desktop; área táctil mínima 40px. | Un icono; badge opcional para notificación. | Mantener tamaño táctil en móvil aunque el icono sea pequeño. | `onClick`. |
| `Input` | Librería base controlada | Entrada de texto breve. | text, email, password, search, date-like cuando sea nativo; con icono. | default, focus, filled, invalid, disabled, readonly. | Label visible o `aria-label`; error asociado; no usar placeholder como único label. | Texto del usuario; prefijo/sufijo no interactivo. | Ancho completo en móvil; puede agruparse en grid en desktop. | `onChange`, `onBlur`, submit. |
| `Textarea` | Librería base controlada | Entrada de texto larga. | default, resizable controlado, contador opcional. | default, focus, filled, invalid, disabled, readonly. | Label y descripción; error asociado; contador anunciado si limita. | Texto multi-línea. | Altura mínima cómoda en móvil. | `onChange`, `onBlur`. |
| `Select` | Librería base controlada | Elegir una opción de conjunto cerrado. | single; con búsqueda solo si hay muchas opciones. | default, open, focus, selected, invalid, disabled. | Combobox/listbox accesible; teclado completo; label visible. | Texto, icono opcional, helper. | En móvil puede presentarse como sheet si la lista es larga. | `onValueChange`, open/close. |
| `Checkbox` | Librería base controlada | Activar opción no excluyente. | default, card-like para listas si procede. | unchecked, checked, indeterminate, focus, disabled, invalid. | Input real o equivalente ARIA; label clicable. | Label y descripción breve. | Separación táctil suficiente. | `onCheckedChange`. |
| `Radio` | Librería base controlada | Elegir una opción excluyente. | vertical, horizontal, card-like. | unchecked, checked, focus, disabled, invalid. | Grupo con `radiogroup`; label y descripción. | Label, descripción, metadata. | Vertical por defecto en móvil; horizontal solo si cabe. | `onValueChange`. |
| `Switch` | Librería base controlada | Activar/desactivar configuración inmediata. | default, compact. | off, on, focus, disabled. | Solo para cambios binarios persistentes; label claro; no usar para acciones. | Label y ayuda. | Mantener label junto al control. | `onCheckedChange`. |
| `Tabs` | Librería base controlada | Cambiar entre vistas equivalentes o secciones hermanas. | standard, segmented, full-width móvil. | active, hover, focus, disabled. | Patrón ARIA tabs; navegación con teclado; estado activo perceptible sin color. | Texto corto, icono opcional. | Segmented/full-width en móvil; inline en desktop. | `onValueChange`. |
| `Badge` | Propio ligero o librería base | Etiqueta de estado, tipo o metadata. | neutral, info, success, warning, danger, brand; domain via wrappers. | default, subtle, strong. | Texto explícito; no solo color. | Texto corto, icono/símbolo opcional. | Debe truncar de forma controlada. | Normalmente ninguno. |
| `Card` | Propio ligero o librería base | Agrupar unidad repetible o accionable. | default, interactive, selected, muted. | default, hover, focus-within, selected, disabled/read-only. | Si es clicable, semántica de botón/enlace; foco visible. | Header, body, footer; no card anidada. | En móvil full-width; en desktop puede formar grid. | `onClick` si interactiva. |
| `Alert` | Librería base controlada | Comunicar estado relevante persistente. | info, success, warning, danger, neutral. | default, dismissible. | Role `status` o `alert` según urgencia; título si no es trivial. | Título, texto, acción opcional. | En móvil ocupar ancho disponible. | dismiss, action. |
| `Dialog` | Librería base controlada | Confirmación o edición bloqueante. | default, destructive, confirmation. | open, closing. | Focus trap; cierre con Esc cuando sea seguro; título obligatorio. | Título, descripción, contenido, acciones. | En móvil puede ocupar casi todo el ancho; no reemplaza navegación larga. | open/close, confirm, cancel. |
| `Drawer/Sheet` | Librería base controlada | Panel lateral/inferior para detalle progresivo. | bottom móvil, side desktop. | open, closing. | Focus management; título accesible; retorno de foco. | Detalle de día, filtros, acciones secundarias. | Bottom sheet en móvil; side sheet en desktop. | open/close, action. |
| `Tooltip` | Librería base controlada | Ayuda breve para iconos o términos compactos. | default. | open, closed. | No contener información esencial exclusiva; accesible por teclado. | Texto breve. | En táctil preferir texto visible o ayuda persistente. | open/close. |
| `Toast` | Librería base controlada | Feedback temporal no crítico. | success, info, warning, danger. | visible, dismissing. | Role `status`; duración suficiente; no usar para errores que requieren acción. | Mensaje corto, acción opcional. | Ubicación no tapa navegación móvil crítica. | dismiss, action. |
| `Skeleton` | Propio ligero o librería base | Carga progresiva de contenido. | text, card, calendar, list. | animated, static reduced-motion. | `aria-busy` en región; no anunciar cada skeleton. | Sin contenido real. | Debe conservar layout esperado. | Ninguno. |
| `Navigation` | Propio sobre primitives | Navegación global/equipo. | bottom mobile, sidebar desktop, top contextual. | active, hover, focus, disabled. | Landmarks; item activo textual/estructural; icono + label en navegación principal. | Links, iconos, badges de pendientes. | Bottom nav móvil; sidebar/top en desktop. | route change. |

## Componentes de dominio

| Componente | Origen | Propósito | Variantes | Estados | Accesibilidad | Contenido permitido | Responsive | Eventos relevantes |
|---|---|---|---|---|---|---|---|---|
| `AvailabilityState` | Propio Synqo | Representar `Disponible`, `Quizá`, `No disponible` o `Sin respuesta`. | chip, cell, legendItem, compactCount, selectable. | default, selected, focus, disabled, readonly, loading. | Texto o `aria-label` siempre; símbolo normativo; patrón/borde para `Quizá` y `Sin respuesta`. | Símbolo, etiqueta corta/larga, recuento opcional. | Compacto en calendario; etiqueta completa en lista/detalle. | select/change cuando editable. |
| `AvailabilityLegend` | Propio Synqo | Explicar estados de disponibilidad. | horizontal, vertical, compact. | default. | Debe incluir texto completo y símbolos; no depender de color. | Lista de `AvailabilityState`. | Horizontal si cabe; vertical en móvil estrecho. | Ninguno. |
| `TeamTypeBadge` | Propio Synqo | Distinguir equipo rápido y administrable. | quick, managed; compact/full. | active, recoverable cuando quick aplique, verificationPending cuando managed aplique. | Texto explícito: "Equipo rápido", "Equipo administrable"; no solo icono. | Badge, icono opcional, metadata breve. | Compacto en headers móviles; full en configuración. | Ninguno. |
| `ConsultationTypeBadge` | Propio Synqo | Distinguir Propuesta y Encuesta dentro de Decisiones. | proposal, survey. | default. | Label visible; icono opcional. | Texto corto. | Compacto en listas. | Ninguno. |
| `ParticipationStatus` | Propio Synqo | Mostrar si una Consulta acepta respuestas. | open, closed. | open, closed. | Texto explícito: "Abierta", "Cerrada"; deadline asociado si existe. | Badge, fecha/deadline opcional. | En móvil puede agruparse con header. | Ninguno. |
| `ResolutionStatus` | Propio Synqo | Mostrar resolución: pendiente, resuelta o cancelada. | pending, resolved, cancelled. | pending, resolved, cancelled. | Debe diferenciar "Cerrada + pendiente" de "Resuelta"; texto obligatorio. | Badge, bloque destacado para resolución final. | En móvil destacar antes del detalle largo. | resolve/cancel actions externas, no dentro del badge. |
| `ParticipantAvatar/Identity` | Propio Synqo | Representar participante local o cuenta vinculada sin revelar más PII de la necesaria. | initials, color, anonymousLocal, withStatus. | active, inactive, pending, currentUser. | Nombre accesible; no depender solo de inicial/color; respetar privacidad. | Iniciales, nombre, estado breve, badge opcional. | Avatar compacto en recuentos; identidad completa en detalle. | click/select si se abre detalle. |
| `ResultSummary` | Propio Synqo | Mostrar recuentos calculados de propuesta/encuesta/disponibilidad. | availabilityCounts, proposalOption, surveyOption, rankedList. | default, tie, bestCandidate, empty. | Recuentos en texto; ranking no implica resolución; empates explícitos. | Recuentos, porcentajes, detalle nominal permitido. | Compacto en tarjetas; tabla/lista en detalle. | selectCandidate, viewDetails. |
| `PendingAction` | Propio Synqo | Mostrar acción que requiere intervención del participante. | availabilityRequest, proposalResponse, surveyVote, adminVerification. | new, dueSoon, overdue, blocked, completed/read-only. | Acción clara con verbo; deadline textual; foco visible. | Título, descripción, CTA, metadata. | Debe aparecer arriba en inicio móvil. | primaryAction, dismiss si procede. |

## Componentes compuestos recomendados

Estos no son obligatorios del prompt, pero ayudan a cubrir pantallas MVP sin inventar nuevos conceptos.

| Componente | Composición | Pantallas relacionadas |
|---|---|---|
| `CalendarViewToggle` | `Tabs` o segmented control + contexto temporal. | `SCR-12`, `SCR-13`. |
| `AvailabilityCalendarCell` | `AvailabilityState` + botón/celda + tooltip/sheet de detalle. | `SCR-12`, `SCR-13`. |
| `CollectiveDayBreakdown` | `ResultSummary` + lista de `ParticipantAvatar/Identity` + acción. | `SCR-13`. |
| `CreateActionMenu` | `Button` + menu/sheet. | `SCR-11`, `SCR-17`, `SCR-18`. |
| `ConsultationCard` | `Card` + badges + pending/result/resolution summary. | `SCR-17`, `SCR-24`. |
| `ResolutionPanel` | `Alert/Card` + `ResolutionStatus` + acciones de confirmación. | `SCR-23`. |
| `AIInterpretationPanel` | `Card` + `Alert` + structured summary + actions. | `SCR-AI-01`. |

## Cobertura por pantalla MVP

| Área | Componentes principales |
|---|---|
| Landing y creación | `Button`, `Card`, `Input`, `Radio`, `Alert`, `TeamTypeBadge`. |
| Acceso e identidad | `Input`, `Button`, `Alert`, `ParticipantAvatar/Identity`. |
| Inicio global/equipo | `Navigation`, `PendingAction`, `Card`, `TeamTypeBadge`, `ResultSummary`. |
| Disponibilidad | `Tabs`, `AvailabilityState`, `AvailabilityLegend`, `AvailabilityCalendarCell`, `CollectiveDayBreakdown`. |
| Solicitudes | `Input`, `Select`, `Button`, `PendingAction`, `AvailabilityState`. |
| Decisiones | `ConsultationTypeBadge`, `ParticipationStatus`, `ResolutionStatus`, `ResultSummary`, `Card`. |
| Resolver consulta | `ResolutionPanel`, `Dialog`, `Button`, `ResultSummary`. |
| Histórico | `ConsultationCard`, `ResolutionStatus`, `ResultSummary`. |
| Configuración | `Input`, `Select`, `Switch`, `Checkbox`, `Radio`, `Alert`, `TeamTypeBadge`. |
| IA | `Textarea`, `Button`, `Alert`, `AIInterpretationPanel`, `Skeleton`. |

## Reglas de accesibilidad comunes

- Todo control interactivo debe tener foco visible con `color.focus.ring`.
- Iconos sin texto necesitan nombre accesible y tooltip no esencial.
- Estados por color requieren texto, símbolo o patrón redundante.
- Errores de formulario deben asociarse al campo.
- Dialogs, drawers y menus deben gestionar foco al abrir/cerrar.
- Acciones destructivas o irreversibles requieren confirmación explícita.
- Los componentes de carga deben marcar región ocupada sin saturar lectores de pantalla.
- Los componentes deben soportar `prefers-reduced-motion`.

## Reglas de contenido

- Usar términos del lenguaje ubicuo: Equipo, Participante, Cuenta, Disponibilidad, Propuesta, Encuesta, Resultado, Resolución.
- En UI puede usarse "Decisiones" como etiqueta de navegación, manteniendo `Consulta` como término de dominio documental.
- No usar "No" para `Sin respuesta`.
- No presentar "mejor opción" como resolución automática; debe ser candidato o resultado.
- En permisos, expresar restricciones como acción no disponible, no como fallo técnico.

## Eventos

Los eventos aquí nombrados son eventos de interfaz, no eventos de dominio ni contrato backend.

| Evento UI | Uso |
|---|---|
| `press` | Activación de botón o card interactiva. |
| `select` | Selección de opción, fecha o estado. |
| `change` | Cambio de campo o control. |
| `open` / `close` | Dialog, drawer, select, menu. |
| `submit` | Envío de formulario. |
| `confirm` / `cancel` | Confirmación o cancelación explícita. |
| `viewDetails` | Abrir desglose o detalle. |

## Límites

- Este catálogo no define contratos API.
- Este catálogo no decide estructura de carpetas React.
- Este catálogo no obliga a una librería visual concreta.
- Los componentes de dominio no deben importar reglas de persistencia ni autorización; solo reflejan permisos/estados ya calculados por la aplicación.
