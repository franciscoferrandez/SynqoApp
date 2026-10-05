---
id: SPEC-DIS-001
nivel: N2
estado: ready
release: REL-001
---

# SPEC-DIS-001 — Disponibilidad diaria y visor del equipo

## Objetivo

Realizar la disponibilidad diaria compartida y su consulta en el calendario del equipo para avanzar [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md), a partir del acceso y la selección de identidad ya entregados en [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](../99_archivadas/spec-equ-001-arranque-equipo-local.md).

## Clasificación

Change de **realización N2**: combina persistencia y reglas temporales en API con interacción y visor en WEB. Afecta a dos módulos y requiere validar acceso, datos compartidos y recuperación tras fallos.

## Scope

- Marcar, modificar y retirar la disponibilidad de la identidad activa según [RF-DIS-001 — Marcar y modificar disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md).
- Consultar en el calendario el estado agregado y el estado de la identidad activa, con detalle diario, según [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md).
- Persistir las marcas por equipo, participante y día, y reflejar los cambios entre navegadores con acceso al equipo.

## Fuera de scope

Crear consultas de fechas o texto, votar, resolver consultas y borrar definitivamente equipos caducados. Esas capacidades figuran como entregas pendientes independientes en [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md).

## Baseline relacionado

- [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md)
- [RF-DIS-001 — Marcar y modificar disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RN-DIS-001 — Disponibilidad diaria del equipo](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md)
- [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md)
- [RD-DIS-001 — Disponibilidad vigente por día](../../03_requisitos/03_datos/DIS/rd-dis-001-disponibilidad.md)
- [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md)
- [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md)
- [FLUJO-DIS-001 — Marcar disponibilidad en el calendario](../../04_experiencia-usuario/02_flujos/flujo-dis-001-marcar-disponibilidad.md)
- [WF-DIS-001 — Calendario inicial del equipo](../../04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md)
- [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md)
- [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md)
- [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md)
- [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md)
- [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](../99_archivadas/spec-equ-001-arranque-equipo-local.md)

## Módulos afectados

- [WEB](../../06_arquitectura/03_modulos/WEB/README.md)
- [API](../../06_arquitectura/03_modulos/API/README.md)

## Criterios de aceptación del Change

1. Una identidad seleccionada puede marcar un día actual o futuro como disponible, quizá o no disponible, cambiar la marca y retirarla pulsando de nuevo la opción activa. «Sin marcar» es ausencia de marca; no se presenta como cuarta tarjeta de edición.
2. La API impide modificar días anteriores a «hoy» en la zona del dispositivo comunicada por WEB; si no se obtiene, usa la zona del equipo. El mismo día pasado continúa consultable. El control usa el reloj del servidor y comprueba la regla de nuevo en cada escritura.
3. Las marcas se guardan por equipo, participante y fecha sin mezclarse con votos. Una recarga o apertura del enlace desde otro navegador devuelve los datos confirmados. Una lectura no reinicia la caducidad; una marca, cambio o retirada efectiva sí la reinicia. Una escritura fallida o idéntica al valor vigente no la reinicia.
4. El resumen de cada día muestra el estado más restrictivo indicado y los tres recuentos según [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md); sin marcas muestra un estado neutro. El detalle agrupa los participantes por estado, omite a quienes no marcaron y muestra «Tú» primero dentro de su grupo.
5. El calendario abre en el mes natural actual. Permite recorrer meses, alternar entre días del mes y semanas completas de lunes a domingo, y regresar a «Hoy» cuando queda fuera de las fechas visibles. Los días vecinos conservan su fecha real.
6. «Equipo» muestra el agregado en las casillas; «Mi disponibilidad» muestra la marca de la identidad activa o su ausencia. Cambiar de modo o identidad no altera el desglose compartido del detalle ni los datos persistidos.
7. Seleccionar un día abre el detalle. En móvil se presenta como diálogo sobre el calendario y se cierra devolviendo el foco al día seleccionado. Los días pasados se distinguen visualmente y muestran las tarjetas sin permitir cambios.
8. Un cambio se refleja de inmediato en casilla, recuentos y detalle. Si la API falla, WEB restaura el estado anterior y ofrece reintentar la misma acción solo si el equipo y la fecha aún la permiten. Un error de acceso o caducidad lleva al estado de enlace correspondiente.
9. El recorrido se puede usar en escritorio y navegador móvil, en ambos temas, con teclado, nombres y estados accesibles, foco y anuncios de cambios y errores. La auditoría completa de conformidad WCAG de la entrega sigue el gate de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md).

## Impacto baseline esperado

Ninguna regla normativa nueva: este Change realiza los dos RF y sus reglas, datos y UX enlazados. Las decisiones de ruta, forma de respuesta y esquema de persistencia que siguen son contrato técnico de esta SPEC, no nuevas reglas de producto.

## Questions / Assumptions

