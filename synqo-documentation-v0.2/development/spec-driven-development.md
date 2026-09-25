# Spec-Driven Development de Synqo

## Propósito

Synqo combina Waterfall a nivel macro con Spec-First / Spec-Driven Development a nivel micro. La fase macro de análisis y diseño termina en una Design Baseline; la implementación se divide en unidades pequeñas, trazables y verificables.

La dirección obligatoria es `SPEC -> CODE`. No se implementa primero una funcionalidad sustancial para inventar después su especificación.

## Principios

- La SPEC gobierna la implementación concreta de su unidad.
- Las SPEC referencian requisitos existentes y no los duplican.
- La SPEC no sustituye al PRD, dominio, OpenAPI, modelo de datos, UX, seguridad o plan de tests.
- No se introducen requisitos ni alcance nuevos silenciosamente.
- La IA puede proponer código, tests o documentos; la responsabilidad de validarlos y aceptar decisiones sigue siendo humana.
- Una conversación con IA no sustituye el registro de una decisión relevante.

## Lifecycle de una SPEC

```text
Planned -> Draft -> Ready -> In Progress -> Implemented -> Verified
                         \-> Superseded
```

- **Planned:** unidad identificada en el registro, aún sin documento completo.
- **Draft:** documento en elaboración o bloqueado por una ambigüedad.
- **Ready:** contiene alcance, referencias, comportamiento, autorización, contrato aplicable, criterios de aceptación y pruebas requeridas suficientes para implementar sin inventar decisiones.
- **In Progress:** la implementación está en curso; no se amplía el alcance sin actualizar el control correspondiente.
- **Implemented:** el código satisface la SPEC según la revisión inicial; aún queda la verificación final y la sincronización documental.
- **Verified:** verificaciones requeridas satisfactorias, revisión humana realizada y documentación sincronizada.
- **Superseded:** reemplazada por otra SPEC o por una CR aceptada; se conserva el enlace y el motivo.

Una SPEC no se marca `Ready` para ocultar decisiones pendientes. Si la decisión bloquea el trabajo, permanece `Draft` y documenta el blocker.

## Workflow

1. Seleccionar una unidad del `spec-register` respetando dependencias, prioridad y riesgo.
2. Trazar RF, HU, flows/screens y fuentes técnicas relevantes.
3. Redactar la SPEC desde [`../specs/SPEC-TEMPLATE.md`](../specs/SPEC-TEMPLATE.md).
4. Resolver ambigüedades consultando la baseline; no inventar decisiones.
5. Marcar `Ready` y registrar el estado.
6. Implementar solo el alcance de la SPEC.
7. Ejecutar pruebas y verificaciones automáticas proporcionales.
8. Revisar el cambio y actualizar documentación afectada.
9. Conservar evidencia TFM estructurada cuando el trabajo sea significativo.
10. Marcar `Implemented` y solicitar la verificación final.
11. Tras una verificación satisfactoria, marcar `Verified` y actualizar el registro y el estado de implementación.

## Stop conditions

La implementación se detiene y deriva a [`../changes/README.md`](../changes/README.md) cuando la SPEC:

- contradice la baseline;
- necesita una decisión de producto no documentada;
- cambia un requisito `Must`;
- altera de forma importante el dominio, lifecycle o invariante;
- cambia un contrato API público no contemplado;
- afecta autorización, identidad, privacidad o seguridad de forma no diseñada;
- exige modificar la Design Baseline.

Una corrección menor que restaura el comportamiento ya especificado puede seguir el flujo de small change. Si la diferencia cambia el comportamiento esperado, se usa Change Control.

## Responsabilidad de la SPEC

La SPEC debe ser lo bastante concreta para implementar y lo bastante ligera para no duplicar documentación. Los detalles locales de clases, módulos o helpers pertenecen al código salvo que cambien contrato, comportamiento o trazabilidad.
