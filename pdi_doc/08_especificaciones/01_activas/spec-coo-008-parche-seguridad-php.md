---
id: SPEC-COO-008
nivel: N1
estado: en_implementacion
---

# SPEC-COO-008 — Aplicar el parche crítico de PHP en todos los entornos

## Objetivo y origen

Petición expresa del 2026-10-23: revisar el parche crítico de esta semana y dejarlo aplicado globalmente, incluidos los despliegues Railway. Mantener PHP 8.5, la arquitectura, funcionalidades y datos.

## Scope y módulos

Actualizar el runtime PHP de desarrollo, API de pruebas, worker y la imagen combinada Railway (HTTP y Cron). Fijar imágenes corregidas, exigir el mínimo seguro en Composer, aplicar la recomendación adicional de configuración, reconstruir y sustituir procesos; verificar runtime, checks y aplicación desplegada.

Módulo [API — arquitectura](../../06_arquitectura/03_modulos/API/README.md) y [API — desarrollo](../../07_desarrollo/08_modulos/API/README.md). Operación existente: [guía Railway](../../09_operacion/01_despliegue/railway-rel-002.md) y [toolkit](../../09_operacion/01_despliegue/railway-toolkit.md). Sin nueva entrega funcional; mantenimiento de seguridad de todos los entornos existentes.

## Fuera de scope

Cambios funcionales, migraciones de datos, resets, nuevos servicios, activación de Cron deshabilitados, actualización general de dependencias o snapshots. No crear ADR ni marcar releases ENTREGADA por aplicar este parche.

## Gate de inicio

`pdi:change-new`: READY_FOR_CHANGE_PREPARE. Una SPEC N1 para conservar evidencia de un parche crítico y su aplicación remota.

## Investigación y diseño aprobado por el alcance de la petición

