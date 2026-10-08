---
id: SPEC-COO-006
nivel: N3
estado: ready
release: REL-002
---
# SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002

## Objetivo

Definir y preparar la infraestructura declarativa de Railway para alojar la preproducción pública de Synqo, junto con un procedimiento manual, revisable y repetible para aplicar cambios y desplegar. Completar también las instrucciones de instalación, arranque y operación cotidiana del entorno local.

## Scope

- Mantener la infraestructura Railway de REL-002 como código TypeScript en `.railway/railway.ts`, conforme a la decisión vigente.
- Definir los servicios, entornos, PostgreSQL, variables y conexiones que requiera la arquitectura existente, con separación entre valores no secretos versionables y secretos configurados fuera del repositorio.
- Preparar la ejecución programada del proceso de reinicio de datos de muestra definido por el Change de datos demo, sin duplicar su comportamiento funcional.
- Preparar, coordinado con el Change de rate limit, el proceso programado de purga de filas de origen expiradas mediante el contrato `app:creation-limits:purge` definido en SPEC-EQU-005.
- Documentar una secuencia manual y reproducible para revisar/aplicar un plan IaC y para desplegar la aplicación, sin triggers automáticos por cambios de código o infraestructura.
- Incluir una verificación previa a cada operación manual que pueda cambiar infraestructura o desplegar código: confirmar proyecto/entorno/servicio destino, commit y rama previstos, revisar el plan IaC cuando corresponda, validar las variables requeridas sin exponer secretos y revisar efectos sobre datos persistentes.
- Definir comprobaciones posteriores al despliegue, criterios para considerar el servicio operativo y un procedimiento proporcional para volver a una versión/configuración anterior, según las capacidades confirmadas de Railway.
- Evaluar recuperación de PostgreSQL y cualquier retención de copias respecto a los datos de equipo y el pool efímero de IP/dispositivo; no activar copias que retengan esos datos sin que su efecto y ventana consten en la decisión operativa.
- Completar en el README las instrucciones reproducibles de instalación, arranque, parada, logs, migraciones y servicios de desarrollo local, conservando los comandos y advertencias ya válidos.
- Registrar configuración y pasos operativos de correo externo únicamente si se encuentra y habilita una alternativa segura; su ausencia no bloqueará REL-002.

## Fuera de scope

- Implementar el contenido de los dos equipos de muestra, sus disponibilidades y consultas, el borrado/precarga funcional de esos datos, o el temporizador y sus presentaciones. Corresponde a los Changes funcionales de REL-002.
- Implementar el rate limit de creación por IP/dispositivo.
- Seleccionar licencia del código, auditar su procedencia o autorizar el envío de código fuente a Railway. La condición previa de licencia se valida con [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md); no se enviará ni desplegará código a Railway hasta que sus gates aplicables estén satisfechos.
- Habilitar despliegues automáticos, CI/CD de despliegue, promoción automática entre entornos o triggers por push.
- Publicar el entorno, crear o modificar recursos en una cuenta real de Railway, ni activar servicios o gasto. Esta SPEC prepara los artefactos y procedimientos; las operaciones reales requieren la intervención manual de la persona impulsora.
- Elegir coste por encima del plan Hobby, región, dominio propio o proveedor de correo sin evidencia y decisión explícita.
- Definir hosting de producción, alta disponibilidad o recuperación ante desastres propia de producción.

## Baseline relacionado

