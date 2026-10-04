---
id: RD-EQU-002
estado: en_revision
---

# RD-EQU-002 — Fecha prevista de caducidad del equipo

## Dato / información

Fecha prevista de caducidad del equipo rápido, determinada por el inicio del plazo en su creación o por la modificación más reciente que lo reinició.

## Significado

Indica cuándo caducará el equipo tras tres meses naturales si no hay más modificaciones. La fecha calculada es el último día de vigencia en la zona del equipo y la caducidad ocurre a las 00:00 del día siguiente en esa zona. Debe mostrarse en la pantalla del equipo vigente.

## Integridad

La fecha se actualiza ante toda modificación que cuenta como actividad según [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md); abrir el enlace sin modificar nada no la altera. La forma de persistir el instante de última actividad no se prescribe aquí.

Al crear el equipo se intenta obtener su zona horaria y, si falla, se usa Europe/Madrid. El usuario no ve ni cambia esa zona. La fecha se presenta en la zona del dispositivo de quien la consulta o, si no se obtiene, en la del equipo.

## Retención / ciclo de vida

Se utiliza mientras el equipo está vigente. Al caducar, sus datos quedan inaccesibles y se eliminan según [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Privacidad

Visible para los usuarios con acceso al equipo.

## Origen

- [HU-EQU-005 — Conocer la caducidad prevista del equipo](../../../01_producto/07_historias-usuario/hu-equ-005-conocer-caducidad.md)

## Relaciones

- [RF-EQU-004 — Mostrar la fecha prevista de caducidad](../../01_funcionales/EQU/rf-equ-004-mostrar-caducidad.md)
- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md)
- [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md)
