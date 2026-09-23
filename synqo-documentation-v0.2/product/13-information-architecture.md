# 13 — Arquitectura de información

## Niveles

```text
NIVEL GLOBAL
├── Inicio
├── Equipos
└── Cuenta

NIVEL EQUIPO
├── Inicio
├── Disponibilidad
├── Decisiones
├── Histórico
└── Configuración [administrable]
```

Un visitante que llega por deep link no debe pasar por el nivel global si no lo necesita.

## Inicio global

Prioriza **pendientes** y equipos vinculados. No se diseña como panel estadístico.

## Inicio de equipo

Responde «¿qué requiere mi atención aquí?» e incluye pendientes, actividad relevante, coincidencias y acceso a creación/compartición.

## Disponibilidad

- Mi disponibilidad
- Disponibilidad colectiva
- Solicitudes

Mi disponibilidad y la colectiva comparten dos representaciones: `Calendario | Lista`.

## Decisiones

Etiqueta UX candidata que contiene Propuestas y Encuestas. `Consulta` sigue siendo el término de dominio.

## Histórico

Muestra resoluciones y cancelaciones previas con acceso a detalle, no una auditoría técnica completa.

## Configuración administrable

- General
- Disponibilidad
- Permisos
- Participantes
- Acceso y seguridad
- Administración

## Navegación móvil candidata

`Inicio | Disponibilidad | Decisiones | Más`.

## Deep links

Equipo, solicitud, propuesta y encuesta deben ser direccionables directamente mientras existan. Un enlace para responder debe llevar lo más cerca posible de la acción y preservar identidad válida cuando corresponda.
