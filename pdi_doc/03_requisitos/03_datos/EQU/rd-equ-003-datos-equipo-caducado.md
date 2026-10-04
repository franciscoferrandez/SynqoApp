---
id: RD-EQU-003
estado: en_revision
---

# RD-EQU-003 — Datos del equipo caducado

## Dato / información

Conjunto de datos pertenecientes a un equipo rápido, incluidas identidades de participante, disponibilidades, consultas, opciones, votos y resoluciones.

## Significado

Estos datos dejan de ser accesibles al caducar el equipo y se eliminan de la base activa tras el plazo adicional definido en [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).

## Integridad

La caducidad afecta al equipo y al acceso a todos sus datos; el borrado posterior de la base activa comprende el conjunto completo de datos pertenecientes a ese equipo.

## Retención / ciclo de vida

Después de la caducidad, el plazo adicional de borrado de la base activa es inicialmente de 90 días y se puede configurar internamente o mediante el entorno de la aplicación. La fecha de borrado deriva de la caducidad efectiva, no de la última lectura del equipo. Los datos que aún figuren en copias de seguridad desaparecen al vencer el plazo de conservación de estas; la duración concreta sigue pendiente de definir.

## Privacidad

Los datos del equipo caducado no están disponibles mediante su enlace de acceso.

## Origen

- [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md)
