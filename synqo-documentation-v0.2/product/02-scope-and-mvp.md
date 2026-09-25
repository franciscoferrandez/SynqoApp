# 02 — Alcance y MVP

Este documento describe el alcance objetivo del MVP. La criticidad relativa dentro de ese alcance se define en [`09b-requirements-prioritization.md`](09b-requirements-prioritization.md): estar incluido en el Target MVP no implica necesariamente prioridad `Must`.

## Minimum Viable Validation

El mínimo defendible para validar Synqo incluye equipo rápido, participación sin cuenta, disponibilidad diaria, coincidencias deterministas, propuesta, respuestas, resultado, resolución explícita, encuesta `SINGLE`, voto, resultado/resolución de encuesta, deep links acotados y garantías básicas de seguridad, privacidad, accesibilidad e integridad.

Este subconjunto valida las preguntas principales —`¿Cuándo podemos?` y `¿Qué decidimos?`— sin exigir cuenta global, equipo administrable, solicitudes, vistas completas calendario/lista, pendientes agregados, histórico enriquecido ni asistencia IA.

## Núcleo del MVP

Synqo debe soportar equipos rápidos y administrables, participantes con o sin cuenta, disponibilidad por días, solicitudes, coincidencias, propuestas temporales, encuestas de selección única/múltiple, resultados, resolución, histórico, pendientes, deep links y políticas básicas de equipo.

## Equipo rápido

- creación sin cuenta ni email;
- expiración obligatoria;
- comportamiento predefinido;
- tres estados de disponibilidad siempre activos;
- todos pueden resolver consultas;
- vinculación a cuenta opcional sin alterar lifecycle.

## Equipo administrable

- creación sin cuenta posible;
- email administrativo verificable obligatorio;
- persistente;
- estados y permisos configurables;
- administración recuperable mediante identidad verificable;
- cuenta opcional.

## Capa IA del TFM

`AI-F01` entra en el alcance del TFM como ruta opcional de producto: interpretar restricciones temporales en lenguaje natural para producir criterios estructurados. El core del MVP debe continuar funcionando sin IA, aunque la ruta IA sea necesaria para la demostración académica del TFM.

## Fuera del MVP

- recurrencia automática de eventos o solicitudes;
- franjas horarias en disponibilidad general;
- gestión completa de eventos posteriores a la resolución;
- reserva de recursos;
- chat, videoconferencia y tareas;
- sincronización automática con calendarios externos;
- voto anónimo fuerte;
- rankings, voto ponderado u otros sistemas electorales avanzados;
- selección de subconjuntos arbitrarios de participantes;
- sistema genérico de roles;
- agente IA autónomo, RAG y fine-tuning.

## Backlog futuro

Conversión de equipo rápido a administrable preservando identidad e histórico, calendarios externos, exportación, push, franjas horarias, destinatarios parciales, encuestas avanzadas, comentarios, integraciones de mensajería y nuevas funciones IA justificadas por casos reales.
