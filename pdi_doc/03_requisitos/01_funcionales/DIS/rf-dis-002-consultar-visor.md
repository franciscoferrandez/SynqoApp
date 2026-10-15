---
id: RF-DIS-002
estado: en_revision
---

# RF-DIS-002 — Consultar el visor de disponibilidad

## Requisito

El sistema debe ofrecer a los usuarios con acceso a un equipo un calendario de disponibilidad por día que ayude a identificar posibles fechas para una consulta. El mismo calendario permite alternar entre el resumen del equipo y las marcas de la identidad activa.

## Origen

- [HU-DIS-002 — Consultar disponibilidad del equipo](../../../01_producto/07_historias-usuario/hu-dis-002-consultar-visor.md)
- Decisión expresa de quien impulsa Synqo: el detalle diario muestra los participantes agrupados por estado.
- Decisión anterior de quien impulsa Synqo: los recuentos se consultan al abrir el detalle del día, también en pantallas amplias. La opción posterior de mostrarlos además en las casillas se describe abajo.
- Decisión expresa de quien impulsa Synqo: la vista predeterminada muestra solo los días del mes natural; la vista alternativa mantiene el mismo mes pero completa su primera y última semana con los días de los meses vecinos, de lunes a domingo.
- Decisión expresa de quien impulsa Synqo: hay un control para volver a «Hoy».
- Decisión expresa de quien impulsa Synqo: «Mi disponibilidad» comparte calendario y detalle con la vista del equipo; solo cambia el estado mostrado en las casillas.
- Decisión expresa de quien impulsa Synqo para [REL-003 — Estabilización de Synqo](../../../01_producto/10_entregas/rel-003-estabilizacion-synqo.md): agrupar opciones de visualización en un menú, superponer el calendario opuesto y mostrar opcionalmente en las casillas los recuentos del equipo.
- Decisión expresa de quien impulsa Synqo: recordar las opciones de ese menú en el navegador del dispositivo, también en móvil.
- Ajuste expreso de quien impulsa Synqo: agrupar los controles de alcance y creación de consulta de fechas inmediatamente a la izquierda del menú; mostrar los dos planos también en días sin marcas, con una solapa inferior del mismo ancho, altura uniforme, esquinas superiores rectas e inferiores redondeadas; y aplicar gris al plano inferior de días pasados.

## Precondiciones

El usuario tiene acceso al equipo.

## Criterios de aceptación

- El calendario refleja la disponibilidad registrada para el equipo, separada de los votos de las consultas.
- Se puede alternar entre «Equipo», que representa el estado agregado, y «Mi disponibilidad», que representa la marca de la identidad activa o la ausencia de marca. El detalle de cualquier día sigue mostrando los recuentos y participantes de todo el equipo en ambos modos.
- Cada día permite conocer el estado agregado y los recuentos de las marcas disponibles, quizá y no disponibles conforme a [RN-DIS-002 — Resumen diario de disponibilidad](../../02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md).
- En cualquier tamaño de pantalla, la casilla del día muestra el estado correspondiente al modo activo («Equipo» o «Mi disponibilidad»); al activarla se muestran los tres recuentos y qué participantes marcaron cada estado.
- Un menú en la esquina superior derecha del panel reúne tres opciones independientes: «Ver semanas completas», «Superponer calendarios» y «Mostrar recuentos del equipo». Sustituye solo los dos botones de mes natural/semanas completas; los botones «Equipo» y «Mi disponibilidad» siguen visibles junto al de crear consulta de fechas, inmediatamente a la izquierda del menú. Sin preferencias guardadas, las tres opciones empiezan desactivadas.
- Al activar «Superponer calendarios», el calendario opuesto asoma por debajo de la casilla principal en una solapa de su mismo ancho y altura uniforme, con esquinas superiores rectas e inferiores redondeadas. En «Equipo», el plano inferior muestra la marca propia o su ausencia; en «Mi disponibilidad», muestra el estado agregado del equipo, incluido el neutro cuando nadie marcó. También aparecen los dos planos en días sin marcas. En fechas pasadas el plano inferior es gris, sin color de disponibilidad. Cada día sigue siendo una única acción que abre el mismo detalle o selecciona la fecha durante la creación de una consulta.
- Dentro de las casillas del calendario, los estados con marca usan los textos breves «Disp.», «Quizá» y «No disp.» junto a su icono; la ausencia de marca no añade texto. El detalle del día conserva los nombres completos de los estados.
- «Mostrar recuentos del equipo» cambia la representación del equipo en las casillas: muestra siempre Disponible, Quizá y No disponible, en ese orden y repartidos a lo ancho, con el número de marcas o «_» si un estado no tiene votos. Destaca en negrita el estado que determina el resultado conforme a [RN-DIS-002 — Resumen diario de disponibilidad](../../02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md). Si no hay marcas, muestra las tres posiciones con «_» y conserva el estado neutro. Esta representación es idéntica cuando el equipo ocupa la casilla principal y cuando aparece como solapa bajo «Mi disponibilidad».
- Las opciones afectan solo a la presentación, se mantienen al cambiar de mes o alternar «Equipo»/«Mi disponibilidad» y se recuerdan al recargar o volver al calendario en el mismo navegador y dispositivo. No se sincronizan entre dispositivos ni se guardan por equipo; el selector «Equipo»/«Mi disponibilidad» no forma parte de estas preferencias. Si no hay almacenamiento local disponible o su contenido es inválido, el calendario usa los valores predeterminados y sigue siendo utilizable durante la visita. Las opciones no modifican las marcas ni la regla de cálculo. El estado se puede reconocer sin depender solo del color.
- Al entrar sin una preferencia guardada para semanas completas, el calendario muestra el mes natural en curso. Sus controles anterior y siguiente recorren meses naturales en esa vista.
- El usuario puede activar una vista del mes con semanas completas: comienza el lunes de la semana que contiene el día 1 y termina el domingo de la semana que contiene el último día del mes. Los días añadidos de meses vecinos conservan su fecha real y pueden consultarse y marcarse según las mismas reglas temporales. Anterior y siguiente siguen recorriendo meses.
- El control «Hoy» aparece cuando el día actual no está entre las fechas visibles y vuelve a él sin cambiar las opciones de visualización ni el alcance «Equipo»/«Mi disponibilidad», usando la zona horaria del dispositivo o, si no se obtiene, la del equipo.
- El visor permite reconocer fechas que podrían proponerse en una consulta.

## Casos límite

Si no hay marcas para un día, el calendario muestra un estado agregado neutro; al consultar su detalle, los recuentos son cero y las listas de participantes por estado están vacías. Las marcas «sin marcar» se ignoran. El visor no crea consultas automáticamente.

## Relaciones

- [RD-DIS-001 — Disponibilidad vigente por día](../../03_datos/DIS/rd-dis-001-disponibilidad.md)
- [RN-DIS-002 — Resumen diario de disponibilidad](../../02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md)
