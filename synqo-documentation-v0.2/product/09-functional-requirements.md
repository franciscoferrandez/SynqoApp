# 09 — Requisitos funcionales

La prioridad MoSCoW compacta se indica en cada requisito mediante `Priority`. La justificación completa, el análisis por capacidades, la separación entre prioridad de producto y necesidad TFM, y el tratamiento de RNF están en [`09b-requirements-prioritization.md`](09b-requirements-prioritization.md). En requisitos formulados como exclusión, `Won't` identifica la capacidad excluida de esta release, no la eliminación de la restricción.

## Identidad y acceso

- `RF-ID-01`: permitir uso esencial sin cuenta. **Priority:** Must.
- `RF-ID-02`: permitir crear una cuenta global. **Priority:** Could.
- `RF-ID-03`: un participante puede existir sin cuenta. **Priority:** Must.
- `RF-ID-04`: permitir vincular posteriormente participante y cuenta tras demostrar control suficiente. **Priority:** Could.
- `RF-ID-05`: conservar histórico al vincular. **Priority:** Could.
- `RF-ID-06`: una cuenta puede agregar participaciones de múltiples equipos. **Priority:** Could.
- `RF-ID-07`: vincular un equipo rápido a una cuenta no modifica modalidad/lifecycle. **Priority:** Could.
- `RF-ID-08`: distinguir participación de administración. **Priority:** Must.
- `RF-ACC-01`: un equipo accesible podrá abrirse mediante enlace directo. **Priority:** Must.
- `RF-ACC-02`: solicitud, propuesta y encuesta podrán abrirse directamente mientras sean accesibles. **Priority:** Must.
- `RF-ACC-03`: un acceso identificado válido conservará la identidad al dirigir a una acción. **Priority:** Should.
- `RF-ACC-04`: un enlace directo nunca otorgará capacidades superiores a la identidad autorizada. **Priority:** Must.
- `RF-ACC-05`: cada equipo debe tener una zona horaria IANA canónica. **Priority:** Must.
- `RF-ACC-06`: al crear equipo, Synqo propondrá la zona horaria del navegador como valor por defecto editable. **Priority:** Should.

## Equipos rápidos

- `RF-EQR-01`: creación sin cuenta ni email. **Priority:** Must.
- `RF-EQR-02`: vida limitada obligatoria. **Priority:** Must.
- `RF-EQR-03`: registrar actividad relevante para lifecycle. **Priority:** Must.
- `RF-EQR-04`: actividad humana válida puede renovar vigencia. **Priority:** Should.
- `RF-EQR-05`: primer umbral → recuperable. **Priority:** Should.
- `RF-EQR-06`: interacción válida durante recuperable → activo. **Priority:** Should.
- `RF-EQR-07`: expiración definitiva → no recuperable. **Priority:** Must.
- `RF-EQR-08`: vinculación a cuenta no evita expiración. **Priority:** Should.
- `RF-EQR-09`: tres estados de disponibilidad siempre habilitados. **Priority:** Must.
- `RF-EQR-10`: todos los participantes pueden resolver consultas. **Priority:** Must.
- `RF-EQR-11`: temporalidad y estado de expiración deben ser comprensibles para el usuario. **Priority:** Must.
- `RF-EQR-12`: pasar a recuperable tras 30 días sin actividad relevante. **Priority:** Should.
- `RF-EQR-13`: pasar a expirado definitivo tras 14 días en recuperable sin reactivación válida. **Priority:** Should.
- `RF-EQR-14`: no renovar vigencia por visitas pasivas, previews, bots, jobs o automatismos. **Priority:** Must.
- `RF-EQR-15`: eliminar o anonimizar irreversiblemente datos de dominio y credenciales tras expiración definitiva. **Priority:** Must.
- `RF-EQR-16`: permitir crear solicitudes, propuestas y encuestas a cualquier participante activo. **Priority:** Must.

## Equipos administrables

