---
id: REL-005
estado: en_implementacion
---

# REL-005 — Ajustes de funcionalidad de consultas

## Objetivo de entrega

Agrupar ajustes funcionales de consultas, comenzando por la edición del título y las opciones de las consultas de texto abiertas. La entrega se abre por petición expresa de la persona impulsora el 2026-10-21. Cada ajuste posterior se incorporará con su alcance y SPEC preparados; esta apertura no autoriza funcionalidades adicionales.

## Alcance

| Elemento | Estado delivery | SPEC | Dependencias | Notas |
|---|---|---|---|---|
| [RF-CON-006 — Editar una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-006-editar-consulta-texto.md) | VALIDADO | [SPEC-CON-004 — Editar una consulta con opciones de texto](../../08_especificaciones/99_archivadas/spec-con-004-editar-consulta-texto.md) | [RN-CON-008 — Edición de opciones y conservación de votos](../../03_requisitos/02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md); [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_requisitos/03_datos/CON/rd-con-006-ultima-edicion-consulta.md); menú de acciones de [SPEC-EVT-005 — Acciones en fichas de eventos y consultas](../../08_especificaciones/99_archivadas/spec-evt-005-acciones-eventos-consultas.md) | Change cerrado y validado localmente, asignado a esta entrega después de su cierre. Pendiente de revisión de la persona impulsora; sin commit ni despliegue. |

## Evidencia y pendientes

La matriz y los comandos ejecutados están en la SPEC: nueve criterios PASS, API completa con 185 tests y 1781 assertions, 26 tests WEB y 80 casos E2E nuevos y relacionados. Checks estáticos, formato, build, esquema y revisión independiente PASS. Esta evidencia acredita validación local, sin modificar el estado documental de los requisitos.

Las regresiones visuales están omitidas por instrucción expresa y pendientes antes del cierre de la entrega. La revisión de la persona impulsora y el despliegue siguen pendientes. No se declara la release entregada.

## Coordinación de entregas y despliegue

Esta entrega y [REL-004 — Eventos del equipo](rel-004-eventos-del-equipo.md) avanzan en paralelo, agrupando las SPEC por el alcance al que contribuyen. Pueden desplegarse juntas en una misma versión de la aplicación. Cada entrega mantiene su alcance, dependencias, evidencia y cierre propios; un despliegue compartido no acredita automáticamente la validación ni el cierre de ambas.

Si una SPEC contribuye a ambas entregas, se referencia el mismo documento desde ambas, explicitando la contribución y las dependencias. Las SPEC de eventos ya asignadas a REL-004 conservan su asignación, aunque afecten a consultas. No se duplican ni se trasladan por abrir esta entrega.

## Estados permitidos

DEFINIDO / PLANIFICADO / ESPECIFICADO / EN_IMPLEMENTACION / IMPLEMENTADO / VALIDADO / ENTREGADO / BLOQUEADO / POSPUESTO / DESCARTADO

## Criterio de entregable

Con un equipo vigente y una identidad seleccionada, cualquier participante puede editar el título y las opciones de una consulta de texto abierta conforme al requisito enlazado: conservar los votos restantes, impedir renombrar opciones votadas, confirmar únicamente su retirada con votos y mostrar la última edición efectiva. Las consultas cerradas y de fechas mantienen su comportamiento.

Antes de declarar la entrega ENTREGADA deben estar verificadas las SPEC incluidas, resueltos sus pendientes de revisión y regresión visual y registrado el despliegue con evidencia del alcance entregado. Los ajustes que se añadan posteriormente deberán actualizar esta tabla y el criterio de entregable.
