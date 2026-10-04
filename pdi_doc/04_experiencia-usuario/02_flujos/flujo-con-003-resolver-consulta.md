---
id: FLUJO-CON-003
estado: en_revision
---

# FLUJO-CON-003 — Resolver una consulta

## Actor

[ACT-COO-002 — Usuario con acceso al equipo](../../01_producto/05_actores-personas/act-coo-002-usuario-con-acceso.md) bajo una identidad de participante seleccionada.

## Entrada

Una consulta abierta del equipo vigente.

## Precondiciones

La consulta está abierta y el equipo está vigente. No se exige ningún voto previo.

## Pasos

1. La persona abre el diálogo de resolución y revisa todas las opciones propuestas, inicialmente sin marcas de aceptación, con sus recuentos y votantes visibles. Puede mostrar más votantes mediante «(+N)».
2. Elige aceptar una o varias opciones de la consulta o rechazarla. Esta selección no depende de su voto propio.
3. Synqo solicita confirmar la aceptación o el rechazo elegido, indicando el resultado que quedará registrado.
4. Si la persona confirma, se registra la resolución bajo la identidad de participante activa y se muestra la consulta como resuelta con opciones aceptadas o rechazada.

## Resultado

La consulta ya no admite votos nuevos ni cambios de votos. La resolución queda atribuida y reinicia el plazo de caducidad del equipo.

## Errores

- No se puede aceptar una opción ajena a la consulta ni aceptar cero opciones.
- Una consulta ya resuelta o rechazada no se reabre en esta fase.
- Un equipo caducado no permite resolver consultas.

## Cancelación

Si se cancela la confirmación o se abandona antes de registrar la resolución, la consulta permanece abierta.

## RF/RN relacionados

- [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md)
- [RN-CON-002 — Resolución de una consulta abierta](../../03_requisitos/02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
