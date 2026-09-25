# Requirements Prioritization — MoSCoW

## 1. Propósito

Este documento incorpora una priorización MoSCoW explícita para los requisitos de Synqo, derivada de la documentación funcional ya consolidada. Su objetivo es separar criticidad real de alcance deseado: el Target MVP describe lo que se pretende construir, mientras que MoSCoW indica qué puede sacrificarse si aparecen restricciones de tiempo o complejidad.

La priorización se aplica a la primera versión/MVP de producto. No redefine Synqo, no amplía el alcance y no convierte decisiones técnicas en prioridad de producto. Para los requisitos de IA se distingue además la prioridad de producto frente a la necesidad académica del TFM, porque Synqo debe seguir funcionando mediante flujos manuales aunque la demostración académica requiera implementar y evaluar la asistencia IA.

## 2. Criterios

| Priority | Criterio aplicado |
|---|---|
| Must | Imprescindible para responder a `¿Cuándo podemos?` o `¿Qué decidimos?`, completar los flujos E2E mínimos, preservar invariantes del dominio o mantener seguridad, privacidad, accesibilidad básica e integridad. |
| Should | Alto valor y previsto en el Target MVP, pero con workaround razonable o sin bloquear la validación mínima del producto. |
| Could | Mejora de comodidad, continuidad o calidad que puede diferirse sin comprometer los recorridos esenciales. |
| Won't | Deliberadamente fuera de esta release/MVP, sin implicar descarte definitivo. |

## 3. Resumen por capacidad

| Capacidad | Prioridad dominante | Motivo |
|---|---|---|
| Identidad y acceso | Mixta: Must/Should/Could | Participación sin cuenta, identidad local, deep links seguros y zona horaria son núcleo; cuenta global y vinculación son continuidad diferible. |
| Equipos | Mixta | El equipo es el contexto principal; la modalidad rápida sostiene el mínimo validable y la administrable completa el Target MVP. |
| Equipo rápido | Must dominante | Permite validar baja fricción, participación sin cuenta, temporalidad y resolución básica. |
| Equipo administrable | Should dominante | Es clave para uso persistente y el recorrido E2E-03, pero el producto mínimo puede validarse con equipo rápido. |
| Participantes | Must dominante | Identidad local inequívoca y participación sin cuenta son invariantes; histórico e inactividad refinan continuidad. |
| Disponibilidad individual | Must con mejoras Should | La disponibilidad diaria y estados básicos son núcleo; doble vista y configuración administrable mejoran la experiencia. |
| Disponibilidad colectiva y coincidencias | Must con mejoras Should | El cálculo determinista y recuentos por estado responden a cuando podemos; ordenación avanzada y detalle nominal son Target MVP. |
| Solicitudes de disponibilidad | Should dominante | Estructuran la recogida de disponibilidad, pero se puede validar el núcleo actualizando disponibilidad directamente. |
| Propuestas | Must dominante | Son el mecanismo principal para convertir coincidencias en una opción resoluble; hora opcional y creación desde calendario son mejoras. |
| Encuestas | Must/Should | La decisión colectiva SINGLE es núcleo; MULTIPLE y visibilidades son Target MVP; anonimato fuerte queda fuera. |
| Resolución | Must dominante | Synqo no decide automáticamente: la resolución explícita es central para que decidimos. |
| Pendientes | Should dominante | Reducen fricción operativa, pero los enlaces directos y vistas de consulta permiten completar los flujos. |
| Histórico | Should con garantías Must | La consulta de histórico mejora continuidad; privacidad y expiración definitiva de rápidos son obligatorias. |
| Deep links | Must dominante | Sostienen la baja fricción y permiten actuar sin cuenta con permisos acotados. |
| Cuenta | Could dominante | Aporta agregación y continuidad global, pero no es necesaria para la participación básica. |
| Administración | Should dominante | Da persistencia y configuración, sin sustituir el núcleo rápido del MVP mínimo. |
| IA | Should de producto con salvaguardas Must; TFM Required | La interpretación en lenguaje natural es opcional para el producto, pero necesaria para demostrar el objetivo académico; sus límites sí son obligatorios. |

