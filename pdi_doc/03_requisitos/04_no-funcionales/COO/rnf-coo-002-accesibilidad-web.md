---
id: RNF-COO-002
estado: en_revision
---

# RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA

## Requisito

La aplicación web de la primera entrega, tanto en pantallas de escritorio como móviles, debe cumplir [WCAG 2.2 nivel AA](https://www.w3.org/TR/WCAG22/). Este nivel incluye todos los criterios de éxito de nivel A y AA aplicables y los requisitos de conformidad del estándar para páginas completas y procesos completos.

## Contexto

Aplica a todas las vistas y estados de la experiencia web de la primera entrega, incluidos la creación y entrada al equipo, la selección de identidad, el calendario y su detalle diario, la creación y respuesta de consultas, su resolución y confirmación, los errores y la pantalla de equipo caducado. También se aplica al uso de la web en navegador móvil según [RNF-COO-003 — Uso adaptable en navegador móvil](rnf-coo-003-uso-en-navegador-movil.md). Para la evaluación de esta entrega, los viewports de hasta 768 CSS px inclusive cuentan como vista móvil; los de más de 768 CSS px cuentan como vista de escritorio. Así, una tablet en orientación vertical de 768 CSS px se considera móvil. La tecnología de la aplicación instalable prevista para una entrega posterior sigue sin decidirse.

## Métrica / umbral

Conformidad con WCAG 2.2 a nivel AA en el alcance web publicado. Una revisión de componentes aislados no sustituye la revisión de cada página completa ni de los recorridos completos.

## Evidencia prevista

Auditoría de los criterios A y AA aplicables sobre las vistas y estados publicados, con comprobaciones automáticas y manuales de teclado, foco, lector de pantalla, contraste, ampliación, presentación adaptable y formularios. Registrar los fallos detectados, su corrección y la reevaluación de los recorridos completos antes de declarar conformidad.

## Origen

Decisión expresa y más reciente de quien impulsa Synqo, que sustituye la elección previa de criterios básicos sin nivel formal. Referencia normativa: [WCAG 2.2 del W3C](https://www.w3.org/TR/WCAG22/).

## Relaciones

- [RNF-COO-001 — Arranque básico en menos de cinco minutos](rnf-coo-001-arranque-basico.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RF-CON-002 — Registrar y cambiar un voto](../../01_funcionales/CON/rf-con-002-votar.md)
- [RF-CON-004 — Resolver una consulta](../../01_funcionales/CON/rf-con-004-resolver-consulta.md)
