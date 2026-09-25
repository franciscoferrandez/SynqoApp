# Resumen de implementación del Workplan 01

## Trabajo realizado

Ejecuté solo el primer prompt pendiente: `planning/01-open-decisions/01-PROMPT-cerrar-decisiones-abiertas.md`.

Inspeccioné el repo, leí `AGENTS.md`, `WORKPLAN.md`, el contexto global requerido y las referencias del prompt. Después cerré `OPEN-01`…`OPEN-09` con decisiones de MVP documentadas y propagadas.

## Decisiones cerradas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `OPEN-01` | Equipo rápido: `Active` 30 días + `Recoverable` 14 días. | Equilibra baja fricción, recuperación razonable y temporalidad real. |
| `OPEN-02` | Solo interacciones humanas intencionales renuevan actividad. | Evita abuso por visitas pasivas, bots o previews. |
| `OPEN-03` | En equipo rápido, cualquier participante activo puede crear solicitudes, propuestas y encuestas. | Coherente con ausencia de administración formal. |
| `OPEN-04` | MVP con una única identidad administrativa primaria. | Reduce complejidad de verificación, recuperación y permisos. |
| `OPEN-05` | Defaults administrables: creación por todos, resolución por administración, tres estados activos. | Mantiene colaboración abierta con gobernanza mínima. |
| `OPEN-06` | Candidatos: menor No disponible, mayor Disponible, mayor Quizá, menor Sin respuesta, fecha próxima. | Orden determinista; `Quizá` suma débilmente sin equivaler a `Disponible`. |
| `OPEN-07` | Expiración definitiva elimina o anonimiza datos y credenciales. | Refuerza privacidad y temporalidad de equipos rápidos. |
| `OPEN-08` | Sin notificaciones externas automáticas de actividad en MVP. | Evita canales/prefs/jobs no necesarios; se mantiene UI, pendientes y enlaces manuales. |
| `OPEN-09` | Zona horaria IANA por equipo; relativas por zona del equipo y locale de interfaz. | Evita ambigüedad en disponibilidad, propuestas e IA. |

## Decisiones todavía abiertas

No quedan decisiones `OPEN-*` bloqueantes. Dejé como cuestiones futuras no bloqueantes: detección técnica de bots/previews, detalle de borrado vs anonimización por tabla, múltiples administradores, notificaciones futuras y cambios de zona horaria con histórico.

## Archivos modificados

- `planning/01-open-decisions/open-decisions-resolution.md`: creado con resolución completa.
- `product/19-open-questions.md`: actualizado como registro histórico cerrado.
- `PRD.md`: propagación de permisos, lifecycle, retención, notificaciones, ordenación y zona horaria.
- `product/07-business-rules.md`: nuevas reglas funcionales.
- `product/08-lifecycles.md`: plazos y actividad relevante.
- `product/09-functional-requirements.md`: requisitos nuevos/actualizados.
- `product/10-non-functional-requirements.md`: privacidad de expiración.
- `product/11-constraints.md`: restricciones de MVP.
- `product/12-user-stories-and-acceptance-criteria.md`: criterios para defaults, creación rápida y reactivación.
- `product/14-user-flows.md`: flujo de expiración y creación rápida.
- `product/18-ai-feature-specification.md`: política de fechas relativas.
- `product/product-decision-register.md`: nuevas decisiones `D-PROD-023`…`D-PROD-031` y corrección de tabla.
- `README.md`: estado documental actualizado.
- `architecture/adr/ADR-016-async-jobs.md`: referencias a lifecycle ya cerrado.
- `architecture/adr/ADR-017-email-notifications.md`: notificaciones externas fuera del MVP.
- `architecture/adr-reconciliation.md`: actualización de reconciliación ADR-017.
- `architecture/decision-register.md`: se retiraron diferidos ya cerrados.
- `traceability/product-architecture-map.md`: trazabilidad de expiración/limpieza.

## Impacto sobre otros documentos

Las decisiones se propagaron a PRD, reglas, lifecycles, requisitos, historias, flows, IA, ADR afectados y trazabilidad. No creé ADR nuevo porque las decisiones son funcionales/política de producto; solo ajusté ADR-016/017 por referencias obsoletas.

## Validaciones realizadas

- `git diff --check`: sin errores.
- Búsqueda de referencias antiguas a `OPEN-*`: no quedan pendientes vivos fuera del prompt original y los registros de cierre.
- Revisión completa del diff de archivos modificados y lectura completa del nuevo entregable.
- Comprobé que no se añadió código, scaffolding, frontend/backend, Docker ni monorepo.

## Git

`git status --short --branch`:

```text
## main...origin/main [gone]
M  17 archivos de documentación
?? synqo-documentation-v0.2/planning/01-open-decisions/open-decisions-resolution.md
```

`git diff --stat`:

```text
17 files changed, 148 insertions(+), 35 deletions(-)
```

Nota: el archivo nuevo aparece como untracked, por eso no entra en `git diff --stat`.

## Siguiente paso

Ejecutar después, sin hacerlo todavía:

`design/02-visual-direction/02-PROMPT-direccion-visual.md`

---

# Resumen de implementación del Workplan 02

## Trabajo realizado

Ejecuté únicamente el prompt `design/02-visual-direction/02-PROMPT-direccion-visual.md`.

Leí las referencias indicadas por el prompt: `PRD.md`, visión de producto, arquitectura de información, especificación de pantallas, wireframes de inicio de equipo, disponibilidad propia y disponibilidad colectiva, además de requisitos no funcionales. A partir de esas fuentes creé la dirección visual inicial de Synqo sin fijar todavía tokens, componentes, librerías ni pantallas high-fidelity.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `DV-01` | Synqo adopta una dirección visual de herramienta operativa clara, no promocional. | Deriva de baja fricción, coordinación y foco en tareas pendientes. |
| `DV-02` | El color será predominante en disponibilidad, pero siempre redundante con texto, símbolo, patrón o estructura. | Cumple `RNF-A11Y-03` y reduce ambigüedad en calendarios. |
| `DV-03` | `Quizá` se representa como estado intermedio y positivo débil. | Mantiene la decisión de producto: no equivale a `Disponible`. |
| `DV-04` | `Sin respuesta` se representa como ausencia neutral de dato. | Evita confundirlo con `No disponible`. |
| `DV-05` | Resultado y Resolución tendrán jerarquías visuales separadas. | Refuerza que Synqo calcula resultados pero no decide automáticamente. |
| `DV-06` | Las superficies priorizan estructura y escaneo; sin tarjetas anidadas ni elevación decorativa. | Favorece claridad operativa y densidad útil. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes en esta fase. El prompt 03 deberá concretar escalas, paleta accesible, iconos, foco/hover/selección/deshabilitado y densidades de calendario/lista.

## Archivos modificados

- `design/02-visual-direction/visual-direction.md`: creado con atributos visuales, color de disponibilidad, tipografía, espaciado, superficies, iconografía, diferenciación de estados/conceptos, criterios hacer/no hacer y criterios de evaluación.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen de la fase 02.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos, ADR ni trazabilidad porque la fase define dirección visual derivada de decisiones ya consolidadas y no cambia reglas de producto.

## Validaciones realizadas

- Lectura completa del prompt 02 y sus referencias obligatorias.
- Revisión del documento creado para comprobar que no fija tokens, hex colors, componentes definitivos ni librerías.
- Comprobación de coherencia con `RNF-A11Y-03`, disponibilidad por estados, separación Resultado/Resolución y mobile-first.
- Revisión de `git diff` y `git diff --check`.

## Git

Pendiente de cierre final de la fase 02 antes de commit:

```text
M  synqo-documentation-v0.2/WORKPLAN-IMPLEMENTATION-SUMMARY.md
?? synqo-documentation-v0.2/design/02-visual-direction/visual-direction.md
```

## Siguiente paso

Ejecutar después, sin hacerlo todavía:

`design/03-design-system/03-PROMPT-tokens-y-componentes.md`

---

# Resumen de implementación del Workplan 03

## Trabajo realizado

Ejecuté únicamente el prompt `design/03-design-system/03-PROMPT-tokens-y-componentes.md`.

Leí las referencias indicadas: dirección visual, referencias visuales, especificación de pantallas, wireframes low-fi, requisitos no funcionales y ADR-002A. También inspeccioné los assets visuales de marca y mockups claro/oscuro para informar paleta, superficies y acentos sin tomarlos como fuente funcional.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `DS-01` | Tokens semánticos por tema claro/oscuro, con base navy/azul/cian/menta/violeta inspirada en los assets. | Permite implementar React sin exponer colores literales en la API de componentes. |
| `DS-02` | Disponibilidad usa tokens propios por estado: fondo, texto, borde, heatmap/patrón y símbolo. | Cumple accesibilidad y evita depender solo de color. |
| `DS-03` | Componentes base pueden venir de una librería controlable; componentes de dominio son propios de Synqo. | Alinea ADR-002A con lenguaje ubicuo y reglas de producto. |
| `DS-04` | `ResultSummary` y `ResolutionStatus` son componentes separados. | Refuerza la diferencia entre Resultado calculado y Resolución humana. |
| `DS-05` | Eventos documentados son eventos de interfaz, no contratos backend ni eventos de dominio. | Evita filtrar decisiones técnicas en componentes de UI. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes en esta fase. Quedan para prompts posteriores el detalle del calendario, responsive, microinteracciones, estados UI, accesibilidad verificable y high-fidelity.

