---
id: FLUJO-EQU-002
estado: en_revision
---

# FLUJO-EQU-002 — Crear un equipo rápido

## Actor

[ACT-COO-001 — Persona coordinadora](../../01_producto/05_actores-personas/act-coo-001-persona-coordinadora.md).

## Entrada

Formulario de creación mostrado directamente al abrir Synqo sin enlace de equipo, sin registro previo.

## Precondiciones

Ninguna cuenta es necesaria.

## Pasos

1. La persona escribe el nombre del equipo y el nombre obligatorio del primer participante en el formulario de creación directo.
2. Opcionalmente, indica una dirección de correo. En [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md), junto al campo se explica que la demo no enviará el enlace y que descartará la dirección al crear el equipo. En la entrega posterior con envío real, se explicará que se usa solo para ese envío.
3. Crea el equipo. Synqo crea un equipo vigente con su primer participante y un enlace de acceso.
4. Synqo selecciona automáticamente la identidad del primer participante en el navegador creador y muestra por defecto una confirmación del equipo creado con su enlace, acciones para copiarlo o compartirlo mediante el diálogo del dispositivo si está disponible, y una acción para entrar al calendario.
5. La persona entra al calendario bajo esa identidad y puede marcar su disponibilidad. Una configuración interna puede omitir la confirmación y llevarla directamente al calendario.

## Resultado

Existe un equipo con nombre, al menos un participante y enlace compartible. La persona puede comenzar a coordinarse sin registro y conoce su fecha prevista de caducidad en la vista del equipo. En la demo local no se envía correo; cuando se incorpore el envío real, tampoco bloqueará el acceso al equipo.

## Errores

Los estados de fallo de envío siguientes corresponden a la entrega posterior con correo real; no aparecen en la demo local.

- Si falta el nombre del equipo o del primer participante, no se crea el equipo y se solicita completar el campo correspondiente.
- Si falla la creación, no se presenta un enlace de equipo como válido; se informa del fallo y se permite reintentar.
- Si el intento de envío opcional no queda confirmado como correcto, se considera erróneo. Cuando se conoce ese resultado durante la confirmación o mientras se consulta el equipo, se presenta un aviso con el enlace y las acciones para copiarlo o compartirlo. El equipo permanece creado. No se siguen rebotes posteriores ni se presenta un resultado satisfactorio como entrega confirmada.
- El rechazo del proveedor, aunque sea temporal, termina el intento sin reenvío automático en esta entrega y muestra el aviso de fallo cuando se conozca.
- Si el fallo se conoce después de salir de esas pantallas, el aviso aparece al volver al equipo desde el mismo navegador. Sigue visible hasta que la persona lo descarte; el enlace y las acciones para compartirlo permanecen disponibles.

**NO_RESUELTO:** mecanismo de envío, momento en que puede conocerse el resultado del intento y forma técnica de conservar y mostrar el aviso al volver al equipo. La preferencia expresada es que el envío no bloquee la creación.

## Cancelación

Si la persona abandona la creación antes de confirmarla, no se crea un equipo.

## RF/RN relacionados

- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../03_requisitos/01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RF-EQU-004 — Mostrar la fecha prevista de caducidad](../../03_requisitos/01_funcionales/EQU/rf-equ-004-mostrar-caducidad.md)
- [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md)
- [RN-EQU-005 — Equipo con al menos un participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md)
- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md)
