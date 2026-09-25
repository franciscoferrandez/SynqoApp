# Briefs high-fidelity

## Objetivo

Preparar fichas reproducibles para crear mockups high-fidelity de los recorridos críticos de Synqo en Figma u otra herramienta, sin reinterpretar decisiones funcionales ya consolidadas.

## Fuentes

- `product/16-wireframes/`
- `design/02-visual-direction/visual-direction.md`
- `design/03-design-system/design-tokens.md`
- `design/03-design-system/component-catalog.md`
- `design/04-calendar/calendar-specification.md`
- `design/08-content/content-and-microcopy.md`
- `design/09-accessibility/accessibility-specification.md`

## Datos de ejemplo comunes

- Equipo rápido: `Pádel jueves`, estado `Equipo rápido · temporal`.
- Equipo administrable: `TFM Coordinación`, verificación activa.
- Participantes: Fran, Marta, Lucía, Dani, Irene, Álvaro, Sara, Leo.
- Rango: octubre 2026, zona horaria del equipo.
- Propuesta: `Próxima reunión`.
- Encuesta: `¿Qué estudiamos?`.
- Estados de disponibilidad: `Disponible`, `Quizá`, `No disponible`, `Sin respuesta`.

## Set mínimo de pantallas

| ID | Pantalla high-fi | Wireframe | Viewports |
|---|---|---|---|
| `HF-01` | Landing | `01-landing.md` | Móvil 360, desktop 1280 |
| `HF-02` | Selección tipo de equipo | `02-create-team.md` | Móvil 360, desktop 1024 |
| `HF-03` | Inicio de equipo | `03-team-home.md` | Móvil 360, desktop 1280 |
| `HF-04` | Mi disponibilidad | `04-my-availability.md` | Móvil 360, desktop 1280 |
| `HF-05` | Disponibilidad del equipo | `05-collective-availability.md` | Móvil 360, desktop 1280 |
| `HF-06` | Solicitud de disponibilidad | `06-availability-request.md` | Móvil 360 |
| `HF-07` | Crear propuesta | `07-create-proposal.md` | Móvil 360, desktop 1024 |
| `HF-08` | Responder propuesta | `08-proposal.md` | Móvil 360 |
| `HF-09` | Crear encuesta | `09-survey.md` | Móvil 360, desktop 1024 |
| `HF-10` | Resultado y resolución | `10-result-resolution.md` | Móvil 360, desktop 1280 |
| `HF-11` | Configuración administrable | `11-managed-settings.md` | Móvil 360, desktop 1280 |
| `HF-12` | Asistente IA | `12-ai-assistant.md` | Móvil 360, desktop 1024 |

## Reglas visuales transversales

- Usar tokens semánticos, no colores literales.
- Mantener densidad compacta en disponibilidad/resultados y cómoda en creación/resolución/settings.
- No usar tarjetas anidadas.
- Disponibilidad siempre combina color + símbolo + texto/patrón.
- `Resultado actual` y `Decisión final` se muestran como bloques separados.
- El estado de equipo rápido temporal debe ser visible pero no alarmista.
- Cada pantalla debe tener foco visible, labels y estructura de headings verificables.

## `HF-01` Landing

- Wireframe: `product/16-wireframes/01-landing.md`.
- Objetivo: explicar valor básico y permitir crear equipo o iniciar sesión.
- Viewports: móvil 360, desktop 1280.
- Datos: marca `Synqo`, copy `Coordina disponibilidad y decisiones sin cadenas de chat.`
- Componentes: `Button`, `Card` solo si representa opción repetible, navegación mínima.
- Estados: default, loading al crear/iniciar, error genérico recuperable.
- Revisión: no parecer dashboard ni app promocional excesiva; CTA principal `Crear un equipo`.

## `HF-02` Selección tipo de equipo

- Wireframe: `product/16-wireframes/02-create-team.md`.
- Objetivo: elegir entre equipo rápido y administrable.
- Viewports: móvil 360, desktop 1024.
- Datos: opción rápido y administrable con mensajes de microcopy.
- Componentes: `Radio`/cards seleccionables, `TeamTypeBadge`, `Button`, `Alert` informativo.
- Estados: selección, foco, loading, error de creación.
- Revisión: equipo rápido se comunica como temporal sin tono alarmista; administrable menciona email verificable.

## `HF-03` Inicio de equipo

