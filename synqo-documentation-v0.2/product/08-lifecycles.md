# 08 — Ciclos de vida

## Equipo rápido

```mermaid
stateDiagram-v2
    [*] --> Active
    Active --> Recoverable: periodo de inactividad
    Recoverable --> Active: actividad humana válida / reactivación
    Recoverable --> Expired: segundo periodo sin actividad
    Expired --> [*]: tratamiento definitivo según política de datos
```

Los plazos concretos y la definición exacta de actividad válida están abiertos (`OPEN-01`, `OPEN-02`). Vincular el equipo a una cuenta no altera este ciclo.

## Equipo administrable

```mermaid
stateDiagram-v2
    [*] --> PendingVerification
    PendingVerification --> Active: email administrativo verificado
    Active --> Archived: futuro / si se implementa
    Archived --> Active: futuro / si se implementa
```

La inactividad ordinaria no provoca expiración automática.

## Solicitud de disponibilidad

```mermaid
stateDiagram-v2
    [*] --> Open
    Open --> Closed: cierre explícito o deadline
    Closed --> [*]
```

`Draft` puede ser únicamente un estado de interfaz y no obliga a persistencia.

## Consulta

La consulta se representa mediante dos ejes:

```text
participation: OPEN | CLOSED
resolution:    PENDING | RESOLVED | CANCELLED
```

Combinaciones válidas:

| Participación | Resolución | Interpretación |
|---|---|---|
| OPEN | PENDING | consulta en curso |
| CLOSED | PENDING | ya no admite respuestas; esperando decisión |
| CLOSED | RESOLVED | decisión final registrada |
| CLOSED | CANCELLED | cancelada conservando histórico |

Resolver o cancelar fuerza `CLOSED`.
