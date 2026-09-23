# ADR-011 — Hosting inicial en Railway

**Estado:** Accepted

## Contexto
El MVP debe tener coste bajo, poca operación y despliegue sencillo. No se desea administrar servidores, TLS, backups ni sistemas complejos.

## Alternativas consideradas
- Railway.
- Render.
- VPS propio.
- AWS/Azure/GCP directo.
- Cloudflare/Vercel para frontend separado.

## Decisión
Usar Railway inicialmente para el servicio web y PostgreSQL.

## Justificación
Railway encaja con Docker, monorepos y configuración como código y reduce carga operativa para una aplicación de tamaño inicial pequeño.

## Consecuencias
### Positivas
- Puesta en producción rápida.
- Menor operación.
- PostgreSQL gestionado.
- Posible config-as-code.

### Negativas / trade-offs
- Dependencia del proveedor.
- El coste puede crecer con uso.
- Menor control que un VPS.

## Condiciones para revisar la decisión
Revisar cuando el coste, necesidades de red, compliance o escala justifiquen migrar a otro proveedor.
