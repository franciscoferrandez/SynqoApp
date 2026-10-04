# Playbook de implementación y delivery

**Versión:** 1.0  
**Rol:** materializar cambios de forma controlada usando el Product Baseline.

---

## 1. Frontera con el Playbook de documentación

Este playbook no redefine RF, RN, ADR, arquitectura ni estados documentales.

```text
Documentation Playbook
→ define/mantiene Product Baseline

Implementation Playbook
→ implementa y verifica cambios contra ese baseline
```

Cuando una nueva verdad debe incorporarse:

```text
pdi:change-prepare
→ pdi:baseline-update
→ continuar
```

---

## 2. Baseline y delivery no son lo mismo

El Product Baseline representa **lo que el producto debe ser**.

Por tanto, un Change puede ser de tres tipos conceptuales:

### A. Realización

Implementa algo ya definido en el baseline.

```text
Baseline ya contiene RF/RN
→ Change
→ código/tests
→ delivery coverage avanza
```

No necesita modificar verdad normativa salvo descubrimiento.

### B. Evolución

La necesidad cambia lo que queremos que sea el producto.

```text
necesidad
→ pdi:baseline-update durante prepare
→ SPEC contra nueva verdad
→ implementación
```

### C. Descubrimiento

Durante el Change aparece una nueva verdad legítima.

```text
hallazgo
→ STOP en frontera afectada
→ pdi:baseline-update
→ revalidar prepare
→ continuar
```

En todos los casos `pdi:change-close` actualiza delivery coverage. Solo modifica baseline si realmente existe nueva verdad normativa.

---

## 3. Interfaz mental diaria

```text
pdi:change-new
→ pdi:change-prepare
→ pdi:change-apply
→ pdi:change-verify
→ pdi:change-converge
→ pdi:change-close
```

### `pdi:change-new`

Define objetivo, clasifica riesgo y crea el mínimo artefacto necesario.

### `pdi:change-prepare`

Orquesta Questions, Research, Design, Structure, Plan y DoR. Puede invocar `pdi:baseline-update`.

### `pdi:change-apply`

Implementa por slices bajo las reglas de los módulos afectados.

### `pdi:change-verify`

Ejecuta tests y valida contra SPEC/baseline.

### `pdi:change-converge`

Busca discrepancias entre intención, código, tests y baseline.

### `pdi:change-close`

Cierra/archiva, actualiza delivery coverage y registra trazabilidad.

---

## 4. Rigor proporcional

### N0 — Trivial

Sin cambio funcional ni arquitectónico significativo.

Ejemplo: typo.

Artefactos: ninguno adicional; issue/commit puede bastar.

### N1 — Acotado

Cambio pequeño y bien entendido.

Por defecto usa **un único archivo de Change/SPEC** con secciones de objetivo, plan, verificación y convergencia.

### N2 — Estándar

Feature normal o cambio funcional relevante.

SPEC obligatoria. Research/Design aparecen cuando aportan valor. Por defecto pueden seguir dentro de un único documento para evitar burocracia.

### N3 — Alto impacto / Arquitectónico

Seguridad, migraciones destructivas, contratos, arquitectura, alta incertidumbre, dependencias críticas o difícil rollback.

Permite/aconseja separar `research.md`, `design.md`, `plan.md`, `validation.md` y `convergence.md`.

### Regla

> La complejidad del Change determina la cantidad de artefactos; no el deseo de “documentarlo todo”.

---

## 5. Change Spec

La SPEC es el contrato temporal del Change.

Debe referenciar, no duplicar:

- RF;
- RN;
- RNF;
- UX;
- ADR;
- arquitectura;
- módulos afectados.

Estructura mínima:

```text
Objetivo
Alcance
Baseline relacionado
Criterios de aceptación
Módulos afectados
Impacto esperado
Fuera de alcance
Preguntas/bloqueos
Plan
Evidencia
Convergencia
```

Una SPEC cerrada representa el cambio realizado; no debe mantenerse eternamente como descripción del producto actual.

---

## 6. `pdi:change-prepare`

### Questions

Clasifica incertidumbre:

- investigable → Research;
- decisión funcional → humano o `pdi:baseline-update`;
- arquitectónica → Research → opciones → decisión → ADR → `pdi:baseline-update`;
- no bloqueante → assumption/unknown;
- inconsistencia → conflicto de baseline.

