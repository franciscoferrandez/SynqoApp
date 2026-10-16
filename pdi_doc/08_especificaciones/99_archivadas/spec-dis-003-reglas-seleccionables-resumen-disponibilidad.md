---
id: SPEC-DIS-003
nivel: N2
estado: cerrado
release: REL-003
---

# SPEC-DIS-003 — Reglas seleccionables para el resumen de disponibilidad

## Objetivo

Permitir que cada persona elija en el menú del calendario cómo se resume la disponibilidad diaria del equipo, conservando «Peor disponibilidad» como regla inicial.

## Clasificación

Change de evolución N2: modifica una regla de negocio y su presentación en el calendario, con posible impacto en el contrato entre API y WEB.

## Scope

- Ofrecer en el menú del calendario «Peor disponibilidad», «Mediana de las marcas» y «Estado más frecuente» como tres reglas alternativas para el resumen del equipo.
- Usar «Peor disponibilidad» por defecto cuando no haya elección previa válida.
- Aplicar la regla elegida de forma coherente al estado del equipo en la casilla, la solapa superpuesta y el desglose que destaca el estado resultante.
- Mantener visibles los recuentos reales de las tres marcas y el resultado neutro cuando nadie haya marcado un día.
- Recordar la elección en el navegador del dispositivo para los equipos que se abran allí.
- Verificar las combinaciones de marcas y la visualización en móvil y escritorio, temas claro y oscuro.

## Fuera de scope

- Añadir quórum, porcentajes configurables, pesos por participante o nuevas marcas individuales.
- Cambiar los votos o resultados de las consultas de fechas.
- Convertir la regla elegida en una decisión irreversible para todo el equipo.

## Baseline relacionado

- [REL-003 — Estabilización de Synqo](../../01_producto/10_entregas/rel-003-estabilizacion-synqo.md)
- [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md)
- [SPEC-DIS-002 — Opciones de visualización del calendario](spec-dis-002-opciones-visualizacion-calendario.md)
- [API — contrato de módulo](../../06_arquitectura/03_modulos/API/README.md)
- [WEB — contrato de módulo](../../06_arquitectura/03_modulos/WEB/README.md)
- [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md)
- [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md)
- [SPEC-COO-007 — Detectar regresiones visuales en WEB](spec-coo-007-regresion-visual-web.md)

## Módulos afectados

- API y WEB.

## Criterios de aceptación

1. El menú permite escoger una sola de las tres reglas de [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md), con nombre y estado accesibles. Sin preferencia válida, aparece activa «Peor disponibilidad» y el resultado no cambia respecto al actual.
2. La mediana y el estado más frecuente producen los resultados y desempates de [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md), también con un número par de marcas, empate entre tres estados y ninguna marca. Las marcas ausentes no participan.
3. Al cambiar de regla, se actualizan sin recargar el calendario las casillas del equipo, la solapa bajo «Mi disponibilidad», el estado destacado en los recuentos y los nombres accesibles. No cambian la marca propia, las cantidades, las listas de participantes ni los votos de las consultas.
4. La regla elegida se recuerda al recargar, volver al calendario y abrir otro equipo desde el mismo navegador y dispositivo. No se comparte con otros navegadores ni con otros participantes. Si el almacenamiento está bloqueado o contiene un valor inválido, se usa «Peor disponibilidad» y el menú sigue funcionando durante la visita. Las tres preferencias de visualización existentes se conservan al actualizar el formato de almacenamiento.
5. Al editar una marca, la vista provisional conserva la respuesta inmediata actual y el resultado confirmado por API sustituye todos los datos provisionales; si la escritura falla, se recupera el día anterior. Elegir una regla de visualización no envía ninguna mutación de marcas.
6. El contrato API conserva el campo `state` con la peor disponibilidad para clientes anteriores y entrega además los tres resultados calculados por API tanto al leer días como al confirmar una escritura. La regla elegida no se guarda en el servidor ni requiere migración de base de datos.
7. La interacción se verifica con teclado, tema claro y oscuro y tamaños móvil y escritorio; las capturas afectadas se actualizan y comparan deliberadamente según [SPEC-COO-007 — Detectar regresiones visuales en WEB](spec-coo-007-regresion-visual-web.md).

## Impacto baseline esperado

