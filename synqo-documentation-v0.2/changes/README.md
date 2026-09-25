# Change Control

Una Change Request (`CR`) controla cualquier modificación de la Design Baseline. Se usa para cambios de producto, requisitos, prioridad `Must`, RNF crítico, reglas, invariantes, lifecycle, autorización, identidad, privacidad, contrato API público, datos relevantes, ADR aceptado, seguridad o comportamiento IA especificado.

El flujo es:

1. Crear la CR desde [`CHANGE-REQUEST-TEMPLATE.md`](CHANGE-REQUEST-TEMPLATE.md).
2. Registrar el estado actual y el impacto completo.
3. Mantenerla `Proposed` mientras requiera decisión humana.
4. No implementar una CR `Proposed`.
5. Al aceptarse, actualizar documentos fuente, trazabilidad, baseline y SPECs antes o junto con la implementación.
6. Registrar la evidencia de la decisión.

No se usa para typos, refactors internos sin cambio de comportamiento ni bugs que restauran lo ya especificado. Una diferencia técnica menor que no cambia la baseline se registra en [`../implementation/deviations.md`](../implementation/deviations.md).