## Archivos modificados

- `design/03-design-system/design-tokens.md`: creado con tokens semánticos de color, tipografía, espaciado, tamaños, radios, bordes, elevación, motion, z-index, breakpoints y densidad.
- `design/03-design-system/component-catalog.md`: creado con componentes base, componentes de dominio, componentes compuestos recomendados, cobertura MVP, accesibilidad, contenido, eventos y límites.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen de la fase 03.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos, ADR ni trazabilidad. El trabajo concreta diseño derivado de documentación existente y no cambia reglas funcionales ni decisiones arquitectónicas.

## Validaciones realizadas

- Lectura completa del prompt 03 y sus referencias obligatorias.
- Inspección visual de `brand-board.png`, mockups desktop/mobile y temas claro/oscuro.
- Comprobación de cobertura de todos los componentes base y de dominio solicitados.
- Comprobación de tokens redundantes para disponibilidad: color + símbolo + patrón/borde/texto.
- Revisión de `git diff` y `git diff --check`.

## Git

Pendiente de cierre final de la fase 03 antes de commit:

```text
M  synqo-documentation-v0.2/WORKPLAN-IMPLEMENTATION-SUMMARY.md
?? synqo-documentation-v0.2/design/03-design-system/component-catalog.md
?? synqo-documentation-v0.2/design/03-design-system/design-tokens.md
```

## Siguiente paso

Ejecutar después, sin hacerlo todavía:

`design/04-calendar/04-PROMPT-calendario-disponibilidad.md`

---

# Resumen de implementación del Workplan 04

## Trabajo realizado

Ejecuté únicamente el prompt `design/04-calendar/04-PROMPT-calendario-disponibilidad.md`.

Leí las referencias indicadas: requisitos funcionales, flujos de usuario, especificación de pantallas, wireframes de `Mi disponibilidad` y `Disponibilidad colectiva`, dirección visual, tokens y catálogo de componentes. A partir de esas fuentes creé la especificación del calendario de disponibilidad sin introducir reglas nuevas de producto ni decisiones de arquitectura.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `CAL-01` | `Calendario` y `Lista` tienen paridad funcional en `Mi disponibilidad` y `Disponibilidad colectiva`. | La lista actúa como alternativa operativa y accesible, no como vista reducida. |
| `CAL-02` | `Mi disponibilidad` edita disponibilidad individual; `Disponibilidad colectiva` compara agregados y selecciona fechas candidatas. | Mantiene separados disponibilidad general, agregación colectiva y propuestas. |
| `CAL-03` | La intensidad colectiva no mezcla `Quizá` con `Disponible`; los recuentos permanecen separados. | Respeta que `Quizá` es señal positiva débil y evita conclusiones falsas. |
| `CAL-04` | La selección de candidatas existe solo en disponibilidad colectiva y conecta con creación de propuesta. | Alinea el calendario con `RF-PRO-12` sin resolver automáticamente decisiones del equipo. |
| `CAL-05` | El detalle nominal se carga bajo demanda y respeta permisos/acceso. | Reduce ruido visual, protege privacidad y mantiene viable el MVP. |
| `CAL-06` | El calendario debe operar con teclado, lector de pantalla y alternativas no dependientes del color. | Cumple las restricciones de accesibilidad y refuerza la vista Lista como alternativa equivalente. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes en esta fase. El detalle fino de responsive, accesibilidad verificable, estados UI y high-fidelity queda para prompts posteriores ya previstos.

## Archivos modificados

- `design/04-calendar/calendar-specification.md`: creado con modos, vistas, navegación temporal, semántica de celda, interacción, selección de candidatas, accesibilidad, edge cases y decisiones `CAL-*`.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen de la fase 04.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos, ADR ni trazabilidad. La especificación deriva de requisitos y decisiones ya consolidadas: disponibilidad por día, estados separados, distinción entre disponibilidad general y respuesta a propuesta, y ausencia de resolución automática.

## Validaciones realizadas

- Lectura completa del prompt 04 y sus referencias obligatorias.
- Comprobación de cobertura de `Mi disponibilidad`, `Disponibilidad colectiva`, `Calendario`, `Lista`, navegación temporal, selección de candidatas, accesibilidad y edge cases.
- Comprobación de que no se introducen franjas horarias, recurrencia, chat, subconjuntos arbitrarios ni cálculo automático de decisiones.
- Revisión de `git diff` y `git diff --check`.

## Git

Pendiente de cierre final de la fase 04 antes de commit:

```text
M  synqo-documentation-v0.2/WORKPLAN-IMPLEMENTATION-SUMMARY.md
?? synqo-documentation-v0.2/design/04-calendar/calendar-specification.md
```

## Siguiente paso

Ejecutar después, sin hacerlo todavía:

`design/05-responsive/05-PROMPT-comportamiento-responsive.md`

---

# Resumen de implementación del Workplan 05

## Trabajo realizado

Ejecuté únicamente el prompt `design/05-responsive/05-PROMPT-comportamiento-responsive.md`.

Leí las referencias indicadas por el prompt y los wireframes funcionales principales para cubrir los flujos críticos. A partir de esas fuentes creé la especificación responsive de Synqo, centrada en reglas de reflow, navegación por viewport, calendario/lista, formularios, resultados, configuración, tablas nominales, sheets/dialogs/rutas, orientación, zoom, touch targets y contenido largo/localizado.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `RESP-01` | Usar los breakpoints ya definidos en tokens, priorizando reglas de contenido sobre umbrales rígidos. | Evita duplicar escalas y responde mejor a texto real/localizado. |
| `RESP-02` | Adoptar navegación móvil de equipo `Inicio | Disponibilidad | Decisiones | Más`. | Ya estaba propuesta en arquitectura de información y cubre destinos principales del equipo. |
| `RESP-03` | El calendario móvil puede alternar mes compacto, semana expandida y lista equivalente sin perder funcionalidad. | Mantiene operabilidad en 320–360px y respeta la paridad `Calendario | Lista`. |
| `RESP-04` | Las tablas nominales se convierten en listas agrupadas en móvil; no hay scroll horizontal operativo. | Protege usabilidad táctil y lectura accesible de participantes/resultados. |
| `RESP-05` | Bottom sheet para detalle/edición contextual breve; ruta o pantalla completa para flujos largos. | Mantiene contexto sin encerrar formularios complejos en contenedores incómodos. |
| `RESP-06` | Resultado y Resolución mantienen separación responsive en todos los tamaños. | Refuerza que Synqo calcula resultados pero no resuelve automáticamente. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes en esta fase. Contraste, foco, orden exacto de tabulación y checklist WCAG quedan para el prompt específico de accesibilidad.

## Archivos modificados

- `design/05-responsive/responsive-behaviour.md`: creado con breakpoints conceptuales, navegación, reglas por contenido, reglas por pantalla crítica, orientación, zoom, tamaños táctiles, estados de carga/error y decisiones `RESP-*`.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen de la fase 05.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos, ADR ni trazabilidad. La fase concreta comportamiento responsive derivado de arquitectura de información, pantallas, wireframes, componentes y calendario ya documentados.

## Validaciones realizadas

- Lectura completa del prompt 05 y sus referencias obligatorias.
- Lectura de wireframes funcionales principales para comprobar flujos móviles reales.
- Comprobación de cobertura de 320–360px, navegación `Inicio | Disponibilidad | Decisiones | Más`, calendario, listas, formularios, resultados, settings, tablas nominales, diálogos/sheets/rutas, orientación, zoom y texto largo.
- Revisión de `git diff` y `git diff --check`.

## Git

Pendiente de cierre final de la fase 05 antes de commit:

```text
M  synqo-documentation-v0.2/WORKPLAN-IMPLEMENTATION-SUMMARY.md
?? synqo-documentation-v0.2/design/05-responsive/responsive-behaviour.md
```

## Siguiente paso

Ejecutar después, sin hacerlo todavía:

`design/06-interactions/06-PROMPT-patrones-de-interaccion.md`

---

# Resumen de implementación del Workplan 06

## Trabajo realizado

Ejecuté únicamente el prompt `design/06-interactions/06-PROMPT-patrones-de-interaccion.md`.

