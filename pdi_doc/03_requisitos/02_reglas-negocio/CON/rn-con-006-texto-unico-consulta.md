---
id: RN-CON-006
estado: en_revision
---

# RN-CON-006 — Texto único entre opciones de una consulta

## Regla

En una consulta con opciones de texto, dos opciones no pueden tener el mismo texto después de ignorar diferencias de mayúsculas, acentos y espacios exteriores. Si se detecta una opción duplicada, se pide modificarla y no se crea la consulta mientras persista el duplicado.

## Justificación

Cada opción de texto debe ser distinguible para votar y resolver la consulta.

## Excepciones

Esta comparación no elimina ni normaliza los espacios interiores u otros caracteres. No establece un límite de longitud o de cantidad de opciones.

## Origen

Decisión expresa de quien impulsa Synqo para la primera entrega.

## Relaciones

- [RF-CON-005 — Crear una consulta con opciones de texto](../../01_funcionales/CON/rf-con-005-crear-consulta-texto.md)
- [WF-CON-006 — Crear una consulta con opciones de texto](../../../04_experiencia-usuario/03_wireframes/wf-con-006-crear-consulta-texto.md)
