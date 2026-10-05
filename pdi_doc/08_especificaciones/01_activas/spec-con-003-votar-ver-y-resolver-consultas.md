---
id: SPEC-CON-003
nivel: N3
estado: listo
release: REL-001
---

# SPEC-CON-003 — Votar, ver votos y resolver consultas

## Objetivo

Completar en [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) el recorrido de decisión sobre las consultas de texto y fechas ya creadas: registrar y cambiar votos, mostrar los votos vigentes y resolver o rechazar la consulta. La presentación de lista, detalle, votación y resolución debe ajustarse al prototipo central validado por la persona impulsora.

## Clasificación

Change **N3 de realización**: reúne tres requisitos dependientes, persistencia nueva de votos y resoluciones, transición de estado, operaciones API y varias superficies WEB en escritorio y móvil. La preparación debe tratar concurrencia, consistencia y accesibilidad antes de implementar.

## Scope

- Realizar [RF-CON-002 — Registrar y cambiar un voto](../../03_requisitos/01_funcionales/CON/rf-con-002-votar.md), [RF-CON-003 — Ver los votos por participante](../../03_requisitos/01_funcionales/CON/rf-con-003-ver-votos.md) y [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md) para consultas de texto y fechas.
- Integrar sus datos, operaciones y vistas con las consultas ya persistidas; comprobar el borrado en cascada de los datos nuevos conforme a [SPEC-EQU-002 — Borrado de equipos caducados](spec-equ-002-borrado-equipo-caducado.md), sin cerrar ese Change desde esta operación.
- Ajustar la presentación de «Consultas», detalle abierto, resultados cerrados y confirmación de resolución a [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md) y al [prototipo navegable central](../../04_experiencia-usuario/06_mockups/prototipo-ux-inicial.html), conservando la cabecera y navegación compartidas. Comparar las vistas y estados en escritorio/móvil y en claro/oscuro durante la preparación y la verificación.

## Fuera de scope

- Crear otros tipos de consulta o cambiar las reglas de creación de texto y fechas ya entregadas.
- Historial de versiones de voto, reapertura de consultas y rechazo posterior de una resolución registrada: no forman parte del comportamiento definido en esta fase.
- Envío real de correo, publicación pública y auditoría WCAG completa de la entrega; se verificará la accesibilidad del recorrido afectado sin atribuirle conformidad global.
- Cambiar la verdad normativa o dar por aprobado cualquier detalle del mockup que su ficha mantenga como propuesta.

## Baseline relacionado

- [RF-CON-002 — Registrar y cambiar un voto](../../03_requisitos/01_funcionales/CON/rf-con-002-votar.md), [RF-CON-003 — Ver los votos por participante](../../03_requisitos/01_funcionales/CON/rf-con-003-ver-votos.md) y [RF-CON-004 — Resolver una consulta](../../03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md).
- [RN-CON-001 — Votación múltiple y pública](../../03_requisitos/02_reglas-negocio/CON/rn-con-001-votacion-publica.md), [RN-CON-002 — Resolución de una consulta abierta](../../03_requisitos/02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md), [RD-CON-001 — Voto atribuido a participante](../../03_requisitos/03_datos/CON/rd-con-001-voto.md) y [RD-CON-002 — Resultado de la resolución](../../03_requisitos/03_datos/CON/rd-con-002-resolucion.md).
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md), [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md) y [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md).
- [FLUJO-CON-002 — Responder una consulta abierta](../../04_experiencia-usuario/02_flujos/flujo-con-002-responder-consulta.md) y [FLUJO-CON-003 — Resolver una consulta](../../04_experiencia-usuario/02_flujos/flujo-con-003-resolver-consulta.md).
- [WF-CON-001 — Lista de consultas del equipo](../../04_experiencia-usuario/03_wireframes/wf-con-001-lista-consultas.md), [WF-CON-002 — Detalle de una consulta abierta](../../04_experiencia-usuario/03_wireframes/wf-con-002-detalle-consulta.md), [WF-CON-003 — Consulta resuelta o rechazada](../../04_experiencia-usuario/03_wireframes/wf-con-003-consulta-cerrada.md) y [WF-CON-005 — Confirmar la resolución de una consulta](../../04_experiencia-usuario/03_wireframes/wf-con-005-confirmar-resolucion.md).
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) y [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md).
- [SPEC-CON-001 — Crear una consulta con opciones de texto](../99_archivadas/spec-con-001-crear-consulta-texto.md), [SPEC-CON-002 — Crear una consulta de fechas](../99_archivadas/spec-con-002-crear-consulta-fechas.md) y [SPEC-EQU-002 — Borrado de equipos caducados](spec-equ-002-borrado-equipo-caducado.md).

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md): contratos, reglas, casos de uso y persistencia.
- [WEB](../../06_arquitectura/03_modulos/WEB/README.md): lista, detalles, voto, resolución y estados visuales.

