# Plantilla — Entrega / Release

```md
---
id: REL-<NNN>
estado: planificada
---
# <ID> — <Denominación>

## Objetivo de entrega
...

## Alcance
| Elemento | Estado delivery | SPEC | Dependencias | Notas |
|---|---|---|---|---|
| [<ID> — <Denominación>](ruta/relativa/al/artefacto.md) | DEFINIDO | — | — | — |

## Estados permitidos
DEFINIDO / PLANIFICADO / ESPECIFICADO / EN_IMPLEMENTACION / IMPLEMENTADO / VALIDADO / ENTREGADO / BLOQUEADO / POSPUESTO / DESCARTADO

## Criterio de entregable
...
```

### Ejemplo

```md
# REL-001 — MVP inicial
| Elemento | Estado delivery | SPEC | Dependencias | Notas |
| [HU-EVE-001 — Crear evento](ruta/relativa/hu-eve-001.md) | PLANIFICADO | — | [HU-EQU-001 — Crear equipo](ruta/relativa/hu-equ-001.md) | — |
```
