# ADR-016 — Jobs con pg-boss sobre PostgreSQL

**Estado:** Accepted — revised

## Contexto
Casos asíncronos reales: email de verificación/recuperación, email transaccional, lifecycle/limpieza de equipos rápidos, futura política de eliminación, eventuales recordatorios e integraciones.

## Decisión
Usar **pg-boss** sobre PostgreSQL. El worker puede convivir inicialmente con la API y separarse si la carga lo exige.

## Lifecycle rápido
Producto ya fija el lifecycle MVP: `Active` hasta 30 días desde última actividad humana relevante, `Recoverable` durante 14 días y `Expired` definitivo después. La expiración definitiva elimina o anonimiza datos de dominio y credenciales de acceso de forma irreversible.

No se decide todavía un job por equipo. Se favorece una combinación simple de evaluación lazy al acceso y/o sweeps periódicos sobre `lastRelevantActivity`, aplicando la política funcional cerrada por producto.

## Justificación
Evita introducir Redis solo por colas y reutiliza la base ya operada.
