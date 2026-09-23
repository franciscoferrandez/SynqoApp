# ADR-004 — Backend con NestJS

**Estado:** Accepted

## Contexto
Se requiere un monolito modular, API REST, PostgreSQL, autenticación, jobs, integraciones y una arquitectura de dominio mantenible. El frontend será TypeScript.

## Alternativas consideradas
- NestJS.
- Symfony 7.4 LTS.
- Laravel.

## Decisión
Adoptar **NestJS + TypeScript**.

## Justificación
NestJS proporciona módulos, DI, guards, pipes e interceptors adecuados para una arquitectura modular. Comparte TypeScript con el frontend, permite un entorno local ligero fuera de Docker y no impide una separación Domain/Application/Infrastructure/Presentation. Symfony fue una alternativa finalista fuerte; NestJS se elige por DX homogénea, menor cambio de contexto entre extremos y buen encaje con el modelo de desarrollo local.

## Consecuencias
### Positivas
- Un lenguaje principal en frontend/backend.
- Modularidad explícita.
- Excelente integración con OpenAPI.
- Desarrollo local ágil.

### Negativas / trade-offs
- Menor experiencia previa que Symfony.
- Ecosistema backend Node requiere más decisiones en persistencia/jobs.
- Debe evitarse acoplar frontend y entidades del backend solo por compartir TypeScript.

## Condiciones para revisar la decisión
Revisar antes de implementación si aparecen limitaciones operativas o de persistencia no previstas, o si el coste de aprendizaje amenaza el calendario del TFM.
