---
id: SPEC-EQU-003
nivel: N3
estado: cerrado
release: REL-001
---

# SPEC-EQU-003 — Envío opcional del enlace del equipo por correo

## Objetivo

Preparar la realización de [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md), con una herramienta local que permita inspeccionar los mensajes en desarrollo y una presentación de correo clara, limpia y reutilizable para futuras comunicaciones de Synqo. La reutilización se refiere a la composición visual y técnica del mensaje; no autoriza conservar destinatarios ni enviar comunicaciones adicionales.

## Clasificación

Change **N3 de realización**: afecta al recorrido de creación en WEB, al envío y resultado en API, al tratamiento transitorio de datos, a la infraestructura local y a una base visual de correo reutilizable. El requisito ya existe en el baseline. Su realización requiere contratos, protección del acceso y operación verificable.

## Scope

- Envío opcional del enlace al crear un equipo, con resultado y aviso de fallo observables conforme al requisito relacionado.
- Inspección de mensajes de desarrollo mediante Mailpit, integrado de forma reproducible en el entorno local.
- Correo del enlace con formato limpio y moderno, basado en la paleta principal de Synqo en su variante clara, legible en clientes de correo habituales.
- Base de composición de mensajes reutilizable para futuras notificaciones o comunicaciones, sin crear nuevos tipos de mensaje en este Change.
- Verificación del tratamiento efímero de la dirección y de la protección del enlace durante el intento de envío.

## Fuera de scope

- Envíos distintos del enlace de creación, campañas, listas de destinatarios, cuentas, reenvío manual y seguimiento de rebotes.
- Retener la dirección después del intento o reutilizarla para otras comunicaciones.
- Publicación en Internet, elección de proveedor de producción, entrega garantizada al buzón y seguimiento de rebotes.

## Baseline relacionado

- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md).
- [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md).
- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md) y [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md).
- [FLUJO-EQU-002 — Crear un equipo rápido](../../04_experiencia-usuario/02_flujos/flujo-equ-002-crear-equipo.md).
- [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../../05_investigacion-y-decisiones/05_adr/adr-equ-001-separar-identidad-y-acceso.md) y [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).
- [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md): decisión aprobada durante esta preparación.
- [Sistema de diseño inicial de Synqo](../../04_experiencia-usuario/05_sistema-diseno/sistema-diseno-inicial.md) y [Dirección visual inicial de Synqo](../../04_experiencia-usuario/04_direccion-visual/direccion-visual-synqo.md): referencias para preparar la presentación del correo.

## Entrega objetivo y decisión de alcance

La persona impulsora decidió expresamente el 2026-10-06 ampliar [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) para incluir el envío real y su inspección local. La operación `pdi:baseline-update` actualizó la entrega, el alcance conceptual, el flujo y los contratos de los módulos. El código actual aún descarta la dirección; esa diferencia es el trabajo de este Change y no se declara entregada.

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md): solicitud de envío, resultado, protección del acceso y datos transitorios.
- [WEB](../../06_arquitectura/03_modulos/WEB/README.md): campo, confirmación y aviso al navegador creador.
- Infraestructura local de desarrollo en `compose.yaml` y composición de mensajes dentro de API; no se crea un módulo nuevo.

## Criterios de aceptación

Los nueve criterios de [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md) son la referencia funcional. Se comprobarán además estos resultados propios del Change:

1. Con el entorno local levantado, un equipo creado con dirección de prueba produce un mensaje inspeccionable en Mailpit con nombre y enlace correctos; sin dirección no produce mensaje ni evento.
2. El mensaje presenta HTML y texto alternativo, mantiene enlace visible y accionable sin imágenes externas, usa la composición clara aprobada y permite lectura en anchura móvil y escritorio.
3. Tras éxito, fallo o expiración no quedan dirección ni token de acceso en el evento, el resultado privado sigue consultable solo mediante el recibo y no se realiza un segundo intento. El dato transitorio respeta [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md).

## Impacto baseline esperado

La ampliación de entrega y la adopción de [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md) quedaron reflejadas mediante `pdi:baseline-update` y `pdi:architecture-decision`. El Change no altera el uso limitado de la dirección ni la regla de un intento.

## Questions y decisiones de preparación

