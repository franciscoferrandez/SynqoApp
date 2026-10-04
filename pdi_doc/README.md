# Documentación del proyecto

**Proyecto:** Synqo  
**Escenario inicial:** greenfield  
**Idioma:** castellano  
**Playbook documental:** `<PDI_ROOT>/playbooks/01_playbook-documentacion.md`  
**Playbook de implementación:** `<PDI_ROOT>/playbooks/02_playbook-implementacion.md`

## Inicio

La primera acción recomendada es:

```text
pdi:product-continue
```

## Raíz de PDI

`<PDI_ROOT>` indica la carpeta del plugin PDI instalado o cargado. Sus playbooks y plantillas se consultan allí; no se copian al proyecto.

## Fuente de verdad

El Product Baseline es el conjunto de artefactos normativos vigentes dentro de esta estructura. No incluye automáticamente SPEC históricas, research descartado o artefactos de delivery.

## Navegación

```text
00_gobierno                 reglas del sistema documental
01_producto                 problema, visión, alcance y entregas
02_dominio                  lenguaje y modelo conceptual
03_requisitos               RF, RN, RD, RNF, restricciones y calidad
04_experiencia-usuario      UX/UI
05_investigacion-y-decisiones research, RFC y ADR
06_arquitectura             arquitectura, módulos y tecnologías
07_desarrollo               reglas de implementación globales y por módulo
08_especificaciones         Change Specs activas/archivadas si no hay motor externo
09_operacion                despliegue y operación
10_historial                memoria de cambios relevantes y documentación histórica
```

## Regla para agentes

Antes de trabajar en una carpeta, lee su `README.md`.

## Estado inicial

Consulta `00_gobierno/02_estado-documentacion.md`.

## Trabajo de fin de máster

El [registro de ayuda de la IA a la toma de decisiones](../doc/tfm/registro-decisiones-ia.md) documenta hitos breves de su uso en Synqo. Es un registro de evaluación del proceso, no una fuente normativa del producto.
