---
id: RF-CON-006
estado: en_revision
---

# RF-CON-006 — Editar una consulta con opciones de texto

## Requisito

El sistema debe permitir que cualquier participante con acceso a un equipo vigente edite el título y las opciones de una consulta de texto abierta desde su ficha.

## Origen

Decisiones expresas de la persona impulsora en las rondas interactivas del 2026-10-20 y 2026-10-21: alcance, actores, votos, guardado, autoría, concurrencia y cancelación.

## Precondiciones

Acceso al equipo vigente e identidad de participante del equipo seleccionada. Consulta de texto abierta; no se restringe la edición a quien la creó.

## Criterios de aceptación

- «Editar consulta» se ofrece desde el menú de acciones de su ficha y abre un diálogo con el título y las opciones actuales.
- Puede cambiarse el título aunque haya votos, conservando los votos de las opciones que permanezcan.
- Se pueden añadir opciones al final, cambiar el texto de opciones sin votos y eliminar opciones; no hay reordenación. Se aplica [RN-CON-008 — Edición de opciones y conservación de votos](../../02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md).
- «Guardar consulta» guarda directamente, sin paso general de confirmación. Solo eliminar opciones con votos exige confirmar la retirada de esas opciones y sus votos antes de persistir.
- El resultado conserva los límites y la distinción de opciones de [RD-CON-003 — Título de la consulta](../../03_datos/CON/rd-con-003-titulo-consulta.md), [RD-CON-005 — Texto de opción de una consulta](../../03_datos/CON/rd-con-005-texto-opcion-consulta.md), [RN-CON-003 — Mínimo de una opción por consulta](../../02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md), [RN-CON-006 — Texto único entre opciones de una consulta](../../02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md) y [RN-CON-007 — Máximo de diez opciones por consulta](../../02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md).
- Cancelar o Escape sin cambios cierra directamente; con cambios permite «Seguir editando» o descartarlos, conservando el borrador si se continúa. Ni editar el borrador ni confirmar su descarte modifica datos persistidos.
- La ficha muestra quién hizo la última edición efectiva y cuándo, según [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_datos/CON/rd-con-006-ultima-edicion-consulta.md). La autoría y el momento de creación permanecen intactos.
- Los errores conservan el formulario para corregir o reintentar. Si la consulta ya no admite edición, se informa y se ofrece recargar la ficha; no se guarda parcialmente.
- Una edición efectiva cuenta como modificación del equipo según [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md). Guardar sin cambios, cancelar o fallar no registra una edición ni actividad nueva.

## Casos límite

Las consultas resueltas, rechazadas y de fechas no admiten esta edición. La edición no reabre ni resuelve consultas y no modifica vínculos con eventos. Entre ediciones válidas simultáneas prevalece la última modificación guardada de los campos afectados, sin rechazo por una versión anterior, conforme al comportamiento de eventos expresamente elegido. El estado, los votos y la validez del resultado se comprueban de nuevo al guardar.

## Relaciones

- [FLUJO-CON-005 — Editar una consulta con opciones de texto](../../../04_experiencia-usuario/02_flujos/flujo-con-005-editar-consulta-texto.md).
- [WF-CON-007 — Editar una consulta con opciones de texto](../../../04_experiencia-usuario/03_wireframes/wf-con-007-editar-consulta-texto.md).
