---
id: RNF-COO-001
estado: en_revision
---

# RNF-COO-001 — Arranque básico en menos de cinco minutos

## Requisito

En la primera entrega, una persona sin cuenta debe poder completar en menos de cinco minutos el siguiente recorrido de coordinación:

1. Crear un equipo con el primer participante y acceder al grupo.
2. Marcar la disponibilidad del primer participante para la semana natural siguiente a la fecha de verificación.
3. Crear un segundo participante y marcar también su disponibilidad para esa misma semana.
4. Volver al primer participante y crear una consulta con dos fechas de esa semana y otra consulta con dos opciones de texto.
5. Volver al segundo participante y emitir un voto en cada consulta.
6. Volver al primer participante, resolver una consulta y rechazar la otra.
7. Comprobar que el envío opcional del enlace por correo no presenta un error; este envío puede realizarse al final del recorrido.

## Contexto

Recorrido inicial completo de quien quiere poner en marcha, compartir y utilizar un espacio de coordinación sin registro previo, con dos participantes y consultas de fechas y texto.

## Métrica / umbral

El objetivo de uso humano es completar el recorrido anterior en menos de cinco minutos, desde el inicio de la creación del equipo hasta terminar la comprobación del resultado del envío opcional de correo. Como criterio automático de aceptación, un E2E benchmark que complete el mismo recorrido con WEB/API reales en menos de 150 segundos permite dar por superado este requisito sin una medición humana adicional. Si el E2E tarda 150 segundos o más, debe realizarse además una comprobación humana del recorrido completo, que deberá durar menos de cinco minutos. Un recorrido incompleto o un error funcional o de correo no supera el requisito, cualquiera que sea su duración. La disponibilidad de ambos participantes y las fechas de la consulta usan la misma semana natural siguiente a la fecha de verificación.

## Evidencia prevista

E2E benchmark Playwright del recorrido completo, con WEB/API reales y cronómetro limitado a las interacciones desde el inicio de creación hasta comprobar el resultado del correo. Un resultado inferior a 150 segundos es criterio automático de aceptación. Si no se alcanza ese umbral, una persona debe completar el mismo recorrido en menos de cinco minutos. La evaluación humana mínima prevista es una persona; la SPEC de evaluación fijará el entorno y registrará las condiciones, el tiempo y cualquier incidencia.

## Origen

Decisión expresa de quien impulsa Synqo sobre el criterio de facilidad de uso para el arranque del equipo.

## Relaciones

- [RF-EQU-001 — Crear un equipo sin registro](../../01_funcionales/EQU/rf-equ-001-crear-equipo.md)
- [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md)
- [RF-EQU-003 — Acceder al equipo por enlace](../../01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RF-DIS-001 — Marcar y modificar disponibilidad](../../01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md)
- [RF-CON-001 — Crear una consulta de fechas](../../01_funcionales/CON/rf-con-001-crear-consulta.md)
- [RF-CON-002 — Registrar y cambiar un voto](../../01_funcionales/CON/rf-con-002-votar.md)
- [RF-CON-004 — Resolver una consulta](../../01_funcionales/CON/rf-con-004-resolver-consulta.md)
- [RF-CON-005 — Crear una consulta con opciones de texto](../../01_funcionales/CON/rf-con-005-crear-consulta-texto.md)
- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md)
