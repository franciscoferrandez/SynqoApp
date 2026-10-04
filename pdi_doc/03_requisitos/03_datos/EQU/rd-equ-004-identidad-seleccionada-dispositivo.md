---
id: RD-EQU-004
estado: en_revision
---

# RD-EQU-004 — Identidad seleccionada en el dispositivo

## Dato / información

Identidad de participante que un navegador recuerda como seleccionada para un equipo.

## Significado

Permite retomar el uso del equipo bajo la última identidad elegida sin repetir la selección en cada acceso. Al crear un equipo, la identidad del primer participante se recuerda automáticamente en el navegador creador. Sin una selección recordada, se debe elegir una identidad existente o crear una nueva antes de ver el contenido del equipo.

## Integridad

La identidad recordada pertenece al equipo correspondiente. Una selección para un equipo no determina la identidad usada en otros equipos; cambiarla en uno actualiza la selección de ese equipo en el navegador.

## Retención / ciclo de vida

Se conserva en el navegador para accesos posteriores mientras el equipo sea accesible. No se ha definido un plazo adicional de conservación local ni una sincronización entre navegadores o dispositivos.

## Privacidad

La selección recordada en un navegador no vincula de forma exclusiva a ese participante con una persona o cuenta.

## Origen

Decisiones expresas de quien impulsa Synqo sobre conservar en el navegador la última identidad de trabajo, permitir cambiarla y seleccionar automáticamente la del primer participante al crear el equipo.

## Relaciones

- [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md)
- [RN-EQU-001 — Actuación bajo identidad de participante](../../02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md)
