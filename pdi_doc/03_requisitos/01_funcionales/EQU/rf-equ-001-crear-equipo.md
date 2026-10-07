---
id: RF-EQU-001
estado: en_revision
---

# RF-EQU-001 — Crear un equipo sin registro

## Requisito

El sistema debe permitir crear desde un formulario directo un equipo con nombre y primer participante, sin exigir registro ni inicio de sesión.

## Origen

- [HU-EQU-001 — Crear un equipo sin registro](../../../01_producto/07_historias-usuario/hu-equ-001-crear-equipo.md)
- Decisión expresa de quien impulsa Synqo: al crear el equipo son obligatorios su nombre y el del primer participante; el formulario se muestra directamente al abrir Synqo sin un enlace de equipo.
- Decisión expresa de quien impulsa Synqo: el primer participante queda seleccionado automáticamente en el navegador creador. Por defecto, tras crear el equipo se muestra una confirmación con acceso al calendario; una configuración interna puede omitir ese paso.

## Precondiciones

Ninguna cuenta es necesaria para iniciar la creación.

## Criterios de aceptación

- Una persona sin cuenta puede crear un equipo y comenzar a usarlo.
- Para crear el equipo es obligatorio escribir un nombre de hasta 50 caracteres según [RD-EQU-006 — Nombre del equipo](../../03_datos/EQU/rd-equ-006-nombre-equipo.md).
- Para crear el equipo es obligatorio escribir el nombre del primer participante, de hasta 50 caracteres según [RD-EQU-001 — Identidad de participante del equipo](../../03_datos/EQU/rd-equ-001-identidad-participante.md); el equipo comienza con esa identidad disponible y seleccionada automáticamente en el navegador creador.
- Al terminar la creación se muestra por defecto una confirmación con el enlace del equipo y una acción para entrar al calendario bajo la identidad recién seleccionada, sin pedir que vuelva a seleccionarla.
- Una configuración interna puede desactivar la confirmación y llevar directamente al calendario tras crear el equipo.
- En preproducción pública, el formulario presenta un bloque informativo de demo con enlaces directos a los dos equipos de ejemplo precargados, el aviso de que sus cambios se borran con el reset horario y el temporizador al siguiente punto de hora UTC, conforme a [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md).
- El equipo creado recibe un UUID único según [RD-EQU-007 — Identificador del equipo](../../03_datos/EQU/rd-equ-007-identificador-equipo.md) y dispone de un enlace de acceso único que puede compartirse. Su nombre puede coincidir con el de otro equipo.
- El enlace puede copiarse y, si el dispositivo lo permite, compartirse mediante su diálogo de compartir.

## Casos límite

Si falta el nombre del equipo o el del primer participante, no se completa la creación. El diálogo del dispositivo es opcional cuando no está disponible. El enlace creado no admite invalidación ni sustitución en la primera entrega, según [RF-EQU-003 — Acceder al equipo por enlace](rf-equ-003-acceder-por-enlace.md).

## Decisiones pendientes para la siguiente entrega

Estas preguntas no alteran el alcance entregado de [REL-001 — Demo local operativa de Synqo](../../../01_producto/10_entregas/rel-001-demo-local-operativa.md). Los acuerdos descritos se consideran aprobados; solo quedan pendientes los puntos concretos que se indican en cada apartado y que afectan a la definición detallada de nuevas capacidades ligadas al formulario de creación.

1. **Juego de prueba:** la preproducción tendrá dos equipos de ejemplo precargados en la base, uno de amistades que organizan cenas y otro de una banda de música. El bloque informativo del formulario enlazará directamente a ambos equipos para que se pueda explorar el producto. Se podrán usar como equipos normales, bajo una identidad participante, y sus datos podrán modificarse hasta el siguiente reset. Las disponibilidades se generan determinísticamente como desplazamientos en días desde el lunes UTC de la semana en que se ejecuta el reset y abarcan desde el primer día del mes natural anterior hasta el último día del tercer mes natural futuro. Incluyen, entre otros, los offsets -7 (lunes anterior), 7 (lunes siguiente), 14 (el lunes de dentro de dos semanas) y los días equivalentes del resto de la semana. Las consultas de fechas solo ofrecerán opciones futuras distribuidas a lo largo de ese horizonte, sin opciones pasadas. El juego también incluirá unas pocas consultas de fechas y texto en distintos estados y con valores variados.
2. **Límite de creación:** basta con obtener IP o clave de dispositivo para aplicar el control; si se obtienen ambas, se evalúan ambas. La creación se bloquea si cualquiera de los contadores disponibles alcanzó su máximo, y también si no se obtiene ninguna clave. En web, la clave de dispositivo será aleatoria, opaca y first-party; no se hará fingerprinting. Al alcanzar el límite se mostrará un mensaje genérico para intentarlo más tarde. Los datos se registran temporalmente tras una creación exitosa, sin asociarlos al equipo, y las filas obsoletas se eliminan al vencer el período de control. La regla aplica en desarrollo, preproducción y producción, con máximo y período configurables por entorno. Los detalles están en [RF-EQU-009 — Limitar la creación de equipos por origen efímero](rf-equ-009-limitar-creacion-por-origen-efimero.md).
3. **Temporizador:** el reset está decidido para el minuto 00 de cada hora en UTC. Para este piloto no habrá estado especial, recuperación ni bloqueo de entrega si el trabajo cron se retrasa o falla; el temporizador seguirá contando hacia el siguiente punto de hora. Railway Cron puede retrasarse unos minutos y omite una ejecución si la anterior sigue activa, según [RESR-COO-003 — ¿Cómo modelar y operar la preproducción de Synqo en Railway?](../../../05_investigacion-y-decisiones/01_research/resr-coo-003-railway-iac-preproduccion.md).

**Gate afectado:** baseline funcional para crear la próxima REL y preparar los Changes de juego de prueba y control de creación.

## Relaciones

- [RF-EQU-003 — Acceder al equipo por enlace](rf-equ-003-acceder-por-enlace.md)
- [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md)
- [RF-EQU-009 — Limitar la creación de equipos por origen efímero](rf-equ-009-limitar-creacion-por-origen-efimero.md)
- [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](rf-equ-006-enviar-enlace-por-correo.md)
- [RN-EQU-005 — Equipo con al menos un participante](../../02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md)
- [RD-EQU-006 — Nombre del equipo](../../03_datos/EQU/rd-equ-006-nombre-equipo.md)
- [RD-EQU-007 — Identificador del equipo](../../03_datos/EQU/rd-equ-007-identificador-equipo.md)
