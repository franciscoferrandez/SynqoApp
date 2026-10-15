---
id: RF-EQU-008
estado: en_revision
---
# RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción

## Requisito

En la preproducción, el sistema debe mostrar en las pantallas del equipo demo un temporizador con el tiempo restante hasta la próxima restauración horaria de los dos equipos de demostración. La portada de creación no presenta el temporizador. Los equipos creados por personas usuarias se conservan entre resets y siguen sujetos a las reglas normales de caducidad y borrado.

## Origen

Decisión inicial de quien impulsa Synqo: limpieza y precarga horaria de preproducción con temporizador. **Evolución aprobada el 2026-10-12:** el reset horario afecta únicamente a los equipos demo y conserva los grupos creados por personas usuarias, para permitir su uso persistente. **Evolución aprobada el 2026-10-14:** esta frontera selectiva también se exige al comando en desarrollo y producción; producción puede habilitar un Cron horario independiente como preproducción, sin que esta decisión cree o despliegue ese entorno. No existe un perfil que borre todos los equipos. Estas decisiones sustituyen el alcance global de borrado anterior; no cambian las reglas normales de retención.

## Criterios de aceptación

- La pantalla de creación solo enlaza a los equipos demo, sin aviso ni temporizador de reset.
- El temporizador también se presenta en la barra superior general de las pantallas de equipo.
- El temporizador indica el tiempo restante hasta el siguiente punto de hora UTC, cuando está programado el reset.
- El temporizador y el aviso de reset horario solo se muestran en las pantallas de equipo cuando el entorno tiene configurado un Cron activo. Mostrar enlaces demo en la portada no promete un reset programado.
- El horario del reset usa UTC.
- El reinicio elimina y vuelve a cargar únicamente los datos de los dos equipos identificados inequívocamente como demo, conforme a [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md).
- En cualquier entorno, toda invocación de `app:demo:reset` elimina datos únicamente de los dos equipos demo indicados por `DEMO_TEAM_IDS` y cuya identidad demo se verifica; nunca elimina datos de otros equipos. Una lista ausente, inválida, parcial o que no corresponda a los equipos demo esperados no produce cambios.
- La inicialización de los equipos demo no elimina ni modifica equipos que ya existan. Informa sus UUID para poder configurar `DEMO_TEAM_IDS` antes de los resets posteriores.
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