## 4. Requisitos funcionales

En requisitos formulados como exclusión, `Won't` identifica la capacidad excluida de esta release, no la eliminación de la restricción que mantiene dicha capacidad fuera del MVP.

| Requirement | Descripción resumida | MoSCoW | MVP | TFM | Justificación |
|---|---|---|---|---|---|
| `RF-ID-01` | permitir uso esencial sin cuenta | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ID-02` | permitir crear una cuenta global | Could | Yes | Not required | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-ID-03` | un participante puede existir sin cuenta | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ID-04` | permitir vincular posteriormente participante y cuenta tras demostrar control suficiente | Could | Yes | Relevant | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-ID-05` | conservar histórico al vincular | Could | Yes | Relevant | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-ID-06` | una cuenta puede agregar participaciones de múltiples equipos | Could | Yes | Relevant | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-ID-07` | vincular un equipo rápido a una cuenta no modifica modalidad/lifecycle | Could | Yes | Relevant | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-ID-08` | distinguir participación de administración | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ACC-01` | un equipo accesible podrá abrirse mediante enlace directo | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ACC-02` | solicitud, propuesta y encuesta podrán abrirse directamente mientras sean accesibles | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ACC-03` | un acceso identificado válido conservará la identidad al dirigir a una acción | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-ACC-04` | un enlace directo nunca otorgará capacidades superiores a la identidad autorizada | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ACC-05` | cada equipo debe tener una zona horaria IANA canónica | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ACC-06` | al crear equipo, Synqo propondrá la zona horaria del navegador como valor por defecto editable | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQR-01` | creación sin cuenta ni email | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQR-02` | vida limitada obligatoria | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQR-03` | registrar actividad relevante para lifecycle | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQR-04` | actividad humana válida puede renovar vigencia | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQR-05` | primer umbral → recuperable | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQR-06` | interacción válida durante recuperable → activo | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQR-07` | expiración definitiva → no recuperable | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQR-08` | vinculación a cuenta no evita expiración | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQR-09` | tres estados de disponibilidad siempre habilitados | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQR-10` | todos los participantes pueden resolver consultas | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQR-11` | temporalidad y estado de expiración deben ser comprensibles para el usuario | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQR-12` | pasar a recuperable tras 30 días sin actividad relevante | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQR-13` | pasar a expirado definitivo tras 14 días en recuperable sin reactivación válida | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQR-14` | no renovar vigencia por visitas pasivas, previews, bots, jobs o automatismos | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQR-15` | eliminar o anonimizar irreversiblemente datos de dominio y credenciales tras expiración definitiva | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQR-16` | permitir crear solicitudes, propuestas y encuestas a cualquier participante activo | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-EQA-01` | creación sin cuenta posible | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-02` | requiere email administrativo verificable | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-03` | no otorgar administración persistente antes de verificar | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-04` | permitir recuperar administración | Could | Yes | Relevant | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-EQA-05` | administración puede vincularse después a cuenta | Could | Yes | Relevant | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-EQA-06` | permitir configurar políticas de equipo | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-07` | crear consultas = todos o administradores | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-08` | crear solicitudes = todos o administradores | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-09` | resolver consultas = todos o administradores | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-10` | configurar estados de disponibilidad | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-11` | no deshabilitar simultáneamente Disponible y No disponible | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-12` | no expirar por inactividad ordinaria como un equipo rápido | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-13` | en MVP, soportar una única identidad administrativa primaria | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-14` | aplicar por defecto creación de solicitudes por todos los participantes activos | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-15` | aplicar por defecto creación de propuestas y encuestas por todos los participantes activos | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-16` | aplicar por defecto resolución por administración | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-EQA-17` | aplicar por defecto los estados Disponible, Quizá y No disponible habilitados | Should | Yes | Required | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-PA-01` | identidad inequívoca dentro del equipo | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PA-02` | participar sin cuenta | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PA-03` | conservar autoría tras vinculación | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-PA-04` | conservar histórico al quedar inactivo | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-PA-05` | un inactivo no es destinatario futuro | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-PA-06` | no vincular automáticamente por nombre | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-01` | indicar disponibilidad por fecha | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-02` | disponibilidad general exclusivamente a nivel de día | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-03` | soportar Disponible, Quizá y No disponible | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-04` | distinguir Sin respuesta | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-05` | equipo rápido usa los tres estados | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-06` | equipo administrable aplica configuración del equipo | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-DIS-07` | permitir modificar disponibilidad | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-08` | modificar disponibilidad no altera respuestas previas de propuestas | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-09` | cada participante gestiona por defecto la propia disponibilidad | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-10` | agregar disponibilidad para coincidencias | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-11` | mantener recuentos separados por estado | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-DIS-12` | disponibilidad individual y colectiva en Calendario y Lista | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-DIS-13` | detalle nominal colectivo conforme a acceso del equipo | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-COI-01` | cálculo determinista de coincidencias | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-COI-02` | mostrar cuatro estados por fecha | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-COI-03` | facilitar identificación de fechas favorables | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-COI-04` | un destaque automático no es una resolución | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-COI-05` | ordenar candidatos por menor No disponible, mayor Disponible, mayor Quizá, menor Sin respuesta y fecha más próxima | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-COI-06` | tratar Quizá como señal positiva débil, no como Disponible | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-SD-01` | usuario autorizado puede crear solicitud | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-SD-02` | intervalo inicio/fin obligatorio | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-SD-03` | deadline opcional | Could | Yes | Not required | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-SD-04` | responder por los días del intervalo | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-SD-05` | la respuesta actualiza disponibilidad general | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-SD-06` | indicar respondidos/pendientes | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-SD-07` | solicitud cerrada no acepta nuevas respuestas salvo reapertura explícitamente soportada | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-SD-08` | en el MVP no enviar notificaciones externas automáticas por publicación, recordatorio o vencimiento de solicitudes | Won't | No | Not required | Está documentado como exclusión deliberada de esta release o como capacidad no requerida en el MVP. |
| `RF-CON-01` | tipos MVP = Propuesta y Encuesta | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-CON-02` | toda consulta pertenece a equipo | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-CON-03` | identifica creador | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-CON-04` | contiene alternativas suficientes para una decisión real | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-CON-05` | separar participación y resolución | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-CON-06` | deadline opcional | Could | Yes | Not required | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-CON-07` | modificar respuesta mientras esté abierta | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-CON-08` | cerrada → no nuevas respuestas/cambios | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-CON-09` | permitir cancelación | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-CON-10` | calcular resultado desde respuestas | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-CON-11` | resultado y resolución distintos | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-CON-12` | bloquear cambios sustanciales de opciones con respuestas | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-CON-13` | ausencia de respuesta no es respuesta negativa | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-CON-14` | participante incorporado durante apertura puede responder | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-CON-15` | participante incorporado tras cierre no se añade retrospectivamente | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-CON-16` | en el MVP no enviar notificaciones externas automáticas por publicación, recordatorio, cierre o expiración de consultas | Won't | No | Not required | Está documentado como exclusión deliberada de esta release o como capacidad no requerida en el MVP. |
| `RF-PRO-01` | dos o más opciones temporales | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PRO-02` | fecha obligatoria por opción | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PRO-03` | hora opcional | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-PRO-04` | no franjas horarias | Won't | No | Not required | Está documentado como exclusión deliberada de esta release o como capacidad no requerida en el MVP. |
| `RF-PRO-05` | respuesta independiente por opción | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PRO-06` | varias opciones pueden ser disponibles | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PRO-07` | usar estados habilitados del equipo | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PRO-08` | respuesta específica independiente de disponibilidad general | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PRO-09` | mostrar resultados agregados | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PRO-10` | destacar candidatos sin resolver automáticamente | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PRO-11` | resolver seleccionando una opción | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PRO-12` | crear propuesta directamente desde fechas seleccionadas en disponibilidad colectiva | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-PRO-13` | permitir detalle nominal de respuestas | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-PRO-14` | interpretar fecha y hora opcional de cada opción temporal en la zona horaria canónica del equipo | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ENC-01` | opciones genéricas para decisión colectiva | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ENC-02` | modalidad SINGLE o MULTIPLE al crear | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ENC-03` | SINGLE permite como máximo una opción | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ENC-04` | MULTIPLE permite varias | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-ENC-05` | modalidad no modificable tras existir votos | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ENC-06` | voto modificable mientras esté abierta | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-ENC-07` | recuento por opción | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ENC-08` | representar empate sin desempate automático | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ENC-09` | resolución SINGLE = una opción; MULTIPLE = una o varias | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-ENC-10` | no se requiere anonimato fuerte | Won't | No | Not required | Está documentado como exclusión deliberada de esta release o como capacidad no requerida en el MVP. |
| `RF-ENC-11` | visibilidad NOMINAL o AGGREGATED | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-ENC-12` | NOMINAL puede mostrar participante → opción/es | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-ENC-13` | AGGREGATED oculta a otros participantes la asociación nominal | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-ENC-14` | resultados visibles durante votación en el MVP | Could | Yes | Not required | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-RES-01` | operación explícita distinta del cálculo | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-RES-02` | en equipo rápido todos pueden resolver | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-RES-03` | en equipo administrable depende de política | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-RES-04` | conservar contexto del resultado al resolverse | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-RES-05` | resolver cierra participación | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-RES-06` | registrar opción/es finalmente adoptadas | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-RES-07` | no aplicar desempates implícitos | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-PEN-01` | determinar acciones pendientes | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-PEN-02` | incluir solicitud, propuesta y encuesta | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-PEN-03` | cuenta agrega pendientes de equipos vinculados | Could | Yes | Relevant | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-PEN-04` | distinguir respondidos/pendientes cuando la visibilidad lo permita | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-HIS-01` | conservar consultas resueltas/canceladas mientras el equipo exista y política lo permita | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-HIS-02` | mantener relación con participantes históricos | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-HIS-03` | vincular cuenta no cambia autoría histórica | Could | Yes | Relevant | Aporta continuidad, comodidad o trazabilidad adicional y puede diferirse si hay presión de tiempo. |
| `RF-HIS-04` | desactivar participante no recalcula resultados pasados | Should | Yes | Relevant | Forma parte del Target MVP y aporta valor alto, pero existe una alternativa manual o el núcleo sigue siendo validable sin él. |
| `RF-HIS-05` | equipo rápido expirado definitivamente no es recuperable | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-HIS-06` | conservar como máximo métricas agregadas y trazas operativas mínimas sin tokens ni PII innecesaria tras la expiración definitiva de un equipo rápido | Must | Yes | Required | Sin este requisito se rompe un flujo E2E esencial, una invariancia del dominio o una condición básica de uso seguro. |
| `RF-AI-01` | interpretar restricciones de coordinación en lenguaje natural | Should | Yes | Required | Aporta la ruta IA prevista para el TFM, pero el flujo manual mantiene validable el producto. |
| `RF-AI-02` | convertirlas a representación estructurada de conjunto cerrado | Should | Yes | Required | Aporta la ruta IA prevista para el TFM, pero el flujo manual mantiene validable el producto. |
| `RF-AI-03` | validar estructuralmente el output | Should | Yes | Required | Aporta la ruta IA prevista para el TFM, pero el flujo manual mantiene validable el producto. |
| `RF-AI-04` | validar semántica de dominio/equipo | Should | Yes | Required | Aporta la ruta IA prevista para el TFM, pero el flujo manual mantiene validable el producto. |
| `RF-AI-05` | mostrar interpretación antes de aplicar | Should | Yes | Required | Aporta la ruta IA prevista para el TFM, pero el flujo manual mantiene validable el producto. |
| `RF-AI-06` | fechas candidatas calculadas determinísticamente | Must | Yes | Required | Salvaguarda necesaria para que la IA no sustituya el cálculo determinista, la revisión humana o la minimización de datos. |
| `RF-AI-07` | IA no publica, resuelve ni cancela consultas | Must | Yes | Required | Salvaguarda necesaria para que la IA no sustituya el cálculo determinista, la revisión humana o la minimización de datos. |
| `RF-AI-08` | flujo manual permanece disponible | Must | Yes | Required | Salvaguarda necesaria para que la IA no sustituya el cálculo determinista, la revisión humana o la minimización de datos. |
| `RF-AI-09` | soportar NEEDS_CLARIFICATION/UNSUPPORTED | Should | Yes | Required | Aporta la ruta IA prevista para el TFM, pero el flujo manual mantiene validable el producto. |
| `RF-AI-10` | minimizar datos enviados al proveedor | Must | Yes | Required | Salvaguarda necesaria para que la IA no sustituya el cálculo determinista, la revisión humana o la minimización de datos. |
| `RF-AI-11` | resolver expresiones temporales relativas usando fecha actual, locale de interfaz y zona horaria canónica del equipo | Should | Yes | Required | Aporta la ruta IA prevista para el TFM, pero el flujo manual mantiene validable el producto. |
| `RF-AI-12` | mostrar las fechas concretas interpretadas antes de aplicar restricciones o crear una propuesta | Should | Yes | Required | Aporta la ruta IA prevista para el TFM, pero el flujo manual mantiene validable el producto. |

