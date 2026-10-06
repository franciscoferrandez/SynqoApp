# Integración para el envío opcional del enlace

## Propósito

Ejecutar el único intento de correo después de crear el equipo, sin retener la dirección como dato del equipo y sin bloquear la respuesta de creación.

## Contrato decidido

[ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md) establece un evento transitorio confirmado junto con el equipo y procesado posteriormente. La integración presenta a la aplicación un resultado satisfactorio solo cuando el adaptador confirma el éxito de su intento. Cualquier falta de confirmación se registra como error según [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md).

## Datos temporales

La dirección se elimina al finalizar o vencer el intento, conforme a [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md). Dada la separación entre UUID y valor de acceso aprobada en [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../../05_investigacion-y-decisiones/05_adr/adr-equ-001-separar-identidad-y-acceso.md), el evento necesitará material transitorio protegido para construir el enlace. Su realización y pruebas se concretan en [SPEC-EQU-003 — Envío opcional del enlace del equipo por correo](../../08_especificaciones/99_archivadas/spec-equ-003-envio-opcional-enlace-correo.md).

## Límites de realización

El proveedor local, los tiempos máximos, la ejecución del procesador, la reclamación exclusiva, el contrato de errores del adaptador, la consulta privada del resultado desde el navegador creador y las medidas de limpieza verificables se preparan en [SPEC-EQU-003 — Envío opcional del enlace del equipo por correo](../../08_especificaciones/99_archivadas/spec-equ-003-envio-opcional-enlace-correo.md). La [comparación de envío](../../05_investigacion-y-decisiones/03_alternativas/alternativas-envio-correo-equipo.md) conserva la evaluación histórica de opciones.
