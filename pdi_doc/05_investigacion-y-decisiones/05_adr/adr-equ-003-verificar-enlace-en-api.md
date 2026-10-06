---
id: ADR-EQU-003
estado: aprobado
---

# ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API

## Contexto

[ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](adr-equ-001-separar-identidad-y-acceso.md) ya decide que el valor de acceso es independiente del UUID y que debe comprobarse al leer o modificar el equipo. La demo necesita copiar y compartir ese enlace desde la confirmación y el panel, recargar la página y abrirlo en otro navegador. La identidad de participante elegida no es una credencial. La web se construirá con Angular y la API con Symfony/API Platform según [ADR-COO-001 — Separar interfaz web y API para la demo local](adr-coo-001-estructura-demo-local.md).

## Drivers

- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md)
- [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](../../03_requisitos/01_funcionales/EQU/rf-equ-007-invalidar-y-sustituir-enlace.md)
- [RN-EQU-001 — Actuación bajo identidad de participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-001-identidad-de-confianza.md)
- [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md)

## Opciones consideradas

La [comparación del identificador y el valor de acceso](../03_alternativas/alternativas-identificador-enlace-equipo.md) evalúa el secreto en la ruta, en la consulta o en el fragmento de URL, así como un verificador irreversible frente a conservar el valor reutilizable.

| Alternativa | Ventaja | Coste principal |
|---|---|---|
| Valor en ruta o parámetro de consulta | El servidor recibe el enlace al cargarlo y puede resolverlo sin JavaScript. | El secreto entra en la solicitud inicial y puede figurar en registros HTTP y referencias. |
| Valor en fragmento de URL | La solicitud inicial de la web no envía el secreto al servidor; el navegador conserva el enlace completo para copiarlo o recargar. | Angular debe transmitirlo después a la API; el secreto sigue visible para scripts, historial y quien posea el enlace. |
| Sesión derivada del enlace | Reduce el uso repetido del valor del enlace en la API. | Añade estado y reglas de invalidación de sesiones, especialmente al sustituir el enlace en el futuro. |

Con un valor aleatorio de alta entropía, conservar un resumen irreversible en PostgreSQL reduce la utilidad de una lectura no autorizada de esa tabla. Conservar el valor original facilitaría reconstruir enlaces para correo y panel, pero aumentaría la exposición de una credencial reutilizable.

## Decisión

**Aprobada por la persona que impulsa Synqo tras revisar el recorrido de creación, uso y reutilización del enlace.**

El enlace canónico de la demo tendrá la forma `/e#t=<valor>`. El valor constará de 32 bytes generados con un generador criptográfico y codificados en base64url. El servidor guardará únicamente su SHA-256 como verificador asociado al UUID del equipo. Aquí el fragmento `#t=` del enlace y el resumen SHA-256 almacenado son cosas distintas. La web Angular conservará el valor en el fragmento mientras se use el equipo y lo enviará como `Authorization: Bearer <valor>` en **cada** operación de la API relativa a ese equipo. El servidor Symfony/API Platform verificará el valor, su asociación y la vigencia del equipo antes de leer o modificar datos. El UUID por sí solo y la identidad seleccionada no autorizan la operación.

Copiar y compartir usarán el enlace completo que el navegador recibió o que se devolvió al crear el equipo. No se persistirá el valor en almacenamiento local. La identidad seleccionada sí podrá recordarse por equipo y navegador según el baseline. La API devolverá un estado de caducidad sin datos del equipo cuando el valor sea válido pero el equipo haya caducado; una vez borrado, responderá como enlace inexistente.

La implementación deberá impedir que operaciones de API Platform expuestas por defecto eludan esta comprobación, evitar el registro del valor Bearer y no almacenar respuestas del equipo en cachés compartidas. [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](../../08_especificaciones/99_archivadas/spec-equ-001-arranque-equipo-local.md) comprobará apertura, recarga, navegación interna, copia y uso del enlace real en otro navegador. La [SPEC-COO-001 — Base visual y navegación de Synqo](../../08_especificaciones/99_archivadas/spec-coo-001-base-visual-y-navegacion.md) anterior solo simula la navegación, sin crear un enlace operativo. La entrega móvil posterior deberá probar que el enlace de invitación llega completo al contenedor y se procesa correctamente al abrir la app instalada; esa prueba no decide ahora el empaquetado.

