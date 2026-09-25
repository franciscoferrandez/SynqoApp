# Mapa Producto ↔ Arquitectura

La criticidad de producto se define en `product/09b-requirements-prioritization.md`. Las fases técnicas posteriores deben consultar esa priorización para ordenar vertical slices, tests e invariantes, sin convertir MoSCoW en una decisión arquitectónica.

| Necesidad / requisito | Decisiones arquitectónicas relacionadas |
|---|---|
| Web inmediata, deep links, uso móvil | ADR-001, ADR-002A, ADR-003 |
| Cuenta opcional y participantes sin cuenta | ADR-008, ADR-021, ADR-022 |
| Admin por email sin cuenta | ADR-008, ADR-017, ADR-021, ADR-022 |
| Aislamiento entre equipos | ADR-005, ADR-015, ADR-022 |
| Disponibilidad, consultas e histórico relacionales | ADR-004, ADR-005, ADR-006 |
| Deadlines y lifecycle temporal | ADR-005, ADR-016 |
| Expiración y limpieza de equipos rápidos | ADR-016 |
| Emails de verificación/recovery | ADR-016, ADR-017, ADR-018 |
| Respuestas idempotentes / resolución concurrente | ADR-005, ADR-014, ADR-015 |
| Observabilidad sin filtrar tokens/PII | ADR-013, ADR-015 |
| Flujos críticos verificables | ADR-014 |
| Asistente de lenguaje natural | ADR-018, ADR-019 |
| AI fallback manual y no mutante | ADR-019, ADR-022 |
| Proceso y documentación trazable | ADR-012, ADR-020 |

## Separación de responsabilidades

```text
Producto determina:
- qué significa Disponible/Quizá/No disponible;
- quién puede resolver según modalidad/política;
- qué es Propuesta/Encuesta/Resolución;
- qué flujos y estados debe percibir el usuario.

Arquitectura determina:
- cómo se autentican y mantienen sesiones;
- cómo se protegen enlaces;
- cómo se aplican permisos en servidor;
- cómo se persiste y procesa asincronía;
- cómo se integra un proveedor IA.
```