## Criterios de aceptación

Los criterios de los tres requisitos enlazados siguen siendo la referencia completa. Para verificar este Change se agrupan en evidencias observables:

1. En una consulta abierta de texto o fechas, una identidad del equipo puede marcar varias opciones, cambiarlas y retirar la última sin botón de guardar; una fecha pasada sigue votable. Cada acción confirmada modifica el voto vigente y la actividad del equipo; un fallo no lo hace.
2. El detalle muestra para cada opción el recuento y hasta tres votantes; «(+N)» expande los restantes en esa misma opción. La identidad activa aparece primero y enfatizada si votó. El resultado coincide con los votos persistidos al recargar y desde otro navegador.
3. El cambio visual de voto es inmediato. Si falla la escritura, WEB restaura selección, recuento y nombres, anuncia el problema y permite reintentar mientras el equipo y la consulta sigan vigentes.
4. Una consulta abierta puede aceptar una o varias opciones propias o rechazarse aun sin votos. La selección de resolución comienza vacía, es independiente del voto propio y requiere confirmación. Cancelar no cambia nada.
5. Una resolución confirmada se atribuye a la identidad activa, persiste su resultado y mueve la consulta al grupo correcto. La lista resume las opciones aceptadas; el detalle de consultas resueltas o rechazadas conserva votos y resultado visibles sin permitir cambios ni reapertura.
6. API comprueba Bearer, vigencia, pertenencia de consulta/participante/opciones y estado antes de cada mutación. Voto y resolución concurrentes dejan un único estado coherente; no hay escritura parcial, doble recuento ni renovación de actividad ante una petición fallida o sin cambio efectivo.
7. Votos, opciones aceptadas y atribución de resolución se eliminan en cascada al borrar el equipo. Los contratos existentes de creación y lectura de consultas de texto/fecha siguen funcionando.
8. Lista, detalle, tarjetas de voto, error/reintento, diálogo de resolución y detalle cerrado respetan la composición e interacción centrales validadas en el prototipo, tanto en escritorio como móvil y en claro/oscuro. Teclado, foco, nombres/estados y anuncios se comprueban en el recorrido; la auditoría WCAG completa sigue siendo gate de la entrega.

## Impacto baseline esperado

Realización de requisitos y estados existentes. No se identificó una regla nueva que requiera `pdi:baseline-update`, ni un cambio de límites de módulo que requiera ADR nuevo. El contrato de las operaciones y sus decisiones técnicas se fijan aquí para este Change; no se elevan a norma de producto.

## Questions / Assumptions

| Cuestión | Clasificación y resolución para este Change |
|---|---|
| ¿Se vota bajo identidad o con permisos individuales? | Resuelta por los requisitos y [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md): Bearer autoriza el equipo; API comprueba que la identidad indicada pertenece a él. |
| ¿Puede resolverse antes del primer voto y pueden votarse fechas pasadas? | Resuelta por los RF/RN enlazados: sí en ambos casos, siempre que la consulta siga abierta. |
| ¿Qué sucede con votos simultáneos y con una resolución concurrente? | Incertidumbre técnica resuelta con una transacción y el bloqueo del equipo que ya usa API: serializar, releer el estado dentro del bloqueo y rechazar un voto si la resolución ganó. La escritura de cada opción expresa el estado deseado, no una orden de invertirlo. |
| ¿Cómo se evita repetir una mutación tras perder su respuesta? | Decisión técnica: operaciones `PUT` idempotentes. Repetir exactamente el estado de una opción o una resolución ya registrada devuelve la representación actual sin duplicar filas ni actividad; una resolución distinta encuentra conflicto. |
| ¿Qué parte del prototipo es vinculante? | La persona impulsora exige esta presentación; la ficha de [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md) señala como validadas composición e interacciones centrales, incluido el error de voto. Las etiquetas `PROPUESTO` de wireframes y los valores visuales finales no se tratan como aprobados; se usan los tokens actuales y se ajustan donde haga falta para accesibilidad. |
| ¿Se conserva un historial de versiones de votos o se reabre una consulta? | No se ha definido tal comportamiento y permanece fuera del alcance. El modelo guarda solo la selección vigente y una única resolución final. |

