---
id: RN-CON-001
estado: en_revision
---

# RN-CON-001 — Votación múltiple y pública

## Regla

En esta fase, un voto selecciona una o varias opciones de la consulta y queda atribuido a una identidad de participante de su equipo. La selección es visible para los usuarios con acceso al equipo y puede modificarse mientras la consulta esté abierta.

El recuento de una opción es el número de participantes cuyo voto vigente la selecciona. Cada participante cuenta una vez para cada opción elegida, también cuando es la identidad activa de quien consulta. Cambiar una selección actualiza inmediatamente el voto vigente, los recuentos y las listas de participantes de las opciones afectadas.

Mientras la consulta esté abierta, un participante puede retirar su voto completo y quedar sin respuesta. La retirada elimina su selección vigente de los recuentos y las listas de votantes de todas las opciones; una respuesta registrada continúa requiriendo una o varias opciones.

Una opción de fecha sigue admitiendo votos mientras la consulta esté abierta, aunque su fecha ya haya pasado. El paso del tiempo no cierra ni desactiva por sí solo las opciones de una consulta creada.

## Justificación

Los integrantes conocen qué ha votado cada participante antes de resolver la consulta.

## Excepciones

La selección única no forma parte de esta fase.

## Origen

- [INV-CON-001 — Voto atribuido a participante del equipo](../../../02_dominio/05_invariantes/inv-con-001-voto-atribuido.md)
- Decisión expresa de quien impulsa Synqo: retirada completa del voto durante la consulta abierta.
- Decisión expresa de quien impulsa Synqo: las fechas pasadas siguen votables hasta resolver la consulta.

## Relaciones

- [RF-CON-002 — Registrar y cambiar un voto](../../01_funcionales/CON/rf-con-002-votar.md)
- [RF-CON-003 — Ver los votos por participante](../../01_funcionales/CON/rf-con-003-ver-votos.md)
