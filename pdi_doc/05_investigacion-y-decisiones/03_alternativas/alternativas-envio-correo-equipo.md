# Alternativas — Envío opcional del enlace de equipo

## Pregunta

¿Cómo iniciar el envío sin demorar la creación del equipo y conservar un resultado del intento que permita mostrar el aviso en el mismo navegador hasta descartarlo?

## Drivers

- El equipo y su enlace deben quedar disponibles aunque falle el intento, conforme a [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md).
- El correo se usa para una sola notificación y su dirección no se conserva después del intento, conforme a [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md).
- La creación no debería esperar a la respuesta del proveedor de correo; es una preferencia expresada, todavía sin mecanismo elegido.
- El resultado observable termina con la confirmación de éxito o error que proporcione el componente de envío; cualquier falta de confirmación de éxito se interpreta como error. No se siguen rebotes posteriores, como distingue [RESR-EQU-001 — ¿Cuándo se conoce el resultado del envío del enlace por correo?](../01_research/resr-equ-001-resultado-del-envio-de-correo.md).
- La aplicación consultará una abstracción de envío y la integración elegida traducirá a esa respuesta el detalle de su infraestructura; es una dirección arquitectónica expresada, aún sin contrato ni adaptador concretos.
- El fallo conocido después de salir de la pantalla debe poder mostrarse al volver al equipo desde el mismo navegador hasta descartarlo.
- Esta entrega hace un solo intento; un rechazo temporal del proveedor también termina en fallo, sin reintento automático.
- La persistencia del equipo y del trabajo de envío debería ser coherente: no debe confirmarse un equipo con correo solicitado y perder silenciosamente la intención de envío por una caída entre dos escrituras independientes. Este criterio es una inferencia de los drivers anteriores.
- El mensaje debe contener un enlace utilizable. [RESR-EQU-002 — ¿Qué implica conceder acceso al equipo mediante un enlace?](../01_research/resr-equ-002-enlace-como-acceso-al-equipo.md) trata ese enlace como una credencial compartible, por lo que la forma de reconstruirlo también afecta al evento asíncrono.

## Opciones

| Opción | Ventajas | Costes y límites | Riesgos frente a los drivers |
|---|---|---|---|
| A. Esperar a completar la llamada al proveedor antes de responder a la creación | Resultado del intento disponible en la misma respuesta; evita conservar una tarea pendiente | La respuesta de creación depende de la latencia o indisponibilidad del proveedor | Puede retrasar el arranque, contrario a la preferencia expresada. La aceptación tampoco acredita entrega. |
| B. Responder a la creación y ejecutar el envío en memoria del proceso servidor | La pantalla puede abrirse sin esperar al proveedor; la dirección no necesita conservarse en una tarea duradera | Si el proceso termina antes del intento, puede perderse el envío y su resultado; la recuperación ante fallos depende del entorno | Cuesta garantizar que un fallo tardío llegue a conocerse. No resuelve por sí sola el aviso en visitas posteriores. |
| C. Registrar una tarea duradera para que un trabajador haga el intento | La creación puede responder tras registrar la tarea; el trabajo pendiente sobrevive a un cierre de página o proceso, según la garantía de la cola elegida | Requiere conservar temporalmente la dirección en la tarea o en un dato transitorio, y eliminarla al terminar el intento; añade gestión de tarea, resultado y limpieza | Las colas pueden entregar una tarea más de una vez: habría que controlar esa duplicación para respetar la regla de un solo intento. Plazo de conservación y tratamiento de resultados inciertos deben concretarse. |
| D. Guardar el evento de envío en la misma base transaccional que el equipo y procesarlo con un trabajador | La creación del equipo y el registro de la intención de envío pueden confirmarse juntos; el estado pendiente sobrevive a la salida de la página o al reinicio del proceso; puede quedar un resultado consultable sin dirección de correo | Requiere trabajador, reclamación exclusiva del evento, límites de tiempo y limpieza; depende de disponer de una base transaccional adecuada | Una caída tras reclamar el evento y antes de conocer la respuesta del proveedor deja un resultado incierto. Para evitar un segundo intento deberá tratarse como error y limpiar el dato; puede que el mensaje nunca se haya enviado. |

## Evidencia técnica

