# ADR-018 — Integraciones externas mediante ports/adapters específicos

**Estado:** Accepted — revalidated

## Decisión
Definir puertos semánticos por capacidad, por ejemplo `TransactionalEmailSender`, `ExternalIdentityProvider`, `CalendarProvider` y `CoordinationIntentInterpreter`. Los SDKs concretos viven en infraestructura.

No crear una abstracción universal de proveedor ni diseñar capacidades futuras antes de necesitarlas.
