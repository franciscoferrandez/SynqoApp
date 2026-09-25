# Registro de decisiones de producto

Este documento recoge decisiones funcionales; no son ADR salvo que impliquen una elección arquitectónica significativa.

| ID | Decisión |
|---|---|
| D-PROD-001 | Equipo es el contexto principal del producto. |
| D-PROD-002 | Cuenta y Participante son conceptos distintos. |
| D-PROD-003 | Equipo rápido expira obligatoriamente. |
| D-PROD-004 | Vincular un equipo rápido a cuenta no cambia su expiración. |
| D-PROD-005 | Equipo administrable puede existir sin cuenta mediante email verificado. |
| D-PROD-006 | Disponibilidad general es por día. |
| D-PROD-007 | Estados soportados: Disponible, Quizá, No disponible; Sin respuesta es derivado. |
| D-PROD-008 | En rápido están habilitados los tres; administrable puede configurarlos con la invariancia acordada. |
| D-PROD-009 | Disponibilidad general y respuesta a propuesta son datos distintos. |
| D-PROD-010 | Consulta = Propuesta \| Encuesta a nivel funcional. |
| D-PROD-011 | Propuesta: fecha obligatoria + hora opcional por opción. |
| D-PROD-012 | Encuesta configurable SINGLE/MULTIPLE. |
| D-PROD-013 | Resultado y Resolución son conceptos distintos. |
| D-PROD-014 | En rápido todos pueden resolver; en administrable depende de política. |
| D-PROD-015 | Disponibilidad individual/colectiva tienen Calendario y Lista. |
| D-PROD-016 | Actividades MVP dirigidas a todos los participantes activos. |
| D-PROD-017 | Nuevo participante puede responder consultas todavía abiertas. |
| D-PROD-018 | Disponibilidad/propuesta pueden mostrar detalle nominal. |
| D-PROD-019 | Encuesta configurable NOMINAL/AGGREGATED; agregado no es anonimato. |
| D-PROD-020 | Encuesta MULTIPLE puede resolverse con una o varias opciones. |
| D-PROD-021 | Deep links llevan directamente a la acción relevante. |
| D-PROD-022 | La IA interpreta intención; la lógica de coincidencias permanece determinista. |
| D-PROD-023 | Equipo rápido: Active 30 días desde última actividad relevante + Recoverable 14 días antes de expiración definitiva. |
| D-PROD-024 | Solo interacciones humanas intencionales renuevan actividad de equipo rápido; visitas pasivas, previews, bots, jobs y automatismos no renuevan. |
| D-PROD-025 | En equipo rápido, cualquier participante activo puede crear solicitudes, propuestas y encuestas. |
| D-PROD-026 | En MVP, equipo administrable tiene una única identidad administrativa primaria. |
| D-PROD-027 | Defaults de equipo administrable: creación por todos los participantes activos, resolución por administración y tres estados de disponibilidad habilitados. |
| D-PROD-028 | Candidatos se ordenan por menor No disponible, mayor Disponible, mayor Quizá, menor Sin respuesta y fecha más próxima. |
| D-PROD-029 | Tras expiración definitiva de equipo rápido, datos de dominio y credenciales se eliminan o anonimizan irreversiblemente. |
| D-PROD-030 | En MVP no hay notificaciones externas automáticas de actividad de producto. |
| D-PROD-031 | Cada equipo tiene zona horaria IANA canónica para disponibilidad, propuestas y expresiones temporales relativas. |
| D-PROD-032 | Los requisitos de Synqo se priorizan mediante MoSCoW para distinguir criticidad real dentro del alcance objetivo del MVP. |
| D-PROD-033 | Tras expiración definitiva de equipo rápido se aplica borrado físico preferente de datos de dominio y credenciales; solo sobreviven métricas agregadas y trazas minimizadas sin PII ni tokens. |
