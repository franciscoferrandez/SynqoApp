---
id: SPEC-COO-004
nivel: N2
estado: cerrado
release: REL-001
tipo: realizacion
---
# SPEC-COO-004 — Arranque básico en menos de cinco minutos en REL-001

## Objetivo

Evaluar el recorrido completo de coordinación de [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md) mediante un E2E Playwright y, cuando el benchmark no baje de 150 segundos, una comprobación humana. Un benchmark completo inferior a 150 segundos supera automáticamente el requisito; en caso contrario, una persona debe completar el recorrido en menos de cinco minutos. Si la evaluación descubre fricciones, corregirlas dentro de las superficies afectadas sin alterar el recorrido.

## Scope

- Preparar y ejecutar una evaluación de la aplicación de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md), cubriendo sin alterar orden ni omitir pasos el recorrido de [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md):
  1. Iniciar el cronómetro al comenzar la creación del equipo; crear el equipo con el participante 1 y acceder al grupo.
  2. Marcar la disponibilidad de P1 para la semana natural siguiente a la fecha de verificación.
  3. Crear P2 y marcar su disponibilidad para esa misma semana.
  4. Volver a P1, crear una consulta con dos fechas de esa semana y otra consulta con dos opciones de texto.
  5. Volver a P2 y votar en ambas consultas.
  6. Volver a P1, resolver una consulta y rechazar la otra.
  7. Comprobar que el envío opcional del enlace por correo no presenta un error. Esta comprobación puede ocurrir al final del recorrido.
- Ejecutar un E2E benchmark de Playwright que recorra exactamente la secuencia anterior y registre la duración desde el inicio de la interacción de creación del equipo hasta comprobar el recibo final del intento de correo. Un recorrido completo en `< 150 s` es criterio automático de aceptación. El arranque de servicios/entorno, preparación de datos/contexto, lanzamiento de navegador y navegación previa a la pantalla de creación quedan fuera del cronómetro.
- Registrar el resultado del E2E como duración de acciones automatizadas, no como duración de una persona. No presentarlo como evidencia de que una persona completa el recorrido en menos de cinco minutos.
- Registrar condiciones, tiempos, resultado de cada paso y fricciones observadas. Si el benchmark tarda 150 s o más, una persona ejecutará el recorrido completo; el protocolo registrará entorno, inicio/fin y cualquier incidencia.
- Corregir fricciones que impidan completar el recorrido o cumplir el umbral, limitando los cambios a WEB/API que la evidencia identifique y a los criterios existentes.

## Fuera de scope

- Cambiar el umbral, redefinir el requisito o alterar el recorrido aprobado.
- Añadir registro, autenticación o capacidades de producto nuevas.
- Cambiar la definición aprobada de semana natural siguiente mediante esta SPEC; cualquier cambio normativo adicional requiere [pdi:baseline-update](../../00_gobierno/03_guia-operativa.md).
- Una auditoría completa de accesibilidad o de uso móvil, cubierta por [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) y [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md).
- Resolver fricciones ajenas al recorrido; se registrarán como trabajo posterior.

## Baseline relacionado

- [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md)
- [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md)
- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../03_requisitos/01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md)
- [RF-DIS-001 — Marcar y modificar disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md)
- [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RF-CON-002 — Registrar y cambiar un voto](../../03_requisitos/01_funcionales/CON/rf-con-002-votar.md)
- [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md)
- [RF-CON-005 — Crear una consulta con opciones de texto](../../03_requisitos/01_funcionales/CON/rf-con-005-crear-consulta-texto.md)
- [HU-EQU-001 — Crear un equipo sin registro](../../01_producto/07_historias-usuario/hu-equ-001-crear-equipo.md)
- [HU-EQU-002 — Incorporarse a un equipo](../../01_producto/07_historias-usuario/hu-equ-002-incorporarse-equipo.md)
- [Flujo EQU-002 — Crear equipo](../../04_experiencia-usuario/02_flujos/flujo-equ-002-crear-equipo.md)
- [Flujo EQU-001 — Entrar en equipo](../../04_experiencia-usuario/02_flujos/flujo-equ-001-entrar-equipo.md)
- [Flujo DIS-001 — Marcar disponibilidad](../../04_experiencia-usuario/02_flujos/flujo-dis-001-marcar-disponibilidad.md)
- [Flujo CON-001 — Crear consulta de fechas](../../04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md)
- [Flujo CON-004 — Crear consulta con opciones de texto](../../04_experiencia-usuario/02_flujos/flujo-con-004-crear-consulta-texto.md)
- [Flujo CON-002 — Responder una consulta abierta](../../04_experiencia-usuario/02_flujos/flujo-con-002-responder-consulta.md)
- [Flujo CON-003 — Resolver una consulta](../../04_experiencia-usuario/02_flujos/flujo-con-003-resolver-consulta.md)
- [Estrategia de pruebas de la demo local](../../07_desarrollo/02_testing/estrategia-demo-local.md)
- [WEB — contrato de módulo](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md)
- [API — contrato de módulo](../../06_arquitectura/03_modulos/API/README.md) y [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md)

