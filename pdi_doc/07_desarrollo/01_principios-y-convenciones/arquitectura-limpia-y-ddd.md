# Arquitectura limpia y DDD en la implementación

## Origen y alcance

Esta guía aplica [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md) en la demo. Las reglas específicas se completan en [WEB — reglas de implementación](../08_modulos/WEB/README.md) y [API — reglas de implementación](../08_modulos/API/README.md).

## Criterios de diseño

- Dar a cada unidad una responsabilidad reconocible y dependencias explícitas. Separar una interfaz cuando protege un caso de uso de una dependencia externa o permite una sustitución o prueba concreta; no crearla automáticamente por cada clase.
- Mantener el vocabulario de equipo, participante, disponibilidad, consulta, voto y resolución del [glosario de coordinación](../../02_dominio/01_glosario-dominio/glosario-coordinacion.md) en nombres, pruebas y contratos. Si la implementación revela un concepto nuevo o contradictorio, revisar el baseline antes de consolidarlo.
- Proteger en el núcleo las invariantes que tienen reglas propias. Las restricciones de base de datos complementan esas reglas ante concurrencia; no constituyen por sí solas el modelo de dominio.
- Hacer que la representación HTTP, la persistencia y la interfaz dependan de los casos de uso y del modelo cuando corresponda. Los casos de uso no deben necesitar una petición HTTP, una entidad Doctrine ni un componente visual para ejecutar una regla compartida.
- Introducir puertos para fronteras reales como persistencia, reloj y futuras integraciones. Los adaptadores implementan esos puertos con Symfony, API Platform, Doctrine u otros mecanismos elegidos. Para operaciones simples, preferir menos traducciones cuando no se pierda una regla ni una frontera útil.
- En Angular, mantener separados estado visual y comunicación con la API. La actualización optimista responde a una interacción, pero la confirmación y las reglas compartidas pertenecen al servidor; el error restaura el estado anterior según los requisitos.
- Modelar agregados y contextos delimitados al identificar invariantes y lenguaje que los hagan necesarios. Las áreas documentales no son una partición obligatoria del código ni de los despliegues.

## Revisión de cada incremento

La SPEC debe señalar qué regla se implementa, qué unidad la protege, qué frontera externa existe y qué evidencia la comprueba. Si una abstracción adicional no permite explicar mejor una regla, cambiar una dependencia o probar un caso real, se simplifica. La verificación de un Change comprobará comportamiento y dirección de dependencias, no el número de capas o interfaces.