- [Google Cloud Tasks — Overview](https://docs.cloud.google.com/tasks/docs/dual-overview): separa trabajo asíncrono de la petición, persiste tareas y documenta la posibilidad de ejecución repetida. Es un ejemplo de patrón, no un servicio seleccionado.
- [Amazon SQS — Standard queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html): entrega al menos una vez, posible duplicación y almacenamiento duradero del mensaje. Es un segundo ejemplo del mismo riesgo, no una recomendación de proveedor.
- [Amazon SES — SendEmail API](https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_SendEmail.html): la aceptación devuelve un identificador, pero no garantiza el envío ni la entrega.
- [PostgreSQL — Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html): las escrituras de una transacción se confirman o se deshacen juntas; sustenta la posibilidad de registrar equipo y evento de forma atómica si ambos viven en la misma base.
- [PostgreSQL — SELECT](https://www.postgresql.org/docs/current/sql-select.html): `FOR UPDATE SKIP LOCKED` permite que varios consumidores eviten reclamar simultáneamente una misma fila de una tabla usada como cola. Es una capacidad técnica, no una elección de base de datos.
- [MDN — Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage): conserva datos del mismo origen entre sesiones del navegador; puede no estar disponible si la configuración del navegador lo impide.

## Diseño derivado y decisiones pendientes

La persistencia transaccional de la opción D se propone en [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../05_adr/adr-equ-002-evento-transaccional-correo.md). Un evento de envío, creado en la misma transacción que el equipo, contiene la dirección mientras espere o ejecute el único intento. El procesador reclamará de forma exclusiva ese evento y registrará que se va a realizar el intento *antes* de llamar al adaptador de correo. Tras una confirmación de éxito o error, eliminará la dirección y conservará únicamente el resultado necesario para mostrar el aviso. Un evento pendiente que exceda un plazo máximo, o un intento iniciado cuyo resultado no pueda confirmarse tras una interrupción, terminará en error y limpieza, sin volver a llamar al proveedor. La elección concreta de estados, plazos, base y forma de ejecutar el procesador pertenece a decisiones posteriores.

El trabajador también necesita construir el enlace completo al ejecutar el evento. Si la base solo conserva un verificador irreversible del token de acceso, ese token no puede reconstruirse a partir del verificador. Una solución posible sería incluir temporalmente el enlace o su secreto en el evento, protegido y eliminado junto con la dirección al terminar o caducar; otra sería disponer de un mecanismo recuperable y protegido para el enlace. Ambas amplían la superficie de exposición de una credencial de acceso y requieren decisión conjunta con el diseño de acceso y de copia/compartición del enlace en el panel. No se presume que el UUID del equipo sea el secreto ni que el enlace se pueda derivar de él.

La primera solución es compatible con un verificador irreversible persistente: el navegador que crea el equipo o entra por el enlace conserva el token original durante su navegación y copia o comparte desde esa URL; el evento lleva temporalmente ese mismo token para preparar el correo. Esto presupone que la página de confirmación y las rutas internas conservan acceso a la URL completa, y que la dirección y el token se limpian juntos incluso si vence el evento. El identificador aleatorio usado para consultar el resultado del correo sería distinto del token que permite entrar al equipo. Estas son condiciones a validar en arquitectura y experiencia, no reglas aprobadas.

Para que el aviso se limite al navegador creador, la respuesta de creación podría devolver un identificador aleatorio del intento que el navegador conserve por equipo. Ese identificador permitiría consultar el estado del envío desde la confirmación o el panel y persistir el aviso hasta descartarlo, sin guardar la dirección de correo en el navegador ni exponer el resultado a quien solo recibe el enlace del equipo. La consulta periódica o al volver a entrar es suficiente como posibilidad técnica; no se ha decidido el mecanismo de actualización. El almacenamiento local del navegador es un candidato, no una garantía cuando el navegador impide persistencia.

Esta candidata permite **como máximo una invocación iniciada por la aplicación** si la reclamación se confirma antes de la llamada y nunca se vuelve a procesar un evento reclamado. No garantiza que el correo llegue, ni siquiera que se haya invocado al proveedor si el proceso cae justo después de la reclamación. Tampoco convierte una respuesta incierta en fallo confirmado de entrega: conforme al requisito, se comunicaría como intento erróneo por falta de confirmación de éxito. Una cola externa puede seguir siendo preferible si la arquitectura final exige desacoplamiento o volumen mayor; necesitaría resolver escritura coherente, duplicados y limpieza.

## Cuestiones por resolver

- Concretar el plazo máximo de un evento pendiente o iniciado, la limpieza del dato transitorio si el proceso se interrumpe y la conservación mínima del resultado sin dirección.
- Definir cómo el adaptador confirma el éxito con la infraestructura elegida. Tampoco se ha definido reenvío manual.
- Decidir cómo asociar el estado del intento al navegador creador y qué se presenta cuando este no puede persistir el identificador, sin mostrar el aviso a otros navegadores.
- Elegir el mecanismo técnico, el proveedor y el contrato de la abstracción cuando se defina la arquitectura del proyecto.
- Confirmar si el almacenamiento principal permite una transacción entre equipo y evento; si no, reevaluar la candidata y el tratamiento de una publicación fallida a una cola externa.
- Definir control de concurrencia y proceso de caducidad/limpieza del evento, además de su interacción con el borrado del equipo.
- Verificar con el proveedor elegido si sus SDK o intermediarios reintentan automáticamente una solicitud; desactivar esos reintentos cuando contradigan la regla de un solo intento.
- Resolver con la arquitectura de acceso cómo obtiene el trabajador el enlace completo para el correo asíncrono y cómo lo obtiene el panel después, sin prolongar por accidente la retención del secreto en el evento efímero.

## Estado

El registro transaccional del evento se propone en [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../05_adr/adr-equ-002-evento-transaccional-correo.md). Siguen abiertas las alternativas para el procesador, la protección de datos temporales, la consulta del resultado y el proveedor.
