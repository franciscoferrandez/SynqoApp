# Estrategia de pruebas de la demo local

> Estrategia de evidencia para la demo local. Cada SPEC concreta las comprobaciones de su incremento antes de implementarlo.

La evidencia de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) se centrará en riesgos observables:

| Riesgo | Evidencia mínima |
|---|---|
| Base visual y navegación compartida del primer incremento | Abrir directamente y recargar las rutas simuladas; recorrer creación, confirmación, equipo y pantallas de enlace; comprobar que todas reutilizan el layout exterior y que Calendario y Consultas reutilizan el interior. Verificar temas, teclado, foco y adaptación móvil sobre los elementos presentes, y comprobar que el formulario ilustrativo no crea ni transmite datos. |
| Cálculo de fechas de caducidad, estados diarios, normalización de nombres y opciones | Pruebas de reglas puras con casos límite, incluidas zonas horarias y cambio de mes. |
| Acceso compartido y aislamiento de equipos | Pruebas de integración de API con PostgreSQL: valor válido, ausente, alterado, equipo caducado y borrado; lecturas y escrituras. |
| Persistencia, votos y resolución | Pruebas de integración de operaciones y restricciones, incluyendo dos participantes y consultas abiertas/cerradas. |
| Recorridos esenciales en navegador | Pruebas de extremo a extremo con dos contextos de navegador, desde crear equipo hasta resolver consulta; verificación de recarga y cambio de identidad. |
| Uso móvil y accesibilidad | Revisión de recorridos completos a tamaños móvil y escritorio, teclado, foco, nombres accesibles, contraste y comprobaciones automáticas complementadas con revisión manual de [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). |

La suite no sustituye la comprobación manual de accesibilidad ni el criterio de arranque en menos de cinco minutos. Los comandos exactos se fijarán al crear cada módulo y la SPEC correspondiente; la entrega no se marcará completada solo porque compilen sus piezas.
