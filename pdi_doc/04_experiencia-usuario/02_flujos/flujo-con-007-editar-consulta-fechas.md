---
id: FLUJO-CON-007
estado: en_revision
---

# FLUJO-CON-007 — Editar una consulta de fechas

## Actor

Cualquier participante con acceso al equipo vigente e identidad seleccionada.

## Entrada

Ficha de una consulta de fechas abierta, menú de acciones, «Editar consulta».

## Precondiciones

Las de [RF-CON-007 — Editar una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-007-editar-consulta-fechas.md).

## Pasos

1. Se carga el título y las opciones actuales, con sus identidades. El calendario marca las fechas incluidas, también pasadas. Solo muestra el resultado del equipo y lee semanas completas y regla locales; no muestra recuentos, votos ni contadores, ni cambia preferencias.
2. La persona cambia el título, selecciona fechas nuevas desde hoy o marca fechas originales para retirar, incluidas pasadas. Volver a seleccionar una original deshace la retirada recuperando identidad y votos; desmarcar una nueva anula su alta. Cambiar de mes conserva el borrador y no apila fechas en una lista.
3. «Guardar consulta» guarda directamente cuando no se retiran opciones votadas. Si se retiran, un diálogo de confirmación identifica las fechas y advierte que se eliminan todos sus votos. Volver a editar mantiene el borrador; confirmar autoriza únicamente esas retiradas.
4. Se comprueban estado, opciones y votos actuales, y se guardan conjuntamente los cambios. Las fechas originales conservadas no se invalidan por haber pasado; la condición de hoy o futuro se aplica solo a las altas. No se trasladan votos entre fechas.
5. Se cierra el diálogo y se actualiza la ficha. Las opciones conservadas mantienen orden relativo, identidad y votos; las altas se añaden al final. Se muestra participante y momento de última edición efectiva; el foco retorna al disparador de acciones.

## Resultado

Consulta abierta editada según [RN-CON-008 — Edición de opciones y conservación de votos](../../03_requisitos/02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md), con actividad y última edición solo si hubo cambios efectivos. El evento y su vínculo permanecen sin cambios.

## Errores

- Título, cantidad o fechas inválidas: señalar el error y conservar el formulario sin guardar parcialmente.
- Una opción por retirar recibe votos sin confirmación previa: solicitar confirmación para esa retirada y conservar el borrador. Si ya se confirmó esa opción, un cambio en su número de votos no exige otra confirmación.
- La consulta se cierra o el resultado entra en conflicto con el estado vigente: informar y ofrecer recargar la ficha, conservando el formulario hasta abandonarlo. No reabrir automáticamente. Una retirada ya aplicada no vuelve a eliminar votos ni constituye por sí sola un conflicto. Las altas se validan con sus IDs y fechas frente al estado actual; no se traslada el significado ni los votos de una opción existente.
- Ediciones válidas simultáneas: último guardado en campos afectados, sin bloqueo por versión; conservar los campos no incluidos, como en texto y eventos.
- Fallo de servicio: mantener el borrador para reintentar. Acceso perdido o equipo caducado: seguir el recorrido común sin guardar.

## Cancelación

Cancelar o Escape sin cambios cierra directamente. Con cambios, ofrecer «Seguir editando» inicialmente y «Descartar cambios». Continuar conserva título, altas y retiradas. Cancelar el formulario o volver desde una confirmación no modifica votos ni consulta.

## RF/RN relacionados

- [RN-CON-005 — Fechas propuestas desde hoy](../../03_requisitos/02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md).
- [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_requisitos/03_datos/CON/rd-con-006-ultima-edicion-consulta.md).
- [WF-CON-008 — Crear y editar consultas de fechas en un diálogo](../03_wireframes/wf-con-008-calendario-dialogo-consultas-fechas.md).
