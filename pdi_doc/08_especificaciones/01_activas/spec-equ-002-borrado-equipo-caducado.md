---
id: SPEC-EQU-002
nivel: N2
estado: listo
release: REL-001
---

# SPEC-EQU-002 — Borrado de equipos caducados

## Objetivo

Realizar el [RF-EQU-005 — Eliminar los datos del equipo caducado](../../03_requisitos/01_funcionales/EQU/rf-equ-005-eliminar-equipo-caducado.md) dentro de la [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md): impedir el acceso desde la caducidad y eliminar de la base activa todos los datos del equipo al finalizar el plazo configurable, cuyo valor inicial es de 90 días.

## Scope

- Aplicación del estado caducado y del plazo adicional de borrado sobre los equipos persistidos.
- Borrado completo y consistente de los datos pertenecientes a un equipo en la base activa.
- Configuración interna o de entorno del plazo de borrado, con 90 días como valor inicial.
- Ejecución reproducible en local y comprobación con tiempo controlado.
- Tratamiento de enlaces de equipos caducados y borrados conforme a los contratos vigentes.

## Fuera de scope

- Definir o cambiar las reglas de caducidad por inactividad.
- Cambiar el contrato de acceso por enlace.
- Definir la duración de conservación de copias de seguridad.
- Diseñar medidas de prevención de reaparición tras restaurar una copia.
- Implementar copias, restauración, operación pública o interfaz de administración.
- Cambiar las reglas normativas del producto.

## Baseline relacionado

- [RF-EQU-005 — Eliminar los datos del equipo caducado](../../03_requisitos/01_funcionales/EQU/rf-equ-005-eliminar-equipo-caducado.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RN-EQU-003 — Borrado de equipos caducados](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md)
- [RD-EQU-003 — Datos del equipo caducado](../../03_requisitos/03_datos/EQU/rd-equ-003-datos-equipo-caducado.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [API](../../06_arquitectura/03_modulos/API/README.md)
- [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md)

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md)

WEB solo será afectado si la preparación identifica una discrepancia concreta en la presentación de un equipo borrado; no forma parte del alcance inicial.

## Criterios de aceptación

- Un equipo caducado no permite acceder a sus datos desde el momento definido por [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md).
- Con el plazo configurado a 90 días, el proceso elimina de la base activa el equipo y todos los datos que le pertenecen al cumplirse 90 días desde su caducidad.
- El plazo de borrado se puede configurar sin modificar el código y se valida que un valor explícito sustituye al valor inicial.
- El borrado es consistente: no quedan participantes, disponibilidades, consultas, opciones, votos, resoluciones ni referencias activas pertenecientes al equipo.
- Un enlace de un equipo ya borrado recibe el estado genérico previsto para un equipo inexistente, sin exponer sus datos.
- La ejecución repetida del proceso es segura y no falla por equipos ya eliminados.
- Las pruebas usan reloj controlado y cubren los límites antes, justo en y después de la fecha de borrado.
- La evidencia distingue el borrado de la base activa de la retención de copias, que permanece fuera de este Change.

## Impacto baseline esperado

Ningún cambio normativo: materializa requisitos y reglas vigentes. Las decisiones pendientes sobre copias y restauración no se convierten en requisitos aprobados por esta SPEC.

## Questions / Assumptions

### Decisiones pendientes

- **Pregunta:** ¿Qué mecanismo operativo y qué plazo de conservación de copias deben aplicarse para que los datos desaparezcan cuando venza la retención?
  - **Por qué bloquea:** determina la evidencia y los límites de cumplimiento sobre copias, aunque no sea necesario para borrar la base activa local.
  - **Opciones conocidas:** definirlo en una decisión de arquitectura/operación posterior; o incluirlo en una entrega de operación del piloto.
  - **Estado:** ninguna opción está aprobada.
  - **Gate afectado:** preparación de la parte relativa a copias; no bloquea el alcance de base activa si se mantiene fuera de scope.
- **Pregunta:** ¿Qué mecanismo evita que una restauración reactive un equipo cuyo borrado ya se cumplió?
  - **Por qué bloquea:** afecta a la semántica de restauración y a la conformidad completa del ciclo de vida.
  - **Opciones conocidas:** registro externo de borrados, restauración con purga posterior u otra política operativa que se investigará.
  - **Estado:** ninguna opción está aprobada.
  - **Gate afectado:** preparación de restauración y operación; no bloquea la implementación local del borrado de la base activa.

Se asume que los datos de equipos caducados ya se consideran inaccesibles mediante la lógica vigente y que el Change debe reutilizar esa frontera, no duplicarla en WEB.

## Research necesario

