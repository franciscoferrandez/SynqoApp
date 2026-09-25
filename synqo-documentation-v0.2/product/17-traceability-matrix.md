# 17 — Matriz de trazabilidad

## Capacidades principales

La prioridad por requisito está definida en [`09b-requirements-prioritization.md`](09b-requirements-prioritization.md). Esta matriz muestra la prioridad dominante de cada capacidad como ayuda de navegación, no como sustituto de la clasificación requisito a requisito.

| Capacidad | Objetivos | RF | Prioridad dominante | HU | Flow | Pantalla |
|---|---|---|---|---|---|---|
| Equipo rápido | OBJ-01/02 | RF-EQR-* | Must | HU-EQ-01, HU-EQR-01 | UF-01, UF-21 | SCR-02/03/11 |
| Equipo administrable | OBJ-08/10 | RF-EQA-* | Should | HU-EQ-02, HU-EQA-* | UF-02/19 | SCR-04/05/26-30 |
| Participación sin cuenta | OBJ-02 | RF-ID-01, RF-PA-02, RF-ACC-* | Must | HU-EQ-03/04 | UF-03/04 | SCR-06 |
| Vinculación a cuenta | OBJ-08/09 | RF-ID-04..07 | Could | HU-ID-01/02 | UF-17/18 | SCR-07/08/09 |
| Disponibilidad | OBJ-03 | RF-DIS-* | Must | HU-DIS-01/02 | UF-05 | SCR-12 |
| Solicitud | OBJ-03/04 | RF-SD-* | Should | HU-SD-01/02 | UF-06 | SCR-14/15/16 |
| Coincidencias | OBJ-04 | RF-COI-*, RF-DIS-10..13 | Must | HU-DIS-03 | UF-07 | SCR-13 |
| Propuesta | OBJ-05/07 | RF-PRO-*, RF-RES-* | Must | HU-PRO-* | UF-07..10 | SCR-19/20/23 |
| Encuesta | OBJ-06/07 | RF-ENC-*, RF-RES-* | Must/Should | HU-ENC-* | UF-11..14 | SCR-21/22/23 |
| Deadline/cancelación | OBJ-07 | RF-CON-06/08/09 | Could/Should/Must | HU-CON-01/02 | UF-15/16 | SCR-20/22/24 |
| Pendientes | OBJ-09 | RF-PEN-* | Should | HU-PEN-* | UF-20 | SCR-08/11 |
| Histórico | OBJ-08 | RF-HIS-* | Should | HU-HIS-01 | transversal | SCR-24 |
| IA coordinación | OBJ-04/05 | RF-AI-* | Should producto / Required TFM | HU-AI-01 | UF-AI-01 | SCR-AI-01 |

## Recorridos E2E

### E2E-01 — Coordinación rápida

`visitante → equipo rápido → compartir → participantes sin cuenta → disponibilidad → coincidencias → propuesta → respuestas → resolución`.

Base del `Minimum Viable Validation`; sus capacidades centrales son `Must`.

### E2E-02 — Decisión general

`equipo → encuesta SINGLE/MULTIPLE → votos → resultado → resolución → histórico`.

La decisión `SINGLE` con resultado/resolución es `Must`; `MULTIPLE`, histórico enriquecido y visibilidades forman parte del Target MVP.

### E2E-03 — Uso continuado

`crear administrable sin cuenta → verificar email → configurar políticas → compartir → reutilizar → vincular opcionalmente a cuenta`.

Recorrido relevante para Target MVP y TFM, con prioridad de producto dominante `Should`. La cuenta y algunas recuperaciones son diferibles.

### E2E-AI-01 — Asistencia IA

`texto natural → interpretación estructurada → validación → cálculo determinista → revisar candidatos → propuesta`, con fallback manual si falla IA.

Ruta `Should` para el producto y `Required` para la demostración del TFM; sus salvaguardas de control humano, determinismo y minimización de datos son obligatorias.