## Módulos afectados

- WEB: interfaz de creación, acceso, disponibilidad, selección/cambio de identidad, creación de consultas, votación, resolución y resultado visible del correo.
- API: operaciones existentes necesarias para persistir y presentar las acciones del recorrido, así como el intento opcional de correo. La inspección inicial no atribuye por sí sola una fricción o cambio a API.

## Criterios de aceptación

1. El E2E benchmark usa el criterio automático `< 150 s`; si no lo alcanza, una persona ejecuta el mismo recorrido con umbral `< 300 s`. Las marcas de inicio y fin son inequívocas y el registro distingue evidencia automatizada de humana.
2. Cada ejecución cubre en el orden definido en [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md) todas las acciones de creación, acceso, disponibilidad de P1/P2, ambas consultas, votos, resolución/rechazo y comprobación del correo opcional sin error. No se omite ni reordena una acción para mejorar el tiempo.
3. El E2E registra la duración automatizada y su comparación con `< 150 s`. Si tarda 150 s o más, se registra por separado el tiempo humano y su comparación con `< 300 s`. La duración automatizada se identifica como tal y solo el resultado inferior a 150 s permite la aceptación automática autorizada por el RNF.
4. Si se identifican fricciones que impiden completar el recorrido o cumplir el umbral, se corrigen dentro del scope y se verifica el comportamiento funcional afectado; la evaluación se repite bajo el mismo protocolo. Si no se identifican, la evidencia sustenta esa conclusión.
5. Si la operación opcional de correo no se ejecuta o su resultado no puede comprobarse, se registra como recorrido incompleto, sin presentarlo como evidencia de cumplimiento.

## Impacto baseline esperado

El baseline define la aceptación automática por benchmark inferior a 150 s; si no se alcanza, exige evidencia humana inferior a cinco minutos. La semana objetivo es la semana natural siguiente a la fecha de verificación, según la decisión expresa registrada en [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md). Cualquier cambio ulterior del recorrido o de la intención del producto debe tramitarse mediante [pdi:baseline-update](../../00_gobierno/03_guia-operativa.md).

## Questions / Assumptions

### Decisiones resueltas

- La semana usada para las disponibilidades de P1 y P2 y para las dos fechas de la consulta es la semana natural siguiente a la fecha de verificación. La persona impulsora confirmó esta definición; quedó registrada en [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md).
- El E2E es una evidencia complementaria y puede aceptar automáticamente el requisito si completa el recorrido íntegro en menos de 150 segundos. Si no, se necesita una comprobación humana inferior a cinco minutos. La persona impulsora aprobó esta regla y la actualización normativa quedó registrada en [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md).
- Para la comprobación humana mínima basta una persona que ejecute el recorrido completo; se registrarán entorno, tiempo e incidencias.
### Supuestos no aprobados

- La medición se realizará en la aplicación local de REL-001, con entorno operativo y correo inspeccionable según la entrega; no fija navegador, equipo, dirección de prueba ni participantes.
- Se conservarán todas las acciones y su orden tal como los define [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md).
- La solicitud de correo se inicia durante la creación, según [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md). Al final se consulta el recibo del intento y se comprueba que no indica error. Este resultado informa del intento confirmado por el componente de envío; no acredita entrega al buzón ni permite afirmar que no haya rebotes posteriores.

## Research

### Completado

- Se consultaron los requisitos y flujos que componen el recorrido. La creación incluye nombre del equipo y P1, identidad de P1 seleccionada por defecto, y campo opcional de correo en el formulario; acceder lleva al calendario. El flujo de identidad permite cambiar entre P1 y P2.
- Disponibilidad solo puede cambiarse para hoy o fechas futuras según la zona aplicable; las consultas de fechas aceptan fechas desde hoy y requieren al menos una opción; consulta de texto requiere título/opciones válidas. Los votos se aplican al marcar opciones. Resolver exige confirmar aceptación o rechazo.
- WEB ya ofrece calendario por mes natural o semanas completas lunes-domingo y navegación por meses; se elegirá durante la preparación la semana que satisfaga la definición del requisito.
- El código actual recoge el correo durante la creación del equipo y conserva el estado del intento para presentar resultado/aviso en confirmación/equipo. Por tanto, la lectura compatible con el orden solicitado es verificar el resultado al final sin mover la captura ni el inicio del intento. De acuerdo con [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md), se solicita durante la creación y el resultado puede conocerse después; por ello el recibo se comprueba al final del resto del recorrido. El recibo acredita el resultado del intento, no la entrega SMTP al buzón.
- La estrategia de pruebas de REL-001 indica que automatización y compilación no demuestran por sí mismas el umbral temporal. La medición del recorrido requiere evidencia observada de tiempo.

