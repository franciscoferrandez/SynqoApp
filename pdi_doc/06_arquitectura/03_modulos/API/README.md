---
modulo: API
---

# API

> Contrato de responsabilidades del módulo API para la demo local. Las operaciones actuales y sus esquemas se concretan en OpenAPI y en las SPEC de cada capacidad.

## Propósito

Aplicar con Symfony y API Platform las reglas compartidas de equipo, disponibilidad y consultas de [REL-001 — Demo local operativa de Synqo](../../../01_producto/10_entregas/rel-001-demo-local-operativa.md) y conservar sus datos en PostgreSQL. La estructura tecnológica está fijada en [ADR-COO-001 — Separar interfaz web y API para la demo local](../../../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md).

## Responsabilidades

- Crear equipos y participantes; validar nombres y acceso.
- Calcular vigencia, caducidad y borrado con la zona horaria del equipo.
- Registrar marcas, consultar calendario y recuentos.
- Crear consultas, registrar votos públicos y resolverlas.
- Entregar resultados y errores consistentes a WEB.
- Registrar transaccionalmente la petición de envío opcional del enlace, procesar un único intento y ofrecer su resultado al navegador creador conforme a [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md).
- Publicar la capacidad efectiva de correo de creación para WEB y aplicar la misma bandera en creación y en el worker, conforme a [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md).

El núcleo de reglas y casos de uso se mantiene independiente del transporte y de Doctrine según [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md). Los proveedores y procesadores de API Platform adaptan las operaciones HTTP; la persistencia implementa las fronteras que los casos de uso necesiten.

## No responsabilidades

No conserva preferencias visuales del navegador ni decide el aspecto de las pantallas. El módulo no determina la presentación visual del correo ni garantiza su entrega al buzón.

## Dependencias permitidas

PostgreSQL para estado persistente. Ninguna dependencia de componentes de WEB.

## Interfaces / contratos

Toda operación relativa a un equipo debe respetar la separación entre UUID y acceso de [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../../../05_investigacion-y-decisiones/05_adr/adr-equ-001-separar-identidad-y-acceso.md) y la verificación de [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). Según [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md), [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md), los recursos usan JSON, los errores Problem Details y OpenAPI es la referencia principal del contrato. La [convención HTTP común](convencion-http.md) fija códigos y formato reutilizables; cada SPEC concreta los que aplican a sus operaciones, cuerpos y tipos de problema.

En REL-002, Symfony se servirá bajo `/api` desde el servicio HTTP combinado FrankenPHP/Caddy que también publica la WEB, según [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](../../../05_investigacion-y-decisiones/05_adr/adr-coo-005-topologia-web-api-railway.md). Esta es una decisión de empaquetado para Railway, no una dependencia lógica de API respecto de WEB. El proxy de desarrollo local y los límites de módulo se conservan.

## Datos

Equipo, verificador de acceso, participantes, disponibilidad diaria, consultas, opciones, votos y resolución. Para el envío opcional, solo datos transitorios del intento y su resultado sin dirección tras finalizarlo, conforme a [RD-EQU-005 — Correo transitorio para enviar el enlace](../../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md). El esquema y sus restricciones se detallarán antes de implementar cada capacidad.

## Riesgos

Carreras entre cambios simultáneos, cálculo de fechas y zonas horarias, duplicados normalizados, resolución tras votos, exposición del valor de acceso y borrado incompleto.

## ADR aplicables

[ADR-COO-001 — Separar interfaz web y API para la demo local](../../../05_investigacion-y-decisiones/05_adr/adr-coo-001-estructura-demo-local.md), [ADR-COO-002 — Separar el dominio con arquitectura limpia y DDD pragmático](../../../05_investigacion-y-decisiones/05_adr/adr-coo-002-arquitectura-limpia-y-ddd-pragmatico.md), [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md), [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../../../05_investigacion-y-decisiones/05_adr/adr-equ-001-separar-identidad-y-acceso.md), [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../../../05_investigacion-y-decisiones/05_adr/adr-equ-002-evento-transaccional-correo.md) y [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md).

## Reglas de desarrollo

Véase [API — reglas de implementación](../../../07_desarrollo/08_modulos/API/README.md).
