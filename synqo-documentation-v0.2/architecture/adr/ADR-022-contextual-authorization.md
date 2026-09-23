# ADR-022 — Autorización contextual por equipo

**Estado:** Accepted

## Contexto
Los permisos de Synqo dependen de la modalidad del equipo, la condición de administrador y políticas simples como «todos» o «administradores». Un RBAC genérico configurable añadiría complejidad sin necesidad.

## Alternativas consideradas
- RBAC global y roles arbitrarios.
- ACL por recurso.
- Políticas server-side contextuales al equipo.

## Decisión
Centralizar la autorización en **políticas server-side contextuales** que evalúan actor + equipo + configuración + operación.

Ejemplos de capacidades:
- `createAvailabilityRequest`
- `createConsultation`
- `resolveConsultation`
- `manageTeam`
- `manageParticipants`

En un equipo rápido se aplican políticas predefinidas; en uno administrable, políticas configurables. La UI puede ocultar/deshabilitar acciones, pero la API siempre vuelve a validar.

## Justificación
Expresa directamente el modelo de producto, evita roles artificiales y reduce el riesgo de divergencia entre UI y servidor.