## 5. Requisitos no funcionales

Los RNF no se clasifican con MoSCoW de forma mecánica. MoSCoW se usa principalmente para capacidades funcionales (`RF-*`), mientras que los RNF expresan condiciones de calidad, seguridad, privacidad y operación. Para evitar mezclar criticidad funcional con umbrales de validez de release, se clasifican como `Release blocker`, `Required` o `Desirable`.

| Categoría | RNF | Criterio |
|---|---|---|
| Release blocker | `RNF-US-01`, `RNF-US-04`, `RNF-US-05`, `RNF-A11Y-01`, `RNF-A11Y-02`, `RNF-A11Y-03`, `RNF-SEC-01`, `RNF-SEC-02`, `RNF-SEC-03`, `RNF-SEC-04`, `RNF-SEC-05`, `RNF-SEC-06`, `RNF-PRIV-01`, `RNF-PRIV-02`, `RNF-PRIV-03`, `RNF-PRIV-04`, `RNF-PERF-02`, `RNF-REL-01`, `RNF-REL-02`, `RNF-REL-03` | Sin estas condiciones, la primera versión no sería segura, accesible, íntegra, aislada por equipo o coherente para operar. |
| Required | `RNF-US-02`, `RNF-US-03`, `RNF-US-06`, `RNF-US-07`, `RNF-PERF-01`, `RNF-COMP-01`, `RNF-RESP-01`, `RNF-AUD-01`, `RNF-AI-OBS-01` | Deben guiar implementación y evaluación del Target MVP, aunque su ausencia puntual no cambia una capacidad funcional en Must. |
| Desirable | Ninguno identificado en la documentación actual. | No se fuerza una categoría deseable artificial cuando la documentación trata los RNF como condiciones reales de producto. |

