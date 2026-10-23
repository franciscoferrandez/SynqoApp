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
| 5. Todos los servicios PHP Railway existentes se actualizan, sin activar Cron nuevos | Pendiente de publicación/CI y verificación remota; CLI no autenticada | UNKNOWN |

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

## Pendiente de ejecución remota y gate de verificación

`railway status --json` falla con sesión caducada/Unauthorized. La pregunta enviada a la persona impulsora solicita ejecutar `railway login` y avisar; no requiere exponer tokens en el chat. Hasta recuperar acceso no se puede inventariar ni certificar los servicios HTTP/Cron y su runtime real. La definición compartida garantiza la corrección de la imagen de próximos builds, pero no acredita procesos desplegados.

`pdi:change-apply`: implementación local y de imagen completada. `pdi:change-verify`: **BLOCKED para cierre global**, criterio 5 aún UNKNOWN por acceso remoto pendiente. Los cuatro criterios locales están PASS; no se ejecuta `pdi:change-close` ni se archiva este Change hasta acreditar Railway. Sin cambios funcionales, de esquema o snapshots.
