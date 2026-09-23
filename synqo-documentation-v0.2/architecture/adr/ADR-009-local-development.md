# ADR-009 — Desarrollo local fuera de contenedores

**Estado:** Accepted

## Contexto
Se desea un ciclo de desarrollo rápido. Experiencias anteriores con frameworks dentro de Docker han mostrado degradación por filesystem/bind mounts.

## Alternativas consideradas
- Ejecutar web y API directamente en host.
- Ejecutar todo en Docker Compose.

## Decisión
Ejecutar frontend y backend en host. Usar Docker Compose para infraestructura local (PostgreSQL y Mailpit).

## Justificación
Los watchers y compiladores trabajan sobre filesystem nativo. Docker sigue aportando reproducibilidad para infraestructura sin penalizar el feedback loop.

## Consecuencias
### Positivas
- Menor latencia en desarrollo.
- Setup simple.
- Menos problemas de volúmenes.

### Negativas / trade-offs
- Node/pnpm deben estar instalados en host.
- Dev y prod no ejecutan exactamente el mismo proceso.

## Condiciones para revisar la decisión
Revisar si el equipo crece y la reproducibilidad local pasa a pesar más que la velocidad del ciclo.
