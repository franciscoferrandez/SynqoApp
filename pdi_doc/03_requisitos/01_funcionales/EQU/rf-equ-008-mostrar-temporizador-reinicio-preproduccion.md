---
id: RF-EQU-008
estado: en_revision
---
# RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción

## Requisito

En la preproducción, el sistema debe mostrar en la pantalla de creación de equipos un temporizador con el tiempo restante hasta la próxima limpieza y precarga horaria del contenido de aplicación de la base de datos.

## Origen

Decisión expresa de quien impulsa Synqo: la base de preproducción se limpiará y precargará cada hora, y el usuario verá un temporizador para el próximo reinicio.

## Criterios de aceptación

- El temporizador se presenta dentro del bloque de demo en la pantalla de creación de equipos de preproducción.
- El temporizador también se presenta en la barra superior general de las pantallas de equipo.
- El temporizador indica el tiempo restante hasta el siguiente punto de hora UTC, cuando está programado el reset.
- El horario del reset usa UTC.
- El reinicio borra el contenido de aplicación de preproducción y precarga los datos del juego de prueba conforme a [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md).
- En este piloto no se requiere una indicación especial ni recuperación funcional cuando el cron se retrase o falle; el temporizador sigue su ciclo horario.

## Decisiones pendientes

- No hay decisiones funcionales pendientes para esta capacidad. El comportamiento de Railway Cron ante retrasos o ejecuciones omitidas se documenta en [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../../../05_investigacion-y-decisiones/01_research/resr-coo-003-railway-iac-preproduccion.md) y se acepta como limitación del piloto.

**Gate afectado:** baseline funcional de la siguiente REL y preparación de cambios de experiencia y operación de preproducción.

## Relaciones

- [RF-EQU-001 — Crear un equipo sin registro](rf-equ-001-crear-equipo.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