- Wireframe: `product/16-wireframes/03-team-home.md`.
- Objetivo: responder "qué requiere mi atención aquí".
- Viewports: móvil 360, desktop 1280.
- Datos: `Pádel jueves`; pendiente `Responder propuesta`; coincidencias `12 oct 5 Disponible · 1 Quizá · 1 No disponible`, `14 oct 6 Disponible · 1 Quizá`.
- Componentes: `Navigation`, `PendingAction`, `Button`, `CreateActionMenu`, `TeamTypeBadge`, `ResultSummary`, `ConsultationCard`.
- Estados: sin pendientes, equipo recuperable, sin permisos para crear, loading parcial.
- Revisión: pendientes arriba en móvil; compartir y crear visibles; decisiones activas no se confunden con resolución.

## `HF-04` Mi disponibilidad

- Wireframe: `product/16-wireframes/04-my-availability.md`.
- Objetivo: editar disponibilidad general por día.
- Viewports: móvil 360, desktop 1280.
- Datos: octubre 2026; días con `Disponible`, `Quizá`, `No disponible`, `Sin respuesta`.
- Componentes: `Tabs`, `AvailabilityCalendarCell`, `AvailabilityLegend`, `AvailabilityState`, `Drawer/Sheet`, `Button`, `Toast`.
- Estados: calendario, lista, día editando, guardando, error de guardado, estados deshabilitados en equipo administrable.
- Revisión: no introducir franjas horarias; disponibilidad general no modifica respuestas a propuestas; calendario operable sin ratón.

## `HF-05` Disponibilidad del equipo

- Wireframe: `product/16-wireframes/05-collective-availability.md`.
- Objetivo: comparar disponibilidad colectiva y seleccionar fechas candidatas.
- Viewports: móvil 360, desktop 1280.
- Datos: `12 [6✓ 1?]`, `13 [4✓ 2? 1×]`, `14 [7✓ 1 sin respuesta]`, selección `12, 14`.
- Componentes: `Tabs`, `AvailabilityCalendarCell`, `ResultSummary`, `CollectiveDayBreakdown`, `ParticipantAvatar/Identity`, `Button`, `Drawer/Sheet`.
- Estados: selección vacía, selección múltiple, detalle nominal permitido/no permitido, error de carga parcial, lista equivalente.
- Revisión: `Quizá` separado de `Disponible`; `Sin respuesta` visible; selección no depende solo de color; acción `Crear propuesta con N fechas`.

## `HF-06` Solicitud de disponibilidad

- Wireframe: `product/16-wireframes/06-availability-request.md`.
- Objetivo: responder varios días de una solicitud.
- Viewports: móvil 360.
- Datos: rango `12-18 octubre`; filas Lun-Vie con estados.
- Componentes: `AvailabilityState` seleccionable, `Button`, `Alert`, `Toast`.
- Estados: abierta, cerrada/read-only, guardando, error recuperable.
- Revisión: varias fechas editables sin abrir pantalla independiente por fecha; guardar explícito.

## `HF-07` Crear propuesta

- Wireframe: `product/16-wireframes/07-create-proposal.md`.
- Objetivo: publicar propuesta con al menos dos fechas y hora opcional.
- Viewports: móvil 360, desktop 1024.
- Datos: `Próxima reunión`, 12 oct sin hora, 15 oct 19:00, 17 oct 20:30.
- Componentes: `Input`, `Button`, date/time inputs, `Alert`, lista de opciones.
- Estados: desde candidatas, validación menos de dos fechas, hora inválida, loading.
- Revisión: fecha obligatoria/hora opcional; sin franjas horarias; acción primaria clara.

## `HF-08` Responder propuesta

- Wireframe: `product/16-wireframes/08-proposal.md`.
- Objetivo: responder cada opción temporal.
- Viewports: móvil 360.
- Datos: tres opciones; estados habilitados `Disponible`, `Quizá`, `No disponible`.
- Componentes: `AvailabilityState` seleccionable, `Button`, `ParticipationStatus`, `ResultSummary` link.
- Estados: abierta editable, cerrada read-only, guardando, consulta cerrada durante edición.
- Revisión: cada opción independiente; varias opciones pueden ser Disponible; botón `Ver resultados` no implica resolver.

## `HF-09` Crear encuesta

- Wireframe: `product/16-wireframes/09-survey.md`.
- Objetivo: crear encuesta SINGLE o MULTIPLE con resultados agregados/nominales.
- Viewports: móvil 360, desktop 1024.
- Datos: pregunta `¿Qué estudiamos?`; opciones `RAG`, `MCP`, `Agents`.
- Componentes: `Input`, `Radio`, `Button`, lista editable, `Alert`.
- Estados: SINGLE, MULTIPLE, agregada, nominal, validación mínimo dos opciones, loading.
- Revisión: agregado no se presenta como anonimato fuerte; modalidad visible.

