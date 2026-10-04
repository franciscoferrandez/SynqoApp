# Acceso al equipo por enlace

## Decisión vigente

[ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../../05_investigacion-y-decisiones/05_adr/adr-equ-001-separar-identidad-y-acceso.md) establece que el UUID del equipo no concede acceso por sí solo. [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md) concreta la llave independiente, su transporte y su verificación.

## Activos y límites

- El valor del enlace concede acceso compartido al equipo; debe tratarse como secreto compartible.
- Elegir una identidad de participante permite actuar bajo ella conforme a [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md), pero no demuestra que el usuario sea esa persona.
- La caducidad impide el acceso aunque se conozca el enlace, según [RN-EQU-002 — Caducidad de equipos rápidos por inactividad](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-002-caducidad-equipo.md).

## Contrato para la demo local

[ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md) fija el enlace `/e#t=<valor>`, generado con 32 bytes criptográficos y conservado en el servidor solo mediante su verificador SHA-256. La web presentará el valor como credencial Bearer en cada operación de equipo; la API verificará su asociación y vigencia. La confirmación y el panel copiarán o compartirán el enlace completo disponible en el navegador. La identidad de participante se recordará por separado y no concederá acceso. El ADR contiene un ejemplo de creación, uso compartido y visitas posteriores.

## Diseño posterior

Antes de publicar el piloto habrá que comprobar HTTPS, política de referencia, registros, trazas, recursos externos y defensa frente a intentos de adivinación. El paso transitorio del valor al envío opcional de correo se resolverá cuando se incorpore esa capacidad. La [comparación de alternativas](../../05_investigacion-y-decisiones/03_alternativas/alternativas-identificador-enlace-equipo.md) conserva el razonamiento y los riesgos.
