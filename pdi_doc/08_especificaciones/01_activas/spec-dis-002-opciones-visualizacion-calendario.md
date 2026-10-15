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
- Ofrecer «Superponer calendarios»: cada día muestra debajo del principal una solapa de igual ancho, altura uniforme, esquinas superiores rectas e inferiores redondeadas, incluso sin marcas. En «Equipo» muestra la marca propia o su ausencia; en «Mi disponibilidad», el estado del equipo o el neutro.
- Situar «Equipo», «Mi disponibilidad» y crear consulta de fechas juntos, inmediatamente a la izquierda del menú; usar gris en el plano inferior de días pasados y abreviar los textos de estado dentro de las casillas.
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

1. El calendario muestra a la derecha un botón de menú. Al abrirlo aparecen tres opciones independientes: «Ver semanas completas», «Superponer calendarios» y «Mostrar recuentos del equipo». Sin preferencias guardadas empiezan desactivadas. Los controles «Equipo», «Mi disponibilidad» y crear consulta de fechas quedan juntos, inmediatamente a su izquierda; desaparece el par de botones anterior para mes natural/semanas completas. En móvil pueden ocupar juntos la fila inferior de la cabecera.
2. «Ver semanas completas» conserva la navegación por meses y muestra los días vecinos de lunes a domingo conforme a [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md). Desactivarla vuelve al mes natural. Cambiar de mes, pulsar «Hoy» o alternar «Equipo»/«Mi disponibilidad» no desactiva las opciones elegidas.
3. «Superponer calendarios» dibuja una solapa inferior del mismo ancho que la casilla principal, de altura uniforme en todos los días y con esquinas superiores rectas e inferiores redondeadas, también si no hay marcas. Con «Equipo» delante, el plano inferior muestra la marca propia o ausencia de marca; con «Mi disponibilidad» delante, el resultado del equipo, incluso neutro. En días pasados el plano inferior, incluido el icono y texto de la marca propia, es gris, sin el color de su disponibilidad. El plano inferior comunica el estado con icono y color cuando corresponda y no crea una segunda acción: al pulsar el día se conserva el detalle o la selección de fecha de consulta. La selección rodea ambos planos con un contorno continuo; el foco de teclado usa un contorno discontinuo alrededor de ambos planos, con el mismo estilo que rodea la casilla cuando no hay superposición.
4. «Mostrar recuentos del equipo» enseña siempre Disponible, Quizá y No disponible en ese orden y repartidos a lo ancho, con su icono y cantidad, o «_» en lugar de la cifra si no hay votos de ese estado. Pone en negrita el resultado de [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md). El equipo se representa igual como plano principal y como solapa bajo «Mi disponibilidad». Un día sin marcas conserva el resultado neutro y muestra «_» en las tres posiciones, sin inventar votos; cambiar una marca o identidad actualiza la representación. Los estados de disponibilidad propios en las casillas usan «Disp.», «Quizá» y «No disp.» junto a su icono; la ausencia de marca propia no lleva texto.
5. Menú, opciones, casillas y solapas siguen siendo legibles y operables a 390, 768, 769 y 1280 CSS px, en tema claro y oscuro. El foco, nombres y estados son accesibles con teclado; el color no es la única señal. El panel del menú se cierra con Escape y devuelve el foco a su botón.
6. Cada cambio de las tres opciones se guarda en el almacenamiento local del navegador y se restaura al recargar la página o volver al calendario en el mismo navegador y dispositivo, también en móvil. Son preferencias independientes del equipo y no incluyen el selector «Equipo»/«Mi disponibilidad». Si el almacenamiento falta, está bloqueado o contiene datos inválidos, el calendario funciona con las tres opciones desactivadas por defecto; la interacción sigue funcionando durante la visita.
7. La API y la regla de cálculo no cambian. Los E2E de calendario, creación de consultas de fechas y accesibilidad siguen pasando; las capturas de regresión visual afectadas se actualizan y revisan deliberadamente.

## Impacto baseline

La presentación nueva ya está incorporada mediante `pdi:baseline-update` en [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md), [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md) y [Sistema de diseño inicial de Synqo](../../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md). [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md) conserva el control antiguo como referencia histórica; su HTML no representa todavía este Change. La regla de [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md) se conserva.

## Questions / Assumptions

- Aclarado por la persona impulsora: los botones «Equipo» y «Mi disponibilidad» permanecen fuera del menú; solo se sustituye el selector de mes natural/semanas completas.
- Sin preferencias válidas guardadas, las tres opciones empiezan apagadas para conservar la vista inicial actual. Se mantienen al recorrer meses o cambiar de alcance y se restauran en visitas posteriores desde el almacenamiento de ese navegador. No se sincronizan entre navegadores ni dispositivos.
- Los dos planos permanecen visibles con la superposición activa incluso sin marcas. El plano propio sin marca es neutro y sin texto; el del equipo muestra las tres posiciones con «_» si se activan los recuentos. Ajuste expreso posterior de la persona impulsora que sustituye la omisión previa de la solapa propia.
- Ninguna pregunta bloqueante pendiente. El acabado visual preciso se resolverá en la implementación y se comprobará con capturas revisadas en móvil y escritorio.

## Research necesario