La nueva verdad se ha incorporado mediante `pdi:baseline-update` en [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md), [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md) y [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md). La peor marca sigue siendo la regla predeterminada. El alcance histórico de [SPEC-DIS-002 — Opciones de visualización del calendario](spec-dis-002-opciones-visualizacion-calendario.md) no se modifica retroactivamente.

## Questions / Assumptions

- Resuelto por la persona impulsora: en la mediana par, los extremos disponible/no disponible dan quizá; si una central es quizá, se elige la más favorable de las dos.
- Resuelto por la persona impulsora: en el estado más frecuente, los empates se resuelven a favor del estado más favorable.
- Resuelto por la persona impulsora: la elección se recuerda en el dispositivo. Se aplica a todos los equipos abiertos en ese navegador, siguiendo las demás preferencias del mismo menú; no se guarda para el equipo ni se sincroniza con otros dispositivos.
- Resuelto técnicamente: API entrega los tres resultados autoritativos por día; WEB selecciona el que debe presentar. Durante una escritura WEB conserva una previsión temporal, que API confirma o reemplaza.

No quedan preguntas bloqueantes para READY.

## Research

`DailyAvailability::day` calcula en API el peor estado y devuelve `state`, `counts` y `marks`. Lectura de intervalo y respuesta de escritura reutilizan este cálculo. WEB ya guarda tres preferencias booleanas bajo `synqo:calendar-view:v1`, presenta `state` en casilla y solapa y predice temporalmente el peor estado al marcar. La respuesta API sustituye la predicción o se revierte el día si falla. Esta predicción existente matiza la instrucción histórica de que el resumen vive en API: el servidor sigue siendo la autoridad y la copia de WEB dura solo hasta la confirmación.

No se requieren nuevas marcas, columnas ni consultas de base de datos. El contrato actual devuelve los recuentos necesarios para calcular las tres reglas en API. Una respuesta con las tres variantes permite cambiar la selección del menú sin pedir de nuevo el intervalo.

## Design / Structure

- Ampliar el cálculo de día en el dominio API para obtener las tres variantes a partir de los recuentos. Añadir a cada día `summaryStates: { worst, median, mostFrequent }`, con las tres claves requeridas y valores de estado o `null`, tanto en GET como en PUT. Mantener `state` como la peor disponibilidad para compatibilidad y documentar el campo nuevo en OpenAPI. Un día sin marcas devuelve los tres valores `null`.
- WEB guarda la regla elegida junto a las tres preferencias actuales bajo `synqo:calendar-view:v2`. Al leer, migrar las tres preferencias booleanas válidas de `v1` y asignar `worst` por defecto; ignorar una regla desconocida y proteger los accesos al almacenamiento. La regla seleccionada es común a los equipos del navegador.
- Usar el resultado API elegido en la casilla, solapa, resaltado de recuentos y nombres accesibles; dejar sin cambios el detalle de marcas por participante. En la vista provisional durante el guardado, predecir las tres variantes desde los recuentos locales como ya ocurre con la peor regla; reemplazarlas por la respuesta API o revertir el día completo. Comprobar con tests que esa predicción coincide con API para las combinaciones relevantes.
- Presentar la regla como grupo de selección única dentro del menú existente, debajo de las tres casillas de visualización. Mantener el menú operable con teclado y su comportamiento de cierre.

## Plan por slices

1. **API y contrato:** calcular las tres variantes sin cambiar las marcas persistidas; devolver los resultados junto a `state`, `counts` y `marks`; cubrir con tests desempates, neutro y compatibilidad del campo anterior.
2. **WEB y preferencia:** añadir el grupo de selección única, migración de preferencias y presentación uniforme del resultado elegido en todos los planos; conservar la vista provisional y el rollback.
3. **Verificación visual y accesible:** probar interacción, persistencia, actualización de marcas y nombres accesibles; actualizar y revisar las capturas afectadas; ejecutar checks API y WEB.

## Evidencia / Validation

- PHPUnit para la tabla de [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md), empates adicionales, neutro y contrato de lectura/escritura; análisis estático y formato de API.
- Pruebas WEB de preferencias válidas, inválidas y bloqueadas, migración `v1`, selección entre equipos, previsión durante guardado y rollback.
- E2E con tamaños 390, 768, 769 y 1280 CSS px: menú por teclado, cambio de regla, superposición, recuentos y cambio de marca; comparación de capturas en claro y oscuro.

