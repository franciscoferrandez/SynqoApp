---
id: WF-DIS-001
estado: en_revision
---

# WF-DIS-001 — Calendario inicial del equipo

## Flujo

[FLUJO-EQU-001 — Entrar en un equipo y elegir identidad](../02_flujos/flujo-equ-001-entrar-equipo.md); [FLUJO-DIS-001 — Marcar disponibilidad en el calendario](../02_flujos/flujo-dis-001-marcar-disponibilidad.md).

## Estado representado

Equipo vigente abierto bajo una identidad recordada o recién elegida. El calendario es la primera vista.

## Jerarquía

```text
┌──────────────────────────────────┐
│ [Nombre del equipo] [▢] [⇧]      │
│ Participas como: [Nombre ▼]      │
│ Caduca: [fecha local]            │
│                                  │
│ [Calendario]       [Consultas]   │
│                                  │
│ ┌─ Panel de calendario ────────┐ │
│ │ Oct '26 [‹][›][◎]*           │ │
│ │       [👥][👤][+fecha] [☰]   │ │
│ │       Equipo/Mi disponibilidad│ │
│ └──────────────────────────────┘ │
│ Menú [☰]:                      │
│ [ ] Ver semanas completas       │
│ [ ] Superponer calendarios      │
│ [ ] Mostrar recuentos del equipo│
│ [Lu] [Ma] [Mi] [Ju] [Vi] [Sa] [Do]│
│ [día + estado principal] ...     │
│ [solapa opuesta: ancho completo, esquinas superiores rectas] ... │
│ [ambos planos pasados en gris]   │
│                                  │
│ Móvil: detalle cerrado al entrar │
│ Al elegir un día: diálogo encima │
│ [Disponible (2): participantes]  │
│ [Quizá (1): participantes]       │
│ [No disponible (0): —]           │
│ La tarjeta propia usa su color.  │
│ Pulsa de nuevo para retirar.     │
└──────────────────────────────────┘

Nota: «Hoy» solo aparece cuando la fecha actual queda fuera de los días visibles. El menú permanece cerrado por defecto y sus opciones no sustituyen el selector «Equipo»/«Mi disponibilidad». Todos los controles tienen nombre y estado accesibles.
```

## Acciones