- Comprobar qué datos y controles ofrece ya el visor WEB y cómo encajan las tres opciones sin duplicar cálculo del servidor.
- Revisar estados de día neutro, marca propia ausente, meses vecinos, selección y creación de consultas en ambos tamaños.

### Resultado de Research

`AvailabilityCalendar` ya mantiene `extended` y `mine`, consulta el intervalo visible y renderiza una casilla por día. `TeamApi.availability` entrega el agregado `state`, los tres `counts` y las marcas por participante; la marca propia se obtiene de esas marcas. La edición optimista vuelve a calcular los recuentos visibles mientras llega la respuesta y los restaura si falla. No hace falta otro endpoint ni una regla nueva en WEB.

La cuadrícula usa siete columnas y las casillas se estrechan en móvil. El desglose y la solapa necesitan ajustar la altura y distribución de la casilla sin recortar iconos o cifras. Al seleccionar fechas para una consulta se reutilizan esas mismas casillas; la nueva presentación debe conservar su marca de selección y el límite de fechas.

## Design / Structure

En `AvailabilityCalendar`, sustituir el grupo de extensión por un botón de menú y un panel con tres controles nativos de activación. Mantener `extended`, `mine` y dos nuevos estados locales para superposición y recuentos. El menú expresa abierto/cerrado, admite Escape y recupera el foco; los controles de alcance y creación de consulta permanecen juntos inmediatamente a su izquierda, con salto conjunto a otra fila en móvil si hace falta.

Leer y guardar juntos los tres booleanos del menú bajo una clave versionada de `localStorage`, siguiendo el patrón de `ThemeService`. Validar la estructura al leerla y volver a los tres valores desactivados si falta o es inválida. Atrapar errores de lectura o escritura para que el menú siga funcionando durante la visita. La preferencia es del navegador para toda la aplicación, no de un equipo; `mine` no se guarda.

Renderizar el plano del equipo desde una única presentación de `state` y `counts`, reutilizada como contenido principal o solapa. La marca propia se toma de `marks`. La casilla continúa siendo un solo botón, con una superficie principal redondeada y una solapa inferior de igual ancho, altura fija, esquinas superiores rectas e inferiores redondeadas; su nombre accesible describe ambos planos y los recuentos cuando correspondan. Conservar la selección, el tratamiento gris de ambos planos de días pasados y el foco del detalle.

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

### Evidencia de aplicación local (2026-10-14 y 2026-10-15)

- Implementados menú, persistencia local, solapas y recuentos en `AvailabilityCalendar`; los E2E cubren valores predeterminados, restauración, almacenamiento inválido o bloqueado y los tamaños 390, 768, 769 y 1280 CSS px.
- Tras los ajustes visuales posteriores, los E2E comprueban la posición conjunta de los controles, los dos planos también sin marcas, el gris del plano inferior en días pasados, el mismo ancho de la solapa, su altura uniforme, las esquinas superiores rectas e inferiores redondeadas y que pulsar la casilla inferior activa el mismo día. Las 108 referencias visuales se han comparado después de regenerar deliberadamente las vistas afectadas; pasan las 108.
- El desglose posterior muestra los tres estados siempre en el orden Disponible, Quizá y No disponible, con «_» para cada estado sin votos, también en un día neutro y en la solapa. Los E2E comprueban el orden, los valores, el nombre accesible con ceros reales y que el contenido no rebasa la casilla ni la solapa en los cuatro anchos de referencia.
- El ajuste final reparte los tres contadores por todo el ancho de la casilla principal y de la solapa. Un E2E con marca propia en un día pasado comprueba que la solapa y su icono/texto son grises en tema claro y oscuro. Pasan los 6 E2E específicos y las 108 comparaciones visuales tras actualizar las 8 capturas afectadas.
- La selección y el foco rodean ambos planos cuando se superponen. Los 6 E2E específicos verifican la geometría del contorno y el foco discontinuo en 390, 768, 769 y 1280 CSS px.
- El foco sin superposición usa el mismo trazo discontinuo y separación que con superposición; su contorno termina en la casilla principal. Los 6 E2E específicos comprueban ambos perímetros y el mismo estilo de foco en los cuatro anchos de referencia. El 2026-10-15 se regeneraron las referencias afectadas y pasaron las 108 comparaciones visuales en móvil y escritorio, temas claro y oscuro.
- Con Node 22.22.2 pasan build, lint, formato y 17 pruebas unitarias WEB. Playwright 1.63.0 con Chromium emulado: 6 E2E específicos del cambio, 16 pruebas del smoke parcial de accesibilidad y 108 comparaciones visuales pasan. El smoke cubre teclado, foco, reflujo y ampliación de texto al 200 %; no acredita conformidad WCAG completa.
- El intento de ejecutar juntos los E2E existentes de disponibilidad, consultas de fechas y accesibilidad obtuvo 8 pruebas correctas antes de recibir HTTP 429 al crear otro equipo en la API local. El límite de creación impidió terminar esa ejecución; la verificación integral con API real queda pendiente en un entorno con cupo disponible.

## Convergence

Pendiente.

## Resultado de cierre

Pendiente.

## Definition of Ready

**READY_FOR_CHANGE_APPLY.** El comportamiento está decidido y recogido en el baseline, la aclaración sobre los controles existentes y la persistencia local están resueltas, los datos necesarios ya llegan desde API y el plan identifica implementación y evidencia de validación.
