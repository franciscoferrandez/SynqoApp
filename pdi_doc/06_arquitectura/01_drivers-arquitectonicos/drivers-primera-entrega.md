# Drivers arquitectónicos de la primera entrega

Estos factores proceden del Product Baseline y orientan la evaluación de alternativas. No fijan proveedor, lenguaje, framework ni módulos de solución.

| Driver | Origen | Impacto arquitectónico que se debe resolver |
|---|---|---|
| Acceso compartido sin registro y aislamiento entre equipos | [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md); [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md) | Definir generación, comprobación y tratamiento del enlace en todas las operaciones que leen o modifican un equipo; no atribuir al participante elegido una autenticación que no existe. |
| Identidad estable del equipo y sustitución futura del enlace | [RD-EQU-007 — Identificador del equipo](../../03_requisitos/03_datos/EQU/rd-equ-007-identificador-equipo.md); [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](../../03_requisitos/01_funcionales/EQU/rf-equ-007-invalidar-y-sustituir-enlace.md) | Evaluar cómo conservar el UUID del equipo cuando en otra entrega se invalide y sustituya el valor que concede acceso. La sustitución no se implementa en el piloto. |
| Caducidad dependiente de modificaciones y zona horaria del equipo | [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md) | Calcular y aplicar de forma coherente el vencimiento tras cada modificación válida y en la zona del equipo, incluso cuando distintos dispositivos muestran otras zonas. |
| Borrado de datos de la base activa | [RN-EQU-003 — Borrado de equipos caducados](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md); [RD-EQU-003 — Datos del equipo caducado](../../03_requisitos/03_datos/EQU/rd-equ-003-datos-equipo-caducado.md) | Ejecutar el borrado completo en la base activa tras el plazo configurado y comprobarlo con tiempo controlado en la demo local. |
| Experiencia web móvil y accesible | [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md); [RNF-COO-002 — Accesibilidad web WCAG 2.2 nivel AA](../../03_requisitos/04_no-funcionales/COO/rnf-coo-002-accesibilidad-web.md) | Escoger una solución web capaz de cubrir los mismos recorridos en móvil y escritorio y permitir verificar WCAG 2.2 AA sobre páginas y procesos completos. |

## Drivers conservados para el piloto posterior

| Driver | Origen | Impacto pendiente |
|---|---|---|
| Correo opcional, efímero y sin reintentos automáticos | [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md); [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md) | Separar la creación del equipo del resultado del intento de correo, comunicar ese resultado al navegador creador, impedir reintentos automáticos, eliminar la dirección al terminar el intento y resolver la limpieza de eventos que nunca se ejecuten. No bloquea la demo local, que no envía correo. |
| Conservación de copias y restauración | [RN-EQU-003 — Borrado de equipos caducados](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md) | Definir retención de copias y una restauración que no vuelva a exponer equipos caducados o borrados antes de publicar el piloto. |

## Cuestiones aún abiertas

- El formato y la verificación del enlace están decididos en [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). Los contratos HTTP y el esquema de datos se concretarán antes del primer Change funcional que los use.
- El contrato y el mecanismo del envío real de correo quedan para el piloto posterior.
- El plazo de conservación de las copias y el mecanismo de restauración se definirán con la arquitectura y operación del piloto.
- La primera entrega no requiere una aplicación móvil instalable; su tecnología posterior sigue abierta según el [alcance conceptual](../../01_producto/04_alcance/alcance-conceptual.md).
