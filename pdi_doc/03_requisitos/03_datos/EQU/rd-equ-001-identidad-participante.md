---
id: RD-EQU-001
estado: en_revision
---

# RD-EQU-001 — Identidad de participante del equipo

## Dato / información

Identidades de participante creadas dentro de cada equipo y denominación con la que pueden seleccionarse.

## Significado

Una identidad representa a un participante del equipo; un usuario con acceso puede actuar bajo ella. No equivale a una cuenta de usuario.

## Integridad

Cada identidad pertenece a un equipo y puede usarse para atribuir disponibilidad, votos y resolución de consultas de ese mismo equipo. La primera se crea con el equipo y este debe contar con al menos una identidad para funcionar, según [RN-EQU-005 — Equipo con al menos un participante](../../02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md). Su nombre admite hasta 50 caracteres y no se duplica dentro del equipo, según [RN-EQU-004 — Nombre de participante único en el equipo](../../02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md), que ignora mayúsculas, espacios exteriores y acentos al comparar.

## Retención / ciclo de vida

Al caducar el equipo, la identidad queda inaccesible y se elimina con los demás datos del equipo según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

La identidad figura junto a los votos visibles en el equipo. La visibilidad fuera del equipo no está definida.

## Origen

- [ACT-COO-002 — Usuario con acceso al equipo](../../../01_producto/05_actores-personas/act-coo-002-usuario-con-acceso.md)
