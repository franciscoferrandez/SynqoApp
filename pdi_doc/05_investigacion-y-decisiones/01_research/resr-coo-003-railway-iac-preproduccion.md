---
id: RESR-COO-003
---
# RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?

## Objetivo

Comprobar si Railway cubre el objetivo expreso de desplegar Synqo en preproducción con recursos descritos como infraestructura como código, valores separados por entorno, base PostgreSQL, despliegues y tareas programadas.

## Hechos

- Railway documenta su IaC actual mediante `.railway/railway.ts`, con API TypeScript de disponibilidad general, y comandos CLI `railway config plan` y `railway config apply` para comparar y aplicar el estado declarado.
- El antiguo mecanismo `railway.json` / `railway.toml` llamado Config as Code está deprecado. La documentación indica que no se admite para servicios nuevos y fija el 2026-12-01 como fecha límite para servicios heredados.
- Los entornos persistentes de Railway aíslan sus servicios y variables de otros entornos; la propia documentación presenta `staging` como uso común.
- Railway proporciona PostgreSQL como servicio y publica `DATABASE_URL` y credenciales para conexión interna entre servicios.
- Railway Cron ejecuta el comando configurado y espera que finalice y cierre conexiones. El horario usa UTC, la frecuencia mínima es de cinco minutos y se omite una ejecución si la previa continúa activa.
- Railway documenta que la salida SMTP está disponible en planes Pro y superiores. En los planes Free, Trial y Hobby recomienda usar APIs HTTPS de proveedores transaccionales; la documentación enumera Resend, SendGrid, Mailgun y Postmark como ejemplos.
- Esa capacidad de red no incluye una cuenta de correo ni credenciales de envío. La aplicación seguiría necesitando credenciales de un proveedor externo y un remitente configurado/verificado; esto se infiere de la documentación de red y queda pendiente de confirmar al escoger proveedor y plan.
- La IaC de Railway admite modelar servicios, dependencias de variables, base de datos y comandos de predespliegue. Un comando de predespliegue fallido detiene el despliegue.
- El despliegue local actual usa Compose con PostgreSQL, API, trabajador persistente de correo y Mailpit; existe un comando Symfony `app:teams:cleanup` para eliminar equipos cuyo plazo de retención ha vencido. El frontend Angular vive en `apps/web`.
- Las copias de PostgreSQL son independientes del borrado en la base activa. La documentación de Railway describe copias de volumen y PITR, pero estas no aplican por sí solas el plazo de eliminación del producto a las copias recuperables.

## Evidencias

