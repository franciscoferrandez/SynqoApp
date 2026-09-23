# ADR-003 — SPA/PWA frente a Next.js

**Estado:** Accepted — revalidated

## Contexto
Synqo dispone de backend independiente REST/OpenAPI. La mayor parte del valor es interacción de aplicación, incluida participación por enlace. SEO no es objetivo central.

## Decisión
Usar SPA/PWA; no introducir Next.js en MVP.

## Justificación
Next.js añadiría una segunda capa de servidor sin necesidad. Si previews Open Graph dinámicas para enlaces compartidos se convierten en requisito, podrán resolverse con una superficie mínima específica sin convertir toda la aplicación a Next.js.

## Revisar si
SEO, contenido público indexable o SSR pasan a ser objetivos centrales.
