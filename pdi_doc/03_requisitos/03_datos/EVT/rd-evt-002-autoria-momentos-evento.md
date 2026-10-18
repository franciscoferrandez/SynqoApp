---
id: RD-EVT-002
estado: en_revision
---

# RD-EVT-002 — Autoría y momentos del evento

## Dato / información

Identidad de participante y momento de creación del evento; tras su primera modificación real, identidad de participante y momento de su última modificación.

## Significado

Permiten saber quién creó el evento y cuándo, así como quién registró su cambio más reciente y cuándo ocurrió.

## Integridad

El participante identificado pertenece al equipo del evento. La creación conserva su autoría y momento propios. Antes del primer cambio real no hay dato de última modificación ni se muestra ese campo; para ordenar el evento se usa el momento de creación. Después, el dato de última modificación describe el cambio más reciente sin constituir un historial de versiones. Si una consulta de fechas asigna una fecha al evento, la última modificación se atribuye al participante que resolvió esa consulta. Vincular, cambiar o quitar una consulta sin modificar los campos propios del evento no altera este dato ni su orden basado en él.

## Retención / ciclo de vida

Los datos acompañan al evento mientras exista el equipo y se eliminan con los demás datos del equipo caducado según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md). No se conservan versiones anteriores de autoría o momento de última modificación.

## Privacidad

Las personas con acceso al equipo pueden ver esos participantes y momentos en la ficha del evento. No se ha definido visibilidad fuera del equipo.

## Origen

Decisión expresa de la persona que impulsa Synqo de mostrar participante y momento de creación y de última modificación, sin historial de versiones.

## Relaciones

- [RF-EVT-002 — Listar y consultar eventos](../../01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md)