| Pregunta | Por qué importa / gate | Opciones y resultado |
|---|---|---|
| ¿Qué entrega incorpora el envío real y la herramienta local de inspección? | Bloqueaba fijar release y alcance. | **Resuelto:** ampliar [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md), aprobado expresamente el 2026-10-06. |
| ¿Cómo se ejecuta un único intento y cómo se conoce su resultado sin bloquear la creación? | Bloqueaba contrato, limpieza y aviso tardío. | **Resuelto:** opción D de las [alternativas de envío del enlace](../../05_investigacion-y-decisiones/03_alternativas/alternativas-envio-correo-equipo.md), aprobada expresamente en [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md). |
| ¿Qué herramienta y configuración local permiten inspeccionar los correos? | Bloqueaba la evidencia de desarrollo y operación reproducible. | **Resuelto técnicamente:** Mailpit recibe SMTP en la red de Compose y expone su interfaz de inspección solo en local. |
| ¿Qué estructura visual y técnica permite reutilizar los mensajes? | Bloqueaba la composición y validación del correo en clientes habituales. | **Resuelto:** plantilla de estructura clara con versión HTML y texto, contenido específico inyectado sin ampliar finalidades, aprobada en el gate N3. |
| ¿Se aprueba el diseño detallado de este Change, incluido plazo global inicial de 30 minutos, recibo privado, protección temporal y [propuesta visual de correo](../../04_experiencia-usuario/06_mockups/prototipo-correo-enlace-equipo.html)? | Bloqueaba DoR/READY_FOR_CHANGE_APPLY por contrato de seguridad y presentación nuevos. | **Resuelto:** la persona impulsora aprobó expresamente la propuesta completa el 2026-10-06. |

## Research

