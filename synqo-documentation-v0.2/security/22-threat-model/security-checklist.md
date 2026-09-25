# 22 - Security Acceptance Checklist

Checklist previo a produccion para validar que el MVP de Synqo cumple el modelo de amenazas de la fase 22. Debe revisarse junto con `threat-model.md`, ADR-015, ADR-021 y ADR-022.

## 1. Enlaces y tokens

- [ ] Todos los tokens privilegiados tienen entropia suficiente y formato URL-safe sin datos codificados.
- [ ] Ningun token sensible se persiste en claro.
- [ ] `VerificationLink` y `RecoveryLink` son one-time y se invalidan transaccionalmente.
- [ ] `IdentifiedLink` tiene TTL, scope minimo, revocacion y canje server-side.
- [ ] El canje de cualquier token sensible termina en redirect a URL limpia.
- [ ] Reenvio de verificacion o recovery invalida credenciales anteriores del mismo alcance cuando corresponda.
- [ ] Los tokens expirados, usados o revocados devuelven error generico y no filtran estado interno.
- [ ] `targetPath` solo acepta rutas internas permitidas y no URLs absolutas.

## 2. Sesiones

- [ ] Las sesiones son opacas y server-side.
- [ ] Cookies de sesion usan `HttpOnly`, `Secure`, `SameSite=Lax` y `Path=/`.
- [ ] La sesion rota tras login/cuenta, canje identificado, verificacion/recovery admin y vinculacion participante-cuenta.
- [ ] `AdministrativeSession` tiene TTL corto y revocacion efectiva.
- [ ] `ParticipantSession` esta ligada a `teamId + participantId`.
- [ ] `AccountSession` no sustituye autorizacion contextual de participante/admin.
- [ ] Logout contextual revoca la sesion participant/admin activa.

## 3. Autorizacion contextual

- [ ] Cada endpoint sensible valida `actor + equipo + recurso + operacion + estado` en servidor.
- [ ] La UI no es el unico control de permisos.
- [ ] Recursos se consultan siempre acotados por equipo.
- [ ] Tests cross-team cubren disponibilidad, solicitudes, decisiones, resultados, links, settings e historico.
- [ ] Participante no puede administrar equipo sin `AdministrativeSession`.
- [ ] Admin sin `ParticipantSession` no responde disponibilidad, propuesta ni encuesta como participante.
- [ ] Las politicas `EVERYONE`/`ADMINISTRATORS` se aplican igual en API que en UI.

## 4. CSRF, CORS y navegador

- [ ] Toda mutacion con cookie requiere `X-CSRF-Token` valido o mecanismo equivalente.
- [ ] Origin/Referer se valida para mutaciones cuando proceda.
- [ ] CORS usa allowlist explicita.
- [ ] No existe mutacion destructiva por GET.
- [ ] CSP/Helmet estan activados con politica compatible con la app.
- [ ] `Referrer-Policy` evita fuga de tokens y paths sensibles.

## 5. Rate limiting y anti-abuso

- [ ] Hay rate limit especifico para `POST /teams/quick` y `POST /teams/managed`.
- [ ] Hay rate limit para `POST /teams/{teamRef}/participants`.
- [ ] Hay rate limit para `/access/exchange`, `/admin/verify` y `/admin/recover`.
- [ ] `POST /admin/recovery-requests` usa respuesta generica y cooldown por email hash/team/IP.
- [ ] El endpoint IA tiene limite de longitud y cuota por equipo/sesion/cuenta.
- [ ] Los limites no revelan existencia de email, equipo o token.
- [ ] Eventos `RATE_LIMITED` son observables sin registrar PII innecesaria.

## 6. Integridad y concurrencia

- [ ] `resolveDecision`, `closeDecision` y `cancelDecision` usan version/`If-Match` o control equivalente.
- [ ] Respuestas y disponibilidad se escriben con constraints por participante/equipo/recurso.
- [ ] Jobs de cierre/expiracion/limpieza son idempotentes.
- [ ] Idempotency keys se acotan por actor, equipo y operacion.
- [ ] Reutilizar idempotency key con payload diferente se rechaza o devuelve conflicto controlado.
- [ ] Las transiciones invalidas devuelven `INVALID_STATE_TRANSITION`.

## 7. Validacion e inyeccion

- [ ] Todos los DTOs de entrada tienen validacion de longitud, formato y enums.
- [ ] Fechas, rangos y limites de paginacion estan acotados.
- [ ] ORM usa queries parametrizadas.
- [ ] Salidas HTML/UI escapan texto de usuario.
- [ ] Campos `displayName`, `title`, `description`, `label`, `reason`, `targetPath` y texto IA tienen pruebas de payload malicioso.
- [ ] La salida LLM se valida contra schema y nunca se ejecuta como instruccion de dominio.

## 8. Logging, auditoria y privacidad

- [ ] Logger redacciona tokens, cookies, authorization headers, emails y campos sensibles.
- [ ] Analitica de producto no recibe tokens ni payloads completos sensibles.
- [ ] Eventos de auditoria registran actor contextual, operacion, recurso, resultado y timestamp sin secretos.
- [ ] Cambios de settings, resolucion, recovery, verificacion y revocacion de link generan auditoria.
- [ ] Logs de proveedor y observabilidad tienen retencion y acceso restringido.
- [ ] No se registran respuestas completas de disponibilidad/votos salvo necesidad justificada y minimizada.

## 9. Proveedores externos

- [ ] Emails de verificacion/recovery contienen solo informacion necesaria y enlaces de alcance minimo.
- [ ] Secretos del proveedor email no estan en el repositorio.
- [ ] Llamadas al LLM no incluyen tokens, cookies ni secretos.
- [ ] Contexto enviado al LLM esta minimizado.
- [ ] Fallos de proveedor no dejan transacciones de dominio a medias.
- [ ] Hay plan operativo para rotar secretos de email/LLM.

## 10. Evidencia minima de aceptacion

Antes de considerar lista la version productiva deben existir evidencias de:

- [ ] Tests automatizados de canje limpio, replay, expiracion y revocacion de tokens.
- [ ] Tests automatizados de IDOR cross-team para cada familia de recurso.
- [ ] Tests automatizados de CSRF/origin en mutaciones.
- [ ] Tests concurrentes de resolucion/cierre.
- [ ] Tests de redaccion de logs.
- [ ] Tests de rate limiting para endpoints publicos.
- [ ] Revision manual de payload anonimo/publico para evitar exposicion nominal.
- [ ] Revision de plantillas email y prompts IA frente a minimizacion de datos.

## 11. Criterio de bloqueo

Bloquea salida a produccion si cualquiera de estos puntos falla:

- tokens sensibles en logs, analytics o persistencia clara;
- mutacion sensible sin autorizacion server-side;
- IDOR reproducible entre equipos;
- endpoint admin accesible con solo `ParticipantSession`;
- recovery/verificacion reutilizable cuando deberia ser one-time;
- mutacion con cookie aceptada sin control CSRF equivalente;
- ausencia de rate limiting en endpoints publicos de recovery/canje/creacion.
