# 19 — Decisiones abiertas

No quedan decisiones `OPEN-*` bloqueantes para continuar con el diseño UI/técnico inicial. Las decisiones `OPEN-01`…`OPEN-09` se cerraron en `planning/01-open-decisions/open-decisions-resolution.md` y se propagaron a los documentos funcionales afectados.

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
