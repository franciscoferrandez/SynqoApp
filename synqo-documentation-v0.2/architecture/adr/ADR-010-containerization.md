# ADR-010 — Docker como artefacto de despliegue

**Estado:** Accepted

## Contexto
Aunque el desarrollo se realiza en host, se desea una unidad de despliegue reproducible y portable.

## Alternativas consideradas
- Docker image.
- Deploy directo con `node dist/main.js`.

## Decisión
Construir una imagen Docker para producción.

## Justificación
Docker fija runtime, dependencias y build y permite mover la aplicación entre proveedores sin rediseñar el deployment.

## Consecuencias
### Positivas
- Reproducibilidad.
- Portabilidad.
- CI/CD sencillo.

### Negativas / trade-offs
- Añade build de imagen.
- Requiere mantener Dockerfile.

## Condiciones para revisar la decisión
Ninguna prevista a corto plazo; el proveedor puede ejecutar la imagen o sustituirse por deploy nativo sin afectar a la arquitectura de aplicación.
