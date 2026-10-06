---
id: ADR-EQU-002
estado: aprobado
---

# ADR-EQU-002 — Registrar el envío opcional como evento transaccional

## Contexto

La creación de un equipo debe terminar aunque el correo opcional falle. Se prefiere que la respuesta de creación no espere al proveedor. Solo habrá un intento, la dirección será efímera y el resultado de error podrá consultarse desde el navegador creador.

## Drivers

- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md)
- [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md)
- [Drivers arquitectónicos de la primera entrega](../../06_arquitectura/01_drivers-arquitectonicos/drivers-primera-entrega.md)

## Opciones consideradas

Las [alternativas de envío del enlace](../03_alternativas/alternativas-envio-correo-equipo.md) comparan la llamada síncrona, el trabajo en memoria, una cola externa y un evento transaccional en la persistencia del equipo.

## Decisión

**Aprobada por la persona que impulsa Synqo el 2026-10-06 para [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md).** La elección expresa fue registrar un evento transitorio junto con el equipo, procesarlo una sola vez y mostrar el resultado al navegador creador sin esperar al proveedor en la respuesta de creación.

Cuando se solicita el correo, el sistema registrará la creación del equipo y un evento transitorio de envío en la misma transacción de persistencia. La respuesta de creación no esperará al proveedor de correo. Un proceso posterior tomará el evento de forma exclusiva, registrará de manera duradera el inicio del único intento **antes** de llamar al adaptador y no volverá a invocarlo para ese evento. La aplicación solo registrará éxito si el adaptador confirma el resultado satisfactorio; los demás resultados se tratarán como error. Al terminar el intento, o cuando un evento pendiente o iniciado supere el plazo máximo que se definirá, se eliminarán la dirección y el valor transitorio necesario para construir el enlace.

El modo de ejecutar el proceso posterior, su periodicidad, los plazos, el proveedor y el contrato detallado del adaptador se concretan en [SPEC-EQU-003 — Envío opcional del enlace del equipo por correo](../../08_especificaciones/99_archivadas/spec-equ-003-envio-opcional-enlace-correo.md). Esta decisión no incorpora seguimiento de rebotes ni reintentos automáticos.

## Consecuencias positivas

- El equipo y la intención de enviar su enlace se confirman juntos; una caída entre dos escrituras independientes no pierde silenciosamente la petición de correo.
- El resultado puede quedar asociado a la creación sin conservar la dirección después del intento.
- El patrón permite comparar un proceso continuo con una tarea programada sin cambiar la regla de un solo intento.

## Consecuencias negativas

- Si el proceso cae tras registrar el inicio y antes de llamar al proveedor, el correo puede no salir. Se cerrará como error sin reintento para respetar la regla de producto.
- Una respuesta ambigua del proveedor puede corresponder a un mensaje aceptado; se comunicará como error por falta de confirmación de éxito, sin afirmar que no llegó al buzón.
- El evento contiene temporalmente una dirección y material de acceso al equipo que requieren protección, plazo máximo y limpieza comprobable.

## Evidencia / Research

- [RESR-EQU-001 — ¿Cuándo se conoce el resultado del envío del enlace por correo?](../01_research/resr-equ-001-resultado-del-envio-de-correo.md)
- [Alternativas de envío del enlace](../03_alternativas/alternativas-envio-correo-equipo.md)
- [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](adr-equ-001-separar-identidad-y-acceso.md)

## Detalles de realización pendientes

Concretar y verificar en [SPEC-EQU-003 — Envío opcional del enlace del equipo por correo](../../08_especificaciones/99_archivadas/spec-equ-003-envio-opcional-enlace-correo.md) el plazo máximo y la limpieza de eventos que no lleguen a ejecutarse, la reclamación exclusiva, la protección del valor del enlace, la asociación privada del resultado al navegador creador y la integración técnica local.

## Sustituye

Ninguna decisión anterior.

## Sustituido por

No aplica.
