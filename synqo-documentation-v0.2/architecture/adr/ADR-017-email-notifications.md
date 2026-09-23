# ADR-017 — Email transaccional y notificaciones

**Estado:** Accepted — major revision

## Contexto
El email ya no es solo un canal de invitación: es parte del acceso a equipos administrables y recuperación. Las notificaciones de actividad son una necesidad distinta y parcialmente abierta.

## Decisión
- Producción: **Resend**.
- Desarrollo: **Mailpit**.
- Compartir por WhatsApp/u otras apps: Web Share API/enlace preparado, sin WhatsApp Business en MVP.
- Push: diferido.

### Email transaccional esencial
Verificación administrativa, recuperación administrativa y autenticación passwordless si se ofrece.

### Notificaciones de producto
Nueva solicitud/propuesta/encuesta, recordatorios y avisos de expiración quedan sujetos a `OPEN-08`.

## Justificación
Separa identidad/seguridad de preferencias de comunicación y evita implementar canales que aún no tienen requisitos cerrados.