No quedan preguntas de producto bloqueantes para preparar este Change. Si durante `change-apply` surge una decisión no cubierta por estas fuentes, se registrará y escalará antes de implementarla.

## Research

- API ya expone `GET/POST /api/teams/current/consultations`; `ConsultationService` verifica acceso y usa `TeamRepository::withLockedTeam` para crear, y `OrmConsultationRepository` agrupa el listado por `open`, `resolved` y `rejected`. `ConsultationRecord` conserva estado y opciones tipadas, pero no votos, resolución ni lectura individual. `TeamOpenApiFactory` documenta el contrato manualmente.
- `withLockedTeam` usa transacción Doctrine, bloqueo pesimista de la fila del equipo y refresco antes de ejecutar el caso de uso. La limpieza de equipos usa el mismo bloqueo y las FK actuales usan `ON DELETE CASCADE`; las tablas nuevas deberán continuar esa cadena y probarla con PostgreSQL.
- WEB tiene `TeamLayout`, `TeamApi` y `ConsultationsPage`. La sección lista consultas, pero las tarjetas aún no se abren. `ConsultationGroups` ya distingue estados; el detalle y los tipos de voto/resolución no existen. El interceptor lee el Bearer del fragmento `#t=...`.
- [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md) y su HTML central muestran tarjetas abiertas, tres votantes visibles, expansión dentro de la opción, restauración/reintento ante fallo, selección de aceptación independiente, confirmación y detalle cerrado. Sus notas distinguen la dirección validada de valores visuales aún en revisión.
- `ConsultationApiTest`, `TeamCleanupTest` y los E2E de consultas son puntos de ampliación. Los E2E actuales simulan HTTP para la interfaz; la persistencia se comprueba en PHPUnit con PostgreSQL. La verificación de extremo a extremo con API real debe indicarse por separado.

## Design / Structure

### Contrato y casos de uso API

- Mantener `GET/POST /api/teams/current/consultations` y los campos existentes. Añadir a las consultas cerradas del listado un resumen de resolución con identidad y opciones aceptadas; las abiertas no tienen resolución.
- Añadir `GET /api/teams/current/consultations/{consultationId}` que devuelve el detalle con opciones en orden, recuento y lista completa de votantes por opción, más la resolución cuando exista. La lista completa permite expandir más de tres nombres en WEB; API calcula los recuentos de votos vigentes. La lectura requiere Bearer, pero no identidad activa y no renueva la actividad.
- Añadir `PUT /api/teams/current/consultations/{consultationId}/votes/{participantId}/options/{optionId}` con JSON `{ "selected": true|false }`. Devuelve el detalle confirmado y `expiresAt`. Cada petición fija de manera idempotente la selección de esa opción para la identidad indicada; una deselección de la última opción borra el voto vigente. No se rechaza una fecha pasada solo por ser pasada.
- Añadir `PUT /api/teams/current/consultations/{consultationId}/resolution` con `participantId`, `status: "resolved"|"rejected"` y `acceptedOptionIds`. `resolved` exige una o varias opciones propias, sin duplicados; `rejected` exige lista vacía. Devuelve detalle y `expiresAt`. Repetir el mismo resultado con la misma identidad es lectura idempotente; otro resultado encuentra `409`.
- Los dos `PUT` se ejecutan bajo `withLockedTeam`: verificar Bearer, vigencia, identidad y pertenencia de consulta/opción; releer estado bajo el bloqueo; persistir voto o resolución y actividad solo ante modificación efectiva. Una consulta cerrada responde `409` a nuevo voto o resolución distinta, con tipo de problema estable; `404` no revela consultas ni participantes ajenos al equipo, `422` identifica cuerpo inválido y `410` conserva la semántica del equipo caducado. Se mantendrán JSON, Problem Details, `Cache-Control: no-store` y OpenAPI sincronizados con respuestas reales.

