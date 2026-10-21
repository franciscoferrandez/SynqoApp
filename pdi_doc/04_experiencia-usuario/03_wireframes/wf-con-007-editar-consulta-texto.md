---
id: WF-CON-007
estado: en_revision
---

# WF-CON-007 — Editar una consulta con opciones de texto

## Flujo

[FLUJO-CON-005 — Editar una consulta con opciones de texto](../02_flujos/flujo-con-005-editar-consulta-texto.md).

## Estado representado

Ficha de consulta de texto abierta. «Editar consulta» en el menú de acciones abre un diálogo siguiendo los controles de [WF-CON-006 — Crear una consulta con opciones de texto](wf-con-006-crear-consulta-texto.md).

## Jerarquía

```text
Editar consulta
Título breve [Título actual                         ]
Opciones · hasta 10
[Texto sin votos                  ] [Eliminar]
[Texto con votos, solo lectura    ] [Eliminar]
  Tiene votos; su texto no puede modificarse.
[Opción marcada para retirar     ] [Deshacer]
[+ Añadir opción]
                         [Cancelar] [Guardar consulta]

Solo al retirar opciones con votos:
Eliminar opciones y sus votos
• [Opción] · [N votos]
Se eliminarán estas opciones y todos sus votos.
Las demás selecciones se conservan.
[Volver a editar] [Eliminar opciones y guardar]
```

## Acciones

- Editar título y textos permitidos, añadir al final, marcar retiradas y deshacerlas. Una fila marcada se distingue también mediante texto; no depende solo del color.
- Guardar directamente; confirmación únicamente para retirar opciones votadas. Volver desde esa confirmación mantiene el borrador.
- Cancelar/Escape directamente si no hay cambios; con cambios, ofrecer continuar o descartar según el flujo. Foco inicial en el título; al cerrar, retorno al menú de acciones.
- Mostrar errores por campo y resumen accesible conservando el formulario. Las opciones que reciban votos durante la edición se actualizan como bloqueadas cuando el servidor informe del conflicto, permitiendo recuperar su texto vigente sin perder el resto del borrador.
- Ficha: «Última edición: [participante] · [momento]» solo si existe, también tras cerrar la consulta. No se añade historial de versiones.

## Notas

Conservar tokens, temas y controles nativos existentes. Adaptar el diálogo y sus acciones a móvil, con desplazamiento interior cuando haga falta. Las reglas y efectos se definen en [RF-CON-006 — Editar una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-006-editar-consulta-texto.md) y [RN-CON-008 — Edición de opciones y conservación de votos](../../03_requisitos/02_reglas-negocio/CON/rn-con-008-edicion-opciones-votos.md).