Leí las referencias indicadas y creé la especificación de patrones de interacción para guardado, confirmaciones, latencia, retry, idempotencia, concurrencia, compartir enlaces, deep links, edición/read-only y gestión de foco.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `INT-01` | Crear, responder, votar y configurar usan guardado explícito por defecto. | Reduce ambigüedad y previene pérdidas en acciones de coordinación. |
| `INT-02` | La disponibilidad puede usar feedback optimista si se distingue de guardado confirmado. | Permite fluidez sin falsear persistencia. |
| `INT-03` | Resolver, cancelar y revocar requieren confirmación explícita. | Son acciones irreversibles o de alto impacto. |
| `INT-04` | Los errores recuperables conservan entrada local siempre que sea posible. | Protege el trabajo del usuario ante red o validación. |
| `INT-05` | Deep links retornan al contexto objetivo y explican estados inválidos/revocados/expirados. | Mantiene baja fricción sin ocultar fallos de acceso. |
| `INT-06` | Las respuestas pasan a read-only al cerrarse, resolverse o cancelarse la Consulta. | Respeta lifecycles y evita edición fuera de ventana. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes. La microcopy exacta queda para el prompt 08.

## Archivos modificados

- `design/06-interactions/interaction-patterns.md`: creado con patrones operativos y decisiones `INT-*`.
- `WORKPLAN.md`: fase 06 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta comportamiento de interfaz derivado de flujos, historias, pantallas, componentes y responsive.

## Validaciones realizadas

- Lectura completa del prompt 06 y sus referencias.
- Comprobación de cobertura de confirmación/feedback para acciones críticas.
- Comprobación de idempotencia, concurrencia y conservación de entrada ante errores recuperables.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 06 del workplan

Define patrones de interacción.
```

## Siguiente paso

Ejecutar después:

`design/07-ui-states/07-PROMPT-catalogo-estados-ui.md`

---

# Resumen de implementación del Workplan 07

## Trabajo realizado

Ejecuté únicamente el prompt `design/07-ui-states/07-PROMPT-catalogo-estados-ui.md`.

Leí las referencias indicadas y creé el catálogo de estados UI, separando estados transversales de estados de dominio y documentando mensajes, acciones, acciones prohibidas, navegación/contexto, variantes responsive y tratamiento accesible.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `STATE-01` | Estados técnicos y de negocio se renderizan por separado. | Evita presentar lifecycles normales como errores. |
| `STATE-02` | Enlace inválido, revocado y expirado son estados distintos. | Tienen causas y acciones de recuperación diferentes. |
| `STATE-03` | Equipo rápido `Recoverable` es accionable; `Expired` es terminal. | Respeta lifecycle y privacidad/retención. |
| `STATE-04` | Consulta cerrada pendiente es read-only para respuestas pero accionable para resolver/cancelar según permisos. | Preserva el eje participación/resolución. |
| `STATE-05` | `Sin respuesta` es ausencia de dato, no error ni voto negativo. | Mantiene la semántica funcional consolidada. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes. El copy final se refinará en el prompt 08.

## Archivos modificados

- `design/07-ui-states/ui-state-catalogue.md`: creado con estados transversales, dominio, enlaces, responsive, accesibilidad y decisiones `STATE-*`.
- `WORKPLAN.md`: fase 07 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. El catálogo deriva de lifecycles, RNF, pantallas y patrones de interacción.

## Validaciones realizadas

- Comprobación de cobertura de equipo rápido, equipo administrable, solicitud, consulta, deadline, `Sin respuesta` y participante inactivo.
- Comprobación explícita de enlace inválido, revocado y expirado como estados distintos.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 07 del workplan

Define catálogo de estados UI.
```

## Siguiente paso

Ejecutar después:

`design/08-content/08-PROMPT-microcopy-y-contenido.md`

---

# Resumen de implementación del Workplan 08

## Trabajo realizado

Ejecuté únicamente el prompt `design/08-content/08-PROMPT-microcopy-y-contenido.md`.

Leí las referencias indicadas y creé la guía de contenido y microcopy: tono, etiquetas UX, onboarding, temporalidad, verificación, compartir, permisos, resultado/resolución, cancelación, disponibilidad, validaciones, estados vacíos, errores y glosario dominio → UI.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `CONTENT-01` | `Equipo` se mantiene como etiqueta UI principal. | Es el contexto central del dominio y evita introducir "grupo". |
| `CONTENT-02` | `Decisiones` agrupa Propuestas y Encuestas en navegación; `Consulta` queda para dominio. | Sigue la arquitectura de información. |
| `CONTENT-03` | UI usa `Resultado actual` y `Decisión final`. | Evita confundir cálculo con resolución humana. |
| `CONTENT-04` | Equipo rápido se comunica como temporal sin tono alarmista. | Claridad sobre expiración sin fricción innecesaria. |
| `CONTENT-05` | `Sin respuesta` se nombra explícitamente y nunca como `No`. | Mantiene la distinción funcional obligatoria. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes. Los textos podrán ajustarse tras validación de usabilidad.

## Archivos modificados

- `design/08-content/content-and-microcopy.md`: creado con guía de tono, etiquetas, mensajes, validaciones y decisiones `CONTENT-*`.
- `WORKPLAN.md`: fase 08 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La guía concreta lenguaje de interfaz derivado del lenguaje ubicuo, reglas de negocio, IA y estados UI.

## Validaciones realizadas

- Comprobación de separación `Resultado actual` / `Decisión final`.
- Comprobación de temporalidad de equipo rápido sin lenguaje alarmista.
- Comprobación de etiquetas consistentes con lenguaje ubicuo.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 08 del workplan

Define microcopy y contenido.
```

## Siguiente paso

Ejecutar después:

`design/09-accessibility/09-PROMPT-especificacion-accesibilidad.md`

---

# Resumen de implementación del Workplan 09

## Trabajo realizado

Ejecuté únicamente el prompt `design/09-accessibility/09-PROMPT-especificacion-accesibilidad.md`.

Leí las referencias indicadas y creé la especificación de accesibilidad y checklist. El trabajo convierte WCAG 2.2 AA en requisitos verificables para contraste, foco, tabulación, landmarks, formularios, calendario, disponibilidad, dialogs/sheets/toasts, resultados y tablas.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `A11Y-01` | WCAG 2.2 AA es criterio mínimo de aceptación UI. | Alinea `RNF-A11Y-01` con validación concreta. |
| `A11Y-02` | El calendario debe ser operable íntegramente con teclado. | Cubre el componente más crítico de disponibilidad. |
| `A11Y-03` | Los cuatro estados de disponibilidad tienen canal no cromático obligatorio. | Cumple `RNF-A11Y-03` y evita ambigüedad. |
| `A11Y-04` | Toasts no comunican errores accionables como única vía. | Mejora robustez y accesibilidad de errores. |
| `A11Y-05` | Lista y detalle son alternativa textual completa al calendario compacto. | Refuerza paridad funcional y accesibilidad móvil. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes. La herramienta exacta de auditoría automática se definirá en implementación.

## Archivos modificados

- `design/09-accessibility/accessibility-specification.md`: creado con requisitos testables y decisiones `A11Y-*`.
- `design/09-accessibility/accessibility-checklist.md`: creado con checklist manual y automatizable.
- `WORKPLAN.md`: fase 09 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La especificación operacionaliza RNF de accesibilidad y diseño ya documentado.

## Validaciones realizadas

- Comprobación de requisitos testables.
- Comprobación de operabilidad de calendario sin ratón.
- Comprobación de que disponibilidad no depende solo del color.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 09 del workplan

Define accesibilidad UI.
```

## Siguiente paso

Ejecutar después:

`design/10-high-fidelity/10-PROMPT-especificacion-high-fidelity.md`

---

# Resumen de implementación del Workplan 10

## Trabajo realizado

Ejecuté únicamente el prompt `design/10-high-fidelity/10-PROMPT-especificacion-high-fidelity.md`.

Leí las referencias indicadas y todos los wireframes funcionales. Creé briefs high-fidelity reproducibles para las pantallas críticas, con viewports, datos de ejemplo, estados, componentes y criterios de revisión visual/funcional.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `HF-01` | El set mínimo high-fi cubre 12 pantallas derivadas de wireframes funcionales. | Abarca recorridos críticos sin inventar pantallas nuevas. |
| `HF-02` | Móvil 360 es obligatorio para todas las pantallas críticas. | Refuerza mobile-first y operación en 320–360px. |
| `HF-03` | Desktop se especifica solo cuando cambia composición sustancialmente. | Evita duplicar sin valor y focaliza diferencias reales. |
| `HF-04` | Los briefs son reproducibles en Figma o prototipo HTML, sin implementar producto. | Mantiene fase documental. |
| `HF-05` | Los mockups deben mostrar estados, no solo happy path. | Conecta con catálogo de estados y accesibilidad. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes. La herramienta final de diseño puede elegirse más adelante.

## Archivos modificados

- `design/10-high-fidelity/high-fidelity-screen-briefs.md`: creado con briefs de pantallas y decisiones `HF-*`.
- `WORKPLAN.md`: fase 10 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. Los briefs consolidan documentación de diseño previa para producción de mockups.

## Validaciones realizadas

- Comprobación de cobertura de landing, selección tipo de equipo, team home, disponibilidad individual/colectiva, solicitud, propuesta, encuesta, resultado/resolución, settings e IA.
- Comprobación de referencia a wireframes y criterios funcionales.
- Comprobación de móvil y escritorio donde cambia composición.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 10 del workplan