Las decisiones que impiden el DoR quedan en la SPEC con pregunta, motivo, opciones conocidas y gate afectado antes de devolver `BLOCKED`. Al resolverse, la SPEC y, si cambia la verdad del producto, el baseline se actualizan antes de repetir el DoR; una pregunta mostrada solo en la conversación no cuenta como preparación documentada.

### Research

Puede inspeccionar, medir, comparar y crear spikes descartables.

No puede:

- modificar código productivo;
- elegir prematuramente arquitectura;
- transformar assumption en fact;
- modificar baseline.

### Design

Decide la solución después de disponer de hechos suficientes.

### Structure

Identifica módulos, componentes, contratos, migraciones y límites afectados. En N1/N2 normalmente vive dentro de la SPEC o plan.

### Plan

Divide en slices verificables.

### DoR

No pasa a apply con preguntas bloqueantes o decisiones críticas pendientes.

---

## 7. Módulos de solución

La SPEC declara:

```yaml
modulos_afectados:
  - BACKEND
  - FRONTEND
```

Antes de implementar cada módulo se carga:

```text
<DOC>/06_arquitectura/03_modulos/<MODULO>/
<DOC>/07_desarrollo/08_modulos/<MODULO>/
```

Las reglas globales siguen aplicando.

Un módulo nuevo se define mediante `module-define` / `pdi:baseline-update`; el implementador no inventa sus convenciones.

---

## 8. Implementación incremental

Patrón preferido:

```text
Slice
→ Test
→ Check
→ Commit coherente
→ siguiente Slice
```

Usa vertical slices cuando aporten valor de extremo a extremo.

Separa migraciones o foundations cuando existe una dependencia real.

No hagas “implementa todo el plan” para N2/N3 sin checkpoints.

---

## 9. Test, Validate y Converge

### Test

> ¿Pasa la evidencia técnica definida?

### Validate

> ¿Hemos implementado correctamente lo especificado?

Estados de evidencia:

```text
PASS
FAIL
PARTIAL
NOT_TESTED
NOT_APPLICABLE
```

### Converge

> ¿Intención, baseline, SPEC, código y tests son coherentes?

Convergence no significa “actualizar docs para que coincidan con el código”. Primero clasifica la discrepancia.

---

## 10. Baseline Drift

Existe cuando aparece una diferencia normativa no prevista.

Clasificación:

```text
A. Código desviado
B. SPEC incompleta
C. Nueva información legítima
D. Nueva decisión arquitectónica
E. Baseline incorrecto
F. Fuera de scope
```

Acciones:

- A → corregir código;
- B/C/E → `pdi:baseline-update` cuando corresponda y revalidar;
- D → workflow arquitectónico + ADR + `pdi:baseline-update`;
- F → registrar trabajo posterior salvo bloqueo.

---

## 11. Delivery Coverage

Al cerrar un Change se actualiza el `REL` correspondiente:

```text
ESPECIFICADO
→ EN_IMPLEMENTACION
→ IMPLEMENTADO
→ VALIDADO
→ ENTREGADO
```

Esto permite `pdi:product-status` y `pdi:product-next` sin inferir implementación desde los RF.

---

## 12. Git y PR

Una branch puede referenciar SPEC/CAM sin sobrecarga:

```text
spec/dis-014-modificar-disponibilidad
```

Commits describen intención técnica/funcional:

```text
feat(dis): permitir modificar disponibilidad
```

La PR incluye:

- SPEC/CAM;
- scope;
- módulos;
- tests;
- drift/resoluciones;
- impacto baseline real;
- estado de convergencia.

---

## 13. Human Gates

Tres modos:

```text
AUTONOMOUS
INFORMATIONAL
APPROVAL_GATE
```

Approval obligatorio en N3 y en operaciones como:

- destrucción de datos;
- seguridad crítica;
- breaking contracts;
- migración compleja;
- nueva dependencia arquitectónicamente significativa;
- drift significativo.

---

## 14. OpenSpec

No forma parte del core de esta versión.

Primero se prueban las skills del repositorio. Si el workflow se estabiliza, OpenSpec puede evaluarse como **motor de lifecycle de Change**, manteniendo:

```text
Product Baseline → <DOC>/
Change artifacts → motor de changes
```

Nunca debe crear una segunda fuente normativa paralela.

---

## 15. Regla final

> Un Change no termina cuando “el código funciona”; termina cuando está verificado, no contiene drift sin resolver y el estado de delivery refleja honestamente lo conseguido.
