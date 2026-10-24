---
id: RD-CON-004
estado: en_revision
---

# RD-CON-004 — Momento de creación de la consulta

## Dato / información

Momento en que se crea una consulta del equipo.

## Significado

Identifica cuándo se creó la consulta y aporta la vigencia de las abiertas que siguen activas, conforme a [RF-CON-008 — Listar consultas por vigencia](../../01_funcionales/CON/rf-con-008-listar-consultas-vigencia.md). Las resueltas, rechazadas y consultas de fechas vencidas usan las fuentes de vigencia allí definidas.

## Integridad

Cada consulta conserva su momento de creación. Los votos, la resolución y la edición posteriores no lo modifican, aunque su vigencia y ubicación calculadas pueden cambiar por estado o fechas. La edición se atribuye separadamente según [RD-CON-006 — Autoría y momento de última edición de la consulta](rd-con-006-ultima-edicion-consulta.md).

## Retención / ciclo de vida

El dato pertenece a la consulta; queda inaccesible al caducar el equipo y se elimina con él según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

Se utiliza como una de las fuentes de vigencia de la lista visible a las personas con acceso al equipo. La tarjeta muestra la fecha de vigencia; no se exige mostrar la hora exacta de creación.

## Origen

Decisión expresa de quien impulsa Synqo sobre creación y, el 2026-10-24, sustitución del orden por estado por listas de vigencia calculada.

## Relaciones

- [WF-CON-001 — Lista de consultas del equipo](../../../04_experiencia-usuario/03_wireframes/wf-con-001-lista-consultas.md)
