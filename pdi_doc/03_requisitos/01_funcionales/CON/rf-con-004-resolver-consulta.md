---
id: RF-CON-004
estado: en_revision
---

# RF-CON-004 — Resolver una consulta

## Requisito

El sistema debe permitir que un usuario con acceso al equipo resuelva una consulta abierta bajo una identidad de participante, aceptando una o varias opciones propuestas o rechazando la consulta. Si una consulta de fechas se vincula a un evento, la aceptación se limita a una fecha.

## Origen

- [HU-CON-004 — Resolver una consulta](../../../01_producto/07_historias-usuario/hu-con-004-resolver-consulta.md)
- Decisión expresa de quien impulsa Synqo: confirmar una aceptación o rechazo antes de registrarlo.
- Decisión expresa de quien impulsa Synqo: mostrar quién registró la resolución.
- Ajuste expreso de la persona impulsora el 2026-10-19: el modal muestra el evento asociado como etiqueta y no permite modificar el vínculo; la desvinculación se realiza antes desde la ficha.

## Precondiciones

La consulta está abierta; el usuario tiene acceso al equipo y actúa bajo una identidad de participante de ese equipo.

## Criterios de aceptación

- Puede registrarse una resolución que acepte una o varias opciones de la consulta o que la rechace.
- Una consulta de fechas vinculada a un evento sin fecha o con fecha provisional solo permite aceptar una fecha; al confirmarla, esa fecha queda definitiva en el evento. Una consulta sin evento vinculado conserva la posibilidad de aceptar varias opciones.
- Cuando la resolución asigna una fecha al evento, la identidad de participante que resolvió la consulta figura como autora de la última modificación del evento.
- En el modal de resolución no se puede elegir, cambiar ni retirar un evento. Si la consulta tiene evento asociado, se muestra una etiqueta con su título y se aplica la resolución a ese vínculo conforme a sus reglas de estado; si no hay evento, no se muestra ningún control, etiqueta ni aviso de vínculo vacío. Para resolver sin afectar al evento se debe retirar previamente el vínculo desde la ficha de la consulta abierta. Si el evento ya vinculado se rechaza antes de resolver, se aplica la excepción descrita en [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md).
- Cambiar solo el vínculo de una consulta abierta no cuenta como última modificación del evento. Un evento puede vincularse a otra consulta cuando las anteriores ya estén cerradas; las consultas cerradas vinculadas siguen accesibles desde su ficha.
- Si un evento vinculado previamente ya tiene fecha definitiva, se avisa **antes de confirmar** que la resolución de la consulta no cambiará esa fecha. La consulta puede resolverse, conserva la relación visible con el evento y la fecha del evento se puede modificar desde su ficha.
- Rechazar una consulta vinculada no altera el evento.
- Al resolver o rechazar una consulta vinculada, la relación con el evento se conserva visible y navegable desde la ficha de ambos. La ficha del evento permite navegar a todas sus consultas vinculadas que ya estén cerradas.
- La consulta puede resolverse sin haber recibido votos.
- La resolución queda atribuida a la identidad de participante seleccionada.
- En la consulta cerrada se muestra la identidad de participante que registró la resolución.
- En el resumen de una consulta resuelta se muestran las opciones aceptadas, y las consultas resueltas o rechazadas pueden abrirse para consultar su contenido y votos sin editarlos.
- Al iniciar la resolución se muestran todas las opciones sin marcas de aceptación previas, con su recuento y votantes; las opciones aceptadas se eligen de forma independiente del voto propio.
- Antes de registrar la aceptación o el rechazo, se solicita confirmación de la resolución elegida.

## Casos límite

Si se cancela la confirmación, la consulta permanece abierta y no se registra la resolución. En esta fase una consulta resuelta no se reabre. Rechazar después una resolución registrada es solo una propuesta futura. Si, de forma excepcional, un evento rechazado continúa vinculado al resolver, se puede rechazar la consulta conservando la relación o cancelar para retirar previamente el vínculo desde su ficha y resolver después sin evento. El modal no desvincula recursos.

## Relaciones

- [RN-CON-002 — Resolución de una consulta abierta](../../02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md)
- [RD-CON-002 — Resultado de la resolución](../../03_datos/CON/rd-con-002-resolucion.md)
- [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md)
- [RD-EVT-002 — Autoría y momentos del evento](../../03_datos/EVT/rd-evt-002-autoria-momentos-evento.md)
