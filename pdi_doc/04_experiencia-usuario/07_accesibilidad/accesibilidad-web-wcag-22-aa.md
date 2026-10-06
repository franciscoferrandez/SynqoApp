# Accesibilidad web de la primera entrega

**Estado:** en revisión. **Origen:** [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) y [especificación WCAG 2.2](https://www.w3.org/TR/WCAG22/).

Para REL-001 se aceptó el 2026-10-06 una excepción de delivery documentada en [la ficha de entrega](../../01_producto/10_entregas/rel-001-demo-local-operativa.md). Esta aceptación no demuestra conformidad; los criterios descritos aquí permanecen como objetivo normativo del producto.

## Criterio

La experiencia web completa debe satisfacer los criterios de éxito A y AA aplicables de WCAG 2.2. Los puntos siguientes identifican riesgos concretos de Synqo; no reemplazan la especificación completa.

| Interacción | Comprobaciones prioritarias | Referencia WCAG 2.2 |
|---|---|---|
| Calendario diario | Cada día y los controles de solo icono para mes/semanas, equipo/identidad y «Hoy» son utilizables con teclado, tienen nombre accesible, estado comprensible, foco visible y tamaño o separación de objetivo conforme al criterio aplicable. En móvil, el diálogo de detalle recibe el foco, mantiene la navegación dentro y lo devuelve al día elegido al cerrarse. La tarjeta propia se reconoce además del color; los días pasados indican su condición de solo lectura. | 1.4.1, 2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.5.8, 4.1.2 |
| Estados de disponibilidad y consultas | Disponible, quizá, no disponible, neutro, abierta, resuelta y rechazada se distinguen sin depender solo del color; texto, controles y gráficos cumplen el contraste aplicable. Se comprueban el texto, el borde izquierdo y el foco de cada tarjeta de disponibilidad sobre su fondo de hover y de selección en ambos temas. | 1.4.1, 1.4.3, 1.4.11 |
| Diseño móvil | Calendario, detalle diario, formularios y listas conservan contenido y funciones al ampliar y reordenar la presentación. | 1.4.4, 1.4.10 |
| Formularios y confirmaciones | Nombre de equipo, diálogo de cambio o creación de identidad, título, fechas, voto y resolución tienen etiquetas e instrucciones; los errores indican qué corregir; el foco se gestiona al abrir o cerrar diálogos, vistas de detalle o confirmación. La activación de cualquier zona de una tarjeta de voto se corresponde con la acción accesible del checkbox, mientras «(+N)» conserva su acción independiente. | 2.1.1, 2.4.3, 3.3.1, 3.3.2, 4.1.2 |
| Confirmación del equipo y aviso de correo | La confirmación predeterminada permite acceder al calendario con teclado. Si se conoce un fallo del envío, el aviso compartido lo comunica de forma perceptible sin impedir el acceso al equipo; el enlace sigue legible y las acciones de copiar o compartir conservan nombres accesibles. | 2.1.1, 2.4.3, 4.1.3 |
| Ejemplos animados del arranque | Los nombres animados son solo placeholders: no modifican valores de entrada ni sustituyen las etiquetas. Los tres placeholders quedan vacíos y la secuencia se pausa mientras algún campo tiene el foco; se restauran y continúan cuando ninguno lo tiene. Se muestran estáticos si se solicita reducir movimiento. | 2.2.2, 2.3.3, 3.3.2 |
| Creación de consultas | El selector de fechas ofrece estado seleccionado y conserva foco y orden al navegar por meses. El diálogo de opciones permite añadir, editar y eliminar con teclado, manteniendo el orden de incorporación. Los diálogos de creación y confirmación conservan el borrador al volver y gestionan el foco al abrirse y cerrarse. | 2.1.1, 2.4.3, 2.4.7, 3.3.2, 4.1.2, 4.1.3 |
| Cambios de estado | La respuesta tras marcar disponibilidad, votar, retirar voto o resolver una consulta se comunica de forma perceptible para tecnologías de asistencia. La opción «(+N)» tiene nombre y estado de expansión comprensibles; los contadores y votantes se actualizan tras cada marca de voto. | 4.1.2, 4.1.3 |
| Fallo de guardado | Si una marca de disponibilidad o voto no se guarda, el aviso comunica el fallo, la restauración del valor anterior y el reintento disponible. El foco no se pierde al restaurar la vista y la acción de reintento es accesible con teclado. | 2.1.1, 2.4.3, 3.3.1, 4.1.3 |

## Contexto

La auditoría incluye las vistas normales, vacías, con error y cerradas de los recorridos de crear equipo, elegir identidad, marcar disponibilidad, crear consulta, votar, retirar voto y resolver. Las pantallas de equipo caducado y enlace de equipo no encontrado también forman parte del alcance. La evaluación cubre páginas completas y todos los pasos de cada proceso, según los requisitos de conformidad de WCAG 2.2.

## Evidencia

### Comprobación preliminar del prototipo central

Se calcularon relaciones de contraste a partir de los colores declarados en [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../06_mockups/mockup-coo-001-calendario-consultas.md), en sus temas claro y oscuro. La comparación de texto normal se orienta por el mínimo 4,5:1 de [WCAG 2.2, criterio 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Los componentes gráficos esenciales se revisan por separado con [el criterio 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

| Par de tokens del prototipo | Claro | Oscuro | Lectura preliminar |
|---|---:|---:|---|
| `ink` / `surface` | 16,99:1 | 16,22:1 | Texto principal por encima de 4,5:1 |
| `muted` / `surface` | 6,17:1 | 10,28:1 | Texto auxiliar por encima de 4,5:1 |
| `blue-strong` / `surface` | 6,99:1 | 8,92:1 | Acciones textuales por encima de 4,5:1 |
| `mint` / `mint-soft` | 5,03:1 | 8,10:1 | Etiqueta disponible por encima de 4,5:1 |
| `amber` / `amber-soft` | 5,93:1 | 7,97:1 | Etiqueta quizá por encima de 4,5:1 |
| `rose` / `rose-soft` | 6,20:1 | 7,18:1 | Etiqueta no disponible por encima de 4,5:1 |
| `focus` / `surface` | 6,89:1 | 10,73:1 | Color de foco destacado en este fondo |
| `line` / `surface` | 1,30:1 | 1,68:1 | Borde suave: no debe ser la única señal visual esencial de un control |

Estos cálculos cubren solo los pares indicados; no constituyen una declaración de conformidad del prototipo ni de la aplicación. Falta revisar colores sobre hover, selección, error, gradientes y superficies combinadas, además del comportamiento real de foco, teclado, ampliación, tamaño de objetivo y lector de pantalla en las vistas implementadas.

- Resultado de comprobaciones automáticas sobre las vistas publicadas.
- Revisión manual con teclado y lector de pantalla de los recorridos completos.
- Comprobación de contraste, ampliación y presentación adaptable en escritorio y móvil.
- Registro de incidencias, correcciones y nueva evaluación antes de afirmar conformidad.

El 2026-10-06 la persona impulsora aceptó para REL-001 una excepción de delivery, basada en el smoke automatizado de 16 casos en cuatro viewports y una revisión manual general satisfactoria. La revisión no cubrió todas las vistas, estados, procesos y criterios de esta guía ni dejó resultados por criterio. Esta excepción no declara conformidad WCAG; los criterios y el objetivo de conformidad siguen vigentes para el producto.

En adelante, una ejecución documentada de herramientas automatizadas de accesibilidad satisface el paso automatizado del proceso de pruebas de este proyecto. El registro debe indicar herramienta y versión, alcance, resultado e incidencias. Este paso no garantiza conformidad ni reemplaza la evaluación manual necesaria para demostrarla.

## Elementos afectados

- [WF-EQU-001 — Elección de identidad al entrar](../03_wireframes/wf-equ-001-entrada-identidad.md)
- [WF-EQU-002 — Creación de equipo rápido](../03_wireframes/wf-equ-002-crear-equipo.md)
- [WF-EQU-003 — Equipo caducado](../03_wireframes/wf-equ-003-equipo-caducado.md)
- [WF-EQU-004 — Enlace de equipo no encontrado](../03_wireframes/wf-equ-004-enlace-no-encontrado.md)
- [WF-DIS-001 — Calendario inicial del equipo](../03_wireframes/wf-dis-001-calendario-equipo.md)
- [WF-CON-001 — Lista de consultas del equipo](../03_wireframes/wf-con-001-lista-consultas.md)
- [WF-CON-002 — Detalle de una consulta abierta](../03_wireframes/wf-con-002-detalle-consulta.md)
- [WF-CON-003 — Consulta resuelta o rechazada](../03_wireframes/wf-con-003-consulta-cerrada.md)
- [WF-CON-004 — Crear una consulta de fechas](../03_wireframes/wf-con-004-crear-consulta-fechas.md)
- [WF-CON-006 — Crear una consulta con opciones de texto](../03_wireframes/wf-con-006-crear-consulta-texto.md)
- [WF-CON-005 — Confirmar la resolución de una consulta](../03_wireframes/wf-con-005-confirmar-resolucion.md)
