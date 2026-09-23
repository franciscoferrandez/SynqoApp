# ADR-008 — Sesiones opacas y separación de identidades

**Estado:** Accepted — major revision

## Contexto
Synqo tiene tres nociones que no deben colapsarse: **Cuenta global**, **Participante dentro de un equipo** y **capacidad administrativa sobre un equipo**. Las capacidades esenciales pueden usarse sin cuenta y un administrador puede existir inicialmente mediante email verificado.

## Alternativas consideradas
- Sesiones opacas server-side por contexto.
- JWT access/refresh como mecanismo principal.
- Exigir cuenta global para toda identidad.

## Decisión
Usar sesiones opacas server-side persistidas inicialmente en PostgreSQL.

- Web/PWA: cookie `HttpOnly`, `Secure`, `SameSite`, con CSRF donde corresponda.
- Cuenta: sesión de cuenta tras passwordless email y/o proveedor OIDC compatible.
- Participante sin cuenta: `participation session` limitada a `teamId + participantId` y permisos contextuales.
- Administrador sin cuenta: `administrative session` obtenida tras verificación/recovery de identidad administrativa.
- Cliente Capacitor futuro: podrá usar token opaco Bearer almacenado de forma segura.

## Justificación
No se necesita autenticación stateless. Las sesiones opacas permiten revocación inmediata y expresan mejor los distintos contextos de identidad sin forzar que Participant = Account.

## Consecuencias
Mayor claridad del modelo de identidad; acceso de sesión en servidor por request; cookies requieren controles CSRF; la autorización se resuelve mediante ADR-022.
