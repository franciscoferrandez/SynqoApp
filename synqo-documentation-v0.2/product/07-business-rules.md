# 07 — Reglas de negocio

## Equipo

- `BR-EQ-01`: todo equipo es rápido o administrable.
- `BR-EQ-02`: la modalidad es independiente de la autenticación del participante.
- `BR-EQ-03`: el histórico pertenece al equipo y a las identidades locales que actuaron en él.
- `BR-EQ-04`: vincular un equipo rápido a una cuenta no altera su expiración.
- `BR-EQ-05`: un equipo rápido no posee administración formal.
- `BR-EQ-06`: un equipo administrable requiere identidad administrativa verificable.

## Participante

- `BR-PA-01`: un participante pertenece exactamente a un equipo.
- `BR-PA-02`: puede existir sin cuenta.
- `BR-PA-03`: vincularlo posteriormente no recrea su histórico.
- `BR-PA-04`: una coincidencia de nombre no es prueba suficiente para reclamar una participación.
- `BR-PA-05`: un participante inactivo deja de ser destinatario futuro, pero no desaparece del histórico.

## Disponibilidad

- `BR-DIS-01`: la disponibilidad general es por día.
- `BR-DIS-02`: estados declarables base = `AVAILABLE`, `MAYBE`, `UNAVAILABLE`.
- `BR-DIS-03`: `UNANSWERED` es derivado.
- `BR-DIS-04`: en equipo rápido los tres estados declarables están siempre habilitados.
- `BR-DIS-05`: en equipo administrable pueden configurarse, manteniendo al menos uno de `AVAILABLE` o `UNAVAILABLE`.
- `BR-DIS-06`: cada participante modifica por defecto su propia disponibilidad.
- `BR-DIS-07`: cambiar disponibilidad general no modifica respuestas existentes de propuestas.

## Solicitudes

- `BR-SD-01`: una solicitud define un intervalo y puede tener deadline.
- `BR-SD-02`: responder actualiza la disponibilidad general, no una copia independiente.
- `BR-SD-03`: en el MVP se dirige a todos los participantes activos.

## Consultas

- `BR-CON-01`: tipos MVP = Propuesta y Encuesta.
- `BR-CON-02`: participación (`OPEN/CLOSED`) y resolución (`PENDING/RESOLVED/CANCELLED`) son dimensiones distintas.
- `BR-CON-03`: resolver o cancelar cierra automáticamente la participación.
- `BR-CON-04`: una opción no cambia sustancialmente una vez existan respuestas.
- `BR-CON-05`: una consulta abierta admite respuestas de participantes que se incorporen después de su publicación.
- `BR-CON-06`: una consulta cerrada no añade retrospectivamente nuevos participantes como pendientes.
- `BR-CON-07`: una consulta puede tener deadline opcional.

## Propuestas

- `BR-PRO-01`: al menos dos opciones temporales.
- `BR-PRO-02`: toda opción temporal tiene fecha; hora opcional; nunca franja horaria en MVP.
- `BR-PRO-03`: cada opción se responde independientemente.
- `BR-PRO-04`: la respuesta usa los estados habilitados del equipo.
- `BR-PRO-05`: varias opciones pueden ser `Disponible` para el mismo participante.
- `BR-PRO-06`: la resolución contiene exactamente una opción temporal.

## Encuestas

- `BR-ENC-01`: modalidad al crear = `SINGLE` o `MULTIPLE`.
- `BR-ENC-02`: `SINGLE` permite como máximo una selección; `MULTIPLE`, varias.
- `BR-ENC-03`: mientras permanezca abierta se puede modificar el voto.
- `BR-ENC-04`: la visibilidad puede ser nominal o agregada.
- `BR-ENC-05`: agregado no equivale a anonimato fuerte.
- `BR-ENC-06`: una resolución `SINGLE` contiene una opción; una `MULTIPLE`, una o varias.
- `BR-ENC-07`: los empates no se resuelven automáticamente.

## Resolución y permisos

- `BR-RES-01`: resultado calculado y resolución son conceptos diferentes.
- `BR-RES-02`: en equipo rápido cualquier participante puede resolver.
- `BR-RES-03`: en equipo administrable la política de resolución es `EVERYONE` o `ADMINISTRATORS`.
- `BR-RES-04`: la API debe aplicar los permisos aunque la UI oculte una acción.

## Invariantes clave

- `No disponible ≠ Sin respuesta`.
- Una consulta `RESOLVED` o `CANCELLED` nunca puede estar `OPEN`.
- Vincular cuenta no cambia modalidad ni lifecycle.
- Un participante no se apropia por coincidencia de nombre.
- El sistema nunca usa un LLM para contar disponibilidad o votos.
