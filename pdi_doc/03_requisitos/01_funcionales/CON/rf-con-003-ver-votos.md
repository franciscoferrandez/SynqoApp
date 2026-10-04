---
id: RF-CON-003
estado: en_revision
---

# RF-CON-003 — Ver los votos por participante

## Requisito

El sistema debe mostrar junto a cada opción de una consulta cuántos participantes la han votado y los nombres de hasta tres votantes. Si hay más, debe indicar cuántos quedan y permitir mostrar sus nombres en la misma opción.

## Origen

- [HU-CON-003 — Ver los votos de cada participante](../../../01_producto/07_historias-usuario/hu-con-003-ver-votos.md)

## Precondiciones

El usuario tiene acceso al equipo al que pertenece la consulta.

## Criterios de aceptación

- Cada opción muestra el número de identidades de participante que la han seleccionado en su voto vigente, incluida la identidad activa si también la seleccionó.
- Se muestran directamente hasta tres votantes por opción. Si hay más, aparece «(+N)» con el número de votantes restantes; al activarlo se muestran los nombres restantes en la misma opción, sin desplegable separado.
- Si la identidad activa votó la opción, aparece primero y con énfasis visual.
- Los votos no son anónimos dentro del equipo.

## Casos límite

Los recuentos y las listas de votantes reflejan los votos vigentes tras cualquier modificación. No se ha definido si se muestran votos anteriores.

## Relaciones

- [RN-CON-001 — Votación múltiple y pública](../../02_reglas-negocio/CON/rn-con-001-votacion-publica.md)
- [RD-CON-001 — Voto atribuido a participante](../../03_datos/CON/rd-con-001-voto.md)
