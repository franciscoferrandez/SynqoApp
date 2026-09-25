# ADR-017 — Email transaccional y notificaciones

**Estado:** Accepted — major revision

## Contexto
El email ya no es solo un canal de invitación: es parte del acceso a equipos administrables y recuperación. Las notificaciones externas de actividad se excluyen del MVP para mantener baja complejidad y menor exposición de PII.

## Decisión
- Producción: **Resend**.
- Desarrollo: **Mailpit**.
- Compartir por WhatsApp/u otras apps: Web Share API/enlace preparado, sin WhatsApp Business en MVP.
- Push: diferido.

### Email transaccional esencial
Verificación administrativa, recuperación administrativa y autenticación passwordless si se ofrece.

### Notificaciones de producto
En el MVP no se envían notificaciones externas automáticas por nueva solicitud, propuesta, encuesta, recordatorios ni avisos de expiración. Esas señales se gestionan mediante UI, pendientes y enlaces compartidos manualmente. Las notificaciones externas de actividad quedan como evolución futura basada en evidencia.

## Justificación
Separa identidad/seguridad de preferencias de comunicación y evita implementar canales de actividad que el MVP no necesita para completar sus recorridos principales.