## 6. Won't this release

Quedan fuera de esta release, en coherencia con PRD, alcance y restricciones: notificaciones externas automáticas de actividad de producto, disponibilidad general por franjas horarias, opciones de propuesta por intervalos/franjas, anonimato fuerte, recurrencia automática, chat, tareas, sincronización automática con calendarios, destinatarios parciales arbitrarios, roles genéricos, voto ponderado/ranking, RAG, fine-tuning y agentes autónomos.

Los requisitos funcionales marcados explícitamente como `Won't` son `RF-SD-08`, `RF-CON-16`, `RF-PRO-04` y `RF-ENC-10`.

## 7. Dependencias

- Identidad sin cuenta (`RF-ID-01`, `RF-ID-03`, `RF-PA-02`) depende de enlaces directos con permisos acotados (`RF-ACC-01`, `RF-ACC-02`, `RF-ACC-04`).
- Disponibilidad diaria (`RF-DIS-01`..`RF-DIS-11`) sostiene coincidencias (`RF-COI-*`) y propuestas (`RF-PRO-*`).
- Resultado y resolución (`RF-CON-10`, `RF-CON-11`, `RF-RES-*`) son dependencias transversales de propuestas y encuestas.
- Equipo administrable (`RF-EQA-*`) depende de identidad administrativa verificable y políticas de equipo; por eso es Target MVP, no núcleo mínimo.
- IA (`RF-AI-*`) depende de zona horaria del equipo, validaciones de dominio y fallback manual. Su cálculo final depende del dominio determinista, no del LLM.

