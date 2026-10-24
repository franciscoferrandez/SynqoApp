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
| [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md) | VALIDADO | [SPEC-CON-005 — Calendario en consultas de fechas](../../08_especificaciones/99_archivadas/spec-con-005-calendario-en-consultas-fechas.md); [SPEC-CON-006 — Crear consultas desde el calendario con el diálogo compartido](../../08_especificaciones/99_archivadas/spec-con-006-crear-consulta-dialogo-calendario.md) | [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md); [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md) | Creación desde Calendario con diálogo compartido; la entrada desde Consultas se sustituyó por el Change validado de separación de entradas, preferencias, sin recuentos ni tick y con campanita. Desde Calendario abre en el mes visible, vacío y guarda hacia Consultas. Validación local; sin despliegue. |
| [RF-CON-007 — Editar una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-007-editar-consulta-fechas.md) | VALIDADO | [SPEC-CON-005 — Calendario en consultas de fechas](../../08_especificaciones/99_archivadas/spec-con-005-calendario-en-consultas-fechas.md) | [RN-CON-005 — Fechas propuestas desde hoy](../../03_requisitos/02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md); [RN-CON-008 — Edición de opciones y conservación de votos](../../03_requisitos/02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md); [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_requisitos/03_datos/CON/rd-con-006-ultima-edicion-consulta.md) | Título, altas y retiradas de fechas, incluidas pasadas, conservación de votos y confirmación específica validados con API/WEB/E2E. Sin modificar evento ni vínculo. |
| [RF-CON-006 — Editar una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-006-editar-consulta-texto.md) | VALIDADO | [SPEC-CON-004 — Editar una consulta con opciones de texto](../../08_especificaciones/99_archivadas/spec-con-004-editar-consulta-texto.md) | [RN-CON-008 — Edición de opciones y conservación de votos](../../03_requisitos/02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md); [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_requisitos/03_datos/CON/rd-con-006-ultima-edicion-consulta.md); menú de acciones de [SPEC-EVT-005 — Acciones en fichas de eventos y consultas](../../08_especificaciones/99_archivadas/spec-evt-005-acciones-eventos-consultas.md) | Change cerrado y validado localmente, asignado a esta entrega después de su cierre. Pendiente de revisión de la persona impulsora; sin commit ni despliegue. |

## Ajustes validados — 2026-10-24

La evidencia histórica anterior se conserva. Las evoluciones posteriores están cerradas y validadas localmente con evidencia propia:

| Change | Estado delivery | Preparación y alcance |
|---|---|---|
| [SPEC-CON-007 — Separar las entradas de creación de consultas por tipo](../../08_especificaciones/99_archivadas/spec-con-007-entradas-creacion-por-tipo.md) | VALIDADO | Commit `6beb62a`; verificación original 43 unitarias y 182 E2E. Consultas crea opciones libres directamente y Calendario crea fechas. Regresión final 191/191 E2E y 136/136 visuales PASS; SPEC cerrada y archivada. |
| [SPEC-CON-008 — Consultas activas y archivadas por vigencia calculada](../../08_especificaciones/99_archivadas/spec-con-008-consultas-activas-archivadas.md) | VALIDADO | Commit `c90a369`; verificación original API 210 tests/2206 assertions y WEB 51 unitarias. Regresión final API 219 tests/2394 assertions, WEB 61 unitarias, 191/191 E2E y 136/136 visuales PASS; SPEC cerrada y archivada. |

La entrada de creación de fechas desde Consultas descrita en la evidencia histórica queda sustituida por el Change de separación de entradas enlazado arriba. Ambos Changes de esta entrega están cerrados, con criterios PASS y revisión independiente REVIEW_OK; capturas actualizadas y trazabilidad reparada. La validación local no acredita despliegue ni permite declarar la entrega ENTREGADA.

## Evolución de consultas de fechas

[SPEC-CON-005 — Calendario en consultas de fechas](../../08_especificaciones/99_archivadas/spec-con-005-calendario-en-consultas-fechas.md) está cerrada y validada localmente con diez criterios PASS, API completa 198 tests/2071 assertions, WEB 33 tests y E2E focalizados, relacionados y reales. Revisión independiente REVIEW_OK. El build pasa con aviso de 503,04 kB sobre el presupuesto de aviso de 500 kB, sin ampliarlo. Evidencia del cierre original sin commit ni despliegue; actualización posterior de referencias y commit registrada abajo. La reutilización posterior desde el calendario principal se valida en [SPEC-CON-006 — Crear consultas desde el calendario con el diálogo compartido](../../08_especificaciones/99_archivadas/spec-con-006-crear-consulta-dialogo-calendario.md), descrita a continuación.

## Evidencia y pendientes

