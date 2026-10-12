---
id: REL-003
estado: planificada
---
# REL-003 — Estabilización de Synqo

## Objetivo de entrega

Estabilizar y completar la presentación y el uso del producto entregado, atendiendo de forma incremental los gaps detectados durante su uso. Cada Change tendrá un despliegue independiente. La lista de trabajo puede ampliarse conforme aparezcan y se prioricen nuevas necesidades.

## Alcance

| Elemento | Estado delivery | SPEC | Dependencias | Notas |
|---|---|---|---|---|
| Aplicar la identidad gráfica aprobada: logotipo, isotipo, iconos de aplicación y recursos decorativos | PLANIFICADO | — | [Dirección visual inicial de Synqo](../../04_experiencia-usuario/04_direccion-visual/direccion-visual-synqo.md); [Sistema de diseño inicial de Synqo](../../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md) | Partir de la brandboard existente e incluir los tamaños habituales de icono y los elementos gráficos/gradientes de fondo necesarios. La aprobación humana de la persona impulsora será el único criterio de aceptación del resultado visual; no se sustituirá por una puntuación o aprobación automática. Los tamaños y entregables concretos se precisarán al preparar el Change. |
| Revisar el criterio y los datos de la fixture del reset demo | VALIDADO | [SPEC-EQU-008 — Hacer verosímil y variada la disponibilidad del juego demo](../../08_especificaciones/99_archivadas/spec-equ-008-disponibilidad-fixture-demo.md) | [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../../08_especificaciones/99_archivadas/spec-equ-004-juego-demo-reset-horario.md); [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../../08_especificaciones/99_archivadas/spec-equ-006-juego-demo-preproduccion.md); [ADR-EQU-004 — Derivar credenciales estables para los equipos demo](../../05_investigacion-y-decisiones/05_adr/adr-equ-004-credenciales-estables-equipos-demo.md) | Change cerrado y verificado localmente. La aplicación de nuevas disponibilidades se hará al desplegar el cambio; no se declara REL-003 entregada. |
| Definir e incorporar más opciones de visualización del calendario propio y del equipo | PLANIFICADO | — | [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md); [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md); [Sistema de diseño inicial de Synqo](../../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md) | El visor actual ya alterna Equipo/Mi disponibilidad y mes/semanas completas. Las vistas adicionales concretas y sus diferencias de interacción se definirán antes de implementar; esta fila cubre la evaluación, diseño y entrega de las opciones que se acuerden. |
| Definir e incorporar reglas adicionales para calcular la disponibilidad agregada del equipo | PLANIFICADO | — | [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md); [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md) | La regla vigente resume el peor estado indicado (no disponible, quizá, disponible). Las reglas alternativas, cómo se elegirán/mostrarán y si coexistirán con la actual están por definir. Al cambiar la regla de negocio se actualizará el baseline antes de preparar el Change de implementación. |
| Otras correcciones aceptadas de comportamiento ya definido que se detecten durante la estabilización | DEFINIDO | — | [REL-002 — Preproducción pública en Railway](rel-002-preproduccion-publica-railway.md) | Se podrán añadir conforme aparezcan, se entiendan y se prioricen. Cada corrección será un Change independiente y enlazará los requisitos, decisiones y módulos afectados. Los cambios de comportamiento deseado requieren actualizar el baseline y revisar esta REL antes de implementarse. |

## Estados permitidos

DEFINIDO / PLANIFICADO / ESPECIFICADO / EN_IMPLEMENTACION / IMPLEMENTADO / VALIDADO / ENTREGADO / BLOQUEADO / POSPUESTO / DESCARTADO

## Criterio de entregable

Cada fila de REL-003 se desarrolla como Change con alcance propio, se verifica, converge y se cierra conforme a PDI, y puede desplegarse independientemente a `main`. REL-003 se declara entregada cuando todos los Changes incorporados expresamente a su alcance estén cerrados y desplegados, y la persona impulsora confirme que el conjunto acordado de estabilización está completo. La aparición de nuevos incidentes después del cierre se tratará en otra REL o en una actualización explícita de delivery.

## Alcance fuera de esta entrega

- Funcionalidad nueva o un cambio de comportamiento deseado que no esté definido en el baseline, hasta que se apruebe su actualización mediante `pdi:baseline-update` y se revise el alcance.
- Una reimplementación global de la arquitectura o una evolución mayor del producto no justificada por un defecto concreto.
