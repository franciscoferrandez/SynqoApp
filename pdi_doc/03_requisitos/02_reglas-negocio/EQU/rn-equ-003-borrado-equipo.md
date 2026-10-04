---
id: RN-EQU-003
estado: en_revision
---

# RN-EQU-003 — Borrado de equipos caducados

## Regla

Al caducar, un equipo rápido queda inaccesible. Transcurridos 90 días desde la caducidad, se eliminan todos sus datos de la base activa. El plazo de borrado debe ser configurable internamente o mediante el entorno de la aplicación; 90 días es su valor inicial. Los datos que aún figuren en copias de seguridad desaparecen al vencer el plazo de conservación de esas copias. La caducidad no puede revertirse durante la espera hasta el borrado.

## Justificación

El equipo rápido no se recupera en esta fase y sus datos no deben permanecer indefinidamente después de dejar de ser accesibles.

## Casos límite

- El plazo se mide en días, no en meses naturales. No se ha definido un control de configuración para los usuarios del equipo.
- «Todos sus datos» incluye los datos pertenecientes al equipo, como identidades de participante, disponibilidades, consultas, opciones, votos y resoluciones. El borrado de la base activa no exige eliminar de forma individual los datos del equipo dentro de cada copia de seguridad; el plazo de conservación de las copias y las medidas para evitar que una restauración reactive equipos ya borrados se concretarán en arquitectura y operación.
- Tras el borrado, el enlace ya no identifica un equipo accesible; la presentación del enlace se especifica en [RF-EQU-003 — Acceder al equipo por enlace](../../01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md).

## Origen

Decisiones expresas de quien impulsa Synqo sobre inaccesibilidad, borrado posterior de los equipos rápidos y tratamiento de sus datos en copias de seguridad.

## Relaciones

- [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](rn-equ-002-caducidad-equipo.md)
- [RD-EQU-003 — Datos del equipo caducado](../../03_datos/EQU/rd-equ-003-datos-equipo-caducado.md)
- [RF-EQU-005 — Eliminar los datos del equipo caducado](../../01_funcionales/EQU/rf-equ-005-eliminar-equipo-caducado.md)
