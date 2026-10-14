---
id: ADR-EQU-005
estado: aprobado
---
# ADR-EQU-005 — Conservar UUID y limitar el reset a los equipos demo configurados

## Evolución de vigencia — 2026-10-14

La persona impulsora amplía expresamente la decisión del 2026-10-12: **en desarrollo, preproducción y producción, el comando de reset solo puede borrar datos de los equipos identificados como demo en `DEMO_TEAM_IDS`**. Queda sustituida la decisión anterior de que el perfil local pudiera borrar todos los equipos. La misma regla rige al reproducir localmente los valores de otro entorno: solo puede operar sobre una base local permitida y nunca autoriza por sí misma una conexión remota.

El proceso debe fallar sin cambios si la variable falta, la lista no identifica exactamente las dos raíces demo válidas o no coincide con sus credenciales derivadas vigentes. En cada entorno se configura su propio `DEMO_ACCESS_SECRET`; no se comparte entre desarrollo, preproducción y producción. La inicialización crea equipos demo y devuelve sus UUID, pero no borra ni altera equipos que ya existan.

Antes de mutar datos, el comando informa claramente del entorno: verde para desarrollo y otros entornos distintos de preproducción/producción, naranja para preproducción y rojo para producción. La operación interactiva pide confirmación. Una ejecución no interactiva solo puede continuar con `--force --no-interaction`; esos flags no omiten las comprobaciones de entorno, base de datos, lista de UUID ni credenciales. La persona impulsora confirma el 2026-10-14 que producción también podrá ejecutar un Cron cada hora en punto UTC, como preproducción. Se habilitará por separado y solo tras configurar UUID/secretos/destino y validar manualmente el reset; esta decisión no crea ni despliega infraestructura de producción.

Para bases remotas de Railway, además de exigir el perfil de despliegue correspondiente, el proceso debe verificar el hostname privado esperado contra la conexión real y el nombre del entorno Railway correspondiente. Para una simulación local, solo se permite la lista de hosts PostgreSQL locales; `APP_ENV`, los colores y las variables de presentación no pueden autorizar otro destino.

**Evolución aprobada el 2026-10-14:** el Cron horario de producción será compatible con cualquier plataforma de programación. La selección de Railway para preproducción no selecciona una plataforma para producción. El scheduler elegido cuando exista producción deberá invocar el mismo comando con `--force --no-interaction` y la configuración propia de ese entorno; antes de mutar, el comando comprobará `APP_ENV=prod`, `SYNQO_DEPLOYMENT_ENV=production`, `DEMO_RESET_ENABLED`, el host esperado exacto frente a PostgreSQL y la identidad de los dos UUID mediante el secreto propio de producción. El Cron no se activará sin UUID/secretos configurados y una validación manual satisfactoria. No se declara ni aplica IaC de producción en esta decisión.

## Contexto

La persona impulsora pide el 2026-10-12 que los grupos no demo persistan en preproducción y aclara que desea configurar los UUID de los demo una vez creados, manteniendo sus raíces y limpiando desde los siguientes niveles en cascada. El comportamiento funcional vigente se recoge en [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](../../03_requisitos/01_funcionales/EQU/rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md). La derivación existente está definida en [ADR-EQU-004 — Derivar credenciales estables para los equipos demo](adr-equ-004-credenciales-estables-equipos-demo.md).

## Drivers

- Conservar datos y enlaces de los grupos reales frente al Cron.
- Configurar una lista estable y explícita; detectar identificaciones erróneas sin pérdida parcial.
- Desplegar un cambio pequeño con una migración aditiva y sin dependencia nueva.
- Mantener las guardas de destino y la inicialización sin borrar equipos existentes.

## Opciones consideradas

1. Selector por hashes derivados y sustitución de raíces: no necesita variable nueva, pero regenera UUID y dificulta una lista operativa estable.
2. UUID configurados y raíces conservadas: permite configuración estable y limpieza selectiva mediante cascadas existentes. Seleccionada tras la aclaración humana.
3. Columna demo con identidad única: independiza identificación y secreto, pero necesita migración/asignación de equipos existentes.
4. Nombres: descartados porque no son únicos.

## Decisión

Aprobación de la persona impulsora el 2026-10-12: configurar los UUID de los equipos demo y conservar las filas de equipo, limpiando sus niveles dependientes. El contrato operativo concreto para realizar esa decisión es:

