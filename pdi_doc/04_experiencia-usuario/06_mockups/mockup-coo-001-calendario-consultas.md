---
id: MOCKUP-COO-001
estado: en_revision
---

# MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro

## Propósito

Contrastar la dirección visual de Synqo con los recorridos centrales de un equipo rápido antes de fijar la paleta y los componentes. Es un artefacto UX transversal a disponibilidad y consultas; los comportamientos normativos permanecen en sus requisitos y wireframes.

## Vista

[**Abrir mockup navegable**](prototipo-ux-inicial.html). Es un archivo HTML autónomo con datos de ejemplo. Permite alternar tema claro y oscuro y ver la sección Calendario, la lista de Consultas y el detalle de una consulta abierta. El selector Automático/Claro/Oscuro representa la preferencia definida para el producto.

## Flujo y estado

- Calendario inicial de equipo vigente bajo identidad elegida: [WF-DIS-001 — Calendario inicial del equipo](../03_wireframes/wf-dis-001-calendario-equipo.md).
- Lista de abiertas, resueltas y rechazadas: [WF-CON-001 — Lista de consultas del equipo](../03_wireframes/wf-con-001-lista-consultas.md).
- Detalle de consulta abierta con selección múltiple, recuentos y votantes: [WF-CON-002 — Detalle de una consulta abierta](../03_wireframes/wf-con-002-detalle-consulta.md).
- Cabecera y dos secciones visibles conforme a la [estructura inicial del equipo](../01_arquitectura-informacion/estructura-equipo.md).

## Componentes y aspecto

**PROPUESTA visual:** superficies claras o azul marino profundo, identidad en índigo/azul con acentos cian y menta, bordes suaves y tarjetas de poco relieve. El selector ofrece «Automático», «Claro» y «Oscuro» y recuerda la opción en el navegador; «Automático» sigue al dispositivo y usa claro como respaldo. En ambos temas el estado diario combina texto y símbolo con color. El detalle se abre al elegir un día y combina consulta y edición en tres tarjetas de recuento; cada tarjeta conserva un borde izquierdo ancho en su color y la marca propia usa solo el fondo del estado, manteniendo el color original de los textos y el acento de «Tú». En móvil, el detalle empieza cerrado y se abre como diálogo superpuesto al calendario. La casilla muestra el resumen del equipo o la marca propia según el modo activo. La vista de consultas conserva la cabecera del equipo, el título de cada consulta y el orden de grupos.

La propuesta procede de la [dirección visual inicial](../04_direccion-visual/direccion-visual-synqo.md) y las referencias históricas. Los valores de color y los componentes no están aprobados. El mockup no reutiliza chat, horarios, rankings automáticos ni navegación del material anterior.

## Notas de interacción

