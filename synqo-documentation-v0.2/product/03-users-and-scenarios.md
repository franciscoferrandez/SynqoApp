# 03 — Usuarios, actores y escenarios

## Actores

### Visitante
Persona que interactúa con Synqo sin cuenta autenticada.

### Usuario
Persona con cuenta global de Synqo. La cuenta agrega equipos, participaciones y pendientes.

### Participante
Identidad local de una persona dentro de un equipo. Puede estar o no vinculada a una cuenta.

### Administrador
Identidad con capacidad para gobernar un equipo administrable. Puede obtener inicialmente esa capacidad mediante un email verificado sin crear cuenta.

### Creador
Persona que origina un equipo, solicitud o consulta. Es una condición contextual, no un rol global permanente.

## Escenarios principales

### A — Coordinación puntual sin cuentas
Una persona crea un equipo rápido, comparte un enlace, los participantes se identifican, indican disponibilidad, se visualizan coincidencias y el equipo resuelve una propuesta.

### B — Decisión general puntual
Un equipo rápido crea una encuesta para elegir restaurante, tema o alternativa. Los miembros votan y cualquiera puede resolver.

### C — Equipo recurrente/continuado
Un grupo de estudio crea un equipo administrable, verifica un email, configura permisos y reutiliza el mismo espacio para disponibilidad y consultas sucesivas.

### D — Administrador sin cuenta
Una persona crea un equipo administrable solo con email verificable, administra el espacio y más adelante puede asociarlo a una cuenta.

### E — Equipo rápido añadido a cuenta
Un usuario vincula un equipo rápido para encontrarlo fácilmente; el equipo sigue expirando normalmente.

### F — Participante sin cuenta que se registra después
La participación local se vincula a la cuenta sin perder disponibilidad, votos ni respuestas históricas.

### G — Conversión futura
Un equipo rápido útil a largo plazo podría convertirse en administrable preservando el mismo identificador e histórico. No forma parte del MVP, pero el modelo no debe impedirlo.
