---
id: JOURNEY-COO-001
estado: en_revision
---

# JOURNEY-COO-001 — Coordinar una fecha en equipo

## Actores

- [ACT-COO-001 — Persona coordinadora](../05_actores-personas/act-coo-001-persona-coordinadora.md)
- [ACT-COO-002 — Usuario con acceso al equipo](../05_actores-personas/act-coo-002-usuario-con-acceso.md)

## Trabajos relacionados

- [JTBD-COO-001 — Encontrar una fecha viable en equipo](../06_jtbd/jtbd-coo-001-encontrar-fecha.md)
- [JTBD-CON-001 — Acordar una opción en equipo](../06_jtbd/jtbd-con-001-acordar-opcion-equipo.md)

## Disparador

Un grupo necesita encontrar una fecha para un evento concreto sin perder la coordinación entre mensajes de chat.

## Etapas

1. Una persona abre Synqo sin enlace, escribe el nombre del equipo y el suyo como primer participante y crea el equipo sin registro. En la demo local puede indicar opcionalmente un correo, pero se le avisa de que no se enviará ningún mensaje y la dirección se descartará, según [REL-001 — Demo local operativa de Synqo](../10_entregas/rel-001-demo-local-operativa.md). El envío real queda para otra entrega.
2. Otras personas reciben el enlace de acceso al equipo. Si el navegador aún no recuerda una identidad para ese equipo, seleccionan una existente o crean una nueva antes de ver su contenido. El navegador recuerda la identidad elegida en visitas posteriores.
3. Los usuarios indican disponibilidad por día en representación de un participante del equipo, con independencia de las consultas. Pueden cambiar de identidad para registrar la disponibilidad comunicada por otra persona; el navegador recuerda la nueva selección para ese equipo.
4. Al entrar en el equipo se muestra primero el calendario de disponibilidad, que ayuda a identificar posibles fechas.
5. Una persona inicia una consulta de fechas desde el calendario, sin necesidad de revisar antes ningún día; selecciona las fechas pulsándolas en el calendario y puede recorrer meses. Escribe un título y confirma la creación.
6. Los usuarios responden a la consulta bajo la identidad de un participante seleccionando una o varias fechas. Las respuestas quedan registradas y el equipo puede ver qué ha votado cada participante.
7. Un usuario con acceso al equipo resuelve la consulta en representación de un participante: acepta una o varias opciones propuestas, o rechaza la consulta.

Mientras el equipo está vigente, se muestra su fecha prevista de caducidad. Cada modificación del equipo reinicia el plazo de tres meses naturales; abrir el enlace sin modificar nada no lo reinicia.

## Resultado

El equipo reúne disponibilidades, votos públicos por participante y la resolución de la consulta en un espacio común.

## Errores y abandonos

En la entrega posterior con correo real, si falla el envío opcional del enlace, el equipo sigue creado y se muestra el enlace con un aviso para que pueda copiarse o compartirse. No se ha definido qué sucede si una persona no llega a ver la invitación, no se incorpora o deja la consulta sin responder. Este recorrido no presupone otros avisos ni recordatorios.

**Origen:** flujo descrito por la persona que impulsa Synqo y [alcance conceptual](../04_alcance/alcance-conceptual.md).
