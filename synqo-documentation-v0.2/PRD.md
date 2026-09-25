# PRD — Synqo

**Versión:** 0.1  
**Estado:** consolidado para diseño e implementación  
**Fuente de detalle:** documentos bajo `product/`; priorización MoSCoW en `product/09b-requirements-prioritization.md`

## 1. Visión

Synqo es una aplicación para facilitar la coordinación y la toma de decisiones dentro de grupos o equipos, centralizando la disponibilidad de sus integrantes y proporcionando mecanismos sencillos para acordar fechas o decidir colectivamente entre distintas alternativas.

Las dos preguntas centrales del producto son:

- **¿Cuándo podemos?**
- **¿Qué decidimos?**

## 2. Problema

Los miembros de un equipo suelen coordinarse mediante conversaciones dispersas, mensajes y comparaciones manuales. Esto obliga a volver a preguntar, reconstruir respuestas, distinguir información vigente de antigua y repetir procesos cuando cambia la disponibilidad. Synqo ofrece un contexto compartido donde la información se mantiene estructurada y conduce a una resolución explícita.

## 3. Principios

- **Fricción mínima:** las capacidades esenciales no exigen una cuenta.
- **Equipo como contexto:** participantes, disponibilidad, consultas e histórico pertenecen al equipo.
- **Disponibilidad no es confirmación:** poder un día no confirma una propuesta con una hora concreta.
- **Resultado no es resolución:** un resultado calculado no constituye automáticamente la decisión final.
- **Complejidad progresiva:** los equipos rápidos son predefinidos; los administrables exponen configuración.
- **Identidad local preservada:** un participante puede vincularse después a una cuenta sin perder histórico.
- **Mobile-first y deep links:** un enlace debe llevar al usuario directamente a la acción esperada.
- **Control humano:** el sistema puede ordenar y sugerir, pero la resolución es humana.

## 4. Modalidades de equipo

### Equipo rápido

- Sin cuenta ni email obligatorios.
- Temporal por diseño.
- Sin administración formal.
- `Disponible`, `Quizá` y `No disponible` siempre habilitados.
- Todos los participantes activos pueden crear solicitudes, propuestas y encuestas.
- Todos los participantes pueden resolver consultas.
- Vincularlo a una cuenta no evita su expiración.
- Permanece activo 30 días desde la última actividad relevante; después entra 14 días en estado recuperable y finalmente expira de forma definitiva.

### Equipo administrable

- Persistente.
- Puede crearse sin cuenta mediante un email administrativo verificado.
- Permite configurar estados de disponibilidad y políticas de creación/resolución.
- En el MVP tiene una única identidad administrativa primaria.
- Por defecto permite crear solicitudes, propuestas y encuestas a todos los participantes activos, reserva la resolución a la administración y mantiene habilitados `Disponible`, `Quizá` y `No disponible`.
- Puede vincularse posteriormente a cuentas sin cambiar su identidad.

## 5. Identidad

Se distinguen tres conceptos:

- **Cuenta:** identidad global y persistente en Synqo.
- **Participante:** identidad local dentro de un equipo; puede no tener cuenta.
- **Administrador:** capacidad contextual sobre un equipo administrable; puede existir inicialmente sin cuenta mediante identidad verificable.

La vinculación `Participante → Cuenta` no recrea la identidad ni mueve el histórico.

## 6. Disponibilidad

La disponibilidad general es por **día**, sin franjas horarias. Estados soportados:

- `Disponible`
- `Quizá`
- `No disponible`
- `Sin respuesta` como estado derivado, nunca equivalente a `No disponible`.

Los equipos rápidos usan siempre los tres estados declarables. Los administrables pueden configurar cuáles están habilitados, manteniendo al menos uno de `Disponible` o `No disponible`.

La disponibilidad individual y colectiva podrá consultarse en **Calendario** y **Lista**. El calendario será eminentemente visual por color, complementado con símbolos/texto accesibles. El detalle de un día colectivo mostrará el desglose y permitirá añadirlo a una propuesta.

## 7. Solicitud de disponibilidad

Una solicitud pide a todos los participantes activos que indiquen o actualicen su disponibilidad dentro de un intervalo. Puede tener deadline opcional. Responder actualiza la disponibilidad general: no crea una copia paralela.

## 8. Coincidencias

Las coincidencias se calculan de forma determinista. Para cada fecha se mantienen separadas las cantidades de `Disponible`, `Quizá`, `No disponible` y `Sin respuesta`. Synqo puede destacar candidatos, pero no convertirlos automáticamente en una decisión. La ordenación por defecto prioriza menor `No disponible`, mayor `Disponible`, mayor `Quizá`, menor `Sin respuesta` y fecha más próxima; `Quizá` cuenta como señal positiva débil, no como disponibilidad plena.

## 9. Consulta, propuesta y encuesta

`Consulta` es la abstracción funcional que agrupa:

- **Propuesta:** responde a «¿cuándo?»; opciones = fecha obligatoria + hora opcional.
- **Encuesta:** responde a «¿qué elegimos?»; selección única o múltiple.

Una consulta mantiene dos dimensiones de estado independientes:

- participación: `OPEN | CLOSED`
- resolución: `PENDING | RESOLVED | CANCELLED`

`CLOSED + PENDING` es válido cuando vence el plazo pero todavía no se ha tomado la decisión final.

## 10. Propuestas

