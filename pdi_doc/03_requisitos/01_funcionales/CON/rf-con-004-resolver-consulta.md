---
id: RF-CON-004
estado: en_revision
---

# RF-CON-004 — Resolver una consulta

## Requisito

El sistema debe permitir que un usuario con acceso al equipo resuelva una consulta abierta bajo una identidad de participante, aceptando una o varias opciones propuestas o rechazando la consulta.

## Origen

- [HU-CON-004 — Resolver una consulta](../../../01_producto/07_historias-usuario/hu-con-004-resolver-consulta.md)
- Decisión expresa de quien impulsa Synqo: confirmar una aceptación o rechazo antes de registrarlo.
- Decisión expresa de quien impulsa Synqo: mostrar quién registró la resolución.

## Precondiciones

La consulta está abierta; el usuario tiene acceso al equipo y actúa bajo una identidad de participante de ese equipo.

## Criterios de aceptación

- Puede registrarse una resolución que acepte una o varias opciones de la consulta o que la rechace.
- La consulta puede resolverse sin haber recibido votos.
- La resolución queda atribuida a la identidad de participante seleccionada.
- En la consulta cerrada se muestra la identidad de participante que registró la resolución.
- En el resumen de una consulta resuelta se muestran las opciones aceptadas, y las consultas resueltas o rechazadas pueden abrirse para consultar su contenido y votos sin editarlos.
- Al iniciar la resolución se muestran todas las opciones sin marcas de aceptación previas, con su recuento y votantes; las opciones aceptadas se eligen de forma independiente del voto propio.
- Antes de registrar la aceptación o el rechazo, se solicita confirmación de la resolución elegida.

## Casos límite

Si se cancela la confirmación, la consulta permanece abierta y no se registra la resolución. En esta fase una consulta resuelta no se reabre. Rechazar después una resolución registrada es solo una propuesta futura.

## Relaciones

- [RN-CON-002 — Resolución de una consulta abierta](../../02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md)
- [RD-CON-002 — Resultado de la resolución](../../03_datos/CON/rd-con-002-resolucion.md)
