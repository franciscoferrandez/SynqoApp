# Metrics Register

Lugar para métricas que tengan una pregunta clara, una fuente objetiva y un uso posterior en la memoria. No contiene valores inventados.

| ID | Métrica | Categoría | Fuente | Valor | Fecha | Observaciones |
|---|---|---|---|---|---|---|
| MET-001 | Pruebas automatizadas de Slice 0 | Calidad | `pnpm run ci` y `pnpm test:e2e` | 6 pruebas correctas: 3 unitarias, 2 de integración y 1 E2E | 2026-09-25 | No representa cobertura de producto; solo el bootstrap. |
| MET-002 | Validación del contrato OpenAPI | Calidad | `pnpm openapi:check` dentro de `pnpm run ci` | 0 errores; 47 advertencias preexistentes | 2026-09-25 | No se modificó el contrato por estar fuera del alcance de Slice 0. |

## Métricas candidatas

Se podrán registrar, cuando exista una fuente objetiva y sean útiles:

- **Desarrollo:** número de SPEC, SPEC Verified/total, Change Requests, desviaciones, bugs, lead time y cobertura cuando pueda medirse.
- **Calidad:** suites unit/integration/E2E, fallos de build, defectos de Verification, RF `Must`/`Should` implementados.
- **IA de desarrollo:** tareas asistidas y resultados `Accepted`/`Modified`/`Rejected`, con incidencias identificables.
- **IA de producto:** schema-valid rate, exact match, field accuracy, clarification/unsupported detection, latencia, tokens y coste.

No se mide por obligación: cada métrica necesita una fuente y una pregunta que ayude a evaluar el proyecto.
