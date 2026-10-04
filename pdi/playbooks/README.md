# Playbooks

Los dos playbooks son complementarios:

```text
PLAYBOOK DE DOCUMENTACIÓN
→ define y mantiene el Product Baseline

PLAYBOOK DE IMPLEMENTACIÓN
→ define cómo materializar y evolucionar cambios de forma controlada
```

El primero responde **qué debe ser verdad del producto y cómo documentarlo**.  
El segundo responde **cómo trabajar desde esa verdad hasta código probado y cobertura de delivery actualizada**.

Cuando un Change descubre una nueva verdad, el Playbook de implementación no inventa cómo documentarla: invoca `pdi:baseline-update`, que aplica el Playbook de documentación.

El [mapa operativo rápido](03_mapa-operativo.md) reúne en un diagrama los artefactos de ambos playbooks y explica la función, los límites y el momento de aparición de cada tipo.
