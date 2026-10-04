---
id: RF-EQU-002
estado: en_revision
---

# RF-EQU-002 — Incorporarse y elegir identidad de participante

## Requisito

El sistema debe permitir que una persona con acceso a un equipo se incorpore sin registro, seleccione una identidad de participante existente o cree una nueva, recuerde esa selección en el navegador para el equipo y la cambie después.

## Origen

- [HU-EQU-002 — Incorporarse a un equipo](../../../01_producto/07_historias-usuario/hu-equ-002-incorporarse-equipo.md)
- [HU-EQU-003 — Cambiar identidad de participante](../../../01_producto/07_historias-usuario/hu-equ-003-cambiar-identidad.md)

## Precondiciones

La persona dispone del enlace de acceso a un equipo vigente.

## Criterios de aceptación

- La persona puede elegir entre usar una identidad existente del equipo o crear una nueva.
- El nombre de una identidad nueva admite hasta 50 caracteres según [RD-EQU-001 — Identidad de participante del equipo](../../03_datos/EQU/rd-equ-001-identidad-participante.md).
- Si el navegador no recuerda una identidad para ese equipo, la selección o creación se exige antes de mostrar el contenido del equipo.
- Si el equipo no tiene ningún participante, se muestra el diálogo de selección y creación de identidad y no se accede al contenido operativo hasta crear uno, según [RN-EQU-005 — Equipo con al menos un participante](../../02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md).
- Si intenta crear una identidad con un nombre ya usado por otro participante del equipo según [RN-EQU-004 — Nombre de participante único en el equipo](../../02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md), se le pide otro nombre y no se crea la identidad duplicada.
- Puede cambiar la identidad seleccionada sin iniciar sesión.
- Al volver a acceder al mismo equipo desde ese navegador, se conserva la última identidad elegida para ese equipo.
- Al cambiar de identidad en el equipo, la selección recordada para ese equipo se actualiza.

## Casos límite

La comparación ignora mayúsculas, espacios exteriores y acentos. No se ha definido normalización adicional de espacios interiores u otros caracteres. Un equipo caducado no permite continuar con la selección ni acceder a su contenido.

## Relaciones

- [RN-EQU-001 — Actuación bajo identidad de participante](../../02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md)
- [RD-EQU-001 — Identidad de participante del equipo](../../03_datos/EQU/rd-equ-001-identidad-participante.md)
- [RF-EQU-003 — Acceder al equipo por enlace](rf-equ-003-acceder-por-enlace.md)
- [RN-EQU-004 — Nombre de participante único en el equipo](../../02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md)
- [RD-EQU-004 — Identidad seleccionada en el dispositivo](../../03_datos/EQU/rd-equ-004-identidad-seleccionada-dispositivo.md)
- [RN-EQU-005 — Equipo con al menos un participante](../../02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md)
