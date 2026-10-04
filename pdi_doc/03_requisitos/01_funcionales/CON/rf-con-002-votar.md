---
id: RF-CON-002
estado: en_revision
---

# RF-CON-002 — Registrar y cambiar un voto

## Requisito

El sistema debe permitir que un usuario con acceso al equipo registre, cambie o retire por completo, bajo una identidad de participante, su voto mientras la consulta esté abierta. Cada opción se registra o retira al marcarla o desmarcarla, sin acción adicional de guardar o retirar el voto.

## Origen

- [HU-CON-002 — Responder una consulta de fecha](../../../01_producto/07_historias-usuario/hu-con-002-responder-consulta-de-fecha.md)
- Decisión expresa de quien impulsa Synqo: un participante puede retirar su voto y volver a quedar sin respuesta.
- Decisión expresa de quien impulsa Synqo: ante un fallo de guardado se restaura el voto anterior y se ofrece reintentar.

## Precondiciones

La consulta está abierta y el usuario tiene acceso a su equipo y ha seleccionado una identidad de participante de ese equipo.

## Criterios de aceptación

- La respuesta puede seleccionar una o varias opciones de la consulta.
- Cada cambio de selección actualiza inmediatamente el voto vigente, su recuento y la lista de votantes; no se requiere confirmación para votar.
- Mientras la consulta permanezca abierta, la selección registrada puede modificarse.
- Mientras la consulta permanezca abierta, puede retirarse el voto completo desmarcando la última opción seleccionada y el participante vuelve a figurar sin respuesta.
- Una opción de fecha que ya pasó puede seleccionarse o deseleccionarse mientras la consulta continúe abierta.
- Si falla el guardado de una marca o desmarca, se restaura el voto anterior junto con su recuento y lista de votantes, se informa del fallo y se ofrece reintentar mientras la consulta siga abierta.

## Casos límite

Una consulta resuelta no acepta cambios de voto en esta fase. La conservación de versiones anteriores del voto no está definida.
Una acción que no llegó a guardarse no se considera una modificación efectiva del equipo.

## Relaciones

- [RN-CON-001 — Votación múltiple y pública](../../02_reglas-negocio/CON/rn-con-001-votacion-publica.md)
- [RD-CON-001 — Voto atribuido a participante](../../03_datos/CON/rd-con-001-voto.md)
