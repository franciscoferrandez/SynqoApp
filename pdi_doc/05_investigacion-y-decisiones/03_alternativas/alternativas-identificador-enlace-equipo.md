# Alternativas — Identificador y valor de acceso en el enlace del equipo

## Pregunta

¿Cómo relacionar un enlace compartido con un equipo sin hacer que su identificador estable impida sustituir el enlace en una entrega futura?

## Criterios de evaluación

- [RD-EQU-007 — Identificador del equipo](../../03_requisitos/03_datos/EQU/rd-equ-007-identificador-equipo.md) exige un UUID único y estable durante la vida del equipo, además de un enlace único.
- [RF-EQU-003 — Acceder al equipo por enlace](../../03_requisitos/01_funcionales/EQU/rf-equ-003-acceder-por-enlace.md) permite el acceso sin registro a quien posea el enlace durante la vigencia del equipo.
- [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](../../03_requisitos/01_funcionales/EQU/rf-equ-007-invalidar-y-sustituir-enlace.md) será necesario después del piloto. La sustitución deberá poder dejar sin acceso al enlace anterior sin crear otro equipo.
- [RESR-EQU-002 — ¿Qué implica conceder acceso al equipo mediante un enlace?](../01_research/resr-equ-002-enlace-como-acceso-al-equipo.md) identifica el enlace como credencial compartible y exige evaluar su generación, comprobación y exposición.
- El valor compartido debe ser impredecible y comprobable en cada operación de lectura o modificación del equipo, no solo al cargar la página inicial. En el modelo de Synqo, esa comprobación acredita posesión del enlace, no una identidad exclusiva de participante.
- La futura sustitución debe poder cambiar el valor de acceso sin cambiar el UUID del equipo. También debe poder evaluarse qué ocurre con accesos ya iniciados, una regla aún no definida por [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](../../03_requisitos/01_funcionales/EQU/rf-equ-007-invalidar-y-sustituir-enlace.md).

## Opciones

| Opción | Encaje en el piloto | Efecto sobre la sustitución futura | Riesgo o coste |
|---|---|---|---|
| A. Usar el UUID del equipo como único valor del enlace | Un único valor identifica el equipo y permite encontrarlo. Si se escogiese UUIDv4 generado con aleatoriedad criptográfica, podría ser difícil de adivinar; «UUID» por sí solo no garantiza esa propiedad. | Para invalidar un enlace habría que cambiar el identificador estable del equipo o introducir entonces una segunda capa de acceso. | Acopla la identidad duradera del equipo con una credencial que debe poder cambiar. Incluso un UUID impredecible debe comprobarse en cada operación. |
| B. Usar un valor de acceso opaco e independiente del UUID | El enlace contiene un valor compartible; el servidor lo asocia al UUID estable del equipo. | Se puede invalidar el valor anterior y emitir otro sin cambiar el equipo ni su UUID. | Exige gestionar el ciclo de vida de ese valor y verificarlo en las operaciones del equipo. Su formato, generación y almacenamiento quedaron decididos en el ADR posterior; los controles de exposición del piloto siguen por concretar. |
| C. Incluir UUID y valor de acceso independiente | El UUID localiza el equipo y un segundo valor concede el acceso. | Permite sustituir solo el valor de acceso y mantener el UUID. | Expone dos valores en la URL y obliga a comprobar su correspondencia. Solo conviene si hay una ventaja concreta de localización o navegación que justifique esa complejidad. |

## Evidencia técnica

