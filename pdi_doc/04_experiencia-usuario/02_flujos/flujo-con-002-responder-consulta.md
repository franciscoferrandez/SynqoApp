---
id: FLUJO-CON-002
estado: en_revision
---

# FLUJO-CON-002 — Responder una consulta abierta

## Actor

[ACT-COO-002 — Usuario con acceso al equipo](../../01_producto/05_actores-personas/act-coo-002-usuario-con-acceso.md) bajo una identidad de participante seleccionada.

## Entrada

Una consulta abierta del equipo vigente.

## Precondiciones

La consulta está abierta y el equipo está vigente.

## Pasos

1. La persona revisa las opciones de fecha o texto, el contador y hasta tres nombres de votantes junto a cada una. Si hay más, «(+N)» permite ver los restantes en la misma opción. Si la identidad activa votó esa opción, aparece primero y destacada.
2. Marca una o varias opciones bajo la identidad de participante activa. Cada marca queda registrada al instante y actualiza contadores y nombres, sin botón de guardar.
3. Mientras la consulta continúe abierta, puede desmarcar opciones para cambiar su selección registrada.
4. Al desmarcar la última opción elegida, retira su voto completo y vuelve a quedar sin respuesta.

Las opciones cuya fecha haya pasado continúan disponibles para votar o cambiar el voto mientras la consulta esté abierta.

## Resultado

El voto vigente del participante queda atribuido y visible, o se retira si así lo eligió. Los contadores y las listas de participantes reflejan la selección vigente; al retirar el voto, la identidad desaparece de las opciones que había elegido. Registrar, modificar o retirar un voto reinicia el plazo de caducidad del equipo.

## Errores

- Una consulta resuelta o rechazada ya no admite cambios de voto.
- Un equipo caducado no permite registrar ni modificar votos.
- Si falla el guardado, Synqo restaura el voto anterior en la opción, el recuento y la lista de votantes, comunica el fallo y ofrece reintentar la misma acción. El reintento solo puede realizarse si el equipo sigue vigente y la consulta abierta.

## Cancelación

No hay una selección pendiente de registrar: cada marca o desmarca se aplica al instante. Salir del detalle no revierte los cambios realizados.

## RF/RN relacionados

- [RF-CON-002 — Registrar y cambiar un voto](../../03_requisitos/01_funcionales/CON/rf-con-002-votar.md)
- [RF-CON-003 — Ver los votos por participante](../../03_requisitos/01_funcionales/CON/rf-con-003-ver-votos.md)
- [RN-CON-001 — Votación múltiple y pública](../../03_requisitos/02_reglas-negocio/CON/rn-con-001-votacion-publica.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
