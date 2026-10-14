---
id: SPEC-DIS-002
nivel: N2
estado: ready
release: REL-003
---

# SPEC-DIS-002 — Opciones de visualización del calendario

## Objetivo

Permitir comparar con claridad la disponibilidad del equipo y la propia desde el calendario, mediante opciones de visualización agrupadas en un menú dentro del panel.

## Clasificación

Change de evolución N2 del área de disponibilidad. Modifica la presentación y la interacción del visor en WEB, en móvil y escritorio, sin cambiar cómo se calculan ni guardan las marcas.

## Scope

- Añadir un menú de opciones de visualización en la esquina superior derecha del calendario.
- Trasladar al menú la opción «Ver semanas completas», sustituyendo los dos botones actuales de mes natural y semanas completas. Mantener fuera del menú los botones «Equipo» y «Mi disponibilidad», según la aclaración expresa de la persona impulsora.
- Ofrecer «Superponer calendarios»: cada día muestra una solapa del calendario opuesto bajo el principal. En «Equipo», la solapa muestra la marca propia cuando existe; en «Mi disponibilidad», muestra el estado del equipo.
- Ofrecer un modo de desglose del equipo que muestre recuentos por estado en cada día y destaque en negrita el estado resultante. Al superponer desde «Mi disponibilidad», la solapa del equipo usa el mismo modo de desglose.
- Recordar en el navegador las tres opciones del menú para restaurarlas al volver al calendario, también en móvil.
- Cubrir tema claro y oscuro, tamaños móvil y escritorio, y uso con teclado y tecnologías de asistencia.

## Fuera de scope

- Cambiar la regla de cálculo del estado agregado o añadir nuevas reglas de disponibilidad.
- Cambiar el contrato API, la persistencia de las marcas o la edición desde el detalle del día.
- Modificar la creación de consultas de fechas.
- Sincronizar estas preferencias entre dispositivos o guardarlas en la cuenta o en el equipo.

## Baseline relacionado

- [REL-003 — Estabilización de Synqo](../../01_producto/10_entregas/rel-003-estabilizacion-synqo.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md)
- [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md)
- [Sistema de diseño inicial de Synqo](../../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md)
- [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md)
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md)
- [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md)
- [WEB — contrato de módulo](../../06_arquitectura/03_modulos/WEB/README.md)
- [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md)
- [SPEC-COO-007 — Detectar regresiones visuales en WEB](../99_archivadas/spec-coo-007-regresion-visual-web.md)

## Módulos afectados

- WEB.

## Criterios de aceptación

1. El calendario muestra arriba a la derecha un botón de menú. Al abrirlo aparecen tres opciones independientes: «Ver semanas completas», «Superponer calendarios» y «Mostrar recuentos del equipo». Sin preferencias guardadas empiezan desactivadas. Los controles «Equipo» y «Mi disponibilidad» siguen visibles fuera del menú; desaparece el par de botones anterior para mes natural/semanas completas.
2. «Ver semanas completas» conserva la navegación por meses y muestra los días vecinos de lunes a domingo conforme a [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md). Desactivarla vuelve al mes natural. Cambiar de mes, pulsar «Hoy» o alternar «Equipo»/«Mi disponibilidad» no desactiva las opciones elegidas.
3. «Superponer calendarios» dibuja en cada día una solapa bajo el plano principal. Con «Equipo» delante, muestra la marca propia solo si existe; con «Mi disponibilidad» delante, muestra el resultado del equipo, incluso neutro si nadie marcó. La solapa comunica el estado con icono y color y no crea una segunda acción: al pulsar el día se conserva el detalle o la selección de fecha de consulta.
4. «Mostrar recuentos del equipo» enseña las cantidades de los estados indicados y pone en negrita el resultado de [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md). El equipo se representa igual como plano principal y como solapa bajo «Mi disponibilidad». Un día sin marcas muestra «Sin marcas» sin contar marcas inexistentes; cambiar una marca o identidad actualiza la representación.
5. Menú, opciones, casillas y solapas siguen siendo legibles y operables a 390, 768, 769 y 1280 CSS px, en tema claro y oscuro. El foco, nombres y estados son accesibles con teclado; el color no es la única señal. El panel del menú se cierra con Escape y devuelve el foco a su botón.
6. Cada cambio de las tres opciones se guarda en el almacenamiento local del navegador y se restaura al recargar la página o volver al calendario en el mismo navegador y dispositivo, también en móvil. Son preferencias independientes del equipo y no incluyen el selector «Equipo»/«Mi disponibilidad». Si el almacenamiento falta, está bloqueado o contiene datos inválidos, el calendario funciona con las tres opciones desactivadas por defecto; la interacción sigue funcionando durante la visita.
7. La API y la regla de cálculo no cambian. Los E2E de calendario, creación de consultas de fechas y accesibilidad siguen pasando; las capturas de regresión visual afectadas se actualizan y revisan deliberadamente.

## Impacto baseline

La presentación nueva ya está incorporada mediante `pdi:baseline-update` en [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md), [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md) y [Sistema de diseño inicial de Synqo](../../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md). [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md) conserva el control antiguo como referencia histórica; su HTML no representa todavía este Change. La regla de [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md) se conserva.

## Questions / Assumptions

