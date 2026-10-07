# Alternativas — Alojamiento de la primera entrega del piloto

## Pregunta

¿Qué forma de alojamiento permite operar el piloto completo de Synqo con datos persistentes, acceso web desde móvil y escritorio, correo opcional y borrado programado, sin imponer una plataforma de aplicación móvil instalable?

## Contexto y criterios

Quien impulsa Synqo no ha impuesto proveedor, infraestructura propia ni presupuesto máximo y solicita una propuesta para el piloto. Ha confirmado que los participantes estarán principalmente en Europa, sin expresar por ello una obligación de residencia de datos. El objetivo de preparación abarca toda la primera entrega, según el [estado documental](../../00_gobierno/02_estado-documentacion.md).

Se comparan estas capacidades, antes de elegir proveedor:

- Ejecutar la aplicación web y sus operaciones de equipo, disponibilidad y consultas conforme al [alcance conceptual](../../01_producto/04_alcance/alcance-conceptual.md).
- Conservar datos de forma persistente y ejecutar la caducidad y el borrado de [RN-EQU-003 — Borrado de equipos caducados](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md).
- Ejecutar el intento de correo sin bloquear la creación, conservar su resultado y eliminar el dato efímero según [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md) y [RD-EQU-005 — Correo transitorio para enviar el enlace](../../03_requisitos/03_datos/EQU/rd-equ-005-correo-transitorio-enlace.md).
- Operar copias de seguridad, registros y secretos con un esfuerzo proporcionado a un piloto limitado. El producto ya distingue el borrado de la base activa del vencimiento posterior de las copias según [RN-EQU-003 — Borrado de equipos caducados](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-003-borrado-equipo.md); quedan por concretar su plazo de conservación y la restauración segura.

## Opciones

| Opción | Encaje | Costes y límites por comprobar |
|---|---|---|
| A. Plataforma gestionada con aplicación web, base relacional gestionada y procesos programados o de trabajo | Permite agrupar los componentes del piloto bajo un proveedor y reducir tareas de administración del servidor. Render ofrece servicios web, PostgreSQL, trabajadores y tareas programadas; sus Blueprints permiten describirlos juntos. | Un trabajador separado y la base gestionada tienen costes operativos que deben presupuestarse. La garantía de un solo intento de correo, la limpieza de tareas pendientes y el borrado en copias no se obtienen automáticamente por usar esos servicios. |
| B. Servidor propio o VPS con aplicación y base de datos administradas por el proyecto | Da control directo del despliegue y de las tareas periódicas; puede ser suficiente para un piloto pequeño. | El proyecto asume actualizaciones, copias, recuperación, supervisión y seguridad del servidor. El ahorro o coste depende de la infraestructura y del tiempo de operación disponibles, hoy desconocidos. |
| C. Servicios gestionados separados para web, base de datos y funciones | Permite seleccionar cada componente por separado. Un servicio de funciones como Supabase Edge Functions admite trabajo tras la respuesta HTTP. | La coordinación entre proveedores y la recuperación de tareas interrumpidas requieren diseño explícito. El trabajo en segundo plano de una función tiene límites de ejecución y no resuelve por sí solo la durabilidad del envío pendiente. |

## Evidencia técnica

