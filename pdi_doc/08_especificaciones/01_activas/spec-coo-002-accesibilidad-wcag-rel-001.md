---
id: SPEC-COO-002
nivel: N2
estado: preparacion
release: REL-001
---
# SPEC-COO-002 — Smoke de accesibilidad responsive de REL-001

## Objetivo

Comprobar con un smoke E2E sencillo que las vistas móvil y escritorio de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) mantienen reflow y controles visibles y operables, incluyendo teclado/foco y ampliación en las zonas pertinentes. Este Change aporta evidencia parcial y no acredita conformidad WCAG 2.2 AA ni sustituye la auditoría completa que sigue pendiente para REL-001.

## Scope

- Comprobar en Chromium/Playwright la presentación y uso responsive en 390×844 y 768×1024 (móvil), y 769×1024 y 1280×800 (escritorio).
- Verificar reflow, ausencia de controles esenciales ocultos, operación de controles prioritarios y teclado/foco; revisar ampliación pertinente donde el layout cambie.
- Corregir defectos responsive/accessibility smoke atribuibles a WEB en las vistas y controles comprobados, y repetir las comprobaciones afectadas.
- Registrar viewport, pasos, resultados e incidencias como evidencia parcial, coordinada con [SPEC-COO-003 — Uso móvil adaptable en REL-001](spec-coo-003-uso-movil-rel-001.md).

## Fuera de scope

- Declarar o alcanzar conformidad WCAG 2.2 AA: la auditoría completa exigida por [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) sigue pendiente para REL-001.
- Definir o modificar requisitos normativos, nivel de conformidad, decisiones o arquitectura; cualquier necesidad de cambio del baseline se deriva a `pdi:baseline-update`.
- Rediseñar capacidades o reglas funcionales por preferencias de implementación.
- La cobertura funcional móvil completa como objetivo independiente de [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md); este smoke comparte sus viewports con el Change móvil.
- La futura aplicación móvil instalable y tecnologías no elegidas para ella.
- Auditar criterios WCAG por completo, cubrir cada página/estado/proceso o declarar conformidad a partir de este smoke.

## Baseline relacionado

- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md)
- [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md)
- [Accesibilidad web de la primera entrega](../../04_experiencia-usuario/07_accesibilidad/accesibilidad-web-wcag-22-aa.md)
- [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md)
- [Estrategia de pruebas de la demo local](../../07_desarrollo/02_testing/estrategia-demo-local.md)
- [WEB — módulo de arquitectura](../../06_arquitectura/03_modulos/WEB/README.md)
- [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md)

## Módulos afectados

- WEB

## Clasificación y tipo

- **Nivel: N2.** El trabajo cubre un smoke responsive transversal y posibles correcciones de varias interacciones; el baseline fija el objetivo y las responsabilidades del módulo WEB, y no hay indicio actual de migración destructiva, cambio de contrato o decisión arquitectónica que justifique N3. Los hallazgos pueden elevar el nivel si la evidencia lo requiere.
- **Tipo: realización.** Materializa [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) ya vigente. Si la preparación descubre una verdad o decisión nueva, se detendrá en esa frontera y se seguirá el flujo PDI aplicable.

## Criterios de aceptación

1. La evidencia cubre los cuatro viewports acordados: 390×844 y 768×1024 móvil; 769×1024 y 1280×800 escritorio.
2. En los flujos priorizados, el contenido refluye sin pérdida de información o función y los controles esenciales siguen visibles y operables.
3. Los controles priorizados se pueden operar con teclado y mantienen foco perceptible; ampliación se comprueba donde resulte pertinente para el cambio de layout.
4. Los defectos de este alcance corregidos se vuelven a probar y se registran viewport, pasos, resultado e incidencias.
5. La evidencia y el informe dicen expresamente que el smoke es parcial y no acredita conformidad WCAG 2.2 AA; la auditoría completa del requisito permanece pendiente.

## Impacto baseline esperado

No se modifica [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md). Este Change realiza únicamente un smoke de baja complejidad; el objetivo de conformidad y la evidencia completa siguen pendientes como gate de REL-001. El smoke no es una excepción ni una declaración anticipada de conformidad.

## Questions / Assumptions

### Decisión resuelta

- La persona impulsora aprobó el smoke E2E sencillo en móvil y escritorio con Playwright/Chromium, incluyendo reflow, controles visibles/operables, teclado/foco y ampliación pertinente. La decisión no reduce ni satisface la auditoría completa WCAG 2.2 AA de REL-001, que sigue pendiente según [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md).

- La matriz de viewports se comparte con [SPEC-COO-003 — Uso móvil adaptable en REL-001](spec-coo-003-uso-movil-rel-001.md); este Change se ocupa de comprobaciones smoke y aquella SPEC de recorridos funcionales responsive.
- **Supuesto provisional:** las páginas, estados y procesos cubiertos son los de la entrega REL-001 vigente; el inventario de código se ha contrastado con las rutas actuales y deberá confirmarse contra la aplicación publicada durante la ejecución del Change.

