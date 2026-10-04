---
id: ADR-COO-002
estado: aprobado
---

# ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático

## Contexto

La demo reúne reglas propias de equipos, disponibilidad y consultas. La persona que impulsa Synqo quiere afianzar la aplicación de SOLID, arquitectura limpia y principios de Domain-Driven Design (DDD) en Angular y Symfony/API Platform, sin añadir sobreingeniería. La estructura tecnológica está decidida en [ADR-COO-001 — Separar interfaz web y API para la demo local](adr-coo-001-estructura-demo-local.md).

## Drivers

- El lenguaje y las reglas existentes en el [glosario de coordinación](../../02_dominio/01_glosario-dominio/glosario-coordinacion.md) y el [modelo conceptual](../../02_dominio/02_modelo-conceptual/modelo-coordinacion.md) deben reconocerse en el código.
- El acceso, la caducidad, la disponibilidad, los votos y la resolución necesitan pruebas de reglas sin depender de HTTP ni de una base de datos.
- [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) es una demo local que debe avanzar sin ceremonias ni abstracciones carentes de uso.
- La interfaz Angular debe reproducir la dirección visual validada y permitir una futura aplicación móvil basada en la web, sin duplicar la autoridad del servidor sobre las reglas compartidas.

## Opciones consideradas

| Opción | Ventaja | Coste |
|---|---|---|
| Reglas dentro de recursos API, entidades Doctrine y componentes Angular | Menos estructura inicial. | Acopla comportamiento, transporte y persistencia; dificulta probar reglas y cambiar adaptadores. |
| Núcleo de dominio y casos de uso separados, con puertos y adaptadores donde existe una frontera real | Conserva reglas comprobables y permite sustituir o simular dependencias externas. | Exige decidir límites y mapear datos entre capas. |
| Arquitectura hexagonal completa con puerto, adaptador y modelo separado para toda operación | Uniformidad formal. | Multiplica archivos y traducciones incluso donde no protegen ninguna regla o evolución prevista. |

## Decisión

Se adopta la segunda opción como dirección arquitectónica para la demo. El código buscará aplicar SOLID mediante responsabilidades cohesionadas, dependencias explícitas e inversión de dependencias en fronteras que lo justifiquen. El dominio y los casos de uso no dependerán de Angular, API Platform, Symfony HTTP ni de Doctrine. La infraestructura y la presentación adaptarán esos casos de uso a persistencia y transporte.

La arquitectura hexagonal aporta el patrón de puertos y adaptadores, especialmente para persistencia, reloj y futuras integraciones externas; no exige crear una interfaz por cada clase ni una capa vacía para cada operación. En el servidor, API Platform expondrá contratos HTTP y sus proveedores o procesadores podrán invocar casos de uso; Doctrine implementará la persistencia. En la web, los componentes Angular coordinarán interacción y presentación mediante servicios o adaptadores de API, sin convertirse en fuente normativa de las reglas compartidas.

Se aplicarán los principios de DDD de forma proporcionada: usar el lenguaje del dominio en código y pruebas, modelar explícitamente las invariantes que lo requieran y delimitar agregados o contextos solo cuando se descubra una frontera real. Los códigos documentales EQU, DIS y CON no se convierten automáticamente en tres contextos delimitados, proyectos o servicios independientes. Un objeto de valor, repositorio o servicio de dominio se introduce por una regla o variación concreta, no por cumplir una plantilla.

La estructura de carpetas, interfaces, agregados y casos de uso de cada capacidad se concretará en su SPEC antes de implementarla. Toda excepción a la dirección de dependencias deberá justificarse en el Change correspondiente.

## Consecuencias positivas

- Las reglas centrales pueden probarse sin levantar navegador ni base de datos.
- La persistencia y el contrato HTTP pueden evolucionar sin convertirse en la definición del dominio.
- El proyecto sirve al objetivo de aprendizaje con decisiones visibles y justificadas.

## Consecuencias negativas

- Hay que mantener mapeos y límites entre API, aplicación, dominio y persistencia.
- Una aplicación pequeña puede perder velocidad si se crean puertos, DTO o agregados sin necesidad; por eso cada abstracción debe responder a una responsabilidad o prueba concreta.
- La separación no garantiza por sí sola buen modelado: los límites se revisarán al implementar reglas reales.

## Evidencia / Research

- [Eric Evans — DDD Reference](https://www.domainlanguage.com/ddd/reference/): lenguaje y patrones del dominio.
- [Alistair Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/): puertos y adaptadores para aislar la aplicación de dispositivos externos.
- [API Platform — Symfony y arquitectura limpia](https://api-platform.com/docs/main/symfony/): proveedores y procesadores propios para separar modelo público e interno.
- [Symfony — Service Container](https://symfony.com/doc/current/service_container.html): dependencias explícitas y servicios inyectables.

## Pendiente

Concretar en los módulos WEB y API las primeras unidades de dominio, aplicación y adaptadores cuando se prepare [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](../../08_especificaciones/spec-equ-001-arranque-equipo-local.md). No se decide todavía el número de contextos delimitados ni la forma final de los agregados.

## Sustituye

Ninguna decisión anterior.

## Sustituido por

No aplica.
