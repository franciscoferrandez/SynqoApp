---
id: RN-DIS-002
estado: en_revision
---

# RN-DIS-002 — Resumen diario de disponibilidad

## Regla

Para cada día del calendario, se consideran solo las marcas vigentes de disponibilidad de los participantes del equipo. «Sin marcar» no participa en el cálculo ni en los recuentos.

El resumen muestra el peor estado indicado según este orden: no disponible, quizá, disponible. También muestra el número de marcas de cada uno de esos tres valores. Si no hay ninguna marca indicada, el resumen del día es neutro. «Neutro» es un resultado del calendario, no un valor de disponibilidad de un participante.

## Justificación

El calendario debe hacer visible tanto el estado más restrictivo del día como la distribución de disponibilidades que lo produce.

## Casos de referencia

| Marcas indicadas | Estado agregado |
|---|---|
| Dos disponibles y una no disponible | No disponible |
| Una disponible y una quizá | Quizá |
| Una quizá | Quizá |
| Ninguna | Neutro |

## Origen

Decisión expresa de quien impulsa Synqo sobre el cálculo y el tratamiento de las marcas ausentes.

## Relaciones

- [RF-DIS-002 — Consultar el visor de disponibilidad](../../01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RN-DIS-001 — Disponibilidad diaria del equipo](rn-dis-001-disponibilidad-del-equipo.md)