- **Identidad y acceso — resuelto:** la identidad activa indica bajo qué participante se escribe; el Bearer del enlace autoriza la operación. La identidad recordada no es una credencial, conforme a [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md) y [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).
- **Zona del dispositivo — resuelto técnicamente:** WEB enviará una zona IANA opcional en la mutación. La API usará esa zona solo para determinar si la fecha admite edición; si el navegador no la obtiene, usará la zona ya guardada del equipo. Una zona enviada pero inválida dará `422`. El enlace compartido no acredita la zona física del dispositivo; este contrato transporta el dato requerido por [RN-DIS-001 — Disponibilidad diaria del equipo](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md) sin tratarlo como credencial.
- **Cambios simultáneos — resuelto técnicamente:** la base conserva un único valor vigente por participante y día. Las escrituras se serializan para el mismo equipo; gana la última escritura confirmada. La respuesta devuelve el día autoritativo y WEB lo reconcilia con su estado optimista. No se introduce historial ni resolución de conflictos entre navegadores porque [RD-DIS-001 — Disponibilidad vigente por día](../../03_requisitos/03_datos/DIS/rd-dis-001-disponibilidad.md) no los prevé.
- **Consultas — fuera de scope:** el acceso visual a «Crear consulta de fechas» puede permanecer informativo/inactivo durante este Change; el visor no crea ni vota consultas. La capacidad se entregará al preparar [RF-CON-001 — Crear una consulta de fechas](../../03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md).
- **Decisiones bloqueantes:** ninguna identificada para los dos RF. Las copias, borrado definitivo y correo no forman parte de este Change. Si al implementarlo aparece una regla no deducible del baseline, se registrará y escalará antes de continuar.

## Research necesario

La base Angular ya tiene `TeamLayout`, `TeamApi` y una sección de calendario ilustrativa en `apps/web/src/app/pages/empty-section.ts`. API ya verifica Bearer, vigencia y equipo, usa Doctrine ORM, un reloj inyectado y bloqueo transaccional en `TeamService` y `OrmTeamRepository`. No existen operaciones ni tabla de disponibilidad. Se reutilizarán los contratos de WEB/API, el layout y la [convención HTTP común](../../06_arquitectura/03_modulos/API/convencion-http.md), sin añadir un módulo tecnológico distinto.

La revisión focal del [estado de la documentación](../../00_gobierno/02_estado-documentacion.md) declara `NOT_READY` para la entrega completa y señala expresamente que el calendario real necesita su propio Change. Los requisitos, el flujo y el wireframe enlazados proporcionan la definición funcional de este incremento; la auditoría de toda la entrega conserva su estado pendiente.

## Design / Structure

### API y persistencia

- Añadir una entidad Doctrine de disponibilidad diaria y una migración. Una fila representa una marca vigente con equipo, participante, día civil (`date`) y estado `available`, `maybe` o `unavailable`. Una restricción única sobre equipo, participante y día impide dos marcas vigentes; retirar la marca elimina la fila. Verificar que el participante pertenece al equipo antes de leer o escribir, y enlazar su borrado al del equipo/participante. El cálculo de resumen vive en API y no en WEB.
- Incorporar un caso de uso y un repositorio de disponibilidad con reglas de fecha, resumen y escritura atómica. Reutilizar la comprobación del enlace y la caducidad existentes. La escritura bloquea el equipo y verifica vigencia, identidad, fecha y valor antes de modificar; guarda marca y última actividad en la misma transacción. Una lectura no toca última actividad. El reloj es inyectable. Las operaciones no exponen CRUD automático de Doctrine.
- `GET /api/teams/current/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` exige Bearer y devuelve `200` con `days`, un elemento por fecha del intervalo inclusivo. Cada elemento contiene `date`, `state` agregado (`available`, `maybe`, `unavailable` o `null`), `counts` para los tres estados y `marks` con `participantId`, `participantName` y `state` para las marcas existentes. La API admite intervalos de hasta 42 días inclusivos, suficientes para cualquier mes completado por semanas; valida formato, orden y límite antes de consultar.
- `PUT /api/teams/current/availability/{date}/participants/{participantId}` exige Bearer y recibe JSON `{ "state": "available" | "maybe" | "unavailable" | null, "timeZone"?: "Europe/Madrid" }`. `null` retira la marca. Devuelve `200` con `day` en la misma forma de lectura y `expiresAt` actualizado. Repetir exactamente el estado vigente es una escritura idempotente sin modificación ni prórroga. Un participante ausente o ajeno al equipo produce `404` genérico.
- Errores aplicables: `400` para JSON o parámetros de consulta mal formados; `401` sin Bearer; `404` para enlace inválido, equipo borrado o participante ajeno; `410` para equipo caducado aún conservado; `422` para estado, fecha o zona inválidos y para un día ya pasado; `500` para fallo inesperado. Las respuestas y errores siguen Problem Details, `Cache-Control: no-store`, los tipos y campos estables de la [convención HTTP común](../../06_arquitectura/03_modulos/API/convencion-http.md). OpenAPI documenta cuerpos, parámetros y estados reales. No se usa `403`: seleccionar identidad no crea un permiso diferente del enlace.

