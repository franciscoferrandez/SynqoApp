# WEB — reglas de implementación

> Convenciones del módulo WEB para la demo local. Los comandos ejecutables están definidos en `apps/web/package.json` y resumidos en el [README principal](../../../../README.md#desarrollo-local).

## Arquitectura normativa

Véase [WEB](../../../06_arquitectura/03_modulos/WEB/README.md).

## Responsabilidades

Implementar con Angular la presentación y las interacciones del navegador conforme a los recorridos y mockups aprobados, siguiendo [ADR-COO-001 — Separar interfaz web y API para la demo local](../../../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md).

## Convenciones específicas

Aplican también los [principios de arquitectura limpia y DDD](../../01_principios-y-convenciones/arquitectura-limpia-y-ddd.md).

- Organizar el código Angular por funcionalidades del producto y mantener un concepto principal por archivo, siguiendo la [guía de estilo de Angular](https://angular.dev/style-guide). Compartir componentes cuando exista un uso real en más de un recorrido; el layout exterior y la estructura interior del equipo ya tienen ese uso compartido.
- Implementar un layout exterior Angular compartido por todas las páginas, conforme a la [estructura inicial del equipo](../../../04_experiencia-usuario/01_arquitectura-informacion/estructura-equipo.md) y al [sistema de diseño inicial](../../../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md). Creación, confirmación, equipo y mensajes de enlace insertan su contenido propio en ese layout. Las vistas de un equipo vigente usan además una estructura compartida con cabecera, navegación, identidad activa y acciones comunes. El selector de tema y la base visual se construyen una vez para toda la aplicación; los elementos propios del equipo se construyen una vez para sus secciones. Reutilizar también los controles que repiten apariencia y comportamiento, sin forzar componentes comunes para interacciones diferentes.
- Mantener las reglas compartidas de vigencia, recuentos y resolución en API. Los componentes pueden mostrar cambios inmediatos, pero restaurarán el estado anterior y ofrecerán reintento si la API no confirma la operación, conforme a los requisitos aplicables.
- Implementar la dirección visual del prototipo con Tailwind CSS para composición, espaciado y adaptación, y CSS de componente cuando exprese mejor un elemento particular. Centralizar colores, tipografía y demás valores compartidos en tokens semánticos; las clases de los componentes deben referirse a esos tokens para permitir otras paletas con variantes clara y oscura sin duplicar la maquetación. No formar nombres de clases Tailwind dinámicamente a partir del tema, porque su compilación detecta clases presentes en el código. Elegir cualquier biblioteca de componentes adicional solo después de comprobar que conserva el aspecto y permite cumplir accesibilidad.
- Usar controles nativos cuando cubran la interacción. Para controles compuestos, verificar teclado, nombre accesible, estados, anuncios y foco; [Angular Aria](https://angular.dev/guide/aria/overview) es una opción de apoyo, no una dependencia aprobada por esta guía. Las acciones con solo icono tendrán nombre accesible y los diálogos devolverán el foco al cerrarse.
- Recordar tema e identidad activa en el navegador conforme al baseline, separados del valor de acceso del enlace. Mantener ese valor en el fragmento del enlace y enviarlo como Bearer a la API, conforme a [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).
- Interpretar errores HTTP conforme a la [convención común de API y WEB](../../../06_arquitectura/03_modulos/API/convencion-http.md), usando también la operación y el tipo de problema cuando el código no baste para elegir el estado visual.
- Configurar ESLint con `angular-eslint`, Prettier y comprobación estricta de TypeScript y plantillas según los [controles estáticos de la demo local](../../03_calidad/controles-estaticos-demo-local.md). El hook comprueba sin corregir; los comandos de corrección son explícitos.

## Testing específico

Mantener pruebas unitarias/componentes y recorridos Playwright contra las operaciones WEB/API reales que cubra cada cambio. Para la matriz responsive, cubrir recorridos completos en 390×844, 768×1024 y 1280×800 CSS px y verificar la frontera 768/769 px; la evidencia aprobada de [SPEC-COO-003 — Uso móvil adaptable en REL-001](../../../08_especificaciones/99_archivadas/spec-coo-003-uso-movil-rel-001.md) usa viewports Chromium emulados. Para cada cambio, documentar la ejecución de herramientas automatizadas de accesibilidad (herramienta/versión, alcance, resultado e incidencias); este paso satisface la parte automatizada del proceso del proyecto, sin sustituir revisión manual ni demostrar conformidad. El smoke de [SPEC-COO-002 — Smoke de accesibilidad responsive de REL-001](../../../08_especificaciones/99_archivadas/spec-coo-002-accesibilidad-wcag-rel-001.md) es evidencia parcial y REL-001 se aceptó con una excepción documentada; no se declara conformidad WCAG 2.2 AA. El benchmark [SPEC-COO-004 — Arranque básico en menos de cinco minutos en REL-001](../../../08_especificaciones/99_archivadas/spec-coo-004-arranque-cinco-minutos-rel-001.md) recorre el flujo completo con correo real de prueba y solo acepta automáticamente si termina en menos de 150 segundos. La estrategia global está en [Estrategia de pruebas de la demo local](../../02_testing/estrategia-demo-local.md).

## Comandos

Los comandos actuales de test, Playwright, build, lint y formato están definidos en `apps/web/package.json`; los pasos reproducibles están en el [README principal](../../../../README.md#desarrollo-local). Los E2E requieren API y servicios auxiliares locales cuando el recorrido usa datos persistentes o correo.

## Dependencias permitidas

API HTTP y utilidades propias de la web. Ninguna conexión directa a la base de datos.

## Prohibiciones

No usar la identidad de participante recordada como prueba de acceso al equipo ni guardar el valor del enlace en almacenamiento local.

## Checklist de implementación

- Confirmar estados de carga, error y recuperación.
- Verificar teclado, foco, contraste y vista móvil en el recorrido tocado.
- Comprobar que una modificación del layout exterior o tema se refleja en todas las páginas, incluidas creación y errores de enlace; comprobar también que una modificación de la cabecera o navegación del equipo se refleja en todas sus secciones.
- Probar recarga y apertura del enlace en otro navegador cuando corresponda.
