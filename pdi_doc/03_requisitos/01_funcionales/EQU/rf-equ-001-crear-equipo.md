---
id: RF-EQU-001
estado: en_revision
---

# RF-EQU-001 — Crear un equipo sin registro

## Requisito

El sistema debe permitir crear desde un formulario directo un equipo con nombre y primer participante, sin exigir registro ni inicio de sesión.

## Origen

- [HU-EQU-001 — Crear un equipo sin registro](../../../01_producto/07_historias-usuario/hu-equ-001-crear-equipo.md)
- Decisión expresa de quien impulsa Synqo: al crear el equipo son obligatorios su nombre y el del primer participante; el formulario se muestra directamente al abrir Synqo sin un enlace de equipo.
- Decisión expresa de quien impulsa Synqo: el primer participante queda seleccionado automáticamente en el navegador creador. Por defecto, tras crear el equipo se muestra una confirmación con acceso al calendario; una configuración interna puede omitir ese paso.

## Precondiciones

Ninguna cuenta es necesaria para iniciar la creación.

## Criterios de aceptación

- Una persona sin cuenta puede crear un equipo y comenzar a usarlo.
- Para crear el equipo es obligatorio escribir un nombre de hasta 50 caracteres según [RD-EQU-006 — Nombre del equipo](../../03_datos/EQU/rd-equ-006-nombre-equipo.md).
- Para crear el equipo es obligatorio escribir el nombre del primer participante, de hasta 50 caracteres según [RD-EQU-001 — Identidad de participante del equipo](../../03_datos/EQU/rd-equ-001-identidad-participante.md); el equipo comienza con esa identidad disponible y seleccionada automáticamente en el navegador creador.
- Al terminar la creación se muestra por defecto una confirmación con el enlace del equipo y una acción para entrar al calendario bajo la identidad recién seleccionada, sin pedir que vuelva a seleccionarla.
- Una configuración interna puede desactivar la confirmación y llevar directamente al calendario tras crear el equipo.
- El equipo creado recibe un UUID único según [RD-EQU-007 — Identificador del equipo](../../03_datos/EQU/rd-equ-007-identificador-equipo.md) y dispone de un enlace de acceso único que puede compartirse. Su nombre puede coincidir con el de otro equipo.
- El enlace puede copiarse y, si el dispositivo lo permite, compartirse mediante su diálogo de compartir.

## Casos límite

Si falta el nombre del equipo o el del primer participante, no se completa la creación. El diálogo del dispositivo es opcional cuando no está disponible. El enlace creado no admite invalidación ni sustitución en la primera entrega, según [RF-EQU-003 — Acceder al equipo por enlace](rf-equ-003-acceder-por-enlace.md).

## Relaciones

- [RF-EQU-003 — Acceder al equipo por enlace](rf-equ-003-acceder-por-enlace.md)
- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](rf-equ-006-enviar-enlace-por-correo.md)
- [RN-EQU-005 — Equipo con al menos un participante](../../02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md)
- [RD-EQU-006 — Nombre del equipo](../../03_datos/EQU/rd-equ-006-nombre-equipo.md)
- [RD-EQU-007 — Identificador del equipo](../../03_datos/EQU/rd-equ-007-identificador-equipo.md)
