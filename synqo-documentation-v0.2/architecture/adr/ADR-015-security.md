# ADR-015 — Seguridad transversal

**Estado:** Accepted — major revision

## Contexto
Synqo es pública y usa enlaces públicos, accesos identificados, sesiones de participante, recuperación administrativa y cuentas globales. Estas credenciales tienen capacidades distintas.

## Decisión
Baseline: TLS, cookies HttpOnly/Secure/SameSite, CSRF, Helmet/CSP, CORS allowlist, rate limiting, validación estricta, DTOs de salida, secretos fuera del repo, tokens criptográficamente seguros, hash de tokens persistidos, Dependabot, CodeQL y minimización de PII.

Además:
- autorización server-side en toda operación;
- aislamiento estricto entre equipos y prevención de IDOR;
- enlaces personalizados/administrativos con alcance mínimo y revocación;
- canje de token URL a sesión y redirección a URL limpia (ADR-021);
- no inferir identidad por nombre;
- protección contra session fixation y replay cuando corresponda;
- operaciones de resolución consistentes ante concurrencia;
- endpoints públicos sujetos a anti-abuso/rate limit.

## Threat model mínimo
Suplantación de participante, apropiación de identidad local, escalada Participant→Administrator, enumeración de IDs, reutilización de enlaces, fuga de tokens por logs/referrer/analytics y abuso de endpoints públicos.
