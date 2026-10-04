# Sistema de diseño inicial de Synqo

**Estado:** en revisión. **Origen:** [dirección visual de Synqo](../04_direccion-visual/direccion-visual-synqo.md), referencias visuales históricas de Synqo, Wireframes de la primera entrega y [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md).

## Tokens

**DEFINIDO:** el sistema debe cubrir tema claro y tema oscuro. El selector ofrece «Automático», «Claro» y «Oscuro» y conserva la selección en el navegador. «Automático» sigue la preferencia del dispositivo y usa claro como respaldo. Quien impulsa Synqo ha elegido la paleta actual de [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../06_mockups/mockup-coo-001-calendario-consultas.md) como base para ambos temas, permitiendo ajustes donde sean necesarios para cumplir [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). Los valores siguientes son los del prototipo, no valores finales de conformidad. Los estados no dependerán solo del color.

**DEFINIDO:** la implementación usará tokens semánticos compartidos, independientes de los componentes y de los valores concretos de cada paleta. Synqo dispondrá inicialmente de una paleta con variantes clara y oscura; la estructura permitirá incorporar otras paletas con las mismas variantes más adelante, sin dar por decididos todavía su catálogo, carga ni selector. Tailwind CSS utilizará esos tokens para las utilidades visuales comunes; el cambio de paleta o variante sustituirá sus valores sin cambiar las clases de los componentes. Cada variante incorporada deberá comprobarse frente a [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md).

| Token de partida | Claro | Oscuro |
|---|---|---|
| `app` | `#f4f7ff` | `#07101f` |
| `surface` | `#fff` | `#101b2f` |
| `raised` | `#fff` | `#172540` |
| `soft` | `#edf3ff` | `#172846` |
| `line` | `#d9e2f2` | `#304161` |
| `ink` | `#0b174a` | `#f6f8ff` |
| `muted` | `#526184` | `#bbc8e8` |
| `blue` | `#315dff` | `#7192ff` |
| `blue-strong` | `#2349d7` | `#a4b8ff` |
| `blue-soft` | `#e8efff` | `#1b3267` |
| `mint` | `#0b765c` | `#8ef1cd` |
| `mint-soft` | `#dff9ed` | `#114536` |
| `amber` | `#805300` | `#ffd17b` |
| `amber-soft` | `#fff1ce` | `#493713` |
| `rose` | `#a42346` | `#ff9bb2` |
| `rose-soft` | `#ffe8ee` | `#491b2b` |
| `focus` | `#0050cf` | `#72d9ff` |
| `past` | `#f1f3f7` | `#253149` |

