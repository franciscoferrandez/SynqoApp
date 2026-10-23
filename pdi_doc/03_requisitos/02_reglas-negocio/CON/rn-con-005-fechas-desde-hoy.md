---
id: RN-CON-005
estado: en_revision
---

# RN-CON-005 — Fechas propuestas desde hoy

## Regla

Al crear una consulta de fechas, cada opción debe ser hoy o una fecha futura. Al editarla, la misma condición se aplica a las opciones nuevas. «Hoy» se determina en la zona horaria del dispositivo de quien realiza la operación y, si no se puede obtener, en la del equipo. La condición se comprueba al guardar.

## Justificación

La consulta de fechas de la primera entrega propone posibles fechas para una decisión del equipo.

## Excepciones

Esta regla no modifica ni elimina automáticamente opciones de consultas ya creadas cuando sus fechas pasan al pasado; permanecen votables mientras la consulta siga abierta según [RN-CON-001 — Votación múltiple y pública](rn-con-001-votacion-publica.md). Al editar pueden conservarse o retirarse esas opciones pasadas, con confirmación si tienen votos según [RN-CON-008 — Edición de opciones y conservación de votos](rn-con-008-edicion-opciones-votos.md). Una fecha pasada que no fuera una opción conservada no puede añadirse como nueva. No define las opciones de consultas sobre otros asuntos.

## Origen

Decisión expresa de quien impulsa Synqo sobre fechas proponibles y uso de la misma zona horaria que en la disponibilidad.

Ampliación expresa del 2026-10-21: conservar y permitir retirar fechas pasadas ya incluidas al editar; las nuevas deben ser de hoy en adelante.

## Relaciones

- [RF-CON-001 — Crear una consulta de fechas](../../01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RN-DIS-001 — Disponibilidad diaria del equipo](../DIS/rn-dis-001-disponibilidad-del-equipo.md)
- [RF-CON-007 — Editar una consulta de fechas](../../01_funcionales/CON/rf-con-007-editar-consulta-fechas.md)
