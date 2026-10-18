# Alcance conceptual de Synqo

**Origen:** descripción de producto y selección de capacidades de la primera entrega aportadas por la persona que impulsa Synqo.

## Primera entrega: demo local operativa — DEFINIDO

La primera entrega será una demo ejecutable en un entorno local de desarrollo. Incluirá equipos y participantes, disponibilidad diaria, calendario y consultas de fechas y de opciones de texto, con votos y resoluciones persistentes. El acceso se probará mediante enlaces en el entorno local. El envío opcional operativo del enlace por SMTP hacia un buzón local inspeccionable se incorpora a esta entrega por decisión expresa de la persona impulsora el 2026-10-06; la entrega a buzones externos y la publicación del piloto quedan para una entrega posterior. Su selección de capacidades y seguimiento se registran en [REL-001 — Demo local operativa de Synqo](../10_entregas/rel-001-demo-local-operativa.md).

## Capacidades de producto compartidas por la demo y el piloto — DEFINIDO

- Equipos creados desde un formulario directo con nombre de equipo y primer participante obligatorios. Ningún equipo funciona sin al menos un participante; si se accede a uno vacío, se exige crear una identidad antes de mostrar su contenido operativo.
- Disponibilidad por día dentro de cada equipo, independiente de las consultas y sin rangos de horas ni franjas del día. Solo se puede marcar o cambiar para hoy o fechas futuras; las marcas pasadas siguen consultables.
- Calendario de disponibilidad del equipo para facilitar la identificación de posibles fechas.
- Creación manual de consultas de fechas y de consultas con opciones de texto. Ambas tienen un título breve y una o más opciones; cada fecha se propone una sola vez y debe ser hoy o posterior al crearla. La consulta de fechas se inicia desde el calendario: se deselecciona el día activo y se eligen fechas pulsando los días, con una lista ordenada en el panel de creación. La consulta de opciones de texto se inicia desde «Consultas».
- Todas estas acciones pueden realizarse sin registro: crear un equipo, incorporarse a él, marcar disponibilidad y crear, responder o resolver consultas.
- Las respuestas a consultas quedan registradas y son públicas dentro del equipo: se puede ver qué ha votado cada participante. En esta fase todas las consultas son de respuesta múltiple y permiten seleccionar una o varias opciones.
- La consulta se resuelve aceptando una o varias opciones propuestas, o rechazándola. Cualquier usuario con acceso al equipo puede resolverla actuando en representación de un participante.
- El acceso al equipo se comparte mediante un enlace. Los equipos de esta entrega son rápidos: caducan al terminar el día de vencimiento calculado tras tres meses naturales sin modificaciones, muestran su fecha prevista de caducidad y, una vez caducados, no pueden recuperarse en esta fase.
- En la demo local, el formulario mantiene el campo de correo opcional y explica que se usará solo para enviar el enlace. La dirección será un dato efímero del evento de envío y se eliminará al terminar o vencer el intento; no forma parte de los datos del equipo. Si el intento falla, el equipo seguirá creado y se mostrará el enlace junto a un aviso, conforme a [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md) y [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md).
- Al crear un equipo se intenta obtener su zona horaria, usando Europe/Madrid si no está disponible. La zona del equipo no se muestra ni puede cambiarla el usuario. La fecha de caducidad se presenta en la zona del dispositivo de quien la consulta o, si no se obtiene, en la del equipo.
- Al caducar, el equipo queda inaccesible. Todos sus datos se eliminan de la base activa 90 días después, con ese plazo configurable internamente o mediante el entorno de la aplicación. Los datos que aún figuren en copias de seguridad desaparecen al vencer el plazo de conservación de estas, todavía por definir.
- La aplicación web funciona de forma adaptable en navegadores móviles y de escritorio. La demo local y el piloto publicado no exigen una aplicación móvil instalable, según [RNF-COO-003 — Uso adaptable en navegador móvil](../../03_requisitos/04_no-funcionales/COO/rnf-coo-003-uso-en-navegador-movil.md).
- La apertura pública inicial será un piloto con un grupo limitado de personas y equipos, principalmente en Europa. El número concreto y las condiciones operativas del piloto se definirán al preparar esa entrega.
- El enlace de acceso de un equipo no podrá invalidarse ni sustituirse durante la demo local ni el primer piloto publicado.

Las reglas de interacción y los criterios de aceptación de la demo se concretan en los requisitos y artefactos de UX enlazados desde [REL-001 — Demo local operativa de Synqo](../10_entregas/rel-001-demo-local-operativa.md).

## Incluido

### DEFINIDO

