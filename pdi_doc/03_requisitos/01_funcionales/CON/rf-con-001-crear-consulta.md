---
id: RF-CON-001
estado: en_revision
---

# RF-CON-001 — Crear una consulta de fechas

## Requisito

El sistema debe permitir que un usuario con acceso al equipo construya manualmente una consulta con un título breve y opciones de fecha, sin exigir registro.

## Origen

- [HU-CON-001 — Crear una consulta de fecha](../../../01_producto/07_historias-usuario/hu-con-001-crear-consulta-de-fecha.md)

## Precondiciones

El usuario tiene acceso al equipo y actúa bajo una identidad de participante del equipo.

## Criterios de aceptación

- La consulta creada pertenece al equipo y puede recibir votos.
- La persona escribe un título breve al crear la consulta y ese título la identifica en la lista del equipo.
- El título admite hasta 250 caracteres según [RD-CON-003 — Título de la consulta](../../03_datos/CON/rd-con-003-titulo-consulta.md).
- La consulta puede crearse con una a diez opciones de fecha según [RN-CON-003 — Mínimo de una opción por consulta](../../02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md) y [RN-CON-007 — Máximo de diez opciones por consulta](../../02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md). El panel de creación indica visualmente el máximo.
- Cada fecha puede aparecer una sola vez entre las opciones de una consulta.
- Al crear la consulta, todas sus opciones corresponden a hoy o a fechas futuras según la zona horaria del dispositivo o, si no se obtiene, la del equipo.
- La creación se inicia con el botón de icono situado dentro del panel del calendario. El día que estuviera seleccionado se deselecciona y su detalle se sustituye por un panel para construir la consulta.
- La selección comienza sin fechas. Pulsar un día admisible lo añade; pulsarlo de nuevo lo retira. Se pueden acumular fechas mientras se navega entre meses y el panel las muestra ordenadas.
- En móvil, el panel de creación aparece debajo del calendario.
- Crear exige confirmación. Cancelar abandona directamente si el título está vacío y no hay fechas seleccionadas; si hay título o fechas, se confirma el descarte con «Seguir editando» como opción inicial y «Abandonar edición» como acción definitiva. Tras crear, la consulta aparece en «Consultas».

## Casos límite

El mínimo es una opción para cualquier tipo de consulta y el máximo de esta entrega es diez. Si se intenta añadir una fecha ya presente, no se añade una segunda opción con esa fecha. Si alguna fecha ha pasado al confirmar la creación, la consulta no se crea hasta corregirla.

## Relaciones

- [RN-CON-003 — Mínimo de una opción por consulta](../../02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md)
- [RN-CON-007 — Máximo de diez opciones por consulta](../../02_reglas-negocio/CON/rn-con-007-maximo-opciones-consulta.md)
- [RN-CON-004 — Fecha única entre opciones de una consulta](../../02_reglas-negocio/CON/rn-con-004-fecha-unica-consulta.md)
- [RN-CON-005 — Fechas propuestas desde hoy](../../02_reglas-negocio/CON/rn-con-005-fechas-desde-hoy.md)
- [RD-CON-003 — Título de la consulta](../../03_datos/CON/rd-con-003-titulo-consulta.md)