- [Render — tipos de servicio](https://render.com/docs/service-types): web, PostgreSQL, trabajadores y tareas programadas.
- [Render — Blueprints](https://render.com/docs/infrastructure-as-code): configuración conjunta de servicios y datos.
- [Render — recuperación y exportaciones](https://render.com/docs/postgresql-backups): la recuperación a un momento anterior crea otra instancia para comprobarla antes del cambio; actualmente la ventana recuperable es de tres días en Hobby y siete en Pro o superior. Las exportaciones lógicas permanecen siete días en Render, pero una descarga externa puede conservarse por separado y exige su propia política.
- [Render — tareas programadas](https://render.com/docs/cronjobs): admite ejecutar y observar tareas periódicas; la programación usa UTC y cada tarea tiene como máximo una ejecución activa.
- [Render — regiones](https://render.com/docs/regions): Frankfurt está disponible para aplicación y base de datos; la región de un servicio existente no puede cambiarse sin migrarlo.
- [Render — planes de cómputo](https://render.com/docs/compute-plans): el escalón de pago menor para web, trabajador y tarea programada tiene 0,5 CPU y 512 MB; el menor de PostgreSQL tiene 0,1 CPU y 256 MB. El espacio de PostgreSQL se contrata aparte y puede empezar en 1 GB, según [creación de PostgreSQL](https://render.com/docs/postgresql-creating-connecting).
- [Render — precios orientativos](https://render.com/articles/production-rails-hosting-guide): en un ejemplo publicado en septiembre de 2026, web y trabajador mínimos cuestan 7 USD/mes cada uno y PostgreSQL mínimo, 6 USD/mes. La [tarifa general](https://render.com/pricing) indica Hobby sin cuota fija, Pro con 25 USD/mes adicionales y almacenamiento PostgreSQL a 0,30 USD por GB y mes. Son precios de proveedor sujetos a revisión.
- [Render — trabajadores](https://render.com/docs/background-workers): funcionan de forma continua y normalmente consumen trabajos de una cola; no son el único modo de ejecutar tareas fuera de la petición web.
- [Render — Workflows](https://render.com/docs/workflows): inicia cómputo por tarea y gestiona la cola; [reintenta por defecto hasta tres veces](https://render.com/docs/workflows-defining), aunque [la configuración de la tarea permite definir los reintentos](https://render.com/docs/workflows-sdk-python). Su [estado de tarea conserva argumentos y resultados durante 30 días](https://render.com/docs/workflows-limits), por lo que un correo transitorio no debería viajar como argumento ni resultado si se usa esta vía.
- [PostgreSQL — volcados SQL](https://www.postgresql.org/docs/current/backup-dump.html): un volcado conserva una imagen coherente del instante en que empieza. Restaurarlo puede reproducir datos que ya se eliminaron después de ese instante.
- [Supabase — tareas en segundo plano](https://supabase.com/docs/guides/functions/background-tasks): funciones que pueden continuar después de responder y límites de ejecución; se usa como ejemplo de la opción C.

## Propuesta operativa para contrastar

Si se elige la opción A con Render, estudiar una aplicación web, PostgreSQL de pago y una tarea periódica de caducidad y borrado. Frankfurt es una región candidata para el piloto principalmente europeo; no se ha impuesto una obligación de residencia. La base gratuita no encaja con esta propuesta de recuperación porque Render no le proporciona PITR. Entre las variantes de pago, siete días de recuperación en Pro ofrecen más margen que los tres de Hobby; los costes orientativos figuran más abajo. No se propone almacenar exportaciones indefinidamente ni añadir un segundo repositorio de copias en el piloto sin justificar su necesidad y su plazo de eliminación.

La tarea de borrado debe poder repetirse con seguridad y seleccionar por la **caducidad efectiva** de cada equipo más el plazo adicional configurado, no por la hora de la última visita ni por el momento de creación de la copia. La programación periódica no equivale a un borrado exactamente en el instante de vencimiento: mientras se ejecuta, la comprobación de acceso debe seguir denegando equipos caducados. La periodicidad admisible y cómo supervisar fallos de la tarea quedan por fijar en arquitectura y operación.

Para recuperar una base desde una copia anterior al borrado de algún equipo, la propuesta es restaurar **en una instancia aislada**, sin tráfico de usuarios ni ejecución automática de trabajos externos; aplicar allí las reglas de caducidad y borrado con el tiempo actual; verificar que los equipos ya vencidos no son accesibles y que los datos cuyo plazo terminó se han eliminado; y solo entonces conectar la aplicación a la base restaurada. Si existe una cola de correo en la misma base, también debe impedirse que una restauración reenvíe eventos ya intentados; su mecanismo se decidirá junto con el envío. Esta secuencia es una inferencia de las reglas de producto y del comportamiento de las copias, no una capacidad automática de Render.

Una ventana de recuperación de tres o siete días implicaría que los datos anteriores al borrado podrían figurar en una copia recuperable durante esa ventana; después deben desaparecer conforme al vencimiento real de las copias del proveedor. Antes de escoger plan y proveedor hay que comprobar sus condiciones de retención y supresión para **todas** las copias, incluidas exportaciones descargadas o copias adicionales. La ventana de PITR publicada indica hasta cuándo se puede restaurar; por sí sola no acredita cuándo se eliminan internamente todos los fragmentos de copia.

## Capacidad y coste ilustrativos de Render

Los importes siguientes son **referencias temporales de octubre de 2026**, en USD por mes, para una instancia siempre activa de cada servicio cuando corresponda. No constituyen presupuesto ni selección de plan: el consumo, la región, el proveedor de correo y la capacidad real siguen sin medirse. El cómputo se factura proporcionalmente al tiempo activo y la tarea programada tiene un mínimo de 1 USD/mes; su ejecución puede costar más.

| Componente de comparación | Escalón publicado | Coste orientativo |
|---|---|---:|
| Web dinámica | `0.5c-512mb`, 0,5 CPU y 512 MB | 7 USD/mes |
| PostgreSQL de pago | `0.1c-256mb`, 0,1 CPU y 256 MB | 6 USD/mes + almacenamiento |
| Almacenamiento PostgreSQL | 1 GB inicial posible, 0,30 USD/GB/mes | 0,30 USD/mes para 1 GB |
| Tarea programada de caducidad y borrado | `0.5c-512mb`, cobro por ejecución | desde 1 USD/mes |
| Trabajador continuo para correo, **si se elige** | `0.5c-512mb`, 0,5 CPU y 512 MB | +7 USD/mes |
| Espacio de trabajo Hobby / Pro | Hobby sin cuota; Pro ofrece siete días de PITR frente a tres | +0 / +25 USD/mes |

La suma puramente aritmética del escenario mínimo con Hobby, web, PostgreSQL de 1 GB y una tarea programada sería **desde 14,30 USD/mes**; con un trabajador continuo, **desde 21,30 USD/mes**. Pro añade 25 USD/mes. Estas cifras no incluyen el coste del proveedor de correo, tráfico o compilación por encima de los cupos, mayor base de datos, tareas más largas, exportaciones externas ni posibles impuestos. Tampoco prueban que 256 MB de base o 512 MB de web alcancen para la implementación elegida: se necesita una prueba de carga representativa antes de seleccionar recursos.

Un trabajador de correo siempre activo **no es indispensable por el mero hecho de que el correo sea asíncrono**. Se pueden comparar: (a) consumir eventos pendientes desde una tarea programada, posiblemente junto a la tarea de mantenimiento si su frecuencia y aislamiento operativo lo permiten; (b) disparar una tarea bajo demanda de Workflows después de registrar el evento; y (c) usar un trabajador continuo. La opción (a) evita otro servicio permanente, pero introduce espera hasta la siguiente ejecución y requiere vigilar fallos. La opción (b) evita el servicio permanente, pero debe desactivar explícitamente los reintentos predeterminados, pasar únicamente un identificador opaco del evento y resolver el caso en que el registro del evento se confirme pero el disparo falle. La opción (c) reduce la espera y facilita consumo continuo, con coste fijo adicional y una cola o tabla de eventos duradera. Ninguna opción garantiza por sí sola un único intento ni el conocimiento del resultado; el adaptador de correo y la política de eventos se definirán en su investigación específica.

## Evaluación provisional

La opción A es la **candidata inicial** para el piloto: reúne los componentes conocidos y deja al equipo concentrarse en la aplicación. Render es un ejemplo concreto que cubre esos tipos de servicio; todavía no es un proveedor elegido. La opción B sigue siendo viable si aparece infraestructura propia o capacidad operativa. La opción C requeriría justificar por qué la composición adicional mejora el resultado.

Antes de aceptar una arquitectura de alojamiento hay que concretar presupuesto, objetivo de recuperación aceptable para el piloto, condiciones contractuales de retención y supresión de copias, frecuencia y supervisión del borrado, ensayo de restauración aislada y capacidad medida de los componentes. [ADR-EQU-002 — Registrar el envío opcional como evento transaccional](../05_adr/adr-equ-002-evento-transaccional-correo.md) propone un patrón de persistencia del correo; su procesador y la limpieza de eventos pendientes requieren diseño adicional. Esta comparación no asigna tecnología de frontend, backend ni proveedor de correo.

## Estado y alcance de esta comparación

Esta comparación se elaboró para el piloto anterior y dejó Render como candidato provisional, no elegido. La selección humana posterior de Railway para la nueva preproducción está registrada en [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../05_adr/adr-coo-004-preproduccion-railway-iac.md), respaldado por [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../01_research/resr-coo-003-railway-iac-preproduccion.md). La evaluación de Render de este documento no prevalece sobre esa decisión.

El alcance comunicado es una preproducción funcional y pública para usuarios de prueba; el correo externo es deseado pero no bloquea la entrega si no hay alternativa segura disponible. La persona impulsora ha decidido que el contenido de aplicación de su base se limpie y precargue cada hora en punto UTC. El temporizador se mostrará en el bloque demo de la pantalla de creación —con aviso de borrado de los cambios— y en la barra superior general de las pantallas de equipo. Para este piloto, si el cron se retrasa o falla no habrá recuperación ni estado especial; el temporizador seguirá contando hacia la siguiente hora. El pool del control de creación se mantendrá separado de los datos de los equipos y las entradas vencerán al terminar el período configurado, según [RF-EQU-009 — Limitar la creación de equipos por origen efímero](../../03_requisitos/01_funcionales/EQU/rf-equ-009-limitar-creacion-por-origen-efimero.md). El control usará IP o clave de dispositivo: basta con obtener una; si están ambas disponibles, se aplican ambos límites y superar cualquiera bloquea la creación; si ninguna está disponible, se bloquea por seguridad. Los máximos iniciales serán 2/60 minutos en desarrollo y preproducción y 5/120 minutos en producción, configurables por entorno. Quedan por concretar la región y el coste aceptable, el proveedor y remitente de correo, el mecanismo técnico para obtener la clave de dispositivo y el disparador de despliegue automático. Ninguna de estas decisiones se deriva solo de la selección de Railway.

El acceso público queda decidido. Para el despliegue, se puede conectar la rama principal al autodeploy de Railway o usar CI para aplicar/deployar tras los checks; el mecanismo exacto debe elegirse con el flujo de ramas del repositorio.
