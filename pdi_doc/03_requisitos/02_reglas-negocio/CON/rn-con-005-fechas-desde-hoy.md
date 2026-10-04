---
id: RN-CON-005
estado: en_revision
---

# RN-CON-005 — Fechas propuestas desde hoy

## Regla

Al crear una consulta de fechas, cada opción debe ser hoy o una fecha futura. «Hoy» se determina en la zona horaria del dispositivo de quien crea la consulta y, si no se puede obtener, en la del equipo. La condición se comprueba al confirmar la creación.

## Justificación

La consulta de fechas de la primera entrega propone posibles fechas para una decisión del equipo.

## Excepciones

Esta regla no modifica ni elimina automáticamente opciones de consultas ya creadas cuando sus fechas pasan al pasado; permanecen votables mientras la consulta siga abierta según [RN-CON-001 — Votación múltiple y pública](rn-con-001-votacion-publica.md). No define las opciones de consultas sobre otros asuntos en fases posteriores.

## Origen

Decisión expresa de quien impulsa Synqo sobre fechas proponibles y uso de la misma zona horaria que en la disponibilidad.

## Relaciones

- [RF-CON-001 — Crear una consulta de fechas](../../01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RN-DIS-001 — Disponibilidad diaria del equipo](../DIS/rn-dis-001-disponibilidad-del-equipo.md)
