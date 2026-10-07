---
id: SPEC-EQU-007
nivel: N2
estado: cerrado
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

Verificación ejecutada el 2026-10-07 sobre la implementación. El commit funcional es `4cb91be`; el commit documental de preparación fue `e249944`. La evidencia registra los criterios del gate `change-verify`.

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

Comandos y resultado: `docker compose exec -T api composer test` (61 tests, 536 aserciones); `npm test` con Node 24.21.0 (12 tests); `npm run lint`; `npm run format:check`; `npm run build`; `docker compose exec -T api composer cs:check`; `docker compose exec -T api composer stan`; `docker compose exec -T api composer rector:check`. Todos pasaron. El test de configuración pública también pasó por separado con `TEAM_CREATION_EMAIL_ENABLED=false`, `invalid` y variable ausente (`env -u`); las tres respuestas fueron `false`. `validate_structure.py` y `git diff --check` pasan.

## Convergencia

**Convergencia PASS — `READY_FOR_CHANGE_CLOSE` (2026-10-07).** Se compararon la [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md), la [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md), la [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md), los contratos API/WEB, los ocho criterios, el código y los tests. No se encontró drift significativo ni cambio de verdad normativa pendiente. La bandera fail-closed y el comportamiento WEB/API coinciden con el alcance. El correo externo en Railway sigue deshabilitado hasta disponer de proveedor y credenciales seguros, conforme a la omisión aceptada en REL-002.

La implementación precedió a la autorización del gate `change-apply`, según la desviación registrada durante la preparación. Se conservó por instrucción de la persona impulsora, se verificó formalmente y se integró en el commit `4cb91be`; esta desviación de proceso no dejó discrepancias funcionales abiertas.

## Resultado de cierre

**DONE — Change cerrado y archivado el 2026-10-07.** Los ocho criterios de aceptación están en `PASS`; las suites y checks API/WEB aplicables pasaron, incluidos los hooks del commit funcional. El control de disponibilidad del correo por entorno queda `VALIDADO` en [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md). El envío real externo permanece `PLANIFICADO` y no bloquea la entrega: no se configuró proveedor ni credencial. No se declara REL-002 entregada.

Commits: implementación `4cb91be feat(repo): configurar correo de creación por entorno`; preparación documental `e249944 docs(pdi): preparar documentación de REL-002`; cierre documental posterior.
