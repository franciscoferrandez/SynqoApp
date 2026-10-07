---
id: SPEC-EQU-005
nivel: N3
estado: ready
release: REL-002
---
# SPEC-EQU-005 — Limitar la creación de equipos por origen efímero

## Objetivo

Materializar para REL-002 el límite configurable de creación de equipos por IP y/o identificador first-party del navegador, conservando únicamente contadores temporales desvinculados de los equipos. La identificación de navegador es una señal básica y descartable, no una identidad persistente ni una garantía frente a abuso deliberado.

## Scope

- Aplicar el límite durante la creación de equipos y contabilizar únicamente creaciones satisfactorias.
- Obtener la IP de la petición y, en web, una clave aleatoria opaca first-party generada con un generador criptográfico del navegador; no emplear fingerprinting.
- Si hay una o ambas claves, comprobar cada clave disponible y rechazar si cualquiera alcanzó el máximo. Rechazar por seguridad cuando no se obtenga ninguna.
- Mantener contadores en un pool efímero independiente, sin relación con el equipo creado, y retirar las entradas al vencer su ventana sin que el reset de datos demo las elimine anticipadamente.
- Mostrar antes de crear los valores de límite y período configurados; al superar el límite, presentar el mensaje genérico fijado por el baseline.
- Hacer configurables por entorno el máximo y el período. Los valores iniciales vigentes constan en el requisito enlazado.

## Fuera de scope

- Autenticación o identificación persistente de personas, fingerprinting, geolocalización o prevención de abuso que supere el control básico de las claves disponibles.
- Cambiar la política de límites definida para cada entorno.
- El reset/carga local y la publicación/reset programado del juego demo, salvo asegurar que su proceso no borra entradas del pool; esos comportamientos están en [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](spec-equ-004-juego-demo-reset-horario.md) y [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](spec-equ-006-juego-demo-preproduccion.md).
- Soporte de una aplicación móvil nativa.

## Baseline relacionado

