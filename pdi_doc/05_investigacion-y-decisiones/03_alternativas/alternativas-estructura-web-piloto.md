# Alternativas — Estructura de la aplicación web del piloto

## Pregunta

¿Cómo estructurar la web del piloto para cubrir sus interacciones móviles y de escritorio, conservar una experiencia accesible y permitir reutilizar el trabajo web en una aplicación instalable posterior sin decidir ahora ese empaquetado?

## Criterios

- [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md) exige los mismos recorridos funcionales en navegadores móviles y de escritorio.
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) exige comprobar páginas y procesos completos, incluidos diálogos, estados y errores.
- [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md) y [WF-CON-002 — Detalle de una consulta abierta](../../04_experiencia-usuario/03_wireframes/wf-con-002-detalle-consulta.md) definen cambios inmediatos de disponibilidad y votos, modales, navegación y vistas de estado.
- El [alcance conceptual](../../01_producto/04_alcance/alcance-conceptual.md) prevé una aplicación instalable posterior, con intención de reutilizar la web y sin tecnología decidida.

## Opciones

| Opción | Encaje | Costes y riesgos |
|---|---|---|
| A. Aplicación web integrada con rutas servidas por el servidor y componentes interactivos en el cliente | Permite servir las entradas y estados principales como páginas completas y añadir interacción inmediata al calendario, votos y diálogos. Cliente y servidor comparten una frontera de despliegue sencilla. | Hay que definir los contratos entre interfaz y operaciones del servidor y comprobar foco, anuncios de cambios y navegación cuando los componentes actualizan contenido. El grado de JavaScript necesario sigue pendiente. |
| B. Interfaz de página única separada de una API | Facilita manejar estados interactivos sin recargar la página y puede reutilizar la API en otros clientes. | Añade dos piezas de entrega y un contrato de API desde el inicio. La navegación, los errores, la carga inicial y la gestión del foco dependen de la implementación de la interfaz; separar servicios no garantiza reutilización del código visual en una futura aplicación instalable. |
| C. Páginas renderizadas en servidor con mejora progresiva de interacciones | Puede ofrecer contenido y operaciones básicas antes de cargar los comportamientos enriquecidos y aprovechar controles nativos. | El calendario con selección de fechas entre meses y las actualizaciones inmediatas de votos y recuentos requieren código cliente. Hay que decidir si mantener dos caminos funcionales aporta valor suficiente para el piloto. |

## Evidencia técnica

- [MDN — Progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) describe una base funcional ampliada por capacidades del navegador y recomienda alternativas accesibles cuando corresponda.
- [MDN — History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API) explica la navegación de una aplicación de página única y el estado que esta debe gestionar al cambiar contenido sin recargar.
- [MDN — Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) distingue una web utilizable en navegador de su instalación posterior y señala diferencias de soporte entre navegadores y plataformas. Una PWA no equivale por sí sola al empaquetado móvil aún no elegido.

## Evaluación provisional

Para la demo local se ha elegido la opción B en [ADR-COO-001 — Separar interfaz web y API para la demo local](../05_adr/adr-coo-001-estructura-demo-local.md), incorporando la preferencia expresa por Angular, Symfony con API Platform y PostgreSQL y el objetivo de aprender buenas prácticas en esas tecnologías. La opción A fue la candidata inicial antes de conocer esa preferencia; las opciones A y C siguen documentadas para explicar el análisis, pero no son la estructura elegida de la demo.

Antes de implementar se debe concretar la navegación y el manejo de errores, el contrato de acceso por enlace y la validación de accesibilidad sobre los recorridos reales. El ADR enlazado fija los frameworks de la demo; esta comparación no decide la tecnología de la aplicación instalable posterior.

## Estado

Comparación histórica y evidencia del ADR. No constituye arquitectura normativa por sí sola.
