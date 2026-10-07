---
id: RF-EQU-009
estado: en_revision
---
# RF-EQU-009 — Limitar la creación de equipos por origen efímero

## Requisito

El sistema debe limitar la creación de equipos según la cantidad de equipos que una IP o una clave de dispositivo haya usado para crear equipos satisfactoriamente durante un período configurable para el entorno. Basta con obtener una de las dos claves para aplicar el control. Si se obtienen ambas, se aplican ambos contadores y superar cualquiera impide nuevas creaciones. Si no se obtiene ninguna, se rechaza la creación por seguridad. El control no debe asociar las claves al grupo creado.

## Origen

Decisión expresa de quien impulsa Synqo: mantener por seguridad un pool temporal de IP o claves de dispositivo que crean equipos satisfactoriamente; borrar las filas al quedar obsoletas; y aplicar el control en desarrollo, preproducción y producción, con el número de equipos y el período configurables por entorno. Basta con obtener una clave para continuar; cuando se obtengan ambas se deben controlar ambas, y si ninguna está disponible se rechaza la creación.

## Precondiciones

La persona inicia una creación de equipo desde [RF-EQU-001 — Crear un equipo sin registro](rf-equ-001-crear-equipo.md).

## Criterios de aceptación

- Antes de la acción de creación, la pantalla informa del máximo aplicable al entorno y del período de control.
- El sistema contabiliza únicamente equipos creados satisfactoriamente; una solicitud rechazada o fallida no consume cupo.
- En preproducción, el valor inicial del límite es dos equipos por IP y por dispositivo durante 60 minutos.
- En desarrollo, el valor inicial del límite es dos equipos por IP y por dispositivo durante 60 minutos.
- En producción, el valor inicial del límite es cinco equipos por IP y por dispositivo durante 120 minutos.
- El máximo de equipos y el período se pueden configurar separadamente por entorno.
- En navegadores web se utiliza como clave de dispositivo un identificador aleatorio opaco, generado con un generador criptográfico del navegador y persistido como dato first-party del sitio para reutilizarlo entre solicitudes. No se emplea huella digital del dispositivo ni se intenta identificar a una persona. La implementación debe proteger el valor en tránsito y guardar en el pool únicamente una representación no reversible adecuada para comparar claves.
- Se aplica un contador por cada clave disponible. Si se obtienen IP y dispositivo, se aplican ambos contadores en paralelo y se rechaza la creación si cualquiera alcanzó su máximo configurado.
- Si no se puede obtener ni la IP ni la clave de dispositivo, incluso por restricciones del navegador para generar o persistir la clave, se rechaza la creación por seguridad.
- Si el origen ya ha alcanzado el límite, la creación se rechaza con el mensaje genérico: «Has alcanzado el límite de creación de equipos. Inténtalo de nuevo más tarde.» El mensaje no revela qué clave activó el límite ni informa de datos internos del control.
- La información de IP o dispositivo disponible para limitar se mantiene en un pool temporal independiente de los datos del grupo, no se vincula al UUID del equipo y se elimina al vencer el período configurado.
- Las filas cuya ventana de control ha vencido se eliminan del pool efímero; el proceso de depuración no debe borrar filas que todavía formen parte de una ventana vigente.
- La limpieza horaria del contenido de aplicación de preproducción no elimina anticipadamente entradas del pool cuyo período aún no ha vencido.

## Casos límite

- Si el navegador borra o no conserva el identificador first-party, el control continúa con las claves disponibles; si no se obtiene ninguna clave, se rechaza la creación.
- El control es una medida básica contra la creación abusiva, no una identidad persistente ni una protección contra una persona que pueda cambiar o borrar el almacenamiento del navegador.

## Relaciones

- [RF-EQU-001 — Crear un equipo sin registro](rf-equ-001-crear-equipo.md)
- [RF-EQU-008 — Mostrar el temporizador del reinicio de preproducción](rf-equ-008-mostrar-temporizador-reinicio-preproduccion.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)
