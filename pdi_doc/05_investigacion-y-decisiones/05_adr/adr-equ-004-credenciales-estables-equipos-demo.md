---
id: ADR-EQU-004
estado: aprobado
---

# ADR-EQU-004 — Derivar credenciales estables para los equipos demo

## Contexto

[SPEC-EQU-006 — Publicación y reset programado del juego demo en preproducción](../../08_especificaciones/01_activas/spec-equ-006-juego-demo-preproduccion.md) necesita que los enlaces de los equipos demo sigan disponibles después de cada reset horario. El reset actual genera tokens aleatorios y PostgreSQL solo conserva su hash; el proceso HTTP no puede reconstruir el valor original. Los enlaces demo son públicos por decisión de producto, pero la API y los logs no deben almacenar ni revelar credenciales de otros equipos.

## Drivers

- Enlaces públicos de los dos equipos demo disponibles de nuevo tras cada reset.
- Mantener la separación entre identidad y credencial y el verificador irreversible del acceso.
- No conservar tokens recuperables en PostgreSQL ni en el repositorio.
- Compartir configuración entre el servicio HTTP y el Cron sin introducir un almacén adicional.
- Mantener el perfil normal de creación de equipos con tokens aleatorios.

## Opciones consideradas

1. Derivar tokens deterministas para los dos equipos demo desde un secreto dedicado de preproducción; almacenar únicamente el SHA-256 del token.
2. Guardar los tokens generados cifrados y añadir una clave, persistencia y proceso de rotación para recuperarlos.
3. Cambiar el requisito y no ofrecer enlaces directos tras el reset.

La primera opción evita persistir valores recuperables y no añade tablas ni servicios; la segunda aumenta el material secreto y el ciclo operativo; la tercera elimina la capacidad de demo solicitada.

## Decisión

**Aprobada por la persona que impulsa Synqo el 2026-10-08:** solo los dos equipos de demostración usarán tokens estables derivados. Se utilizará `DEMO_ACCESS_SECRET`, una clave aleatoria de al menos 32 bytes, configurada fuera del repositorio en el entorno preproduction y compartida por el servicio HTTP y el proceso de reset. Para cada identificador lógico fijo del equipo demo, la aplicación calculará `HMAC-SHA-256(DEMO_ACCESS_SECRET, "synqo:demo:<id-logico>")` y codificará los 32 bytes resultantes como Base64 URL-safe sin padding. El identificador lógico no dependerá del nombre visible del equipo.

El reset almacenará únicamente `SHA-256(token)` como verificador, igual que el flujo actual. La API derivará el mismo valor, localizará el equipo cuyo verificador coincide y devolverá el enlace demo público sin cachear la respuesta. Ningún log incluirá el token, el enlace completo ni el secreto. Si el secreto falta o no cumple el mínimo, el reset falla sin modificar datos y la API no publica enlaces demo. Los equipos que no pertenezcan a la fixture seguirán usando tokens aleatorios conforme a [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](adr-equ-003-verificar-enlace-en-api.md).

La rotación de `DEMO_ACCESS_SECRET` requiere ejecutar satisfactoriamente un reset después de desplegar el nuevo valor y antes de volver a presentar enlaces; hasta entonces los enlaces derivados y los verificadores existentes no coincidirían. La configuración de preproducción no se copia a desarrollo ni a producción.

## Consecuencias positivas

- Los enlaces de demo se reconstruyen después de cada reset sin guardar tokens en claro o cifrados en PostgreSQL.
- El token conserva 256 bits de salida y es impredecible sin el secreto de derivación.
- La solución no cambia el generador aleatorio del resto de equipos ni añade infraestructura.

## Consecuencias negativas

- API y Cron deben recibir el mismo secreto dedicado, con disponibilidad y rotación coordinadas.
- Una rotación sin reset coordinado deja temporalmente inválidos los enlaces demo.
- Al ser una demo pública, el enlace derivado concede el acceso previsto a esos equipos; no debe reutilizarse para equipos reales.

## Evidencia / Research

- El `DemoResetService` y `OrmDemoResetRepository` actuales limitan el reset a desarrollo local; el repositorio persiste el hash del token y devuelve el token original únicamente al proceso llamante.
- [PHP — hash_hmac](https://www.php.net/manual/en/function.hash-hmac.php) documenta HMAC con clave compartida y SHA-256.
- [Railway — Variables Reference](https://docs.railway.com/variables/reference) documenta variables de servicio, incluida la referencia al dominio privado.
- [ADR-EQU-001 — Separar el identificador del equipo de su valor de acceso](adr-equ-001-separar-identidad-y-acceso.md) y [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](adr-equ-003-verificar-enlace-en-api.md).

## Sustituye

Ninguna decisión anterior. Concreta una excepción limitada a equipos de demostración sobre la generación aleatoria descrita en ADR-EQU-003; no sustituye ese contrato para otros equipos.

## Sustituido por

No aplica.
