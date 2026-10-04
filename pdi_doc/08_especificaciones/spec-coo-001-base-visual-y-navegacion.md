---
id: SPEC-COO-001
nivel: N2
estado: ready
release: REL-001
---

# SPEC-COO-001 — Base visual y navegación de Synqo

## Objetivo

Iniciar [REL-001 — Demo local operativa de Synqo](../01_producto/10_entregas/rel-001-demo-local-operativa.md) con una aplicación Angular ejecutable en local que materialice la dirección visual y las estructuras compartidas de la web. La simulación permitirá revisar el recorrido antes de conectar la API y persistir equipos.

## Scope

- Estructura Angular ejecutable con instrucciones locales reproducibles.
- Integración de la web en este repositorio Git y su rama `main`, tras revisar y conservar el contenido existente; `.gitignore` adecuado, archivo de bloqueo de dependencias WEB y comandos documentados para instalar, arrancar, comprobar y limpiar el entorno local.
- Layout exterior compartido por todas las páginas de este incremento y estructura interior reutilizable para las secciones de un equipo vigente.
- Formulario de creación, confirmación y página de equipo con la estructura exterior e interior prevista, enlazados mediante una navegación simulada con datos de ejemplo fijos. Los valores escritos en el formulario no se procesan. Las secciones Calendario y Consultas mostrarán únicamente bloques vacíos para validar la composición del layout.
- Pantallas de equipo caducado y enlace no encontrado, dentro del mismo layout exterior.
- Temas Automático, Claro y Oscuro, presentación adaptable en móvil y escritorio, y componentes visuales comunes necesarios para estas pantallas.
- Comparación de los layouts y de las páginas efectivamente maquetadas con los mockups, y comprobaciones de accesibilidad aplicables a las pantallas e interacciones presentes.

## Fuera de scope

Creación y acceso reales a equipos, UUID o enlace operativo, selección persistente de participantes, API Symfony, PostgreSQL, disponibilidad, consultas, votos, resolución y correo. Tampoco incluye la cuadrícula del calendario, listas de consultas ni controles propios de esos paneles: se maquetarán en sus Changes funcionales. Esta SPEC no acredita la entrega de los requisitos funcionales simulados. La simulación no debe convertirse en una fuente de datos compartidos.

La validación funcional del formulario y la animación ilustrativa de sus placeholders se incorporarán al preparar la creación real del equipo. Esta SPEC se centra en el layout.

El primer incremento en este repositorio configura un workflow de GitHub con los mismos comandos de comprobación versionados. Se inspeccionó la protección de `main`: actualmente no hay reglas de protección. El hook local se mantiene como ayuda y no como sustituto de CI.

## Baseline relacionado

- [REL-001 — Demo local operativa de Synqo](../01_producto/10_entregas/rel-001-demo-local-operativa.md)
- [Estructura inicial del equipo](../04_experiencia-usuario/01_arquitectura-informacion/estructura-equipo.md)
- [Sistema de diseño inicial de Synqo](../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md)
- [Dirección visual inicial de Synqo](../04_experiencia-usuario/04_direccion-visual/direccion-visual-synqo.md)
- [MOCKUP-EQU-001 — Arranque directo de un equipo](../04_experiencia-usuario/06_mockups/mockup-equ-001-arranque-equipo.md)
- [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md)
- [MOCKUP-EQU-002 — Acceso a un equipo caducado](../04_experiencia-usuario/06_mockups/mockup-equ-002-equipo-caducado.md)
- [MOCKUP-EQU-004 — Enlace de equipo no encontrado](../04_experiencia-usuario/06_mockups/mockup-equ-004-enlace-no-encontrado.md)
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md)
- [RNF-COO-003 — Uso adaptable en navegador móvil](../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md)
- [ADR-COO-001 — Separar interfaz web y API para la demo local](../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md)

## Módulos afectados

- [WEB](../06_arquitectura/03_modulos/WEB/README.md)

## Criterios de aceptación

**Criterios para el incremento visual:**

