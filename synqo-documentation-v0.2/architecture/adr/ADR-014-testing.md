# ADR-014 — Estrategia de testing

**Estado:** Accepted — revised

## Decisión
Vitest para unit/application tests, Testing Library para frontend, Testcontainers con PostgreSQL real para integración y Playwright para E2E. Sin porcentaje global arbitrario inicial.

## Recorridos E2E obligatorios
- E2E-01: coordinación rápida sin cuenta → disponibilidad → propuesta → resolución.
- E2E-02: encuesta SINGLE/MULTIPLE → voto → resultado → resolución.
- E2E-03: administrable sin cuenta → email → verificación → políticas → participación.
- E2E-AI-01: texto → interpretación → validación → candidatos → propuesta, con fake adapter en CI normal.

## Casos de integración de especial riesgo
Permisos, accesos identificados, canje/revocación de tokens, vinculación Participant↔Account, deadlines, expiración, idempotencia y doble resolución concurrente.

## Tiempo
Los lifecycles temporales usarán reloj inyectable/fake clock para evitar tests dependientes de espera real.
