---
id: RF-EQU-005
estado: en_revision
---

# RF-EQU-005 — Eliminar los datos del equipo caducado

## Requisito

El sistema debe impedir el acceso a un equipo rápido desde su caducidad y eliminar de la base activa todos los datos que le pertenecen al finalizar el plazo adicional de borrado configurado.

## Origen

Decisión expresa de quien impulsa Synqo sobre la eliminación posterior de equipos rápidos.

## Precondiciones

El equipo ha caducado.

## Criterios de aceptación

- Desde la caducidad, el enlace ya no permite acceder a los datos del equipo.
- Con el valor inicial de configuración, todos los datos del equipo se eliminan de la base activa al transcurrir 90 días desde la caducidad.
- El plazo puede cambiarse mediante configuración interna o del entorno de la aplicación.
- Los datos que aún figuren en copias de seguridad desaparecen cuando vence el plazo de conservación de esas copias.

## Casos límite

La caducidad del equipo no se revierte durante el plazo previo al borrado. El plazo concreto de conservación de las copias y la prevención de reaparición de equipos borrados tras una restauración quedan por definir en arquitectura y operación.

## Relaciones

- [RN-EQU-003 — Borrado de equipos caducados](../../02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md)
- [RD-EQU-003 — Datos del equipo caducado](../../03_datos/EQU/rd-equ-003-datos-equipo-caducado.md)
