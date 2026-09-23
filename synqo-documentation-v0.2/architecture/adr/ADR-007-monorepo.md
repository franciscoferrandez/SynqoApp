# ADR-007 — Monorepo con pnpm workspaces

**Estado:** Accepted

## Contexto
Existirán al menos una aplicación web y una API, ambas TypeScript, además de configuración, documentación y cliente API generado.

## Alternativas consideradas
- pnpm workspaces.
- Nx.
- Repositorios separados.

## Decisión
Usar un **monorepo pnpm** sin Nx/Turborepo inicialmente.

## Estructura inicial
```text
apps/
  web/
  api/
packages/
  api-client/
  eslint-config/
  tsconfig/
infra/
docs/
```

## Justificación
Permite tooling común y coordinación de cambios sin introducir un orquestador complejo antes de necesitarlo.

## Consecuencias
### Positivas
- Un único repositorio y CI.
- Configuración compartida.
- Facilita generación del cliente API.

### Negativas / trade-offs
- Riesgo de acoplamiento accidental entre apps.
- Requiere reglas claras de dependencias.

## Condiciones para revisar la decisión
Añadir Nx/Turborepo solo si crece el número de paquetes, los tiempos de CI o la necesidad de caching incremental.
