---
id: RN-EQU-004
estado: en_revision
---

# RN-EQU-004 — Nombre de participante único en el equipo

## Regla

Un equipo no admite dos identidades de participante con el mismo nombre. Si un usuario intenta crear una con un nombre que ya corresponde a otra identidad del equipo, el sistema no la crea y le pide otro nombre.

Para comparar nombres se ignoran las diferencias entre mayúsculas y minúsculas, los espacios al principio y al final, y los acentos. Esta comparación determina si el nombre ya está usado; no prescribe cómo se presenta el nombre admitido.

## Justificación

Los usuarios eligen libremente la identidad bajo la que actúan; nombres duplicados harían ambigua esa elección y la atribución visible de los votos.

## Casos límite

«Ana» y « ana » se consideran el mismo nombre; también «José» y «jose». No se ha definido normalización adicional de espacios interiores u otros caracteres.

## Origen

Decisión expresa de quien impulsa Synqo sobre nombres duplicados dentro del equipo.

## Relaciones

- [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md)
- [RD-EQU-001 — Identidad de participante del equipo](../../03_datos/EQU/rd-equ-001-identidad-participante.md)