- Los equipos disponen de un espacio común para coordinar disponibilidades y consultas dirigidas a tomar decisiones.
- Un usuario con acceso puede indicar disponibilidad por día bajo una identidad de participante del equipo, con independencia de las consultas. Los valores se definen en el [glosario de coordinación](../../02_dominio/01_glosario-dominio/glosario-coordinacion.md). En la fase inicial no se contemplan rangos de horas ni franjas del día.
- El visor del equipo es un calendario que facilita la identificación de posibles fechas a partir de la disponibilidad compartida. Su resumen diario se define en [RN-DIS-002 — Resumen diario de disponibilidad](../../03_requisitos/02_reglas-negocio/DIS/rn-dis-002-resumen-disponibilidad.md).
- Una persona escribe un título breve y construye manualmente las opciones que propone al grupo. El título identifica la consulta en la lista. Para consultas de fechas, el calendario es el punto de entrada y la selección empieza vacía; se añaden o retiran fechas al pulsar los días. La creación requiere confirmación; la cancelación solo la requiere cuando se ha escrito un título o elegido alguna fecha. Para consultas sobre otros asuntos, se escriben opciones de texto desde la sección «Consultas».
- Toda consulta exige al menos una opción, tanto si trata sobre fechas como sobre otro asunto de la primera entrega.
- Una persona puede crear un equipo y empezar a coordinarlo sin registro, informando directamente los nombres del equipo y del primer participante. El enlace de acceso puede copiarse o compartirse mediante el diálogo del dispositivo cuando esté disponible. Quien lo reciba puede incorporarse seleccionando una identidad de participante existente o creando una nueva.
- Cualquier modificación del equipo reinicia el plazo de tres meses naturales de inactividad, incluidas las de participantes, disponibilidades, votos, consultas y resoluciones. Abrir el enlace sin modificar nada no reinicia el plazo. La fecha prevista de caducidad se muestra en pantalla.
- Los conceptos de usuario y participante se definen en el [glosario de coordinación](../../02_dominio/01_glosario-dominio/glosario-coordinacion.md). Si el navegador no recuerda una identidad para el equipo, se elige una existente o se crea una nueva antes de ver su contenido. La última identidad elegida se recuerda en ese navegador para el equipo y puede cambiarse fácilmente, incluso para registrar la disponibilidad comunicada por otra persona.
- La gestión del equipo se basa en la confianza. Un usuario con acceso puede, indicando la identidad de participante con la que actúa, marcar disponibilidad y crear, responder o resolver consultas sin registro. La posibilidad de exigir registro para futuras funciones avanzadas sigue pendiente de definir y no limita este alcance.
- La interfaz debe ser clara y fácil de usar. El criterio temporal del arranque básico está definido; faltan criterios para el resto de la experiencia.
- En el arranque básico, una persona sin registro puede crear un equipo, compartir su enlace y marcar disponibilidad en menos de cinco minutos, según [RNF-COO-001 — Arranque básico en menos de cinco minutos](../../03_requisitos/04_no-funcionales/COO/rnf-coo-001-arranque-basico.md).
- Dentro de un equipo no se admiten dos participantes con el mismo nombre, ignorando mayúsculas, espacios exteriores y acentos; al intentar crearlo se solicita otro nombre.
- Synqo se podrá usar en la web desde dispositivos móviles y de escritorio en la primera entrega.

## Evolución próxima — DEFINIDO

- Una aplicación móvil instalable será un requisito de una entrega posterior a la demo local y al primer piloto publicado. Todavía no se ha creado una entrega formal ni se ha decidido su tecnología.

## Nueva entrega de eventos — DEFINIDO

La próxima ampliación del producto incorporará eventos del equipo con título de hasta 250 caracteres, notas opcionales en texto plano de hasta 5000 caracteres y fecha opcional de día completo. Se podrá poner una fecha pasada al crearlo o editarlo. Un evento sin fecha será provisional; si se informa fecha al crearlo, esta será provisional por defecto y podrá pasar a definitiva. Cualquier persona con acceso al equipo podrá crearlo y editar título, notas, fecha y estado desde su ficha, incluso si la fecha ya es definitiva. Un evento rechazado deberá recuperarse antes de editarlo y solo se conservará el valor actual de cada campo, sin historial de versiones. La ficha mostrará el participante y el momento de creación; el participante y el momento de última modificación solo aparecerán después de un cambio real, según [RF-EVT-001 — Crear y editar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-001-crear-editar-evento.md), [RD-EVT-002 — Autoría y momentos del evento](../../03_requisitos/03_datos/EVT/rd-evt-002-autoria-momentos-evento.md) y [RN-EVT-001 — Coherencia entre fecha y estado del evento](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-001-coherencia-fecha-estado.md).

