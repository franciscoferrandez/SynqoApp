# Guía operativa — tener siempre a mano

## Si estás definiendo el producto

```text
pdi:product-continue
→ pdi:baseline-status
→ pdi:baseline-check
```

## Si aparece una verdad nueva

```text
pdi:baseline-update
```

## Si quieres definir la primera entrega

```text
pdi:product-release
→ pdi:product-status
→ pdi:product-next
```

## Si estás implementando

```text
pdi:change-new
→ pdi:change-prepare
→ pdi:change-apply
→ pdi:change-verify
→ pdi:change-converge
→ pdi:change-close
```

## Si un Change descubre nueva verdad

```text
STOP
→ pdi:baseline-update
→ volver a pdi:change-prepare
```

## Mandamientos diarios

1. No programes una decisión funcional que no puedas señalar en el baseline o la SPEC.
2. No uses el código para decidir retrospectivamente qué queríamos.
3. No modifiques verdad normativa fuera de `pdi:baseline-update`.
4. No saltes un gate bloqueante.
5. No cargues todo el repositorio “por si acaso”: usa contexto mínimo suficiente.
6. No refactorices fuera de scope.
7. No introduzcas dependencias relevantes sin decisión.
8. Lee las reglas del módulo antes de tocarlo.
9. Test ≠ Validate ≠ Converge.
10. Baseline ≠ implementación: usa REL para saber qué falta entregar.