Define briefs high-fidelity.
```

## Siguiente paso

Ejecutar después:

`design/11-prototype/11-PROMPT-prototipo-interactivo.md`

---

# Resumen de implementación del Workplan 11

## Trabajo realizado

Ejecuté únicamente el prompt `design/11-prototype/11-PROMPT-prototipo-interactivo.md`.

Leí flujos, trazabilidad, briefs high-fidelity e interacciones. Creé la especificación del prototipo navegable y los escenarios de prueba para los tres E2E principales: coordinación rápida, encuesta y equipo administrable.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `PROTO-01` | Prototipo Figma-first sin backend real. | Valida navegación y comprensión sin implementar producto. |
| `PROTO-02` | Los tres E2E principales son coordinación rápida, encuesta y equipo administrable. | Coinciden con trazabilidad y objetivo del prompt. |
| `PROTO-03` | Resultados y disponibilidad usan datos fijos. | Permite evaluar comprensión sin cálculo dinámico. |
| `PROTO-04` | Deep links se simulan como rutas directas. | Reproduce acceso a acción objetivo sin infraestructura. |
| `PROTO-05` | Variantes de error son frames enlazables. | Cubre recuperación sin lógica real. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes. La herramienta final podrá ser Figma u otra equivalente.

## Archivos modificados

- `design/11-prototype/prototype-specification.md`: creado con alcance, rutas, datos, E2E, estados y decisiones `PROTO-*`.
- `design/11-prototype/test-scenarios.md`: creado con guiones de prueba y variantes de error.
- `WORKPLAN.md`: fase 11 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase prepara validación de diseño a partir de trazabilidad y briefs existentes.

## Validaciones realizadas

- Comprobación de los tres E2E navegables conceptualmente.
- Comprobación de ausencia de backend real.
- Comprobación de datos ficticios suficientes para disponibilidad, resultado y resolución.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 11 del workplan

Define prototipo interactivo.
```

## Siguiente paso

Ejecutar después:

`design/12-usability/12-PROMPT-validacion-usabilidad.md`

---

# Resumen de implementación del Workplan 12

## Trabajo realizado

Ejecuté únicamente el prompt `design/12-usability/12-PROMPT-validacion-usabilidad.md`.

Leí prototipo, usuarios/escenarios, JTBD y PRD. Creé el plan de validación de usabilidad y la plantilla de hallazgos, centrados en comprensión de conceptos críticos y trazabilidad de cambios. También corregí dos separadores de tabla Markdown en `design/11-prototype/prototype-specification.md` detectados al leerlo como referencia.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `UXR-01` | La validación prioriza comprensión de conceptos críticos sobre opinión estética. | Alinea el test con riesgos de producto. |
| `UXR-02` | La muestra inicial recomendada es de 5 participantes. | Suficiente para una ronda ligera y defendible. |
| `UXR-03` | Los tres E2E del prototipo son la base de tareas. | Mantiene coherencia con PRD y trazabilidad. |
| `UXR-04` | Hallazgos se trazan a JTBD, E2E, pantalla y documento afectado. | Facilita convertir observaciones en cambios documentales. |
| `UXR-05` | Un hallazgo de severidad alta basta para proponer cambio antes de avanzar. | Protege distinciones críticas del producto. |

## Decisiones todavía abiertas

No quedan decisiones bloqueantes en la fase de diseño. Los resultados reales de pruebas podrán generar cambios documentales posteriores.

## Archivos modificados

- `design/12-usability/usability-test-plan.md`: creado con objetivos, preguntas, perfiles, tareas, guiones, métricas, severidad y trazabilidad.
- `design/12-usability/findings-template.md`: creado con plantilla para sesiones, observaciones, hallazgos, trazabilidad y decisiones.
- `design/11-prototype/prototype-specification.md`: corrección menor de formato Markdown en tablas.
- `WORKPLAN.md`: fase 12 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. El plan define cómo los futuros hallazgos deberán trazarse a documentos afectados antes de aplicar cambios.

## Validaciones realizadas

- Comprobación de correspondencia entre tareas y JTBD.
- Comprobación de que no se sustituye usabilidad por opinión estética.
- Comprobación de trazabilidad de hallazgos a documentos afectados.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 12 del workplan

Define validación de usabilidad.
```

## Siguiente paso

La fase de diseño de producto/UI queda completada hasta el hito A. El siguiente prompt del workplan, sin ejecutarlo todavía, es:

`technical-design/13-domain/13-PROMPT-diseno-de-dominio.md`

---

# Resumen de implementación del Workplan 13

## Trabajo realizado

Ejecuté únicamente el prompt `technical-design/13-domain/13-PROMPT-diseno-de-dominio.md`.

Leí `AGENTS.md`, `WORKPLAN.md`, el prompt 13 y sus referencias obligatorias: lenguaje ubicuo, modelo conceptual, reglas de negocio, ciclos de vida, requisitos funcionales, ADR-004 y ADR-005. También contrasté PRD, priorización MoSCoW, RNF, constraints y registro arquitectónico para no sobrediseñar el dominio ni contradecir decisiones aceptadas.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `DD-01` | El monolito modular se organiza pragmáticamente en Identity & Access, Teams, Availability, Decisions, Notifications y AI Assistance. | Cubre responsabilidades reales sin introducir microservicios ni bounded contexts ceremoniales. |
| `DD-02` | `Team` es agregado raíz para modalidad, lifecycle, participantes, configuración y políticas. | Equipo es el contexto principal y concentra invariantes transversales. |
| `DD-03` | `DecisionProcess` es la raíz táctica para `Consulta`, con comportamiento por tipo Propuesta/Encuesta. | Comparte invariantes reales sin imponer herencia técnica ni tabla única prematura. |
| `DD-04` | Disponibilidad se modela por entrada diaria `Team + Participant + Date`; calendario y coincidencias son vistas/servicios deterministas. | Preserva disponibilidad por día y evita convertir vistas UI en agregados. |
| `DD-05` | Los límites transaccionales críticos se documentan para creación de equipo, verificación admin, vinculación, disponibilidad, respuesta, resolución y expiración. | Prepara las fases de estado, autorización, datos y API sobre PostgreSQL/MikroORM. |

## Decisiones todavía abiertas

Quedan para fases posteriores: esquema físico exacto, identificadores públicos/internos, locking de resolución concurrente, contrato API, jobs concretos y email transaccional.

## Archivos modificados

- `technical-design/13-domain/domain-design.md`: creado con módulos, agregados, decisión sobre `Consulta`, casos de uso y responsabilidades dominio/aplicación/infraestructura.
- `technical-design/13-domain/domain-invariants.md`: creado con invariantes `INV-*`, límites transaccionales `TX-*` y orientación para tests posteriores.
- `architecture/decision-register.md`: retirada la deuda diferida de agregados/límites transaccionales y referencia a los nuevos documentos.
- `WORKPLAN.md`: fase 13 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase traduce decisiones existentes a diseño táctico y actualiza únicamente el registro arquitectónico para evitar una deuda ya resuelta.

## Validaciones realizadas

- Comprobación de que no se introduce CQRS, Event Sourcing, microservicios ni repositories genéricos.
- Comprobación de que `Consulta` no se convierte automáticamente en herencia técnica.
- Comprobación de coherencia con MoSCoW: los `Must` y RNF bloqueantes quedan como invariantes iniciales.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 13 del workplan

Define diseño de dominio.
```

## Siguiente paso

Ejecutar después:

`technical-design/14-state-machines/14-PROMPT-maquinas-de-estado.md`

---

# Resumen de implementación del Workplan 14

## Trabajo realizado

Ejecuté únicamente el prompt `technical-design/14-state-machines/14-PROMPT-maquinas-de-estado.md`.

Leí las referencias indicadas: lifecycles, reglas de negocio, diseño de dominio de la fase 13 y decisiones abiertas. Formalicé máquinas de estado implementables para equipo rápido, equipo administrable, solicitud de disponibilidad y consulta.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `SM-01` | Equipo rápido usa estados `ACTIVE`, `RECOVERABLE`, `EXPIRED` con jobs separados para inactividad y expiración. | Traduce los plazos cerrados de producto a transiciones testeables. |
| `SM-02` | Equipo administrable queda en `PENDING_VERIFICATION` hasta verificar email administrativo. | Evita administración persistente sin prueba válida. |
| `SM-03` | Solicitud de disponibilidad solo necesita `OPEN` y `CLOSED` en dominio; `Draft` queda como UI. | Mantiene el dominio simple y consistente con el MVP. |
| `SM-04` | Consulta se modela con dos ejes: `participationState` y `resolutionState`. | Preserva la diferencia entre cierre de participación y decisión final. |
| `SM-05` | Deadlines cierran participación, pero nunca resuelven automáticamente. | Respeta que Synqo no decide por el equipo. |

## Decisiones todavía abiertas

Quedan para fases posteriores: matriz exacta de permisos por transición, sesiones/enlaces, locking de resolución concurrente, jobs concretos y email transaccional.

## Archivos modificados