### Persistencia y consistencia

- Añadir migración compatible con consultas existentes: tabla de voto vigente única por `(consultation_id, participant_id)` y tabla de selecciones única por `(vote_id, option_id)`, con FK en cascada. Al retirar la última selección se elimina el voto vacío. El servicio comprueba que cada opción pertenece a la consulta y que el participante pertenece al equipo.
- Añadir a `consultation` identidad y momento de resolución nulos mientras siga abierta, junto con una tabla de opciones aceptadas única por `(consultation_id, option_id)` y FK en cascada. Una migración deja intactas las consultas abiertas existentes. La transacción registra estado, atribución, opciones aceptadas y actividad juntos. Las restricciones y pruebas cubren unicidad, pertenencia en el caso de uso y eliminación por equipo.
- La serialización por equipo cubre dos votos simultáneos de la misma identidad y la carrera voto/resolución, sin introducir historial. `PUT` con estado deseado evita que un reintento invierta por segunda vez la opción. Ante respuesta perdida, WEB vuelve a consultar el detalle antes de ofrecer el reintento; no presenta datos locales como confirmados.

### Presentación WEB

- `ConsultationsPage` mantiene la lista y el diálogo de creación actuales. Sus tarjetas pasan a abrir un detalle real dentro de la misma sección, con acción «Volver a Consultas» y recarga del detalle al abrir. El resumen de una consulta resuelta incluye opciones aceptadas; la rechazada expresa el rechazo.
- Extraer el detalle abierto/cerrado y la selección de resolución en componentes del módulo WEB si la implementación lo requiere, sin duplicar `TeamLayout`, tema, identidad ni cliente API. `TeamApi` tipa el contrato de detalle, voto y resolución; la representación del servidor gobierna recuentos, votantes y estado.
- La opción abierta actúa como tarjeta seleccionable con checkbox y nombre accesible; el botón «(+N)» expande votantes dentro de la opción sin activar el voto. WEB muestra el cambio inmediatamente, serializa las escrituras de esa identidad para evitar respuestas fuera de orden y restaura la última representación confirmada al fallar; anuncia el fallo y ofrece reintentar si la consulta sigue abierta.
- Resolver abre un diálogo con todas las opciones sin marcas iniciales y con sus votos visibles. La selección de aceptación no toma el voto propio. Aceptar o rechazar abre un paso de confirmación; cancelar conserva la consulta abierta. Tras confirmación, se refrescan grupos y se abre un detalle cerrado de solo lectura con resultado, identidad resolutora y votos.
- Conservar la composición validada del prototipo: cabecera común, pestañas, cabecera de sección, lista por estados, tarjeta de detalle, avisos junto a la acción y diálogos centrados. Comparar tema claro/oscuro y escritorio/móvil; reutilizar tokens actuales y ajustar contraste, foco, nombres y adaptación conforme a las reglas WEB. No trasladar al producto datos de ejemplo del HTML.

## Plan por slices

1. **Modelo y migración:** voto vigente, selecciones, atribución de resolución y opciones aceptadas; conservar consultas existentes y validar FK, unicidad, cascada y esquema Doctrine.
2. **API de voto y lectura:** detalle autorizado, mutación idempotente de opción, recuentos/votantes, actividad efectiva y contrato OpenAPI; cubrir errores y carreras con PostgreSQL.
3. **WEB de lista, detalle y voto:** tarjetas navegables, detalle de texto/fecha, selección optimista, recuentos, expansión de votantes y restauración/reintento; contrastar el prototipo en ambos temas y tamaños.
4. **Resolución API/WEB:** resultado transaccional e idempotente, confirmación, detalle cerrado y grupos; probar carrera con voto, resolución sin votos y acceso de segundo navegador.
5. **Integración y regresión:** ejecutar validaciones completas, revisar la cascada de [SPEC-EQU-002 — Borrado de equipos caducados](spec-equ-002-borrado-equipo-caducado.md) y verificar cada criterio con evidencia técnica y comparación visual.

