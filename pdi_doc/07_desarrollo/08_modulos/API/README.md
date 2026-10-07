# API — reglas de implementación

> Convenciones de base aceptadas por la persona impulsora; cada SPEC concreta las operaciones y respuestas que implementa.

## Arquitectura normativa

Véase [API](../../../06_arquitectura/03_modulos/API/README.md).

## Responsabilidades

Implementar validación de acceso, reglas de dominio, persistencia y respuestas de API.

## Convenciones específicas

Aplican también los [principios de arquitectura limpia y DDD](../../01_principios-y-convenciones/arquitectura-limpia-y-ddd.md).

- Usar recursos de API Platform como contratos públicos. Para operaciones con reglas propias, separar entrada y salida de las entidades Doctrine mediante DTO y usar proveedores o procesadores de estado cuando corresponda, según la [guía de DTO de API Platform](https://api-platform.com/docs/main/core/dto/). No exponer automáticamente una entidad como contrato público sin revisar sus operaciones y datos.
- Situar las reglas de negocio comprobables en servicios o modelos de dominio, fuera de la representación HTTP. Los proveedores leen el estado y los procesadores coordinan escrituras; la distribución concreta se fijará al diseñar cada operación.
- Usar transacciones para mutaciones que deban confirmarse juntas y migraciones versionadas para el esquema PostgreSQL. Hacer inyectable el reloj usado en caducidad y borrado.
- Aplicar la comprobación de acceso de forma consistente en todas las operaciones del equipo, incluidas las que API Platform podría exponer por defecto, conforme a [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).
- Configurar recursos como `application/json` y errores como `application/problem+json`; documentar en OpenAPI entradas, salidas, autenticación y respuestas reales de cada operación conforme a [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md). Verificar que el documento exportado coincide con las respuestas probadas.
- Aplicar la [convención HTTP común](../../../06_arquitectura/03_modulos/API/convencion-http.md) a los siguientes slices; declarar únicamente los códigos que correspondan a cada operación.
- Configurar PHP CS Fixer, PHPStan y Rector según los [controles estáticos de la demo local](../../03_calidad/controles-estaticos-demo-local.md). Sus comprobaciones no modifican archivos; las correcciones se ejecutan por separado y a demanda.

## Testing específico

Pruebas unitarias de reglas puras y pruebas de integración con PostgreSQL para acceso, persistencia, concurrencia y borrado. El script `composer test` fija el perfil de despliegue `test` y los límites de prueba para que las variables de Compose del entorno de desarrollo no alteren los resultados. Usar las herramientas de prueba compatibles con Symfony según su [guía oficial](https://symfony.com/doc/current/testing.html); la estrategia global está en [Estrategia de pruebas de la demo local](../../02_testing/estrategia-demo-local.md).

## Comandos

Los comandos disponibles están definidos en `apps/api/composer.json` y se resumen en el [README principal](../../../../README.md#desarrollo-local). Para E2E de WEB, API/PostgreSQL y `mail-worker` deben estar disponibles cuando la prueba ejercita el recorrido completo de inicio o el correo.

## Dependencias permitidas

Symfony, API Platform y PostgreSQL conforme a [ADR-COO-001 — Separar interfaz web y API para la demo local](../../../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md). Ninguna dependencia de WEB.

## Prohibiciones

No autorizar por UUID o identidad de participante sin comprobar el valor del enlace. No registrar secretos de acceso. Conservar únicamente el verificador SHA-256 y exigir el valor como Bearer en cada operación, según [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). No usar la hora del sistema directamente dentro de reglas que requieran tiempo controlado.

## Checklist de implementación

- Probar valor válido, ausente, alterado y equipo caducado para cada clase de operación.
- Probar restricciones y mutaciones simultáneas relevantes.
- Verificar caducidad y limpieza con reloj controlado.