- La implementación actual crea equipo y primer participante con `OrmTeamRepository::create`, y solo almacena SHA-256 del token; `TeamService::create` devuelve el enlace completo. La WEB presenta un campo opcional pero no lo transmite a `TeamApi.create`; la confirmación declara que no se envió correo. Son los puntos de integración que se modificarán, sin tomar su comportamiento actual como intención normativa.
- [Las alternativas de envío del enlace](../../05_investigacion-y-decisiones/03_alternativas/alternativas-envio-correo-equipo.md) comparan envío síncrono, trabajo en memoria, cola externa y evento transaccional. La última evita perder la intención entre la creación y el proceso posterior; exige controlar reclamación, limpieza y secreto temporal. [RESR-EQU-001 — ¿Cuándo se conoce el resultado del envío del enlace por correo?](../../05_investigacion-y-decisiones/01_research/resr-equ-001-resultado-del-envio-de-correo.md) distingue aceptación del mensaje y entrega al buzón.
- [Mailpit — Docker](https://mailpit.axllent.org/docs/install/docker/) documenta una imagen oficial para Compose con UI en 8025 y SMTP en 1025; [Mailpit — API](https://mailpit.axllent.org/docs/api-v1/) permite inspeccionar mensajes capturados. Es suficiente para la demo local y evita cuentas de proveedor. Su buzón es deliberadamente visible a quien tenga acceso al entorno local: se usarán direcciones de prueba y no se expondrá como servicio público.
- [Symfony Mailer](https://symfony.com/doc/current/mailer.html) admite SMTP mediante DSN y envío directo. Dentro del procesador se usará el transporte síncrono, sin el enrutamiento asíncrono por defecto de Messenger, para que la terminación del adaptador sea observable y el evento propio controle el único intento.
- El contenedor API actual dispone de `ext-sodium`; permite cifrar temporalmente dirección y token del enlace con una clave de entorno separada de la base de datos. No se guarda el valor del enlace en almacenamiento local del navegador, conforme a [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).

## Design / Structure — aprobado N3

1. **Creación y evento atómicos.** `POST /api/teams` acepta `email` opcional. La aplicación valida formato y longitud; sin correo conserva el contrato de creación. Con correo, genera un recibo opaco independiente del token de acceso, cifra dirección y token con una clave de entorno propia, requerida y no incluida en el repositorio, y persiste equipo, participante y evento en una transacción Doctrine. La respuesta `201` devuelve el equipo y `mailAttempt: { status: "pending", receipt: "..." }` solo en ese caso. No espera a SMTP. Un fallo al registrar el evento revierte la transacción y la creación se muestra como fallida; un fallo posterior de SMTP nunca deshace el equipo.
2. **Un intento y limpieza.** Un proceso local separado, ejecutado como servicio de Compose, busca eventos pendientes, los reclama exclusivamente mediante bloqueo de filas y confirma `started` antes de llamar al adaptador SMTP. No vuelve a reclamar un evento iniciado. El transporte ejecuta una sola llamada y desactiva cualquier reintento automático. El resultado es `succeeded` solo ante finalización confirmada del transporte; rechazo, timeout o respuesta incierta son `failed`. Dirección y token cifrados pasan a `NULL` al finalizar, sin quedar en logs, errores ni resultados. El procesador también cierra como `failed` los pendientes o iniciados que superen su plazo máximo; no llama al proveedor en esa limpieza. El plazo global inicial aprobado es 30 minutos, configurable para operación/pruebas; el timeout del adaptador debe ser menor. Las carreras entre trabajador y limpieza se resuelven con estado y actualización condicionada. Se prueban caída antes de reclamar, caída tras reclamar, dos trabajadores y evento vencido.
3. **Resultado privado.** Un endpoint de solo estado, identificado por el recibo aleatorio de 32 bytes presentado en cabecera y verificado mediante su resumen, devuelve `pending | succeeded | failed`, sin dirección, enlace ni datos del equipo; responde `Cache-Control: no-store`. El recibo no se pone en ruta, query ni logs y no es el token Bearer del equipo. WEB lo recuerda por equipo en este navegador, consulta el resultado en confirmación y panel, y persiste solo el descarte del aviso asociado al recibo. Si el correo falla, muestra el aviso del prototipo aprobado con enlace y acciones de copia/compartición; el aviso reaparece al volver hasta descartarlo. Un navegador que solo recibe el enlace carece del recibo y no conoce ese resultado.
4. **Correo reutilizable.** El adaptador compone un mensaje MIME con HTML ligero y alternativa de texto. La plantilla común define fondo claro, superficie blanca, tipografía segura, azul/índigo de Synqo, CTA legible y enlace completo visible; el contenido específico inserta nombre del equipo y URL escapados. La [propuesta visual de correo](../../04_experiencia-usuario/06_mockups/prototipo-correo-enlace-equipo.html) muestra esta composición con datos ilustrativos aprobada en el gate N3. No requiere recursos externos ni incorpora otras comunicaciones en esta SPEC. Se comprobarán cliente de correo con imágenes desactivadas, URL larga, texto plano, anchura móvil y contraste. La confirmación del envío significa aceptación por SMTP/Mailpit, nunca entrega al buzón.
5. **Límites y operación.** `apps/api` aloja caso de uso, entidad Doctrine/migración, repositorio, adaptador Symfony Mailer, plantilla y comando de proceso; `apps/web` aloja estado del intento y aviso. `compose.yaml` añade Mailpit y el procesador. Se fijará una versión estable comprobada de la imagen durante apply. Mailpit guarda copias de los mensajes solo para inspección local; el correo de desarrollo no empleará destinatarios reales. La limpieza de equipos caducados también elimina sus resultados de intento. Los contratos JSON, errores Problem Details y OpenAPI se actualizan en la implementación.

**Presentación y prototipo:** la disposición de los campos, los temas, la confirmación, el aviso y las acciones siguen [MOCKUP-EQU-001 — Arranque directo de un equipo](../../04_experiencia-usuario/06_mockups/mockup-equ-001-arranque-equipo.md) y el prototipo enlazado allí. Su texto actual sobre que la demo descarta la dirección corresponde al alcance anterior y deberá sustituirse por la explicación de uso limitado aprobada en [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md). El diseño nuevo del propio correo quedó aprobado en el gate N3 de esta SPEC.

## Plan por slices

1. **Persistencia y contrato API:** migración de evento/resultado, creación atómica, validación del correo, recibo privado y OpenAPI; probar ausencia de correo, entrada inválida y rollback.
2. **Procesador y mensaje:** reclamación exclusiva, un intento, expiración/limpieza, cifrado temporal, Mailer SMTP y plantilla MIME reutilizable; cubrir carreras e interrupciones con PostgreSQL y adaptador falso.
3. **Entorno local e inspección:** integrar Mailpit y procesador en Compose, probar envío hacia el buzón de desarrollo y la lectura del HTML/texto vía UI/API, documentar arranque y parada.
4. **WEB y UX:** adaptar campo y textos al prototipo, gestionar recibo por navegador, consulta de estado y aviso persistente/descartable en confirmación y equipo; E2E de éxito, fallo inmediato/tardío y segundo navegador.
5. **Integración:** pruebas API/WEB/E2E, lint, análisis estático, formato, build, migraciones, seguridad del enlace y limpieza; comparación visual de WEB y mensaje, revisión independiente y matriz de criterios.

## Evidencia / Validation

Preparación documental, sin implementación. La persona impulsora aprobó expresamente el 2026-10-06 la ampliación de entrega, [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md) y el diseño N3 de esta SPEC, incluida la [propuesta visual de correo](../../04_experiencia-usuario/06_mockups/prototipo-correo-enlace-equipo.html), el plazo inicial de 30 minutos, el recibo privado y la protección/limpieza temporal. Questions, Research, Design, Structure y Plan están completos. `python3 pdi/scripts/validate_structure.py` terminó `VALIDATION OK` y `git diff --check` pasó; el chequeo focal de baseline no encontró contradicción vigente en el alcance actual. **DoR: READY_FOR_CHANGE_APPLY.** El correo sigue sin implementarse y [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) lo registra como `PLANIFICADO`.

## Apply (2026-10-06)

Slices 1–5 implementadas sin commitear. Checks: `composer test` (58 tests, incluidos rollback, reclamación con `SKIP LOCKED`, dos procesos, caída tras reclamar, expiración y limpieza), `cs:check`, `stan`, `rector:check` y `doctrine:schema:validate` OK; web `test` (9), `lint`, `format:check`, `build` y E2E completo (40 pasan, 1 omitido) OK. Comprobado en vivo: mensaje HTML+texto en Mailpit con nombre y enlace correctos, y fallo SMTP real (Mailpit parado) cerrado como `failed` sin reintento ni dirección residual. Revisión independiente: sin BLOCKER/MAJOR; corregidos sondeo zombi, 401 terminal y cierre oportunista de vencidos al consultar el estado.

Pendiente para `pdi:change-verify`: comparación visual humana de WEB y correo (la captura de pantalla de Chromium agota el tiempo en este entorno; solo se comprobó que el mensaje no desborda a 390 px) y cliente de correo con imágenes desactivadas. Decisiones menores a convergir: `succeeded` puede pasar a `failed` si el cierre por plazo gana la carrera a un envío ya aceptado (coherente con «respuesta incierta = error»); `MAIL_EVENT_KEY` se aporta por entorno/`.env` raíz no versionado.

## Verification (2026-10-06)

Checks repetidos desde cero: `db:reset:test` + `composer test` (58 tests, 520 aserciones), `cs:check`, `stan`, `rector:check`, `schema:validate`; web `test` (9), `lint`, `format:check`, `build` sin avisos, E2E 40 OK/1 omitido; `validate_structure.py` y `git diff --check` OK; OpenAPI exportado incluye `/api/mail-attempts/current` y `mailAttempt` opcional. Formato visual del correo validado por la persona usuaria (PASS).

| Criterio | Evidencia | Resultado |
|---|---|---|
| RF-006.1 Campo opcional, vacío no impide crear | `testCreationWithoutEmailCreatesNoEventAndNoAttempt` | PASS |
| RF-006.2 Uso limitado a enviar el enlace | Solo `MailAttemptProcessor` lee el payload; E2E y unit de WEB | PASS |
| RF-006.3 Éxito solo si el transporte confirma | Procesador: excepción o caída ⇒ `failed`; `testFailureTimeoutAndUncertainResult…`, fallo SMTP real con Mailpit parado | PASS |
| RF-006.4 Fallo: equipo creado, enlace y aviso | E2E `shows a failed attempt with the link…` | PASS |
| RF-006.5 Fallo tardío visible al volver hasta descartar | E2E `failure that becomes known after leaving…`, descarte persistido (unit + E2E) | PASS |
| RF-006.6 Resultado por confirmación, sin seguir rebotes | Texto «se ha enviado», sin afirmar entrega; sin seguimiento | PASS |
| RF-006.7 Sin reintentos | `testSuccessful…SendsOnce`, `testFailure…WithoutRetry`, `testTwoWorkersSendEachEventExactlyOnce`, `testCrashAfterClaim…` | PASS |
| RF-006.8 Texto de uso limitado junto al campo | `create-page.ts` (`#email-help`) | PASS |
| RF-006.9 Enlace con las reglas de cualquier enlace | El token es el mismo de `accessUrl`; `TeamApiTest` | PASS |
| SPEC.1 Mensaje en Mailpit con nombre y enlace; sin dirección, sin mensaje ni evento | E2E `sends the link to Mailpit once…`, prueba en vivo, test sin email | PASS |
| SPEC.2 HTML + texto, enlace visible, sin imágenes externas, móvil/escritorio | `testMessageHasHtmlAndText…`; sin desborde a 390 px; formato validado por la persona usuaria. Cliente con imágenes desactivadas no probado en cliente real (el HTML no usa imágenes) | PASS |
| SPEC.3 Sin dirección ni token tras éxito/fallo/expiración; recibo privado; un intento; RD-EQU-005 | `assertClosed`, CHECK de migración, `testOverduePending…`, `testExpiryRacing…`, `testStatusEndpointIsPrivate…`, `testDeletingATeam…` | PASS |

Seguridad/migración: payload cifrado (libsodium), recibo en cabecera y solo su SHA-256 en BD, `no-store`; migración aplicada y `schema:validate` en sincronía; limpieza por cascada verificada. Observaciones para converge: `succeeded` puede pasar a `failed` si el plazo cierra antes que un envío ya aceptado; `MAIL_EVENT_KEY` externa al repositorio; la entrega REL-001 sigue marcada `PLANIFICADO` y debe pasar a implementada en cierre.

## Convergence (2026-10-06)

Comparación de baseline, SPEC, ADR-EQU-002, código y tests: **sin drift entre el comportamiento implementado y los requisitos, ADR y contratos de la SPEC**. Quedan estos puntos, ninguno aprobado por defecto:

| # | Discrepancia | Clase | Resolución propuesta | Estado |
|---|---|---|---|---|
| 1 | [MOCKUP-EQU-001 — Arranque directo de un equipo](../../04_experiencia-usuario/06_mockups/mockup-equ-001-arranque-equipo.md) y su `prototipo-arranque-equipo.html` conservan el texto histórico «Demo local: todavía no se enviará ningún correo…» y «No se ha enviado ningún correo»; la SPEC ya exige sustituirlo. WEB usa «Solo se usará para enviarte el enlace de acceso al equipo.» | E (baseline desfasado) | `pdi:baseline-update` del mockup | **Resuelto** 2026-10-06 |
| 2 | [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md) («Casos límite») dice que el mecanismo y el momento del resultado «siguen sin resolver»; los resolvió ADR-EQU-002 | E | `pdi:baseline-update` | **Resuelto** 2026-10-06 |
| 3 | WEB muestra en la confirmación dos textos sin representación aprobada en mockup: «Estamos enviando el enlace por correo. Puedes entrar al equipo sin esperar.» (pendiente) y «El correo con el enlace se ha enviado. Puede tardar unos minutos en llegar.» (aceptado) | C (información nueva) | Decisión de la persona impulsora: aprobar y registrar en el mockup, o cambiar el texto en código | **Resuelto:** textos aprobados tal cual por la persona impulsora el 2026-10-06 y registrados en el mockup |
| 4 | [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md) mantiene RF-EQU-006 `PLANIFICADO` y la SPEC como `READY_FOR_CHANGE_APPLY` | Delivery | Se actualiza en `pdi:change-close` | Previsto |
| 5 | Se aceptó que `succeeded` pueda cerrarse como `failed` si vence el plazo antes que un envío ya aceptado | A/B (coherente con ADR) | Sin cambio | Cerrado |

Sin drift significativo abierto; solo queda el punto 4, propio de `pdi:change-close`. **`READY_FOR_CHANGE_CLOSE`.**

## Resultado de cierre

**DONE — Change cerrado y archivado el 2026-10-06.** Los doce criterios (los nueve de [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md) y los tres propios) constan en `PASS` en «Verification»; el formato visual del correo y la WEB (formulario y aviso) los validó personalmente la persona impulsora. La convergencia resolvió el baseline desfasado de [MOCKUP-EQU-001 — Arranque directo de un equipo](../../04_experiencia-usuario/06_mockups/mockup-equ-001-arranque-equipo.md) y de RF-EQU-006, y aprobó los textos de confirmación el 2026-10-06; no dejó drift significativo abierto. [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md) queda `VALIDADO` en [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md). No se declara `ENTREGADO`: la auditoría WCAG y la integración en `main` con CI remoto no se han acreditado. Implementación en el commit `f5ba2e4`.
