---
id: WF-EQU-004
estado: en_revision
---

# WF-EQU-004 — Enlace de equipo no encontrado

## Flujo

[FLUJO-EQU-001 — Entrar en un equipo y elegir identidad](../02_flujos/flujo-equ-001-entrar-equipo.md).

## Estado representado

La persona abre un enlace que no identifica ningún equipo. Se presenta el mismo estado si el enlace es incorrecto, nunca existió o pertenecía a un equipo borrado definitivamente. La pantalla no permite distinguir esos casos.

## Jerarquía

```text
┌──────────────────────────────────────────┐
│ No encontramos este equipo               │
│                                          │
│ Comprueba que hayas abierto el enlace    │
│ completo.                                │
└──────────────────────────────────────────┘
```

## Acciones

- Entender que el enlace no permite entrar en un equipo y comprobar si se abrió completo.

## Notas

**DEFINIDO:** un mismo mensaje sin datos ni historial del equipo para enlaces inexistentes y enlaces de equipos borrados, según [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md). **PROPUESTO:** redacción complementaria y disposición visual. Mientras el equipo solo esté caducado se usa [WF-EQU-003 — Equipo caducado](wf-equ-003-equipo-caducado.md).
