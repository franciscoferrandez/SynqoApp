---
id: FLUJO-CON-005
estado: en_revision
---

# FLUJO-CON-005 — Editar una consulta con opciones de texto

## Actor

Cualquier persona con acceso al equipo vigente e identidad de participante seleccionada.

## Entrada

Ficha de una consulta de texto abierta, menú hamburguesa, «Editar consulta».

## Precondiciones

Las de [RF-CON-006 — Editar una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-006-editar-consulta-texto.md).

## Pasos

1. La persona abre el diálogo de edición. Se cargan el título y las opciones actuales, conservando sus identidades. Las opciones con votos muestran el texto de solo lectura y una explicación; siguen ofreciendo la retirada.
2. Cambia el título, modifica textos sin votos, añade opciones al final o marca opciones para retirar. Las opciones marcadas siguen siendo parte del borrador hasta guardar; se permite deshacer esa retirada. Se respetan los límites de creación, el orden relativo y la distinción de textos.
3. Activa «Guardar consulta». Si se eliminarán opciones con votos, se presentan sus títulos y votos actuales y se pide confirmar que se eliminarán junto con todos sus votos. Volver desde esa confirmación conserva el borrador y no escribe.
4. Si no hay opciones votadas por retirar, o después de confirmar su retirada, Synqo valida y guarda conjuntamente la edición. No hay otra confirmación general.
5. El diálogo se cierra, se actualizan la ficha, los recuentos y la lista, y el foco retorna al disparador de acciones. La ficha muestra el participante y momento de última edición, conservando la creación.

## Resultado

Consulta abierta editada conforme a [RN-CON-008 — Edición de opciones y conservación de votos](../../03_requisitos/02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md). Solo una edición efectiva modifica la última edición y la actividad del equipo.

## Errores

- Validación de título, opciones o duplicados: indicar los campos y conservar el borrador sin escribir.
- Una opción modificada recibe votos antes de guardar: conservar el formulario, señalar la opción bloqueada y permitir recuperar su texto actual o cancelar; no guardar parcialmente los demás cambios.
- Una opción por retirar recibe votos sin que su retirada estuviera confirmada: pedir confirmar esa retirada antes de guardar; conservar el borrador.
- Otra edición elimina una opción que se pretendía modificar, o la consulta se cierra: informar que la acción ya no es válida y ofrecer recargar la ficha, conservando el formulario hasta que se decida abandonarlo. No reabrir ni recrear automáticamente opciones eliminadas.
- Dos cambios válidos simultáneos de un campo no generan un aviso por versión: prevalece el último guardado de ese campo, como en eventos. Los cambios de otros campos no incluidos en la edición se conservan.
- Fallo de servicio: conservar el formulario para reintentar. Equipo caducado o pérdida de acceso: aplicar el recorrido común de acceso sin guardar.

## Cancelación

Cancelar o Escape sin cambios cierra directamente y devuelve foco al disparador. Con cambios abre la confirmación de descarte, con «Seguir editando» enfocado inicialmente y «Descartar cambios» para abandonar. La continuación conserva título, filas, orden y marcas de retirada. Abrir y cancelar el diálogo o la confirmación de retirada no cambia consultas ni votos.

## RF/RN relacionados

- [RD-CON-006 — Autoría y momento de última edición de la consulta](../../03_requisitos/03_datos/CON/rd-con-006-ultima-edicion-consulta.md).
- [WF-CON-007 — Editar una consulta con opciones de texto](../03_wireframes/wf-con-007-editar-consulta-texto.md).
