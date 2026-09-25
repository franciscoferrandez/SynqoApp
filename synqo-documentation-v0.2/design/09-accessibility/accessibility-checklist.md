# Checklist de accesibilidad

## Uso

Checklist para revisión manual, diseño high-fidelity y futura CI. Cada punto debe evaluarse en tema claro y oscuro cuando aplique.

## Automatizable en CI

| ID | Check | Criterio de paso |
|---|---|---|
| `AUTO-A11Y-01` | Auditoría axe/core sin violaciones críticas o serias. | 0 critical/serious no justificadas. |
| `AUTO-A11Y-02` | Todos los botones icon-only tienen nombre accesible. | `aria-label` o texto equivalente presente. |
| `AUTO-A11Y-03` | Inputs, textarea, select, radio y checkbox tienen label. | Label visible o asociación programática. |
| `AUTO-A11Y-04` | Contraste de tokens de texto cumple AA. | Normal 4.5:1; grande/iconos 3:1. |
| `AUTO-A11Y-05` | Página tiene `main` y navegación nombrada cuando hay nav. | Landmarks detectables. |
| `AUTO-A11Y-06` | Dialogs tienen título accesible. | `aria-labelledby` o equivalente. |
| `AUTO-A11Y-07` | No hay elementos focusables ocultos. | Tab order no entra en contenido invisible. |
| `AUTO-A11Y-08` | Formularios asocian errores a campos. | `aria-describedby`/semántica equivalente. |
| `AUTO-A11Y-09` | Estados por color tienen texto o símbolo. | AvailabilityState no renderiza color solo. |
| `AUTO-A11Y-10` | Zoom/viewport 320px no genera scroll horizontal funcional. | Anchura de documento no supera viewport por contenido operativo. |

## Manual: navegación general

| ID | Check | Criterio de paso |
|---|---|---|
| `MAN-A11Y-01` | Se puede llegar al contenido principal con skip link. | Skip link visible al foco y funcional. |
| `MAN-A11Y-02` | Orden de tabulación sigue el flujo visual. | No hay saltos inesperados. |
| `MAN-A11Y-03` | Foco visible en todos los controles. | Anillo perceptible en claro/oscuro. |
| `MAN-A11Y-04` | Navegación activa no depende solo de color. | Texto, indicador estructural o icono accesible. |
| `MAN-A11Y-05` | A zoom 200% todo sigue operable. | Sin solapes ni pérdida de acciones críticas. |

## Manual: calendario

| ID | Check | Criterio de paso |
|---|---|---|
| `CAL-A11Y-01` | El calendario tiene nombre accesible. | Lector anuncia modo individual/colectivo. |
| `CAL-A11Y-02` | Flechas mueven foco entre días. | Arriba/abajo/izquierda/derecha funcionan. |
| `CAL-A11Y-03` | `Home`/`End` y `PageUp`/`PageDown` funcionan. | Semana/periodo según especificación. |
| `CAL-A11Y-04` | `Enter`/`Espacio` activa día. | Abre selector/detalle o selecciona fecha. |
| `CAL-A11Y-05` | `Esc` cierra detalle y devuelve foco. | Foco vuelve al día/fila original. |
| `CAL-A11Y-06` | Día colectivo anuncia recuentos. | Disponible, Quizá, No disponible y Sin respuesta. |
| `CAL-A11Y-07` | Fecha seleccionada para propuesta se anuncia. | Incluye `seleccionada para propuesta` o equivalente. |
| `CAL-A11Y-08` | Cambio Calendario/Lista conserva contexto. | Fecha ancla y selección persisten. |
| `CAL-A11Y-09` | Calendario no depende solo de color. | Símbolo/texto/patrón presente. |
| `CAL-A11Y-10` | Lista ofrece alternativa textual completa. | Mismas acciones esenciales disponibles. |

## Manual: disponibilidad

| ID | Check | Criterio de paso |
|---|---|---|
| `DIS-A11Y-01` | `Disponible` tiene texto/símbolo. | No solo color. |
| `DIS-A11Y-02` | `Quizá` tiene texto/símbolo/patrón. | Se distingue de Disponible. |
| `DIS-A11Y-03` | `No disponible` tiene texto/símbolo. | Se distingue de Sin respuesta. |
| `DIS-A11Y-04` | `Sin respuesta` se nombra completo. | No aparece como `No`. |
| `DIS-A11Y-05` | Leyenda presente o accesible. | Visible o disponible en el mismo contexto. |

## Manual: formularios

| ID | Check | Criterio de paso |
|---|---|---|
| `FORM-A11Y-01` | Labels visibles. | Ningún campo depende solo de placeholder. |
| `FORM-A11Y-02` | Errores se anuncian y enfocan. | Foco al resumen o primer campo inválido. |
| `FORM-A11Y-03` | Grupos radio/checkbox tienen nombre. | Lector anuncia grupo y opción. |
| `FORM-A11Y-04` | Submit loading evita doble envío. | Botón comunica progreso. |
| `FORM-A11Y-05` | Cambios sin guardar se avisan. | Confirmación accesible. |

## Manual: dialogs, sheets y toasts

| ID | Check | Criterio de paso |
|---|---|---|
| `MODAL-A11Y-01` | Dialog/sheet atrapa foco. | Tab no sale al fondo. |
| `MODAL-A11Y-02` | Cierre devuelve foco. | Vuelve al disparador. |
| `MODAL-A11Y-03` | Confirmación destructiva es clara. | Título, consecuencia y acciones. |
| `MODAL-A11Y-04` | Toast no contiene error crítico único. | Error accionable queda persistente. |
| `MODAL-A11Y-05` | Live regions no saturan. | No anuncia skeletons repetidos. |

## Manual: resultados y tablas

| ID | Check | Criterio de paso |
|---|---|---|
| `RESULT-A11Y-01` | Resultado actual y decisión final están separados. | Headings/regiones distintas. |
| `RESULT-A11Y-02` | Rankings tienen recuentos textuales. | No solo barras/heatmap. |
| `RESULT-A11Y-03` | Empates se anuncian explícitamente. | Texto de empate presente. |
| `TABLE-A11Y-01` | Tablas desktop tienen encabezados. | Headers asociados. |
| `TABLE-A11Y-02` | Lista móvil conserva campos críticos. | Identidad, estado/respuesta, acción. |

## Manual: estados y enlaces

| ID | Check | Criterio de paso |
|---|---|---|
| `STATE-A11Y-01` | Enlace inválido tiene mensaje propio. | No usa error genérico. |
| `STATE-A11Y-02` | Enlace revocado tiene mensaje propio. | Explica pedir nuevo enlace. |
| `STATE-A11Y-03` | Enlace expirado tiene mensaje propio. | Diferente de revocado. |
| `STATE-A11Y-04` | Read-only explica causa. | Cerrada/resuelta/cancelada/permisos. |
| `STATE-A11Y-05` | Error recuperable ofrece reintento. | Acción cerca del mensaje. |

## Evidencia mínima por revisión

- Capturas o notas de teclado para `SCR-12` y `SCR-13`.
- Resultado de auditoría automática.
- Revisión de contraste para estados de disponibilidad en tema claro/oscuro.
- Prueba de zoom 200% y viewport 320px.
- Prueba de lector de pantalla o inspección de nombres accesibles para calendario.
