---
id: SPEC-COO-003
nivel: N2
estado: preparacion
release: REL-001
---
# SPEC-COO-003 — Uso móvil adaptable en REL-001

## Objetivo

Materializar el uso de las capacidades de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) desde navegadores móviles, mediante una presentación adaptable y recorridos completos que no dependan de una vista de escritorio ni de instalar una aplicación.

## Scope

- Adaptación de la aplicación WEB existente a viewports de móvil (hasta 768 CSS px inclusive) y escritorio (más de 768 CSS px), según la matriz fijada en esta preparación.
- Completar desde navegador móvil las capacidades de creación y acceso a equipos, selección de identidad, calendario y disponibilidad, y creación, voto y resolución de consultas incluidas en REL-001.
- Registrar la evidencia de recorridos funcionales completos y presentación adaptable en los tamaños y navegadores acordados antes de verificar la entrega.

## Fuera de scope

- Aplicación móvil instalable.
- Cambios en las capacidades funcionales de REL-001.
- Declarar conformidad global WCAG 2.2 AA o sustituir la auditoría de recorridos y páginas completas. La evidencia de conformidad de [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) corresponde a su Change, iniciado en [SPEC-COO-002 — Smoke de accesibilidad responsive de REL-001](spec-coo-002-accesibilidad-wcag-rel-001.md); este Change aporta evidencia de uso adaptable y registra cualquier hallazgo relevante para coordinarlo. El enlace no decide el alcance de ese Change ni la matriz móvil.

## Baseline relacionado

- [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md)
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md)
- [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md)
- [WEB — módulo de arquitectura](../../06_arquitectura/03_modulos/WEB/README.md)
- [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md)
- [Estrategia de pruebas de la demo local](../../07_desarrollo/02_testing/estrategia-demo-local.md)

## Clasificación

- **Nivel:** N2 — cambio funcional relevante que afecta a los recorridos completos de la primera entrega en el módulo WEB. No introduce por ahora una decisión arquitectónica ni una dependencia significativa.
- **Tipo:** realización de RNF-COO-003 vigente para REL-001.
- **Estado:** PREPARACION.

## Módulos afectados

- WEB

## Criterios de aceptación

1. En cada viewport móvil de la matriz se pueden completar los recorridos de REL-001 para crear y abrir un equipo, elegir identidad, consultar calendario y marcar disponibilidad, crear consultas de fechas y de texto, votar y resolverlas; la misma cobertura funcional se ejecuta en un viewport representativo de escritorio.
2. Los recorridos incluidos presentan sus vistas y controles de forma adaptable a cada tamaño acordado, sin depender de una vista de escritorio ni requerir instalación.
3. La verificación registra la matriz acordada, los recorridos ejecutados, resultados y defectos observados. La evidencia de accesibilidad aplicable se coordina con [SPEC-COO-002 — Smoke de accesibilidad responsive de REL-001](spec-coo-002-accesibilidad-wcag-rel-001.md), sin inferir conformidad global desde esta SPEC.

## Impacto baseline esperado

Ningún cambio normativo previsto: el Change materializa [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md) para [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md). Si la preparación descubre que hace falta una nueva regla de producto o decisión de arquitectura, deberá resolverse por el gate correspondiente antes de implementarla.

## Questions / Assumptions

### Decisiones de preparación

- Matriz técnica para esta SPEC: Chromium de Playwright a 390 × 844 CSS px (móvil representativo), 768 × 1024 CSS px (límite móvil inclusive), 769 × 1024 CSS px (primer ancho de escritorio) y 1280 × 800 CSS px (escritorio representativo). Ejecutar todos los recorridos funcionales completos en 390 × 844, 768 × 1024 y 1280 × 800; en 769 × 1024 comprobar la presentación y que aplica la categoría de escritorio. Los anchos 768 y 769 prueban directamente la frontera definida por [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md); 390 y 1280 aportan puntos habituales representativos de móvil y PC. Se elige esta matriz por preparación para obtener cobertura reproducible con el proyecto Chromium ya configurado, no como una nueva regla de producto ni como afirmación de uso de dispositivos físicos. Registrar versión de Chromium/Playwright junto con el resultado.

### Supuestos de trabajo

- El objetivo de uso y las capacidades incluidas son los definidos por [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md) y [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md); esta SPEC no amplía esas capacidades.
- La comprobación y declaración de conformidad WCAG 2.2 AA se mantiene bajo [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) y no queda satisfecha por el smoke de [SPEC-COO-002 — Smoke de accesibilidad responsive de REL-001](spec-coo-002-accesibilidad-wcag-rel-001.md). Ambos Changes comparten la matriz aprobada de viewports.

## Research

