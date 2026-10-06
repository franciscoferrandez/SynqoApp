---
id: WF-EQU-002
estado: en_revision
---

# WF-EQU-002 — Creación de equipo rápido

## Flujo

[FLUJO-EQU-002 — Crear un equipo rápido](../02_flujos/flujo-equ-002-crear-equipo.md).

## Estado representado

Persona sin cuenta que abre Synqo sin enlace de equipo. El formulario de creación aparece directamente.

## Jerarquía

```text
┌──────────────────────────────────┐
│ Crear un equipo                  │
│                                  │
│ Nombre del equipo                │
│ [                            ]   │
│ Tu nombre en el equipo           │
│ [                            ]   │
│ Correo para recibir el enlace    │
│ [                            ]   │
│ Solo usaremos este correo para   │
│ enviarte el enlace del equipo.   │
│                                  │
│ [Crear equipo]                   │
└──────────────────────────────────┘

Tras crearlo: seleccionar automáticamente al primer participante → confirmación con enlace y acceso al equipo → calendario. Una configuración interna puede omitir la confirmación.

┌──────────────────────────────────┐
│ Equipo creado                    │
│ Nombre del equipo                │
│ Primer participante seleccionado │
│                                  │
│ Enlace de acceso                │
│ [Copiar] [Compartir]             │
│                                  │
│ [Entrar al equipo]               │
└──────────────────────────────────┘
```

## Acciones

- Escribir el nombre del equipo y el del primer participante, ambos obligatorios y de hasta 50 caracteres, y crear sin registro.
- Informar opcionalmente un correo. En [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md), explicar junto al campo que se usa solo para enviar el enlace.
- Si falta un nombre, mostrar el error en el campo y conservar lo escrito.
- Tras crearlo, seleccionar automáticamente la identidad del primer participante en el navegador y mostrar por defecto la confirmación con el enlace y una acción para entrar al calendario; una configuración interna puede llevar directamente al calendario.
- Si se conoce un fallo del intento de envío opcional, conservar el equipo creado y mostrar un aviso reutilizable con el enlace en la confirmación o en el equipo, según dónde se conozca el resultado. La aceptación de la solicitud no confirma entrega y no se siguen rebotes posteriores.
- Si el fallo se conoce tras salir de la pantalla, mostrar el aviso al volver al equipo desde el mismo navegador. Incluir una acción para descartarlo sin quitar el acceso al enlace.

## Notas

**DEFINIDO:** formulario de creación directo, nombres del equipo y primer participante obligatorios y limitados a 50 caracteres, correo opcional con envío en la entrega ampliada, creación sin registro, enlace compartible, selección automática del primer participante y confirmación predeterminada con acceso al calendario. Una configuración interna puede omitir la confirmación. La dirección será un dato interno efímero de uso único; si falla el intento de envío, el equipo se conserva y se muestra el enlace con un aviso cuando se conozca el fallo. El aviso reaparece en ese navegador hasta descartarlo y no se siguen rebotes posteriores. El mecanismo transaccional está aprobado en [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md). **PROPUESTO:** disposición final de campos y mensajes. La creación del equipo no depende de compartir el enlace ni de que se entregue el correo.
