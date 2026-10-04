---
id: ADR-COO-003
estado: aprobado
---

# ADR-COO-003 — Usar JSON y Problem Details como contrato de la API

## Contexto

[ADR-COO-001 — Separar interfaz web y API para la demo local](adr-coo-001-estructura-demo-local.md) establece una web Angular que consume una API Symfony con API Platform. La demo y una posible aplicación móvil posterior necesitan un contrato fácil de consumir y de revisar sin acoplar los clientes a Hydra. La persona que impulsa Synqo eligió expresamente JSON sencillo para los recursos, Problem Details para errores y OpenAPI como referencia principal del contrato.

## Drivers

- La web y otros clientes deben interpretar los mismos recursos y errores sin depender de metadatos de hipermedia específicos de API Platform.
- [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](adr-equ-003-verificar-enlace-en-api.md) requiere representar de modo consistente la ausencia de credencial, el enlace inválido y la caducidad sin exponer datos del equipo.
- [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md) separa el contrato HTTP de las entidades y reglas internas.

## Opciones consideradas

| Opción | Ventaja | Coste para Synqo |
|---|---|---|
| JSON-LD/Hydra de API Platform | Metadatos de hipermedia y relaciones semánticas integradas. | Los clientes deben conocer convenciones que Synqo todavía no necesita. |
| JSON sencillo para recursos, Problem Details para errores y OpenAPI para documentar | Representaciones directas para Angular y otros clientes; errores con un formato estándar y contrato legible por herramientas. | Hay que declarar y verificar explícitamente operaciones, esquemas, errores y enlaces necesarios; se renuncia por ahora a la hipermedia de Hydra. |

## Decisión

Las respuestas de recursos de la API usarán `application/json`. No se ofrecerá JSON-LD/Hydra como contrato para los clientes de Synqo mientras no aparezca una necesidad concreta de hipermedia o interoperabilidad semántica.

Los errores usarán `application/problem+json` conforme a [Problem Details, RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html), que sustituye a RFC 7807. El contrato mantendrá una estructura consistente para validación, reglas de negocio, acceso, recurso no encontrado y errores internos. Las respuestas internas no revelarán secretos ni detalles del servidor. La [convención HTTP común](../../06_arquitectura/03_modulos/API/convencion-http.md) fija códigos y campos reutilizables; cada SPEC asignará los códigos aplicables y definirá los tipos de problema o extensiones propios de sus operaciones.

OpenAPI será la referencia principal del contrato entre backend y clientes: operaciones, entradas, salidas, autenticación y respuestas de error deberán aparecer allí y coincidir con el comportamiento comprobado. API Platform puede generar esa descripción desde operaciones y modelos públicos explícitos; no se expondrán automáticamente operaciones de entidades Doctrine sin revisar su contrato. La decisión no fija todavía los endpoints ni los cuerpos concretos de cada capacidad.

## Consecuencias positivas

- Angular consume representaciones y errores sin lógica de Hydra.
- El formato de errores es común a capacidades presentes y futuras.
- OpenAPI permite revisar el contrato antes de conectar cada cliente y contrastarlo con pruebas de API.

## Consecuencias negativas

- Los enlaces y relaciones útiles para clientes deben definirse explícitamente cuando hagan falta.
- La configuración de formatos de API Platform y su documentación generada deben verificarse; sus valores predeterminados no expresan por sí solos esta decisión.
- Un cambio futuro a hipermedia o a otro formato requeriría una nueva evaluación de compatibilidad de clientes.

## Evidencia / Research

- Decisión expresa de la persona que impulsa Synqo sobre JSON, Problem Details y OpenAPI.
- [API Platform — negociación de formatos](https://api-platform.com/docs/core/content-negotiation/).
- [API Platform — tratamiento de errores](https://api-platform.com/docs/core/errors/).
- [API Platform — soporte OpenAPI](https://api-platform.com/docs/core/openapi/).
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html).

## Sustituye

Ninguna decisión anterior. Concreta el contrato público previsto en [ADR-COO-001 — Separar interfaz web y API para la demo local](adr-coo-001-estructura-demo-local.md).

## Sustituido por

No aplica.