- El archivo permite revisar la composición en móvil y escritorio, alternar los temas y recorrer meses naturales o meses extendidos a semanas completas. Dentro del panel del calendario, «Oct '26» es el primer elemento a la izquierda, seguido de anterior y siguiente; «Hoy» aparece con icono de diana solo cuando la fecha actual queda fuera de los días visibles. A la derecha, botones de solo icono alternan mes natural/semana completa (calendario/lista) y «Equipo»/«Mi disponibilidad» (varios usuarios/uno). En octubre de 2026, el modo extendido muestra del lunes 28 de septiembre al domingo 1 de noviembre. La fecha de demostración está fijada en el viernes 2 de octubre de 2026.
- Los nombres, fechas y recuentos son ilustrativos. Las marcas, votos y resoluciones se actualizan solo en memoria durante esta visita al mockup. La creación de ambos tipos se puede recorrer en el prototipo; compartir usa un enlace de ejemplo.
- La selección visual de un día abre el desglose como diálogo en móvil y actualiza el detalle de ejemplo en escritorio. Las propias tarjetas de recuento permiten marcar, cambiar y retirar la marca al pulsar de nuevo la activa, actualizando recuentos y listas en el acto. En una fecha pasada la casilla tiene tratamiento de solo lectura y las tarjetas se leen sin poder cambiar la marca. El detalle no presenta un aviso inferior de datos de ejemplo; los cambios se anuncian de forma no visible a las tecnologías de asistencia. Las casillas representan el estado agregado o la marca propia según el modo activo.
- Los días pasados usan un gris más claro. Los días añadidos de meses vecinos en «Semanas completas» conservan el fondo neutro o el de su estado. «Mi disponibilidad» representa las marcas de la identidad activa en las casillas; el detalle diario conserva el desglose del equipo.
- La identidad de la cabecera abre un diálogo para elegir otra identidad existente o crearla, con el mismo contenido en móvil y escritorio. Copiar y compartir son botones separados de solo icono, con nombres accesibles; compartir solo se activa si el dispositivo ofrece el diálogo nativo. En el mockup, ambos usan un enlace de ejemplo.
- En la consulta abierta, marcar o desmarcar una fecha actualiza inmediatamente el voto vigente, el recuento y los nombres mostrados, sin botones de registrar o retirar. Cada opción enseña hasta tres votantes y «(+N)» permite mostrar los demás dentro de la misma fila; si la identidad activa votó, figura primero con énfasis. No hay aviso inferior de resultado de ejemplo.
- Toda la tarjeta de una opción de voto responde al clic, salvo el control para mostrar o contraer más votantes. Todas las consultas abiertas, incluidas las creadas durante la visita al prototipo, muestran «Resolver consulta». El diálogo enseña todas las opciones inicialmente sin marcar, con los mismos recuentos y votantes, y permite aceptar una o varias o rechazar, seguido de confirmación. Tras resolver, la consulta pasa a «Resueltas» o «Rechazadas»: la lista muestra el resultado y el detalle conserva los votos públicos sin admitir cambios.
- Los puntos de entrada de creación se separan: «Crear consulta de fechas» usa el icono del panel del calendario. Despeja el detalle del día y permite elegir fechas pulsando días, mientras el panel muestra título y selección ordenada; en móvil el panel aparece debajo del calendario. «Crear consulta» abre un diálogo con título y opciones de texto editables y eliminables. Ambas creaciones piden confirmación. Cancelar es directo cuando no hay título ni opciones con texto (o fechas elegidas); si hay contenido, la confirmación enfoca «Seguir editando» y ofrece «Abandonar edición». Las opciones de texto permanecen en el orden en que se añaden y no tienen controles de ordenación.
- La versión anterior del HTML se conserva en [revisiones/prototipo-ux-inicial-20261002-192854.html](revisiones/prototipo-ux-inicial-20261002-192854.html) mientras continúa la revisión visual.
- La versión previa a estos ajustes se conserva en [revisiones/prototipo-ux-inicial-20261002-195354.html](revisiones/prototipo-ux-inicial-20261002-195354.html).
- La versión previa a la botonera de iconos se conserva en [revisiones/prototipo-ux-inicial-20261002-200658.html](revisiones/prototipo-ux-inicial-20261002-200658.html).
- La versión con controles de ordenación se conserva en [revisiones/prototipo-ux-inicial-20261002-231050.html](revisiones/prototipo-ux-inicial-20261002-231050.html).
- La versión previa a completar la resolución de consultas creadas se conserva en [revisiones/prototipo-ux-inicial-20261002-230555.html](revisiones/prototipo-ux-inicial-20261002-230555.html).
- La versión previa a la cancelación condicional y la corrección del arrastre se conserva en [revisiones/prototipo-ux-inicial-20261002-225558.html](revisiones/prototipo-ux-inicial-20261002-225558.html).
- La versión anterior al diálogo de opciones se conserva en [revisiones/prototipo-ux-inicial-20261002-224239.html](revisiones/prototipo-ux-inicial-20261002-224239.html).
- La versión previa a la separación de los puntos de entrada se conserva en [revisiones/prototipo-ux-inicial-20261002-223017.html](revisiones/prototipo-ux-inicial-20261002-223017.html).
- La versión previa al tema inicial según el dispositivo se conserva en [revisiones/prototipo-ux-inicial-20261003-004554.html](revisiones/prototipo-ux-inicial-20261003-004554.html).
- La versión previa al selector de tres modos y a recordar la última identidad activa se conserva en [revisiones/prototipo-ux-inicial-20261003-004751.html](revisiones/prototipo-ux-inicial-20261003-004751.html).
- El [estado ilustrativo de fallo del correo](prototipo-ux-inicial.html?correo=fallido) muestra el panel del equipo con el mismo componente de aviso que la confirmación de creación, el enlace legible y las acciones de copiar y compartir de la cabecera. **DIRECCIÓN VALIDADA** por quien impulsa Synqo para ambos lugares. El aviso puede reaparecer al volver al equipo desde el mismo navegador si no se ha descartado. El prototipo no define cómo se obtiene o comunica el resultado real del intento. El equipo continúa accesible según [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md). La versión previa se conserva en [revisiones/prototipo-ux-inicial-20261003-005449.html](revisiones/prototipo-ux-inicial-20261003-005449.html).
- La versión previa al aviso descartable se conserva en [revisiones/prototipo-ux-inicial-20261003-aviso-descartable.html](revisiones/prototipo-ux-inicial-20261003-aviso-descartable.html).
- La versión previa al componente compartido del aviso se conserva en [revisiones/prototipo-ux-inicial-20261003-010314.html](revisiones/prototipo-ux-inicial-20261003-010314.html).
- La versión previa a impedir opciones textuales duplicadas se conserva en [revisiones/prototipo-ux-inicial-20261003-011025.html](revisiones/prototipo-ux-inicial-20261003-011025.html). El diálogo señala las opciones repetidas según [RN-CON-006 — Texto único entre opciones de una consulta](../../03_requisitos/02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md) y desactiva la creación hasta corregirlas.
- La versión previa a los límites de diez opciones y de longitud se conserva en [revisiones/prototipo-ux-inicial-20261003-013547.html](revisiones/prototipo-ux-inicial-20261003-013547.html). Ambas creaciones muestran una anotación del máximo de opciones; los campos de texto limitan la entrada sin contadores ni avisos de longitud mientras se escribe.
- La versión previa al enlace opaco y a la clave ilustrativa basada en UUID se conserva en [revisiones/prototipo-ux-inicial-20261003-013950.html](revisiones/prototipo-ux-inicial-20261003-013950.html). El ejemplo evita sugerir que el nombre del equipo forma parte de su identidad única.
- El [estado sin consultas](prototipo-ux-inicial.html?consultas=vacias) muestra «Aún no hay consultas» y un botón «Crear consulta» que abre el diálogo de opciones de texto. Los grupos no aparecen mientras están vacíos; se muestran al crear una consulta en esta demostración. El calendario sigue disponible para iniciar una consulta de fechas. **DIRECCIÓN VALIDADA** por quien impulsa Synqo. La versión previa a este estado se conserva en [revisiones/prototipo-ux-inicial-20261003-015853.html](revisiones/prototipo-ux-inicial-20261003-015853.html).
- Las variantes de [fallo al guardar disponibilidad](prototipo-ux-inicial.html?guardado=disponibilidad) y [fallo al guardar un voto](prototipo-ux-inicial.html?guardado=voto) hacen fallar el primer cambio del caso correspondiente. Tras mostrar el cambio de inmediato, recuperan el valor anterior, los recuentos y los participantes, y presentan un aviso junto al detalle con «Reintentar». El reintento del ejemplo se completa. **DIRECCIÓN VALIDADA:** posición, composición y texto del aviso, por respuesta expresa de quien impulsa Synqo. El comportamiento procede de [RF-DIS-001 — Marcar y modificar disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md) y [RF-CON-002 — Registrar y cambiar un voto](../../03_requisitos/01_funcionales/CON/rf-con-002-votar.md). La versión previa se conserva en [revisiones/prototipo-ux-inicial-20261003-020536.html](revisiones/prototipo-ux-inicial-20261003-020536.html).
- El prototipo ilustra la creación y resolución; aún habrá que revisar otros estados vacíos y los errores antes de cerrar UX.

## Revisión pendiente

1. La composición y las interacciones centrales del prototipo fueron validadas por quien impulsa Synqo. Los estados alternos restantes se revisan en sus propias fichas.
2. Fijar valores de paleta y tipografía tras probar contraste, tamaños, foco, ampliación y adaptación en ambos temas frente a [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md).
3. Revisar las pantallas restantes a partir de sus wireframes; este mockup no completa la revisión visual de toda la primera entrega.
4. Comprobar foco, contraste y anuncio de los avisos de fallo de guardado en móvil y escritorio antes de aprobar valores visuales definitivos.