- La aplicación arranca en local con comandos documentados para desarrollo, compilación y pruebas, y permite abrir directamente las cinco superficies previstas: creación, confirmación, equipo con bloques vacíos, equipo caducado y enlace no encontrado. Dentro del equipo se puede pasar de Calendario a Consultas y volver sin reconstruir la cabecera.
- La web dispone de ESLint con `angular-eslint`, Prettier, TypeScript y plantillas estrictas. Los comandos de comprobación y corrección son distintos; el hook local bloquea un commit con infracciones de WEB sin modificar archivos, conforme a los [controles estáticos de la demo local](../07_desarrollo/03_calidad/controles-estaticos-demo-local.md).
- Desde este incremento, todos los commits del repositorio siguen la [convención de commits de Synqo](../07_desarrollo/04_git/convencion-commits.md); un hook `commit-msg` rechaza mensajes inválidos sin corregirlos.
- Un clon nuevo puede instalar dependencias y reproducir las comprobaciones con las instrucciones versionadas; `.gitignore` excluye dependencias, salidas generadas, cachés y secretos locales sin ocultar archivos necesarios para reconstruir el proyecto. Se comprueba que los dos hooks impiden un commit inválido tras activarse en ese clon.
- Todas usan el mismo layout exterior, la misma fuente de tokens visuales y el mismo selector de tema. Calendario y Consultas comparten además una única estructura de equipo con cabecera y navegación; cada sección muestra solo su bloque vacío.
- Tailwind CSS compone los layouts con utilidades que remiten a tokens semánticos compartidos; el CSS de componente cubre los detalles particulares que lo necesiten. Cambiar entre Claro y Oscuro modifica los valores de los tokens sin duplicar clases o estructuras de los componentes.
- Escribir en el formulario y activar su acción lleva a la confirmación ilustrativa, pero el contenido mostrado procede de datos fijos. No se guarda ni transmite lo escrito, no se crea un UUID y no se presenta un enlace operativo como si diera acceso real. La confirmación identifica el enlace como ejemplo y no ofrece copiarlo ni compartirlo.
- Los temas Claro y Oscuro conservan el aspecto de partida de los mockups con los ajustes necesarios para WCAG 2.2 AA. Automático sigue el tema del dispositivo y usa Claro como respaldo; la elección manual persiste en el navegador.
- Las páginas y controles presentes se usan con teclado y foco visible, conservan lectura y disposición en móvil y escritorio, y superan las comprobaciones de accesibilidad aplicables a este incremento. La comparación visual cubre las partes efectivamente maquetadas en ambos temas y tamaños.
- La cuadrícula del calendario, las listas y los controles de disponibilidad y consultas no se implementan ni se evalúan aquí. La creación y el acceso reales corresponden a [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](spec-equ-001-arranque-equipo-local.md).

## Impacto baseline esperado

Materialización visual del baseline vigente. Si la comparación con los mockups descubre una nueva decisión de producto, se tratará mediante `pdi:baseline-update` antes de implementarla.

## Questions / Assumptions

- Por decisión expresa de quien impulsa Synqo, la simulación navegará con datos de ejemplo fijos, sin procesar ni conservar los valores escritos en el formulario. Las rutas de vista previa y el texto «Ejemplo» la distinguen de un equipo realmente guardado.
- Por decisión expresa de quien impulsa Synqo, la animación de ejemplos del formulario se deja para la creación real posterior.
- Por decisión expresa de quien impulsa Synqo, la pantalla de equipo mostrará bloques vacíos en lugar de maquetar los componentes de Calendario y Consultas. La comparación con sus mockups se limitará al layout compartido y a la ubicación de las secciones.
- Esta SPEC precede a [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](spec-equ-001-arranque-equipo-local.md); no cambia el alcance final de [REL-001 — Demo local operativa de Synqo](../01_producto/10_entregas/rel-001-demo-local-operativa.md). Las rutas de vista previa y el texto «Ejemplo» diferencian la simulación; desaparecen al conectar los datos reales en la siguiente SPEC.
- Por decisión expresa de quien impulsa Synqo, el selector de tema se sitúa visible y discreto en la cabecera global compartida. La barra de vista previa de los mockups no se incorpora a la aplicación. El símbolo de marca del mockup se utiliza provisionalmente junto a «Synqo» en este incremento; el lema sigue siendo exploratorio y no se aprueba como identidad definitiva, según la [dirección visual inicial de Synqo](../04_experiencia-usuario/04_direccion-visual/direccion-visual-synqo.md).

## Research necesario