### Pendiente

No quedan preguntas bloqueantes de producto. El Change deberá registrar el contexto y entorno concreto usados en la ejecución.

## Design

Diseño del benchmark Playwright: usar navegador y API reales, sin sustituir las interacciones por llamadas directas ni mocks. Con servicios levantados, base de prueba preparada y navegador ya en la pantalla de creación, el E2E inicia el cronómetro monotónico justo antes de enfocar/editar el primer campo del formulario. Dentro del tiempo medido: completa equipo, P1 y dirección opcional para iniciar el envío; crea y accede al equipo; marca disponibilidad de P1; crea P2 y marca disponibilidad; vuelve a P1 y crea consulta de fechas con dos fechas y consulta de texto con dos opciones; cambia a P2 y vota en ambas; vuelve a P1, resuelve una consulta y rechaza la otra; al final consulta el recibo hasta obtener resultado terminal sin error. Detiene el cronómetro en esa comprobación final. Setup/arranque de servicios, preparación de base/contexto, lanzamiento de navegador y navegación previa a la pantalla de creación quedan excluidos. Registra duración en milisegundos, aceptación automática solo con `< 150000 ms`, fecha/semana usada, resultado del recibo y paso de fallo. Si hay error funcional o de correo, tiempo agotado o paso omitido, el recorrido no pasa. La duración se etiqueta siempre como automatizada.

El benchmark es evidencia automatizada complementaria y umbral de aceptación automática únicamente cuando completa todo el recorrido en menos de 150 segundos, conforme al [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md). Si no lo alcanza, una persona ejecuta el mismo recorrido y debe completarlo en menos de cinco minutos.

Cuando el benchmark no baje de 150 segundos, la evidencia humana mínima será una persona que ejecute el mismo recorrido desde el inicio de la interacción con el formulario hasta comprobar el recibo; el umbral es `< 300 s`. Se registrarán dispositivo, navegador y condiciones, sin incluir arranque de entorno. Para ejercitar el correo, la dirección se proporciona durante la creación y el recibo se comprueba al final. Un resultado satisfactorio no se interpretará como entrega al buzón.

La selección de fechas de disponibilidad y consulta debe usar la semana natural siguiente a la fecha de verificación, según [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md). El protocolo pendiente deberá registrar esa fecha de verificación y el intervalo semanal utilizado.

## Structure

- WEB concentra la interacción de todo el recorrido. Cualquier corrección debe ubicarse donde la evidencia señale fricción; no se prejuzga una pantalla ni una solución.
- API participa al persistir participantes, disponibilidad, consultas, votos, resoluciones y el intento/resultado de correo. Se tocará solo si una fricción o incumplimiento observado se localiza allí.
- La inspección inicial confirma que el correo opcional se captura en el formulario de creación y que su resultado se consulta en la experiencia posterior. No se identificó una decisión arquitectónica nueva; contratos y comportamiento están regidos por [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md) y los contratos de WEB/API enlazados arriba.

## Plan por slices

1. **LOW — E2E benchmark:** automatizar con Playwright todo el recorrido exacto contra la WEB/API reales, medir solo las acciones desde la primera interacción con el formulario hasta la consulta del recibo final, excluir setup/arranque y reportar la aceptación automática si es `< 150 s`.
2. **LOW — Evidencia humana (condicional):** si el benchmark tarda 150 s o más, registrar una ejecución del recorrido por una persona; comparar su tiempo con `< 300 s` y registrar fricciones, terminaciones incompletas y desviaciones.
3. **MEDIUM — Correcciones guiadas por evidencia (condicional):** implementar solo las fricciones reproducibles que bloqueen el recorrido o umbral, en WEB/API afectados, sin cambiar criterios funcionales ni normas.
4. **LOW/MEDIUM — Verificación y cierre:** verificar criterios existentes de las zonas modificadas, repetir E2E y, si aplica, evaluación humana; registrar convergencia y trabajo posterior.

## Evidencia / Validation