- `DEMO_TEAM_IDS` se exige para cualquier reset. Ausente produce error; definida como cadena vacía produce éxito sin modificar ni cargar datos, para permitir preparar la inicialización sin riesgo. Si no está vacía, contiene exactamente dos UUID distintos separados por coma; se admiten espacios alrededor y mayúsculas, que se normalizan. No admite valores desconocidos, duplicados ni una lista parcial. Un Cron requiere que estén configurados los dos UUID.
- Seleccionar por UUID con bloqueo de filas y exigir además una coincidencia exacta de sus verificadores con los dos hashes derivados. El orden de la lista y los nombres no determinan la identidad. Esto evita que una configuración accidental convierta un equipo real en demo.
- Conservar UUID, credenciales y fecha de creación de las raíces. Restaurar nombre, zona UTC y última actividad de los demo. Eliminar consultas, disponibilidades, intentos de correo y participantes solo de las raíces seleccionadas; las cascadas existentes eliminan opciones, votos y resoluciones. Los participantes se recrean, por lo que sus UUID pueden cambiar.
- Mantener transacción y advisory lock. Comprobar que se actualizan exactamente las dos raíces esperadas y que no quedan dependientes previos antes de cargar la fixture. Cualquier discrepancia o fallo provoca rollback y salida no cero con diagnóstico seguro.
- `--initialize` es una operación manual separada. Exige `DEMO_TEAM_IDS` definida y vacía en cualquier entorno y nunca borra ni modifica equipos preexistentes. Por defecto, la tabla de equipos debe estar vacía; `--allow-non-empty` permite crear los demo junto a equipos existentes y falla si ya detecta credenciales demo cargadas. Un bloqueo de tabla excluye creaciones concurrentes mientras se comprueba y carga. Genera UUID y muestra solo sus identificadores en salida automatizada para configurar la lista. No aparece en el comando programado.
- Tras la precisión humana del 2026-10-12, cada reset conserva el UUID pero revoca los enlaces anteriores. `team.demo_access_generation` guarda únicamente la versión activa; el token se deriva con HMAC de secreto, identidad lógica y versión, y su verificador reemplaza al anterior dentro de la misma transacción. `/api/configuration` obtiene los UUID configurados, lee su versión actual y publica el enlace vigente. No se persiste historial de tokens ni filas de caducidad. La versión 0 conserva compatibilidad con los enlaces existentes hasta el primer reset posterior a la migración.
- El reset selectivo de las raíces demo es el mismo en desarrollo, preproducción y producción; no existe un camino del comando que reemplace todos los equipos. Cada entorno que reinicia demos tiene su propio `DEMO_ACCESS_SECRET` de al menos 32 bytes; el token se deriva de ese secreto, la identidad lógica y su generación activa.
- El código HTTP puede servir peticiones aunque `DEMO_TEAM_IDS` falte; esa variable es necesaria para publicar enlaces demo y para cualquier reset que modifique datos.

## Consecuencias positivas

Conserva raíces e identidad operativa, invalida inmediatamente los enlaces anteriores a cada reset y no acumula historial. Solo añade una columna entera por equipo; no cambia el contrato HTTP.

## Consecuencias negativas

HTTP y Cron necesitan el mismo valor operativo de `DEMO_TEAM_IDS` cuando se invoque el comando desde ambos. Una lista incorrecta o la ausencia de un demo bloquea el reset. La rotación de `DEMO_ACCESS_SECRET` sigue requiriendo una operación dirigida y coordinación HTTP/Cron. Los equipos reales continúan sujetos a la caducidad/retención normal y a los límites operativos del hosting.

## Evidencia / Research

`DemoFixture::accessKey()` tiene dos identidades estables; las migraciones actuales incluyen cascadas y no imponen unicidad al verificador. [PostgreSQL 18 — bloqueo explícito](https://www.postgresql.org/docs/18/explicit-locking.html) documenta bloqueo de filas y de tabla; [PostgreSQL 18 — DELETE](https://www.postgresql.org/docs/18/sql-delete.html) documenta borrado condicionado y conteo. No se usa el conteo de participantes como número de equipos: sus cantidades dependen de las modificaciones de usuarios.

## Sustituye

Sustituye parcialmente la decisión anterior de reset local global de [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](adr-coo-004-preproduccion-railway-iac.md) y la limitación de credenciales demo solo a preproducción de [ADR-EQU-004 — Derivar credenciales estables para los equipos demo](adr-equ-004-credenciales-estables-equipos-demo.md). Conserva el resto de ambas decisiones.

## Sustituido por

No aplica.