- `technical-design/14-state-machines/state-machines.md`: creado con diagramas Mermaid, tablas de transición, errores de dominio y matriz mínima de tests.
- `WORKPLAN.md`: fase 14 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. El documento concreta lifecycles existentes y remite permisos, identidad, persistencia y jobs a fases posteriores ya previstas.

## Validaciones realizadas

- Comprobación de combinaciones válidas de consulta: `OPEN/PENDING`, `CLOSED/PENDING`, `CLOSED/RESOLVED`, `CLOSED/CANCELLED`.
- Comprobación de que no se introducen transiciones de resolución automática.
- Comprobación de que deadlines solo cierran participación.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 14 del workplan

Define máquinas de estado.
```

## Siguiente paso

Ejecutar después:

`technical-design/15-authorization/15-PROMPT-matriz-de-autorizacion.md`

---

# Resumen de implementación del Workplan 15

## Trabajo realizado

Ejecuté únicamente el prompt `technical-design/15-authorization/15-PROMPT-matriz-de-autorizacion.md`.

Leí ADR-022, reglas de negocio, requisitos funcionales, historias de usuario, diseño de dominio y máquinas de estado. También consulté ADR-008, ADR-021 y RNF de seguridad para cubrir sesiones, enlaces opacos y prevención de IDOR.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `AUTH-01` | La autorización se evalúa como `actor + equipo + recurso + operación + estado`, no como RBAC genérico. | Sigue ADR-022 y evita roles artificiales. |
| `AUTH-02` | Cuenta global no concede capacidades contextuales sin participación o administración vinculada. | Conserva `Cuenta ≠ Participante` y evita escalada. |
| `AUTH-03` | En equipo rápido, participantes activos pueden crear y resolver; no existe administración formal. | Refleja reglas de producto cerradas. |
| `AUTH-04` | En equipo administrable, creación/resolución dependen de políticas `EVERYONE`/`ADMINISTRATORS`, con defaults documentados. | Soporta configuración MVP sin RBAC genérico. |
| `AUTH-05` | Todo acceso por link sensible se canjea por sesión contextual y URL limpia. | Alinea ADR-021 y reduce fuga de tokens. |

## Decisiones todavía abiertas

Quedan para fase 16 detalles de sesiones/enlaces opacos; para fase 17 locking/concurrencia; para fase 18 contratos HTTP exactos.

## Archivos modificados

- `technical-design/15-authorization/authorization-matrix.md`: creado con actores, políticas quick/managed, matriz por recurso y operaciones fuera del MVP.
- `technical-design/15-authorization/authorization-rules.md`: creado con reglas server-side, validaciones anti-IDOR, servicio conceptual y errores recomendados.
- `technical-design/14-state-machines/state-machines.md`: actualizado para apuntar a la matriz de autorización ya creada.
- `WORKPLAN.md`: fase 15 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta ADR-022 y deja referencias desde máquinas de estado hacia las reglas ya disponibles.

## Validaciones realizadas

- Comprobación de que toda operación mutante listada tiene regla de autorización.
- Comprobación de que la UI no aparece como autoridad.
- Comprobación de que no se introduce RBAC genérico ni roles arbitrarios.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 15 del workplan

Define autorizacion contextual.
```

## Siguiente paso

Ejecutar después:

`technical-design/16-identity-sessions/16-PROMPT-identidad-sesiones-y-links.md`

---

# Resumen de implementación del Workplan 16

## Trabajo realizado

Ejecuté únicamente el prompt `technical-design/16-identity-sessions/16-PROMPT-identidad-sesiones-y-links.md`.

Leí ADR-008, ADR-021, ADR-015, lenguaje ubicuo, flujos de usuario y la matriz/reglas de autorización de fase 15. Diseñé sesiones opacas, enlaces públicos/identificados/verificación/recuperación, convivencia de contextos y flujos técnicos.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `ID-01` | Sesiones de cuenta, participante y administración permanecen separadas y server-side. | Preserva `Cuenta ≠ Participante ≠ Administrador`. |
| `ID-02` | Links sensibles usan tokens opacos hasheados, scope mínimo, TTL y clean redirect. | Reduce fuga por URL, logs, referrer o copia accidental. |
| `ID-03` | La capacidad administrativa vive en `AdministrativeSession`, no en bearer link permanente. | Cumple ADR-021 y evita escalada por URL persistente. |
| `ID-04` | Varias sesiones de equipo pueden convivir junto a cuenta global. | Permite baja fricción y agregación sin colapsar identidades. |
| `ID-05` | Vincular participante a cuenta conserva `participantId`, autoría e histórico. | Respeta las invariantes funcionales de identidad local. |

## Decisiones todavía abiertas

Quedan para fase 17 el esquema físico exacto; para fase 20 jobs de limpieza/expiración; para fase 23 detalle de retención/anonimización.

## Archivos modificados

- `technical-design/16-identity-sessions/identity-and-session-design.md`: creado con tipos de sesión/link, TTL, hashing, rotación, revocación, clean redirect, convivencia de sesiones, flujos y controles de seguridad.
- `technical-design/15-authorization/authorization-rules.md`: actualizado para enlazar al diseño de identidad ya creado.
- `WORKPLAN.md`: fase 16 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta ADR-008/021/015 y actualiza una referencia técnica en autorización.

## Validaciones realizadas

- Comprobación de que ninguna capacidad administrativa depende de un bearer link permanente.
- Comprobación de que tokens sensibles se canjean y se eliminan de URL mediante clean redirect.
- Comprobación de que la vinculación participante-cuenta conserva `participantId` e histórico.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 16 del workplan

Define identidad y sesiones.
```

## Siguiente paso

Ejecutar después:

`technical-design/17-data-model/17-PROMPT-modelo-de-datos-y-erd.md`

---

# Resumen de implementación del Workplan 17

## Trabajo realizado

Ejecuté únicamente el prompt `technical-design/17-data-model/17-PROMPT-modelo-de-datos-y-erd.md`.

Leí ADR-005, dominio táctico, máquinas de estado, identidad/sesiones y reglas de negocio. Definí el modelo lógico PostgreSQL/MikroORM, constraints, índices, estrategia de concurrencia, retención y ERD Mermaid.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `DM-01` | Usar `decision_processes` como raíz común con `proposal_details` y `survey_details`. | Comparte lifecycle/resolución sin tabla única saturada ni duplicar propuesta/encuesta. |
| `DM-02` | Persistir disponibilidad general solo en `availability_entries`; solicitudes no duplican respuestas. | Respeta que responder solicitud actualiza disponibilidad general. |
| `DM-03` | Respuesta de consulta se modela como `decision_responses` + tablas de opciones por tipo. | Garantiza idempotencia por participante y permite resultados eficientes. |
| `DM-04` | Resolución se persiste separada en `decision_resolutions` y opciones elegidas. | Mantiene Resultado y Resolución como conceptos distintos. |
| `DM-05` | Sesiones y enlaces usan tablas separadas con hashes, TTL, revocación y scopes. | Refuerza fase 16 y evita bearer links permanentes. |
| `DM-06` | Usar optimistic locking o bloqueo pesimista sobre `decision_processes` para resolución/cancelación. | Evita doble resolución y soporta `CONCURRENT_RESOLUTION_CONFLICT`. |

## Decisiones todavía abiertas

Queda para implementación elegir entre enum PostgreSQL real o checks equivalentes por migración; para fase 20 concretar pg-boss y jobs; para fase 23 cerrar política exacta de retención/anonimización.

## Archivos modificados

- `technical-design/17-data-model/data-model.md`: creado con tablas, campos, constraints, índices, concurrencia y retención.
- `technical-design/17-data-model/erd.md`: creado con ERD Mermaid.
- `technical-design/14-state-machines/state-machines.md`: actualizadas referencias ya resueltas por fases 16 y 17.
- `WORKPLAN.md`: fase 17 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta ADR-005 y deja referencias preparadas para API, jobs y privacidad.

## Validaciones realizadas

- Comprobación de unique `(teamId, participantId, localDate)` para disponibilidad diaria.
- Comprobación de que `UNANSWERED` no se persiste como disponibilidad.
- Comprobación de que solicitudes no duplican respuestas de disponibilidad.
- Comprobación de que consulta separa participación y resolución.
- Comprobación de que resolución no se confunde con resultado calculado.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 17 del workplan

Define modelo de datos.
```

## Siguiente paso

Ejecutar después:

`technical-design/18-api/18-PROMPT-contrato-api-openapi.md`

---

# Resumen de implementación del Workplan 18

## Trabajo realizado

Ejecuté únicamente el prompt `technical-design/18-api/18-PROMPT-contrato-api-openapi.md`.