- En `apps/web/src/styles.css` se encontraron reglas `@media (max-width: 700px)` para cabecera/equipo/calendario, detalle del calendario y tarjetas/consultas; además `apps/web/src/app/pages/availability-calendar.ts` usa el mismo límite para abrir el diálogo. La matriz normativa considera móvil todo ancho hasta 768 px inclusive, por lo que el comportamiento entre 701–768 px queda hoy fuera de esas ramas móviles. Esta discrepancia es un hallazgo de implementación que este Change debe evaluar y resolver en WEB; no altera la categoría móvil/escritorio definida por el baseline.
- `apps/web/playwright.config.ts` solo declara Chromium con `Desktop Chrome`; `apps/web/package.json` ofrece `test:e2e` y la estrategia del proyecto pide recorridos completos en navegador, pero no fija nombres de comandos de aceptación para esta matriz.
- La experiencia ya describe comportamientos móviles específicos —diálogo de detalle de calendario y panel de creación bajo el calendario— en [Estructura inicial del equipo](../../04_experiencia-usuario/01_arquitectura-informacion/estructura-equipo.md) y [Flujo de creación de consulta de fechas](../../04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md). La matriz de esta SPEC debe verificar esas interacciones sin redefinirlas.

## Design / Structure

La solución permanece dentro de WEB: adaptar presentación e interacciones responsivas conservando los recorridos, contratos y responsabilidades vigentes descritos en [WEB — módulo de arquitectura](../../06_arquitectura/03_modulos/WEB/README.md), [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md) y los flujos de experiencia enlazados arriba. No se introduce dependencia ni decisión arquitectónica. Solo existen las categorías móvil (≤768 CSS px) y escritorio (>768 CSS px); tablet vertical no constituye una tercera categoría. La matriz y los criterios de cobertura se concretan en esta preparación.

## Plan por slices

1. **Cobertura funcional móvil y escritorio:** recorrer [JOURNEY-COO-001 — Coordinar una fecha en equipo](../../01_producto/08_journeys/journey-coo-001-coordinar-fecha.md) y las capacidades de REL-001 para crear/acceder, elegir identidad, disponibilidad, consultas de fechas y texto, voto y resolución en Chromium a 390 × 844, 768 × 1024 y 1280 × 800; comprobar clasificación y presentación en el borde 769 × 1024.
2. **Adaptación WEB:** corregir las vistas y controles que fallen en la matriz, incluida la discrepancia entre el límite de 700 px actual y la categoría móvil que incluye 768 px, respetando los flujos y módulos definidos.
3. **Verificación y evidencia:** ejecutar recorridos completos y revisión visual en la matriz, registrar entorno, pasos, resultados y defectos; coordinar los hallazgos WCAG con [SPEC-COO-002 — Smoke de accesibilidad responsive de REL-001](spec-coo-002-accesibilidad-wcag-rel-001.md), sin declarar conformidad global.

## Evidencia / Validation

- Ejecutar los recorridos completos de [JOURNEY-COO-001 — Coordinar una fecha en equipo](../../01_producto/08_journeys/journey-coo-001-coordinar-fecha.md) en Chromium de Playwright a 390 × 844 y 768 × 1024 CSS px, y a 1280 × 800 CSS px para escritorio; registrar versión, viewport, pasos, resultado y defectos.
- Revisar presentación en 769 × 1024 CSS px como primer viewport de escritorio y en 768 × 1024 CSS px como último viewport móvil; esta evidencia prueba la frontera de categorías, sin crear una categoría tablet separada.
- Registrar por separado los hallazgos de accesibilidad y coordinarlos con el Change de RNF-COO-002; esta evidencia no acredita por sí sola conformidad WCAG global.
- Ejecutar `npm run test:e2e` desde `apps/web` para los recorridos Playwright, más `npm run build`, `npm run lint` y `npm run format:check` según aplique a cambios WEB; registrar la disponibilidad del navegador real usado para completar la matriz.

## DoR / Resultado de preparación

**READY_FOR_CHANGE_APPLY.** La matriz está definida con una selección técnica reproducible para esta verificación y es coherente con el baseline: hasta 768 CSS px inclusive es móvil; a partir de 769 CSS px es escritorio. La selección de viewports cubre un punto móvil representativo, el máximo móvil, el primer punto de escritorio y un ancho PC representativo. Chromium ya forma parte del proyecto Playwright. No queda una decisión de producto, arquitectura o navegador pendiente que impida implementar el Change.

## Convergence

Pendiente. Comparar al cierre esta SPEC, la evidencia obtenida, el módulo WEB y el delivery de REL-001; registrar cualquier discrepancia sin modificar el baseline fuera de `pdi:baseline-update`.

## Resultado de cierre

Pendiente.