Cada participante responde independientemente a cada opción temporal usando los estados de disponibilidad habilitados en el equipo. Puede indicar varias opciones como disponibles. La respuesta a una propuesta es independiente de la disponibilidad general.

El resultado puede mostrar recuentos y detalle nominal. La resolución selecciona una opción de forma explícita y cierra la participación.

## 11. Encuestas

Al crear una encuesta se selecciona:

- modalidad: `SINGLE | MULTIPLE`;
- visibilidad de resultados: `NOMINAL | AGGREGATED`.

En `SINGLE` el participante elige como máximo una opción. En `MULTIPLE` puede elegir varias. La resolución de una encuesta múltiple puede contener una o varias opciones.

`AGGREGATED` no significa anonimato fuerte: Synqo puede seguir asociando internamente el voto al participante.

## 12. Permisos

En equipos administrables se configuran al menos:

- quién puede crear solicitudes: administradores / todos;
- quién puede crear propuestas y encuestas: administradores / todos;
- quién puede resolver consultas: administradores / todos.

En equipos rápidos todos los participantes activos pueden crear solicitudes, propuestas y encuestas, y todos pueden resolver. En equipos administrables los valores por defecto son creación por todos los participantes activos y resolución por administración, con configuración posterior.

## 13. Participantes nuevos

Las actividades del MVP se dirigen a todos los participantes activos. Un participante que se incorpora mientras una consulta sigue abierta puede responderla. Si se incorpora cuando ya está cerrada, no se añade retrospectivamente como pendiente ni altera el histórico.

## 14. Histórico y pendientes

Las consultas resueltas o canceladas y sus respuestas se conservan mientras lo haga el equipo. La desactivación de un participante no recalcula decisiones pasadas. Una cuenta agrega los pendientes de sus participaciones vinculadas. Tras la expiración definitiva de un equipo rápido, los datos de dominio y credenciales de acceso se eliminan o anonimizan de forma irreversible, conservando como máximo métricas agregadas y trazas operativas mínimas sin tokens ni PII innecesaria.

## 15. Arquitectura de información

Nivel global autenticado:

- Inicio
- Equipos
- Cuenta

Dentro de equipo:

- Inicio
- Disponibilidad
- Decisiones
- Histórico
- Configuración (solo equipo administrable y cuando proceda)

`Decisiones` es una etiqueta de UX; el término de dominio continúa siendo `Consulta`.

## 16. MVP y fuera de alcance

El alcance incluido representa el **Target MVP**. La priorización MoSCoW diferencia qué parte de ese alcance es imprescindible para una validación mínima y qué parte puede diferirse si aparece presión de tiempo. La justificación completa está en `product/09b-requirements-prioritization.md`.

### Minimum Viable Validation

El mínimo defendible para validar Synqo conserva: equipo rápido, participación sin cuenta, disponibilidad diaria con estados básicos, coincidencias deterministas, propuesta temporal, respuestas, resultado, resolución explícita, encuesta `SINGLE`, voto, resultado/resolución de encuesta, deep links acotados y garantías básicas de seguridad, privacidad, accesibilidad e integridad.

Este mínimo permite probar las dos preguntas centrales —`¿Cuándo podemos?` y `¿Qué decidimos?`— aunque omita capacidades valiosas del Target MVP.

### Incluido

Equipos rápidos y administrables; participación sin cuenta; participantes locales; disponibilidad por días; `Disponible/Quizá/No disponible`; vistas calendario/lista; solicitudes; coincidencias; propuestas; encuestas single/multiple; resultado/resolución; deadlines; histórico; pendientes; deep links; visibilidad nominal/agregada de encuesta; permisos básicos.

### Fuera de alcance

Recurrencia automática, franjas horarias de disponibilidad general, gestión integral de eventos, reservas, chat, tareas, sincronización automática con calendarios, anonimato fuerte, voto ponderado/ranking, destinatarios parciales arbitrarios, sistema genérico de roles y notificaciones externas automáticas de actividad de producto.

## 17. IA del TFM

El core no necesita IA. Como funcionalidad opcional, Synqo incorporará un **Asistente de coordinación en lenguaje natural** que transforma una petición en restricciones estructuradas. El LLM no consulta directamente la base de datos, no calcula coincidencias y no publica ni resuelve consultas. El output se valida y el motor determinista calcula las fechas candidatas. El usuario revisa antes de crear la propuesta.

Cada equipo tiene una zona horaria IANA canónica. La disponibilidad por día, las opciones temporales y las expresiones relativas interpretadas por IA se resuelven en esa zona; la interpretación concreta se muestra antes de aplicarla.

La prioridad de producto de la IA no convierte el asistente en requisito `Must` del producto básico: el flujo manual debe seguir disponible. Para la entrega del TFM, en cambio, la ruta IA y su evaluación son necesarias como demostración académica.

## 18. Métricas iniciales

Sin objetivos arbitrarios previos a la medición, se observarán tasa y tiempo de respuesta, tiempo hasta propuesta/resolución, consultas resueltas, reutilización de equipos rápidos, proporción de participantes sin cuenta y tasa de vinculación posterior.

## 19. Criterios de éxito

El MVP queda validado funcionalmente cuando los tres recorridos principales —coordinación rápida, decisión general y uso administrable persistente— pueden completarse de extremo a extremo, y la capa IA puede asistir sin ser requisito para que el flujo manual funcione.
