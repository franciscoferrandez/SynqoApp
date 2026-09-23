# ADR-013 — Observabilidad proporcional al MVP

**Estado:** Accepted — revised

## Decisión
Pino con logs JSON estructurados y correlation id; Sentry frontend/backend; health endpoints con NestJS Terminus.

## Reglas adicionales
No registrar tokens de sesión, magic/identified/admin links, secretos, query strings sensibles ni PII innecesaria. Configurar redacción/sanitización antes de enviar errores a terceros.

Para IA registrar proveedor/modelo, promptVersion/schemaVersion, latencia, consumo y estado de validación, evitando disponibilidad nominal y PII.

## Revisar si
Múltiples servicios, SLIs/SLOs formales o tracing distribuido justifican OpenTelemetry/Prometheus.
