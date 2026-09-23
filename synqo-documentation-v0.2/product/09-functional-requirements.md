# 09 — Requisitos funcionales

## Identidad y acceso

- `RF-ID-01`: permitir uso esencial sin cuenta.
- `RF-ID-02`: permitir crear una cuenta global.
- `RF-ID-03`: un participante puede existir sin cuenta.
- `RF-ID-04`: permitir vincular posteriormente participante y cuenta tras demostrar control suficiente.
- `RF-ID-05`: conservar histórico al vincular.
- `RF-ID-06`: una cuenta puede agregar participaciones de múltiples equipos.
- `RF-ID-07`: vincular un equipo rápido a una cuenta no modifica modalidad/lifecycle.
- `RF-ID-08`: distinguir participación de administración.
- `RF-ACC-01`: un equipo accesible podrá abrirse mediante enlace directo.
- `RF-ACC-02`: solicitud, propuesta y encuesta podrán abrirse directamente mientras sean accesibles.
- `RF-ACC-03`: un acceso identificado válido conservará la identidad al dirigir a una acción.
- `RF-ACC-04`: un enlace directo nunca otorgará capacidades superiores a la identidad autorizada.

## Equipos rápidos

- `RF-EQR-01`: creación sin cuenta ni email.
- `RF-EQR-02`: vida limitada obligatoria.
- `RF-EQR-03`: registrar actividad relevante para lifecycle.
- `RF-EQR-04`: actividad humana válida puede renovar vigencia.
- `RF-EQR-05`: primer umbral → recuperable.
- `RF-EQR-06`: interacción válida durante recuperable → activo.
- `RF-EQR-07`: expiración definitiva → no recuperable.
- `RF-EQR-08`: vinculación a cuenta no evita expiración.
- `RF-EQR-09`: tres estados de disponibilidad siempre habilitados.
- `RF-EQR-10`: todos los participantes pueden resolver consultas.
- `RF-EQR-11`: temporalidad y estado de expiración deben ser comprensibles para el usuario.

## Equipos administrables

- `RF-EQA-01`: creación sin cuenta posible.
- `RF-EQA-02`: requiere email administrativo verificable.
- `RF-EQA-03`: no otorgar administración persistente antes de verificar.
- `RF-EQA-04`: permitir recuperar administración.
- `RF-EQA-05`: administración puede vincularse después a cuenta.
- `RF-EQA-06`: permitir configurar políticas de equipo.
- `RF-EQA-07`: crear consultas = todos o administradores.
- `RF-EQA-08`: crear solicitudes = todos o administradores.
- `RF-EQA-09`: resolver consultas = todos o administradores.
- `RF-EQA-10`: configurar estados de disponibilidad.
- `RF-EQA-11`: no deshabilitar simultáneamente Disponible y No disponible.
- `RF-EQA-12`: no expirar por inactividad ordinaria como un equipo rápido.

## Participantes

- `RF-PA-01`: identidad inequívoca dentro del equipo.
- `RF-PA-02`: participar sin cuenta.
- `RF-PA-03`: conservar autoría tras vinculación.
- `RF-PA-04`: conservar histórico al quedar inactivo.
- `RF-PA-05`: un inactivo no es destinatario futuro.
- `RF-PA-06`: no vincular automáticamente por nombre.

## Disponibilidad y coincidencias

- `RF-DIS-01`: indicar disponibilidad por fecha.
- `RF-DIS-02`: disponibilidad general exclusivamente a nivel de día.
- `RF-DIS-03`: soportar Disponible, Quizá y No disponible.
- `RF-DIS-04`: distinguir Sin respuesta.
- `RF-DIS-05`: equipo rápido usa los tres estados.
- `RF-DIS-06`: equipo administrable aplica configuración del equipo.
- `RF-DIS-07`: permitir modificar disponibilidad.
- `RF-DIS-08`: modificar disponibilidad no altera respuestas previas de propuestas.
- `RF-DIS-09`: cada participante gestiona por defecto la propia disponibilidad.
- `RF-DIS-10`: agregar disponibilidad para coincidencias.
- `RF-DIS-11`: mantener recuentos separados por estado.
- `RF-DIS-12`: disponibilidad individual y colectiva en Calendario y Lista.
- `RF-DIS-13`: detalle nominal colectivo conforme a acceso del equipo.
- `RF-COI-01`: cálculo determinista de coincidencias.
- `RF-COI-02`: mostrar cuatro estados por fecha.
- `RF-COI-03`: facilitar identificación de fechas favorables.
- `RF-COI-04`: un destaque automático no es una resolución.

## Solicitudes de disponibilidad

- `RF-SD-01`: usuario autorizado puede crear solicitud.
- `RF-SD-02`: intervalo inicio/fin obligatorio.
- `RF-SD-03`: deadline opcional.
- `RF-SD-04`: responder por los días del intervalo.
- `RF-SD-05`: la respuesta actualiza disponibilidad general.
- `RF-SD-06`: indicar respondidos/pendientes.
- `RF-SD-07`: solicitud cerrada no acepta nuevas respuestas salvo reapertura explícitamente soportada.

