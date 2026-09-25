# Reconciliación de ADR tras el análisis funcional

El paquete arquitectónico original se creó antes del análisis funcional exhaustivo. Esta revisión conserva su arquitectura base y actualiza las decisiones afectadas por el dominio estabilizado.

## Revalidados sin cambios sustanciales

ADR-001, 003, 004, 006, 007, 009, 010, 011, 012 y 018.

## Frontend

ADR-002A pasa a `Accepted`. ADR-002B queda `Rejected`, manteniéndose como evidencia de la alternativa estudiada.

## Contexto actualizado

ADR-005 se actualiza con el dominio real: Cuenta, Participante, Equipo, Disponibilidad, Solicitud, Consulta, Propuesta, Encuesta, Respuesta y Resolución.

## Revisiones importantes

- **ADR-008:** autenticación ya no equivale a «usuario»: distingue cuenta global, identidad de participante y acceso administrativo.
- **ADR-015:** incorpora amenazas de enlaces personalizados, apropiación de identidad, IDOR y escalada contextual.
- **ADR-017:** el email administrativo/verificación es parte esencial del producto; las notificaciones externas automáticas de actividad quedan fuera del MVP.
- **ADR-019:** se reescribe sobre AI-F01 en vez de una «IA futura» genérica.

## Nuevos ADR

- **ADR-021:** acceso mediante enlaces e identidades sin cuenta.
- **ADR-022:** autorización contextual por equipo.

## Lo que deliberadamente no se convierte en ADR

No son ADR: estados Disponible/Quizá/No disponible, modalidad de encuesta, lifecycle funcional de consultas, nomenclatura de UX, reglas de resolución o configuración del equipo. Esas decisiones viven en producto y requisitos.
