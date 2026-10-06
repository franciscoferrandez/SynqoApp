# Estructura inicial del equipo

**Estado:** en revisión. **Origen:** [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../03_requisitos/01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md), [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md) y decisión expresa de quien impulsa Synqo sobre la primera vista.

**DEFINIDO:** el calendario de disponibilidad es la primera vista del equipo después de seleccionar una identidad o de recuperar la recordada. Dentro del equipo hay dos secciones visibles, «Calendario» y «Consultas», precedidas por una cabecera común con nombre del equipo, identidad activa, enlace y fecha prevista de caducidad.

**DEFINIDO por decisión expresa de quien impulsa Synqo:** todas las páginas comparten un layout exterior de aplicación: identidad visual, fondo y superficies generales, anchura y espaciado adaptables, y presentación del tema claro u oscuro. Incluye el formulario de creación, su confirmación, las vistas del equipo y los mensajes de enlace caducado o inexistente. Un selector de tema discreto y visible se sitúa en la cabecera global de todas ellas. Cada página aporta su contenido específico dentro de ese layout; la barra «Propuesta visual» de los mockups no forma parte de la aplicación.

Dentro del layout exterior, las vistas de un equipo vigente comparten además la estructura del equipo: cabecera, navegación entre «Calendario» y «Consultas», identidad activa y acciones comunes. Estos elementos mantienen ubicación y comportamiento al cambiar de sección; la sección activa aporta únicamente su contenido. Las páginas de creación y los mensajes de enlace no muestran datos ni navegación de un equipo vigente por el mero hecho de reutilizar el layout exterior.

## Secciones

- **Entrada por enlace:** si el navegador no recuerda una identidad para el equipo, se elige o crea una antes de ver su contenido.
- **Calendario:** primera sección al entrar bajo una identidad y punto de entrada a «Crear consulta de fechas», que inicia una selección vacía de días en el propio calendario. Muestra por defecto solo los días del mes natural o, al activar «Semanas completas», el mismo mes extendido desde el lunes de su primera semana hasta el domingo de la última, con fechas de meses vecinos. Su panel contiene la navegación: mes abreviado y año corto primero, anterior y siguiente a su derecha, y «Hoy» como icono solo si el día actual no está visible. Los selectores de mes/semanas y «Equipo»/«Mi disponibilidad» son pares de iconos en el lado derecho del mismo panel. El segundo cambia el estado que se representa en las casillas: agregado del equipo o marca de la identidad activa. No hay una pantalla separada de disponibilidad personal. El detalle del día conserva en ambos modos los tres recuentos y participantes del equipo; para hoy o fechas futuras permite elegir disponible, quizá o no disponible. Pulsar la opción propia activa retira la marca. Los días pasados se distinguen como solo lectura.
- **Consultas:** segunda sección visible, con una lista que identifica por su título las consultas de fechas y las de opciones de texto, y presenta tres grupos visibles en este orden: «Abiertas», «Resueltas» y «Rechazadas». Dentro de cada grupo, las consultas se ordenan por fecha de creación descendente. «Crear consulta» abre un diálogo con título y opciones de texto editables y eliminables; desde esta sección se abren las consultas de ambos tipos para responder, ver votos o resolverlas según su estado.
- **Cabecera común del equipo:** nombre, identidad actualmente seleccionada, opción para cambiarla mediante un diálogo que permite elegir otra o crearla, botones separados de solo icono para copiar el enlace y compartirlo cuando el dispositivo lo permita, y fecha prevista de caducidad. Aparece sobre «Calendario» y «Consultas» con el mismo comportamiento en móvil y escritorio.

## Jerarquía

```text
Layout exterior común de Synqo
├─ Creación de equipo y confirmación
├─ Mensaje de enlace caducado o inexistente
└─ Equipo vigente
   ├─ Selección de identidad, si no hay una recordada
   └─ Estructura común del equipo
      ├─ Cabecera — nombre, identidad, enlace y caducidad
      ├─ Calendario — sección inicial
      └─ Consultas — sección visible
```

Al abrir Synqo sin enlace de equipo se muestra directamente el formulario de [FLUJO-EQU-002 — Crear un equipo rápido](../02_flujos/flujo-equ-002-crear-equipo.md), con los nombres obligatorios del equipo y del primer participante y un campo de correo opcional. En [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md), junto a ese campo se explica que la dirección solo se usa para enviar el enlace. Al crear el equipo se selecciona automáticamente la identidad del primer participante en el navegador y se muestra por defecto una confirmación con el enlace y acceso al calendario. Una configuración interna puede omitir la confirmación y abrir el calendario directamente. Quien accede mediante un enlace sin identidad recordada sigue la selección o creación de participante antes del contenido; si excepcionalmente no hay participantes, el diálogo de creación permanece obligatorio.

## Navegación

«Calendario» y «Consultas» permanecen visibles como entradas de navegación del equipo bajo la cabecera común. Cada sección ofrece su propio punto de entrada para crear el tipo de consulta correspondiente. La consulta de fechas no toma automáticamente la fecha seleccionada en el calendario. La disposición exacta de los formularios y la navegación de regreso se definen en sus Wireframes.

## Relaciones

- [FLUJO-EQU-001 — Entrar en un equipo y elegir identidad](../02_flujos/flujo-equ-001-entrar-equipo.md)
- [FLUJO-EQU-002 — Crear un equipo rápido](../02_flujos/flujo-equ-002-crear-equipo.md)
- [FLUJO-DIS-001 — Marcar disponibilidad en el calendario](../02_flujos/flujo-dis-001-marcar-disponibilidad.md)
- [FLUJO-CON-001 — Crear una consulta de fechas](../02_flujos/flujo-con-001-crear-consulta.md)
- [FLUJO-CON-004 — Crear una consulta con opciones de texto](../02_flujos/flujo-con-004-crear-consulta-texto.md)
- [FLUJO-CON-002 — Responder una consulta abierta](../02_flujos/flujo-con-002-responder-consulta.md)
- [FLUJO-CON-003 — Resolver una consulta](../02_flujos/flujo-con-003-resolver-consulta.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RF-CON-005 — Crear una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-005-crear-consulta-texto.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RF-EQU-004 — Mostrar la fecha prevista de caducidad](../../03_requisitos/01_funcionales/EQU/rf-equ-004-mostrar-caducidad.md)
