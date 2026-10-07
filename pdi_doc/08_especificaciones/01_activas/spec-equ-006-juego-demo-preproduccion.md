---
id: SPEC-EQU-006
nivel: N3
estado: preparacion
release: REL-002
---
# SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción

## Objetivo

Publicar el juego de ejemplo en la preproducción y ejecutar de forma horaria el mismo proceso de restauración preparado para desarrollo local, con los enlaces y temporizador visibles para quien prueba la aplicación.

## Scope

- Reutilizar la fixture y el comando `app:demo:reset` de [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md).
- Configurar el job de Railway para ejecutar el reset en preproducción a cada hora en punto UTC.
- Publicar enlaces directos a los dos equipos en el bloque de demo de la pantalla de creación e informar que se borran los cambios en el siguiente reset.
- Mostrar el tiempo al siguiente punto horario UTC en ese bloque y en la barra superior general de las pantallas de equipo.
- Preservar el pool de control de creación de [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md).

## Fuera de scope

- Crear o cambiar la fixture y el comportamiento local manual del reset, definidos por [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md).
- Desplegar la aplicación, conectar la fuente, crear recursos Railway o cambiar configuración real de cuenta.
- Automatizar el despliegue de la aplicación.
- Recuperar automáticamente una ejecución Cron retrasada o fallida; el temporizador continúa hacia la siguiente hora.

## Baseline relacionado

- [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md)
- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](../../03_requisitos/01_funcionales/EQU/rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
- [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md)
- [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md)
- [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md)
- [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](spec-coo-006-railway-iac-operacion-rel-002.md)

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md): lectura de enlaces demo y datos del siguiente reset.
- [WEB](../../06_arquitectura/03_modulos/WEB/README.md): bloque demo en creación y temporizador compartido.
- Operación: Cron configurado en IaC por [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](spec-coo-006-railway-iac-operacion-rel-002.md).

## Criterios de aceptación

1. Tras desplegar la aplicación y la infraestructura de preproducción, Railway ejecuta `app:demo:reset --force --no-interaction` con schedule `0 * * * *` UTC.
2. El perfil de reset remoto exige `APP_ENV=prod`, `SYNQO_DEPLOYMENT_ENV=preproduction`, `DEMO_RESET_ENABLED=true` y la conexión privada de PostgreSQL del entorno de preproducción; una configuración ausente/incorrecta falla cerrada y no modifica datos. `--force` no omite estas guardas.
3. La ejecución utiliza la misma lógica de restauración y fixture implementada y probada en SPEC-EQU-004; una ejecución fallida no deja borrado parcial ni toca el pool de SPEC-EQU-005. La verificación manual en preproducción comprueba que las filas vigentes de `team_creation_origin_event` siguen intactas tras el reset.
4. En la pantalla de creación se muestran el aviso de borrado horario y enlaces a “La mesa del jueves” y “La banda del patio”. Los enlaces permiten usar los equipos como equipos normales hasta el siguiente reset.
5. El bloque de demo y la barra superior de las pantallas de equipo muestran el tiempo hasta el siguiente punto horario UTC.
6. Si el job se retrasa o falla, no se muestra un estado de error especial ni se bloquea la aplicación; la cuenta atrás continúa hacia la siguiente hora UTC.
7. Los enlaces y tokens de acceso no se exponen en logs; las respuestas de metadatos de demo no se almacenan en caché.
8. Antes de habilitar el schedule recurrente, la operación se verifica en la preproducción desplegada: reset manual con protección de las filas vigentes del pool, comprobación de routing/IP de cliente confiable (o su omisión segura mientras no se valide el proxy), ejecución de `app:creation-limits:purge` que elimina vencidas y conserva vigentes, y disponibilidad del comando en el Cron cada cinco minutos UTC configurado por SPEC-COO-006. Se registra la evidencia runtime de cada integración.

## Dependencias y gate de ejecución

Este Change no bloquea la implementación local de SPEC-EQU-004. Su verificación end-to-end y la activación del Cron requieren que el servicio HTTP y PostgreSQL de preproducción estén desplegados conforme a SPEC-COO-006 y que se haya satisfecho el gate de clasificación/transferencia definido por [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](spec-coo-005-licencia-propietaria-rel-002.md). No se conectará ni enviará código a Railway durante esta preparación.

## Questions / Assumptions

- La hora de reset es cada hora en punto UTC; retrasos u omisiones del Cron son una limitación aceptada para el piloto.
- El dataset y el proceso de restauración son propiedad de SPEC-EQU-004. Esta SPEC solo los activa en el entorno desplegado y presenta su acceso.
- La activación recurrente se hace después de que la aplicación esté desplegada y la primera ejecución se haya verificado manualmente.

## Design / Structure

Railway ejecutará un proceso Cron separado con la misma imagen WEB/API, en vez de ejecutar el comando dentro del proceso HTTP. El job pasa las guardas de preproducción y reutiliza `app:demo:reset`; no duplica el borrado ni la fixture. La API expondrá en preproducción los enlaces de acceso y el instante del próximo límite horario. WEB dibujará la cuenta atrás desde ese instante tanto en creación como en la barra superior. El endpoint no-cache no inferirá si el reset se ejecutó realmente: esta entrega acepta que el contador avance aunque el Cron falle.

## Plan por slices

1. Definir y probar el contrato de metadatos públicos del juego demo y los enlaces/token estables en modo preproducción.
2. Añadir en WEB el bloque de enlaces/aviso y el temporizador común; comprobar los breakpoints usuales y los controles automatizados de accesibilidad del proyecto.
3. Configurar en IaC el Cron horario con guards explícitos, mismo artefacto y cierre de conexiones.
4. Después del despliegue de preproducción, verificar enlaces, reset manual, schedule y temporizador; activar la cadencia recurrente solo tras la verificación.

## Evidencia / Validation

Esta SPEC separa los criterios que requieren una aplicación desplegada de la carga local cubierta por SPEC-EQU-004 y el control funcional local cubierto por SPEC-EQU-005. No se han creado recursos Railway ni probado un Cron remoto. Las pruebas locales de UI/contrato pueden prepararse antes; la validación final de reset/pool, routing/IP y los Cron de demo y purga necesita el entorno preproducción desplegado y el gate de source-transfer cerrado.

## Convergence

**DoR: en preparación.** No es prerequisito para implementar ni verificar el reset local de SPEC-EQU-004 ni el control funcional local de SPEC-EQU-005. La integración de preproducción y su evidencia runtime —incluida preservación del pool, routing/IP y purga de orígenes— queda vinculada al despliegue y a la autorización de transferencia de fuente.

## Resultado de cierre

Pendiente de preparación, implementación, verificación y cierre PDI.
