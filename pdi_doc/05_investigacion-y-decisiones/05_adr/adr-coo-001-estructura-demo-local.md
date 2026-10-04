---
id: ADR-COO-001
estado: aprobado
---

# ADR-COO-001 — Separar interfaz web y API para la demo local

## Contexto

[REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) exige una web interactiva, datos persistentes y uso simultáneo desde dos navegadores. El código se creará en este repositorio, junto a `pdi_doc/` y `pdi/`. La persona que impulsa Synqo ha elegido Angular para la web, Symfony con API Platform para el servidor y PostgreSQL para la persistencia. Conoce estas tecnologías y quiere utilizar el proyecto para afianzar buenas prácticas en ellas. También le interesa conservar una vía para futuras funciones relacionadas con ubicaciones geográficas; todavía no existe un requisito concreto de ellas. La elección se acepta siempre que permita reproducir la dirección visual del prototipo y conservar una vía razonable para empaquetar la web como aplicación móvil en una entrega posterior.

## Drivers

- [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md)
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md)
- [Drivers arquitectónicos de la primera entrega](../../06_arquitectura/01_drivers-arquitectonicos/drivers-primera-entrega.md)

## Opciones consideradas

La [comparación de estructuras web](../03_alternativas/alternativas-estructura-web-piloto.md) contempla aplicación integrada, interfaz separada de API y representación en servidor con mejora progresiva. Se evaluó además reutilizar la configuración React/NestJS del proyecto anterior, pero esa ventaja de arranque no prevalece sobre la preferencia técnica expresa y el objetivo de aprendizaje. Se conservarán los prototipos como referencia visual, sin trasladar su lógica a producción.

Para la base de datos, MySQL también ofrece tipos, funciones e índices espaciales; por tanto, una futura necesidad de guardar coordenadas o calcular distancias sencillas no exige PostgreSQL. PostgreSQL permite usar PostGIS, cuya función `ST_DWithin` consulta proximidad sobre `geography` en metros y aprovecha índices espaciales; PostGIS ofrece además relaciones e índices para consultas espaciales más amplias. Esa vía de ampliación respalda la preferencia por PostgreSQL, sin demostrar todavía que Synqo necesite PostGIS ni que MySQL sea insuficiente. No se activa la extensión ni se incorpora un modelo geográfico en esta demo solo por esa posibilidad.

## Decisión

La demo usará una web Angular con TypeScript, un servidor Symfony con API Platform y PostgreSQL persistente, ejecutados localmente. La API será la autoridad de las reglas de equipo, disponibilidad y consultas; la web gestionará la interacción y presentará los resultados de la API. Para operaciones con reglas propias se podrán usar proveedores y procesadores de estado de API Platform, sin depender de que la exposición automática de entidades represente por sí sola el dominio.

La interfaz se realizará con componentes Angular, HTML y Tailwind CSS para composición y estilos habituales, más CSS de componente cuando facilite expresar elementos particulares como el calendario. Los colores y demás valores visuales compartidos se definirán mediante tokens semánticos, sin imponer una biblioteca de componentes que altere el prototipo. Por decisión posterior expresa de la persona impulsora, esta elección sustituye la previsión inicial de CSS propio sin framework. La estructura de tokens permitirá incorporar en el futuro otros temas con variantes clara y oscura, sin comprometer su entrega en la demo local. Se conservará la posibilidad de compilar la web como activos utilizables por un contenedor móvil posterior; el empaquetado, los enlaces profundos y las integraciones nativas se decidirán y comprobarán cuando esa entrega se prepare. Esta decisión no fija alojamiento público ni versiones concretas.

## Consecuencias positivas

- La estructura separa los cambios inmediatos del calendario y las consultas de los datos persistidos.
- Responde a la preferencia técnica y al objetivo de aprendizaje expresos por la persona impulsora.
- Symfony, API Platform y PostgreSQL disponen de integración documentada; Angular y Tailwind permiten construir una web adaptable y conservar la dirección visual propia mediante tokens.
- La web podrá evaluarse en navegador móvil antes de decidir su empaquetado posterior.

## Consecuencias negativas

- Hay dos procesos de aplicación y una base de datos que arrancar en desarrollo.
- La navegación, el foco tras actualizaciones y los mensajes de error accesibles deben resolverse explícitamente en la web.
- Tailwind no garantiza accesibilidad por sí solo: cada tema y variante deberán superar las comprobaciones de contraste, foco y estados aplicables.
- La API necesita contratos y pruebas propios; las operaciones de dominio no se obtienen automáticamente por declarar recursos.
- El empaquetado móvil sigue siendo una hipótesis viable, pendiente de comprobar enlaces de invitación, navegación y funciones del dispositivo en una entrega posterior.

## Evidencia / Research

- [Comparación de estructuras web](../03_alternativas/alternativas-estructura-web-piloto.md)
- [Angular — Styling components](https://angular.dev/guide/components/styling)
- [Angular — Using Tailwind CSS](https://angular.dev/guide/tailwind)
- [Tailwind CSS — Theme variables](https://tailwindcss.com/docs/theme)
- [Angular — Accessibility](https://angular.dev/best-practices/a11y)
- [API Platform — Symfony y PostgreSQL](https://api-platform.com/docs/main/symfony/)
- [API Platform — State providers y processors](https://api-platform.com/docs/main/symfony/)
- [Symfony — Doctrine y PostgreSQL](https://symfony.com/doc/current/doctrine.html)
- [MySQL — columnas e índices espaciales](https://dev.mysql.com/doc/refman/8.4/en/creating-spatial-indexes.html)
- [MySQL — distancias sobre una esfera](https://dev.mysql.com/doc/refman/8.4/en/spatial-convenience-functions.html)
- [PostGIS — ST_DWithin](https://postgis.net/docs/ST_DWithin.html)
- [PostGIS — consultas espaciales e índices](https://postgis.net/docs/using_postgis_query.html)
- [Capacitor — Integración con aplicaciones web existentes](https://capacitorjs.com/docs)

## Pendiente

Definir convenciones de Angular, Symfony/API Platform, módulos, contratos de API, esquema de datos y comandos de desarrollo antes de programar. Las versiones compatibles se fijarán al crear el código y se registrarán mediante los gestores de dependencias. Comprobar durante la implementación que las vistas reproducen el prototipo y cumplen accesibilidad y adaptación móvil; estudiar el empaquetado nativo en su entrega.

## Sustituye

Ninguna decisión anterior.

## Sustituido por

No aplica.