## Ejemplo paso a paso

El enlace `https://synqo.example/e#t=K7pQ...` es ilustrativo: la llave real será mucho más larga y el dominio de ejemplo no representa un servicio publicado.

1. Marta crea «Cena del sábado» e indica «Marta» como primera participante. En ese momento Synqo crea **una sola vez** el UUID interno del equipo y, por separado, una llave de acceso aleatoria. El servidor guarda el UUID y una huella SHA-256 de la llave; devuelve al navegador de Marta el enlace completo.
2. Marta entra al calendario y marca su disponibilidad. Angular lee la llave situada después de `#` y la presenta a la API para guardar el cambio. El servidor calcula su huella, encuentra el equipo asociado y comprueba que sigue vigente. La llave no se reemplaza por realizar esta operación.
3. Marta copia el mismo enlace y lo envía al grupo. Pablo lo abre en otro móvil, elige o crea «Pablo» como participante y marca su disponibilidad. Su navegador presenta **la misma llave** al servidor; actuar bajo otra identidad de participante no genera un enlace nuevo.
4. Una semana después, Pablo vuelve a abrir el enlace o recarga la página. La llave sigue en el enlace y le permite consultar el equipo o votar mientras esté vigente. La selección de «Pablo» puede recordarse en ese navegador por separado; ese recuerdo no concede acceso sin la llave.
5. Cuando el equipo caduque, conocer la llave dejará de permitir ver o modificar su contenido. La posibilidad futura de sustituir un enlace compartido por error emitirá otra llave para el mismo UUID, pero esa acción no forma parte de la demo.

En resumen, se crea una llave **al crear el equipo** y se reutiliza en cada visita y operación de todos los participantes. El UUID identifica al equipo; la llave concede acceso compartido; la huella almacenada sirve para comprobar la llave sin conservarla en claro.

## Consecuencias positivas

- El fragmento no se envía en la solicitud inicial de la página; el cliente puede copiar el mismo enlace después de recargar.
- El servidor no conserva el valor reutilizable y puede sustituir su verificador más adelante sin cambiar el UUID.
- Cada operación valida el acceso vigente, sin confundir la identidad de participante con autenticación.

## Consecuencias negativas

- El valor sigue visible para quien tenga acceso a la barra de direcciones, al historial o al JavaScript del origen; la web y la API deberán evitar registrarlo.
- La carga inicial necesita JavaScript para transmitir el valor al servidor.
- El envío opcional de correo incorporado a la entrega local requiere transportar el enlace de forma transitoria y protegida según [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](adr-equ-002-evento-transaccional-correo.md).

## Evidencia / Research

- [RESR-EQU-002 — ¿Qué implica conceder acceso al equipo mediante un enlace?](../01_research/resr-equ-002-enlace-como-acceso-al-equipo.md)
- [Comparación del identificador y el valor de acceso](../03_alternativas/alternativas-identificador-enlace-equipo.md)
- [MDN — Fragment identifier](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment)
- [OWASP — Insecure Direct Object Reference Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [OWASP — Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP — Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [API Platform — Security with Symfony](https://api-platform.com/docs/main/symfony/security/)
- [Capacitor — Deep Links](https://capacitorjs.com/docs/guides/deep-links)

## Pendiente

Definir códigos y cuerpos exactos de respuesta en el contrato de API y controles de exposición antes de un piloto publicado. La sustitución del enlace, incluida su repercusión en navegadores que lo tengan abierto, permanece para otra entrega. La conservación transitoria del valor original para el correo real se prepara en [SPEC-EQU-003 — Envío opcional del enlace del equipo por correo](../../08_especificaciones/99_archivadas/spec-equ-003-envio-opcional-enlace-correo.md).

## Sustituye

Concreta [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](adr-equ-001-separar-identidad-y-acceso.md) sin sustituirla.

## Sustituido por

No aplica.