- E2E Playwright repetible contra WEB/API reales que recorra todas las acciones en el orden especificado, registre duración automatizada en ms, resultado final del recibo y aceptación automática solo si es `< 150000 ms`; setup y arranque quedan fuera del cronómetro.
- Si el E2E tarda 150 s o más, registro de una ejecución humana con entorno, fecha, inicio/fin y desviaciones; el tiempo debe ser `< 300 s`.
- En ambos registros: acciones y orden completados, resultado de correo y observaciones/incidencias, con fecha de referencia y semana natural usada. Recorridos incompletos no cuentan como cumplimiento.
- Si se modifica WEB/API, evidencia de las verificaciones aplicables a requisitos funcionales afectados y nueva medición con el mismo protocolo.
- El E2E mide tiempo de automatización. Por decisión normativa expresa, completar el recorrido en `< 150 s` lo acepta automáticamente; con un resultado de 150 s o más se necesita evidencia humana. La compilación u otras pruebas automatizadas no sustituyen el recorrido, conforme a [Estrategia de pruebas de la demo local](../../07_desarrollo/02_testing/estrategia-demo-local.md).

## Resultado de verificación

**READY_FOR_CHANGE_CONVERGE — 2026-10-06.** La ejecución integrada final del E2E de arranque completó el recorrido en **11 728 ms**, con recibo `succeeded`, semana objetivo del 12 al 18 de octubre de 2026 (verificación: 2026-10-06) y aceptación automática. Al quedar por debajo de 150 000 ms, no se requiere comprobación humana. Evidencia reportada desde la ejecución Playwright integrada final: `CI=1 npm --prefix apps/web run test:e2e -- accessibility-smoke.spec.ts mobile-journey.spec.ts startup-benchmark.spec.ts --workers=1`; 23/23 pruebas pasaron. El benchmark adjunta `startup-benchmark.json`; la integración reportó además persistencia del informe HTML y sus adjuntos.

| Criterio | Resultado | Evidencia |
|---|---|---|
| 1. Umbral y distinción automatizada/humana | PASS | El informe etiqueta `evidence: automated`, compara contra 150 000 ms y activa `humanVerificationRequired` al alcanzar/superar el umbral; ejecución final 11 728 ms, sin requisito de medición humana. El reporte JSON queda adjunto. |
| 2. Recorrido íntegro, ordenado, incluidas consultas, votos, resolución/rechazo y correo | PASS | El E2E contiene siete pasos ordenados, comprueba mutaciones HTTP confirmadas y termina al verificar el recibo real `succeeded`; la ejecución integrada final pasó. |
| 3. Duración y comparación de umbrales | PASS | 11 728 ms frente a 150 000 ms; aceptación automática. La ruta alternativa registra la necesidad de prueba humana `<300 000 ms` sin convertir el umbral de automatización en fallo funcional. |
| 4. Fricciones y repetición del protocolo | PASS | No se reportan bloqueos del recorrido en la ejecución completa. Se ejecutó la misma secuencia bajo el protocolo definido; no se requirió una iteración adicional por fricción del arranque. |
| 5. Resultado de correo comprobable | PASS | Recibo final observado desde la respuesta real del navegador con estado `succeeded`; el test falla si no puede confirmarlo o si presenta error. |

El resultado acredita el criterio automatizado que permite aceptar RNF-COO-001; el tiempo medido es automatizado y no se presenta como medición humana ni como confirmación de entrega al buzón.

## Convergence

El recorrido E2E, el baseline y la evidencia concuerdan: los siete pasos se completaron en orden contra WEB/API reales; el intento de correo terminó con recibo `succeeded`, y el benchmark fue de 11 728 ms frente al umbral automático de 150 000 ms. Al superar el criterio automático aprobado, no hace falta medición humana. Se usó la semana natural siguiente a la verificación (2026-10-12 a 2026-10-18). El recibo acredita el resultado del intento y no se interpreta como entrega al buzón. No hay drift significativo de producto, implementación o contrato en este alcance; no se descubrió verdad normativa nueva y no procede `pdi:baseline-update`.

[RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md) puede pasar a `VALIDADO` en delivery. Los requisitos de accesibilidad completa y uso adaptable siguen su propio estado y Changes. Los commits de implementación están en la rama local `main`; no se acredita ejecución del CI remoto. **Gate de convergencia: READY_FOR_CHANGE_CLOSE.**

## Resultado de cierre

**DONE — Change cerrado y archivado el 2026-10-06.** Los cinco criterios constan en `PASS`. El E2E completó siete pasos en 11 728 ms, con recibo `succeeded` y aceptación automática por quedar debajo de 150 s; no fue necesaria prueba humana. [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md) queda `VALIDADO` en [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md). El tiempo corresponde a automatización, no a una persona, y el recibo no acredita entrega al buzón. Implementación integrada en `main` local; CI remoto no acreditado. No se modifica el baseline.

## Resultado de preparación

**READY_FOR_CHANGE_APPLY.** El E2E complementario, su umbral automático de `< 150 s`, la evidencia humana condicional y el protocolo mínimo con una persona están definidos y registrados en el baseline. La semana natural objetivo y la comprobación final del recibo de correo también están resueltas.