- Aclarado por la persona impulsora: los botones «Equipo» y «Mi disponibilidad» permanecen fuera del menú; solo se sustituye el selector de mes natural/semanas completas.
- Sin preferencias válidas guardadas, las tres opciones empiezan apagadas para conservar la vista inicial actual. Se mantienen al recorrer meses o cambiar de alcance y se restauran en visitas posteriores desde el almacenamiento de ese navegador. No se sincronizan entre navegadores ni dispositivos.
- Bajo «Mi disponibilidad» se muestra la solapa neutra del equipo cuando no hay marcas. Bajo «Equipo» se omite la solapa propia si la identidad activa no marcó el día.
- Ninguna pregunta bloqueante pendiente. El acabado visual preciso se resolverá en la implementación y se comprobará con capturas revisadas en móvil y escritorio.

## Research necesario

- Comprobar qué datos y controles ofrece ya el visor WEB y cómo encajan las tres opciones sin duplicar cálculo del servidor.
- Revisar estados de día neutro, marca propia ausente, meses vecinos, selección y creación de consultas en ambos tamaños.

### Resultado de Research

`AvailabilityCalendar` ya mantiene `extended` y `mine`, consulta el intervalo visible y renderiza una casilla por día. `TeamApi.availability` entrega el agregado `state`, los tres `counts` y las marcas por participante; la marca propia se obtiene de esas marcas. La edición optimista vuelve a calcular los recuentos visibles mientras llega la respuesta y los restaura si falla. No hace falta otro endpoint ni una regla nueva en WEB.

La cuadrícula usa siete columnas y las casillas se estrechan en móvil. El desglose y la solapa necesitan ajustar la altura y distribución de la casilla sin recortar iconos o cifras. Al seleccionar fechas para una consulta se reutilizan esas mismas casillas; la nueva presentación debe conservar su marca de selección y el límite de fechas.

## Design / Structure

En `AvailabilityCalendar`, sustituir el grupo de extensión por un botón de menú y un panel con tres controles nativos de activación. Mantener `extended`, `mine` y dos nuevos estados locales para superposición y recuentos. El menú expresa abierto/cerrado, admite Escape y recupera el foco; los controles de alcance y creación de consulta permanecen en el encabezado.

Leer y guardar juntos los tres booleanos del menú bajo una clave versionada de `localStorage`, siguiendo el patrón de `ThemeService`. Validar la estructura al leerla y volver a los tres valores desactivados si falta o es inválida. Atrapar errores de lectura o escritura para que el menú siga funcionando durante la visita. La preferencia es del navegador para toda la aplicación, no de un equipo; `mine` no se guarda.

Renderizar el plano del equipo desde una única presentación de `state` y `counts`, reutilizada como contenido principal o solapa. La marca propia se toma de `marks`. La casilla continúa siendo un solo botón, con la solapa como contenido visual interno, y su nombre accesible describe ambos planos y los recuentos cuando correspondan. Conservar la selección, el tratamiento de días pasados y el foco del detalle.

Usar los tokens semánticos existentes para color y estados. Permitir que la altura de la casilla crezca cuando se activen recuentos o solapa, especialmente en siete columnas móviles. El acabado de menú y solapa se revisará con las capturas ya versionadas; no se añade biblioteca de interfaz.

## Plan por slices

1. **Menú, extensión y preferencias:** añadir el botón, las tres opciones y la interacción accesible; mover «Ver semanas completas» al menú sin alterar la navegación de meses ni el selector «Equipo»/«Mi disponibilidad». Guardar y restaurar las tres opciones en el navegador con respaldo seguro.
2. **Planos y recuentos:** presentar estado propio y agregado en la misma casilla con solapa opcional; reutilizar el desglose del equipo en ambos planos y adaptar la cuadrícula para móvil, ambos temas y día neutro.
3. **Verificación:** ampliar pruebas de componente y E2E de calendario, disponibilidad, consulta de fechas y accesibilidad; generar y revisar las capturas visuales afectadas, ejecutar checks WEB y registrar evidencia de cada criterio.

## Evidencia / Validation

- Pruebas de componente para combinaciones de las tres opciones, restauración tras nueva instancia, datos guardados inválidos o almacenamiento bloqueado, agregado mixto, día neutro, marca propia ausente, cambio de identidad y actualización/rollback de una marca.
- E2E en 390, 768, 769 y 1280 CSS px para abrir/cerrar menú por teclado, alternar opciones, recargar y volver al calendario con las preferencias restauradas, recorrer meses, pulsar «Hoy», abrir detalle y seleccionar fechas de consulta; verificar nombres y estados accesibles.
- Comparación visual en móvil/escritorio y tema claro/oscuro con la suite de [SPEC-COO-007 — Detectar regresiones visuales en WEB](../99_archivadas/spec-coo-007-regresion-visual-web.md); actualizar solo las referencias cuyo cambio sea esperado y revisar cada diff.
- Ejecutar lint, formato, build y tests WEB. Registrar herramienta/versión, alcance y resultado de la comprobación automatizada de accesibilidad exigida por [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md).

## Convergence

Pendiente.

## Resultado de cierre

Pendiente.

## Definition of Ready

**READY_FOR_CHANGE_APPLY.** El comportamiento está decidido y recogido en el baseline, la aclaración sobre los controles existentes y la persistencia local están resueltas, los datos necesarios ya llegan desde API y el plan identifica implementación y evidencia de validación.
