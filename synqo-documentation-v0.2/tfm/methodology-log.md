# Methodology Log

Registro de hitos metodológicos, no diario de actividad.

| Fecha | Fase | Evento | Método aplicado | Resultado |
|---|---|---|---|---|
| 2026-09-24 | Implementation preparation | Design Baseline v1.0 preparada | Waterfall macro: cierre de análisis/diseño antes de implementation | Operativa lista; implementación aún no iniciada. |
| 2026-09-24 | Implementation preparation | Spec-First SDD formalizado | SPEC -> CODE, Change Control y Verification obligatoria | `SPEC-001` identificado como siguiente unidad Planned. |
| 2026-09-25 | Implementation preparation | SPEC-001 preparada y marcada Ready | Revisión de fuentes, trazabilidad, criterios Given/When/Then y tests requeridos antes de código | Primera unidad implementable lista para pasar a SDD implementation. |
| 2026-09-25 | Implementation and verification | SPEC-001 implementada y verificada | Spec-First: implementación mínima, pruebas unitarias/integración/E2E, gates de calidad y smoke manual antes de la siguiente SPEC | Slice 0 aceptada sin funcionalidad de producto ni cambio de baseline. |
| 2026-09-25 | Implementation and verification | Viabilidad operativa de CodeQL evaluada | Se comprobó el fallo de publicación de resultados en repositorio privado, se verificó CodeQL con el repositorio público y se documentó una alternativa futura sin cambiar la baseline | CodeQL permanece como control vigente. Un eventual retorno a repositorio privado sin GitHub Code Security requerirá CR previa. |

Los próximos hitos deberán registrar inicio de implementation, SPECs Ready/Verified, slices completados, Verification, Deployment y evaluación TFM cuando ocurran realmente.