La [comprobación preliminar de contraste](../07_accesibilidad/accesibilidad-web-wcag-22-aa.md#comprobación-preliminar-del-prototipo-central) registra los pares revisados y las limitaciones de esa muestra. Antes de fijar valores finales se revisarán también los estados interactivos y las fronteras visuales de controles.

## Tipografía

**DEFINIDO:** Inter como familia principal, con la fuente sans serif del sistema como alternativa cuando Inter no esté disponible. **PROPUESTO:** una jerarquía común para nombre de equipo, títulos de consulta, fecha del calendario, recuentos, etiquetas de estado y texto auxiliar. La escala tipográfica concreta sigue pendiente. Las fechas y los recuentos deben seguir siendo legibles al ampliar el texto.

## Espaciado

**PROPUESTO:** una escala compartida para separación entre secciones, controles y opciones. El calendario de siete columnas y sus controles se revisarán en móvil con los criterios de presentación adaptable y tamaño de objetivo de WCAG 2.2 nivel AA.

## Color

**DEFINIDO:** la dirección visual es lúdica y social y contempla temas claro y oscuro. Las tarjetas de disponibilidad conservan un borde izquierdo ancho del color semántico de disponible, quizá o no disponible; al pasar el cursor o al quedar seleccionadas se tiñen solo con el fondo del estado. Los textos conservan sus colores y acentos habituales. La paleta del prototipo es la base elegida, sujeta a los ajustes de accesibilidad necesarios. **PROPUESTO:** reservar un tratamiento neutro para días sin marcas y acompañar cada estado de una indicación textual o equivalente accesible. El azul de acción y los acentos cian/menta se revisarán junto con los colores de estado para que no se confundan.

## Componentes

| Componente propuesto | Uso común | Estados y contenido necesarios |
|---|---|---|
| Layout exterior de aplicación | Todas las páginas, incluidas creación, confirmación, equipo vigente, equipo caducado y enlace no encontrado | Identidad visual, cabecera global con selector de tema discreto y visible, fondo, superficies generales, anchura y espaciado adaptables, y espacio para el contenido de cada página; mantiene una base visual coherente en móvil y escritorio |
| Estructura compartida del equipo | Vistas interiores de un equipo vigente, incluidas Calendario y Consultas | Cabecera, navegación, identidad activa y acciones comunes dentro del layout exterior; recibe el contenido de la sección activa |
| Cabecera de equipo | Calendario y Consultas | Nombre, identidad activa y cambio, enlace compartible, caducidad |
| Selector de tema | Cabecera global compartida por todas las páginas | Control discreto y visible para Automático, Claro y Oscuro; la selección se conserva en el navegador; Automático sigue al dispositivo y usa claro como respaldo. La barra de vista previa de los mockups no se traslada a la aplicación |
| Diálogo de identidad | Cabecera de equipo | Elegir participante existente o crear otro; mismo flujo en móvil y escritorio |
| Acciones de enlace | Cabecera de equipo | Dos botones de solo icono reconocible con nombre accesible: copiar y compartir; este último inactivo si el dispositivo no lo permite |
| Navegación de sección | Equipo | Calendario y Consultas; sección activa y foco |
| Casilla de día | Calendario | Fecha, estado agregado o marca propia según el modo activo, foco y selección; sin recuentos dentro |
| Selector de presentación | Panel del calendario | Dos pares de botones de solo icono: calendario/lista para mes natural o semanas completas, varios usuarios/uno para «Equipo» o «Mi disponibilidad»; nombre accesible y estado activo perceptible sin depender del color |
| Navegación temporal | Panel del calendario | Mes abreviado y año corto como primer elemento, anterior y siguiente a su derecha; «Hoy» con icono de diana solo si no está entre los días visibles |
| Detalle de día | Calendario | Tres tarjetas con recuentos y participantes del equipo en ambos alcances; la propia marca resaltada en su color y «Tú» primero; las mismas tarjetas editan solo hoy o futuro. En móvil aparece en un diálogo sobre el calendario al activar un día, no al entrar |
| Grupo y fila de consulta | Lista de consultas | Estado, título y orden por creación; resumen de opciones aceptadas en las resueltas; todas pueden abrirse |
| Opción de voto | Consulta abierta o cerrada | Fecha, selección vigente, contador y hasta tres votantes visibles; «(+N)» muestra los restantes en la misma opción; en la abierta, toda la tarjeta activa la marca salvo el control de más votantes y el cambio aplica de inmediato |
| Campo con validación | Creación de equipo, identidad y consulta | Etiqueta, ayuda aplicable, error y conservación de entrada; límite de 50 caracteres para nombres de equipo y participante, 250 para título de consulta y 50 para opción de texto, sin contador de caracteres mientras se escribe |
| Límite de opciones | Creación de consultas de fecha y texto | Anotación breve «Hasta 10» visible durante la creación; no se añade una opción undécima |
| Aviso de fallo de correo | Confirmación de creación y panel del equipo | Componente compartido con explicación de que el equipo sigue creado, enlace legible y acceso a copiarlo o compartirlo; solo aparece cuando se conoce el fallo |
| Selección y confirmación de resolución | Cierre de consulta | Diálogo con todas las opciones inicialmente sin marcar, recuento y votantes; aceptación o rechazo, revisión del resultado e identidad activa, cancelar y confirmar |
| Aviso de fallo de guardado | Marca de disponibilidad y voto | Mensaje perceptible junto a la acción afectada, con opción de reintentar; se restaura el valor anterior, incluidos recuentos y participantes visibles |

## Estados

**PROPUESTO:** cada control interactivo documentará los estados normal, foco, seleccionado, deshabilitado y error cuando corresponda. «Sin marcar» y «neutro» no son equivalentes: el primero es ausencia de marca de un participante; el segundo es el resumen de un día sin marcas.

**DEFINIDO:** en el detalle diario las tres tarjetas de recuento son también las tres opciones de marca, sin bloque de edición separado. La tarjeta propia se resalta solo con el fondo de su estado; el borde izquierdo ancho y los colores de texto se mantienen como en las otras tarjetas, y «Tú» precede a los demás participantes de ese estado. Pulsar la tarjeta activa retira la marca; los recuentos y listas se actualizan al cambiarla. Los días pasados conservan acceso al detalle y muestran un tratamiento de solo lectura perceptible también sin color. En móvil, el detalle permanece cerrado hasta que se activa un día y se presenta como diálogo. El mockup no muestra un aviso inferior de datos de ejemplo en el detalle.

## Accesibilidad

El objetivo normativo se establece en [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). Las comprobaciones prioritarias para estos componentes se describen en la [guía de accesibilidad web](../07_accesibilidad/accesibilidad-web-wcag-22-aa.md). La selección de valores visuales y el detalle de interacción deberán validarse en ambos temas contra ese requisito antes de aprobarse.
