# Dirección visual inicial de Synqo

**Estado:** en revisión. **Origen:** decisión expresa de quien impulsa Synqo sobre el tono visual y la existencia de temas claro y oscuro; brand board y mockups exploratorios aportados desde `synqo-documentation-v0.2/design/reference-assets/`.

## Personalidad

**DEFINIDO:** lúdica y social. Synqo debe sentirse apropiada para coordinar actividades entre personas que comparten un equipo.

## Tono

**DEFINIDO:** lúdico y social en la primera entrega. **PROPUESTO:** cercano y directo en los textos de acciones y estados, evitando que el aspecto lúdico dificulte reconocer disponibilidad, votos o resolución.

## Principios

- **PROPUESTO:** dar prioridad visual al día, su estado agregado y la acción siguiente en el calendario.
- **PROPUESTO:** mantener reconocibles la identidad activa y el estado abierto o cerrado de cada consulta.
- **PROPUESTO:** reservar los acentos expresivos para orientar la acción y dar carácter al producto, sin recargar la lectura de calendarios y listas.
- **DEFINIDO como base visual, derivado de las referencias y los mockups validados:** usar azul e índigo para identidad y acción, cian y menta como acentos, superficies luminosas en claro y azul marino profundo en oscuro. Mantener formas suaves, iconografía simple y poco relieve en las vistas operativas. La paleta actual de [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../06_mockups/mockup-coo-001-calendario-consultas.md) se toma como punto de partida con ajustes permitidos para cumplir accesibilidad.
- **DEFINIDO:** contemplar al menos tema claro y tema oscuro. Ambos deben representar los mismos estados y acciones y cumplir el objetivo de accesibilidad web.
- **DEFINIDO:** el selector de tema ofrece «Automático», «Claro» y «Oscuro». En «Automático» se aplica la preferencia del dispositivo, con claro como respaldo si no puede obtenerse. La opción seleccionada se conserva en el navegador.
- **DEFINIDO:** Inter es la tipografía principal y se usa una fuente sans serif del sistema como alternativa si Inter no está disponible.

## Referencias

Las siguientes imágenes son referencias de identidad y acabado visual, conservadas dentro del proyecto:

| Referencia | Aporta |
|---|---|
| [Brand board](referencias/brand-board.png) | Logotipo exploratorio, familia cromática, gradientes y tono gráfico. |
| [Móvil claro](referencias/mockup-mobile-light.png) · [móvil oscuro](referencias/mockup-mobile-dark.png) | Tratamiento de superficies, botones, tarjetas, jerarquía y transición entre temas. |
| [Escritorio claro](referencias/mockup-desktop-light.png) · [escritorio oscuro](referencias/mockup-desktop-dark.png) | Composición amplia, densidad de información y contraste entre paneles. |

**Límite funcional:** estas imágenes proceden de una definición anterior. Muestran, entre otras cosas, chat, franjas horarias, selección de «mejores opciones» y navegación distinta. No establecen funcionalidades, reglas, contenido ni estructura para la fase actual. Las pantallas nuevas deberán seguir [WF-DIS-001 — Calendario inicial del equipo](../03_wireframes/wf-dis-001-calendario-equipo.md), [WF-CON-001 — Lista de consultas del equipo](../03_wireframes/wf-con-001-lista-consultas.md) y los demás wireframes vigentes. Los logotipos y lemas de la referencia aún requieren revisión antes de adoptarse como identidad definitiva.

## Evitar

**PROPUESTO:** exceso de decoración que compita con las fechas, los recuentos o los resultados de las consultas. Evitar trasladar a pantallas operativas los fondos promocionales, las tarjetas anidadas y los elementos no previstos en el producto actual.

## Restricciones

La interfaz de la primera entrega se usará desde navegadores de escritorio y móviles, conforme a [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md). Los temas claro y oscuro forman parte de la dirección visual y se eligen con un selector de tres opciones cuya preferencia se conserva en el navegador. La paleta del prototipo es la base elegida; siguen sin decidirse sus valores finales, la escala tipográfica concreta y los componentes concretos. Cada tema deberá comprobarse con [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). La aplicación móvil instalable está prevista para una entrega posterior, sin tecnología elegida.