Los calendarios oficiales de [Angular](https://angular.dev/reference/releases) y [Node](https://nodejs.org/en/about/previous-releases) muestran que Angular 21 y Node 24 están en LTS. La [tabla oficial de compatibilidad de Angular](https://angular.dev/reference/versions) admite Node `^24.0.0` para Angular 21; la [guía oficial de instalación](https://angular.dev/installation) explica el arranque local con Angular CLI. En este entorno hay Node `v24.21.0` instalado, mientras que la terminal activa usa Node `v18.20.8`. **Elección aprobada para este Change:** Angular 21.x con Node 24.21.0 seleccionado mediante el gestor local de versiones y versiones exactas fijadas en el archivo de dependencias al crear el proyecto. Esto aplica el [criterio de versiones LTS de la demo](../06_arquitectura/08_tecnologias/demo-local.md).

La [documentación oficial de rutas anidadas](https://angular.dev/guide/routing/define-routes) y [salidas de rutas](https://angular.dev/guide/routing/show-routes-with-outlets) permite mantener un layout exterior y otro interior de equipo mientras se sustituye solo el contenido activo. Revisar la base cromática de ambos temas y las interacciones presentes frente a WCAG 2.2 AA.

La [guía oficial de Angular para Tailwind CSS](https://angular.dev/guide/tailwind) documenta su integración en Angular; las [variables de tema de Tailwind](https://tailwindcss.com/docs/theme) permiten enlazar utilidades con tokens CSS y su [detección de clases](https://tailwindcss.com/docs/detecting-classes-in-source-files) exige mantener las clases utilizadas visibles en el código. **Elección posterior aprobada para este Change:** Tailwind CSS como base de estilos, con tokens semánticos para la paleta actual y CSS de componente donde convenga. Las futuras paletas clara/oscura reutilizarán esos tokens; su mecanismo de carga queda fuera de este incremento.

La [distribución oficial de Inter](https://github.com/rsms/inter/blob/master/README.md) ofrece archivos de fuente descargables y licencia SIL Open Font License. **Elección aprobada para este Change:** incluir la fuente como activo local de la web, con su licencia, y mantener la alternativa sans serif del sistema prevista en el baseline. Esto permite comprobar la tipografía de la demo sin depender de un servicio externo de fuentes.

## Design / Structure

La web se ubicará en `web/` en la raíz de este repositorio. Un componente de layout exterior reúne el símbolo de marca provisional del mockup junto a «Synqo», el contenedor adaptable y el selector de tema; un layout interior de equipo reúne cabecera y navegación. El uso provisional del símbolo no aprueba una identidad definitiva ni el lema exploratorio. Las páginas de creación, confirmación y mensajes de enlace se insertan en el layout exterior. Las dos secciones del equipo se insertan dentro de ambos layouts mediante rutas hijas de Angular, con bloques vacíos en su área de contenido. Tailwind CSS compondrá los layouts y estilos comunes sobre tokens semánticos CSS; el CSS de componente cubrirá detalles particulares. Los tokens tendrán valores para Claro y Oscuro y permitirán añadir otras paletas en el futuro sin reescribir los componentes. No se incorpora inicialmente una biblioteca de componentes. La preferencia de tema se guarda en el navegador y el modo Automático escucha la preferencia del dispositivo, con Claro como respaldo. Los datos de ejemplo se mantienen como constantes de presentación aisladas de cualquier futuro servicio de API y no representan una entidad persistida. La confirmación muestra de forma reconocible que el enlace es ilustrativo y no habilita copiar o compartir un enlace que no funcione.

**Mapa de rutas de la vista previa local:** `/` muestra el formulario; `/_preview/confirmacion` la confirmación; `/_preview/equipo/calendario` y `/_preview/equipo/consultas` comparten el layout interior; `/_preview/caducado` y `/_preview/no-encontrado` muestran los mensajes excepcionales dentro del layout exterior. Las rutas se pueden abrir directamente y volver a cargar. El prefijo de vista previa evita que una navegación de ejemplo se confunda con la ruta real de acceso `/e#t=<valor>` fijada por [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). Ninguna ruta de vista previa interpreta un enlace ni consulta datos de equipo. Los nombres internos de componentes se elegirán al aplicar el Change de acuerdo con el módulo WEB.

## Plan por slices

**Slices aprobados para este Change:**

1. Revisar la estructura actual del repositorio; preparar ignorados y archivo de bloqueo de WEB, documentar los comandos locales y activar los dos hooks; arrancar Angular con Tailwind CSS, controles estáticos y el layout exterior con temas y tokens compartidos.
2. Creación y confirmación visuales con navegación y datos fijos.
3. Layout interior de equipo, navegación entre los dos bloques vacíos y pantallas de enlace caducado o no encontrado.
4. Comparación visual y comprobaciones de accesibilidad y adaptación de las superficies de este incremento.

## Definition of Ready

**READY_FOR_CHANGE_APPLY.** Las rutas, la estructura, el contrato del módulo WEB, los criterios de aceptación y los cuatro slices están concretados. Quien impulsa Synqo aprobó expresamente la ubicación `web/`, las rutas de vista previa, el símbolo provisional del mockup, Angular 21 LTS con Node 24 LTS, Inter local y, en una decisión posterior, Tailwind CSS con tokens semánticos y CSS de componente cuando convenga. La revisión transversal del baseline consta como `READY_WITH_EXPLICIT_OMISSIONS` en el [estado de la documentación](../00_gobierno/02_estado-documentacion.md); las omisiones corresponden a las capacidades funcionales de Changes posteriores. No se han instalado dependencias. Por instrucción expresa de quien impulsa Synqo, no se inicia la implementación en esta pasada.

## Evidencia / Validation

| Criterio | Estado | Evidencia |
|---|---|---|
| Arranque, rutas directas y navegación de equipo | PASS | `npm ci`, `npm --prefix web ci`, `npm --prefix web run build`; Playwright abrió las seis rutas documentadas directamente y comprobó Calendario/Consultas. |
| Calidad estática y hook pre-commit | PASS | `npm --prefix web run lint`, `format:check`, `build` y `test` pasan; las pruebas del hook bloquean infracciones sin editar archivos. |
| Convención de commits | PASS | El hook `commit-msg` acepta mensajes válidos y rechaza inválidos sin modificarlos; `scripts/check-commit-range.mjs` valida el rango del incremento. |
| Clon limpio, dependencias e ignorados | PASS | En un clon temporal se instalaron ambos lockfiles y se reprodujeron las comprobaciones; los hooks bloquearon casos inválidos. Revisión de `.gitignore` y archivos versionados sin dependencias, salidas ni secretos locales. |
| Layouts compartidos | PASS | Inspección de las rutas y navegación en navegador; las dos secciones de equipo conservan la cabecera compartida. Comparación visual de las superficies implementadas con los mockups en Claro/Oscuro y móvil/escritorio. |
| Utilidades enlazadas a tokens | PASS | Revisión de Tailwind y CSS; durante la verificación se sustituyó el color fijo de acción por `bg-action` y el token semántico `--action`. El estilo computado del control muestra `rgb(49, 93, 255)`. |
| Formulario solo ilustrativo | PASS | Playwright comprobó que la acción navega a la confirmación con texto fijo, incluso con correo inválido; no se emiten peticiones de escritura ni se conservan los valores ingresados. |
| Temas y contraste aplicable | PASS | El modo Automático siguió `prefers-color-scheme: dark`, el modo Claro manual persistió tras recargar y Claro fue el respaldo. Los pares de texto y acción se comprobaron frente a sus superficies; el texto blanco sobre `#315dff` alcanza 5,07:1. |
| Teclado, foco, adaptación y accesibilidad | PASS | Tab alcanza controles con indicador de foco visible de 3 px. Sin desbordamiento horizontal en 320, 375 y 1440 px para las seis rutas y ambos temas. axe WCAG 2.0/2.1/2.2 encontró cero infracciones en las 36 combinaciones revisadas, con la regla de contraste excluida por bloqueo del analizador en Chromium; contraste revisado aparte. |

`npm audit --audit-level=critical` no informa vulnerabilidades críticas. La inspección visual de capturas cubrió las partes implementadas en ambos temas y tamaños; el símbolo de caducidad se corrigió a SVG durante esa revisión. Estos resultados se limitan a las superficies e interacciones de esta SPEC y no acreditan conformidad WCAG de páginas o procesos aún no implementados. La cuadrícula del calendario, listas, controles funcionales y acceso real corresponden a Changes posteriores.

## Convergence

| Aspecto | Clasificación | Resolución |
|---|---|---|
| Color de las acciones primarias fijado en CSS | A — código | Corregido en `77747a3`: los controles emplean el token semántico `--action` mediante `bg-action`, coherente con el [sistema de diseño inicial de Synqo](../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md). Lint, formato, build, tests y pre-commit volvieron a pasar. |
| Diferencia entre el alcance visual entregado y las capacidades completas de producto | F — fuera de scope | Las rutas de vista previa y los bloques vacíos son las simulaciones delimitadas por esta SPEC. Las capacidades funcionales permanecen planificadas en [REL-001 — Demo local operativa de Synqo](../01_producto/10_entregas/rel-001-demo-local-operativa.md) y se abordan en Changes posteriores; no se actualizan sus estados de delivery aquí. |
| Evidencia de accesibilidad de páginas y procesos completos | F — fuera de scope | La comprobación de este incremento cubre sus pantallas e interacciones presentes. No declara conformidad global con [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md); la auditoría completa sigue pendiente para la entrega. |
| Pipeline y protección de rama | Sin drift | El workflow de CI está versionado y ejecuta instalación, lint, formato, build, tests y control de mensajes. La rama `main` no tiene reglas de protección; la SPEC requería inspeccionarlas, no crear reglas. El hook local no se presenta como sustituto de CI. El workflow remoto aún no se ha ejecutado sobre estos commits locales. |

No queda drift significativo dentro del alcance de esta SPEC. No se descubrió nueva verdad de producto o arquitectura, por lo que no requiere `pdi:baseline-update`. La verificación y convergencia se limitan a esta SPEC; no implican que la release completa esté entregada.

## Resultado de cierre

Pendiente.
