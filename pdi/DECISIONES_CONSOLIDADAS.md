# Decisiones consolidadas del PDI

Este documento hace explícitas las decisiones que pueden sorprender al comparar PDI con borradores anteriores.

## 1. Carpetas sí; artefactos vacíos no

Se crea toda la estructura estática con `README.md`. Los RF, RN, ADR, etc. aparecen únicamente cuando existe conocimiento real.

## 2. El Product Baseline es intención normativa

El baseline describe **lo que el producto debe ser**, aunque alguna capacidad aún no esté implementada.

El estado de implementación vive en `REL` y en la trazabilidad de Changes.

## 3. `pdi:baseline-update` es la puerta de escritura normativa

Un Change puede descubrir una nueva verdad, pero la incorpora mediante `pdi:baseline-update` antes de tratarla como fuente normativa.

## 4. No todo Change modifica el baseline

Un Change puede limitarse a materializar algo ya definido. En ese caso avanza delivery coverage, pero no se inventa una nueva “versión” conceptual del baseline por rutina.

## 5. Un solo archivo de Change por defecto

N1/N2 utilizan una SPEC única salvo que separar Research/Design/Plan aporte claridad. N3 puede dividir artefactos.

## 6. Módulos de solución dinámicos

No se presuponen Backend/Frontend/Mobile. Cuando la arquitectura decide un módulo, se crean dos contratos:

```text
<DOC>/06_arquitectura/03_modulos/<MODULO>/
<DOC>/07_desarrollo/08_modulos/<MODULO>/
```

## 7. OpenSpec no está instalado

Se evaluará después de probar el workflow. Si se adopta, no sustituirá la carpeta documental configurada como Product Baseline.

## 8. SPEC no es fuente de verdad permanente

Gobierna temporalmente el Change. Tras el cierre queda histórica; las futuras evoluciones parten del baseline.

## 9. Release y baseline son distintos

`REL` responde “¿qué queremos entregar y qué falta?”. El baseline responde “¿qué debe ser el producto?”.

## 10. Las omisiones son activas

Una fase opcional puede omitirse por nivel/riesgo, pero no desaparecer silenciosamente: debe quedar motivo cuando el gate la esperaba.
