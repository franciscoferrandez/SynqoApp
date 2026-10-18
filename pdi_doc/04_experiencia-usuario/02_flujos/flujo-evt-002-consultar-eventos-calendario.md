---
id: FLUJO-EVT-002
estado: en_revision
---

# FLUJO-EVT-002 — Consultar eventos desde el calendario

## Actor

Una persona con acceso al equipo vigente, bajo una identidad de participante seleccionada.

## Entrada

La persona abre el calendario del equipo o elige un día para consultar su detalle.

## Precondiciones

- El equipo está vigente y la persona tiene acceso.
- Los eventos con fecha se gestionan según [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md) y se consultan desde la sección Eventos según [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md).

## Pasos

1. La persona recorre el calendario y localiza las casillas que muestran una campanita. Si el día tiene más de un evento no rechazado, la campanita incluye el contador.
2. La persona activa el día mediante toque, ratón o teclado. La activación sigue el comportamiento existente del calendario: abre el detalle del día, como diálogo sobre el calendario en móvil.
3. Synqo muestra en el detalle el título y el estado de cada evento no rechazado con fecha en ese día, incluidos los provisionales y definitivos. Ordena los eventos igual que en la pestaña «Eventos» y no muestra los rechazados.
4. La persona puede abrir la ficha completa activando el título de un evento.
5. Si no hay eventos, Synqo omite el bloque «Eventos» y mantiene el detalle de disponibilidad.
6. Si no se pueden cargar los eventos, Synqo conserva la disponibilidad ya cargada, muestra un aviso en el espacio de eventos y ofrece reintentar solo la lectura de eventos.
7. La persona cierra el detalle y vuelve al calendario conservando el día consultado.

## Resultado

La persona puede reconocer los días con eventos no rechazados y consultar sus datos desde el detalle del día. La consulta no cambia la disponibilidad ni los datos del evento.

## Errores

- Si los eventos no se pueden cargar, la disponibilidad ya cargada sigue visible y el detalle permite reintentar solo la lectura de eventos.
- Si el equipo ha caducado mientras se consultan los datos, se presenta el estado del equipo según el flujo existente de acceso.
- Si el evento deja de estar disponible mientras el detalle está abierto, se refresca la información o se muestra el error correspondiente; el comportamiento exacto se concreta en la SPEC.

## Cancelación

Cerrar el detalle vuelve al calendario sin alterar la disponibilidad ni los eventos. La campanita es solo indicativa; activar la casilla del día abre el detalle con la interacción existente. Si hay muchos eventos, su lista usa un área desplazable dentro del detalle. La disponibilidad se mantiene visible y el reintento consulta solo eventos.

## RF/RN relacionados

- [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md)
- [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md)
- [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md)
- [RF-DIS-002 — Consultar el visor de disponibilidad](../../03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md)
- [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md)
