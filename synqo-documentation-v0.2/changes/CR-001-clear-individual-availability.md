# CR-001 — Limpiar disponibilidad individual

## Status

`Accepted`

## Problem

El estado derivado `UNANSWERED` se muestra en la interfaz, pero el contrato solo permite upsert de los tres estados declarables. No existe una operación para retirar una entrada y volver a la ausencia de respuesta.

## Current baseline

`AvailabilityEntry` existe por equipo, participante y fecha. `UNANSWERED` se deriva por ausencia de fila, no se persiste, y `PUT /teams/{teamRef}/availability/me` acepta una lista no vacía de entradas declarables.

## Proposed change

Permitir que el participante elimine su propia entrada diaria para volver a `UNANSWERED`. CR-002 sustituye la acción explícita «Sin respuesta» por volver a activar el estado ya seleccionado.

## Reason

La persona usuaria ha definido una cuarta opción para retirar el valor previo desde el selector de calendario. Sin una eliminación real, la interfaz fingiría una ausencia que el servidor no puede persistir.

## Impact

### Product

Permite corregir una declaración y recuperar el significado ya definido de `Sin respuesta`.

### Requirements

Aclara la interacción de `RF-DIS-04` y `RF-DIS-07`; no crea un cuarto estado declarable.

### UX

La retirada es una acción sobre el estado activo, no un cuarto estado persistido ni una opción independiente.

### Domain

Autoriza eliminar la `AvailabilityEntry` propia; `UNANSWERED` continúa derivado.

### API

Requiere definir una operación compatible para retirar una fecha (por ejemplo, una lista explícita de fechas a eliminar dentro del comando actual o un endpoint dedicado).

### Data

Elimina únicamente la fila propia del día y conserva unicidad e aislamiento por equipo.

### Security

Misma sesión contextual, comprobación server-side, CSRF y clave de idempotencia de la mutación actual.

### Testing

Pruebas de retirada, reintento idempotente, aislamiento cross-team y vuelta a `UNANSWERED` en UI.

### Documentation

Actualizar requisitos/reglas, OpenAPI, diseño de datos, baseline, SPEC-003, trazabilidad y evidencia si se acepta.

## Alternatives

1. Omitir «Sin respuesta» y permitir solo sustituir entre tres estados.
2. Persistir `UNANSWERED`, descartado porque contradice la regla actual de ausencia derivada.
3. Aceptar la propuesta y definir la operación de retirada sin introducir un cuarto estado persistido.

## Decision

Aceptada por el propietario el 2026-09-28: «Sin respuesta» elimina la disponibilidad previamente almacenada; no se persiste ningún cuarto estado.

## Affected files

`product/07-business-rules.md`, `technical-design/13-domain/`, `technical-design/17-data-model/`, `technical-design/18-api/`, `project/design-baseline.md`, `specs/SPEC-003-*` y pruebas asociadas.

## Related SPECs

`SPEC-003`.

## Related commits / PRs

Pendiente.

## Baseline version before

v1.0

## Baseline version after

v1.1

## TFM relevance

Decisión de producto/API sobre ausencia derivada y mutación idempotente.

## Migration / compatibility

La retirada elimina filas existentes; requiere semántica explícita de reintentos y no modifica datos de terceros.
