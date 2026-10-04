---
id: RN-DIS-001
estado: en_revision
---

# RN-DIS-001 — Disponibilidad diaria del equipo

## Regla

La disponibilidad se expresa por participante, equipo y día, independientemente de las consultas. Sus valores son disponible, quizá, no disponible y sin marcar. Un usuario con acceso puede indicarla, modificarla o desmarcarla mientras el equipo esté vigente y el día sea hoy o posterior. Para determinar «hoy» se utiliza la zona horaria del dispositivo y, si no puede obtenerse, la del equipo. Las marcas de días anteriores permanecen, pero no se pueden modificar ni retirar.

## Justificación

El visor utiliza la disponibilidad compartida antes de que se construya manualmente una consulta.

## Excepciones

No se han definido rangos horarios ni franjas del día en esta fase.

## Origen

- [HU-DIS-001 — Indicar disponibilidad del equipo](../../../01_producto/07_historias-usuario/hu-dis-001-disponibilidad-del-equipo.md)
- Decisión expresa de quien impulsa Synqo sobre el límite temporal de edición y la zona horaria que lo determina.

## Relaciones

- [RF-DIS-001 — Marcar y modificar disponibilidad](../../01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md)
