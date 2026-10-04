---
id: FLUJO-EQU-001
estado: en_revision
---

# FLUJO-EQU-001 — Entrar en un equipo y elegir identidad

## Actor

[ACT-COO-002 — Usuario con acceso al equipo](../../01_producto/05_actores-personas/act-coo-002-usuario-con-acceso.md). También aplica a [ACT-COO-001 — Persona coordinadora](../../01_producto/05_actores-personas/act-coo-001-persona-coordinadora.md) si vuelve desde un navegador sin identidad recordada; al crear un equipo, la primera identidad queda seleccionada automáticamente en el navegador creador según [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md).

## Entrada

Abrir el enlace de acceso de un equipo rápido.

## Precondiciones

El equipo está vigente y no se exige registro.

## Pasos

1. Synqo comprueba si ese navegador recuerda una identidad de participante para el equipo.
2. Si la recuerda, entra en el calendario de disponibilidad del equipo bajo esa identidad.
3. Si no la recuerda, solicita elegir una identidad existente o crear una nueva antes de mostrar el contenido.
4. Si el equipo no tiene participantes, el diálogo permanece como paso obligatorio hasta crear uno; no se muestra contenido operativo del equipo mientras esté vacío.
5. Al elegir o crear la identidad, la recuerda en ese navegador para el equipo y muestra primero el calendario de disponibilidad.
6. Desde el equipo, la persona puede cambiar de identidad; la nueva selección queda recordada para ese equipo.

## Resultado

El usuario accede primero al calendario del equipo vigente bajo una identidad de participante que puede cambiar sin registrarse.

## Errores

- Si se intenta crear un nombre ya usado según [RN-EQU-004 — Nombre de participante único en el equipo](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md), Synqo solicita otro y no crea la identidad duplicada.
- Si el equipo ha caducado, su enlace muestra una explicación de la caducidad sin permitir acceder al contenido ni recuperar el equipo; esta vista se representa en [WF-EQU-003 — Equipo caducado](../03_wireframes/wf-equ-003-equipo-caducado.md).
- Si el enlace no identifica ningún equipo, incluido uno ya borrado definitivamente, se presenta «No encontramos este equipo», sin datos ni historial del equipo; esta vista se representa en [WF-EQU-004 — Enlace de equipo no encontrado](../03_wireframes/wf-equ-004-enlace-no-encontrado.md).

## Cancelación

Sin elegir o crear una identidad cuando no hay ninguna recordada, no se muestra el contenido del equipo. La salida concreta de esta pantalla se definirá en el diseño de interacción.

## RF/RN relacionados

- [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../03_requisitos/01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md)
- [RN-EQU-004 — Nombre de participante único en el equipo](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md)
- [RN-EQU-005 — Equipo con al menos un participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md)
