---
id: RF-EQU-006
estado: en_revision
---

# RF-EQU-006 — Enviar el enlace del equipo por correo opcional

## Requisito

El sistema debe permitir que, al crear un equipo, quien lo crea indique opcionalmente una dirección de correo a la que se enviará una notificación con el enlace de acceso al equipo.

## Origen

Decisión expresa de quien impulsa Synqo para conservar un acceso al equipo en el buzón de correo sin requerir registro.

## Precondiciones

La persona está creando un equipo rápido y dispone de una dirección de correo que desea utilizar para recibir el enlace.

## Criterios de aceptación

- El campo de correo es opcional y no impide crear el equipo cuando queda vacío.
- Si se informa, Synqo lo utiliza únicamente para enviar una notificación con el enlace de acceso al equipo creado.
- Solo se considera satisfactorio el intento cuando el componente encargado del envío confirma que terminó correctamente. Cualquier otro resultado, incluida la ausencia de confirmación, se trata como envío erróneo.
- Si el intento de envío se considera erróneo, el equipo permanece creado, se muestra su enlace y se avisa del error para que la persona pueda copiarlo o compartirlo.
- Si el fallo se conoce después de salir de la confirmación o del equipo, el aviso aparece al volver a ese equipo desde el mismo navegador y permanece hasta que la persona lo descarte. Descartarlo no oculta el enlace de acceso ni sus acciones de copia y compartición.
- Cuando se incorpore esta capacidad en el piloto publicado, el resultado se determinará durante el intento de envío según la confirmación del componente encargado. No se seguirán rebotes posteriores ni se presentará el resultado satisfactorio como confirmación de entrega al buzón.
- En ese piloto no se harán reintentos automáticos del envío. Si el proveedor rechaza el intento, incluso por un problema temporal, se registrará el fallo y se presentará el aviso cuando se conozca.
- Junto al campo se explica brevemente que el correo solo se utilizará para enviar el enlace de acceso al equipo.
- El enlace enviado permite acceder al equipo vigente con las mismas reglas que cualquier enlace compartido.

## Casos límite

No se ha definido reenvío manual ni una lista de destinatarios. Si el único intento se considera erróneo, el error no deshace la creación del equipo. El mecanismo de envío y el momento en que puede conocerse su resultado siguen sin resolver; existe preferencia por no bloquear la creación mientras se envía. El criterio técnico con que cada integración confirma el éxito se decidirá en arquitectura.

## Relaciones

- [RF-EQU-001 — Crear un equipo sin registro](rf-equ-001-crear-equipo.md)
- [RF-EQU-003 — Acceder al equipo por enlace](rf-equ-003-acceder-por-enlace.md)
- [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md)
