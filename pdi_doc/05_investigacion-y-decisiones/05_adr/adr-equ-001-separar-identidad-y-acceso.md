---
id: ADR-EQU-001
estado: aprobado
---

# ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso

## Contexto

Cada equipo tiene un UUID que lo identifica durante su ciclo de vida. En la primera entrega, quien dispone del enlace puede acceder sin registro. En una entrega futura será necesario invalidar ese enlace y sustituirlo sin crear otro equipo.

## Drivers

- [RD-EQU-007 — Identificador del equipo](../../03_requisitos/03_datos/EQU/rd-equ-007-identificador-equipo.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](../../03_requisitos/01_funcionales/EQU/rf-equ-007-invalidar-y-sustituir-enlace.md)
- [Drivers arquitectónicos de la primera entrega](../../06_arquitectura/01_drivers-arquitectonicos/drivers-primera-entrega.md)

## Opciones consideradas

La [comparación de identificador y valor de acceso](../03_alternativas/alternativas-identificador-enlace-equipo.md) evalúa usar el UUID como único valor compartido, usar un valor opaco independiente o combinar ambos en el enlace.

## Decisión

**Aprobado por la persona que impulsa Synqo:** el UUID o ID del equipo y el valor que concede acceso mediante el enlace son conceptos separados. El término «hash del enlace» usado inicialmente para expresar esta distinción no especificaba el transporte ni la verificación; esos detalles ya se aprobaron en [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](adr-equ-003-verificar-enlace-en-api.md).

El UUID del equipo será un identificador estable interno y no bastará por sí solo para acceder al equipo. El enlace compartido contendrá un valor de acceso opaco, impredecible e independiente del UUID, que el sistema asociará al equipo. Cada operación que lee o modifica datos del equipo deberá comprobar que el valor presentado sigue concediendo acceso a ese equipo vigente.

Esta decisión no introduce cuentas ni convierte la identidad de participante elegida en una credencial exclusiva. Tampoco incorpora la acción futura de sustituir el enlace al primer piloto.

## Consecuencias positivas

- La identidad del equipo permanece estable cuando más adelante se invalide un valor de acceso y se emita otro.
- La comprobación de acceso se expresa de forma separada de la localización del equipo.

## Consecuencias negativas

- Hay que generar, conservar o verificar y proteger un valor adicional durante todo su ciclo de vida.
- La interfaz debe poder volver a copiar y compartir el enlace y el envío asíncrono necesita el valor original temporalmente. La forma de resolver ambos casos pertenece a decisiones posteriores.

## Evidencia / Research

- [RESR-EQU-002 — ¿Qué implica conceder acceso al equipo mediante un enlace?](../01_research/resr-equ-002-enlace-como-acceso-al-equipo.md)
- [Comparación de identificador y valor de acceso](../03_alternativas/alternativas-identificador-enlace-equipo.md)

## Pendiente

El formato y transporte del enlace, su entropía y el verificador se concretan en [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](adr-equ-003-verificar-enlace-en-api.md). Quedan por concretar los controles de exposición para un piloto publicado, el paso temporal del enlace al evento de correo y las reglas para accesos ya iniciados tras una sustitución futura.

## Sustituye

Ninguna decisión anterior.

## Sustituido por

No aplica.