- `RF-EQA-01`: creación sin cuenta posible. **Priority:** Should.
- `RF-EQA-02`: requiere email administrativo verificable. **Priority:** Should.
- `RF-EQA-03`: no otorgar administración persistente antes de verificar. **Priority:** Should.
- `RF-EQA-04`: permitir recuperar administración. **Priority:** Could.
- `RF-EQA-05`: administración puede vincularse después a cuenta. **Priority:** Could.
- `RF-EQA-06`: permitir configurar políticas de equipo. **Priority:** Should.
- `RF-EQA-07`: crear consultas = todos o administradores. **Priority:** Should.
- `RF-EQA-08`: crear solicitudes = todos o administradores. **Priority:** Should.
- `RF-EQA-09`: resolver consultas = todos o administradores. **Priority:** Should.
- `RF-EQA-10`: configurar estados de disponibilidad. **Priority:** Should.
- `RF-EQA-11`: no deshabilitar simultáneamente Disponible y No disponible. **Priority:** Should.
- `RF-EQA-12`: no expirar por inactividad ordinaria como un equipo rápido. **Priority:** Should.
- `RF-EQA-13`: en MVP, soportar una única identidad administrativa primaria. **Priority:** Should.
- `RF-EQA-14`: aplicar por defecto creación de solicitudes por todos los participantes activos. **Priority:** Should.
- `RF-EQA-15`: aplicar por defecto creación de propuestas y encuestas por todos los participantes activos. **Priority:** Should.
- `RF-EQA-16`: aplicar por defecto resolución por administración. **Priority:** Should.
- `RF-EQA-17`: aplicar por defecto los estados Disponible, Quizá y No disponible habilitados. **Priority:** Should.

## Participantes

- `RF-PA-01`: identidad inequívoca dentro del equipo. **Priority:** Must.
- `RF-PA-02`: participar sin cuenta. **Priority:** Must.
- `RF-PA-03`: conservar autoría tras vinculación. **Priority:** Should.
- `RF-PA-04`: conservar histórico al quedar inactivo. **Priority:** Should.
- `RF-PA-05`: un inactivo no es destinatario futuro. **Priority:** Should.
- `RF-PA-06`: no vincular automáticamente por nombre. **Priority:** Must.

## Disponibilidad y coincidencias

- `RF-DIS-01`: indicar disponibilidad por fecha. **Priority:** Must.
- `RF-DIS-02`: disponibilidad general exclusivamente a nivel de día. **Priority:** Must.
- `RF-DIS-03`: soportar Disponible, Quizá y No disponible. **Priority:** Must.
- `RF-DIS-04`: distinguir Sin respuesta. **Priority:** Must.
- `RF-DIS-05`: equipo rápido usa los tres estados. **Priority:** Must.
- `RF-DIS-06`: equipo administrable aplica configuración del equipo. **Priority:** Should.
- `RF-DIS-07`: permitir modificar disponibilidad. **Priority:** Must.
- `RF-DIS-08`: modificar disponibilidad no altera respuestas previas de propuestas. **Priority:** Must.
- `RF-DIS-09`: cada participante gestiona por defecto la propia disponibilidad. **Priority:** Must.
- `RF-DIS-10`: agregar disponibilidad para coincidencias. **Priority:** Must.
- `RF-DIS-11`: mantener recuentos separados por estado. **Priority:** Must.
- `RF-DIS-12`: disponibilidad individual y colectiva en Calendario y Lista. **Priority:** Should.
- `RF-DIS-13`: detalle nominal colectivo conforme a acceso del equipo. **Priority:** Should.
- `RF-COI-01`: cálculo determinista de coincidencias. **Priority:** Must.
- `RF-COI-02`: mostrar cuatro estados por fecha. **Priority:** Must.
- `RF-COI-03`: facilitar identificación de fechas favorables. **Priority:** Must.
- `RF-COI-04`: un destaque automático no es una resolución. **Priority:** Must.
- `RF-COI-05`: ordenar candidatos por menor No disponible, mayor Disponible, mayor Quizá, menor Sin respuesta y fecha más próxima. **Priority:** Should.
- `RF-COI-06`: tratar Quizá como señal positiva débil, no como Disponible. **Priority:** Must.

## Solicitudes de disponibilidad

