# ADR-021 — Acceso por enlaces e identidades sin cuenta

**Estado:** Accepted

## Contexto
Synqo necesita enlaces públicos, enlaces capaces de identificar a un participante y enlaces de verificación/recuperación administrativa. Mantener un secreto duradero en la URL aumentaría el riesgo de fuga y revocación difícil.

## Alternativas consideradas
- URL secreta duradera como identidad.
- Credencial opaca acotada que se canjea por sesión server-side.
- Exigir cuenta/login para todo acceso.

## Decisión
Los enlaces que confieran identidad o capacidades usarán **credenciales opacas criptográficamente aleatorias, de alcance mínimo y revocables**. Los tokens sensibles persistidos se almacenarán mediante hash cuando proceda.

Tras validación, el servidor establecerá la sesión contextual correspondiente y redirigirá a una URL limpia.

Tipos conceptuales:
- enlace público: no identifica por sí solo a un participante;
- enlace identificado: establece una participant session válida;
- enlace de verificación/recovery: establece o recupera administración/cuenta según el caso.

## Consecuencias
Reduce exposición por historial, logs, referrer y copia accidental; requiere lifecycle/revocación de credenciales y cuidado con previews/crawlers.
