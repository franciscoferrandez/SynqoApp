---
id: RF-EQU-008
estado: en_revision
---
# RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción

## Requisito

En la preproducción, el sistema debe mostrar en la pantalla de creación de equipos un temporizador con el tiempo restante hasta la próxima restauración horaria de los dos equipos de demostración. Los equipos creados por personas usuarias se conservan entre resets y siguen sujetos a las reglas normales de caducidad y borrado.

## Origen

Decisión inicial de quien impulsa Synqo: limpieza y precarga horaria de preproducción con temporizador. **Evolución aprobada el 2026-10-12:** el reset horario afecta únicamente a los equipos demo y conserva los grupos creados por personas usuarias, para permitir su uso persistente. Esta decisión sustituye el alcance global de borrado anterior; no cambia la cadencia UTC ni las reglas normales de retención.

## Criterios de aceptación

- El temporizador se presenta dentro del bloque de demo en la pantalla de creación de equipos de preproducción.
- El temporizador también se presenta en la barra superior general de las pantallas de equipo.
- El temporizador indica el tiempo restante hasta el siguiente punto de hora UTC, cuando está programado el reset.
- El horario del reset usa UTC.
- El reinicio elimina y vuelve a cargar únicamente los datos de los dos equipos identificados inequívocamente como demo, conforme a [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md).
- El reset conserva íntegros los equipos no demo y sus datos dependientes, incluso si tienen el mismo nombre que un equipo demo; no altera el pool separado de control de creación.
- El aviso y el temporizador indican que se reinician los equipos de ejemplo; no atribuyen el reinicio a los grupos creados por usuarios.
- La persistencia de los equipos no demo sigue [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md) y [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).
- En este piloto no se requiere una indicación especial ni recuperación funcional cuando el cron se retrase o falle; el temporizador sigue su ciclo horario.

## Decisiones pendientes

- No hay decisiones funcionales pendientes para esta capacidad. El comportamiento de Railway Cron ante retrasos o ejecuciones omitidas se documenta en [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../../../05_investigacion-y-decisiones/01_research/resr-coo-003-railway-iac-preproduccion.md) y se acepta como limitación del piloto.

**Gate afectado:** baseline funcional de la siguiente REL y preparación de cambios de experiencia y operación de preproducción.

## Relaciones

- [RF-EQU-001 — Crear un equipo sin registro](rf-equ-001-crear-equipo.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
