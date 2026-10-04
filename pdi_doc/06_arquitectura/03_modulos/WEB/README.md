---
modulo: WEB
---

# WEB

> Contrato del módulo WEB para la demo local. Los contratos HTTP se concretarán antes de conectar operaciones reales con la API.

## Propósito

Presentar con Angular en navegador los recorridos de [REL-001 — Demo local operativa de Synqo](../../../01_producto/10_entregas/rel-001-demo-local-operativa.md) conforme a los mockups y criterios de accesibilidad. La estructura tecnológica está fijada en [ADR-COO-001 — Separar interfaz web y API para la demo local](../../../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md).

## Responsabilidades

- Rutas y estados de creación, confirmación, equipo, calendario y consultas.
- Layout exterior compartido por todas las páginas y, dentro de él, estructura adicional del equipo vigente con contenido de Calendario y Consultas insertado según la [estructura inicial del equipo](../../../04_experiencia-usuario/01_arquitectura-informacion/estructura-equipo.md).
- Tema recordado, identidad activa recordada por equipo y enlace completo disponible para copiar o compartir.
- Cambios visuales inmediatos con restauración y reintento cuando falle una operación.
- Interacciones de teclado, foco, anuncios y adaptación móvil.

La presentación separa interacción, estado visual y acceso a la API sin replicar el modelo autoritativo del servidor, conforme a [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md).

## No responsabilidades

No calcula de forma autoritativa caducidad, recuentos o resolución ni decide qué operaciones concede un enlace. No persiste datos compartidos como fuente de verdad.

## Dependencias permitidas

Cuando presenta datos reales del equipo, los obtiene únicamente de la API del módulo [API](../API/README.md). Puede ejecutarse sin esa integración durante la construcción inicial del layout y la navegación visual. No accede a PostgreSQL.

## Interfaces / contratos

El navegador presentará el valor de acceso separado del UUID conforme a [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../../../05_investigacion-y-decisiones/05_adr/adr-equ-001-separar-identidad-y-acceso.md). Su ubicación en el fragmento y transporte hacia la API están decididos en [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). Las rutas de vista previa visual no representan enlaces de acceso ni procesan datos compartidos.

El cliente HTTP consumirá recursos JSON y errores Problem Details según [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md). La [convención HTTP común](../API/convencion-http.md) fija cómo interpretar los códigos; las SPEC y OpenAPI concretan las respuestas de cada operación.

## Datos

Estado transitorio de interfaz, selección de identidad y preferencia de tema en el navegador. Los votos, las disponibilidades y las consultas se leen de la API.

## Riesgos

Perder el valor del enlace durante navegación o recarga; mostrar estado optimista incorrecto; perder foco o contexto accesible al abrir diálogos y actualizar listas.

## ADR aplicables

[ADR-COO-001 — Separar interfaz web y API para la demo local](../../../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md), [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md) y [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).

## Reglas de desarrollo

Véase [WEB — reglas de implementación](../../../07_desarrollo/08_modulos/WEB/README.md).
