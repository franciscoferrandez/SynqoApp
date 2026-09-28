# CR-002 — Transición de contexto y retirada por segunda pulsación

## Status

`Implemented`

## Problem

SCR-12 ya define un Calendario mensual y una Lista semanal, pero no fijaba la transformación concreta entre ambos contextos. Además, la retirada se exponía como acción explícita «Sin respuesta» en el selector de calendario.

## Current baseline

La especificación de calendario y el wireframe 04 establecen el mes como periodo principal del Calendario y la semana como agrupación principal de la Lista. CR-001 autoriza que retirar una disponibilidad elimine su entrada propia y la UI aún expone una acción «Sin respuesta» independiente.

## Proposed change

- Al pasar Lista → Calendario: mostrar el mes actual si la semana visible contiene hoy; en otro caso, el mes que contiene el lunes de esa semana.
- Al pasar Calendario → Lista: mostrar la semana actual si el mes visible contiene hoy; en otro caso, la primera semana del mes visible.
- En Lista y en el diálogo del Calendario, activar de nuevo el estado ya seleccionado retirará la entrada propia mediante la operación de borrado ya aprobada; no se mostrará una cuarta opción ni se persistirá `UNANSWERED`.

## Reason

La vista calendario mensual y la Lista semanal ya estaban diseñadas; esta CR hace determinista la transición entre sus anclas temporales. La misma acción de selección permite tanto declarar como retirar sin añadir un estado visual adicional.

## Impact

### Product

Mantiene los tres estados declarables y la ausencia derivada; solo concreta el cambio de contexto y el gesto de retirada.

### Requirements

Aclara `RF-DIS-04`, `RF-DIS-07` y `RNF-US-07` para los cambios de vista entre intervalos de distinta granularidad.

### UX

Lista y diálogo conservan los tres iconos y retiran el valor al repetir la pulsación del icono activo. El día actual permanece perceptible cuando esté visible.

### Domain

Sin cambio: `UNANSWERED` sigue derivado de la ausencia de `AvailabilityEntry`.

### API

Sin cambio de contrato: la retirada sigue usando `DELETE /teams/{teamRef}/availability/me/{date}`.

### Data

Sin migración ni cambio de esquema.

### Security

Sin cambio: la retirada usa sesión contextual, CSRF y clave de idempotencia.

### Testing

Añadir cobertura de los intervalos de consulta mensual, las transiciones Lista/Calendario y la retirada por segunda pulsación en ambas interacciones.

### Documentation

Actualizar SPEC-003, CR-001 (sustituir la acción explícita), baseline, guía docente, trazabilidad y evidencia.

## Alternatives

1. Mantener el calendario semanal y «Sin respuesta» explícito.
2. Mostrar el mes completo pero conservar una acción separada para retirar.
3. Persistir un cuarto estado, descartado porque contradice la ausencia derivada.

## Decision

Aceptada por el propietario el 2026-09-28: se adoptan las transiciones de intervalo descritas y la retirada por segunda pulsación del estado activo. El calendario mensual procede de la especificación y wireframe existentes, no de esta CR.

## Affected files

`specs/SPEC-003-*`, `project/design-baseline.md`, `changes/CR-001-*`, `apps/web/src/App.tsx`, `apps/web/src/styles.css`, pruebas UI/E2E, guía docente y registros TFM.

## Related SPECs

`SPEC-003`.

## Related commits / PRs

Implementado y verificado en la rama `feat/SPEC-003-individual-availability`; referencia de commit pendiente hasta crearlo.

## Baseline version before

v1.1

## Baseline version after

v1.2

## TFM relevance

Decisión de UX que distingue granularidad de consulta mensual y edición semanal, manteniendo la semántica de ausencia derivada.

## Migration / compatibility

Compatible con las entradas existentes y el endpoint de retirada; no hay migración de datos.
