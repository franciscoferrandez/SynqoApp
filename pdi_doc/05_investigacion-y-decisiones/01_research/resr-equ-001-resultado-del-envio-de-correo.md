---
id: RESR-EQU-001
---

# RESR-EQU-001 — ¿Cuándo se conoce el resultado del envío del enlace por correo?

## Objetivo

Distinguir los resultados observables del envío opcional del enlace de equipo antes de decidir qué fallo comunica Synqo y cómo lo presenta sin bloquear la creación.

## Hechos

- La respuesta satisfactoria de una API de correo acredita que el proveedor aceptó el mensaje, no que lo entregó al buzón. Amazon SES devuelve un identificador al aceptarlo y advierte que puede aceptar un mensaje sin llegar a enviarlo.
- Un proveedor puede rechazar la solicitud de envío de forma inmediata. También pueden producirse incidencias después de que acepte el mensaje, como un rebote, conocidas mediante notificaciones posteriores.
- Incluso una respuesta de error puede dejar un resultado incierto: Amazon SES documenta casos raros en los que acepta el mensaje aunque la llamada devuelva un error. Si la aplicación no recibe una confirmación inequívoca, no puede afirmar solo a partir de esa llamada que el mensaje se envió o que no se envió.
- Para asociar una notificación posterior al envío concreto, puede ser necesario conservar una correspondencia entre el identificador propio de la aplicación y el identificador del mensaje del proveedor. Esa correspondencia no requiere necesariamente conservar la dirección de correo en los datos del equipo; la viabilidad y el tratamiento de los datos incluidos en las notificaciones dependen del proveedor y de la solución elegidos.
- Una creación que no espera a completar el intento de envío puede terminar cuando su estado todavía es pendiente. Por tanto, un aviso de fallo en la pantalla de confirmación o del equipo requiere consultar o recibir el resultado una vez disponible. Esta última frase es una inferencia técnica de la separación temporal de ambas operaciones.

## Evidencias

- [Amazon SES — SendEmail API](https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_SendEmail.html): respuesta de aceptación, identificador y errores posibles.
- [Amazon SES — How email sending works](https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-process.html): etapas de aceptación y entrega, con posibles rebotes posteriores.
- [Amazon SES — Notification problems](https://docs.aws.amazon.com/ses/latest/dg/troubleshoot-notifications.html): correspondencia entre identificadores para relacionar notificaciones y envíos.

## Restricciones

- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md) exige conservar el equipo y mostrar su enlace si el intento no queda confirmado como correcto. Por decisión expresa de producto, todo resultado sin confirmación de éxito se trata como error y la primera entrega no sigue rebotes posteriores; el criterio técnico de confirmación queda para la integración elegida.
- [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md) permite conservar la dirección de forma interna y efímera como dato del evento de envío mientras esté pendiente el intento, pero exige eliminarla al terminarlo y no usarla para otros fines.
- Existe preferencia de producto por no bloquear la creación del equipo mientras se envía el correo.

## Unknowns

- ¿Qué proveedor, mecanismo de envío, persistencia de estado y actualización de pantalla se elegirán?
- ¿Cuánto tiempo puede permanecer pendiente el intento y cómo se elimina cualquier dato transitorio si nunca llega a ejecutarse?
- ¿Con qué criterio técnico confirmará el éxito el adaptador de la infraestructura elegida?

## Assumptions

Ninguna alternativa técnica se considera elegida en esta investigación. El alcance de seguimiento figura en el requisito enlazado.

## Alternativas observadas

- Comunicar los errores del intento de envío, incluida una respuesta de rechazo del proveedor; tratar la aceptación como «solicitud aceptada» sin afirmar entrega.
- Incorporar eventos posteriores de entrega o rebote y comunicar también los fallos tardíos, con correlación del envío.

## Impacto potencial

La alternativa elegida afecta al texto del estado del correo, a cuánto tiempo se presenta el aviso y a la necesidad de recibir y relacionar eventos posteriores. La elección debe preceder a una decisión de arquitectura de envío y estado.

## Conclusión factual

«Proveedor aceptó el mensaje» y «correo entregado» son resultados distintos. Una respuesta correcta al intento de envío no permite prometer que el enlace llegó al buzón; los fallos posteriores solo pueden comunicarse si se reciben y relacionan sus eventos.
