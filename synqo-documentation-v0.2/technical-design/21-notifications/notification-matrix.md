# 21 — Notification Matrix

## 1. Propósito

Este documento cierra la política de comunicación externa del MVP de Synqo. Distingue email transaccional de identidad/seguridad, pendientes in-app y enlaces compartidos manualmente, sin convertir Synqo en una plataforma de mensajería.

Fuentes: ADR-017, `OPEN-08`, requisitos funcionales, jobs/eventos de fase 20 y microcopy de fase 08.

## 2. Política cerrada

`OPEN-08` queda acotado así:

- En el MVP no hay notificaciones externas automáticas de actividad de producto.
- No se envían emails automáticos por nueva solicitud, propuesta, encuesta, recordatorio, cierre, vencimiento, resolución, cancelación o expiración de equipo rápido.
- El email externo del MVP se limita a identidad/seguridad:
  - verificación administrativa;
  - recuperación administrativa;
  - autenticación/verificación de cuenta si el flujo de cuenta se implementa.
- Las señales de producto se resuelven mediante:
  - UI;
  - pendientes in-app;
  - deep links;
  - enlace preparado/Web Share API compartido manualmente por usuarios.

## 3. Canales

| Canal | MVP | Uso |
|---|---|---|
| Email transaccional | Sí | Identidad, verificación y recuperación. |
| Pendiente in-app | Sí | Solicitudes, propuestas, encuestas y acciones abiertas. |
| Enlace manual / Web Share API | Sí | Compartir equipo/recurso por el canal elegido por el usuario. |
| WhatsApp Business/API | No | Fuera del MVP. |
| Push | No | Diferido. |
| Email de actividad | No | Fuera del MVP salvo futura evidencia. |
| Chat | No | Fuera del MVP. |

## 4. Matriz evento × canal

| Evento | Canal | Destinatario | Obligatoriedad | Opt-out | Deep link | Datos mínimos |
|---|---|---|---|---|---|---|
| Crear equipo administrable | Email transaccional | Email administrativo indicado | Obligatorio para activar administración | No | Sí, verification link one-time | Nombre del equipo, enlace, expiración aproximada si se muestra. |
| Reenviar verificación administrativa | Email transaccional | Email administrativo indicado | Obligatorio si se solicita reenvío | No | Sí, verification link nuevo | Nombre del equipo, enlace. |
| Solicitar recuperación administrativa | Email transaccional | Email admin elegible | Obligatorio si hay coincidencia elegible | No | Sí, recovery link one-time | Nombre del equipo, enlace. |
| Solicitar recuperación administrativa sin coincidencia | Ninguno externo | Nadie | No aplica | No aplica | No | Respuesta API genérica, sin revelar existencia. |
| Autenticación/verificación de cuenta | Email transaccional | Email de cuenta | Condicional si se implementa cuenta/passwordless | No | Sí, account auth link | Enlace y contexto mínimo. |
| Crear equipo rápido | In-app + enlace manual | Creador y personas con enlace compartido manualmente | In-app obligatorio; externo manual | No aplica | Sí, public link/manual | Nombre del equipo y URL. |
| Crear participante | In-app | Participante actual | Obligatorio en UI | No aplica | No necesario | Nombre visible y equipo. |
| Crear solicitud de disponibilidad | Pendiente in-app + enlace manual opcional | Participantes activos que abran el equipo/enlace | In-app obligatorio | No aplica | Sí, link manual si alguien lo comparte | Título/rango, no email automático. |
| Deadline de solicitud | In-app/on-read | Participantes del equipo | Obligatorio como estado UI | No aplica | No externo | Estado cerrada. |
| Crear propuesta | Pendiente in-app + enlace manual opcional | Participantes activos que abran el equipo/enlace | In-app obligatorio | No aplica | Sí, link manual si alguien lo comparte | Título/opciones visibles en app. |
| Responder propuesta | In-app/result update | Participantes con acceso | Obligatorio en UI | No aplica | No externo | Resultado actualizado al consultar. |
| Deadline de propuesta | In-app/on-read | Participantes con acceso | Obligatorio como estado UI | No aplica | No externo | Cerrada, pendiente de resolución. |
| Resolver propuesta | In-app/histórico | Participantes con acceso | Obligatorio en UI | No aplica | No externo | Decisión final visible al consultar. |
| Cancelar propuesta | In-app/histórico | Participantes con acceso | Obligatorio en UI | No aplica | No externo | Estado cancelada. |
| Crear encuesta | Pendiente in-app + enlace manual opcional | Participantes activos que abran el equipo/enlace | In-app obligatorio | No aplica | Sí, link manual si alguien lo comparte | Título/opciones visibles en app. |
| Votar encuesta | In-app/result update | Participantes con acceso | Obligatorio en UI | No aplica | No externo | Recuento/visibilidad según encuesta. |
| Resolver encuesta | In-app/histórico | Participantes con acceso | Obligatorio en UI | No aplica | No externo | Decisión final visible al consultar. |
| Equipo rápido pasa a recuperable | In-app/on-access | Quien acceda con sesión/enlace válido | Obligatorio como estado UI | No aplica | No externo | Mensaje de recuperación. |
| Equipo rápido expira definitivamente | In-app/on-access si procede | Quien intente acceder | Obligatorio como estado UI | No aplica | No externo | Mensaje de expiración definitiva, sin datos recuperables. |
| Vincular participante a cuenta | In-app | Usuario actual | Obligatorio como feedback | No aplica | No externo | Confirmación de vínculo. |
| IA interpreta coordinación | In-app | Usuario actual | Obligatorio como revisión | No aplica | No externo | Interpretación y candidatos. |

