# Spec Register

Registro de unidades Spec-First. El orden traduce el roadmap sin modificarlo: primero enablement y dependencias técnicas, después el núcleo `Must`, y más tarde capacidades `Should`/`Could` y la entrega IA.

| ID | Title | Slice | Priority | Status | Depends on | Requirements |
|---|---|---:|---|---|---|---|
| SPEC-001 | Bootstrap del repositorio y toolchain | 0 | Enablement | Ready | — | RNF release blockers, ADR base |
| SPEC-002 | Crear equipo rápido y acceso de participante | 1 | Must | Planned | SPEC-001 | RF-ID-01, RF-ID-03, RF-ACC-01, RF-ACC-04, RF-ACC-05, RF-EQR-01, RF-EQR-02, RF-EQR-09, RF-PA-01, RF-PA-02 |
| SPEC-003 | Registrar disponibilidad individual diaria | 2 | Must | Planned | SPEC-002 | RF-DIS-01..RF-DIS-09, RF-EQR-09 |
| SPEC-004 | Disponibilidad colectiva y coincidencias deterministas | 3 | Must/Should | Planned | SPEC-003 | RF-DIS-10..RF-DIS-13, RF-COI-01..RF-COI-05 |
| SPEC-005 | Propuesta temporal, resultado y resolución | 4 | Must | Planned | SPEC-002, SPEC-004 | RF-CON-01..RF-CON-13, RF-PRO-01..RF-PRO-14, RF-RES-01, RF-RES-02, RF-RES-05..RF-RES-07 |
| SPEC-006 | Encuesta SINGLE y resolución explícita | 5 | Must | SPEC-002, SPEC-005 | RF-ENC-01..RF-ENC-14, RF-CON-*, RF-RES-* |
| SPEC-007 | Solicitud de disponibilidad | 6 | Should | SPEC-003 | RF-SD-01..RF-SD-07 |
| SPEC-008 | Equipo administrable y verificación | 7 | Should | SPEC-002 | RF-EQA-01..RF-EQA-17, RF-ID-08, RF-RES-03 |
| SPEC-009 | Cuenta y vinculación de participante | 8 | Could | SPEC-002 | RF-ID-02..RF-ID-07, RF-PEN-03, RF-HIS-03 |
| SPEC-010 | Deadlines, lifecycle, jobs y purga | 9 | Must/Should | SPEC-002, SPEC-005, SPEC-007 | RF-EQR-03..RF-EQR-15, RF-CON-06, RF-CON-08, RF-HIS-05, RF-HIS-06 |
| SPEC-011 | Emails transaccionales y recovery administrativo | 10 | Should | SPEC-008 | RF-ID-08, RF-EQA-*, RNF-SEC-* |
| SPEC-012 | Asistencia IA para restricciones de coordinación | 11 | Should / TFM Required | SPEC-004, SPEC-005 | RF-AI-01..RF-AI-12 |
| SPEC-013 | Encuesta MULTIPLE y visibilidad avanzada | 5 | Should | SPEC-006 | RF-ENC-*, RF-RES-06 |
| SPEC-014 | Histórico, pendientes y continuidad global enriquecida | 8/9 | Could | SPEC-005, SPEC-006, SPEC-009 | RF-PEN-*, RF-HIS-* |

Los rangos de requisitos siguen la nomenclatura de `product/09-functional-requirements.md`; la SPEC concreta debe verificar la lista exacta antes de pasar a `Ready`. `SPEC-001` es la primera unidad que debe prepararse: habilita la ejecución local, las pruebas y las siguientes slices sin introducir comportamiento de producto.