## 8. Riesgo de exceso de Must

| Priority | Count | % |
|---|---:|---:|
| Must | 72 | 47.1% |
| Should | 65 | 42.5% |
| Could | 12 | 7.8% |
| Won't | 4 | 2.6% |

Total de requisitos funcionales: 153. La proporción de `Must` es alta porque Synqo ya parte de un dominio compacto con invariantes fuertes, pero no absorbe todo el Target MVP: equipos administrables, solicitudes, vistas enriquecidas, historial operativo, pendientes e IA de producto quedan mayoritariamente como `Should`; cuenta global y mejoras de continuidad quedan principalmente como `Could`.

## 9. MVP mínimo defendible

`Minimum Viable Validation` es el subconjunto que todavía permite validar la propuesta principal de Synqo si hubiera que recortar alcance: crear o abrir un equipo rápido, participar sin cuenta, registrar disponibilidad diaria con los estados básicos, ver coincidencias deterministas, crear una propuesta temporal, responderla, mostrar resultado, resolver explícitamente, crear una encuesta SINGLE para una decisión general, votar, ver resultado, resolver y respetar privacidad, autorización, accesibilidad básica, expiración de equipos rápidos y fallback manual.

Este mínimo valida las preguntas `¿Cuándo podemos?` y `¿Qué decidimos?` sin exigir cuenta global, equipo administrable, solicitud de disponibilidad, calendario/lista completo, pendientes agregados, histórico enriquecido ni asistencia IA.