- La implementación vigente calcula la caducidad desde `last_activity_at` y la zona del equipo mediante `ExpiryCalculator`; el reloj ya se inyecta mediante `Psr\\Clock\\ClockInterface`.
- La persistencia actual tiene `team` como raíz y `participant.team_id` con `ON DELETE CASCADE`; no hay todavía tablas de disponibilidad o consultas en el esquema actual. Las futuras relaciones de datos del equipo deberán conservar esta frontera de borrado.
- Symfony Console está disponible y el autoconfigurado registra comandos de `src/`; no existe aún un comando de limpieza.
- Doctrine Migrations y PostgreSQL son el mecanismo vigente de persistencia y evolución del esquema. No se necesita migración para el valor configurable si se resuelve mediante entorno/parámetro.
- La retención y restauración de copias requieren una decisión operativa posterior y permanecen fuera de este Change.

## Design / Structure

Se implementará en API, sin endpoint público ni cambios en WEB:

- Un servicio de aplicación de limpieza recibe el reloj, el número de días de retención activa y el repositorio de equipos.
- El repositorio identifica equipos cuya fecha efectiva de caducidad más el plazo configurado es menor o igual al instante actual. La fecha efectiva se calcula con la misma `ExpiryCalculator` y la zona persistida del equipo; no se usará la hora del sistema directamente en la regla.
- El repositorio elimina cada equipo raíz en una transacción, dejando que PostgreSQL aplique las restricciones `ON DELETE CASCADE` a todos sus datos dependientes. Si una futura entidad pertenece a un equipo, su FK deberá usar la misma política o el borrado no podrá declararse completo.
- Un comando Symfony invoca el servicio, devuelve un resultado resumido y puede ejecutarse repetidamente. El comando no expone secretos ni forma parte del contrato HTTP.
- El plazo se inyecta desde una variable de entorno con valor predeterminado de 90 días; valores ausentes o no positivos se rechazan durante el arranque/configuración.
- La consulta y el borrado se harán de forma segura frente a reejecuciones. Si se usa procesamiento por lotes, cada lote tendrá una frontera transaccional clara y el resultado parcial no impedirá continuar con ejecuciones posteriores.

No se modifica la lógica de autorización: antes del borrado un equipo caducado sigue devolviendo `410`, y después de eliminarse el enlace sigue devolviendo `404` genérico conforme a [Convención HTTP de la API](../../06_arquitectura/03_modulos/API/convencion-http.md).

## Plan por slices

1. Añadir configuración validada del plazo, servicio de limpieza, repositorio y comando Symfony; cubrir reglas puras, límites temporales, valor por defecto, valor configurado, valor inválido y reejecución.
2. Integrar el borrado raíz con PostgreSQL y probar la eliminación en cascada de los datos actuales, atomicidad ante fallo y aislamiento de equipos no elegibles.
3. Verificar el contrato de acceso antes y después del borrado, documentar la ejecución local reproducible y ejecutar los checks estáticos del módulo API.

## Evidencia / Validation

La evidencia incluirá:

- pruebas unitarias de la fecha efectiva de borrado, incluidos los límites anterior, exacto y posterior;
- pruebas de configuración del valor inicial de 90 días, sustitución por entorno y rechazo de valores no válidos;
- pruebas de integración PostgreSQL que creen equipos elegibles y no elegibles, verifiquen el borrado raíz y la cascada de participantes, y comprueben que una ejecución repetida es segura;
- prueba de atomicidad ante error de persistencia y de que no se borran equipos que aún no cumplen el plazo;
- prueba de API del mismo enlace con `410` antes del borrado y `404` genérico después, sin exponer datos;
- ejecución del comando en entorno de prueba con reloj controlado o datos temporales equivalentes, más `composer test`, `composer cs:check`, `composer stan`, `composer rector:check` y validación de esquema.

La retención de copias y la prevención de reaparición tras restauración no tendrán evidencia de implementación en este Change; quedan registradas como omisiones activas y no se declararán cubiertas.

### Implementación de change-apply (2026-10-05)

La implementación añade `TeamDeletionPolicy`, que reutiliza la caducidad vigente y suma el plazo sobre su instante UTC; `TeamCleanupService`, que recibe reloj y política; y el puerto `TeamCleanupRepository`, con un adaptador independiente que bloquea y relee cada raíz antes del borrado transaccional. `app:teams:cleanup` muestra únicamente el número de equipos eliminados. El parámetro de entorno tiene valor inicial de 90 y rechaza valores no positivos o no enteros cuando se resuelve la configuración del comando. No se necesita migración: la FK de participantes ya usa cascada.

Por instrucción expresa de la persona usuaria, esta fase conserva únicamente implementación y documentación descriptiva. Las pruebas y comprobaciones corresponden a la verificación posterior. No se modifica baseline y no se marca el Change verificado, convergido ni cerrado.

**Omisiones activas:** retención de copias y prevención de reaparición tras restauración, por quedar fuera del alcance aprobado y requerir decisiones operativas posteriores.

## Definition of Ready

**READY_FOR_CHANGE_APPLY.** El objetivo, alcance, baseline, módulo, diseño, estructura, slices y evidencia están concretados. La implementación queda limitada al borrado de la base activa y a su integración con el estado de acceso. Las decisiones sobre copias y restauración están registradas como pendientes fuera de scope, con gate operativo posterior explícito; no bloquean este incremento.

## Convergence

Pendiente.

## Resultado de cierre

Pendiente.