Una pestaña propia separará los eventos sin fecha definitiva, los definitivos futuros, los definitivos pasados y los rechazados. Un evento provisional con fecha pasada seguirá en «Sin fecha definitiva»; para distinguir futuro y pasado se usará el día en la zona horaria del equipo, contando hoy entre los futuros. Los definitivos futuros se ordenarán por fecha ascendente y los pasados por fecha descendente; si tienen la misma fecha, primero el modificado más recientemente. Los otros dos grupos también mostrarán primero los modificados más recientemente; si un evento nunca se modificó, se usará su momento de creación para ordenar. Los eventos provisionales y definitivos podrán rechazarse conservando sus datos y recuperarse con la misma fecha, siempre en estado provisional. No habrá borrado individual. Si el evento tiene una consulta abierta vinculada, un único diálogo permitirá rechazar el evento y desvincular la consulta o rechazar ambos; cancelarlo dejará tanto evento como consulta sin cambios. El calendario señalará los días con eventos mediante una campanita en la esquina superior derecha de cada casilla; si hay varios, mostrará su número. Los provisionales con fecha y los definitivos aparecerán en la campanita y en el detalle del día. Los rechazados quedarán excluidos de ambos y se consultarán solo en la pestaña de eventos, según [RF-EVT-002 — Listar y consultar eventos](../../03_requisitos/01_funcionales/EVT/rf-evt-002-listar-consultar-eventos.md), [RF-EVT-003 — Rechazar y recuperar un evento](../../03_requisitos/01_funcionales/EVT/rf-evt-003-rechazar-recuperar-evento.md) y [RF-EVT-004 — Mostrar eventos en el calendario](../../03_requisitos/01_funcionales/EVT/rf-evt-004-mostrar-eventos-calendario.md).

Las consultas de fechas podrán relacionarse con un evento al crearlas o al resolverlas mientras sigan abiertas. Al elegir un evento nuevo para una consulta solo se mostrarán eventos no rechazados, sin fecha o con fecha provisional, que no estén vinculados a otra consulta abierta; los eventos rechazados deben recuperarse primero y los definitivos no se ofrecen. Una consulta vinculada exigirá aceptar una sola fecha. Si el evento está sin fecha o tiene fecha provisional, la fecha elegida quedará definitiva en él y la última modificación se atribuirá al participante que resolvió la consulta. Cada evento admitirá como máximo una consulta de fechas abierta y cada consulta abierta, como máximo un evento; el vínculo podrá cambiarse o quitarse antes de resolver. Tras cerrarse una consulta, el evento podrá vincularse a otra abierta y conservará en su ficha todas las consultas cerradas con las que estuvo vinculado. Cambiar solo el vínculo, sin cambiar campos propios del evento, no actualizará su última modificación ni el orden que depende de ella. El rechazo de la consulta no modificará el evento. Todas las consultas resueltas o rechazadas que hayan quedado vinculadas serán navegables desde la ficha del evento y cada ficha de consulta permitirá volver a él. Si el evento vinculado pasa a tener fecha definitiva antes de confirmar la resolución, se avisará antes de confirmarla de que la consulta no puede cambiarla; se conservará el vínculo, la consulta podrá resolverse y la persona podrá editar la fecha del evento desde su ficha. Si, excepcionalmente, sigue vinculado un evento ya rechazado al resolver, se ofrecerá desvincularlo y resolver aceptando la fecha o rechazar la consulta; cancelar el aviso dejará ambos sin cambios. La relación aprobada se recoge en [RN-EVT-003 — Vínculo entre evento y consulta de fechas abierta](../../03_requisitos/02_reglas-negocio/EVT/rn-evt-003-vinculo-consulta-abierta.md) y en los requisitos de consultas de fechas.

## Necesidades futuras — DEFINIDO

- Será necesario poder invalidar el enlace de acceso de un equipo vigente y generar uno nuevo que lo sustituya, según [RF-EQU-007 — Invalidar y sustituir el enlace de acceso al equipo](../../03_requisitos/01_funcionales/EQU/rf-equ-007-invalidar-y-sustituir-enlace.md). Esta capacidad queda fuera de la primera entrega; sus reglas de uso y la entrega que la incorporará están pendientes de definir.

## Otras posibilidades futuras — PROPUESTO

- Admitir consultas de respuesta única en una fase posterior.
- Usar etiquetas para clasificar consultas pendientes y decisiones tomadas.
- Permitir el acceso mediante un código, para reevaluarlo en una fase futura.
- Definir una caducidad propia de cada consulta, separada de la caducidad del equipo.
- Reservar el registro para futuras funciones avanzadas de configuración, permanencia o control del equipo.
- Permitir rechazar a posteriori una resolución ya registrada; aún no se ha definido qué efecto tendría.
- Reutilizar el desarrollo web para empaquetarlo como aplicación móvil instalable es el planteamiento inicial para esa entrega próxima. No se ha decidido la tecnología ni el empaquetado concreto.

## Excluido

En el alcance descrito hasta ahora no se prevén chat, comentarios en consultas, gestión documental ni subida de archivos.

## Ejemplos ilustrativos

Una cena entre amistades, una actividad de equipo profesional, ensayos de un grupo musical o la coordinación de disponibilidad para aceptar conciertos. Estos ejemplos no fijan reglas específicas para cada contexto.

## Preguntas

- ¿Con qué solución y requisitos específicos se entregará la aplicación móvil instalable posterior a la primera entrega?
