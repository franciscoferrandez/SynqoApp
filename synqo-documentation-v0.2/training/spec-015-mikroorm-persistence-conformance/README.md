# SPEC-015 — Guía docente: conformidad de persistencia con MikroORM

> Esta guía explicará la implementación de la corrección. La fuente normativa es [`SPEC-015`](../../specs/SPEC-015-mikroorm-persistence-conformance.md) y sus referencias.

## Qué aprende la persona

Cómo distinguir una dependencia instalada de una decisión arquitectónica materializada: el ORM debe estar integrado en NestJS, registrar entidades y ejecutar los casos de uso de dominio.

## Antes de empezar

- Node.js 24 LTS y pnpm 12 mediante Corepack.
- MikroORM `7.2.2`; el adaptador oficial `@mikro-orm/nestjs` `7.1.0` es la versión publicada compatible con esa línea y NestJS 12.
- Configurar `DATABASE_URL`; las pruebas de integración crean su propio PostgreSQL mediante Testcontainers.

## Mapa del slice

- Entidades de Slice 1: [`quick-team.entities.ts`](../../../apps/api/src/entities/quick-team.entities.ts).
- Configuración diferida: [`mikro-orm.config.ts`](../../../apps/api/src/mikro-orm.config.ts) evita capturar `DATABASE_URL` antes de inicializar el entorno de prueba.
- Runtime NestJS: [`app.module.ts`](../../../apps/api/src/app.module.ts).
- Caso de uso y transacciones: [`teams.service.ts`](../../../apps/api/src/teams.service.ts).
- Prueba real de integración: [`teams.integration-spec.ts`](../../../apps/api/test/teams.integration-spec.ts).

## Recorrido guiado

`AppModule` inicializa MikroORM mediante el adaptador oficial. Las entidades reflejan las cuatro tablas ya existentes y el servicio recibe `EntityManager`; las altas de equipo y participante se ejecutan dentro de una transacción. No se introdujo un repositorio CRUD genérico.

La configuración se construye en una fábrica: así el runtime y Testcontainers resuelven `DATABASE_URL` al iniciar la aplicación, en vez de congelar un valor al importar un módulo.

## Diagrama

No es necesario: el mapa de artefactos y la transacción única describen el flujo sin añadir complejidad visual.

## Verificación

- `pnpm run ci` fue correcto el 2026-09-28: formato, lint, tipos, unit, integración, OpenAPI y build.
- El E2E se valida en CI con su propia API y PostgreSQL. Localmente no se consideró evidencia porque el puerto 3000 estaba ocupado por una API ajena a esta rama.
- La integración comprueba entidades registradas, contratos de Slice 1, aislamiento y rollback cuando falla la escritura de sesión.

## Límites y siguiente paso

Esta corrección no implementa disponibilidad ni cambia contratos de Slice 1. `pg.Client` permanece únicamente en el healthcheck técnico. Tras la Verification y fusión, SPEC-003 deberá actualizarse sobre el cimiento y superar su propio preflight.

## Ejercicios

1. Localiza qué evita que una consulta de salud se convierta en persistencia de dominio.
2. Explica por qué una fábrica de configuración evita que los tests usen accidentalmente la base local.