- `RF-SD-01`: usuario autorizado puede crear solicitud. **Priority:** Should.
- `RF-SD-02`: intervalo inicio/fin obligatorio. **Priority:** Should.
- `RF-SD-03`: deadline opcional. **Priority:** Could.
- `RF-SD-04`: responder por los días del intervalo. **Priority:** Should.
- `RF-SD-05`: la respuesta actualiza disponibilidad general. **Priority:** Should.
- `RF-SD-06`: indicar respondidos/pendientes. **Priority:** Should.
- `RF-SD-07`: solicitud cerrada no acepta nuevas respuestas salvo reapertura explícitamente soportada. **Priority:** Should.
- `RF-SD-08`: en el MVP no enviar notificaciones externas automáticas por publicación, recordatorio o vencimiento de solicitudes. **Priority:** Won't.

## Consultas

- `RF-CON-01`: tipos MVP = Propuesta y Encuesta. **Priority:** Must.
- `RF-CON-02`: toda consulta pertenece a equipo. **Priority:** Must.
- `RF-CON-03`: identifica creador. **Priority:** Should.
- `RF-CON-04`: contiene alternativas suficientes para una decisión real. **Priority:** Must.
- `RF-CON-05`: separar participación y resolución. **Priority:** Must.
- `RF-CON-06`: deadline opcional. **Priority:** Could.
- `RF-CON-07`: modificar respuesta mientras esté abierta. **Priority:** Should.
- `RF-CON-08`: cerrada → no nuevas respuestas/cambios. **Priority:** Must.
- `RF-CON-09`: permitir cancelación. **Priority:** Should.
- `RF-CON-10`: calcular resultado desde respuestas. **Priority:** Must.
- `RF-CON-11`: resultado y resolución distintos. **Priority:** Must.
- `RF-CON-12`: bloquear cambios sustanciales de opciones con respuestas. **Priority:** Must.
- `RF-CON-13`: ausencia de respuesta no es respuesta negativa. **Priority:** Must.
- `RF-CON-14`: participante incorporado durante apertura puede responder. **Priority:** Should.
- `RF-CON-15`: participante incorporado tras cierre no se añade retrospectivamente. **Priority:** Should.
- `RF-CON-16`: en el MVP no enviar notificaciones externas automáticas por publicación, recordatorio, cierre o expiración de consultas. **Priority:** Won't.

## Propuestas

- `RF-PRO-01`: dos o más opciones temporales. **Priority:** Must.
- `RF-PRO-02`: fecha obligatoria por opción. **Priority:** Must.
- `RF-PRO-03`: hora opcional. **Priority:** Should.
- `RF-PRO-04`: no franjas horarias. **Priority:** Won't.
- `RF-PRO-05`: respuesta independiente por opción. **Priority:** Must.
- `RF-PRO-06`: varias opciones pueden ser disponibles. **Priority:** Must.
- `RF-PRO-07`: usar estados habilitados del equipo. **Priority:** Must.
- `RF-PRO-08`: respuesta específica independiente de disponibilidad general. **Priority:** Must.
- `RF-PRO-09`: mostrar resultados agregados. **Priority:** Must.
- `RF-PRO-10`: destacar candidatos sin resolver automáticamente. **Priority:** Must.
- `RF-PRO-11`: resolver seleccionando una opción. **Priority:** Must.
- `RF-PRO-12`: crear propuesta directamente desde fechas seleccionadas en disponibilidad colectiva. **Priority:** Should.
- `RF-PRO-13`: permitir detalle nominal de respuestas. **Priority:** Should.
- `RF-PRO-14`: interpretar fecha y hora opcional de cada opción temporal en la zona horaria canónica del equipo. **Priority:** Must.

## Encuestas

