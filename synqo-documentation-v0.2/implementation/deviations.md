# Implementation Deviations

Registrar aquí diferencias técnicas menores entre una SPEC y su implementación cuando no cambien producto, requisitos, reglas, contrato público, seguridad ni la Design Baseline.

Si la diferencia sí cambia alguno de esos elementos, detenerse y utilizar Change Control.

| ID | SPEC | Designed | Implemented | Reason | Accepted | Docs affected |
|---|---|---|---|---|---|---|
| DEV-001 | SPEC-001 | Dependencias actualizadas y compatibles | TypeScript `5.9.3` en lugar de TypeScript `7` | La versión 7 no es compatible todavía con `typescript-eslint` usado para el lint estricto. | Sí; excepción técnica sin impacto en baseline, producto ni contrato. | SPEC-001, `apps/api/package.json`, `apps/web/package.json` |
