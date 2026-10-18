---
id: REL-004
estado: en_implementacion
---

# REL-004 — Eventos del equipo

## Objetivo de entrega

Permitir que un equipo organice sus eventos en una sección propia, consulte los eventos fechados en el calendario y vincule una consulta de fechas abierta a un evento para trasladarle la fecha acordada. La entrega incluye el ciclo de creación, edición, rechazo y recuperación del evento.

## Alcance

| Elemento | Estado delivery | SPEC | Dependencias | Notas |
|---|---|---|---|---|
| [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md) | VALIDADO | [SPEC-EVT-001 — Gestión de eventos del equipo](../../08_especificaciones/99_archivadas/spec-evt-001-gestion-eventos-equipo.md) | [RD-EVT-001 — Datos del evento](../../03_requisitos/03_datos/EVT/rd-evt-001-datos-evento.md); [RD-EVT-002 — Autoría y momentos del evento](../../03_requisitos/03_datos/EVT/rd-evt-002-autoria-momentos-evento.md); [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md); [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md) | Creación, edición y ficha del evento validadas en local; aún sin despliegue. |
| [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md) | ESPECIFICADO | [SPEC-EVT-001 — Gestión de eventos del equipo](../../08_especificaciones/99_archivadas/spec-evt-001-gestion-eventos-equipo.md); [SPEC-EVT-003 — Vincular eventos y consultas de fechas](../../08_especificaciones/01_activas/spec-evt-003-vinculo-evento-consulta.md) | [RD-EVT-001 — Datos del evento](../../03_requisitos/03_datos/EVT/rd-evt-001-datos-evento.md); [RD-EVT-002 — Autoría y momentos del evento](../../03_requisitos/03_datos/EVT/rd-evt-002-autoria-momentos-evento.md); [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md) | Lista y ficha de gestión independiente validadas en local. Abrir consultas vinculadas pertenece a SPEC-EVT-003 y sigue pendiente. |
| [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md) | ESPECIFICADO | [SPEC-EVT-001 — Gestión de eventos del equipo](../../08_especificaciones/99_archivadas/spec-evt-001-gestion-eventos-equipo.md); [SPEC-EVT-003 — Vincular eventos y consultas de fechas](../../08_especificaciones/01_activas/spec-evt-003-vinculo-evento-consulta.md) | [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md); [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md) | Rechazo y recuperación independientes validados en local. El efecto sobre una consulta abierta pertenece a SPEC-EVT-003 y sigue pendiente. |
| [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md) | ESPECIFICADO | [SPEC-EVT-002 — Mostrar eventos en el calendario](../../08_especificaciones/01_activas/spec-evt-002-eventos-en-calendario.md) | [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md); [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md) | Cantidad, indicador y detalle diario definidos en SPEC-EVT-002. |
| [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md) | ESPECIFICADO | [SPEC-EVT-003 — Vincular eventos y consultas de fechas](../../08_especificaciones/01_activas/spec-evt-003-vinculo-evento-consulta.md) | [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md); [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md); [RN-CON-002 — Resolución de una consulta abierta](../../03_requisitos/02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md) | Una sola consulta abierta por evento; las consultas cerradas vinculadas se conservan y siguen visibles. |

## Dependencias de preparación

SPEC-EVT-001 está implementada y validada localmente; todavía no está desplegada. Esa base ya permite avanzar con SPEC-EVT-002 y SPEC-EVT-003. Cada Change mantiene su propio estado de validación y entrega.

## Estados permitidos

DEFINIDO / PLANIFICADO / ESPECIFICADO / EN_IMPLEMENTACION / IMPLEMENTADO / VALIDADO / ENTREGADO / BLOQUEADO / POSPUESTO / DESCARTADO

## Criterio de entregable

Con un equipo vigente, una persona con acceso puede crear y editar eventos, consultarlos en su pestaña por grupos, rechazarlos y recuperarlos, reconocer en el calendario los días con eventos no rechazados y abrir su información desde el detalle del día. Puede asociar un evento elegible a una consulta de fechas al crearla o al resolverla; al aceptar una fecha, el evento recibe el resultado conforme a [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md). El evento conserva visibles sus consultas vinculadas anteriores y admite otra consulta cuando la previa ya no está abierta. La gestión independiente de eventos está validada localmente según SPEC-EVT-001. La integración con calendario y consultas sigue pendiente; esta REL no declara la release entregada.