Implementación local (2026-10-16): `composer test` con la cuota de creación ampliada solo en el proceso de tests: 133 pruebas, 1094 aserciones; `composer stan`, `composer cs:check` y `composer rector:check` correctos. WEB: 26 pruebas unitarias, nueve E2E del menú, preferencias y guardado provisional, `lint`, formato y build correctos. Las 112 capturas visuales se regeneraron y pasaron la comparación posterior; cuatro referencias del menú cambiaron y se añadieron cuatro de la mediana superpuesta. No se detectó discrepancia con el alcance ni se modificaron las reglas normativas durante la aplicación.

**Verificación final — `READY_FOR_CHANGE_CONVERGE` (2026-10-16).** Se repitieron las 133 pruebas de API (1094 aserciones), 26 unitarias de WEB, los nueve E2E del menú, los checks estáticos y de build. Las ocho capturas afectadas volvieron a coincidir con sus referencias; la comparación completa de 112 capturas había pasado tras la implementación, sin cambios de producto posteriores. El smoke parcial de accesibilidad pasó en 390, 768, 769 y 1280 px tras corregir su comprobación del foco: el contorno del calendario se dibuja en `::after`, no en el botón. No se afirma conformidad WCAG completa.

| Criterio de aceptación | Evidencia | Resultado |
|---|---|---|
| 1. Una regla accesible y peor por defecto | Radios con nombre y estado; E2E comprueba la selección única y el valor inicial en cuatro tamaños, incluidos datos locales inválidos. | PASS |
| 2. Cálculos, desempates y neutro | `DailyAvailabilityTest` prueba ocho combinaciones; `availability-summary.spec.ts` contrasta la previsión WEB en siete de ellas. GET/PUT comprueban valores vacíos y mixtos. | PASS |
| 3. Actualización uniforme sin mutar marcas | E2E comprueba casilla, recuento destacado, nombre accesible, solapa, marca propia y cambio instantáneo sin recargar. | PASS |
| 4. Persistencia y migración en dispositivo | E2E cubre recarga, otro equipo, `v1` a `v2`, valor inválido y almacenamiento bloqueado; las tres opciones previas se conservan. | PASS |
| 5. Previsión, confirmación y recuperación | E2E retiene la respuesta PUT para observar el resultado provisional, confirma el día y fuerza un error para comprobar la restauración completa. | PASS |
| 6. Contrato compatible y sin migración | `AvailabilityApiTest` comprueba `state` histórico y `summaryStates` en GET/PUT; OpenAPI exige las tres claves. No se alteró el esquema ni se guarda la regla en API. | PASS |
| 7. Teclado, tamaños, temas y capturas | E2E en cuatro anchos, smoke parcial de foco/reflow, 112 capturas comparadas y ocho capturas afectadas repetidas en móvil/escritorio y claro/oscuro. La persona impulsora probó y aceptó el resultado en pantalla. | PASS |

## Definition of Ready

- Alcance y exclusiones concretos; los tres cálculos y sus desempates están definidos en [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md).
- Selección, valor por defecto, persistencia y representación establecidos en [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md) y [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md).
- API y WEB tienen responsabilidades y contrato definidos; no se requiere nueva persistencia ni una decisión de arquitectura global. Las pruebas y el plan por slices cubren los casos límite. Sin preguntas bloqueantes.

## Convergence

**Convergencia PASS — `READY_FOR_CHANGE_CLOSE` (2026-10-16).** La implementación, la SPEC, el contrato API/WEB y [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md), [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md) y [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md) coinciden. Se resolvió una expectativa obsoleta del smoke de accesibilidad sobre la ubicación del contorno de foco; era un falso fallo del test, sin cambio de comportamiento. No hay drift significativo, cambios normativos nuevos ni hallazgos graves pendientes. [SPEC-DIS-002 — Opciones de visualización del calendario](spec-dis-002-opciones-visualizacion-calendario.md) siguió su propio proceso de cierre.

## Resultado de cierre

**Change cerrado localmente el 2026-10-16 — `DONE`.** Los siete criterios están en PASS, la convergencia no deja drift significativo y la persona impulsora confirmó el comportamiento. La entrega queda `VALIDADO` en [REL-003 — Estabilización de Synqo](../../01_producto/10_entregas/rel-003-estabilizacion-synqo.md). El commit específico es `d8278f1`; no se declara `ENTREGADO` porque faltan publicación y comprobación en el entorno de destino. No existe PR de este Change.
