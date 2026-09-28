# 19 — Decisiones abiertas

No quedan decisiones `OPEN-*` bloqueantes para continuar con el diseño UI/técnico inicial. Las decisiones `OPEN-01`…`OPEN-09` se cerraron en `planning/01-open-decisions/open-decisions-resolution.md` y se propagaron a los documentos funcionales afectados. `OPEN-10` queda registrada para una evolución posterior y no altera el modelo actual de participación contextual propia.

## Decisiones abiertas

### `OPEN-10` — Identidad contextual, recuperación y delegación de participantes

**Pregunta.** Cuando una persona abre un equipo sin una `ParticipantSession` válida, ¿cómo declara o recupera de forma segura quién es dentro del equipo? ¿Qué participantes puede actualizar una persona y bajo qué delegación explícita?

**Contexto actual.** Un enlace público permite crear una identidad local nueva, pero no elegir ni reclamar una participación existente por nombre. Una sesión contextual solo permite operar sobre su propio participante; esta regla evita suplantación.

**Dirección de producto a evaluar.** Mostrar al entrar un selector de identidad del equipo; permitir crear una participación si la política del equipo lo autoriza —en rápido, previsiblemente por defecto— y ofrecer un selector persistente de participante o participantes sobre los que se está actuando.

**Decisiones que deben cerrarse.**

- Prueba necesaria para recuperar una participación existente sin cuenta: sesión previa, enlace identificado, cuenta vinculada u otro mecanismo.
- Visibilidad del selector: no debe permitir enumerar ni reclamar identidades de terceros.
- Modelo de delegación: quién concede permiso, alcance por participante/acción/fecha, revocación y expiración.
- Diferencia visible y auditable entre actor real y participante cuyos datos se modifican.
- Defaults y límites entre equipos rápidos y administrables.

**Impacto potencial.** Requisitos de identidad/acceso y participantes, pantallas de acceso y navegación de equipo, reglas de autorización, modelo de sesiones/enlaces, auditoría, privacidad, API, datos y pruebas de IDOR/delegación.

**Estado.** No bloquea SPEC-003 ni las SPECs ya verificadas. Debe prepararse una SPEC de identidad contextual y delegación antes de implementarse; cualquier decisión que cambie autorización, datos o contrato requerirá Change Control.

## Decisiones cerradas desde este registro

| ID | Resultado |
|---|---|
| `OPEN-01` | Equipo rápido: `Active` 30 días desde última actividad relevante + `Recoverable` 14 días. |
| `OPEN-02` | Solo interacciones humanas intencionales renuevan actividad; visitas pasivas, bots, jobs y automatismos no renuevan. |
| `OPEN-03` | En equipos rápidos, cualquier participante activo puede crear solicitudes, propuestas y encuestas. |
| `OPEN-04` | En MVP, equipo administrable tiene una única identidad administrativa primaria. |
| `OPEN-05` | Defaults administrables: creación por todos los participantes activos, resolución por administración, tres estados habilitados. |
| `OPEN-06` | Candidatos ordenados por menor `No disponible`, mayor `Disponible`, mayor `Quizá`, menor `Sin respuesta`, fecha más próxima. |
| `OPEN-07` | Tras expiración definitiva de equipo rápido, datos de dominio y credenciales se eliminan o anonimizan irreversiblemente. |
| `OPEN-08` | En MVP no hay notificaciones externas automáticas de actividad de producto. |
| `OPEN-09` | Cada equipo tiene zona horaria IANA canónica; fechas relativas se resuelven con zona del equipo, fecha actual y locale de interfaz. |

## Riesgos y cuestiones a concretar en diseño posterior

- Detección técnica de actividad humana frente a bots/previews.
- Evolución a múltiples administradores.
- Notificaciones externas opcionales posteriores al MVP.
- Restricciones técnicas al cambiar zona horaria de un equipo con histórico.

## Cierres posteriores

- Fase 23 (`security/23-privacy-retention/data-retention-and-privacy.md`): concreta `OPEN-07` por tabla/categoría. Para equipos rápidos expirados definitivamente se adopta borrado físico preferente de datos de dominio y credenciales; solo pueden sobrevivir métricas agregadas y trazas operativas minimizadas sin PII ni tokens.

## Decisiones futuras explícitamente fuera del MVP

Conversión rápido→administrable, calendarios externos, push, franjas horarias, destinatarios parciales, voto anónimo fuerte, sistemas de votación avanzados y nuevas funciones IA.
