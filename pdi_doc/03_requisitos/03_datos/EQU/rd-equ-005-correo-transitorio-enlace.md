---
id: RD-EQU-005
estado: en_revision
---

# RD-EQU-005 — Correo transitorio para enviar el enlace

## Dato / información

Dirección de correo facilitada opcionalmente durante la creación del equipo para recibir una notificación con su enlace de acceso.

## Significado

Sirve exclusivamente como destinatario de esa notificación. No identifica a un participante, no crea una cuenta y no concede permisos distintos a los derivados del enlace.

## Integridad

Cuando se informa, la dirección debe ser utilizable como destinatario de correo. El tratamiento de un valor inválido se concreta en la experiencia de creación.

## Retención / ciclo de vida

Synqo conserva la dirección de forma interna y efímera como dato del evento de envío mientras esté pendiente el intento. La elimina al terminar el intento, tenga éxito o falle. No forma parte de los datos del equipo ni se reutiliza para otros envíos o fines. El plazo máximo y la limpieza de un evento que nunca llegue a ejecutarse deben concretarse en arquitectura.

## Privacidad

La pantalla de creación explica brevemente que la dirección solo se usa para enviar el enlace, sin exponer los detalles internos del evento. Los demás participantes no ven ese dato dentro del equipo.

## Origen

Decisión expresa de quien impulsa Synqo sobre el correo opcional y su uso limitado.

## Relaciones

- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md)
