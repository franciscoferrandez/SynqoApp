---
id: ADR-COO-004
estado: aprobado
---
# ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC

## Contexto

La persona impulsora ha elegido Railway como hosting para la próxima preproducción pública y ha pedido que su infraestructura se mantenga como código en el repositorio. El entorno tendrá limpieza de datos y un juego de prueba enlazado desde la pantalla de creación. El mismo proceso de reset y carga podrá ejecutarse manualmente a demanda en la base local de desarrollo para facilitar la preparación y comprobación del juego; esta operación tendrá guardas de entorno/conexión y no se programará en desarrollo. Solo la preproducción ejecutará el proceso cada hora en punto, con el bloque demo de creación avisando del borrado e incluyendo temporizador, que también se mostrará en la barra superior general de las pantallas de equipo, conforme a [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](../../03_requisitos/01_funcionales/EQU/rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md). Si una ejecución programada se retrasa o falla, no se exige recuperación ni estado especial para este piloto. La programación de preproducción depende del despliegue efectivo; la herramienta local puede prepararse y verificarse antes. Los despliegues se iniciarán manualmente mientras la persona impulsora se familiariza con Railway; no se habilitará despliegue automatizado en esta etapa. También se documentará el trabajo cotidiano para desarrollo local.

La aplicación actual separa WEB y API; la API usa PostgreSQL e incluye un trabajador de correo y un comando de limpieza. La integración local de correo usa Mailpit. La evaluación factual y las limitaciones vigentes de Railway se recogen en [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../01_research/resr-coo-003-railway-iac-preproduccion.md).

## Drivers

- Preproducción funcional con aislamiento respecto a otros entornos; el correo real se incluye solo si se configura una alternativa segura y disponible.
- Infraestructura versionada y revisable en el repositorio.
- Despliegue reproducible, iniciado manualmente tras revisar el plan IaC.
- Base de datos persistente, correo externo y limpieza programada de preproducción.
- Reutilización local a demanda del proceso de reset/carga para desarrollar y comprobar el juego sin esperar al despliegue.
- Instrucciones completas y mantenibles para arrancar y operar el entorno local día a día.

## Opciones consideradas

| Opción | Evaluación |
|---|---|
| Railway | Seleccionado expresamente por la persona impulsora. Ofrece recursos de aplicación y PostgreSQL gestionado, entornos aislados e IaC TypeScript. |
| Render | Candidato gestionado en la comparación anterior; no satisface la selección humana vigente. |
| VPS autoadministrado | Mantendría flexibilidad, pero trasladaría al proyecto más operación de base, despliegues, copias y observabilidad. No es el objetivo seleccionado. |

## Decisión

