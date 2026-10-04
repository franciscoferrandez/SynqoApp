# Reglas por módulo

## Propósito

Aloja instrucciones de implementación específicas de módulos reales.

## Contiene

subcarpetas dinámicas BACKEND/FRONTEND/etc.

## No contiene

módulos hipotéticos

## Cuándo se utiliza

Lee esta carpeta cuando la fase o una skill necesite crear, revisar o consultar este tipo de conocimiento.

## Cómo se obtiene

`module-define` crea un módulo cuando arquitectura lo haya decidido.

## Preguntas que debe realizar el LLM

¿Qué reglas difieren de las globales?

## Mandamientos

1. No duplicar arquitectura.
2. Enlazar arquitectura del módulo.
3. Cargar antes de implementar.

## Salidas posibles

guías de módulos

## Criterios de calidad

- El contenido tiene origen o justificación identificable.
- No duplica una fuente normativa existente.
- Las referencias a artefactos existentes usan `[ID — denominación](ruta/relativa.md)` y apuntan al archivo citado.
- Las incertidumbres relevantes quedan explícitas.

## Plantillas

`<PDI_ROOT>/templates/desarrollo/modulo.md`