El [aviso oficial del 21 de octubre](https://www.php.net/archive/2026.php#2026-10-21-5) exige PHP 8.5.12 para CVE-2026-109618 y CVE-2026-109619; incluye FrankenPHP. El [aviso adicional del 23 de octubre](https://www.php.net/archive/2026.php#2026-10-23-1) recomienda `session.upload_progress.enabled=0` antes de procesar peticiones, hasta otra corrección de un vector de sesión excepcional. No sustituye el parche. Synqo no usa subida de archivos ni cambia el serializador de sesión.

API local observada en PHP 8.5.11. Docker de desarrollo usa etiqueta flotante 8.5; Railway fija un digest anterior. La [versión de seguridad FrankenPHP 1.13.2](https://github.com/php/frankenphp/releases/tag/v1.13.2) incluye el PHP corregido y otros arreglos de seguridad; [1.13.3](https://github.com/php/frankenphp/releases/tag/v1.13.3), publicada hoy, añade correcciones de fallos. Se fija 1.13.3/PHP 8.5 Bookworm por digest y se verifica PHP embebido además del CLI. Desarrollo fija PHP 8.5.12 Bookworm por digest. HTTP, Cron y worker mantienen su imagen compartida correspondiente. Composer exige `>=8.5.12`, sin actualizar paquetes.

Copiar una configuración INI común en ambas imágenes; validar versión mínima y directiva en build y smoke de la imagen final. Reiniciar contenedores/procesos completos; no basta reconstruir ni recargar configuración. Conservar volúmenes, secretos, horarios y opt-ins existentes.

La sesión de Railway CLI está caducada. Se ha solicitado reautenticación a la persona impulsora mientras continúa el trabajo local. Esto bloquea solo inspección/verificación remota y cierre global; no hay decisión funcional pendiente ni razón para retrasar el parche local. Nunca registrar secretos ni declararlo desplegado sin evidencia. Autorización para mantener trazabilidad vigente.

## Criterios de aceptación

| Acceptance criterion | Evidence | Result |
|---|---|---|
| 1. Versiones corregidas fijadas en desarrollo y Railway, mínimo Composer | Dockerfiles fijados por digest; CLI y PHP embebido 8.5.12; Composer validado y paquetes conservados | PASS |
| 2. Protección INI común antes de peticiones y control de build | INI común; guardas de build y smoke CLI/embebido comprueban `session.upload_progress.enabled=0` | PASS |
| 3. API, worker y perfil de pruebas locales usan runtime corregido, datos conservados | API y worker recreados; perfil E2E ejecutado con imagen corregida; tres runtimes 8.5.12/INI 0, API 198 tests y esquema PASS | PASS |
| 4. Imagen Railway completa conserva salud, WEB, API y migraciones | Smoke aislado con PostgreSQL, CLI y PHP embebido PASS, sin reset de datos existentes | PASS |
| 5. Todos los servicios PHP Railway existentes se actualizan, sin activar Cron nuevos | Tres despliegues SUCCESS del commit corregido; PHP/INI verificadas por SSH y HTTP, build de ambos Cron validado; CI en curso | PARTIAL |

## Plan y gate de preparación

1. MEDIUM: fijar imágenes y mínimo Composer, INI y guardas; sin cambios de dominio.
2. MEDIUM: reconstruir/recrear servicios locales conservando datos, checks API completos y smoke de imagen Railway.
3. MEDIUM: publicar, verificar CI y servicios Railway HTTP/Cron existentes; conservar estados y comprobar runtime remoto. Registrar evidencia y cerrar solo con todos los criterios PASS.

`pdi:change-prepare`: **PASS — READY_FOR_CHANGE_APPLY**, 2026-10-23. Alcance autorizado expresamente, investigación oficial completada y diseño compatible con módulos existentes. La indisponibilidad temporal de credenciales Railway queda explícita como pendiente de ejecución remota, sin simular conformidad global.

## Evidencia local — 2026-10-23

- Registro Docker oficial consultado y versiones efectivas comprobadas: PHP CLI 8.5.12 y FrankenPHP 1.13.3/PHP embebido 8.5.12. Dockerfiles fijados por manifest multiarch, sin depender de actualizar una etiqueta flotante.
- `docker compose build --progress plain api api-e2e mail-worker` PASS; `docker compose up -d --no-deps --force-recreate api mail-worker` sustituye procesos activos manteniendo PostgreSQL/volúmenes. `php -r` en API, worker y contenedor del perfil E2E devuelve `8.5.12 upload_progress=0`. Configuración API local HTTP 200.
- `composer install --no-interaction --no-progress`, `composer validate --strict` y `composer check-platform-reqs`: PASS. El lock conserva todos los paquetes, solo cambia plataforma y su content-hash, calculado por `Composer\Package\Locker::getContentHash`.
- `docker compose exec -T api composer test`: **198 tests, 2071 assertions PASS**. `composer cs:check`, `composer stan`, `composer rector:check` y `php bin/console doctrine:schema:validate --env=test`: PASS en PHP 8.5.12. Las excepciones SQL provocadas por los casos de rollback son intencionadas.
- Con `source "$HOME/.nvm/nvm.sh" && nvm use` desde raíz: `npm run railway:image:smoke` PASS, incluida reconstrucción final con los avisos de versiones actualizados. CLI y PHP embebido comprueban mínimo seguro y protección INI; salud, SPA, API, migraciones y ocho avisos de distribución PASS en PostgreSQL efímero aislado.
- `node --test scripts/distribution-notices.test.mjs`: **2 PASS**; `bash -n scripts/smoke-railway-image.sh`, estructura PDI, enlaces de artefactos y `git diff --check` PASS. Licencias upstream de PHP 8.5.12 y FrankenPHP 1.13.3 comparadas: textos íntegros conservados, sin cambios. Actualizados el índice de avisos y la procedencia de la imagen.
- `pdi:baseline-update` consolida únicamente el mínimo de seguridad y procedimiento de sustitución/verificación en la guía de operación, por la petición expresa y los avisos oficiales; no cambia arquitectura ni reglas de producto.

## Ejecución remota y gate de verificación

El acceso inicial falló por sesión caducada. La persona impulsora confirma la reautenticación y se recupera acceso CLI. La clave SSH habitual necesita una passphrase sin agente disponible; se registra una clave temporal exclusiva para esta comprobación, se verifica el runtime y se revoca y elimina al terminar. No se almacenan secretos en el repositorio ni en la evidencia.

Commit publicado: `6234b54c8f3d6b7409e93e0f37c3eecd5f0a43ec`, con hooks de commit API PASS y pre-push visual **136/136 PASS**, sin actualizar snapshots. Los tres servicios PHP existentes despliegan automáticamente desde `main`. PostgreSQL mantiene el despliegue anterior; no se toca IaC ni se activan servicios nuevos.

| Servicio Railway | Despliegue | Estado y evidencia |
|---|---|---|
| `synqo-http` | `514d3cb0-7d57-4f92-ab84-f922a15b9d7a` | SUCCESS del commit `6234b54`; SSH confirma PHP CLI 8.5.12, FrankenPHP 1.13.3/PHP embebido 8.5.12 y `session.upload_progress.enabled=0` en ambos. |
| `synqo-creation-limits-purge` | `05c8531b-c16a-468f-b19c-ad5d15a2cf29` | SUCCESS del mismo commit; log de build confirma digest corregido y guardas CLI/embebido. Conserva `*/5 * * * *` UTC. |
| `synqo-demo-reset` | `07dcdf05-fa5e-4958-8539-21dedbace54f` | SUCCESS del mismo commit; log de build confirma digest corregido y guardas CLI/embebido. Conserva `0 * * * *` UTC. |

La API pública `https://synqo-http-preproduction.up.railway.app/api/configuration` pasa de `X-Powered-By: PHP/8.5.11` a `PHP/8.5.12` y responde HTTP 200. `/healthz` HTTP 200. Los Cron se verifican por su nuevo despliegue/imagen y guardas de build; no se fuerza una ejecución de reset para comprobar versión. No cambian horarios ni volúmenes.

`pdi:change-apply`: implementación y despliegue completados. `pdi:change-verify`: pendiente terminar [CI del parche](https://github.com/franciscoferrandez/SynqoApp/actions/runs/40020959966). Los cuatro criterios locales están PASS y el quinto conserva PARTIAL hasta disponer del resultado CI. Sin cambios funcionales, de esquema o snapshots; no cerrar ni archivar antes del gate completo.

## Corrección de inestabilidad de verificación

El primer CI pasa imagen de preproducción, análisis PHP, API completa y regresión visual, pero termina con 171 E2E PASS y dos fallos de sincronización en los tests anteriores. La traza del smoke de accesibilidad muestra una recarga completa del documento durante la comprobación de foco. La del benchmark muestra que consulta el DOM cuando el calendario aún no ha terminado de recargar y avanza indebidamente de mes.

Corrección limitada a infraestructura/fixtures E2E: desactivar HMR y live reload en el servidor arrancado por Playwright y esperar a que haya días visibles antes de decidir navegar de mes en el helper del benchmark. No cambia el servidor habitual de desarrollo, funcionalidades, límites de aceptación ni timeouts. Se repiten los recorridos afectados con API/worker/correo aislados de pruebas; sin resetear datos ni tocar servicios de desarrollo.
