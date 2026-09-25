# 21 — Email Template Catalogue

## 1. Propósito

Catálogo inicial de plantillas de email transaccional del MVP. No define HTML final; define propósito, asunto, variables, contenido mínimo y reglas de seguridad.

Proveedor:

- Producción: Resend.
- Desarrollo: Mailpit.

## 2. Reglas generales

- Plantillas breves, claras y orientadas a una sola acción.
- No incluir tokens claros en logs ni variables observables.
- No incluir disponibilidad, votos, respuestas, resultados nominales ni histórico.
- El enlace debe ser opaco, con TTL y clean redirect.
- El texto debe evitar jerga técnica como token, claim, job o lifecycle.
- Siempre incluir alternativa textual: si el botón no funciona, pegar enlace.
- Nunca prometer que abrir el email renueva actividad o confirma acciones.

## 3. Variables comunes

| Variable | Uso | Restricción |
|---|---|---|
| `appName` | Nombre del producto | Default `Synqo`. |
| `teamName` | Contexto del equipo | Solo si ayuda a reconocer el equipo; no incluir datos sensibles. |
| `actionUrl` | Enlace opaco | Token en URL solo antes de clean redirect. |
| `expiresAtText` | Expiración legible | Opcional pero recomendado para recovery. |
| `supportEmail` | Soporte/contacto | Opcional. |
| `locale` | Localización | Para idioma/formato. |

## 4. Plantillas MVP

### `email.adminVerification`

| Campo | Valor |
|---|---|
| Propósito | Verificar email administrativo y activar administración de equipo administrable. |
| Destinatario | Email administrativo indicado al crear o reenviar verificación. |
| Job | `email.adminVerification`. |
| Subject | `Verifica la administración de {teamName}` |
| Preheader | `Activa la administración de este equipo en Synqo.` |
| CTA | `Verificar administración` |
| Variables | `teamName`, `actionUrl`, `expiresAtText`, `appName`. |
| Obligatoriedad | Obligatorio para activar administración. |
| Opt-out | No. |

Contenido mínimo:

```text
Has creado un equipo administrable en Synqo.

Verifica este email para activar la administración de {teamName}.

[Verificar administración]

Si no has solicitado esto, puedes ignorar este mensaje.
```

Seguridad:

- No indicar participantes, solicitudes, propuestas ni encuestas.
- Enlace one-time con TTL.
- Reenviar verificación invalida token anterior cuando proceda.

### `email.adminRecovery`

| Campo | Valor |
|---|---|
| Propósito | Recuperar acceso administrativo a un equipo administrable. |
| Destinatario | Email administrativo verificado elegible. |
| Job | `email.adminRecovery`. |
| Subject | `Recupera la administración de {teamName}` |
| Preheader | `Usa este enlace para volver a acceder a la administración.` |
| CTA | `Recuperar administración` |
| Variables | `teamName`, `actionUrl`, `expiresAtText`, `appName`. |
| Obligatoriedad | Solo si el usuario solicita recuperación. |
| Opt-out | No para la solicitud concreta. |

Contenido mínimo:

```text
Recibimos una solicitud para recuperar la administración de {teamName}.

Usa este enlace para continuar.

[Recuperar administración]

Si no has solicitado esto, ignora este mensaje.
```

Seguridad:

- Respuesta de solicitud en UI/API siempre genérica.
- Enlace one-time, TTL corto.
- Nuevo recovery invalida tokens anteriores del mismo alcance.

### `email.accountAuth`

| Campo | Valor |
|---|---|
| Propósito | Verificar o autenticar una cuenta si se implementa flujo passwordless/cuenta. |
| Destinatario | Email de cuenta indicado por el usuario. |
| Job | `email.accountAuth`. |
| Subject | `Entra en Synqo` |
| Preheader | `Usa este enlace para continuar.` |
| CTA | `Entrar en Synqo` |
| Variables | `actionUrl`, `expiresAtText`, `appName`. |
| Obligatoriedad | Condicional al flujo de cuenta. |
| Opt-out | No para el email solicitado. |

Contenido mínimo:

```text
Usa este enlace para entrar en Synqo.

[Entrar en Synqo]

Si no has solicitado este acceso, ignora este mensaje.
```

Seguridad:

- No listar equipos, participantes ni pendientes en el email.
- No vincular automáticamente participaciones por email o nombre.
- Vincular participante a cuenta requiere prueba contextual separada.

## 5. Plantillas explícitamente no incluidas en MVP

| Plantilla | Estado | Motivo |
|---|---|---|
| Nueva solicitud publicada | No MVP | `RF-SD-08`, ADR-017 y `OPEN-08`. |
| Recordatorio de solicitud | No MVP | Evita preferencias/cadencia/PII y no es necesario para E2E. |
| Propuesta publicada | No MVP | Se comparte manualmente o aparece como pendiente in-app. |
| Encuesta publicada | No MVP | Se comparte manualmente o aparece como pendiente in-app. |
| Consulta cerrada por deadline | No MVP | Estado in-app/on-read; no email automático. |
| Resolución registrada | No MVP | Histórico/in-app; no email automático. |
| Equipo rápido recuperable/expirado | No MVP | No avisos externos de expiración; estado al acceder. |
| Resumen diario/semanal | No MVP | Plataforma de notificaciones diferida. |

## 6. Copy y microcopy relacionados

Mensajes UI recomendados cuando no hay email:

| Contexto | Texto |
|---|---|
| Compartir equipo | `Comparte este enlace con quienes vayan a participar en el equipo.` |
| Link copiado | `Enlace copiado.` |
| Verificación admin | `Verifica tu email para activar la administración del equipo.` |
| Enlace inválido | `Este enlace no es válido. Revisa que lo hayas copiado completo.` |
| Enlace revocado | `Este enlace fue revocado. Pide un enlace nuevo para continuar.` |
| Enlace expirado | `Este enlace ha expirado. Pide un enlace nuevo o vuelve al equipo si ya tienes acceso.` |

## 7. Checklist por plantilla

- Tiene un único propósito.
- Tiene un único CTA.
- Usa enlace opaco.
- No incluye datos de disponibilidad, votos ni respuestas.
- No incluye lista de participantes.
- Puede funcionar en texto plano.
- Explica qué hacer si el usuario no solicitó el email.
- Puede enviarse de forma idempotente por `credentialId`.
- Está asociada a un job de fase 20 o se marca fuera de MVP.

## 8. Referencias

- `technical-design/21-notifications/notification-matrix.md`
- `architecture/adr/ADR-017-email-notifications.md`
- `technical-design/20-jobs-events/jobs-and-events.md`
- `design/08-content/content-and-microcopy.md`
