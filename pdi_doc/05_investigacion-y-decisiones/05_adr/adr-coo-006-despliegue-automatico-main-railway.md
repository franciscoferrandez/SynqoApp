---
id: ADR-COO-006
estado: aprobado
---
# ADR-COO-006 — Desplegar automáticamente desde main en Railway

## Contexto

La decisión inicial de [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](adr-coo-004-preproduccion-railway-iac.md) era publicar el código manualmente mientras la persona impulsora se familiarizaba con Railway. Después de operar la plataforma y comprobar el despliegue activo, la persona impulsora confirma que ya se siente segura gestionando Railway, que revisará la plataforma a diario durante la finalización del TFM y que quiere mantener el auto-deploy que ya ocurre con cada cambio en `main`. Considera que los gates de REL-002 están satisfechos con este flujo.

La infraestructura sigue gestionada con IaC y debe revisarse antes de aplicarla. El despliegue de aplicación y los cambios de infraestructura tienen riesgos y disparadores distintos, por lo que la automatización de uno no automatiza el otro.

## Drivers

- Reflejar el flujo real aprobado para publicar la aplicación.
- Mantener revisable el código que se despliega desde `main`.
- Aprovechar la familiaridad operativa adquirida y la revisión diaria declarada durante la etapa del TFM.
- Evitar que un push de la configuración IaC modifique por sí solo los recursos Railway.

## Opciones consideradas

| Opción | Evaluación |
|---|---|
| Despliegue manual desde el panel Railway | Era la decisión inicial; requiere intervención tras cada cambio de aplicación. |
| Autodeploy GitHub desde `main` | Coincide con el flujo actual verificado por la persona impulsora, que ahora se siente segura operando Railway y revisará el entorno a diario durante la etapa del TFM. |
| Aplicar IaC desde CI | No elegido; mantendría cambios de infraestructura fuera de la revisión manual acordada. |

## Decisión

- Railway despliega automáticamente la aplicación cuando recibe cambios en la rama `main` conectada.
- La rama `main` es el límite de publicación: antes de subir cambios a ella, se revisan el commit, las migraciones Doctrine y los efectos sobre datos persistentes.
- Los despliegues de WEB/API usan el servicio HTTP combinado aprobado en [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](adr-coo-005-topologia-web-api-railway.md).
- La infraestructura permanece separada: `railway config plan` y `railway config apply` se ejecutan manualmente, con revisión del plan y confirmación interactiva. No se automatiza IaC desde GitHub Actions.
- La decisión anterior de despliegue manual de aplicación en [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](adr-coo-004-preproduccion-railway-iac.md) queda sustituida únicamente para el disparador de publicación de la aplicación.

## Consecuencias positivas

- La aplicación publicada sigue a `main` sin una segunda acción de despliegue en el panel.
- La infraestructura conserva una revisión manual independiente.

## Consecuencias negativas

- Cualquier commit que llegue a `main` puede iniciar un build y despliegue; una revisión incompleta puede publicar cambios defectuosos.
- Cada despliegue automático ejecuta la migración pre-deploy configurada; cambios incompatibles o destructivos requieren análisis antes de llegar a `main`.
- Volver a una imagen previa no revierte una migración ni restaura datos.

## Evidencia / Research

Decisión humana reportada el 2026-10-12 y reafirmada posteriormente: la persona impulsora confirma que cada subida a `main` inicia el despliegue, que ya se siente segura manejando Railway y que revisará el entorno diariamente mientras finaliza el TFM. Considera satisfechos los gates de REL-002. El procedimiento actualizado se mantiene en [Operación de Railway para REL-002](../../09_operacion/01_despliegue/railway-rel-002.md). La documentación de Railway describe los [despliegues automáticos desde GitHub](https://docs.railway.com/deployments/github-autodeploys).

## Sustituye

La decisión de publicación manual de aplicación de [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](adr-coo-004-preproduccion-railway-iac.md). El resto de ADR-COO-004 permanece vigente.

## Sustituido por

—