## Evidencia / Validation

- PHPUnit con PostgreSQL: migrar consultas anteriores, unicidad de voto/selección, varios participantes y opciones, retirada completa, fecha pasada, recuentos, misma petición repetida, actividad solo ante cambio, acceso ausente/inválido/ajeno/caducado, fallo con rollback, voto y resolución concurrentes, resolución sin votos, aceptación múltiple/rechazo, lectura cerrada y cascada de equipo. Probar que una opción de otra consulta no se acepta.
- Contrato: pruebas API de los cuerpos y respuestas reales de los tres endpoints nuevos, códigos y `type` de Problem Details, `no-store`, y exportación OpenAPI; regresión de `GET/POST` de consultas textuales y de fechas existentes.
- WEB/Playwright: lista y detalle de ambos tipos, marcar/cambiar/retirar, 0/3/4+ votantes con identidad activa primero, expansión sin voto accidental, restauración/reintento, confirmación/cancelación, resolución sin votos y con varias opciones, detalle cerrado, recarga, otra identidad y otro contexto de navegador. Incluir fallo y reintento que consulten estado confirmado.
- Comparación visual documentada con el [prototipo navegable central](../../04_experiencia-usuario/06_mockups/prototipo-ux-inicial.html): capturas o revisión lado a lado de lista, detalle abierto, error de voto, diálogo de resolución y detalle cerrado en 1280 px y 390 px, claro y oscuro. Comprobar además teclado, foco, nombres/estados y anuncios. Los ajustes por accesibilidad se documentarán sin afirmar una auditoría WCAG global.
- Comandos existentes: `docker compose exec api composer test`, `composer cs:check`, `composer stan`, `composer rector:check`, `php bin/console lint:container`, `php bin/console doctrine:schema:validate`, `npm --prefix apps/web test`, `npm --prefix apps/web run test:e2e`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run format:check`, `npm --prefix apps/web run build` y `python3 pdi/scripts/validate_structure.py`. Revisar el estado de migraciones antes de probar la API contra la base local.

## Definition of Ready

- Objetivo, tres requisitos y dependencias internas identificados; las reglas de voto, visibilidad y resolución tienen origen en baseline y flujos enlazados.
- Riesgos de concurrencia, persistencia, seguridad, estados y fidelidad visual tienen diseño y pruebas previstos; módulos API y WEB poseen reglas vigentes.
- No quedan preguntas bloqueantes, cambio normativo ni ADR nuevo necesarios para iniciar la implementación. **Gate: READY_FOR_CHANGE_APPLY.**

## Implementación de change-apply (2026-10-05)

Las cinco slices previstas quedan implementadas en la rama `change/con-003-apply`: migración Doctrine y entidades de voto vigente/resolución; lectura de detalle, voto por opción y resolución idempotentes bajo el bloqueo transaccional del equipo; contrato OpenAPI; lista navegable, detalle abierto/cerrado, voto optimista con restauración y reintento, selección de opciones aceptadas y confirmación de resolución. Los componentes WEB usan la composición y los estados centrales del prototipo enlazado.

Se aplicó la migración `Version20261005180000` a las bases locales de desarrollo y pruebas. Las pruebas API cubren voto múltiple, retirada, reintentos sin renovar actividad, fechas pasadas, aceptación y rechazo, pertenencia, acceso, rollback, carrera voto/resolución y borrado en cascada. La suite WEB cubre el flujo nuevo con fallo de voto, reintento y resolución, además de las regresiones existentes. La comparación visual formal en los dos tamaños y temas y la matriz completa de criterios quedan para `pdi:change-verify`.

**Gate de aplicación: READY_FOR_CHANGE_VERIFY.** No se cambia la verdad normativa ni se cierra el Change en esta fase.

## Convergence

Pendiente.

## Resultado de cierre

Pendiente.