## Consultas

- `RF-CON-01`: tipos MVP = Propuesta y Encuesta.
- `RF-CON-02`: toda consulta pertenece a equipo.
- `RF-CON-03`: identifica creador.
- `RF-CON-04`: contiene alternativas suficientes para una decisión real.
- `RF-CON-05`: separar participación y resolución.
- `RF-CON-06`: deadline opcional.
- `RF-CON-07`: modificar respuesta mientras esté abierta.
- `RF-CON-08`: cerrada → no nuevas respuestas/cambios.
- `RF-CON-09`: permitir cancelación.
- `RF-CON-10`: calcular resultado desde respuestas.
- `RF-CON-11`: resultado y resolución distintos.
- `RF-CON-12`: bloquear cambios sustanciales de opciones con respuestas.
- `RF-CON-13`: ausencia de respuesta no es respuesta negativa.
- `RF-CON-14`: participante incorporado durante apertura puede responder.
- `RF-CON-15`: participante incorporado tras cierre no se añade retrospectivamente.

## Propuestas

- `RF-PRO-01`: dos o más opciones temporales.
- `RF-PRO-02`: fecha obligatoria por opción.
- `RF-PRO-03`: hora opcional.
- `RF-PRO-04`: no franjas horarias.
- `RF-PRO-05`: respuesta independiente por opción.
- `RF-PRO-06`: varias opciones pueden ser disponibles.
- `RF-PRO-07`: usar estados habilitados del equipo.
- `RF-PRO-08`: respuesta específica independiente de disponibilidad general.
- `RF-PRO-09`: mostrar resultados agregados.
- `RF-PRO-10`: destacar candidatos sin resolver automáticamente.
- `RF-PRO-11`: resolver seleccionando una opción.
- `RF-PRO-12`: crear propuesta directamente desde fechas seleccionadas en disponibilidad colectiva.
- `RF-PRO-13`: permitir detalle nominal de respuestas.

## Encuestas

- `RF-ENC-01`: opciones genéricas para decisión colectiva.
- `RF-ENC-02`: modalidad SINGLE o MULTIPLE al crear.
- `RF-ENC-03`: SINGLE permite como máximo una opción.
- `RF-ENC-04`: MULTIPLE permite varias.
- `RF-ENC-05`: modalidad no modificable tras existir votos.
- `RF-ENC-06`: voto modificable mientras esté abierta.
- `RF-ENC-07`: recuento por opción.
- `RF-ENC-08`: representar empate sin desempate automático.
- `RF-ENC-09`: resolución SINGLE = una opción; MULTIPLE = una o varias.
- `RF-ENC-10`: no se requiere anonimato fuerte.
- `RF-ENC-11`: visibilidad NOMINAL o AGGREGATED.
- `RF-ENC-12`: NOMINAL puede mostrar participante → opción/es.
- `RF-ENC-13`: AGGREGATED oculta a otros participantes la asociación nominal.
- `RF-ENC-14`: resultados visibles durante votación en el MVP.

## Resolución

- `RF-RES-01`: operación explícita distinta del cálculo.
- `RF-RES-02`: en equipo rápido todos pueden resolver.
- `RF-RES-03`: en equipo administrable depende de política.
- `RF-RES-04`: conservar contexto del resultado al resolverse.
- `RF-RES-05`: resolver cierra participación.
- `RF-RES-06`: registrar opción/es finalmente adoptadas.
- `RF-RES-07`: no aplicar desempates implícitos.

## Pendientes e histórico

- `RF-PEN-01`: determinar acciones pendientes.
- `RF-PEN-02`: incluir solicitud, propuesta y encuesta.
- `RF-PEN-03`: cuenta agrega pendientes de equipos vinculados.
- `RF-PEN-04`: distinguir respondidos/pendientes cuando la visibilidad lo permita.
- `RF-HIS-01`: conservar consultas resueltas/canceladas mientras el equipo exista y política lo permita.
- `RF-HIS-02`: mantener relación con participantes históricos.
- `RF-HIS-03`: vincular cuenta no cambia autoría histórica.
- `RF-HIS-04`: desactivar participante no recalcula resultados pasados.
- `RF-HIS-05`: equipo rápido expirado queda sujeto a política definitiva de conservación.

## IA

- `RF-AI-01`: interpretar restricciones de coordinación en lenguaje natural.
- `RF-AI-02`: convertirlas a representación estructurada de conjunto cerrado.
- `RF-AI-03`: validar estructuralmente el output.
- `RF-AI-04`: validar semántica de dominio/equipo.
- `RF-AI-05`: mostrar interpretación antes de aplicar.
- `RF-AI-06`: fechas candidatas calculadas determinísticamente.
- `RF-AI-07`: IA no publica, resuelve ni cancela consultas.
- `RF-AI-08`: flujo manual permanece disponible.
- `RF-AI-09`: soportar NEEDS_CLARIFICATION/UNSUPPORTED.
- `RF-AI-10`: minimizar datos enviados al proveedor.