Leí ADR-006, dominio táctico, matriz de autorización, identidad/sesiones, modelo de datos, requisitos funcionales y especificación funcional IA. Diseñé la API REST de producto y generé un OpenAPI 3.1 inicial.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `API-01` | Base `/api/v1` con REST JSON y OpenAPI 3.1. | Aplica ADR-006 y deja frontera generable para frontend. |
| `API-02` | Usar referencias públicas (`teamRef`, `decisionRef`, etc.) en vez de IDs internos. | Evita exponer el esquema físico y reduce acoplamiento. |
| `API-03` | Mantener endpoints de creación de propuestas/encuestas específicos y lectura común de decisiones. | Refleja especialización de entrada sin duplicar lifecycle/resultados. |
| `API-04` | Respuestas a solicitudes actualizan disponibilidad mediante `PUT` idempotente. | Preserva que no hay disponibilidad duplicada por solicitud. |
| `API-05` | Resolución/cierre/cancelación usan idempotencia y concurrencia optimista (`If-Match`/`version`). | Evita doble resolución y soporta reintentos seguros. |
| `API-06` | IA solo interpreta y devuelve candidatos; la publicación usa endpoints ordinarios. | Mantiene el LLM fuera de mutaciones y decisiones de dominio. |

## Decisiones todavía abiertas

Quedan para implementación detalles exactos de generación de cliente, política final de CSRF y formato operativo de ETag. No bloquean el contrato inicial.

## Archivos modificados

- `technical-design/18-api/api-design.md`: creado con decisiones, endpoints, DTOs, errores, idempotencia y cobertura E2E.
- `technical-design/18-api/openapi.yaml`: creado con contrato OpenAPI 3.1 inicial.
- `WORKPLAN.md`: fase 18 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La API concreta ADR-006 y consume las fases 15, 16 y 17.

## Validaciones realizadas

- Comprobación de cobertura de E2E-01, E2E-02 y E2E-03.
- Comprobación de errores de autorización, validación, conflicto y estado.
- Comprobación de que IA no muta dominio.
- Comprobación de que disponibilidad general y respuestas de propuesta siguen separadas.
- Revisión de parseo YAML, `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 18 del workplan

Define contrato API.
```

## Siguiente paso

Ejecutar después:

`technical-design/19-sequences/19-PROMPT-diagramas-de-secuencia.md`

---

# Resumen de implementación del Workplan 19

## Trabajo realizado

Ejecuté únicamente el prompt `technical-design/19-sequences/19-PROMPT-diagramas-de-secuencia.md`.

Leí flujos de usuario, identidad/sesiones, diseño API y máquinas de estado. Documenté diagramas Mermaid para los recorridos runtime críticos, incluyendo side effects asíncronos y errores relevantes.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `SEQ-01` | Diagramas al nivel FE/API/App/Authz/Domain/DB/Jobs/Email/LLM. | Mantiene foco en integración runtime sin bajar a métodos internos. |
| `SEQ-02` | Mostrar emails y jobs como side effects asíncronos posteriores al commit. | Evita confundir transacción principal con proveedores externos. |
| `SEQ-03` | Deadline cierra participación pero no resuelve. | Preserva Resultado/Resolución y evita decisiones automáticas. |
| `SEQ-04` | IA termina en interpretación/candidatos y vuelve al flujo normal de propuesta. | Mantiene al LLM fuera de mutaciones de dominio. |
| `SEQ-05` | Errores transversales se agrupan además de aparecer en diagramas. | Hace visibles token inválido, permisos, deadline, concurrencia y fallo proveedor. |

## Decisiones todavía abiertas

Quedan para fase 20 los detalles operativos de jobs y para fase 21 el proveedor/plantillas de email. No bloquean los diagramas.

## Archivos modificados

- `technical-design/19-sequences/sequence-diagrams.md`: creado con diagramas de crear rápido, public/identified link, managed+verify, recovery, disponibilidad, propuesta, encuesta, cuenta, lifecycle, IA, deadline y errores.
- `WORKPLAN.md`: fase 19 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase conecta flujos de producto con API, estado, identidad y jobs futuros.

## Validaciones realizadas

- Comprobación de cobertura de E2E-01, E2E-02 y E2E-03.
- Comprobación de coherencia con endpoints de fase 18.
- Comprobación de coherencia con state machines de equipo, solicitud y consulta.
- Comprobación de side effects asíncronos separados de la transacción principal.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 19 del workplan

Documenta secuencias runtime.
```

## Siguiente paso

Ejecutar después:

`technical-design/20-jobs-events/20-PROMPT-jobs-y-eventos.md`

---

# Resumen de implementación del Workplan 20

## Trabajo realizado

Ejecuté únicamente el prompt `technical-design/20-jobs-events/20-PROMPT-jobs-y-eventos.md`.

Leí ADR-016, ADR-017, máquinas de estado y diagramas de secuencia. Definí catálogo de jobs pg-boss, payloads mínimos, idempotencia, retries, backoff, dead-letter, observabilidad, estrategia de deadlines y separación entre eventos síncronos y jobs persistentes.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `JOB-01` | Usar pg-boss solo para trabajos con razón funcional concreta. | Aplica ADR-016 sin convertir el dominio en event-driven. |
| `JOB-02` | Emails de verificación/recovery se envían como jobs tras commit de token. | Evita enviar enlaces sin persistencia válida y permite reintentos. |
| `JOB-03` | Deadlines de solicitudes/consultas se gestionan con sweep periódico + validación lazy. | Evita job por recurso y mantiene invariantes aunque el sweep vaya tarde. |
| `JOB-04` | Lifecycle rápido usa sweep periódico y purga por equipo expirado. | Respeta 30d/14d, expiración irreversible y necesidad de observabilidad. |
| `JOB-05` | Eventos internos son síncronos y no contrato distribuido. | Mantiene KISS y evita Event Sourcing/CQRS. |

## Decisiones todavía abiertas

La fase 23 cerrará detalle exacto de delete vs anonimización. La fase 21 cerrará matriz de notificaciones y plantillas; ADR-017 ya fija Resend/Mailpit.

## Archivos modificados

- `technical-design/20-jobs-events/jobs-and-events.md`: creado con catálogo de jobs, estrategia de deadlines, idempotencia, observabilidad y eventos internos.
- `technical-design/14-state-machines/state-machines.md`: actualizada referencia a jobs ya detallados.
- `technical-design/19-sequences/sequence-diagrams.md`: actualizadas referencias a jobs ya concretados.
- `WORKPLAN.md`: fase 20 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta ADR-016/017 y prepara fase 21 de notificaciones.

## Validaciones realizadas

- Comprobación de que cada job tiene razón funcional concreta.
- Comprobación de que no se añaden notificaciones automáticas de actividad.
- Comprobación de que deadlines no resuelven decisiones.
- Comprobación de idempotencia para entrega al menos una vez.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 20 del workplan

Define jobs y eventos.
```

## Siguiente paso

Ejecutar después:

`technical-design/21-notifications/21-PROMPT-matriz-de-notificaciones.md`

---

# Resumen de implementación del Workplan 21

## Trabajo realizado

Ejecuté únicamente el prompt `technical-design/21-notifications/21-PROMPT-matriz-de-notificaciones.md`.

Leí ADR-017, preguntas abiertas, requisitos funcionales, jobs/eventos y microcopy. Cerré la política de comunicación externa del MVP con una matriz evento/canal/destinatario y un catálogo inicial de plantillas de email transaccional.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `NOT-01` | `OPEN-08` queda cerrado: sin notificaciones externas automáticas de actividad en MVP. | Coherente con ADR-017 y requisitos `RF-SD-08`/`RF-CON-16`. |
| `NOT-02` | Email MVP limitado a verificación admin, recuperación admin y cuenta/passwordless si aplica. | Son flujos de identidad/seguridad, no actividad de producto. |
| `NOT-03` | Solicitudes, propuestas, encuestas, resoluciones y expiraciones usan pendientes in-app/on-read y enlaces manuales. | Evita pedir email a participantes y mantiene baja fricción. |
| `NOT-04` | Plantillas de email contienen datos mínimos y enlaces opacos one-time/TTL cuando corresponde. | Reduce exposición de PII y riesgo por enlaces. |

## Decisiones todavía abiertas

No quedan decisiones abiertas para fase 21. Futuras notificaciones opcionales quedan fuera del MVP y requerirán preferencias/opt-out explícitos.

## Archivos modificados

- `technical-design/21-notifications/notification-matrix.md`: creado con política, matriz evento/canal, pendientes in-app, compartición manual, opt-out y seguridad.
- `technical-design/21-notifications/email-template-catalogue.md`: creado con plantillas transaccionales y exclusiones explícitas.
- `technical-design/14-state-machines/state-machines.md`: actualizada referencia a email ya detallado.
- `technical-design/19-sequences/sequence-diagrams.md`: actualizadas referencias a email/plantillas ya concretadas.
- `WORKPLAN.md`: fase 21 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta ADR-017 y deja fase técnica 13-21 cerrada.

## Validaciones realizadas

- Comprobación de que `OPEN-08` queda cerrado/acotado.
- Comprobación de que no se envían emails de actividad a participantes sin email.
- Comprobación de que cada email contiene solo datos mínimos.
- Comprobación de coherencia con jobs de fase 20 y microcopy de fase 08.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 21 del workplan

