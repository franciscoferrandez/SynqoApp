---
name: synqo-small-change
description: Resuelve bugs, ajustes visuales, typos, refactors locales y mantenimiento sin crear una SPEC innecesaria.
---

# Synqo small change

Úsala solo cuando el cambio restaura o mantiene comportamiento ya especificado y no altera baseline.

1. Entiende y reproduce el comportamiento esperado.
2. Comprueba rama y workspace; para un cambio relevante usa una rama corta autorizada.
3. Localiza la fuente relevante solo si hace falta y añade regresión cuando aporte valor.
4. Haz el cambio mínimo y ejecuta las verificaciones afectadas.
5. Revisa documentación solo si cambian comportamiento, contrato o instrucciones.
6. Invoca `$synqo-verification` antes de terminar.
7. Registra evidencia TFM únicamente si el cambio es significativo para un requisito, bug, decisión o aprendizaje sobre IA.

Si cambia reglas, API, datos, permisos, alcance o baseline, detente: usa `$synqo-change-control` y posiblemente `$synqo-spec-authoring`.
