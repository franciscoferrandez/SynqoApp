# Synqo

Synqo es una aplicación para tomar decisiones en grupo sin que las propuestas y respuestas se pierdan entre mensajes de chat. Cada equipo reúne la disponibilidad diaria de sus participantes en un calendario que ayuda a identificar fechas viables. Después, el grupo puede proponer esas fechas en una consulta y votar; también puede decidir sobre opciones de texto, como una actividad o una canción.

El uso básico está pensado para empezar en minutos: crear un equipo, compartir su enlace y participar sin registro. Las respuestas son visibles para el equipo y una consulta termina al aceptar una o varias opciones o rechazarla.

Este proyecto forma parte de un trabajo de fin de máster sobre desarrollo con IA. La inteligencia artificial se utiliza como apoyo para analizar, diseñar, documentar y, en fases posteriores, implementar y verificar. Las decisiones de producto y tecnología las valida la persona impulsora.

> **Estado actual:** definición y preparación de la demo local. Todavía no hay aplicación implementada, demo pública ni comandos de arranque.

---

## Índice

- [Objetivo](#objetivo)
- [Primera entrega](#primera-entrega)
- [Funcionamiento previsto](#funcionamiento-previsto)
- [Tecnologías y arquitectura](#tecnologías-y-arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo local](#desarrollo-local)
- [Calidad y reglas de implementación](#calidad-y-reglas-de-implementación)
- [Máster desarrollo IA](#máster-desarrollo-ia)
- [Evolución futura](#evolución-futura)

---

## Objetivo

Facilitar que varias personas encuentren una fecha y tomen decisiones compartidas desde un lugar común. La disponibilidad pertenece al equipo y se actualiza con independencia de las consultas; el calendario sirve para reconocer las fechas prometedoras antes de proponerlas. La [visión de Synqo](pdi_doc/01_producto/01_vision/vision.md) y el [problema de coordinación](pdi_doc/01_producto/02_problema-oportunidad/problema-coordinacion-disponibilidad.md) desarrollan este propósito.

## Primera entrega

La primera entrega será una **demo operativa en un entorno local de desarrollo**. Permitirá crear equipos y participantes, abrir un equipo desde otro navegador mediante un enlace, indicar disponibilidad por día, consultar el calendario y crear, votar y resolver consultas de fechas o de opciones de texto. Los datos deberán persistir. El alcance y su seguimiento están en [REL-001 — Demo local operativa de Synqo](pdi_doc/01_producto/10_entregas/rel-001-demo-local-operativa.md).

El envío real de correo, la publicación en Internet y una aplicación móvil instalable quedan para entregas posteriores. La web de esta demo sí se diseñará para navegadores móviles.

## Funcionamiento previsto

1. Una persona crea un equipo indicando el nombre del equipo y el del primer participante.
2. Comparte el enlace; quien entra elige una identidad existente o crea otra.
3. Los participantes marcan su disponibilidad diaria. El calendario resume las marcas del equipo.
4. Una persona crea manualmente una consulta con fechas seleccionadas o con opciones de texto.
5. El equipo vota de forma visible y puede cambiar sus votos mientras la consulta siga abierta.
6. Una persona con acceso resuelve la consulta aceptando una o varias opciones, o la rechaza.

El [alcance conceptual](pdi_doc/01_producto/04_alcance/alcance-conceptual.md) recoge las reglas y límites de estas capacidades. La dirección de la interfaz puede explorarse desde el [índice de mockups](pdi_doc/04_experiencia-usuario/06_mockups/index.html); los mockups son una referencia visual y no una aplicación funcional.

## Tecnologías y arquitectura

| Parte | Tecnología prevista | Función |
|---|---|---|
| Web | Angular 21, TypeScript y Node 24 LTS | Interfaz adaptable, navegación y estado visual. |
| API | PHP 8.5, Symfony 7.4 LTS y API Platform 5 | Casos de uso, reglas compartidas y contrato HTTP. |
| Datos | PostgreSQL 18 | Persistencia de equipos, disponibilidades y consultas. |
| Desarrollo local | Docker Compose para API y base de datos; Angular local | Arranque reproducible de la demo. |

La web consumirá recursos JSON de la API; los errores seguirán Problem Details y OpenAPI describirá el contrato. La arquitectura busca aplicar SOLID, arquitectura limpia y DDD de forma pragmática: las reglas del dominio y los casos de uso no dependen de Angular, HTTP ni Doctrine. Los detalles y motivos están en las [tecnologías de la demo](pdi_doc/06_arquitectura/08_tecnologias/demo-local.md), los [principios de implementación](pdi_doc/07_desarrollo/01_principios-y-convenciones/arquitectura-limpia-y-ddd.md) y la [convención HTTP](pdi_doc/06_arquitectura/03_modulos/API/convencion-http.md).

## Estructura del proyecto

```text
pdi_doc/                    documentación de producto y solución de Synqo
pdi/                    plugin reutilizable de diseño e implementación
doc/tfm/                materiales del trabajo de fin de máster
README.md
```

Este es el repositorio [SynqoApp](https://github.com/franciscoferrandez/SynqoApp). Las carpetas `web/` y `api/` se crearán aquí al implementar las primeras especificaciones.

## Desarrollo local

Todavía no hay dependencias de aplicación ni comandos ejecutables. [SPEC-COO-001 — Base visual y navegación de Synqo](pdi_doc/08_especificaciones/spec-coo-001-base-visual-y-navegacion.md) preparará la web, sus instrucciones de instalación y los hooks locales. [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](pdi_doc/08_especificaciones/spec-equ-001-arranque-equipo-local.md) añadirá la API, PostgreSQL, migraciones y comandos de prueba. Al implementarlas, esta sección recogerá los pasos reales para arrancar la demo desde un clon limpio.

## Calidad y reglas de implementación

- **Código y arquitectura:** mantener reglas y casos de uso separados de los adaptadores; introducir interfaces cuando protejan una frontera real. Reutilizar en Angular los layouts, temas y componentes que comparten comportamiento. Véanse las [reglas de API](pdi_doc/07_desarrollo/08_modulos/API/README.md) y [WEB](pdi_doc/07_desarrollo/08_modulos/WEB/README.md).
- **Comprobaciones:** PHP CS Fixer, PHPStan y Rector para la API; ESLint con `angular-eslint`, Prettier y compilación estricta para la web. El hook previo al commit comprobará y bloqueará, sin aplicar correcciones automáticas. Los comandos de corrección serán explícitos, según los [controles estáticos](pdi_doc/07_desarrollo/03_calidad/controles-estaticos-demo-local.md).
- **Pruebas:** reglas puras, integración con PostgreSQL, recorridos entre navegadores y revisión de accesibilidad WCAG 2.2 AA en las superficies implementadas, según la [estrategia de pruebas](pdi_doc/07_desarrollo/02_testing/estrategia-demo-local.md).
- **Cambios:** avanzar por especificaciones preparadas, comprobar cada incremento antes de cerrarlo y usar la [convención de commits](pdi_doc/07_desarrollo/04_git/convencion-commits.md) en todo el repositorio.

## Máster desarrollo IA

El [registro de ayuda de la IA a la toma de decisiones](doc/tfm/registro-decisiones-ia.md) resume hitos verificables en entradas breves: qué problema se abordó, qué aportó la IA y qué decisión se tomó. Su primera entrada describe la creación del plugin PDI y el problema de separación entre framework reutilizable y documentación de producto que resuelve. El [PDF de documentación del TFM](doc/tfm/Documentacion-TFM-2.pdf) se conserva en la misma carpeta.

El método PDI, sus skills y plantillas se encuentran en [pdi/](pdi/README.md). El [índice de trazabilidad](pdi_doc/00_gobierno/11_trazabilidad.md) permite seguir las relaciones directas entre las especificaciones preparadas y los artefactos que las sustentan.

## Evolución futura

Después de la demo local se prevén un piloto publicado, el envío opcional del enlace por correo y una aplicación móvil instalable. También se ha registrado la necesidad de sustituir un enlace de acceso comprometido. Las posibilidades adicionales, como notas, etiquetas o consultas de respuesta única, permanecen fuera de la primera entrega y no están aprobadas como funciones inmediatas. Véase el [alcance conceptual](pdi_doc/01_producto/04_alcance/alcance-conceptual.md).
