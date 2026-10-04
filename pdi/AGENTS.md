# Instrucciones obligatorias para agentes

Este archivo contiene reglas operativas. **No es fuente de verdad del producto.** La verdad normativa reside en la carpeta configurada en `.pdi/config.json` o `pdi_doc/` por defecto según el Playbook de documentación.

## 1. Antes de actuar

Resuelve `<PDI_ROOT>` a partir de la ubicación de la skill cargada. Resuelve `<DOC>` mediante `<PROYECTO>/.pdi/config.json` si existe; usa `pdi_doc/` por defecto. Después lee, por este orden:

1. `<DOC>/README.md`;
2. `<DOC>/00_gobierno/01_convenciones-documentales.md`;
3. `<DOC>/00_gobierno/03_guia-operativa.md`;
4. el `README.md` de la carpeta sobre la que vas a trabajar;
5. la skill invocada desde `<PDI_ROOT>/skills/`;
6. únicamente los artefactos normativos, código y tests relevantes.

## 2. Idioma

Trabaja en castellano salvo términos técnicos expresamente admitidos por las convenciones.

## 3. Gates

No pases de fase si el gate anterior no está superado. Solo se puede omitir una fase cuando la skill lo permita y quede registrada una **omisión activa con motivo**.

## 4. Fuente de verdad

- El Product Baseline describe lo que el producto **debe ser**.
- El código describe lo que actualmente **hace**.
- Si discrepan, existe un conflicto que debe resolverse; no gana automáticamente ninguno.
- Solo la operación `pdi:baseline-update` puede crear, modificar, sustituir u obsoletar verdad normativa de forma deliberada.

## 5. No inventar

Nunca conviertas silenciosamente una hipótesis, inferencia, preferencia o propuesta en requisito, regla, decisión o arquitectura.

Si falta información relevante:

```text
BLOQUEADO
- Qué falta
- Por qué importa
- Qué bloquea
- Opciones conocidas
- Siguiente acción permitida
```

## 6. Scope

Durante un Change:

- no refactorices fuera de scope;
- no introduzcas dependencias significativas sin decisión;
- no cambies arquitectura global de forma implícita;
- no modifiques reglas de negocio para acomodar el código;
- registra hallazgos no bloqueantes como trabajo posterior.

## 7. Módulos de solución

Antes de modificar un módulo de solución, carga sus instrucciones de:

```text
<DOC>/06_arquitectura/03_modulos/<MODULO>/
<DOC>/07_desarrollo/08_modulos/<MODULO>/
```

Si el módulo no está definido, no improvises sus convenciones: usa `pdi:baseline-update` o `pdi:module-define`.

## 8. Cambios

Secuencia normal:

```text
pdi:change-new
→ pdi:change-prepare
→ pdi:change-apply
→ pdi:change-verify
→ pdi:change-converge
→ pdi:change-close
```

`pdi:change-prepare` puede invocar `pdi:baseline-update` cuando descubre una nueva verdad necesaria antes de implementar.

## 9. Baseline Drift

Si el código exige o introduce una verdad no prevista:

1. detente en la frontera afectada;
2. clasifica el hallazgo;
3. decide si está mal el código, la SPEC o el baseline;
4. usa `pdi:baseline-update` si existe una nueva verdad legítima;
5. revalida el gate antes de continuar.

## 10. Prohibición de duplicación

No copies RF, RN, RNF, ADR, arquitectura o decisiones a `<PDI_ROOT>/AGENTS.md`, skills o Change Specs como segunda fuente de verdad. En la documentación del proyecto, referéncialos mediante `[ID — denominación](ruta/relativa.md)` al artefacto correspondiente.
