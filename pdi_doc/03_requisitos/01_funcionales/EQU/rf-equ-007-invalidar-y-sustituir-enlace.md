---
id: RF-EQU-007
estado: borrador
---

# RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo

## Requisito

En una entrega posterior al primer piloto, el sistema debe permitir invalidar el enlace de acceso de un equipo vigente y generar otro que lo sustituya.

## Origen

Decisión expresa de quien impulsa Synqo: esta capacidad será necesaria en el futuro, aunque no se incluirá en la primera entrega. Su ubicación en el producto consta en el [alcance conceptual](../../../01_producto/04_alcance/alcance-conceptual.md).

## Precondiciones

Existe un equipo vigente con un enlace de acceso activo. Las condiciones para solicitar la sustitución aún no están definidas.

## Criterios de aceptación

- Una vez invalidado, el enlace anterior deja de permitir el acceso al equipo.
- El nuevo enlace permite acceder al mismo equipo vigente conforme a las reglas de acceso que estén en vigor en esa entrega.

## Casos límite

Quedan por definir quién puede iniciar la acción, su confirmación, el tratamiento de enlaces ya compartidos, los accesos en curso y los avisos a participantes. Estos detalles se concretarán al planificar la entrega que incluya este requisito. El primer piloto no ofrece esta acción.

## Relaciones

- [RF-EQU-003 — Acceder al equipo por enlace](rf-equ-003-acceder-por-enlace.md)
- [RD-EQU-007 — Identificador del equipo](../../03_datos/EQU/rd-equ-007-identificador-equipo.md)