- Cambiar la identidad activa desde su nombre: se abre un diálogo para elegir otra identidad existente o crear una nueva, con el mismo flujo en móvil y escritorio.
- Copiar el enlace con un botón de solo icono reconocible; abrir el diálogo del dispositivo desde otro botón de solo icono si está disponible. Ambos tienen nombre accesible. Si compartir no está disponible, su botón permanece inactivo y copiar sigue disponible.
- En cualquier tamaño de pantalla, ver por defecto el peor estado marcado por el equipo en cada casilla. Alternar a «Mi disponibilidad» para ver las marcas de la identidad activa, sin cambiar el desglose del equipo al activar un día. En móvil, el detalle se abre en un diálogo sobre el calendario y se puede cerrar para volver al día elegido.
- Sin preferencia guardada, ver solo los días del mes natural; activar «Semanas completas» para mostrar ese mismo mes desde el lunes de su primera semana hasta el domingo de la última, incluidos días de meses vecinos. Anterior y siguiente recorren meses en ambos modos.
- Dentro del panel del calendario, mostrar primero el mes abreviado y el año corto, con anterior y siguiente a su derecha; situar el menú de visualización a la derecha y, justo a su izquierda, los botones «Equipo»/«Mi disponibilidad» y crear consulta de fechas. En móvil pueden pasar juntos a una segunda fila. El menú sustituye solo los botones de mes natural/semanas completas. Sus tres opciones independientes son «Ver semanas completas», «Superponer calendarios» y «Mostrar recuentos del equipo»; empiezan desactivadas si no hay preferencias guardadas y se restauran al volver al calendario en el mismo navegador, también en móvil. Mostrar «Hoy» junto a la navegación temporal solo cuando el día actual no esté entre las fechas visibles; volver a él sin cambiar las opciones ni el alcance.
- Con la superposición activa, cada casilla conserva como plano principal el alcance elegido. Una solapa de su mismo ancho y altura uniforme asoma por debajo, con esquinas superiores rectas e inferiores redondeadas, y muestra el alcance opuesto en todos los días, también sin marcas: marca propia o ausencia bajo «Equipo», y resultado del equipo o neutro bajo «Mi disponibilidad». El plano inferior de los días pasados aparece gris, sin color de disponibilidad. La casilla completa se activa como un solo día: el contorno continuo de selección y el contorno discontinuo de foco rodean juntos casilla y solapa; sin superposición, el foco conserva ese mismo trazo alrededor de la casilla principal. El tratamiento de pasado se conserva. El menú se puede abrir y usar con teclado; comunica qué opciones están activas y devuelve el foco al botón al cerrarse.
- En las casillas, abreviar los estados con marca como «Disp.», «Quizá» y «No disp.» junto a sus iconos. La ausencia de marca no lleva texto; el detalle conserva los nombres completos.
- Con «Mostrar recuentos del equipo» activo, el plano del equipo presenta siempre Disponible, Quizá y No disponible, en ese orden y repartidos a lo ancho: cada icono lleva su cifra o «_» si no recibió votos. Destaca en negrita el estado resultante. Se representa igual si el equipo está delante o en la solapa bajo «Mi disponibilidad»; la marca propia se mantiene legible en el otro plano. Sin marcas, aparecen las tres posiciones con «_» y el equipo conserva el estado neutro. En móvil, la casilla crece lo necesario para mantener legibles iconos y cifras sin ocultar información.
- Mostrar los días pasados con un gris claro de solo lectura y, en «Semanas completas», los días de otros meses con el fondo normal o el fondo de su estado de disponibilidad.
- Tocar un día para abrir su detalle y ver tres tarjetas, una por estado, con recuento y participantes. Cada tarjeta conserva un borde izquierdo ancho de su color de estado; al pasar el cursor o al quedar seleccionada, usa el fondo de ese estado sin reforzar los demás bordes ni recolorear el texto. Muestra «Tú» primero, en negrita y con su acento habitual, antes que los demás nombres. En un día editable, tocar una tarjeta cambia la marca y actualiza inmediatamente recuentos y listas; tocar de nuevo la tarjeta activa retira la marca y deja al participante sin marcar.
- Reconocer visualmente los días pasados como solo lectura y consultar su desglose sin poder cambiar ni retirar marcas.
- Iniciar «Crear consulta de fechas» desde esta vista; la selección empieza vacía y los días se añaden o retiran pulsándolos en el calendario, incluso al cambiar de mes. El detalle del día se sustituye por el panel de creación; en móvil, este aparece debajo del calendario. Crear requiere confirmación; cancelar solo la requiere si hay título o fechas elegidas. Acceder por separado a «Consultas» para crear consultas con opciones de texto.

## Notas

**DEFINIDO:** calendario como primera vista y punto de entrada a la creación manual de consultas de fechas; mes natural predeterminado si no hay preferencia guardada y vista opcional del mismo mes completado por semanas de lunes a domingo, con controles anterior, siguiente y «Hoy»; secciones visibles «Calendario» y «Consultas» bajo una cabecera común con nombre, identidad, enlace y caducidad. El menú de visualización agrupa semanas completas, superposición y recuentos; «Equipo»/«Mi disponibilidad» permanece visible. En cualquier pantalla, cada casilla muestra el estado agregado o la marca propia según el selector, con la solapa opuesta y los recuentos cuando se activen; al activar un día aparecen tres tarjetas que combinan recuento, participantes y selección de disponibilidad. La propia marca se resalta con el fondo del estado y presenta «Tú» primero. En móvil, el detalle se muestra como diálogo sobre el calendario solo tras elegir un día. Solo hoy y fechas futuras admiten cambios de disponibilidad, usando la zona del dispositivo o, si no se obtiene, la del equipo. Los días pasados se distinguen visualmente y siguen siendo consultables. La interacción y la presentación deben satisfacer [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). **PROPUESTO:** acabado visual de la solapa y del menú. La representación de días sin marcas es neutra. La fecha de caducidad se muestra en la zona del dispositivo o, si no se obtiene, en la del equipo.
