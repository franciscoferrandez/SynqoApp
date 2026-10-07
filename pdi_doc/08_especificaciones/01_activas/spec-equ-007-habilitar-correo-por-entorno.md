---
id: SPEC-EQU-007
nivel: N2
estado: ready
release: REL-002
---
# SPEC-EQU-007 — Habilitar u ocultar el correo de creación por entorno

## Objetivo

Permitir que cada entorno habilite o deshabilite el envío opcional del enlace del equipo. Al deshabilitarlo, el formulario oculta el campo y la API impide registrar o procesar envíos.

## Scope

- Configuración de la capacidad de correo opcional por entorno con cierre seguro cuando falta la variable.
- Consulta pública y sin caché de la capacidad para que WEB presente el campo solo cuando está habilitada.
- Validación de API para rechazar una solicitud que incluya correo cuando la capacidad está apagada, sin crear el equipo ni registrar un evento.
- Protección del proceso de envío para que tampoco envíe eventos pendientes cuando la capacidad está apagada; su cierre debe eliminar la carga transitoria conforme al ciclo ya definido.
- Documentación de la variable para desarrollo y despliegue.

## Fuera de scope

- Cambiar el proveedor, las credenciales o la semántica de confirmación del correo.
- Cambiar límites de creación de equipos o bloquear la creación cuando no se solicite correo.
- Habilitar automáticamente correo real en Railway sin proveedor y credenciales verificados.
- Reintentar, reenviar o recuperar eventos de correo.

## Baseline relacionado

- [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md)
- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md)
- [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md)
- [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md)

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md): configuración, contrato de consulta, validación de creación y worker de correo.
- [WEB](../../06_arquitectura/03_modulos/WEB/README.md): lectura de capacidad y presentación condicional del campo.

## Criterios de aceptación

1. La variable `TEAM_CREATION_EMAIL_ENABLED` controla la capacidad independientemente en cada entorno. Si falta o tiene un valor inválido, el servicio falla cerrado y la capacidad queda deshabilitada.
2. La configuración local de desarrollo en Compose habilita la capacidad para conservar el flujo actual de desarrollo y sus pruebas de correo.
3. WEB consulta la configuración pública de API antes de presentar el campo. Si el correo está deshabilitado o la configuración no se puede consultar, el campo y su ayuda no aparecen; no hay un instante en que se muestre habilitado antes de resolver la configuración.
4. Con la capacidad habilitada, crear sin correo o con un correo válido conserva el comportamiento actual.
5. Con la capacidad deshabilitada, una petición de creación que incluya una dirección devuelve un problema 422, no crea equipo ni participante y no registra recibo ni evento de correo.
6. Con la capacidad deshabilitada, el worker no llama al adaptador de envío para ningún evento pendiente. Al tomar uno, lo cierra como fallido y limpia su carga transitoria.
7. La capacidad pública no expone secretos, se responde sin caché y refleja la configuración efectiva de la API.
8. Las pruebas cubren configuraciones habilitada/deshabilitada, omisión de configuración, rechazo de entrada, ausencia de evento y ausencia de llamada al adaptador, incluido un evento que ya estaba pendiente.

## Impacto baseline esperado

Modifica la disponibilidad de RF-EQU-006 por entorno para soportar el bloqueo preventivo y la alternativa de REL-002 si no se configura correo externo. No cambia el comportamiento cuando la capacidad está habilitada.

## Questions / Assumptions

- Valor ausente o inválido se interpreta como deshabilitado.
- Compose y `.env.example` habilitan la capacidad para desarrollo; el resto de entornos debe habilitarla expresamente.
- Las peticiones manipuladas que incluyan correo estando deshabilitado se rechazan íntegramente; no se ignoran silenciosamente ni se crea el equipo.
- Un evento ya pendiente se cierra como fallido sin envío y se elimina su carga transitoria si el worker lo procesa con la capacidad apagada.

## Research necesario

