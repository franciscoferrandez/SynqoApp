# Arquitectura — Synqo

Arquitectura técnica para una aplicación pública de **coordinación y toma de decisiones colectivas**, capaz de funcionar con participantes sin cuenta y de ofrecer equipos rápidos temporales y equipos administrables persistentes.

## Estado

El modelo conceptual de producto, reglas, lifecycle funcional, permisos de alto nivel y recorridos están estabilizados en `../product/`. Continúan diferidos los agregados técnicos definitivos, límites transaccionales finos, esquema físico y endpoints concretos.

## Decisiones principales

- Web/PWA first; Capacitor futuro.
- React + TypeScript + Vite.
- SPA + API REST/OpenAPI.
- NestJS como monolito modular.
- PostgreSQL + MikroORM.
- Monorepo pnpm.
- Sesiones opacas server-side.
- Accesos por enlace con credenciales opacas y canje a sesión.
- Autorización contextual por equipo.
- pg-boss sobre PostgreSQL.
- Resend/Mailpit para email transaccional.
- IA detrás de un puerto/adaptador y limitada a interpretación estructurada.

## Documentos

- `decision-register.md`
- `adr-reconciliation.md`
- `adr/ADR-001...ADR-022`
- `diagrams/system-context.md`
- `diagrams/container-view.md`
- `diagrams/deployment-view.md`

## Regla documental

Las reglas de producto se documentan en `product/`. Un ADR solo registra una decisión arquitectónica significativa entre alternativas reales.
