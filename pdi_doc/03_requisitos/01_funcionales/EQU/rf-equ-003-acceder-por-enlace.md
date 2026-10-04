---
id: RF-EQU-003
estado: en_revision
---

# RF-EQU-003 — Acceder al equipo por enlace

## Requisito

El sistema debe proporcionar un enlace de acceso para cada equipo rápido y permitir que quien lo reciba acceda al equipo vigente sin registrarse.

## Origen

- [HU-EQU-004 — Acceder al equipo por enlace](../../../01_producto/07_historias-usuario/hu-equ-004-acceder-por-enlace.md)
- Decisión expresa de quien impulsa Synqo: un enlace inexistente y el de un equipo borrado definitivamente muestran el mismo mensaje.

## Precondiciones

El equipo está vigente.

## Criterios de aceptación

- Tras crear un equipo, se dispone de su enlace de acceso único, asociado al equipo identificado según [RD-EQU-007 — Identificador del equipo](../../03_datos/EQU/rd-equ-007-identificador-equipo.md).
- El enlace puede copiarse. Si el dispositivo ofrece un diálogo de compartir, también puede enviarse a través de él.
- Un usuario que abre ese enlace puede acceder al equipo vigente sin registro.
- En la primera entrega no se ofrece una acción para invalidar el enlace ni generar uno de sustitución mientras el equipo siga vigente.
- La mera apertura del enlace no modifica la fecha prevista de caducidad.
- Si el enlace corresponde a un equipo caducado, se muestra una explicación de que caducó y no se puede recuperar, sin mostrar el contenido del equipo.
- Si el enlace no identifica ningún equipo, porque es incorrecto, inexistente o el equipo ya fue borrado definitivamente, se muestra «No encontramos este equipo» sin datos del equipo ni indicación de si existió anteriormente.

## Casos límite

Un enlace de equipo caducado que aún no ha sido borrado muestra el estado de caducidad. Tras el borrado definitivo, muestra el mismo estado genérico que un enlace inexistente. Si el dispositivo no ofrece diálogo de compartir, permanece la opción de copiar el enlace. [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](rf-equ-007-invalidar-y-sustituir-enlace.md) es una necesidad futura y no forma parte de esta entrega.

## Relaciones

- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RD-EQU-007 — Identificador del equipo](../../03_datos/EQU/rd-equ-007-identificador-equipo.md)
- [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](rf-equ-007-invalidar-y-sustituir-enlace.md)
