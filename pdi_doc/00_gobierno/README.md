# 00 — Gobierno

## Propósito

Contiene reglas transversales sobre cómo se documenta y opera el sistema de conocimiento.

## Contiene

- convenciones documentales;
- estado de la definición;
- guía operativa;
- gates;
- mandamientos globales;
- catálogos creados bajo demanda.

## No contiene

Requisitos, reglas de negocio, arquitectura ni decisiones de producto concretas.

## Mandamientos

1. No dupliques verdad normativa.
2. No reutilices IDs.
3. Enlaza cada referencia a un artefacto existente con `[ID — denominación](ruta/relativa.md)`.
4. No escondas conflictos.
5. No confundas estado documental y estado de delivery.


## Artefactos creados bajo demanda

No se crean vacíos. Aparecen cuando exista el primer elemento que los necesita. Numeración sugerida después de los documentos iniciales:

```text
06_catalogo-areas.md
07_catalogo-identificadores.md
08_preguntas-abiertas.md
09_hipotesis.md
10_conflictos.md
11_trazabilidad.md
12_gestion-cambios.md
```

Las plantillas están en `<PDI_ROOT>/templates/gobierno/`.
