---
id: MOCKUP-EQU-003
estado: en_revision
---

# MOCKUP-EQU-003 — Entrada excepcional sin participantes

## Propósito

Revisar el paso obligatorio que impide usar un equipo vigente mientras no tenga al menos una identidad de participante.

## Vista

[Abrir propuesta navegable](prototipo-equipo-sin-participantes.html).

## Flujo y estado

La vista sigue [WF-EQU-001 — Elección de identidad al entrar](../03_wireframes/wf-equ-001-entrada-identidad.md) y [RN-EQU-005 — Equipo con al menos un participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md). Se conoce el nombre del equipo, pero no se muestra contenido operativo. El diálogo no ofrece elegir una identidad existente ni cerrarse porque el equipo no tiene participantes.

## Componentes y aspecto

**DIRECCIÓN VALIDADA:** diálogo obligatorio sobre la cabecera del equipo, sin contenido operativo detrás y con una sola acción principal, «Crear y entrar al equipo». El campo solicita un nombre de hasta 50 caracteres y muestra un error si se intenta continuar vacío. Al crear una identidad, se recuerda en el navegador y se abre el calendario. El prototipo usa un equipo ilustrativo. La validación de esta dirección procede de la respuesta expresa de quien impulsa Synqo. La versión anterior al límite del campo se conserva en [revisiones/prototipo-equipo-sin-participantes-20261003-013547.html](revisiones/prototipo-equipo-sin-participantes-20261003-013547.html).

La versión previa a asociar la identidad recordada a un UUID ilustrativo se conserva en [revisiones/prototipo-equipo-sin-participantes-20261003-013950.html](revisiones/prototipo-equipo-sin-participantes-20261003-013950.html).

## Revisión pendiente

- Comprobar redacción final y disposición en móvil y escritorio.
- Comprobar foco inicial, retención del foco, ampliación y contraste antes de aprobar el aspecto.
