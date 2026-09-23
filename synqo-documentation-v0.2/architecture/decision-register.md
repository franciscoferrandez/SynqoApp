# Architecture Decision Register

| ID | Área | Estado reconciliado | Decisión resumida |
|---|---|---|---|
| ADR-001 | Plataforma | Accepted | Web/PWA first + Capacitor futuro |
| ADR-002A | Frontend | **Accepted** | React + TypeScript + Vite |
| ADR-002B | Frontend | **Rejected** | Angular no seleccionado |
| ADR-003 | Renderizado | Accepted | SPA/PWA frente a Next.js |
| ADR-004 | Backend | Accepted | NestJS + TypeScript |
| ADR-005 | Persistencia | Accepted | PostgreSQL + MikroORM |
| ADR-006 | API | Accepted | REST JSON + OpenAPI |
| ADR-007 | Repositorio | Accepted | pnpm workspaces |
| ADR-008 | Auth | Accepted, revised | sesiones opacas; cuenta/participante/admin separados |
| ADR-009 | Dev local | Accepted | web/api host; infra Docker |
| ADR-010 | Packaging | Accepted | Docker |
| ADR-011 | Hosting | Accepted | Railway inicial |
| ADR-012 | CI/CD | Accepted | GitHub Actions |
| ADR-013 | Observabilidad | Accepted, revised | Pino + Sentry + health + redacción sensible |
| ADR-014 | Testing | Accepted, revised | Vitest/Testing Library/Testcontainers/Playwright |
| ADR-015 | Seguridad | Accepted, revised | baseline web + threat model de enlaces/identidades |
| ADR-016 | Jobs | Accepted, revised | pg-boss sobre PostgreSQL |
| ADR-017 | Email | Accepted, revised | Resend prod + Mailpit; email transaccional separado de notificaciones |
| ADR-018 | Integraciones | Accepted | ports/adapters semánticos |
| ADR-019 | IA | **Accepted, rewritten** | LLM como intérprete de restricciones estructuradas |
| ADR-020 | Proceso | Accepted, revised | trunk-based + ADR + separación product/architecture |
| ADR-021 | Acceso por enlaces | **Accepted (nuevo)** | credenciales opacas acotadas, canje a sesión y URL limpia |
| ADR-022 | Autorización | **Accepted (nuevo)** | políticas contextuales por equipo, no RBAC genérico |

## Decisiones todavía diferidas

- agregados y límites transaccionales definitivos;
- esquema físico de datos;
- estrategia final de identificadores públicos/internos;
- proveedor/modelo LLM concreto;
- lifecycle temporal con plazos exactos;
- política definitiva de borrado/anonimización;
- calendario externo y push;
- staging permanente / IaC avanzada.
