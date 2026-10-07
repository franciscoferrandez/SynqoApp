---
id: ADR-COO-005
estado: aprobado
---
# ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002

## Contexto

[REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md) necesita publicar la SPA Angular y la API Symfony en Railway. La WEB usa rutas relativas `/api/...`; localmente Angular las redirige a la API mediante su proxy de desarrollo. El Dockerfile actual sirve a ese flujo local y no es una imagen de producción. Se compararon servicios WEB/API independientes, un runtime HTTP combinado y un gateway delante de servicios independientes en [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../01_research/resr-coo-003-railway-iac-preproduccion.md).

La persona impulsora eligió el servicio combinado el 2026-10-07. La aprobación determina la topología de REL-002; no autoriza conectar Railway o enviar source. El envío permanece condicionado por [SPEC-COO-005 — Reservar los derechos del software propio para REL-002](../../08_especificaciones/99_archivadas/spec-coo-005-licencia-propietaria-rel-002.md). Los despliegues seguirán iniciándose manualmente conforme a [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](adr-coo-004-preproduccion-railway-iac.md).

## Drivers

- Conservar el origen único y las rutas relativas `/api/...` que usa el cliente actual.
- Mantener acotada la cantidad de routing, orígenes permitidos y componentes operativos del piloto.
- Usar un servidor HTTP apropiado para producción, no el servidor integrado de PHP empleado en desarrollo.
- Mantener separados los límites lógicos de WEB y API aunque se empaqueten juntos en Railway.
- Respetar el límite económico de REL-002; el número de servicios no se considera una prueba de menor coste y el consumo deberá medirse.
- Conservar publicación manual y revisión antes de cada despliegue.

## Opciones consideradas

| Opción | Evaluación |
|---|---|
| WEB estática y API Symfony en servicios separados | Preserva despliegues independientes, pero requiere configurar una URL de API y CORS para el header first-party, o añadir un proxy para conservar el mismo origen. |
| **Servicio combinado WEB/API con FrankenPHP/Caddy** | Sirve Angular y `/api` bajo el mismo dominio, manteniendo el contrato de rutas actual y evitando CORS entre ambos módulos. Requiere una imagen de producción propia y despliega WEB y API conjuntamente. |
| Gateway delante de servicios WEB/API separados | Mantiene el mismo origen y los despliegues separados, pero agrega un servicio de routing y otra configuración de proxy que afecta a todas las solicitudes. |

## Decisión

- Para el servicio HTTP público de REL-002, construir una imagen Docker multietapa basada en FrankenPHP/Caddy que contenga el build Angular y la aplicación Symfony con sus dependencias de producción y extensiones requeridas.
- El dominio público único servirá los assets Angular y su fallback de navegación SPA. Las solicitudes `/api/...` se dirigirán al front controller Symfony; las rutas desconocidas de API conservarán errores de API y no caerán en `index.html`.
- Mantener WEB y API como módulos lógicos separados según [ADR-COO-001 — Separar interfaz web y API para la demo local](adr-coo-001-estructura-demo-local.md). La decisión los combina únicamente en el empaquetado y ciclo de despliegue HTTP de la preproducción Railway. El entorno local continuará permitiendo ejecutar Angular y API por separado.
- No activar inicialmente el worker mode de FrankenPHP. Usar el ciclo de petición normal y evaluar cualquier modo persistente por separado, con pruebas de compatibilidad, estado entre peticiones y recursos.
- Configurar el listener para el puerto provisto por Railway y añadir comprobación de salud de la aplicación. Los detalles exactos del Dockerfile, Caddyfile, paths del build, comandos y checks se concretarán y probarán en la implementación de [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../../08_especificaciones/01_activas/spec-coo-006-railway-iac-operacion-rel-002.md).
- Las tareas programadas y los workers que se acuerden podrán ejecutarse en servicios Railway separados usando el mismo artefacto, con sus propios comandos y guards; no se trasladan al proceso HTTP. La carga/reset reutilizable está en [SPEC-EQU-004 — Carga manual del juego demo en desarrollo local](../../08_especificaciones/99_archivadas/spec-equ-004-juego-demo-reset-horario.md); su publicación y schedule en preproducción están en [SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../../08_especificaciones/01_activas/spec-equ-006-juego-demo-preproduccion.md). La purga de [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../../08_especificaciones/99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md) mantiene su ciclo independiente.
- No confiar en `X-Forwarded-For` ni en otra cabecera de cliente hasta configurar y probar explícitamente la cadena de proxies de Railway. La topología de mismo origen evita CORS, pero no resuelve por sí sola la IP cliente. La clave first-party del control de creación se mantiene según [SPEC-EQU-005 — Limitar la creación de equipos por origen efímero](../../08_especificaciones/99_archivadas/spec-equ-005-limite-creacion-origen-efimero.md); solo se contará IP después de validar la señal.
- Cada publicación continúa siendo manual y WEB/API se promocionan conjuntamente. La decisión no cambia el hosting de producción ni fija una arquitectura de futura app móvil.

## Consecuencias positivas

- Se conservan las rutas relativas `/api/...` y se evita una configuración CORS entre WEB y API para el navegador.
- Un único servicio HTTP y dominio simplifican el routing público y el recorrido de publicación del piloto.
- Los límites de módulos permanecen expresados en código y contratos aunque compartan imagen.
- Una publicación identifica de forma inequívoca el conjunto WEB/API que se verificó como unidad.

## Consecuencias negativas

- WEB y API dejan de poder desplegarse o revertirse de manera independiente en Railway.
- La imagen multietapa, el routing Caddy, el fallback SPA, la seguridad de rutas API y la inclusión correcta de avisos de dependencias requieren diseño y validación propios.
- Fallos de build de cualquiera de los módulos bloquean la publicación del conjunto.
- No se garantiza ahorro frente a servicios separados; el consumo real se comprobará bajo el tope aprobado.
- La IP de cliente seguirá dependiendo de una configuración de proxies confiables validada aparte.

## Evidencia / Research

- [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../01_research/resr-coo-003-railway-iac-preproduccion.md)
- [Railway — Deploy a Symfony App](https://docs.railway.com/guides/symfony)
- [FrankenPHP — Running Symfony](https://frankenphp.dev/docs/symfony/)
- [FrankenPHP — Configuration](https://frankenphp.dev/docs/config/)
- [Railway — Edge Networking](https://docs.railway.com/networking/edge-networking)

## Sustituye

No sustituye [ADR-COO-001 — Separar interfaz web y API para la demo local](adr-coo-001-estructura-demo-local.md), que fija sus responsabilidades lógicas y el flujo local. Añade la decisión de empaquetado HTTP de preproducción Railway.

## Sustituido por

—