- [OWASP — Insecure Direct Object Reference Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) explica que un identificador complejo, incluido un UUID, no sustituye la comprobación de acceso a cada objeto y operación.
- [OWASP — Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) aporta criterios de impredecibilidad y tratamiento de identificadores que actúan como secretos. Es una analogía para el enlace compartido, no una especificación literal de Synqo.
- [OWASP — Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) recomienda evitar que credenciales y tokens de acceso queden en los registros.
- [RFC 9562 — UUID](https://www.rfc-editor.org/rfc/rfc9562.html) distingue UUIDv4, cuyo campo variable es aleatorio, de UUIDv7, que incorpora una marca temporal; la versión del UUID y la calidad de su generador importan si se pretende usarlo como secreto. La especificación no obliga a usar el UUID del equipo como credencial.
- [OWASP — Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) aporta una analogía para enlaces con secreto: generación criptográficamente segura, longitud suficiente, almacenamiento seguro, HTTPS y defensas ante intentos de adivinación. Sus reglas de un solo uso y caducidad corta pertenecen a la recuperación de contraseña y no se trasladan al enlace persistente de un equipo.
- [MDN — Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy) indica que la política por defecto puede incluir ruta y consulta en solicitudes al mismo origen. La política explícita y el tratamiento de rutas en registros necesitan diseño propio.
- [MDN — Fragmento de URI](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment) explica que el fragmento de una URL permanece en el navegador y no se envía al servidor en la solicitud inicial. Eso reduce su presencia en registros HTTP de esa solicitud, pero obliga al cliente a transmitir el valor explícitamente para validarlo.
- [OWASP — HTML5 Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html) advierte que los scripts pueden leer los secretos guardados en `localStorage` y que una inyección de script puede extraerlos. Mantener el enlace visible en el navegador también requiere proteger el código ejecutado en su origen.

## Controles evaluados para la decisión

| Riesgo | Cuestión que debe resolver la arquitectura |
|---|---|
| Adivinación de enlaces | Fuente aleatoria criptográfica, entropía efectiva y limitación de intentos. La longitud textual de un valor no acredita por sí sola su entropía. |
| Uso de un identificador sin acreditar acceso | Asociar el valor de acceso al equipo y comprobar que sigue activo y que el equipo está vigente en cada operación; no autorizar por un UUID que aparezca en un cuerpo o ruta. |
| Exposición del enlace | HTTPS, política de referencia explícita, exclusión del valor de acceso de registros y trazas, y revisión de cachés, analítica y recursos externos en páginas que lo contienen. Una política de referencia no elimina el valor del historial del navegador ni de los registros del servidor. |
| Conservación del secreto | Definir si el servidor guarda un verificador derivado en vez del valor reutilizable. Si solo conserva el verificador, no podrá reconstruir el enlace más tarde: hay que resolver cómo mostrarlo y copiarlo en el panel del equipo y cómo efectuar el envío asíncrono opcional sin conservar el secreto más de lo necesario. Evaluar copias y restauración bajo la política de retención del equipo. |
| Sustitución futura | Diseñar la asociación de modo que se pueda desactivar un valor y emitir otro para el mismo UUID; concretar más adelante cómo se invalidan accesos en curso y cómo se comunican enlaces nuevos. |

## Flujo evaluado para la candidata B

1. Al crear el equipo, el servidor genera un UUID de equipo y, por separado, un valor secreto aleatorio. Guarda el UUID y un verificador irreversible del secreto asociado al equipo; entrega al navegador un enlace canónico que contiene el secreto. Si se solicitó correo, registra en la misma operación de persistencia el evento transitorio con la dirección y el valor necesarios para construir ese enlace; el evento debe proteger ambos valores y borrarlos al terminar o vencer el intento. Esta propuesta depende de la candidata de [alternativas de envío opcional del enlace](alternativas-envio-correo-equipo.md).
2. Una variante concreta de URL coloca el secreto en el fragmento, por ejemplo `https://synqo.example/e#t=<valor>`. La página carga sin enviar el fragmento en la solicitud HTTP inicial; el cliente lee el valor y lo presenta al servidor. El servidor valida el verificador y la vigencia del equipo antes de entregar datos. La solución aprobada exige enviar el valor como Bearer y repetir el control en cada operación de la API.
3. La confirmación y el panel construyen las acciones «copiar» y «compartir» desde el enlace canónico que el navegador recibió o abrió. La navegación interna y la recarga deben conservar acceso a ese valor; por ejemplo, las rutas de una aplicación web pueden mantener el mismo fragmento. Un navegador nuevo obtiene el valor al abrir el enlace recibido. Recordar solo la identidad de participante o el UUID en ese navegador **no** permite reconstruir el enlace.
4. La sustitución futura desactivaría el verificador anterior y emitiría un valor nuevo asociado al mismo UUID. El nuevo enlace tendría que entregarse al dispositivo que realiza la acción y volver a compartirse. La regla para sesiones ya abiertas, la autorización para sustituir el enlace y el estado que verá quien abra el antiguo siguen pendientes en [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](../../03_requisitos/01_funcionales/EQU/rf-equ-007-invalidar-y-sustituir-enlace.md).

El fragmento evita enviar el secreto en la primera solicitud HTTP y en la cabecera de referencia, pero permanece visible en el enlace compartido, la barra de direcciones, el historial y el JavaScript del origen. La aplicación debe evitar que registros de API, trazas, analítica o errores capturen el valor que el cliente envía después. También debe probar que la copia, la compartición y el enlace enviado por correo conservan el fragmento en los navegadores y clientes de correo del piloto. Si se retirase el secreto de la URL tras abrirla para limitar exposición, habría que ofrecer otro medio para que el panel lo copie más tarde: un verificador irreversible no basta. Persistirlo en `localStorage` aumentaría su exposición a scripts y necesitaría evaluación propia.

## Evaluación

La opción B está aprobada en [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../05_adr/adr-equ-001-separar-identidad-y-acceso.md): mantiene separado el UUID estable del valor que concede acceso y facilita la sustitución futura ya requerida. La opción C conserva esa separación, pero no hay necesidad documentada de exponer ambos valores. La opción A dificultaría cumplir la necesidad futura sin migrar el modelo de acceso; la posible impredecibilidad de UUIDv4 no resuelve ese acoplamiento.

La decisión posterior fijó la generación, el formato de URL, la conservación del verificador y la comprobación en cada operación. Los códigos y cuerpos HTTP concretos, y los controles de exposición para un piloto publicado, siguen por especificar.

## Estado

La separación de UUID y valor de acceso está decidida en [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](../05_adr/adr-equ-001-separar-identidad-y-acceso.md). El fragmento de URL, el verificador irreversible y la presentación del valor como Bearer se aprobaron en [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../05_adr/adr-equ-003-verificar-enlace-en-api.md).
