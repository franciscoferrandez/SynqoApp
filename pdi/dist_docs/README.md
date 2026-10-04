# Documentación del proyecto

Esta carpeta contiene el Product Baseline y la documentación del proyecto. Su ubicación se configura mediante `pdi:init` y se guarda en `.pdi/config.json`; sin ese archivo se usa `pdi_doc/` por defecto.

## Inicio

Ejecuta `pdi:product-continue` después de definir el problema y la visión del producto.

## Raíz de PDI

`<PDI_ROOT>` indica la carpeta del plugin PDI instalado o cargado. Sus playbooks y plantillas se consultan allí; no se copian al proyecto.

## Fuente de verdad

El Product Baseline está formado por los artefactos normativos vigentes de esta carpeta. Las plantillas de `<PDI_ROOT>/templates/` y las skills no son fuente de verdad del producto.

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
08_especificaciones         Change Specs activas/archivadas
09_operacion                despliegue y operación
10_historial                memoria de cambios relevantes
```

Antes de trabajar en una carpeta, lee su `README.md`. Consulta `00_gobierno/02_estado-documentacion.md` para conocer el estado actual.
