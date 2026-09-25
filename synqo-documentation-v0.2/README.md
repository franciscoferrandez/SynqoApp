# Synqo — Paquete de documentación de producto y arquitectura

**Versión:** 0.1  
**Fecha:** 2026-09-23  
**Estado:** diseño funcional consolidado; arquitectura reconciliada; decisiones abiertas iniciales cerradas para continuar diseño UI/técnico.

Synqo es una aplicación web para facilitar la **coordinación y la toma de decisiones colectivas dentro de equipos**, centralizando disponibilidad por días y ofreciendo mecanismos para acordar fechas o elegir entre alternativas.

El producto está diseñado para funcionar tanto con **equipos rápidos**, temporales y de fricción mínima, como con **equipos administrables**, persistentes y configurables. La cuenta Synqo es opcional para las capacidades esenciales: un participante puede existir y actuar dentro de un equipo sin poseer una cuenta global.

## Cómo leer este paquete

- `PRD.md`: documento central y consolidado del producto.
- `product/`: documentos detallados de visión, alcance, usuarios, dominio, reglas, requisitos, historias, navegación, flujos, pantallas, wireframes, trazabilidad e IA.
- `architecture/`: arquitectura reconciliada y ADR actualizados.
- `traceability/`: relación entre producto y decisiones arquitectónicas.
- `sources-and-notes.md`: procedencia documental y criterios de consolidación.
- [`WORKPLAN.md`](WORKPLAN.md): historial del plan de análisis y diseño ya completado.
- [`IMPLEMENTATION-GUIDE.md`](IMPLEMENTATION-GUIDE.md): punto de entrada operativo para implementación.
- [`project/design-baseline.md`](project/design-baseline.md): baseline documental que gobierna la implementación.
- [`specs/spec-register.md`](specs/spec-register.md): unidades iniciales de Spec-First.
- [`tfm/README.md`](tfm/README.md): evidencia estructurada para la futura memoria.

## Recorridos que definen el MVP

1. **Coordinación rápida:** crear equipo rápido → compartir → disponibilidad → coincidencias → propuesta → respuestas → resolución.
2. **Decisión general:** crear encuesta → selección única/múltiple → votar → resultado → resolución → histórico.
3. **Uso continuado:** crear equipo administrable sin cuenta → verificar email → configurar políticas → utilizar persistentemente → vincular opcionalmente a una cuenta.
4. **Asistencia IA opcional del TFM:** describir restricciones de coordinación en lenguaje natural → interpretar y validar → calcular candidatos de forma determinista → revisar → crear propuesta.

## Principio rector

> Synqo ayuda al equipo a decidir; no decide por el equipo.

Los recuentos, coincidencias, rankings y reglas de dominio son deterministas. La IA se limita a interpretar lenguaje natural a una estructura validable y siempre dispone de un flujo manual equivalente.

## Decisiones abiertas

El registro `product/19-open-questions.md` conserva el historial de `OPEN-01`…`OPEN-09`, cerradas en `planning/01-open-decisions/open-decisions-resolution.md`. Las cuestiones restantes son riesgos o detalles de diseño posterior, no bloqueos para continuar con el siguiente prompt.

## Workspace de implementación

El análisis y diseño están completados. La implementación futura debe comenzar por [`IMPLEMENTATION-GUIDE.md`](IMPLEMENTATION-GUIDE.md), consultar la baseline y preparar `SPEC-001` mediante la skill local `$synqo-spec-authoring`. [`AGENTS.md`](AGENTS.md) contiene las reglas específicas de edición documental.
