---
id: RD-EVT-001
estado: en_revision
---

# RD-EVT-001 — Datos del evento

## Dato / información

Cada evento del equipo tiene título, notas opcionales, fecha opcional expresada solo como día y estado de su planificación. Su rechazo no elimina esos datos.

## Significado

El título identifica el plan y admite hasta 250 caracteres. Las notas conservan información en texto plano, pueden quedar vacías y admiten hasta 5000 caracteres. La fecha puede faltar mientras no se asigne o ser provisional o definitiva cuando exista.

## Integridad

La fecha sin asignar solo admite la condición provisional según [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md). El evento pertenece a un equipo. Su autoría y sus momentos se definen en [RD-EVT-002 — Autoría y momentos del evento](rd-evt-002-autoria-momentos-evento.md).

## Retención / ciclo de vida

Rechazar un evento conserva título, notas y fecha; al recuperarlo conserva esa fecha y vuelve a provisional según [RN-EVT-002 — Conservación y recuperación de eventos rechazados](../../02_reglas-negocio/EVT/rn-evt-002-rechazo-recuperacion.md). Al editar solo se conserva el valor actual de los campos; no hay historial de versiones. Al borrar el equipo caducado se eliminan todos sus datos conforme a [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

Las personas con acceso al equipo pueden consultar y gestionar sus eventos. No se ha definido visibilidad fuera del equipo.

## Origen

Petición expresa de la persona que impulsa Synqo para la nueva entrega de eventos.