No hace falta nueva investigación: el flujo transaccional, su estado y el procesamiento de un único intento están definidos por ADR-EQU-002 y la capacidad actual.

## Design / Structure

La API expone un recurso público de configuración con la capacidad efectiva y encabezados `Cache-Control: no-store`. WEB falla cerrada mientras no recibe esa capacidad. El controlador de creación y `TeamService` no aceptan direcciones cuando está apagada. `MailAttemptProcessor` consulta la misma configuración antes de invocar el adaptador y cierra los eventos pendientes sin enviar.

## Plan por slices

1. Configurar la variable con valor seguro por defecto y exponer la capacidad efectiva desde API.
2. Aplicar la guarda en creación y procesamiento del worker; probar que no se persiste ni envía correo con la opción apagada.
3. Ocultar el campo hasta resolver la configuración y cuando la capacidad esté apagada; verificar comportamiento habilitado y apagado.
4. Documentar variables locales y de despliegue y ejecutar los checks de API y WEB aplicables.

## Evidencia técnica disponible

La implementación ya existente aporta la siguiente evidencia. Se registra para no perderla; no sustituye los gates formales de `change-verify` y `change-close`.

| Criterio | Evidencia | Resultado |
|---|---|---|
| 1. Bandera independiente, apagada por defecto y fail-closed | `services.yaml` define `false` como fallback. `TeamMailAttemptTest` pasa con la bandera `true`, `false` y `invalid`; en los dos últimos casos la configuración pública devuelve `false`. | PASS |
| 2. Desarrollo local habilitado | `compose.yaml` y `.env.example` mantienen `TEAM_CREATION_EMAIL_ENABLED=true`; el endpoint informa la capacidad efectiva. | PASS |
| 3. WEB solo muestra el correo si recibe habilitación | `CreatePage` inicia con la capacidad apagada; las pruebas de componente comprueban que el campo permanece oculto cuando la bandera es falsa o falla la consulta. | PASS |
| 4. Comportamiento habilitado conserva el flujo | `TeamMailAttemptTest` comprueba creación sin correo y registro del evento cuando se proporciona correo válido; suite completa API: 61 tests. | PASS |
| 5. API rechaza correo con capacidad apagada sin crear datos | `testDisabledEmailRejectsBeforeCreatingTeamOrAttempt` comprueba 422 y cero filas de equipo/evento. | PASS |
| 6. Worker no envía eventos pendientes al apagar | `testDisabledWorkerClosesPendingAttemptWithoutCallingMailer` comprueba cero llamadas, estado fallido y eliminación de la carga. | PASS |
| 7. Configuración pública sin secretos y sin caché | `testPublicConfigurationIsNoStoreAndReflectsEnvironmentCapability` comprueba respuesta con solo el booleano y `Cache-Control: no-store`. | PASS |
| 8. Cobertura habilitada, deshabilitada, rechazo y worker | API: `composer test` (61 tests, 536 aserciones); WEB: `npm test` (12 tests). | PASS |

Checks adicionales: WEB `lint`, `format:check` y `build`; API PHPStan, PHP CS Fixer y Rector; `validate_structure.py`.

## Desviación de flujo y estado del Change

El código se implementó antes de recibir autorización para entrar en `change-apply`; se conserva por indicación expresa de la persona usuaria y queda fuera del commit documental. Las pruebas y checks registrados describen el estado del árbol de trabajo, pero no se ha ejecutado todavía el flujo formal de verificación y cierre PDI. La SPEC permanece `ready` y abierta para el siguiente trabajo formal; no se archiva en esta fase documental. La habilitación de correo real en Railway sigue condicional a disponer de proveedor y credenciales.

## Estado de preparación

La SPEC y sus referencias dejan definido el alcance para REL-002 y en estado `ready`. Esto completa la preparación documental de este Change, no de todos los Changes de REL-002. El Change no se cierra ni se archiva; la implementación y su cierre formal quedan para el siguiente trabajo. El correo externo en preproducción sigue condicionado a un proveedor y credenciales seguros.