[SPEC-CON-006 — Crear consultas desde el calendario con el diálogo compartido](../../08_especificaciones/99_archivadas/spec-con-006-crear-consulta-dialogo-calendario.md) está cerrada y VALIDADO localmente: ocho criterios PASS, 43 unitarias WEB, lint/formato/build PASS (inicial 494,97 kB), 58 E2E focalizados distintos y 33 de regresión desde Consultas. Recorridos reales, preferencias y disponibilidad PASS, incluido crear y resolver con evento vinculado en PostgreSQL. Revisión independiente REVIEW_OK. Reutiliza el diálogo desde el botón del calendario principal: mes visible, selección vacía y guardado directo hacia Consultas. Pendiente de revisión local de la persona impulsora; sin commit ni despliegue.

La matriz y los comandos ejecutados de [SPEC-CON-004 — Editar una consulta con opciones de texto](../../08_especificaciones/99_archivadas/spec-con-004-editar-consulta-texto.md) registran nueve criterios PASS, API completa con 185 tests y 1781 assertions, 26 tests WEB y 80 casos E2E nuevos y relacionados. La evidencia posterior de consultas de fechas se registra en su sección anterior. Checks estáticos, formato, build, esquema y revisión independiente PASS. Esta evidencia acredita validación local, sin modificar el estado documental de los requisitos.

La persona impulsora confirma la implementación de [SPEC-CON-005 — Calendario en consultas de fechas](../../08_especificaciones/99_archivadas/spec-con-005-calendario-en-consultas-fechas.md) tras probarla en local el 2026-10-21; ese Change no tiene pendientes funcionales ni de aceptación local. La revisión de edición de texto se mantiene según su fila de alcance. La omisión visual original queda sustituida por la autorización y ejecución de 2026-10-23 registradas abajo; el despliegue sigue pendiente. No se declara la release entregada.

## Actualización visual y publicación — 2026-10-23

La persona impulsora autoriza expresamente actualizar toda la suite de snapshots y aprueba visualmente lo probado en local. Con NVM activado desde raíz, `npm --prefix apps/web run test:visual:update`: **136/136 PASS**, móvil 390×844 y escritorio 1280×800, ambos temas. Se actualizan 44 referencias y se adaptan las fixtures al diálogo compartido y a los menús de acciones; la confirmación visual de fechas corresponde al descarte del borrador. Corregidos permisos locales de capturas antiguas sin cambiar producto.

El commit funcional `b7ef024` conserva los Changes previos y supera los hooks API/WEB. Esta actualización de referencias va en un commit posterior; la comparación sin actualización vuelve a ejecutarse en el hook de subida y el resultado del CI se comprueba después de publicar. Las menciones anteriores a omisión visual o ausencia de commit describen la evidencia original de los cierres. Sin evidencia de despliegue ni declaración ENTREGADA.

## Coordinación de entregas y despliegue

Esta entrega y [REL-004 — Eventos del equipo](rel-004-eventos-del-equipo.md) avanzan en paralelo, agrupando las SPEC por el alcance al que contribuyen. Pueden desplegarse juntas en una misma versión de la aplicación. Cada entrega mantiene su alcance, dependencias, evidencia y cierre propios; un despliegue compartido no acredita automáticamente la validación ni el cierre de ambas.

Si una SPEC contribuye a ambas entregas, se referencia el mismo documento desde ambas, explicitando la contribución y las dependencias. Las SPEC de eventos ya asignadas a REL-004 conservan su asignación, aunque afecten a consultas. No se duplican ni se trasladan por abrir esta entrega.

## Estados permitidos

DEFINIDO / PLANIFICADO / ESPECIFICADO / EN_IMPLEMENTACION / IMPLEMENTADO / VALIDADO / ENTREGADO / BLOQUEADO / POSPUESTO / DESCARTADO

## Criterio de entregable

Con un equipo vigente y una identidad seleccionada, cualquier participante puede editar el título y las opciones de una consulta de texto abierta conforme al requisito enlazado: conservar los votos restantes, impedir renombrar opciones votadas, confirmar únicamente su retirada con votos y mostrar la última edición efectiva. Según el Change de separación de entradas enlazado en Alcance, Consultas abre directamente la creación de opciones libres y las fechas se crean solo desde el calendario principal, mediante el diálogo inicialmente vacío en el mes visible y con navegación posterior a Consultas. La edición de fechas sigue disponible desde su ficha. Las consultas cerradas conservan su comportamiento. La clasificación y carga de listas del Change enlazado en Alcance están validadas con su contrato y evidencia propios; el despliegue sigue pendiente.

Antes de declarar la entrega ENTREGADA deben estar verificadas las SPEC incluidas, resueltos sus pendientes de revisión y regresión visual y registrado el despliegue con evidencia del alcance entregado. Los ajustes que se añadan posteriormente deberán actualizar esta tabla y el criterio de entregable.