- [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md)
- [RF-EQU-009 — Limitar la creación de equipos por origen efímero](../../03_requisitos/01_funcionales/EQU/rf-equ-009-limitar-creacion-por-origen-efimero.md)
- [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](../../03_requisitos/01_funcionales/EQU/rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
- [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../../05_investigacion-y-decisiones/01_research/resr-coo-003-railway-iac-preproduccion.md)
- [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](spec-equ-004-juego-demo-reset-horario.md)
- [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](spec-equ-006-juego-demo-preproduccion.md)
- [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](spec-coo-006-railway-iac-operacion-rel-002.md)

## Módulos afectados

- API: obtención/validación de claves disponibles, aplicación atómica del límite, persistencia y depuración de contadores, configuración y respuesta de rechazo.
- WEB: creación y conservación first-party del identificador aleatorio opaco, presentación del límite configurado y del mensaje de rechazo.
- Operación: configuración por entorno y ejecución de la depuración de entradas vencidas. La coordinación con el reset demo se limita a preservar entradas todavía vigentes.

## Criterios de aceptación

1. Las pruebas de configuración verifican los valores iniciales de desarrollo y preproducción (2/60 minutos) y producción (5/120 minutos), y que máximo y período pueden configurarse independientemente por entorno.
2. Una prueba de creación satisfactoria demuestra que cada clave disponible consume su contador; los fallos y rechazos no consumen cupo.
3. Cuando IP y dispositivo están disponibles, alcanzar el máximo con cualquiera rechaza la creación; alcanzar el umbral con ninguna permite crear. Si solo se obtiene una, se evalúa esa clave. Si no se obtiene ninguna, la operación falla de forma segura.
4. En navegador compatible se genera y reutiliza un identificador first-party aleatorio opaco sin fingerprinting. Borrarlo hace que el control opere con las claves que sigan disponibles; no se presenta como identidad fuerte.
5. La persistencia de los contadores no permite vincularlos a un equipo, y la depuración elimina entradas vencidas sin eliminar entradas aún dentro de su ventana, incluidas durante un reset de datos demo.
6. Antes de enviar la creación, la vista informa el máximo y la duración aplicables al entorno. Un rechazo por límite muestra exactamente: «Has alcanzado el límite de creación de equipos. Inténtalo de nuevo más tarde.» sin revelar qué clave activó el límite.
7. Las pruebas de concurrencia demuestran que solicitudes simultáneas no exceden el máximo configurado para la misma clave.

## Impacto baseline esperado

Ningún cambio normativo: materializa [RF-EQU-009 — Limitar la creación de equipos por origen efímero](../../03_requisitos/01_funcionales/EQU/rf-equ-009-limitar-creacion-por-origen-efimero.md) y sus relaciones. Si la preparación revela que hace falta cambiar una regla, detener ese aspecto y tramitarlo mediante `pdi:baseline-update` antes de implementar.

## Questions / Assumptions

- La señal first-party del navegador puede perderse por borrado del almacenamiento o restricciones del cliente; no se asumirá identidad estable ni se intentará reconstruirla mediante fingerprinting.
- Solo se tratará como señal IP la dirección que el servidor obtenga directamente en una conexión no proxificada o mediante un proxy configurado y verificado como confiable. Una cabecera de cliente (`X-Forwarded-For`, `X-Real-IP` u otra) no se aceptará directamente. Si la topología no permite verificarla, la IP se considera no disponible y se evalúa la clave first-party; esto no impide el control en web si esa clave está disponible.
- La topología elegida para Railway publica WEB y API bajo el mismo origen con FrankenPHP/Caddy conforme a [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md); por tanto, la clave de navegador viaja same-origin sobre HTTPS sin CORS. Esta topología no vuelve confiables las cabeceras reenviadas por el edge. Solo se usa IP tras validar qué peer/cabeceras recibe Symfony y configurar explícitamente los proxies confiables; hasta entonces, IP se considera ausente y se aplica la clave first-party disponible. La validación de despliegue corresponde a [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](spec-coo-006-railway-iac-operacion-rel-002.md).
- El texto de rechazo es el mensaje genérico fijado en el baseline y no incluirá el tiempo restante ni información de IP/dispositivo.
- Si falla la generación o persistencia browser-side, WEB omite esa señal y la creación se evalúa con la IP fiable disponible; si no queda ninguna se rechaza por seguridad.

## Research necesario

- **IP/proxies:** Symfony documenta que `Request::getClientIp()` solo interpreta direcciones reenviadas cuando se configuran explícitamente proxies y cabeceras confiables; de otro modo puede devolver la IP del proxy o aceptar un modelo incompleto ([Symfony — Configurar proxies de confianza](https://symfony.com/doc/current/deployment/proxies.html)). La documentación oficial de Railway consultada describe el edge proxy y sus cabeceras de diagnóstico ([Railway — Edge Networking](https://docs.railway.com/networking/edge-networking)), pero no fija un contrato de IP reenviada confiable para esta aplicación. Por tanto la SPEC no presupone que Railway proporcione una IP de cliente autenticable; validar topología y headers con COO-006 antes de contarla.
- **Clave browser-side:** `crypto.getRandomValues()` produce bytes criptográficamente fuertes y está ampliamente disponible ([MDN — Crypto.getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)). Crear 32 bytes, codificarlos en Base64URL y conservarlos como dato first-party de origen permite una clave opaca sin fingerprinting. `localStorage` puede lanzar/estar deshabilitado: capturar ese fallo y no mandar clave; continuar con IP fiable. El identificador no se comparte con un equipo, no se usa para otra finalidad ni se presenta como identidad.
- **Representación en base:** usar HMAC-SHA-256 sobre la clave normalizada y un dominio distinto por tipo de señal, con `APP_SECRET` como secreto común a réplicas, permite comparar sin almacenar IP/token en claro. El token aleatorio de navegador tiene alta entropía; el keyed digest también evita que un hash simple de IP pueda enumerarse fuera de la base. Solo persistir el digest hexadecimal de 64 caracteres, tipo de origen y fecha de creación; no registrar valor original en logs. Si cambia el `APP_SECRET`, los contadores anteriores ya no serán comparables y el límite puede reiniciarse; documentar esto en operación. No añadir una clave secreta nueva si el secreto existente puede usarse con separación de dominio.
- **Concurrencia:** PostgreSQL provee advisory locks exclusivos por transacción (`pg_advisory_xact_lock`) que se liberan al commit/rollback ([PostgreSQL — Advisory Locks](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS)). Para este piloto de bajo volumen, un único lock transaccional de creación es más simple que resolver carrera de creación de la primera fila por señal: cada instancia adquiere el mismo lock, limpia/consulta límites y crea equipo + participante + filas del pool en una sola transacción. El lock global serializa temporalmente las creaciones, pero el máximo permitido es 5 por ventana y no se requiere throughput alto. Rollback por fallo de creación no consume cuota.
- **Caducidad:** Railway Cron usa UTC, mínimo cinco minutos entre ejecuciones y no garantiza inicio exacto; no lanza solapamientos de una ejecución todavía activa ([Railway — Cron Jobs](https://docs.railway.com/cron-jobs)). El baseline exige retirar filas obsoletas, pero no fija eliminación en el instante exacto de vencimiento. La estrategia seleccionada es dejar de contar una fila al alcanzar `created_at <= ahora - ventana`, borrar vencidas al comienzo de cada creación y ejecutar `app:creation-limits:purge` cada cinco minutos en Railway. El comando es idempotente, requiere configuración de límite/ventana válida, elimina solo filas vencidas y retorna error operativo si falla la conexión o la consulta. Si un Cron se retrasa, la elegibilidad del cupo no cambia porque el conteo ignora las filas vencidas. En desarrollo se dispone del mismo comando invocable localmente.
- **Código actual:** `/api/teams` pasa de `TeamController` a `TeamService::create()` y `OrmTeamRepository::create()`. El servicio valida antes de persistir, y el repositorio hace `flush()` para equipo, primer participante y correo transitorio; debe convertirse en una transacción que incluya la cuota, no en un incremento anterior independiente. `TeamRecord` no lleva una relación requerida para el pool y la tabla de participantes tiene cascada desde team; la nueva tabla debe quedar sin FK a `team`. La WEB envía a rutas relativas `/api/...`; desarrollo las proxy con `apps/web/proxy.conf.json`. En Railway, la decisión aprobada conserva estas rutas en un único origen conforme a [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md).
- No se modificó código ni se ejecutaron tests durante la preparación. Los comandos de validación disponibles son `cd apps/api && composer test` y `cd apps/web && npm test`; integración de API requiere PostgreSQL y reinicialización de test DB según `composer db:reset:test`.

## Design / Structure

- **API — contrato:** extender la creación `POST /api/teams` con un encabezado first-party para la clave opaca; declarar en OpenAPI una respuesta `429 application/problem+json` y un tipo de problema estable para el rechazo por límite, con el mensaje genérico del baseline. Añadir un recurso de lectura de política de creación (máximo y duración visibles, sin revelar IP/señales ni configuración privada) para que WEB informe antes de crear usando la configuración activa del backend.
- **API — cálculo y persistencia:** extraer `Request::getClientIp()` solo después de dejar proxies de confianza explícitos en configuración; si topología/IP no verificables, señal IP ausente. Normalizar IPv4/IPv6 mediante `inet_pton`; calcular digests HMAC-SHA-256 con `APP_SECRET` y prefijos separados (`ip:`/`device:`). En PostgreSQL usar tabla aislada de eventos (`signal_type`, `signal_digest`, `created_at`), índice compuesto y sin `team_id`/FK. Bajo advisory lock transaccional compartido: purgar eventos vencidos según ventana configurada, contar eventos por cada digest disponible, rechazar si cualquier contador es `>= máximo`; luego persistir team, participant, mail attempt y un evento para cada señal en una transacción común. Así solo se cuentan equipos creados satisfactoriamente; errores/rollback no consumen cuota. El lock global es proporcional al bajo volumen y evita hueco de sincronización cuando aún no existe fila.
- **API — configuración:** opciones `TEAM_CREATION_LIMIT` y `TEAM_CREATION_WINDOW_MINUTES`, independientes por entorno, con defaults requeridos por RF; parsear y validar valores positivos al arrancar para evitar una política silenciosamente inválida.
- **WEB:** en la primera creación, leer una sola clave de 32 bytes vía `crypto.getRandomValues`, codificar Base64URL y guardar en `localStorage` por origen. Capturar excepción de crypto/storage y continuar sin clave. Reutilizar el valor en `X-Creation-Device` solo para POST de creación y mantener su transmisión same-origin/HTTPS según [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md). Obtener del API máximo/período de cada entorno y presentarlos antes de submit. Ante el tipo estable 429 mostrar exactamente el texto acordado, sin `detail` con causa interna.
- **Operación / reset:** ejecutar limpieza al inicio de intentos y una purga programada separada cada cinco minutos en Railway. El comando `app:creation-limits:purge` es propiedad funcional de esta SPEC; COO-006 solo configura su Cron `*/5 * * * *` UTC. El reset local pertenece a SPEC-EQU-004 y el reset de preproducción a SPEC-EQU-006; ambos preservan la tabla del pool completa. La cadencia de purga implementa eliminación física eventual; el control lógico deja de contar filas vencidas exactamente al terminar su ventana.
- **Topología:** servicio HTTP combinado y rutas same-origin `/api` aprobados por [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md). La verificación de IP/proxy, cabecera confiable y URL HTTPS pública se coordina con [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](spec-coo-006-railway-iac-operacion-rel-002.md); hasta superar esa prueba la señal IP se trata como no disponible.

## Plan por slices

1. **S1 — Preparar contrato e integración Railway:** forma de respuesta 429 y política pública, `X-Creation-Device`, origen WEB/API, proxies fiables y contrato de `app:creation-limits:purge` con COO-006; describir configuración sin secretos.
2. **S2 — Control server-side:** añadir migración de tabla independiente, configuración validada, digest HMAC, límite atómico en transacción de creación, errores Problem Details y comando de purga.
3. **S3 — Integración de navegador y comunicación:** adquirir/guardar clave first-party con fallback, mostrar máximo/ventana leídos de API, mostrar mensaje 429 exacto.
4. **S4 — Verificación de integración:** probar límites por env, IP/device por separado y juntos, ausencia de claves, fallos/rollback, simultaneidad, caducidad/purga, configuración de proxies, privacidad del esquema/logs y no interferencia del reset demo.

## Evidencia / Validation

DoR comprobado con la plantilla global de PDI: objetivo, baseline, RF, criterios, preguntas bloqueantes (0), UX (mensajes y punto de presentación en RF), decisión de arquitectura local (PostgreSQL en transacción, dominio API, señal first-party WEB; sin componente externo), módulos afectados, estructura, plan proporcional N3 y evidencia están definidos. **DoR: READY.** Para validar al aplicar: `cd apps/api && composer test` con PostgreSQL y base test migrada; `cd apps/web && npm test`; añadir integración que lanza solicitudes concurrentes reales y verifica que no exceden cupo; exportar OpenAPI y probar comportamiento 429; verificar que SQL/logs no contienen claves originales; comprobar que reset demo conserva filas activas.

## Convergence

Requiere verificación de implementación conjunta con [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](spec-equ-004-juego-demo-reset-horario.md) y [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](spec-equ-006-juego-demo-preproduccion.md) para demostrar que ambos resets preservan la tabla independiente, y con [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](spec-coo-006-railway-iac-operacion-rel-002.md) para routing/IP confiable y ejecución del contrato `app:creation-limits:purge` cada cinco minutos. Queda la validación runtime.

## Resultado de cierre

Pendiente.
