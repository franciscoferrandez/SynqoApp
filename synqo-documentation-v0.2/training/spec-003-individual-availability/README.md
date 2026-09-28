# SPEC-003 — Guía docente: disponibilidad individual diaria

> Fuente normativa: [SPEC-003](../../specs/SPEC-003-individual-daily-availability.md). Esta guía se completará durante la implementación y no sustituye la SPEC ni el contrato OpenAPI.

## Qué aprende la persona

- Modelar disponibilidad diaria declarable y derivar `UNANSWERED` por ausencia.
- Aplicar upsert y retirada real, sesión contextual, CSRF e idempotencia a una mutación propia.

## Antes de empezar

Node 24 y pnpm 12.6.0. Comandos ejecutados: `pnpm test`, `pnpm test:integration`, `pnpm lint`, `pnpm typecheck`, `pnpm openapi:check`, `pnpm build` y `pnpm db:migrate`.

## Mapa del slice

- [Migración](../../../apps/api/src/migrations/Migration20260928000000.ts), [servicio](../../../apps/api/src/teams.service.ts), [controlador](../../../apps/api/src/teams.controller.ts) y [SCR-12](../../../apps/web/src/App.tsx).
- [Pruebas API](../../../apps/api/test/teams.integration-spec.ts) y [E2E](../../../apps/web/tests/app-shell.spec.ts).

## Recorrido guiado

El servidor obtiene el participante exclusivamente de `synqo_context_session`, aplica el upsert único por día y, mediante `DELETE`, retira solo la entrada propia. La ausencia se presenta como `Sin respuesta`, sin persistir un cuarto estado. La Lista navega por semanas y el Calendario por meses completos; sus días adyacentes visibles se muestran en tono secundario y se editan igual. El cambio de vista transforma el intervalo según CR-002. En Lista y diálogo, repetir el estado activo invoca la retirada.

## Diagrama

Pendiente: añadir Mermaid solo si aclara materialmente el flujo de lectura o actualización.

## Verificación

`pnpm test:integration` cubre persistencia, retirada idempotente, autorización contextual, CSRF y estados inválidos. `pnpm test:e2e` confirma que el participante guarda un estado, lo conserva tras recargar y navega/abre el diálogo mensual. La evidencia está indexada como `E-011`; CR-001 en `E-012` y CR-002 en `E-013`.

## Límites y siguiente paso

Coincidencias y disponibilidad colectiva pertenecen a SPEC-004; solicitudes, decisiones, notificaciones e IA quedan fuera de esta SPEC.

## Ejercicios

Explica por qué `UNANSWERED` no se guarda como valor y cómo el `teamId` de la sesión evita actualizar la disponibilidad de otro equipo.
