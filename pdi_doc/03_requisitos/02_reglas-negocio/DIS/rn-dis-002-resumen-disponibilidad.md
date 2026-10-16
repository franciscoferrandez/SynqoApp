---
id: RN-DIS-002
estado: en_revision
---

# RN-DIS-002 — Resumen diario de disponibilidad

## Regla

Para cada día del calendario, se consideran solo las marcas vigentes de disponibilidad de los participantes del equipo. «Sin marcar» no participa en el cálculo ni en los recuentos. El resumen muestra el número de marcas de cada uno de los tres valores. Si no hay ninguna marca indicada, el resultado es neutro con cualquier regla. «Neutro» es un resultado del calendario, no un valor de disponibilidad de un participante.

La persona que consulta el calendario puede elegir una de estas reglas para el resultado agregado, ordenadas de menos a más favorables como no disponible, quizá y disponible:

- **Peor disponibilidad:** muestra el peor estado indicado. Es la regla predeterminada si no hay una elección válida recordada.
- **Mediana de las marcas:** ordena las marcas de peor a mejor y toma la central. Con un número par de marcas, si las dos centrales coinciden se conserva ese estado; si son disponible y no disponible resulta quizá; si una es quizá y la otra es disponible o no disponible, resulta la más favorable de las dos.
- **Estado más frecuente:** muestra el estado con mayor número de marcas. Si varios estados empatan en la frecuencia máxima, muestra el más favorable entre los empatados.

La elección cambia solo el resultado agregado que ve esa persona; no modifica las marcas, los recuentos ni el resultado de las consultas. Se recuerda en el navegador del dispositivo para los calendarios que abra allí, sin imponer la elección a los demás miembros del equipo.

## Justificación

El calendario permite consultar la misma distribución de marcas con distintos criterios de resumen, sin ocultar los recuentos que producen cada resultado. La regla histórica de peor disponibilidad se conserva como valor inicial.

## Casos de referencia

| Marcas indicadas | Peor disponibilidad | Mediana | Estado más frecuente |
|---|---|---|---|
| Dos disponibles y una no disponible | No disponible | Disponible | Disponible |
| Una disponible y una no disponible | No disponible | Quizá | Disponible |
| Una quizá y una no disponible | No disponible | Quizá | Quizá |
| Tres disponibles, dos quizá y dos no disponibles | No disponible | Quizá | Disponible |
| Una quizá | Quizá | Quizá | Quizá |
| Ninguna | Neutro | Neutro | Neutro |

## Origen

Decisión expresa de quien impulsa Synqo sobre el cálculo inicial y el tratamiento de las marcas ausentes. En octubre de 2026 decidió conservarlo como predeterminado y añadir mediana y estado más frecuente, con los desempates descritos arriba y elección recordada en el dispositivo.

## Relaciones

- [RF-DIS-002 — Consultar el visor de disponibilidad](../../01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RN-DIS-001 — Disponibilidad diaria del equipo](rn-dis-001-disponibilidad-del-equipo.md)