Cierra notificaciones MVP.
```

## Siguiente paso

Ejecutar después:

`security/22-threat-model/22-PROMPT-threat-model.md`

---

# Resumen de implementación del Workplan 22

## Trabajo realizado

Ejecuté únicamente el prompt `security/22-threat-model/22-PROMPT-threat-model.md`.

Leí ADR-015, ADR-021, ADR-022, la matriz de autorización, el diseño de identidad/sesiones y el contrato OpenAPI. A partir de esas fuentes creé el threat model práctico de Synqo y el checklist de aceptación de seguridad previo a producción.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `SEC-22-01` | El threat model usa STRIDE aplicado a enlaces, sesiones, autorización contextual, endpoints públicos y proveedores externos. | Cubre los riesgos mínimos de ADR-015 y las superficies reales del OpenAPI. |
| `SEC-22-02` | Los riesgos altos requieren mitigaciones verificables mediante tests o evidencias operativas. | Evita basar seguridad en ocultar IDs o en confianza de UI. |
| `SEC-22-03` | El checklist previo a producción bloquea salida si fallan controles críticos de tokens, IDOR, admin, CSRF o rate limiting. | Son condiciones necesarias para que el MVP sea usable de forma segura. |

## Decisiones todavía abiertas

No quedan decisiones abiertas bloqueantes para esta fase. Quedan para implementación valores numéricos exactos de rate limit, detalle operativo de detección de previews/crawlers y rotación de secretos.

## Archivos modificados

- `security/22-threat-model/threat-model.md`: creado con trust boundaries, activos sensibles, amenazas STRIDE, controles, tests y riesgos altos.
- `security/22-threat-model/security-checklist.md`: creado con checklist previo a producción y criterios de bloqueo.
- `WORKPLAN.md`: fase 22 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta decisiones ya aceptadas en ADR-015, ADR-021 y ADR-022 y deja entradas para la fase 23 de privacidad/retención y la fase 25 de testing.

## Validaciones realizadas

- Comprobación de cobertura de token leakage/replay, impersonation, IDOR, admin escalation, CSRF, fixation, enumeration, spam/abuse, race conditions, injection, logging leakage y provider compromise.
- Comprobación de cobertura específica de `PublicLink`, `IdentifiedLink`, `VerificationLink`, `RecoveryLink`, `ParticipantSession` y `AdministrativeSession`.
- Comprobación de que cada riesgo alto tiene mitigación concreta y test/evidencia.
- Comprobación de abuso de endpoints públicos y rate limiting.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 22 del workplan

Define threat model.
```

## Siguiente paso

Ejecutar después:

`security/23-privacy-retention/23-PROMPT-privacidad-y-retencion.md`

---

# Resumen de implementación del Workplan 23

## Trabajo realizado

Ejecuté únicamente el prompt `security/23-privacy-retention/23-PROMPT-privacidad-y-retencion.md`.

Leí PRD, preguntas abiertas, ADR-015, modelo de datos, jobs/eventos y especificación funcional de IA. Definí la política de minimización, retención, proveedores externos y purga de equipos rápidos expirados.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `PRIV-23-01` | `OPEN-07` queda concretado con borrado físico preferente de datos de dominio y credenciales en equipos rápidos expirados. | Es la forma más simple y coherente con temporalidad, baja PII y no recuperación tras `EXPIRED`. |
| `PRIV-23-02` | Solo sobreviven métricas agregadas y trazas operativas minimizadas sin PII ni tokens. | Permite operar/medir sin retener datos nominales de equipos temporales. |
| `PRIV-23-03` | Resend/IdP/LLM reciben solo datos mínimos por finalidad; el LLM no recibe disponibilidad nominal, nombres ni emails. | Mantiene el asistente como intérprete y respeta `RNF-PRIV-04`. |

## Decisiones todavía abiertas

No quedan decisiones abiertas bloqueantes para esta fase. Quedan como parámetros de implementación la duración exacta de retención operacional de logs/auditoría por entorno y contratos/configuración final de proveedores antes de producción.

## Archivos modificados

- `security/23-privacy-retention/data-retention-and-privacy.md`: creado con categorías de datos, retención, purga de rápidos, proveedores, GDPR y controles de aceptación.
- `product/19-open-questions.md`: retirado el riesgo de estrategia por tabla y añadido cierre de fase 23.
- `product/product-decision-register.md`: añadida decisión `D-PROD-033`.
- `technical-design/17-data-model/data-model.md`: concretada política de purga de rápidos expirados.
- `technical-design/20-jobs-events/jobs-and-events.md`: actualizado `purge.expiredQuickTeam` con `DELETE_DOMAIN_DATA`.
- `security/22-threat-model/threat-model.md`: sustituida referencia pendiente a fase 23 por referencia al documento nuevo.
- `WORKPLAN.md`: fase 23 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

La decisión de privacidad se propagó a preguntas abiertas, registro de decisiones, modelo de datos, jobs y threat model. No se modificaron PRD ni ADR porque ya contenían la regla funcional general y esta fase concreta su ejecución.

## Validaciones realizadas

- Comprobación de que `OPEN-07` queda cerrado con criterio implementable.
- Comprobación de que el modelo de datos y `purge.expiredQuickTeam` ya no difieren la decisión a fase 23.
- Comprobación de que IA no recibe disponibilidad nominal, nombres ni emails.
- Comprobación de minimización para Resend/IdP/LLM.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 23 del workplan

Define privacidad y retención.
```

## Siguiente paso

Ejecutar después:

`quality/24-product-analytics/24-PROMPT-analitica-de-producto.md`

---

# Resumen de implementación del Workplan 24

## Trabajo realizado

Ejecuté únicamente el prompt `quality/24-product-analytics/24-PROMPT-analitica-de-producto.md`.

Leí PRD, usuarios/escenarios, matriz de trazabilidad y privacidad/retención. Convertí las métricas iniciales del PRD en una taxonomía mínima de eventos de producto, con propiedades permitidas/prohibidas, funnels E2E y estrategia de instrumentación sin elegir proveedor.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `AN-24-01` | La analítica se limita a eventos necesarios para métricas PRD y validación TFM. | Evita capturar datos sin propósito. |
| `AN-24-02` | Se prohíben nombres, emails, tokens, texto libre, ids directos, disponibilidad nominal y votos nominales. | Alinea analítica con la política de privacidad de fase 23. |
| `AN-24-03` | La identidad analítica usa pseudónimos por alcance y schemas versionados. | Permite medir funnels sin convertir analítica en tracking invasivo. |

## Decisiones todavía abiertas

No quedan decisiones abiertas bloqueantes. La elección de proveedor de analítica queda deliberadamente diferida; la implementación puede usar sink local/fake o proveedor posterior compatible con esta taxonomía.

## Archivos modificados

- `quality/24-product-analytics/product-analytics.md`: creado con principios, pseudonimización, eventos, propiedades, métricas PRD, funnels, buckets, instrumentación y versionado.
- `WORKPLAN.md`: fase 24 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta medición derivada del PRD y respeta la política de privacidad de fase 23.

## Validaciones realizadas

- Comprobación de que cada métrica inicial del PRD puede calcularse o queda cubierta.
- Comprobación de que los funnels E2E-01, E2E-02, E2E-03 y ruta IA TFM están definidos.
- Comprobación de prohibición explícita de nombres, emails, tokens, texto libre, disponibilidad nominal y votos nominales.
- Comprobación de taxonomía versionable mediante `schemaVersion`.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 24 del workplan

Define analítica de producto.
```

## Siguiente paso

Ejecutar después:

`quality/25-test-plan/25-PROMPT-plan-de-testing.md`

---

# Resumen de implementación del Workplan 25

## Trabajo realizado

Ejecuté únicamente el prompt `quality/25-test-plan/25-PROMPT-plan-de-testing.md`.

Leí ADR-014, trazabilidad, invariantes de dominio, máquinas de estado, OpenAPI, threat model y checklist de accesibilidad. Creé el plan de testing por niveles y una matriz de trazabilidad de suites contra capacidades, invariantes, transacciones, endpoints, amenazas, accesibilidad y E2E.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `TEST-25-01` | El plan usa Vitest, Testing Library, Testcontainers PostgreSQL y Playwright según ADR-014, sin porcentaje global arbitrario. | Mantiene gates razonables y alineados con riesgo. |
| `TEST-25-02` | CI ordinaria usa proveedores fake para email, LLM, analítica e IdP. | Evita dependencia de servicios externos y permite reproducibilidad. |
| `TEST-25-03` | Invariantes, transacciones, threat model y accesibilidad se trazan a suites concretas. | Permite verificar cobertura de riesgos críticos antes de implementación. |

## Decisiones todavía abiertas

No quedan decisiones abiertas bloqueantes. La selección concreta de librerías auxiliares de validación OpenAPI/axe puede cerrarse al implementar, respetando el plan.

## Archivos modificados

- `quality/25-test-plan/test-plan.md`: creado con niveles, E2E, escenarios de alto riesgo, fixtures, fake clock, accesibilidad, seguridad y quality gates CI.
- `quality/25-test-plan/test-traceability.md`: creado con matriz de capacidades, invariantes, transacciones, endpoints, amenazas, accesibilidad y dependencias externas.
- `WORKPLAN.md`: fase 25 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta ADR-014 y enlaza documentación existente de producto, seguridad, accesibilidad y API.