## `HF-10` Resultado y resolución

- Wireframe: `product/16-wireframes/10-result-resolution.md`.
- Objetivo: comparar resultado calculado y registrar decisión final.
- Viewports: móvil 360, desktop 1280.
- Datos: resultado `15 oct · 19:00 7✓ 1?`, `12 oct 5✓ 2? 1×`; decisión final pendiente.
- Componentes: `ResultSummary`, `ResolutionStatus`, `ResolutionPanel`, `Dialog`, `Button`.
- Estados: pendiente, resuelta, cancelada, empate, sin permiso para resolver, confirmación de resolución.
- Revisión: `Resultado actual` y `Decisión final` separados; no mostrar ganador automático.

## `HF-11` Configuración administrable

- Wireframe: `product/16-wireframes/11-managed-settings.md`.
- Objetivo: configurar disponibilidad y permisos de equipo administrable.
- Viewports: móvil 360, desktop 1280.
- Datos: disponibilidad con tres estados activos; crear solicitudes/decisiones `Todos`; resolver `Administradores`.
- Componentes: `Checkbox`, `Radio`, `Switch` si procede, `Button`, `Alert`, `TeamTypeBadge`.
- Estados: cambios sin guardar, guardando, configuración inválida, sin permisos.
- Revisión: al menos Disponible o No disponible activo; defaults colaborativos; resolución por administración por defecto.

## `HF-12` Asistente IA

- Wireframe: `product/16-wireframes/12-ai-assistant.md`.
- Objetivo: interpretar restricciones y revisar candidatos antes de crear propuesta.
- Viewports: móvil 360, desktop 1024.
- Datos: texto `Busca tres fechas entre el 10 y el 20, mejor viernes, con al menos 5 disponibles.`
- Componentes: `Textarea`, `Button`, `AIInterpretationPanel`, `Alert`, `Skeleton`, `ResultSummary`.
- Estados: antes de interpretar, interpretando, interpretación estructurada, error IA, candidatos deterministas.
- Revisión: LLM no calcula disponibilidad ni publica propuesta; interpretación revisable antes de buscar.

## Criterios de revisión visual

- Jerarquía: tarea pendiente o acción primaria identificable en menos de 5 segundos.
- Densidad: comparación compacta; creación/resolución cómoda.
- Tokens: colores, radios, espaciado y tipografía derivan de `design-tokens.md`.
- Accesibilidad: foco visible, contraste AA, labels, no dependencia solo del color.
- Responsive: móvil 360 sin scroll horizontal funcional; desktop usa paneles solo si aportan comparación/contexto.
- Estados: cada pantalla incluye al menos default, loading/error o read-only cuando corresponda.
- Dominio: no se introducen chat, recurrencia, franjas horarias de disponibilidad general ni resolución automática.

## Criterios de revisión funcional

- `HF-04`/`HF-05` cumplen `CAL-01`…`CAL-06`.
- `HF-07` respeta propuesta con fecha obligatoria, hora opcional y mínimo dos opciones.
- `HF-08` permite editar mientras la propuesta esté abierta.
- `HF-09` distingue SINGLE/MULTIPLE.
- `HF-10` separa Resultado y Decisión final.
- `HF-11` respeta permisos configurables y default de resolución administrativa.
- `HF-12` muestra interpretación antes de motor determinista.

## Decisiones high-fidelity

| ID | Decisión |
|---|---|
| `HF-01` | El set mínimo high-fi cubre 12 pantallas derivadas de los wireframes funcionales. |
| `HF-02` | Móvil 360 es obligatorio para todas las pantallas críticas. |
| `HF-03` | Desktop se especifica solo cuando cambia composición sustancialmente. |
| `HF-04` | Los briefs son reproducibles en Figma o prototipo HTML, pero no implementan producto. |
| `HF-05` | Los mockups deben mostrar estados, no solo happy path. |

## Cuestiones abiertas

No hay decisiones bloqueantes. La herramienta final de diseño puede ser Figma u otra, siempre que respete estas fichas.

## Referencias cruzadas

- `SCR-01`…`SCR-30`
- `SCR-AI-01`
- `CAL-01`…`CAL-06`
- `CONTENT-01`…`CONTENT-05`
- `A11Y-01`…`A11Y-05`
