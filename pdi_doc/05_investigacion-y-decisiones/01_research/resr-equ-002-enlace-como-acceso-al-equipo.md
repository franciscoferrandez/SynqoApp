---
id: RESR-EQU-002
---

# RESR-EQU-002 — ¿Qué implica conceder acceso al equipo mediante un enlace?

## Objetivo

Identificar los riesgos y las decisiones técnicas que requiere el acceso sin registro a un equipo vigente, sin cambiar el modelo de confianza definido para Synqo.

## Hechos

- Según el producto definido, poseer el enlace permite abrir el equipo vigente sin cuenta; una vez dentro se puede elegir una identidad de participante existente o crear otra y actuar en su representación. Por tanto, para este alcance el enlace funciona como una credencial compartible. Esta es una inferencia directa de las reglas del proyecto.
- Los identificadores usados como secretos de acceso deben ser difíciles de adivinar. OWASP recomienda generarlos con un generador criptográficamente seguro y suficiente entropía para los identificadores de sesión. Esa guía aporta un criterio de seguridad análogo, pero no fija por sí sola la forma concreta del enlace de Synqo.
- Un identificador de objeto, incluso si es UUID, no sustituye la comprobación de acceso en cada operación. OWASP describe el acceso indebido a objetos cuando se confía solo en una referencia proporcionada por el cliente.
- Una URL que incorpora material sensible puede aparecer en historial, registros o cabeceras de referencia. La política `Referrer-Policy` controla qué partes de la URL se transmiten como referencia; su configuración concreta dependerá de la arquitectura web elegida.

## Evidencias

- [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): entropía, generación impredecible y exposición de identificadores de sesión. Se usa como analogía de credenciales compartibles, no como especificación literal del enlace de equipo.
- [OWASP — Insecure Direct Object Reference Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html): diferencia entre conocer un identificador y estar autorizado para usar un objeto.
- [OWASP — Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): recomienda evitar el registro de tokens de acceso y otros datos sensibles.
- [MDN — Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy): comportamiento de las políticas de referencia y datos de URL que pueden compartirse.

## Restricciones

- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md) exige acceso sin registro para quien posea el enlace de un equipo vigente y estados distintos para caducado y no encontrado.
- [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md) define que la identidad elegida no acredita exclusividad ni limita a otros dispositivos.
- [RD-EQU-007 — Identificador del equipo](../../03_requisitos/03_datos/EQU/rd-equ-007-identificador-equipo.md) exige un UUID único para el equipo y un enlace único, pero no exige que la URL contenga ese UUID.
- Por decisión expresa para el piloto, [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md) no incluye invalidación ni sustitución del enlace mientras el equipo esté vigente.
- [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](../../03_requisitos/01_funcionales/EQU/rf-equ-007-invalidar-y-sustituir-enlace.md) registra esa necesidad futura. La solución del piloto debe permitir evaluar esa evolución sin dar por definidas sus reglas.
- El piloto es limitado y no prevé registro ni permisos por participante en su primera entrega.

## Unknowns

- ¿Qué material impredecible y qué formato concreto utilizará el enlace de acceso? Su separación respecto del UUID ya está decidida en [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../05_adr/adr-equ-001-separar-identidad-y-acceso.md).
- ¿Cómo se comprobará el acceso en las operaciones que leen o modifican el equipo, además de abrir su página?
- ¿Qué política de referencia, registros y almacenamiento del lado del servidor reducirá la exposición accidental del enlace?
- ¿Qué defensas proporcionadas por la infraestructura elegida se aplicarán a intentos automatizados de adivinar enlaces?

## Assumptions

No se presupone que el UUID sea el secreto de acceso, ni que vaya a existir una cuenta o contraseña en esta entrega.

## Alternativas observadas

- Usar el UUID del equipo como componente del enlace de acceso.
- Mantener el UUID como identificador interno y emitir un valor de acceso independiente, opaco e impredecible, asociado a ese equipo.

La comparación posterior está en [Alternativas — Identificador y valor de acceso en el enlace del equipo](../03_alternativas/alternativas-identificador-enlace-equipo.md). Se ha elegido separar el UUID y el valor de acceso en [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../05_adr/adr-equ-001-separar-identidad-y-acceso.md); el transporte y la verificación concretos se aprobaron en [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../05_adr/adr-equ-003-verificar-enlace-en-api.md).

## Impacto potencial

La elección afecta al contrato de acceso, al almacenamiento de los valores de enlace, a la validación de cada operación y al tratamiento de URL en registros y navegación. También determina qué habría que cambiar si más adelante se incorporan controles de acceso o recuperación.

## Conclusión factual

En el modelo de confianza vigente, quien obtiene el enlace puede acceder y actuar en el equipo. Su generación, comprobación y exposición deben tratarse como decisiones de seguridad de la primera entrega; la existencia de un UUID único no resuelve por sí sola esas decisiones.