### WEB

- Sustituir solo la rama de calendario de `EmptySection` por un componente de disponibilidad; conservar la sección de consultas y el `TeamLayout`. `TeamApi` añade lectura del intervalo y escritura del día. El `TeamLayout` comparte equipo e identidad activa con la vista hija y actualiza la fecha de caducidad tras una mutación confirmada.
- Calcular los días del mes por fecha civil y zona aplicable, sin convertir la fecha `YYYY-MM-DD` en un instante UTC para decidir «hoy». Pedir a la API el intervalo visible al entrar o cambiar de mes/modo; mostrar carga, estado vacío y error con reintento. La representación del día usa el agregado que entrega API o la marca de la identidad activa; el detalle conserva los recuentos y nombres del equipo en ambos modos.
- Mantener selección y modo al actualizar datos. Al editar, actualizar de forma optimista la casilla y el detalle; al confirmar, reconciliar con el día devuelto y la fecha de caducidad; al fallar, restaurar el día anterior y mostrar el aviso con «Reintentar» conforme a la variante validada del [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](../../04_experiencia-usuario/06_mockups/mockup-coo-001-calendario-consultas.md). Volver a comprobar elegibilidad temporal antes del reintento.
- Conservar la estructura visual del calendario aprobado: encabezado del mes, controles de navegación, alcance y extensión, cuadrícula de lunes a domingo y panel de detalle en escritorio. En móvil, detalle en diálogo centrado con cierre y retorno de foco. Cada día y control dispone de nombre, estado y foco perceptibles; el color no es la única señal del estado.

## Plan por slices

1. **Reglas y datos:** migración Doctrine, modelo de marca vigente, cálculo de «hoy» y resumen, repositorio y pruebas de reglas puras y de integridad con PostgreSQL.
2. **Contrato API:** lectura del intervalo y mutación protegida con reloj/lock, caducidad y actividad; OpenAPI y pruebas de integración de acceso, validación, concurrencia, lectura tras recarga y no modificación en errores.
3. **Visor WEB:** reemplazar calendario ilustrativo por cuadrícula real, navegación de meses, semanas completas, «Hoy», modos y detalle; pruebas de componentes de fechas, agregados, identidad y estados de carga.
4. **Edición y recorrido:** conectar las tres tarjetas, actualización optimista, rollback y reintento, caducidad en cabecera y diálogo móvil; probar dos navegadores, teclado, foco y tamaños móvil/escritorio con los comandos del proyecto.

## Evidencia / Validation

- API: probar estados y recuentos neutro/mixto, fecha pasada y borde de día en dos zonas, fallback de zona, días vecinos, autorización, equipo caducado y borrado, participante ajeno, unicidad y escrituras concurrentes. Verificar que la lectura y el `PUT` idéntico no renuevan caducidad y que una escritura efectiva sí; comprobar rollback completo ante fallo de guardado.
- WEB: pruebas de componentes para mes natural, semanas completas, «Hoy», modos, cambio de identidad, detalle, estado optimista y restauración/reintento; recorrido Playwright con dos contextos, recarga, días pasados y móvil. Revisar manualmente foco, teclado, anuncios y contraste de los controles nuevos en ambos temas; la auditoría WCAG completa de [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) queda pendiente para la release.
- Comandos existentes: `docker compose exec api composer db:reset:test`, `docker compose exec api composer test`, `docker compose exec api composer cs:check`, `docker compose exec api composer stan`, `docker compose exec api composer rector:check`, `docker compose exec api php bin/console doctrine:schema:validate`, `npm --prefix apps/web test`, `npm --prefix apps/web run test:e2e`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run format:check` y `npm --prefix apps/web run build`. La base de prueba puede reiniciarse; no reiniciar la base de desarrollo para validar.
- `pdi:change-verify` contrastará cada criterio anterior con pruebas, contrato OpenAPI, comportamiento en navegador y baseline. `pdi:change-converge` resolverá discrepancias antes del cierre.

## Definition of Ready

**READY_FOR_CHANGE_APPLY.** Objetivo, scope y exclusiones delimitados; requisitos, reglas, datos, UX y módulos WEB/API enlazados; contratos, persistencia, slices y evidencia definidos. No se han encontrado preguntas funcionales bloqueantes en este alcance. El estado global `NOT_READY` de la release corresponde a capacidades posteriores y auditoría completa, no impide preparar este incremento focal. La validación estructural de PDI no detecta enlaces rotos ni denominaciones incorrectas.

## Convergence

Pendiente de implementación y verificación. No se modifica el baseline para acomodar la futura implementación.

## Resultado de cierre

Change abierto; sin resultado de cierre.