- [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
- [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../../05_investigacion-y-decisiones/01_research/resr-coo-003-railway-iac-preproduccion.md)
- [RESR-COO-004 — ¿Cómo reservar los derechos del software propio y desplegarlo en Railway?](../../05_investigacion-y-decisiones/01_research/resr-coo-004-licencia-propietaria-y-despliegue.md)
- [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md)
- [README — Instrucciones del repositorio Synqo](../../../README.md)
- [Operación — Despliegue](../../09_operacion/01_despliegue/README.md)
- [API — Arquitectura del módulo](../../06_arquitectura/03_modulos/API/README.md)
- [WEB — Arquitectura del módulo](../../06_arquitectura/03_modulos/WEB/README.md)

## Módulos afectados

- Infraestructura y operación de Railway, aún sin módulo de solución dedicado; no se creará un contrato de módulo nuevo sin que la preparación demuestre que hace falta.
- [API](../../06_arquitectura/03_modulos/API/README.md): empaquetado/ejecución, configuración de runtime, conexión PostgreSQL, migraciones y comando programado que acuerde el Change de datos demo.
- [WEB](../../06_arquitectura/03_modulos/WEB/README.md): build y servicio del artefacto estático junto a sus avisos de dependencias.
- [README — Instrucciones del repositorio Synqo](../../../README.md): desarrollo local cotidiano y referencia a operación/despliegue.

## Criterios de aceptación

1. Los recursos de Railway del entorno REL-002 están descritos en `.railway/railway.ts`; la configuración no introduce los archivos heredados `railway.toml` o `railway.json` como mecanismo nuevo de Config as Code.
2. La definición separa explícitamente preproducción de cualquier entorno distinto y describe los servicios, persistencia, variables y dependencias necesarios para iniciar WEB y API según [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md).
3. No hay credenciales, tokens ni secretos reales en los archivos versionados, imágenes, logs de validación o instrucciones. Las variables necesarias y el lugar/procedimiento para configurarlas se documentan sin publicar sus valores.
4. La ejecución horaria en Railway invoca `app:demo:reset` del Change funcional de carga definido en [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../99_archivadas/spec-equ-004-juego-demo-reset-horario.md), conforme al alcance de preproducción de [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](spec-equ-006-juego-demo-preproduccion.md). Esta SPEC solo define el recurso y su configuración operativa; no duplica ni cambia el comportamiento de datos/reset. El schedule es `0 * * * *` UTC y solo se activa después del despliegue y la verificación inicial.
5. El procedimiento de IaC muestra cómo obtener y revisar el plan antes de aplicarlo. Una diferencia inesperada en recursos persistentes o datos detiene la operación hasta aclarar su efecto.
6. El servicio GitHub tiene autodeploy desactivado. Cada publicación de código se inicia en el panel Railway con “Deploy Latest Commit” sobre la rama por defecto revisada por la persona impulsora. No existen triggers por push/merge ni promoción automática. El flujo de publicación no usa railway up.
7. Railway CLI se limita a la infraestructura como código: railway config plan y, tras inspeccionar el diff y confirmar destino, railway config apply de forma interactiva. No se incluyen workflows CI que planifiquen/apliquen IaC ni tokens Railway en GitHub Actions.
8. Antes de cada config apply o publicación manual, el procedimiento verifica explícitamente cuenta/workspace, proyecto, environment y servicios destino; commit y rama previstos; plan o versión seleccionada; cambios de persistencia; variables necesarias sin imprimir valores; preflight de salud; y que el gate de licencia de [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md) autoriza ya el envío. La conexión inicial de GitHub se ensaya/inspecciona para evitar que cree o inicie un deploy antes de poder confirmar autodeploy desactivado. No se sube el código fuente antes de ese gate.
9. El procedimiento manual registra pasos y comandos reales para autenticar/vincular el CLI, revisar/aplicar IaC y usar el panel para publicación; la interfaz y la secuencia se verifican con documentación vigente. La selección de rama/commit no se da por probada solo por inferencia.
10. Hay comprobaciones posteriores observables de WEB, rutas API desde el origen público, conexión/persistencia PostgreSQL, migraciones, cron y logs relevantes; los resultados esperados y el criterio para detener/recuperar una operación están escritos.
11. Se documenta cómo volver desde el panel a una versión estable dentro de la retención vigente. El rollback de imagen/configuración no se presenta como rollback de esquema o datos; cualquier restauración de base requiere su propio preflight y límites conocidos.
12. El README permite a una persona con un clon nuevo instalar las dependencias y levantar, detener y diagnosticar la aplicación local, API, WEB, PostgreSQL y servicios de correo de desarrollo; advierte qué comandos borran datos.
13. El envío real de correo queda configurado y verificado solo si se dispone de una alternativa segura y credenciales; si no, se registra la omisión sin bloquear la aceptación de esta SPEC ni de REL-002.
14. La revisión documenta el consumo medido/estimado frente al plan elegido, Free primero y Hobby solo si hace falta, y mantiene el gasto total mensual bajo 5 USD mediante el hard limit disponible. Si se alcanza el tope, se acepta que Railway interrumpa los workloads; no se autoriza elevar el límite automáticamente.
15. La configuración operativa invoca `app:creation-limits:purge` desde [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md) cada cinco minutos UTC (`*/5 * * * *`); la implementación debe satisfacer ese contrato y cerrar recursos antes de terminar.
16. Se intenta habilitar una copia PostgreSQL diaria solo si el coste total estimado y observado, incluido su almacenamiento incremental, cabe dentro del tope mensual de 5 USD. Si no cabe o no se puede verificar, las copias programadas quedan desactivadas durante el piloto. Se documentan los seis días de retención diaria y que restaurar una copia puede reintroducir filas expiradas del pool; la persona impulsora acepta esa limitación.

## Impacto baseline esperado

Sin cambio de intención normativa. Materializa la elección de Railway, IaC TypeScript y despliegue manual de [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md). La ejecución del reset y la demostración funcional se integran con su Change separado.

## Questions / Assumptions

- Aprobado: REL-002 se desplegará manualmente; no se habilita auto-deploy hasta nueva decisión de la persona impulsora.
- Aprobado: la preproducción es pública, pero el código fuente no se entregará al flujo real de Railway hasta superar el gate de licencia de [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md).
- Aprobado: los secretos quedan fuera del repositorio; la falta de credenciales de correo no bloquea la entrega si no existe alternativa segura.
- Decisión humana aprobada (2026-10-07): intentar usar Free; si no resulta suficiente, Hobby con coste total máximo de 5 USD/mes. No se autorizan cargos por encima de ese máximo; configurar el límite de gasto disponible para que corte workloads al alcanzarlo y aceptar la interrupción del piloto. Los snapshots diarios solo se habilitan si caben bajo el mismo tope.
- Decisión humana (2026-10-07): se autoriza preparar la decisión de runtime/topología con un servicio combinado WEB/API como candidata inicial, comparada con WEB/API separados, antes de fijar la arquitectura. Esto aprueba la evaluación, no selecciona ni aprueba todavía una topología.
- Recomendación técnica preliminar: usar la región EU West (Amsterdam), única región europea que muestra la documentación oficial consultada, por proximidad a la persona impulsora en España y para mantener los datos en la UE. No se crea la infraestructura en esta fase; se confirma su disponibilidad al preparar la cuenta y no se cambia a otra región sin decisión.
- No se necesita dominio propio para el piloto: se propone usar el dominio Railway generado y no registrar un dominio externo en el scope actual.
- Decisión aprobada (2026-10-07): el servicio HTTP de REL-002 combina Angular y Symfony con FrankenPHP/Caddy, conserva mismo origen y rutas relativas `/api`, según [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md). La selección no implica que las cabeceras reenviadas de IP sean confiables; esa señal se configura y prueba por separado.
- El comando `app:demo:reset` y su contrato funcional pertenecen a SPEC-EQU-004; el schedule, guards de preproducción y activación después del despliegue pertenecen a SPEC-EQU-006. La estrategia de migración y el mecanismo exacto de rollback deben confirmarse al diseñar el runtime.

### Decisiones registradas y puntos abiertos

- **Servidor HTTP y empaquetado WEB/API — decisión resuelta.** El servicio combinado FrankenPHP/Caddy está aprobado y registrado en [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md). El Change concretará la imagen multietapa, Angular con fallback SPA, Symfony bajo `/api`, manejo de errores para que rutas API desconocidas no devuelvan `index.html`, `PORT`, healthcheck y dependencias. No se habilita worker mode inicialmente. Cron y otros procesos no HTTP ejecutan comandos separados con la misma imagen. La cadena de proxy para IP cliente se validará aparte; hasta entonces la IP se considera no disponible y el control usa la clave first-party disponible.
- **Coste y tope mensual — resuelto (2026-10-07):** intentar Free; si hace falta, Hobby, con máximo total de 5 USD al mes. No se acepta gasto superior; configurar el hard limit disponible y aceptar que alcanzar el tope interrumpa los workloads. Si las necesidades no caben, reducir recursos o detener el piloto, sin elevar automáticamente el límite.
- **Copias PostgreSQL — resuelto (2026-10-07):** probar una copia diaria únicamente si el coste total, incluido el almacenamiento incremental facturable, queda dentro del límite mensual de 5 USD; de lo contrario, desactivar los backups programados. Railway conserva las copias diarias seis días. Se acepta que una restauración pueda reintroducir filas del pool ya expiradas; si la copia no cabe bajo el tope, se acepta la recuperación más limitada sin copias.
- **Contrato de jobs — convergido técnicamente:** `app:demo:reset` pertenece a SPEC-EQU-004 y puede invocarse a demanda con guard local; su invocación horaria en Railway, guard de preproducción y activación posterior al despliegue pertenecen a SPEC-EQU-006. `app:creation-limits:purge` cada cinco minutos UTC, seguro para cualquier entorno con el límite habilitado, pertenece a SPEC-EQU-005. Railway ejecuta los jobs en procesos separados con la imagen de aplicación. El reset programado nunca se activa antes del despliegue y su verificación inicial; la purga elimina solo filas vencidas y la creación también hace purga oportunista. Los procesos cierran recursos y devuelven código no cero ante error operativo. Railway puede omitir una ejecución si la anterior sigue activa. Los timeouts se definen tras medir.
- **Clasificación/primer contacto de fuente GitHub — pendiente de respuesta:** ninguna conexión, transferencia o primer build queda autorizado hasta resolver la pregunta de SPEC-COO-005 y confirmar que se puede impedir autodeploy al enlazar el repositorio. La documentación disponible explica categorías de envío, pero no verifica qué categoría se aplicaría a este source sin enviarlo. La conexión debe verificarse manualmente antes de realizarla; no se presupone que el toggle de autodeploy se pueda cambiar antes del primer build.

## Research necesario

- Implementar localmente y comprobar el empaquetado combinado, ambos comandos Cron y sus guards antes de proponer IaC listo para revisar.
- Verificar región/plan que aparecen disponibles en la cuenta real, consumo y hard limit antes de habilitar recursos persistentes; comprobar que la copia diaria, si se activa, cabe bajo el máximo mensual de 5 USD.
- Confirmar desde la documentación/interfaz vigente si puede conectarse GitHub sin iniciar un build; no conectar la fuente durante esta preparación.
- Ensayar las instrucciones locales desde un clon limpio o estado equivalente, incluyendo advertencias de persistencia y comandos destructivos.

### Hallazgos de investigación (2026-10-07)

- **Topología local actual:** `compose.yaml` define PostgreSQL, API, worker persistente de correo y Mailpit; API y worker usan `apps/api/Dockerfile` con bind mount local. El Dockerfile parte de `php:8.5-cli-bookworm`, instala extensiones, Composer binary y expone 8000, pero no copia el proyecto, no instala dependencias ni declara `CMD`. Compose instala Composer en el contenedor interactivo y corre el servidor PHP integrado solo para el flujo local.
- **WEB:** Angular produce una SPA estática; `apps/web/package.json` ofrece `ng build`, pero no tiene `start` de producción; `start` es `ng serve --proxy-config proxy.conf.json` y ese proxy apunta a `localhost:8000`. El cliente usa rutas relativas `/api/...`; no hay base URL runtime configurable ni configuración CORS documentada en API. `apps/web/angular.json` genera el build en `dist/web/browser`. Se debe diseñar serving y route `/api` antes de cerrar estructura.
- **Servidor PHP:** el manual oficial de PHP advierte que el Built-in Web Server es para desarrollo/pruebas y no debe exponerse en una red pública: [PHP — Built-in web server](https://www.php.net/commandline.webserver). La guía oficial de Railway despliega Symfony con Railpack, Nginx y `RAILPACK_PHP_ROOT_DIR=/app/public`: [Railway — Deploy a Symfony App](https://docs.railway.com/guides/symfony). FrankenPHP documenta integración con Symfony y worker mode, opción alternativa de servidor, sin que esta investigación haya validado el proyecto bajo worker mode: [FrankenPHP — Symfony](https://frankenphp.dev/docs/symfony/). La guía Symfony describe instalación de vendors `composer install --no-dev --optimize-autoloader`, caché prod y migraciones como tareas de despliegue: [Symfony — Deployment](https://symfony.com/doc/current/deployment.html).
- **Plan Free/Hobby vigente:** al consultar [Railway — Pricing](https://docs.railway.com/pricing) y [Pricing Plans](https://docs.railway.com/pricing/plans), Free figura como $0/mes con $1 de crédito de recursos mensual, límites por servicio de 0.5 GB RAM, 1 vCPU, 1 réplica y volumen 0.5 GB. Hobby cuesta $5/mes e incluye $5 de uso de recursos, con límites máximos mayores (6 réplicas, 48 GB RAM/48 vCPU agregado y volumen máximo 5 GB por servicio indicado en la tabla). El uso que supera el crédito se cobra como diferencia; el coste real no puede inferirse sin ejecutar la topología y medirla. [Cost Control](https://docs.railway.com/pricing/cost-control) permite hard limit de compute que deja workloads offline cuando se alcanza. Free probablemente no sostendrá una carga pública continua dentro del crédito, pero aún no hay estimación medible por ausencia de recurso real; se inicia Free como aprobado y solo se recomendará Hobby tras presentar su límite de cobro.
- **Region/domain:** las regiones actuales documentadas incluyen EU West, Amsterdam (`europe-west4-drams3a`); los volúmenes se quedan en la región del servicio y cambiar región puede requerir migración/con downtime. Railway genera domain `.up.railway.app`; un custom domain es opcional. Fuente: [Railway — Regions](https://docs.railway.com/deployments/regions) y [Railway — Domains](https://docs.railway.com/networking/domains/railway-domains).
- **IaC:** Railway TypeScript IaC reconoce source GitHub y servicios Postgres, y `railway config plan` es read-only, redacts valores, mientras `config apply` crea un plan actual y requiere confirmación interactiva; los cambios destructivos son marcados. Fuente: [Railway — IaC](https://docs.railway.com/infrastructure-as-code) y [IaC Reference](https://docs.railway.com/infrastructure-as-code/reference). En el repo solo existe `.github/workflows/web.yml`, orientado a tests/build; no existe workflow Railway. Se excluyen workflows de apply/CI como decisión vigente.
- **Despliegue:** la integración GitHub auto-despliega commits por defecto; se puede desactivar en la configuración y desplegar manualmente el último commit desde Command Palette → “Deploy Latest Commit”: [Railway — Controlling GitHub Autodeploys](https://docs.railway.com/deployments/github-autodeploys). `railway up` carga el directorio local y provoca build/deploy, así que no se incluye en el runbook. La primera conexión de repositorio debe verificar que no despliega por sí misma antes de poder confirmar el toggle.
- **Cron:** Railway evalúa los schedules en UTC, exige intervalos mínimos de cinco minutos, puede ejecutar con retraso de minutos y omite la ejecución siguiente si la anterior sigue activa; el proceso debe terminar y cerrar conexiones. `0 * * * *` satisface la periodicidad horaria: [Railway — Cron Jobs](https://docs.railway.com/cron-jobs). Es compatible con la omisión aceptada por el piloto.
- **Rollback:** el panel puede restaurar un deployment previo, incluyendo su imagen y variables, mientras la imagen siga en retención. Eso no revierte el estado de PostgreSQL ni una migración: [Railway — Deployment Actions](https://docs.railway.com/deployments/deployment-actions). Retención de imagen: Free 24 horas y Hobby 72 horas según [Pricing Plans](https://docs.railway.com/pricing/plans).
- **Copias DB y precio:** Railway ofrece snapshots opcionales; la programación diaria conserva seis días. No hay tarifa fija separada por backup: el tamaño incremental se factura al precio de almacenamiento del volumen (referencia consultada: 0,15 USD/GB/mes), por lo que no puede afirmarse que sean gratuitas; solo se habilitarán si el coste total sigue bajo el tope mensual de 5 USD. Una restauración puede reintroducir filas expiradas del pool, riesgo aceptado por la persona impulsora. Fuentes: [Railway — Backups](https://docs.railway.com/volumes/backups), [Railway — Volumes](https://docs.railway.com/volumes/reference) y [Railway — Cost Control](https://docs.railway.com/pricing/cost-control).
- **Desarrollo local:** el README ya documenta versiones y pasos de instalación, Docker Compose, migraciones, WEB, correo Mailpit, comandos comunes, logs y comandos destructivos. La preparación deberá validar desde un clon limpio y corregir solo faltantes/inconsistencias, no duplicar instrucciones innecesariamente.

## Design / Structure

El diseño de preparación está definido; cada detalle de imagen, routing y comandos se implementará y probará por slices, conforme a [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md). Estructura prevista: servicio HTTP combinado FrankenPHP/Caddy, PostgreSQL privado, Cron de reset (contrato de presentación/activación en SPEC-EQU-006) y Cron `*/5 * * * *` UTC que invoca `app:creation-limits:purge`; worker de correo solo si se habilita una alternativa segura. Los procesos Cron/worker usan la misma imagen con comandos distintos, nunca corren dentro del servidor HTTP. Los servicios acceden a PostgreSQL por red privada y referencia a `DATABASE_URL`; correo y `APP_SECRET` se configuran fuera del repositorio. Los contratos de purga/reset están repartidos entre SPEC-EQU-004/005/006. La preparación estableció un gate de fuente/licencia antes del primer deploy; el estado real posterior queda registrado en Evidencia y Convergence, sin considerar que la publicación observada haya resuelto ese gate.

Flujo de operación aprobado: IaC se inspecciona con CLI config plan y se aplica con config apply y confirmación interactiva; el código se publica manualmente desde el panel con auto-deploy apagado y después del preflight. No se usa `railway up`. El gate de clasificación/licencia en [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md) continúa sin evidencia de resolución, aunque el despliegue público ya existe; reconciliar el hecho con la decisión antes de declarar el criterio satisfecho.

**Clasificación N3:** crea infraestructura pública y recursos persistentes, integra secretos y un job con borrado periódico. Un error puede causar exposición de configuración o pérdida de datos; requiere diseño operativo y verificación antes de activar recursos reales.

## Plan por slices

1. **PASS local — Runtime combinado:** imagen FrankenPHP/Caddy multietapa y routing same-origin probados localmente con WEB, `/api`, `PORT`, healthcheck y fallback SPA, sin enviar código a Railway.
2. **PASS en configuración; runtime pendiente — Coordinación de procesos:** IaC declara los dos Cron con sus comandos/schedules solo por opt-in. El horario de reset permanece desactivado hasta que el servicio esté desplegado y verificado según SPEC-EQU-006.
3. **PASS local — IaC:** proyecto/entorno, PostgreSQL, variables y referencias se modelan localmente; tests y typecheck no contactan Railway. No se ejecutó un plan remoto.
4. **PASS — Operación/documentación:** README, pasos manuales, preflight, postflight, recuperación y ejecución local quedan escritos en los artefactos afectados.
5. **PASS local; gate remoto pendiente:** checks IaC, imagen y documentación pasan. Plan real, conexión GitHub y primer deploy siguen bloqueados por licencia, source y límite de gasto; requieren acción manual de la persona impulsora.

## Evidencia / Validation

Preparación documental e investigación oficial realizadas el 2026-10-07. La decisión humana de servicio combinado se registra en [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md); la comparación y sus límites están en [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../../05_investigacion-y-decisiones/01_research/resr-coo-003-railway-iac-preproduccion.md).

### Implementación local (2026-10-07)

- `.railway/railway.ts` define únicamente el entorno `preproduction`, PostgreSQL 18 y el HTTP combinado. No declara fuente GitHub. Los Cron quedan fuera del grafo por defecto y solo se añaden con `SYNQO_ENABLE_PREPRODUCTION_CRONS=1`.
- `Dockerfile.railway`, `.dockerignore` y `apps/api/Caddyfile.railway` construyen una imagen de producción multietapa; enrutan la API bajo `/api`, la SPA con fallback, y publican `/healthz` y avisos legales. Se añadieron avisos del runtime FrankenPHP, Caddy y PHP.
- `scripts/railway-iac.test.mjs`, `scripts/smoke-railway-image.sh` y el job existente de CI comprueban localmente el grafo, tipos TypeScript, construcción y arranque de la imagen con PostgreSQL efímero.
- README y guías de API/WEB se actualizaron para las instrucciones cotidianas y el runtime combinado. El procedimiento Railway está en [Operación manual de Railway para REL-002](../../09_operacion/01_despliegue/railway-rel-002.md).
- Verificaciones locales: `npm run railway:iac:check` (3 tests y TypeScript), `npm run railway:image:smoke` (migraciones, healthcheck, SPA, API, ruta desconocida y 8 avisos), `php vendor/bin/phpunit tests/ApiUnknownRouteTest.php` (1 test, 8 assertions), `python3 pdi/scripts/validate_structure.py` y `git diff --check`.
- Durante esta implementación local no se inició sesión, vinculó proyecto, conectó GitHub, ejecutó plan/apply, creó recursos, activó gasto ni transfirió la imagen.

### Verificación de preproducción publicada (2026-10-08)

La redirección incluida en `fbb926b` se observa en el servicio público, indicando que la imagen con ese cambio está activa; CI finalizó satisfactoriamente en [GitHub Actions, run 37786033685](https://github.com/franciscoferrandez/SynqoApp/actions/runs/37786033685). Se realizaron 17 peticiones GET de solo lectura, sin crear ni borrar datos:

| Comprobación | Resultado observado | Estado |
|---|---|---|
| `/healthz` y `/` | `200`; healthcheck `ok` y SPA Synqo | PASS |
| `/api/configuration` | `200`; correo desactivado, límite 2 equipos/60 minutos | PASS |
| `/api` y `/api/` | `308` a `/api/docs` | PASS |
| `/api/docs` y `/api/docs.jsonopenapi` | `200`; documentación y OpenAPI | PASS |
| `/api/no-such-route` | `404 application/problem+json`, sin fallback HTML | PASS |
| `/api/teams/current` con Bearer aleatorio inválido | `404` de equipo inexistente; recorrido de lectura llega a PostgreSQL sin error | PASS — conectividad de lectura |
| Ocho avisos/licencias públicos | Todos responden `200` con contenido | PASS |

La prueba pública no modifica estado. No se pudieron inspeccionar los logs de Railway ni confirmar allí el resultado de pre-deploy/migraciones, la persistencia de una mutación controlada, los servicios Cron, el límite de gasto, backups o rollback. El endpoint de salud tampoco comprueba PostgreSQL; la consulta API anterior aporta evidencia de lectura de DB, no de escritura/persistencia.

El despliegue público confirma transferencia de código a Railway, pero no aporta por sí mismo evidencia de que se haya satisfecho el gate documental de clasificación/licencia de source en [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md). Mantener ese punto como discrepancia pendiente de reconciliación; no convertir el despliegue en una aprobación de licencia.

## Convergence

**Verificación parcial; no listo para cierre.** La imagen local y el smoke público de HTTP/API están verificados. Existe un despliegue Railway real del commit `fbb926b`, pero no se han revisado el plan IaC aplicado, los límites de gasto/backups, los logs de migración, la operación Cron ni la evidencia del gate de source/licencia.

| Comprobación | Estado | Evidencia / gate |
|---|---|---|
| Objetivo, scope, AC y baseline enlazados | PASS | Alcance y 16 AC definidos; REL-002, ADR, research y SPEC relacionadas enlazadas. |
| Investigación de runtime, límites operativos y fuentes | PASS | Hallazgos oficiales incluidos con enlaces; estado local contrastado con Docker Compose, API, WEB y README. |
| Decisión de servidor HTTP y topología API/WEB | PASS local | Selección humana registrada en ADR-COO-005; imagen y rutas se probaron localmente. |
| Contrato de Cron para reset y purga | PASS local | IaC modela schedules opt-in y tests inspeccionan comandos/schedules; ejecución real corresponde a EQU-006 tras autorización/despliegue. |
| Límite mensual y reacción al alcanzarlo | BLOCKED — operación | El hard limit actual tiene mínimo documentado de 10 USD; no activar servicios con coste potencial bajo el máximo vigente de 5 USD. |
| Política de backup dentro del tope y retención | PASS | Copia diaria solo si cabe bajo 5 USD/mes; si no, desactivada. Se acepta que restaurar reintroduzca filas expiradas. |
| Gate de clasificación, conexión y envío del código fuente | CONFLICTO pendiente | El despliegue público prueba que el código llegó a Railway; la evidencia de clasificación/licencia sigue sin registrarse según SPEC-COO-005. La verificación técnica no concede autorización. |
| Recursos/proyecto real de Railway | PARTIAL | El servicio público responde con el commit `fbb926b`; IaC plan/apply, configuración del proyecto y límites de coste no se inspeccionaron. |
| Verificación de imagen e IaC local | PASS local | `railway:iac:check`, smoke Docker (incluida redirección `/api`), test de ruta desconocida, estructura PDI y diff check. CI de `fbb926b` pasa. |
| Verificación pública HTTP/API | PASS | 17 GET de solo lectura; health, SPA, configuración, OpenAPI, redirecciones, 404 Problem Details, lectura que alcanza DB y ocho avisos. |
| Migraciones/persistencia en Railway | PARTIAL | La lectura inválida de equipo no da error de DB; falta evidencia de logs/resultados de migración y una comprobación real de escritura/persistencia autorizada. |
| Cron de demo y purga en Railway | NOT_TESTED | No se comprobó activación, configuración ni ejecución real. Reset manual remoto corresponde a SPEC-EQU-006 y no se debe ejecutar con el comando local de SPEC-EQU-004. |
| Coste, hard limit, backups y rollback remotos | NOT_TESTED | No se inspeccionó la cuenta ni el panel Railway; se mantienen los límites documentados y sin aprobación adicional. |

La evidencia del despliegue real sustituye las afirmaciones anteriores de que no existían recursos ni deploy remoto, pero no sustituye los gates no comprobados. La validación pública GET queda completa para el alcance indicado; la SPEC global sigue parcial hasta verificar los criterios operativos pendientes y reconciliar la discrepancia de clasificación/licencia.

## Resultado de cierre

**Verificación parcial; quedan gates operativos pendientes:** evidencia de clasificación/licencia del source, plan/configuración/coste real de Railway, migración y escritura persistente, backups/rollback y ejecución de Cron. El correo externo continúa siendo omisión aceptada/no bloqueante.
