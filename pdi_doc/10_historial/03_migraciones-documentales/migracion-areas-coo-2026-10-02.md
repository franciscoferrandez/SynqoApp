# Migración documental — áreas funcionales de Synqo

**Fecha:** 2026-10-02

## Motivo

El área COO agrupaba responsabilidades distintas. Se separaron EQU (equipos y participantes), DIS (disponibilidad y calendario) y CON (consultas, votos y resolución). COO conserva los artefactos transversales. La verdad normativa vigente reside en los artefactos nuevos y en el catálogo de áreas.

## Rutas anteriores y nuevas

Se renombraron los archivos de los 51 artefactos reasignados. Los requisitos de EQU, DIS y CON se distribuyeron en carpetas de área; las carpetas COO vacías de RF, RN y RD se retiraron.

Las rutas anteriores conservan el prefijo histórico `docs/`; las rutas vigentes reflejan la ubicación `pdi_doc/` adoptada por PDI.

## IDs afectados

| ID anterior | ID vigente | Ruta anterior | Ruta vigente |
|---|---|---|---|
| FLUJO-COO-001 | FLUJO-EQU-001 | `docs/04_experiencia-usuario/02_flujos/flujo-coo-001-entrar-equipo.md` | `pdi_doc/04_experiencia-usuario/02_flujos/flujo-equ-001-entrar-equipo.md` |
| FLUJO-COO-002 | FLUJO-DIS-001 | `docs/04_experiencia-usuario/02_flujos/flujo-coo-002-marcar-disponibilidad.md` | `pdi_doc/04_experiencia-usuario/02_flujos/flujo-dis-001-marcar-disponibilidad.md` |
| FLUJO-COO-003 | FLUJO-CON-001 | `docs/04_experiencia-usuario/02_flujos/flujo-coo-003-crear-consulta.md` | `pdi_doc/04_experiencia-usuario/02_flujos/flujo-con-001-crear-consulta.md` |
| FLUJO-COO-004 | FLUJO-CON-002 | `docs/04_experiencia-usuario/02_flujos/flujo-coo-004-responder-consulta.md` | `pdi_doc/04_experiencia-usuario/02_flujos/flujo-con-002-responder-consulta.md` |
| FLUJO-COO-005 | FLUJO-CON-003 | `docs/04_experiencia-usuario/02_flujos/flujo-coo-005-resolver-consulta.md` | `pdi_doc/04_experiencia-usuario/02_flujos/flujo-con-003-resolver-consulta.md` |
| HU-COO-001 | HU-DIS-001 | `docs/01_producto/07_historias-usuario/hu-coo-001-disponibilidad-del-equipo.md` | `pdi_doc/01_producto/07_historias-usuario/hu-dis-001-disponibilidad-del-equipo.md` |
| HU-COO-002 | HU-DIS-002 | `docs/01_producto/07_historias-usuario/hu-coo-002-consultar-visor.md` | `pdi_doc/01_producto/07_historias-usuario/hu-dis-002-consultar-visor.md` |
| HU-COO-003 | HU-CON-001 | `docs/01_producto/07_historias-usuario/hu-coo-003-crear-consulta-de-fecha.md` | `pdi_doc/01_producto/07_historias-usuario/hu-con-001-crear-consulta-de-fecha.md` |
| HU-COO-004 | HU-CON-002 | `docs/01_producto/07_historias-usuario/hu-coo-004-responder-consulta-de-fecha.md` | `pdi_doc/01_producto/07_historias-usuario/hu-con-002-responder-consulta-de-fecha.md` |
| HU-COO-005 | HU-EQU-001 | `docs/01_producto/07_historias-usuario/hu-coo-005-crear-equipo.md` | `pdi_doc/01_producto/07_historias-usuario/hu-equ-001-crear-equipo.md` |
| HU-COO-006 | HU-EQU-002 | `docs/01_producto/07_historias-usuario/hu-coo-006-incorporarse-equipo.md` | `pdi_doc/01_producto/07_historias-usuario/hu-equ-002-incorporarse-equipo.md` |
| HU-COO-007 | HU-EQU-003 | `docs/01_producto/07_historias-usuario/hu-coo-007-cambiar-identidad.md` | `pdi_doc/01_producto/07_historias-usuario/hu-equ-003-cambiar-identidad.md` |
| HU-COO-008 | HU-CON-003 | `docs/01_producto/07_historias-usuario/hu-coo-008-ver-votos.md` | `pdi_doc/01_producto/07_historias-usuario/hu-con-003-ver-votos.md` |
| HU-COO-009 | HU-CON-004 | `docs/01_producto/07_historias-usuario/hu-coo-009-resolver-consulta.md` | `pdi_doc/01_producto/07_historias-usuario/hu-con-004-resolver-consulta.md` |
| HU-COO-010 | HU-EQU-004 | `docs/01_producto/07_historias-usuario/hu-coo-010-acceder-por-enlace.md` | `pdi_doc/01_producto/07_historias-usuario/hu-equ-004-acceder-por-enlace.md` |
| HU-COO-011 | HU-EQU-005 | `docs/01_producto/07_historias-usuario/hu-coo-011-conocer-caducidad.md` | `pdi_doc/01_producto/07_historias-usuario/hu-equ-005-conocer-caducidad.md` |
| INV-COO-001 | INV-CON-001 | `docs/02_dominio/05_invariantes/inv-coo-001-voto-atribuido.md` | `pdi_doc/02_dominio/05_invariantes/inv-con-001-voto-atribuido.md` |
| INV-COO-002 | INV-CON-002 | `docs/02_dominio/05_invariantes/inv-coo-002-resolucion-consulta.md` | `pdi_doc/02_dominio/05_invariantes/inv-con-002-resolucion-consulta.md` |
| RD-COO-001 | RD-EQU-001 | `docs/03_requisitos/03_datos/COO/rd-coo-001-identidad-participante.md` | `pdi_doc/03_requisitos/03_datos/EQU/rd-equ-001-identidad-participante.md` |
| RD-COO-002 | RD-DIS-001 | `docs/03_requisitos/03_datos/COO/rd-coo-002-disponibilidad.md` | `pdi_doc/03_requisitos/03_datos/DIS/rd-dis-001-disponibilidad.md` |
| RD-COO-003 | RD-CON-001 | `docs/03_requisitos/03_datos/COO/rd-coo-003-voto.md` | `pdi_doc/03_requisitos/03_datos/CON/rd-con-001-voto.md` |
| RD-COO-004 | RD-CON-002 | `docs/03_requisitos/03_datos/COO/rd-coo-004-resolucion.md` | `pdi_doc/03_requisitos/03_datos/CON/rd-con-002-resolucion.md` |
| RD-COO-005 | RD-EQU-002 | `docs/03_requisitos/03_datos/COO/rd-coo-005-caducidad-equipo.md` | `pdi_doc/03_requisitos/03_datos/EQU/rd-equ-002-caducidad-equipo.md` |
| RD-COO-006 | RD-EQU-003 | `docs/03_requisitos/03_datos/COO/rd-coo-006-datos-equipo-caducado.md` | `pdi_doc/03_requisitos/03_datos/EQU/rd-equ-003-datos-equipo-caducado.md` |
| RD-COO-007 | RD-EQU-004 | `docs/03_requisitos/03_datos/COO/rd-coo-007-identidad-seleccionada-dispositivo.md` | `pdi_doc/03_requisitos/03_datos/EQU/rd-equ-004-identidad-seleccionada-dispositivo.md` |
| RD-COO-008 | RD-CON-003 | `docs/03_requisitos/03_datos/COO/rd-coo-008-titulo-consulta.md` | `pdi_doc/03_requisitos/03_datos/CON/rd-con-003-titulo-consulta.md` |
| RF-COO-001 | RF-EQU-001 | `docs/03_requisitos/01_funcionales/COO/rf-coo-001-crear-equipo.md` | `pdi_doc/03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md` |
| RF-COO-002 | RF-EQU-002 | `docs/03_requisitos/01_funcionales/COO/rf-coo-002-incorporarse-y-elegir-identidad.md` | `pdi_doc/03_requisitos/01_funcionales/EQU/rf-equ-002-incorporarse-y-elegir-identidad.md` |
| RF-COO-003 | RF-DIS-001 | `docs/03_requisitos/01_funcionales/COO/rf-coo-003-marcar-disponibilidad.md` | `pdi_doc/03_requisitos/01_funcionales/DIS/rf-dis-001-marcar-disponibilidad.md` |
| RF-COO-004 | RF-DIS-002 | `docs/03_requisitos/01_funcionales/COO/rf-coo-004-consultar-visor.md` | `pdi_doc/03_requisitos/01_funcionales/DIS/rf-dis-002-consultar-visor.md` |
| RF-COO-005 | RF-CON-001 | `docs/03_requisitos/01_funcionales/COO/rf-coo-005-crear-consulta.md` | `pdi_doc/03_requisitos/01_funcionales/CON/rf-con-001-crear-consulta.md` |
| RF-COO-006 | RF-CON-002 | `docs/03_requisitos/01_funcionales/COO/rf-coo-006-votar.md` | `pdi_doc/03_requisitos/01_funcionales/CON/rf-con-002-votar.md` |
| RF-COO-007 | RF-CON-003 | `docs/03_requisitos/01_funcionales/COO/rf-coo-007-ver-votos.md` | `pdi_doc/03_requisitos/01_funcionales/CON/rf-con-003-ver-votos.md` |
| RF-COO-008 | RF-CON-004 | `docs/03_requisitos/01_funcionales/COO/rf-coo-008-resolver-consulta.md` | `pdi_doc/03_requisitos/01_funcionales/CON/rf-con-004-resolver-consulta.md` |
| RF-COO-009 | RF-EQU-003 | `docs/03_requisitos/01_funcionales/COO/rf-coo-009-acceder-por-enlace.md` | `pdi_doc/03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md` |
| RF-COO-010 | RF-EQU-004 | `docs/03_requisitos/01_funcionales/COO/rf-coo-010-mostrar-caducidad.md` | `pdi_doc/03_requisitos/01_funcionales/EQU/rf-equ-004-mostrar-caducidad.md` |
| RF-COO-011 | RF-EQU-005 | `docs/03_requisitos/01_funcionales/COO/rf-coo-011-eliminar-equipo-caducado.md` | `pdi_doc/03_requisitos/01_funcionales/EQU/rf-equ-005-eliminar-equipo-caducado.md` |
| RN-COO-001 | RN-EQU-001 | `docs/03_requisitos/02_reglas-negocio/COO/rn-coo-001-identidad-de-confianza.md` | `pdi_doc/03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md` |
| RN-COO-002 | RN-DIS-001 | `docs/03_requisitos/02_reglas-negocio/COO/rn-coo-002-disponibilidad-del-equipo.md` | `pdi_doc/03_requisitos/02_reglas-negocio/DIS/rn-dis-001-disponibilidad-del-equipo.md` |
| RN-COO-003 | RN-CON-001 | `docs/03_requisitos/02_reglas-negocio/COO/rn-coo-003-votacion-publica.md` | `pdi_doc/03_requisitos/02_reglas-negocio/CON/rn-con-001-votacion-publica.md` |
| RN-COO-004 | RN-CON-002 | `docs/03_requisitos/02_reglas-negocio/COO/rn-coo-004-resolucion-consulta.md` | `pdi_doc/03_requisitos/02_reglas-negocio/CON/rn-con-002-resolucion-consulta.md` |
| RN-COO-005 | RN-DIS-002 | `docs/03_requisitos/02_reglas-negocio/COO/rn-coo-005-resumen-disponibilidad.md` | `pdi_doc/03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md` |
| RN-COO-006 | RN-EQU-002 | `docs/03_requisitos/02_reglas-negocio/COO/rn-coo-006-caducidad-equipo.md` | `pdi_doc/03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md` |
| RN-COO-007 | RN-EQU-003 | `docs/03_requisitos/02_reglas-negocio/COO/rn-coo-007-borrado-equipo.md` | `pdi_doc/03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md` |
| RN-COO-008 | RN-EQU-004 | `docs/03_requisitos/02_reglas-negocio/COO/rn-coo-008-nombre-participante-unico.md` | `pdi_doc/03_requisitos/02_reglas-negocio/EQU/rn-equ-004-nombre-participante-unico.md` |
| RN-COO-009 | RN-CON-003 | `docs/03_requisitos/02_reglas-negocio/COO/rn-coo-009-minimo-opciones-consulta.md` | `pdi_doc/03_requisitos/02_reglas-negocio/CON/rn-con-003-minimo-opciones-consulta.md` |
| WF-COO-001 | WF-EQU-001 | `docs/04_experiencia-usuario/03_wireframes/wf-coo-001-entrada-identidad.md` | `pdi_doc/04_experiencia-usuario/03_wireframes/wf-equ-001-entrada-identidad.md` |
| WF-COO-002 | WF-DIS-001 | `docs/04_experiencia-usuario/03_wireframes/wf-coo-002-calendario-equipo.md` | `pdi_doc/04_experiencia-usuario/03_wireframes/wf-dis-001-calendario-equipo.md` |
| WF-COO-003 | WF-CON-001 | `docs/04_experiencia-usuario/03_wireframes/wf-coo-003-lista-consultas.md` | `pdi_doc/04_experiencia-usuario/03_wireframes/wf-con-001-lista-consultas.md` |
| WF-COO-004 | WF-CON-002 | `docs/04_experiencia-usuario/03_wireframes/wf-coo-004-detalle-consulta.md` | `pdi_doc/04_experiencia-usuario/03_wireframes/wf-con-002-detalle-consulta.md` |
| WF-COO-005 | WF-CON-003 | `docs/04_experiencia-usuario/03_wireframes/wf-coo-005-consulta-cerrada.md` | `pdi_doc/04_experiencia-usuario/03_wireframes/wf-con-003-consulta-cerrada.md` |

## Enlaces actualizados

Se actualizaron todas las referencias de ID y los destinos de enlaces Markdown internos afectados por los movimientos.

## Validación

Se verificaron IDs únicos, ausencia de referencias vigentes a los 51 IDs anteriores, enlaces locales y estructura documental tras la migración.