## Validaciones realizadas

- Comprobación de cobertura de E2E-01, E2E-02, E2E-03 y E2E-AI-01.
- Comprobación de mapeo de grupos `INV-*` críticos a suites de test.
- Comprobación de cobertura de amenazas `TM-01`…`TM-20`.
- Comprobación de estrategia sin proveedores externos en CI ordinaria.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 25 del workplan

Define plan de testing.
```

## Siguiente paso

Ejecutar después:

`ai/26-technical-design/26-PROMPT-diseno-tecnico-ia.md`

---

# Resumen de implementación del Workplan 26

## Trabajo realizado

Ejecuté únicamente el prompt `ai/26-technical-design/26-PROMPT-diseno-tecnico-ia.md`.

Leí la especificación funcional de IA, ADR-019, diseño de API, privacidad/retención y preguntas abiertas. Definí el contrato técnico `CoordinationIntent`, el puerto `CoordinationIntentInterpreter`, pipeline de validación/cálculo, fallos/fallbacks, observabilidad y prompt versionado.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `AI-TD-01` | `CoordinationIntent` queda versionado como `coordination-intent.v1`. | Permite validación reproducible, fake adapter y evaluación fase 27. |
| `AI-TD-02` | El LLM solo recibe texto, locale, fecha actual, zona horaria, capacidades y límites. | Cumple minimización: sin nombres, emails, tokens ni disponibilidad nominal. |
| `AI-TD-03` | El pipeline obligatorio es structured output → schema validation → domain validation → CandidateDateService. | Mantiene al LLM como intérprete y el dominio como calculador determinista. |
| `AI-TD-04` | El prompt especifica salida JSON estricta, ejemplos y rechazo de recurrencia, franjas, RAG/tools/agentes y mutaciones. | Evita ampliar el MVP o convertir IA en decisor. |

## Decisiones todavía abiertas

No quedan decisiones abiertas bloqueantes. La elección de proveedor/modelo queda diferida a evaluación de calidad, coste y latencia.

## Archivos modificados

- `ai/26-technical-design/ai-technical-design.md`: creado con decisiones, pipeline, contrato, puerto, contexto permitido, validación, fallos, observabilidad y testing.
- `ai/26-technical-design/coordination-intent.schema.json`: creado con JSON Schema `coordination-intent.v1`.
- `ai/26-technical-design/prompt-specification.md`: creado con prompt template, contexto, few-shot examples, prompt injection handling y versionado.
- `WORKPLAN.md`: fase 26 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron PRD, requisitos ni ADR. La fase concreta ADR-019 y la especificación funcional AI-F01 sin cambiar su alcance.

## Validaciones realizadas

- `jq empty` sobre `coordination-intent.schema.json`: JSON válido.
- Comprobación de que el LLM no recibe disponibilidad nominal ni PII.
- Comprobación de que el contrato puede probarse con fake adapter.
- Comprobación de que toda salida pasa por schema validation y domain validation antes de cálculo determinista.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 26 del workplan

Define diseño técnico de IA.
```

## Siguiente paso

Ejecutar después:

`ai/27-evaluation/27-PROMPT-evaluacion-ia.md`

---

# Resumen de implementación del Workplan 27

## Trabajo realizado

Ejecuté únicamente el prompt `ai/27-evaluation/27-PROMPT-evaluacion-ia.md`.

Leí la especificación funcional de IA, el diseño técnico de fase 26, el schema `coordination-intent.v1`, la especificación de prompt, el plan de testing y `sources-and-notes.md`. Definí el plan de evaluación reproducible del intérprete, un dataset inicial JSONL y una plantilla de informe para comparar versiones de prompt/modelo.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `AI-EVAL-01` | La evaluación mide `CoordinationIntent` estructurado, no disponibilidad real ni candidatas finales. | Mantiene separada la parte probabilística de IA del dominio determinista. |
| `AI-EVAL-02` | El dataset incluye contexto explícito por caso: `locale`, `teamTimeZone` y `currentDate`. | Hace reproducibles las fechas relativas y evita depender del día de ejecución. |
| `AI-EVAL-03` | CI ordinaria valida dataset, schema y golden tests con fake adapter; proveedor real queda en pipeline controlado. | Evita dependencia externa en CI y permite comparar coste, latencia y calidad cuando proceda. |
| `AI-EVAL-04` | La comparación usa schema validity, exact match normalizado, field accuracy, detección de clarificación/unsupported y safety pass rate. | Permite comparar versiones sin juicio manual exclusivo. |

## Decisiones todavía abiertas

No quedan decisiones abiertas bloqueantes. La elección concreta de proveedor/modelo y umbrales definitivos se cerrará con resultados reales de evaluación.

## Archivos modificados

- `ai/27-evaluation/ai-evaluation-plan.md`: creado con categorías, métricas, criterios, harness conceptual, CI vs proveedor real y evolución del dataset.
- `ai/27-evaluation/evaluation-dataset.jsonl`: creado con 18 casos iniciales versionados y reproducibles.
- `ai/27-evaluation/evaluation-report-template.md`: creado como plantilla de reporte de runs.
- `WORKPLAN.md`: fase 27 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron requisitos, PRD, ADR ni diseño técnico. La fase toma como contrato `CoordinationIntent` de fase 26 y lo convierte en base evaluable para futuras comparaciones.

## Validaciones realizadas

- Validación JSONL línea a línea con `jq`.
- Comprobación de cobertura de categorías obligatorias: fechas explícitas/relativas, weekdays, exclusiones, min/max, preferencias, hora, combinaciones, ambigüedad, unsupported y prompt injection.
- Comprobación de separación entre tests deterministas de CI y evaluación contra proveedor real.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 27 del workplan

Define evaluacion de IA.
```

## Siguiente paso

Ejecutar después:

`delivery/28-implementation-roadmap/28-PROMPT-roadmap-de-implementacion.md`

---

# Resumen de implementación del Workplan 28

## Trabajo realizado

Ejecuté únicamente el prompt `delivery/28-implementation-roadmap/28-PROMPT-roadmap-de-implementacion.md`.

Leí README, PRD, trazabilidad, arquitectura, diseño de dominio, API, modelo de datos, autorización, jobs, plan de testing, priorización MoSCoW y documentación IA. Creé el roadmap de implementación incremental y el catálogo de vertical slices para iniciar código sin big-bang técnico.

## Decisiones tomadas

| ID | Decisión | Justificación resumida |
|---|---|---|
| `ROADMAP-28-01` | La implementación empieza por `Minimum Viable Validation` y deja cuenta/IA para slices posteriores. | Prioriza valor E2E y respeta MoSCoW: el flujo manual rápido no debe depender de cuenta ni IA. |
| `ROADMAP-28-02` | Cada slice exige UI, API, dominio, DB, tests y demo terminada. | Evita construir backend o frontend aislados sin valor verificable. |
| `ROADMAP-28-03` | No se introduce sistema general de feature flags; solo interruptores ligeros para IA/cuenta/proveedor email. | Mantiene KISS y evita esconder invariantes incompletas tras flags. |
| `ROADMAP-28-04` | Las migraciones se ordenan por dependencia funcional: equipo/participante, sesiones, disponibilidad, decisiones, solicitudes, admin, cuenta, jobs. | Reduce riesgo y permite demostrar slices temprano. |

## Decisiones todavía abiertas

No quedan decisiones abiertas bloqueantes para empezar implementación. Quedan decisiones técnicas menores para cerrar al implementar: librerías concretas de validación, CSRF/rate limiting y proveedor/modelo IA real.

## Archivos modificados

- `delivery/28-implementation-roadmap/implementation-roadmap.md`: creado con prerequisitos, orden de slices, migraciones, feature flags ligeras, DoR/DoD, backlog técnico y gates por hito.
- `delivery/28-implementation-roadmap/vertical-slices.md`: creado con slices 0-11 y trazabilidad por RF/HU, endpoints, UI, dominio, DB, tests y demo.
- `WORKPLAN.md`: fase 28 marcada como completada.
- `WORKPLAN-IMPLEMENTATION-SUMMARY.md`: añadido este resumen.

## Impacto sobre otros documentos

No se modificaron requisitos, PRD, ADR ni diseño técnico. El roadmap referencia la documentación existente y la usa para ordenar implementación.

## Validaciones realizadas

- Comprobación de que el primer bloque implementable cubre el `Minimum Viable Validation`.
- Comprobación de que cada slice produce valor demostrable end-to-end.
- Comprobación de que no se adelantan cuenta, notificaciones ni IA antes del flujo manual core.
- Comprobación de que no se introducen capacidades fuera del MVP.
- Revisión de `git diff` y `git diff --check`.

## Git

Commit previsto:

```text
Completa fase 28 del workplan

Define roadmap de implementacion.
```

## Siguiente paso

El `WORKPLAN.md` queda completado. El siguiente trabajo recomendado es iniciar implementación con la `Slice 0 - Bootstrap/repo` descrita en `delivery/28-implementation-roadmap/vertical-slices.md`, previa revisión humana del roadmap.
