---
id: WF-EVT-003
estado: en_revision
---

# WF-EVT-003 — Eventos en el calendario

## Flujo

[FLUJO-EVT-002 — Consultar eventos desde el calendario](../02_flujos/flujo-evt-002-consultar-eventos-calendario.md); [FLUJO-DIS-001 — Marcar disponibilidad en el calendario](../02_flujos/flujo-dis-001-marcar-disponibilidad.md).

## Estado representado

Equipo vigente bajo una identidad seleccionada. La persona está en el calendario existente, con su detalle del día cerrado o abierto. Las casillas conservan las preferencias y la información de disponibilidad que ya ofrece el calendario.

## Jerarquía

En las casillas con uno o más eventos no rechazados se añade el indicador acordado en la esquina superior derecha. El estado de la casilla sigue mostrando la información de disponibilidad existente.

```text
Calendario:

┌─────────────┐  ┌─────────────┐
│  12      ♧  │  │  13      ♧2 │
│ ✓ Disp.     │  │ × No disp.  │
│             │  │             │
└─────────────┘  └─────────────┘

Detalle del día elegido en móvil (se amplía el diálogo existente):

┌──────────────────────────────────┐
│ DETALLE DEL DÍA              [×] │
│ miércoles, 12 de octubre de 2026 │
│                                  │
│ [Información de disponibilidad  ]│
│                                  │
│ Eventos                          │
│ [Título del evento →] [Provisional]│
│ [Título del evento →] [Definitivo]│
│     (área desplazable si hace falta)│
└──────────────────────────────────┘
```

La campanita es solo un indicador; no introduce un control aparte. Activar la casilla del día abre el detalle con la interacción ya existente. El título abre la ficha completa del evento. Los eventos se muestran en el mismo orden que en la pestaña «Eventos». En escritorio se amplía el panel de detalle actual con la misma información; en móvil se conserva el diálogo actual.

Si falla la lectura de eventos después de cargar la disponibilidad, el detalle mantiene disponible la información ya cargada y muestra un aviso con una acción que reintenta únicamente los eventos:

```text
Eventos
No se pudieron cargar los eventos.
[Reintentar eventos]
```

## Acciones

- Activar un día mediante la interacción existente del calendario y consultar su detalle.
- Cerrar el detalle móvil y volver al calendario.
- Ver una campanita en los días con eventos no rechazados; si hay más de uno, ver también el contador.
- Consultar el título y el estado de los eventos provisionales con fecha y definitivos de ese día, ordenados como en la pestaña «Eventos».
- Abrir la ficha completa activando el título.
- Si hay muchos eventos, recorrer su área desplazable dentro del detalle.
- Si falla la lectura de eventos, reintentarla sin volver a cargar la disponibilidad.
- Durante la composición de una consulta de fechas, conservar la acción existente de seleccionar o retirar días; la campanita no sustituye esa interacción.
- No mostrar eventos rechazados en el contador ni en el detalle. La pestaña Eventos conserva el acceso a los rechazados.

## Estado sin eventos

No se muestra campanita ni contador para un día sin eventos no rechazados. En el detalle del día se omite el bloque «Eventos» y se conserva la información de disponibilidad.

## Notas

**DEFINIDO por requisitos:** posición de la campanita en la esquina superior derecha de la casilla; contador cuando hay más de un evento no rechazado; inclusión de eventos provisionales con fecha y definitivos; exclusión de rechazados de contador y detalle, conforme a [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md).

**DEFINIDO por decisión de producto:** detalle con título y estado, título enlazado a la ficha completa, mismo orden de la pestaña Eventos, bloque omitido cuando no haya eventos, campanita indicativa y activación del día con la interacción existente. Si hay muchos eventos, la lista dispone de un área desplazable; ante fallo de lectura, se conserva la disponibilidad y se puede reintentar solo eventos.

El detalle conserva la estructura existente descrita en [WF-DIS-001 — Calendario inicial del equipo](wf-dis-001-calendario-equipo.md).
