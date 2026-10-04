---
id: RF-CON-005
estado: en_revision
---

# RF-CON-005 — Crear una consulta con opciones de texto

## Requisito

El sistema debe permitir que un usuario con acceso al equipo cree desde «Consultas», sin registro, una consulta con título breve y opciones escritas de texto libre, distinta de una consulta de fechas.

## Origen

- [HU-CON-005 — Crear una consulta con opciones de texto](../../../01_producto/07_historias-usuario/hu-con-005-crear-consulta-texto.md)
- Decisión expresa de quien impulsa Synqo: ambos tipos de consulta forman parte de la primera entrega y tienen puntos de entrada distintos.

## Precondiciones

El equipo está vigente y el usuario ha seleccionado una identidad de participante del equipo.

## Criterios de aceptación

- La creación se inicia desde la sección «Consultas» y no exige pasar por el calendario.
- La persona escribe un título y una o varias opciones de texto. No se crea la consulta sin título ni sin opciones conforme a [RN-CON-003 — Mínimo de una opción por consulta](../../02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md).
- El título admite hasta 250 caracteres según [RD-CON-003 — Título de la consulta](../../03_datos/CON/rd-con-003-titulo-consulta.md); cada opción admite hasta 50 según [RD-CON-005 — Texto de opción de una consulta](../../03_datos/CON/rd-con-005-texto-opcion-consulta.md). Los campos limitan la entrada sin mostrar contadores ni avisos de longitud mientras se escribe.
- La consulta admite de una a diez opciones según [RN-CON-003 — Mínimo de una opción por consulta](../../02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md) y [RN-CON-007 — Máximo de diez opciones por consulta](../../02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md); el diálogo indica visualmente el máximo.
- La consulta creada pertenece al equipo, aparece abierta en la lista y utiliza la votación múltiple pública y la resolución comunes a las consultas.
- La creación se realiza en un diálogo con título y opciones editables directamente en cada fila. Se pueden añadir, editar y eliminar opciones.
- Las opciones se muestran en el orden en que se añaden. No se ofrece una acción para reordenarlas.
- No se puede crear una consulta con opciones de texto duplicadas según [RN-CON-006 — Texto único entre opciones de una consulta](../../02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md); se indica cuál debe modificarse.
- Crear exige confirmación. Cancelar abandona directamente si ni el título ni ninguna opción tienen texto; si alguno tiene texto, se confirma el descarte con «Seguir editando» como opción inicial y «Abandonar edición» como acción definitiva. Seguir editando conserva el título, las opciones y su orden.
- Las opciones se construyen manualmente; las marcas de disponibilidad no se convierten en opciones de texto.

## Casos límite

Los límites de cantidad y longitud son comunes a las consultas de texto y fecha cuando corresponde al título o al número de opciones; en otra fase podrían divergir. La comparación de duplicados se rige por [RN-CON-006 — Texto único entre opciones de una consulta](../../02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md) y no se infiere de la regla de fechas únicas.

## Relaciones

- [RN-CON-001 — Votación múltiple y pública](../../02_reglas-negocio/CON/rn-con-001-votacion-publica.md)
- [RN-CON-003 — Mínimo de una opción por consulta](../../02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md)
- [RN-CON-006 — Texto único entre opciones de una consulta](../../02_reglas-negocio/CON/rn-con-006-texto-unico-consulta.md)
- [RN-CON-007 — Máximo de diez opciones por consulta](../../02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md)
- [RD-CON-003 — Título de la consulta](../../03_datos/CON/rd-con-003-titulo-consulta.md)
- [RD-CON-005 — Texto de opción de una consulta](../../03_datos/CON/rd-con-005-texto-opcion-consulta.md)
