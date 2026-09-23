# 14 — User flows

## UF-01 — Crear equipo rápido

`Landing → Crear → Rápido → datos mínimos → Active → compartir / indicar disponibilidad / crear actividad`.

## UF-02 — Crear equipo administrable

`Crear → Administrable → datos → email → PendingVerification → verificar → Active → configurar/compartir`.

## UF-03 — Acceso público

`Abrir enlace → validar equipo → identificar participante si procede → entrar → acción objetivo`.

## UF-04 — Acceso identificado

`Abrir credencial personalizada → validar → establecer participant session → redirigir a URL limpia → acción objetivo`.

## UF-05 — Disponibilidad libre

`Equipo → Disponibilidad → Mi disponibilidad → Calendario/Lista → asignar/cambiar estado → guardar → recalcular coincidencias`.

## UF-06 — Solicitar disponibilidad

`Disponibilidad → Solicitar → validar permiso → intervalo → deadline opcional → publicar → respuestas → disponibilidad general actualizada`.

## UF-07 — Coincidencias a propuesta

`Disponibilidad colectiva → Calendario/Lista → seleccionar fechas → Añadir a propuesta → horas opcionales → publicar`.

## UF-08 — Propuesta manual

`Decisiones → Crear → Propuesta → pregunta → >=2 fechas → hora opcional → deadline opcional → publicar`.

## UF-09 — Responder propuesta

`Deep link/vista → verificar OPEN → responder cada opción con estados habilitados → guardar → permitir edición mientras siga OPEN`.

## UF-10 — Resolver propuesta

`Resultados → validar permiso → seleccionar opción → confirmar → RESOLVED + CLOSED`.

## UF-11/12/13 — Encuesta

`Decisiones → Crear encuesta → opciones → SINGLE/MULTIPLE → NOMINAL/AGGREGATED → publicar → votar → modificar mientras OPEN`.

## UF-14 — Resolver encuesta

`Resultados → validar permiso → una opción si SINGLE / una o varias si MULTIPLE → confirmar → RESOLVED + CLOSED`.

## UF-15 — Deadline

`OPEN + PENDING → deadline → CLOSED + PENDING → resolver/cancelar posteriormente`.

## UF-16 — Cancelación

`Consulta → validar permiso → confirmar → CLOSED + CANCELLED → conservar histórico`.

## UF-17 — Vincular equipo rápido a cuenta

`Equipo → Añadir a mi cuenta → autenticar/crear cuenta si hace falta → vincular → Mis equipos`, sin alterar lifecycle.

## UF-18 — Vincular participante

`Participante local → Vincular identidad → autenticar/crear cuenta → demostrar control → vincular sin recrear histórico`.

## UF-19 — Recuperar administración

`Recuperar → identificar equipo/email → enviar prueba → verificar → restaurar administrative session`.

## UF-20 — Pendientes globales

`Inicio → pendiente → deep link → responder → pendiente desaparece`.

## UF-21 — Expiración rápida

`Active → umbral A → Recoverable → actividad válida → Active` o `Recoverable → umbral B → Expired`.

## UF-AI-01 — Asistente de coordinación

`Disponibilidad colectiva → Encontrar fechas → texto natural → interpretar → schema/domain validation → mostrar interpretación → confirmar → CandidateDateService → revisar fechas → Crear propuesta`.