## Research necesario

### Hallazgos de investigación

- Las rutas WEB actuales son creación (`/`), confirmación (`/confirmacion`), calendario y consultas bajo `/e`, equipo caducado (`/caducado`) y enlace no encontrado (`/no-encontrado`, incluido el comodín). El calendario y las consultas concentran recorridos y estados; el alcance incluye sus diálogos, vacíos, errores y estados cerrados descritos por esta SPEC y la guía UX.
- La aplicación declara reglas responsive `max-width: 700px` en `apps/web/src/styles.css`; el calendario también cambia su comportamiento de diálogo con ese umbral. El rango móvil implementado llega hasta 700 CSS px, mientras el breakpoint solicitado clasifica como móvil hasta 768 px inclusive. Si se aprueba la matriz indicada, hay una diferencia de 68 CSS px entre el umbral actual y el requerido: revisar las vistas de 701–768 px y ajustar al corte de 768 donde corresponda, incluido el cambio de comportamiento del diálogo del calendario. No se modifica código en preparación.
- Playwright está configurado en `apps/web` solo para Chromium (`npm --prefix apps/web run test:e2e`). Los E2E existentes usan, entre otros, viewports de 390×844 y 1280×800. No se encontró configuración de axe ni una suite automatizada de accesibilidad en el manifiesto actual. Esto no acredita cobertura completa ni impide elegir herramientas durante Apply.
- La evidencia histórica de [SPEC-COO-001 — Base visual y navegación de Synqo](../99_archivadas/spec-coo-001-base-visual-y-navegacion.md) informa comprobaciones preliminares en 320, 375 y 1440 px, pero la propia auditoría archivada limita esa evidencia a la base visual y excluye contraste automatizado; no sustituye la evaluación actual de páginas/procesos completos.
- [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md) clasifica tablet vertical como móvil y requiere breakpoints habituales de móvil y PC. La matriz compartida está definida en [SPEC-COO-003 — Uso móvil adaptable en REL-001](spec-coo-003-uso-movil-rel-001.md), que cubre recorridos funcionales y no sustituye la conformidad WCAG.

### Diseño del smoke aprobado

La matriz para coordinar con [SPEC-COO-003 — Uso móvil adaptable en REL-001](spec-coo-003-uso-movil-rel-001.md) es: 390×844 y 768×1024 como móvil; 769×1024 y 1280×800 como escritorio. 768×1024 representa tablet vertical dentro de la categoría móvil; 769×1024 confirma el lado escritorio inmediatamente superior al corte. Registrar dimensiones CSS, orientación, navegador/versión y resultado.

Playwright/Chromium cubre la comprobación responsive; se revisan manualmente teclado/foco y ampliación pertinente en cambios de layout. El smoke no satisface [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md); la evaluación completa de sus criterios aplicables queda pendiente.

No se declara conformidad ni se infiere que los E2E, el resultado smoke o el umbral CSS prueben WCAG global.

## Design / Structure

El módulo afectado es WEB según [WEB — módulo de arquitectura](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md). Se comprobarán visibilidad/operabilidad de controles, reflow y ampliación pertinente, y teclado/foco donde cambie el layout en los viewports acordados, agrupando hallazgos por superficies compartidas. Esto registra evidencia parcial y no satisface RNF-COO-002. La matriz se comparte con [SPEC-COO-003 — Uso móvil adaptable en REL-001](spec-coo-003-uso-movil-rel-001.md), que conserva responsabilidad por los recorridos funcionales.

## Plan por slices

1. Ejecutar el smoke en la matriz acordada (390×844, 768×1024 móvil; 769×1024, 1280×800 escritorio).
2. Corregir los hallazgos WEB incluidos en el scope y repetir las comprobaciones afectadas.
3. Consolidar evidencia parcial y converger baseline, SPEC y resultado sin declarar conformidad WCAG global; la auditoría completa permanece pendiente para REL-001.

## Evidencia / Validation

Para comprobación reproducible del frontend está disponible `npm --prefix apps/web run test:e2e` (Playwright/Chromium); `build`, `lint` y `test` son checks complementarios. La evidencia registrará los cuatro viewports, controles visibles/operables, hallazgos de reflow/ampliación y teclado/foco en los cambios de layout; esto no es matriz WCAG por criterio ni auditoría completa. Se seguirá [Estrategia de pruebas de la demo local](../../07_desarrollo/02_testing/estrategia-demo-local.md). Ningún check aislado acredita conformidad.

## Convergence

Al converger, clasificar toda diferencia entre requisito, experiencia, SPEC y comportamiento WEB; resolver drift mediante el flujo PDI y mantener explícito que el smoke no satisface la auditoría completa ni permite afirmar conformidad.

## Resultado de cierre

**READY_FOR_CHANGE_APPLY.** La persona impulsora aprobó el smoke E2E acotado y su matriz. La SPEC deja claro que produce evidencia parcial y no cumple ni declara conformidad WCAG 2.2 AA; la auditoría completa continúa pendiente para REL-001.