- [Railway — Infrastructure as Code Reference](https://docs.railway.com/infrastructure-as-code/reference)
- [Railway — Infrastructure as Code](https://docs.railway.com/infrastructure-as-code)
- [Railway — Config as Code (deprecation)](https://docs.railway.com/config-as-code)
- [Railway — Environments](https://docs.railway.com/environments)
- [Railway — PostgreSQL](https://docs.railway.com/databases/postgresql)
- [Railway — Cron Jobs](https://docs.railway.com/cron-jobs)
- [Railway — Outbound Networking: Email delivery](https://docs.railway.com/networking/outbound-networking)
- [Railway — Pre-deploy Command](https://docs.railway.com/deployments/pre-deploy-command)
- [Railway — Back Up and Restore Postgres](https://docs.railway.com/guides/postgres-backups-restores)

## Restricciones

- La elección explícita de Railway es para el entorno de preproducción; no decide el hosting de producción.
- No se deben guardar credenciales reales de Railway o del correo en el repositorio.
- La limpieza programada debe terminar dentro de su ventana de ejecución para que las ejecuciones posteriores no se omitan.
- El contenido de aplicación de la base de preproducción se limpiará y precargará con el juego de prueba cada hora; el formulario de creación mostrará un temporizador al siguiente reinicio.

## Unknowns

- Proveedor y dominio remitente para el envío de correo real, si se activa en preproducción. No se dispone actualmente de SMTP ni credenciales; si no se encuentra una alternativa segura, el envío real no será bloqueante para la entrega.
- Comandos y pasos exactos del procedimiento manual de despliegue y aplicación del plan de infraestructura.
- Coste y capacidad aceptables para el entorno.

## Assumptions

- Ninguna. Railway y la intención de mantener IaC en el repositorio son decisiones expresas de la persona impulsora. Los detalles listados como incógnitas no se consideran aprobados.

## Alternativas observadas

- Railway como plataforma gestionada con entornos, IaC, servicios y PostgreSQL.
- Render, candidato preliminar en la comparación histórica del piloto.
- VPS administrado por el proyecto.

## Topología de publicación WEB/API

La decisión de hosting Railway no determina si WEB y API se publican en uno o varios servicios. La inspección del código local muestra que WEB consume rutas relativas `/api/...`; en desarrollo Angular usa un proxy local hacia `localhost:8000`. El Dockerfile actual de API es una imagen PHP CLI para uso local, sin instalación del proyecto/Composer ni comando de servidor, por lo que no constituye una imagen pública lista para Railway.

| Opción | Encaje y costes operativos | Cambios/validaciones necesarias |
|---|---|---|
| **A. Servicio WEB + servicio API separados** | Conserva despliegues y responsabilidades independientes. El origen WEB tendría que llamar directamente al dominio API o se necesitaría un proxy adicional. Railway muestra un patrón de Symfony con Nginx y API como servicio independiente. No se puede afirmar que dos servicios vayan a costar más que uno: la factura depende del uso medido de recursos y debe verificarse bajo el límite acordado. | Construir/servir el artefacto Angular; configurar URL API por entorno y CORS para el origen WEB, incluidos los headers personalizados/preflight del identificador de dispositivo; configurar Symfony con proxies confiables basados en la cadena real y probar la IP vista. Revisar autodeploy manual de ambos servicios para mantener versiones compatibles. |
| **B. Un servicio HTTP combinado con FrankenPHP/Caddy** | Un solo dominio puede servir los ficheros de Angular y enrutar `/api` a Symfony, conservando las rutas relativas actuales y evitando CORS entre módulos. Reduce puntos de configuración de routing y permite publicar WEB/API juntos, pero también los acopla a una sola imagen y ciclo de despliegue. Menos servicios no garantiza por sí solo menor factura. | Crear una imagen multietapa que construya Angular, instale dependencias de Composer y extensiones PHP requeridas, y configure Caddy/FrankenPHP con fallback de SPA y front controller Symfony bajo `/api`. Validar el path de salud, `PORT`, assets/avisos, migraciones, consumo y que worker mode permanezca desactivado salvo decisión posterior. La documentación de FrankenPHP describe el uso con Symfony y configuración Caddy; Railway permite desplegar Symfony desde Railpack o Docker. |
| **C. Proxy/gateway WEB delante de servicios separados** | Mantiene los módulos y despliegues separados y ofrece al navegador un mismo origen `/api`, pero añade un componente HTTP enrutador cuya disponibilidad y configuración afectan a todas las peticiones. | Configurar routes y headers del proxy; verificar que el salto API confía exclusivamente en el proxy esperado y conserva información de origen comprobable. Valorar el componente adicional frente al presupuesto y a la operación manual. |

Las tres opciones siguen detrás del edge proxy de Railway. La página oficial de Edge Networking describe la terminación TLS y el encaminamiento al deployment, pero no documenta en esa referencia un contrato suficiente de `X-Forwarded-For` para configurar confianza sin validación adicional. Por tanto, ninguna topología da por resuelta la IP cliente del control de creación; se mantendrá la clave first-party como señal disponible y la IP solo se contará después de validar el origen y cabeceras recibidos por la aplicación.

**Decisión humana (2026-10-07):** después de revisar las alternativas, la persona impulsora aprobó B para REL-002. El fundamento es mantener el origen/rutas actuales y reducir configuración de CORS y routing público; acepta el coste de imagen propia y despliegue conjunto de WEB/API. Esto no demuestra menor factura. La decisión persistente y sus consecuencias están en [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../05_adr/adr-coo-005-topologia-web-api-railway.md). La verificación de la IP detrás del edge de Railway continúa abierta en implementación.

### Fuentes oficiales para topología y runtime

- [Railway — Deploy a Symfony App](https://docs.railway.com/guides/symfony): presenta despliegue mediante Railpack o Docker y un patrón con Nginx para Symfony.
- [FrankenPHP — Running Symfony](https://frankenphp.dev/docs/symfony/): describe `php_server` con `root public/` y opciones de Symfony Runtime/worker.
- [FrankenPHP — Configuration](https://frankenphp.dev/docs/config/): documenta configuración Caddyfile y PHP.
- [Railway — Edge Networking](https://docs.railway.com/networking/edge-networking): documenta terminación TLS, edge proxy y routing a la región del deployment.

## Impacto potencial

La investigación respalda documentar Railway IaC TypeScript en el repositorio como mecanismo vigente, y no iniciar configuración nueva con `railway.toml` o `railway.json`. Para REL-002, la WEB Angular y API Symfony se empaquetarán juntas en un único servicio HTTP FrankenPHP/Caddy según [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../05_adr/adr-coo-005-topologia-web-api-railway.md). Railway Cron es compatible con un trabajo horario en principio, sujeto a la finalización de cada ejecución; el reset está fijado a todas las horas en punto UTC. Para el piloto se acepta que un retraso o fallo no tenga estado especial ni recuperación; el temporizador sigue contando hacia el siguiente punto de hora. El juego de muestra contendrá dos equipos con datos de disponibilidad y consultas, y sus enlaces estarán en el formulario de creación según [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md); se podrán usar como equipos normales y sus cambios se borrarán en el reset. La preproducción será pública. El control de creación usa IP o dispositivo; basta con obtener una clave, se aplican ambas si están disponibles, y se bloquea si ninguna se obtiene o cualquier contador disponible alcanzó su límite, según [RF-EQU-009 — Limitar la creación de equipos por origen efímero](../../03_requisitos/01_funcionales/EQU/rf-equ-009-limitar-creacion-por-origen-efimero.md). Su pool permanece fuera del contenido funcional que se restaura. No hay credenciales de correo disponibles: se podrá evaluar SMTP si el plan es Pro o superior, o una API HTTPS de un proveedor externo. Railway no proporciona por sí mismo una cuenta ni credenciales de correo. Si no hay una alternativa segura disponible, el envío real se omite sin bloquear la entrega. El despliegue se iniciará manualmente por decisión expresa de la persona impulsora; quedan pendientes los comandos y pasos exactos del procedimiento reproducible.

## Conclusión factual

Railway ofrece capacidades documentadas que encajan con la preproducción solicitada, incluida una API TypeScript para IaC y servicios de base de datos y trabajos programados. La persona impulsora ha fijado un reinicio y precarga integral cada hora en punto UTC. Railway no garantiza la ejecución exacta al minuto ni inicia una segunda ejecución cuando la anterior sigue activa; el piloto acepta esta limitación sin recuperación o estado de error especial, y mantiene un temporizador horario. Railway no suministra una cuenta de envío: ofrece salida SMTP solo en planes Pro o superiores, y recomienda API HTTPS para planes Free, Trial y Hobby. Elegir proveedor externo y validar credenciales seguirá pendiente, pero la falta de una alternativa segura no bloqueará esta entrega. La preproducción estará abierta al público.