- La preproducción se alojará en Railway, en un entorno persistente separado de cualquier otro entorno de Railway.
- La preproducción será de acceso público, con el límite de creación descrito en [RF-EQU-009 — Limitar la creación de equipos por origen efímero](../../03_requisitos/01_funcionales/EQU/rf-equ-009-limitar-creacion-por-origen-efimero.md).
- La configuración declarativa de recursos de Railway vivirá en `.railway/railway.ts` y se gestionará con Railway Infrastructure as Code y su CLI. Cada cambio de infraestructura se inspeccionará mediante un plan antes de aplicarlo. No se iniciará el entorno nuevo con los archivos heredados `railway.toml` o `railway.json` de Config as Code.
- El servicio HTTP de REL-002 combinará WEB Angular y API Symfony en una imagen FrankenPHP/Caddy, con un origen público y rutas `/api` dirigidas a la API, conforme a [ADR-COO-005 — Publicar WEB y API en un servicio HTTP combinado para REL-002](adr-coo-005-topologia-web-api-railway.md). Los límites lógicos de módulos permanecen separados; esta decisión define solo el empaquetado y despliegue HTTP de la preproducción.
- Los despliegues se iniciarán manualmente; REL-002 no incluirá triggers automáticos por cambios de código ni de infraestructura. La persona impulsora reconsiderará automatizarlos cuando se familiarice con el ecosistema. El procedimiento manual concreto y sus pasos de verificación se documentarán en el flujo de implementación.
- Las credenciales de Railway y del proveedor de correo permanecerán como secretos fuera del repositorio. El código podrá declarar referencias a variables de entorno y valores no secretos necesarios para cada ambiente.
- Railway no provee credenciales ni una cuenta de envío de correo. Su documentación indica que la salida SMTP está disponible en planes Pro o superiores; en Free, Trial y Hobby recomienda APIs HTTPS de proveedores transaccionales. No se ha elegido plan ni proveedor. Se podrá reevaluar una opción segura cuando haya credenciales; si no la hay, la ausencia de correo real no bloqueará la entrega de preproducción.
- El juego de prueba tendrá dos equipos de ejemplo: un grupo de amistades que organizan cenas y una banda de música. Cada equipo contará con disponibilidades deterministas calculadas como desplazamientos desde el lunes UTC de la semana del reset y unas pocas consultas de fechas y texto en estados diversos. El mismo comando permitirá restaurar el juego manualmente en la base local de desarrollo y programadamente en preproducción; no se habilitará ejecución automática en desarrollo ni en producción. En preproducción, la ejecución será cada hora en punto UTC, el formulario ofrecerá enlaces directos a ambos equipos e informará que los cambios se borrarán con el reset. Los equipos se podrán usar y modificar como equipos normales hasta el reset. El temporizador se mostrará en ese bloque y en la barra superior general de las pantallas de equipo. Si el Cron se retrasa o falla, el temporizador seguirá contando hacia el siguiente punto de hora UTC; no se exige recuperación ni estado especial en este piloto. La operación no modifica la retención normal del producto ni autoriza reiniciar otra base.
- El control de creación usa IP o clave de dispositivo, con un pool temporal separado de datos de equipo. Basta con obtener una; si se obtienen ambas, se aplican ambos contadores y se rechaza la creación cuando cualquiera alcance el máximo. Si no se obtiene ninguna, se rechaza por seguridad. Las filas obsoletas se eliminan al vencer su período y no quedan asociadas al equipo creado, conforme a [RF-EQU-009 — Limitar la creación de equipos por origen efímero](../../03_requisitos/01_funcionales/EQU/rf-equ-009-limitar-creacion-por-origen-efimero.md). El contenido funcional limpiado cada hora en preproducción no debe eliminar claves aún vigentes.
- Este ADR selecciona plataforma, mecanismo IaC y despliegue iniciado manualmente. No selecciona proveedor de correo, dominio remitente, plan Railway ni el procedimiento manual detallado de despliegue; esos puntos permanecen abiertos. La clave web de dispositivo se define en [RF-EQU-009 — Limitar la creación de equipos por origen efímero](../../03_requisitos/01_funcionales/EQU/rf-equ-009-limitar-creacion-por-origen-efimero.md). La URL de preproducción será pública. La decisión de no bloquear la entrega por falta de una alternativa segura de correo sí queda fijada.
- La selección de Railway para preproducción no autoriza por sí sola publicar producción ni determina su plataforma.

## Consecuencias positivas

- La topología y configuración de servicios quedan sujetas a revisión de código y pueden recrearse a partir de la definición versionada.
- Los entornos persistentes permiten aislar configuración y datos de preproducción.
- El inicio manual permite revisar cada despliegue mientras la persona impulsora se familiariza con Railway y la definición IaC.
- Una tarea programada de Railway es candidata para ejecutar el comando de limpieza ya existente si se concreta una cadencia compatible con su ejecución y supervisión.
- El reinicio del contenido de aplicación y la precarga de preproducción ocurren cada hora en punto; la carga local manual permite desarrollar y comprobar esa misma fixture antes de que el entorno remoto exista. Ningún entorno debe presentarse como almacén persistente de datos de prueba creados por usuarios.

## Consecuencias negativas

- La aplicación dependerá de los flujos y límites operativos de Railway para este ambiente; el coste del plan y la capacidad se deberán revisar antes de activar el servicio.
- Cada despliegue requiere intervención manual; la automatización queda fuera de REL-002 y requerirá una decisión posterior.
- Las tareas programadas no garantizan precisión al minuto y pueden saltarse una ejecución si una anterior no ha terminado; el piloto acepta que no haya recuperación automática ni indicador especial en ese caso.
- Un plan IaC puede modificar recursos persistentes; los cambios que borren o reemplacen datos necesitarán revisión operativa y procedimiento de recuperación.
- El borrado de la base activa no elimina automáticamente datos contenidos en las copias de seguridad de Railway.

## Evidencia / Research

[RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../01_research/resr-coo-003-railway-iac-preproduccion.md).

## Sustituye

No sustituye un ADR previo. La selección explícita de Railway reemplaza la candidatura provisional de Render descrita en [Alternativas de alojamiento del piloto](../03_alternativas/alternativas-alojamiento-piloto.md).

## Sustituido por

—