## 5. Pendientes in-app

Los pendientes in-app son el mecanismo principal para actividad de producto.

Incluyen:

- solicitud de disponibilidad abierta y no respondida;
- propuesta abierta sin respuesta propia;
- encuesta abierta sin voto propio;
- consulta cerrada pendiente de decisión final cuando el actor puede resolver;
- equipo rápido en periodo recuperable cuando el usuario accede.

No incluyen:

- emails automáticos;
- push;
- recordatorios externos;
- destinatarios parciales arbitrarios;
- notificaciones a participantes sin email.

## 6. Compartición manual

Synqo puede preparar enlaces para:

- compartir equipo;
- compartir solicitud;
- compartir propuesta;
- compartir encuesta;
- crear enlace personal cuando el flujo lo soporte.

Reglas:

- El usuario elige el canal externo.
- Synqo no envía el mensaje externo automáticamente en MVP.
- Web Share API puede abrir el share sheet del dispositivo, pero no implica integración con WhatsApp Business ni tracking de entrega.
- El enlace nunca concede capacidades superiores a su scope.

## 7. Seguridad de enlaces en emails

| Regla | Aplicación |
|---|---|
| Token opaco | El enlace no codifica datos de negocio ni identidad legible. |
| Hash en servidor | Solo se persiste hash/metadata, nunca token claro. |
| TTL corto | Verificación admin y recovery tienen expiración limitada. |
| One-time | Verification/recovery son de un solo uso. |
| Clean redirect | Tras canje, la URL final no conserva token. |
| Mínima información | El email evita listar participantes, disponibilidad, votos o resultados. |
| No datos nominales innecesarios | No incluir nombres de participantes ni respuestas. |
| No autoactividad | Abrir/preview de email no renueva lifecycle ni consume acciones destructivas por GET. |

## 8. Opt-out y consentimiento

| Tipo | Opt-out | Motivo |
|---|---|---|
| Verificación administrativa | No | Necesaria para activar administración. |
| Recuperación administrativa | No | Solicitada por el usuario y necesaria para recuperar acceso. |
| Cuenta/passwordless | No para el email solicitado | Necesaria para autenticar/verificar. |
| Actividad de producto | No aplica en MVP | No se envía externamente. |
| Futuras notificaciones opcionales | Sí | Deberán tener preferencias explícitas y base funcional nueva. |

## 9. Impacto en participantes sin email

- Un participante puede existir y completar flujos esenciales sin email.
- No se solicita email a participantes solo para enviar notificaciones.
- Las actividades del MVP deben ser accesibles por sesión contextual, deep link o navegación del equipo.
- Si una cuenta se vincula, el email de cuenta no cambia la identidad local ni habilita notificaciones de actividad por defecto.

## 10. Referencias

- `architecture/adr/ADR-017-email-notifications.md`
- `product/19-open-questions.md`
- `product/09-functional-requirements.md`
- `technical-design/20-jobs-events/jobs-and-events.md`
- `design/08-content/content-and-microcopy.md`
