# Synqo — Paquete de documentación de producto y arquitectura

**Versión:** 0.1  
**Fecha:** 2026-09-23  
**Estado:** diseño funcional consolidado; arquitectura reconciliada; quedan decisiones abiertas explícitas.

Synqo es una aplicación web para facilitar la **coordinación y la toma de decisiones colectivas dentro de equipos**, centralizando disponibilidad por días y ofreciendo mecanismos para acordar fechas o elegir entre alternativas.

El producto está diseñado para funcionar tanto con **equipos rápidos**, temporales y de fricción mínima, como con **equipos administrables**, persistentes y configurables. La cuenta Synqo es opcional para las capacidades esenciales: un participante puede existir y actuar dentro de un equipo sin poseer una cuenta global.

## Cómo leer este paquete

- `PRD.md`: documento central y consolidado del producto.
- `product/`: documentos detallados de visión, alcance, usuarios, dominio, reglas, requisitos, historias, navegación, flujos, pantallas, wireframes, trazabilidad e IA.
- `architecture/`: arquitectura reconciliada y ADR actualizados.
- `traceability/`: relación entre producto y decisiones arquitectónicas.
- `sources-and-notes.md`: procedencia documental y criterios de consolidación.

## Recorridos que definen el MVP

1. **Coordinación rápida:** crear equipo rápido → compartir → disponibilidad → coincidencias → propuesta → respuestas → resolución.
2. **Decisión general:** crear encuesta → selección única/múltiple → votar → resultado → resolución → histórico.
3. **Uso continuado:** crear equipo administrable sin cuenta → verificar email → configurar políticas → utilizar persistentemente → vincular opcionalmente a una cuenta.
4. **Asistencia IA opcional del TFM:** describir restricciones de coordinación en lenguaje natural → interpretar y validar → calcular candidatos de forma determinista → revisar → crear propuesta.

## Principio rector

> Synqo ayuda al equipo a decidir; no decide por el equipo.

Los recuentos, coincidencias, rankings y reglas de dominio son deterministas. La IA se limita a interpretar lenguaje natural a una estructura validable y siempre dispone de un flujo manual equivalente.

## Decisiones abiertas

Las decisiones todavía no cerradas están recogidas en `product/19-open-questions.md`. No invalidan el diseño actual y se han mantenido explícitas para evitar inventar requisitos.

## Workspace de continuación

Esta versión incluye además la estructura de documentación pendiente para completar UX/UI y diseño técnico antes de implementar. Empieza por [`WORKPLAN.md`](WORKPLAN.md) y sigue los prompts numerados. [`AGENTS.md`](AGENTS.md) contiene las reglas comunes para trabajar con Codex desde terminal.
