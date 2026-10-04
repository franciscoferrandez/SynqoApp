---
id: WF-EQU-001
estado: en_revision
---

# WF-EQU-001 — Elección de identidad al entrar

## Flujo

[FLUJO-EQU-001 — Entrar en un equipo y elegir identidad](../02_flujos/flujo-equ-001-entrar-equipo.md).

## Estado representado

El navegador no recuerda ninguna identidad para el equipo vigente. La elección o creación es obligatoria antes de ver su contenido. Si excepcionalmente no existe ningún participante, solo se ofrece crear uno hasta cumplir [RN-EQU-005 — Equipo con al menos un participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md).

## Jerarquía

```text
┌──────────────────────────────────┐
│ Entrar en el equipo              │
│                                  │
│ ¿Con quién participas?           │
│                                  │
│ Identidades existentes           │
│ [Participante A]                 │
│ [Participante B]                 │
│                                  │
│ Crear otra identidad             │
│ [Nombre                     ]    │
│ [Continuar                 ]     │
└──────────────────────────────────┘
```

## Acciones

- Seleccionar una identidad existente o crear una nueva con un nombre de hasta 50 caracteres.
- Ante un nombre duplicado según [RN-EQU-004 — Nombre de participante único en el equipo](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md), solicitar otro sin avanzar.
- Tras elegir, recordar la selección para ese equipo en el dispositivo y abrir el calendario.
- Si no hay participantes, mantener la selección o creación como diálogo obligatorio hasta que se cree uno y no mostrar el contenido operativo.

## Notas

**DEFINIDO:** elección previa al contenido si no hay identidad recordada. **PROPUESTO:** disposición de lista, campo y acción de continuar; se revisará con el flujo real y el tamaño de pantalla. Un equipo caducado no muestra esta entrada como camino de acceso a su contenido.

## Cambio de identidad desde el equipo

**DEFINIDO:** al activar la identidad de la cabecera se abre un diálogo con las identidades existentes y la opción de crear una nueva. Seleccionar o crear cambia la identidad activa y la selección recordada para ese equipo según [RF-EQU-002 — Incorporarse y elegir identidad de participante](../../03_requisitos/01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md). El flujo del diálogo es el mismo en móvil y escritorio. Un nombre duplicado se rechaza según [RN-EQU-004 — Nombre de participante único en el equipo](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md).