- `RF-ENC-01`: opciones genéricas para decisión colectiva. **Priority:** Must.
- `RF-ENC-02`: modalidad SINGLE o MULTIPLE al crear. **Priority:** Must.
- `RF-ENC-03`: SINGLE permite como máximo una opción. **Priority:** Must.
- `RF-ENC-04`: MULTIPLE permite varias. **Priority:** Should.
- `RF-ENC-05`: modalidad no modificable tras existir votos. **Priority:** Must.
- `RF-ENC-06`: voto modificable mientras esté abierta. **Priority:** Should.
- `RF-ENC-07`: recuento por opción. **Priority:** Must.
- `RF-ENC-08`: representar empate sin desempate automático. **Priority:** Must.
- `RF-ENC-09`: resolución SINGLE = una opción; MULTIPLE = una o varias. **Priority:** Must.
- `RF-ENC-10`: no se requiere anonimato fuerte. **Priority:** Won't.
- `RF-ENC-11`: visibilidad NOMINAL o AGGREGATED. **Priority:** Should.
- `RF-ENC-12`: NOMINAL puede mostrar participante → opción/es. **Priority:** Should.
- `RF-ENC-13`: AGGREGATED oculta a otros participantes la asociación nominal. **Priority:** Should.
- `RF-ENC-14`: resultados visibles durante votación en el MVP. **Priority:** Could.

## Resolución

- `RF-RES-01`: operación explícita distinta del cálculo. **Priority:** Must.
- `RF-RES-02`: en equipo rápido todos pueden resolver. **Priority:** Must.
- `RF-RES-03`: en equipo administrable depende de política. **Priority:** Should.
- `RF-RES-04`: conservar contexto del resultado al resolverse. **Priority:** Should.
- `RF-RES-05`: resolver cierra participación. **Priority:** Must.
- `RF-RES-06`: registrar opción/es finalmente adoptadas. **Priority:** Must.
- `RF-RES-07`: no aplicar desempates implícitos. **Priority:** Must.

## Pendientes e histórico

- `RF-PEN-01`: determinar acciones pendientes. **Priority:** Should.
- `RF-PEN-02`: incluir solicitud, propuesta y encuesta. **Priority:** Should.
- `RF-PEN-03`: cuenta agrega pendientes de equipos vinculados. **Priority:** Could.
- `RF-PEN-04`: distinguir respondidos/pendientes cuando la visibilidad lo permita. **Priority:** Should.
- `RF-HIS-01`: conservar consultas resueltas/canceladas mientras el equipo exista y política lo permita. **Priority:** Should.
- `RF-HIS-02`: mantener relación con participantes históricos. **Priority:** Should.
- `RF-HIS-03`: vincular cuenta no cambia autoría histórica. **Priority:** Could.
- `RF-HIS-04`: desactivar participante no recalcula resultados pasados. **Priority:** Should.
- `RF-HIS-05`: equipo rápido expirado definitivamente no es recuperable. **Priority:** Must.
- `RF-HIS-06`: conservar como máximo métricas agregadas y trazas operativas mínimas sin tokens ni PII innecesaria tras la expiración definitiva de un equipo rápido. **Priority:** Must.

## IA

- `RF-AI-01`: interpretar restricciones de coordinación en lenguaje natural. **Priority:** Should.
- `RF-AI-02`: convertirlas a representación estructurada de conjunto cerrado. **Priority:** Should.
- `RF-AI-03`: validar estructuralmente el output. **Priority:** Should.
- `RF-AI-04`: validar semántica de dominio/equipo. **Priority:** Should.
- `RF-AI-05`: mostrar interpretación antes de aplicar. **Priority:** Should.
- `RF-AI-06`: fechas candidatas calculadas determinísticamente. **Priority:** Must.
- `RF-AI-07`: IA no publica, resuelve ni cancela consultas. **Priority:** Must.
- `RF-AI-08`: flujo manual permanece disponible. **Priority:** Must.
- `RF-AI-09`: soportar NEEDS_CLARIFICATION/UNSUPPORTED. **Priority:** Should.
- `RF-AI-10`: minimizar datos enviados al proveedor. **Priority:** Must.
- `RF-AI-11`: resolver expresiones temporales relativas usando fecha actual, locale de interfaz y zona horaria canónica del equipo. **Priority:** Should.
- `RF-AI-12`: mostrar las fechas concretas interpretadas antes de aplicar restricciones o crear una propuesta. **Priority:** Should.
