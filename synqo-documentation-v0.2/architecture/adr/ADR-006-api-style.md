# ADR-006 — API REST + OpenAPI

**Estado:** Accepted

## Contexto
Frontend y backend deben permanecer desacoplados aunque ambos usen TypeScript. Se desea un contrato explícito y documentable.

## Alternativas consideradas
- REST JSON + OpenAPI.
- GraphQL.
- tRPC.

## Decisión
Exponer **REST JSON** y describir el contrato mediante **OpenAPI**. Generar tipos/cliente TypeScript a partir del contrato.

## Justificación
REST resuelve el dominio previsto con menor complejidad. OpenAPI mantiene la frontera tecnológica, evita duplicación manual de tipos y permite documentar/probar la API.

## Consecuencias
### Positivas
- Contrato independiente del framework.
- Tipos generables para frontend.
- Buena interoperabilidad futura.

### Negativas / trade-offs
- Algunas consultas pueden requerir endpoints específicos.
- Evolución incompatible deberá gestionarse conscientemente.

## Condiciones para revisar la decisión
Revisar si aparecen múltiples consumidores con necesidades de consulta radicalmente distintas que justifiquen GraphQL.
