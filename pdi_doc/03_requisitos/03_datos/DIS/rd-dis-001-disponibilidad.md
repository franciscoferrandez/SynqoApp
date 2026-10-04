---
id: RD-DIS-001
estado: en_revision
---

# RD-DIS-001 — Disponibilidad vigente por día

## Dato / información

Disponibilidad indicada bajo una identidad de participante para un día de su equipo.

## Significado

Expresa disponible, quizá, no disponible o sin marcar, con independencia de cualquier consulta.

## Integridad

La marca se asocia al equipo, al participante de ese equipo y al día correspondiente. Al desmarcar, el valor vigente vuelve a «sin marcar».

## Retención / ciclo de vida

El valor vigente puede cambiar mientras el equipo esté vigente, el usuario tenga acceso y el día sea hoy o posterior conforme a [RN-DIS-001 — Disponibilidad diaria del equipo](../../02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md). Una marca de un día pasado permanece consultable, pero no se edita. No se ha definido conservación de valores anteriores. Al caducar el equipo, la disponibilidad queda inaccesible y se elimina con los demás datos del equipo según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

El calendario muestra un resumen y recuentos de las marcas del equipo. Al consultar un día se muestran los participantes agrupados por el estado que marcaron.

## Origen

- [RN-DIS-001 — Disponibilidad diaria del equipo](../../02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md)