## 10. Target MVP

`Target MVP` es el alcance que Synqo pretende desarrollar según PRD y alcance: incluye el Minimum Viable Validation y añade equipos administrables, configuración básica, solicitudes de disponibilidad, vistas calendario/lista, detalle nominal controlado, encuestas MULTIPLE, visibilidad nominal/agregada, pendientes, histórico, deadlines, deep links completos y asistencia IA como ruta opcional para el TFM.

Por tanto: `Minimum Viable Validation` ⊂ `Target MVP`. Estar incluido en Target MVP no equivale a ser `Must`.

## 11. TFM delivery

La entrega del TFM requiere demostrar Synqo como producto coordinable y la integración IA como caso académico. Por eso los requisitos `RF-AI-*` se marcan `TFM: Required` aunque su prioridad de producto sea mayoritariamente `Should`. La IA debe interpretar lenguaje natural hacia restricciones estructuradas, resolver expresiones temporales con fecha/locale/zona horaria, mostrar la interpretación y ceder el cálculo al dominio determinista. El producto básico, incluido el Minimum Viable Validation, debe permanecer operativo sin IA.

## 12. Consecuencias sobre roadmap

- Las vertical slices deben asegurar primero el Minimum Viable Validation antes de añadir mejoras `Should` o `Could`.
- El diseño de dominio, API y autorización debe tratar los `Must` y los `Release blocker` RNF como invariantes iniciales.
- El testing debe cubrir E2E-01 y E2E-02 como validación mínima, E2E-03 como Target MVP relevante para persistencia y E2E-AI-01 como entrega TFM.
- El roadmap puede recortar `Could` y parte de `Should` si hay presión, pero no debe recortar garantías de seguridad, privacidad, integridad, accesibilidad básica ni control humano.
