# Resolución de decisiones abiertas 01

## Objetivo

Cerrar las decisiones `OPEN-01`…`OPEN-09` que tienen base suficiente en la documentación consolidada de producto y arquitectura, dejando explícitos los valores de MVP, su motivación, riesgos residuales y documentos impactados.

## Criterios usados

- Mantener Synqo centrado en equipos, baja fricción, participación sin cuenta y resolución humana.
- Favorecer valores simples, observables y fáciles de explicar en UI.
- Reducir PII y vida indefinida de equipos rápidos.
- No introducir nuevos canales, roles, servicios o arquitecturas fuera del MVP.
- Documentar como decisión de producto lo funcional y reservar ADR para elecciones arquitectónicas significativas.

## Decisiones

| ID | Estado | Decisión | Razón | Documentos impactados | Riesgo residual |
|---|---|---|---|---|---|
| `OPEN-01` | Cerrada con valor MVP | Un equipo rápido permanece `Active` hasta 30 días desde la última actividad relevante. Tras ese periodo pasa a `Recoverable` durante 14 días. Si no hay reactivación válida, pasa a `Expired` definitivo. | 30+14 días da tiempo razonable a coordinación informal sin convertir equipos rápidos en persistentes; el periodo recuperable permite corregir olvidos sin retener indefinidamente. | `PRD.md`, `product/07-business-rules.md`, `product/08-lifecycles.md`, `product/09-functional-requirements.md`, `product/product-decision-register.md`, ADR-016 | Puede requerir ajuste futuro con métricas reales de reutilización. |
| `OPEN-02` | Cerrada con valor MVP | Renuevan actividad solo interacciones humanas intencionales que modifican o reactivan el contexto: identificarse/crear participante, actualizar disponibilidad, responder, crear solicitud/consulta, votar, resolver/cancelar, vincular a cuenta o confirmar reactivación. No renuevan visitas pasivas, previews, bots, jobs ni envíos automáticos. | Evita abuso por accesos automáticos y mantiene la temporalidad; las acciones que renuevan son comprensibles para usuario y dominio. | `PRD.md`, `product/07-business-rules.md`, `product/08-lifecycles.md`, `product/09-functional-requirements.md`, ADR-016 | La detección de bots/previews se concretará técnicamente en prompts posteriores. |
| `OPEN-03` | Cerrada | En equipos rápidos, cualquier participante activo puede crear solicitudes de disponibilidad, propuestas y encuestas. | Es coherente con baja fricción, ausencia de administración formal y regla ya cerrada de que todos pueden resolver. La autorización sigue aplicándose server-side. | `PRD.md`, `product/07-business-rules.md`, `product/09-functional-requirements.md`, `product/12-user-stories-and-acceptance-criteria.md`, `product/product-decision-register.md` | Riesgo de ruido en equipos compartidos por enlace; se acepta para MVP por simplicidad. |
| `OPEN-04` | Cerrada con valor MVP | Un equipo administrable tiene una única identidad administrativa primaria en el MVP. | Simplifica verificación, recuperación, permisos e interfaz sin impedir ampliar a múltiples administradores después. | `PRD.md`, `product/07-business-rules.md`, `product/09-functional-requirements.md`, `product/product-decision-register.md` | Puede ser limitante en equipos reales; se deja como evolución futura. |
| `OPEN-05` | Cerrada con valor MVP | Defaults de equipo administrable: solicitudes = todos los participantes activos; propuestas/encuestas = todos los participantes activos; resolución = administración; estados = `Disponible`, `Quizá`, `No disponible` habilitados. | Mantiene colaboración abierta para iniciar actividad y reserva la decisión final a la identidad administrativa, alineando continuidad con gobernanza mínima. | `PRD.md`, `product/07-business-rules.md`, `product/09-functional-requirements.md`, `product/product-decision-register.md` | Algunos equipos preferirán más control desde el inicio; pueden cambiarlo en configuración. |
| `OPEN-06` | Cerrada | Orden por defecto de candidatos: menor `No disponible`, mayor `Disponible`, mayor `Quizá`, menor `Sin respuesta`, fecha más próxima. `Quizá` es señal positiva débil, nunca equivalente a `Disponible`. | Mantiene recuentos separados, evita resolver automáticamente y ofrece una ordenación determinista fácil de explicar. | `PRD.md`, `product/07-business-rules.md`, `product/09-functional-requirements.md`, `product/product-decision-register.md`, `product/18-ai-feature-specification.md` | Equipos distintos pueden valorar de otra forma el `Quizá`; parametrizarlo queda fuera del MVP. |
| `OPEN-07` | Cerrada con valor MVP | Al expirar definitivamente un equipo rápido, sus datos de dominio y credenciales de acceso se eliminan o anonimizan de forma irreversible; solo pueden conservarse métricas agregadas y trazas operativas mínimas sin tokens ni PII innecesaria. | Refuerza privacidad y temporalidad; evita mantener histórico informal más allá de lo prometido. | `PRD.md`, `product/07-business-rules.md`, `product/08-lifecycles.md`, `product/09-functional-requirements.md`, `product/10-non-functional-requirements.md`, `product/product-decision-register.md`, ADR-016 | El detalle técnico entre borrado físico y anonimización por tabla se cerrará en privacidad/datos. |
| `OPEN-08` | Cerrada con valor MVP | En el MVP no hay notificaciones externas automáticas de actividad de producto. Email externo queda limitado a verificación/recuperación administrativa y autenticación si existe. Nuevas solicitudes, propuestas, encuestas, recordatorios y expiración se comunican por UI, pendientes y enlaces compartidos manualmente. | Reduce complejidad, preferencias de comunicación, PII y dependencia de jobs; mantiene el MVP funcional mediante deep links y pendientes. | `PRD.md`, `product/09-functional-requirements.md`, `product/11-constraints.md`, `product/product-decision-register.md`, ADR-017, `architecture/adr-reconciliation.md` | Menor reactivación sin recordatorios; producto podrá medir si necesita email/push futuro. |
| `OPEN-09` | Cerrada con valor MVP | Cada equipo tiene una zona horaria IANA canónica. Las fechas de disponibilidad y propuestas se interpretan en esa zona. La creación usa la zona del navegador como valor por defecto editable. Expresiones relativas de IA se resuelven con fecha actual, zona del equipo y locale de interfaz; la interpretación concreta se muestra antes de aplicar. | Evita ambigüedad entre participantes en distintas zonas y mantiene coherencia entre disponibilidad por día, propuestas e IA. | `PRD.md`, `product/07-business-rules.md`, `product/09-functional-requirements.md`, `product/product-decision-register.md`, `product/18-ai-feature-specification.md` | Cambios de zona horaria del equipo tras tener actividad requerirán reglas técnicas posteriores. |

## Cuestiones desplazadas a fases posteriores

- Cómo se implementa la detección técnica de actividad humana frente a bots/previews.
- Borrado físico por tabla frente a anonimización selectiva tras expiración definitiva.
- Soporte futuro de múltiples administradores.
- Notificaciones externas opcionales posteriores al MVP.
- Reglas técnicas para cambiar la zona horaria de un equipo con histórico.

Estas cuestiones no bloquean el diseño UI/técnico inicial porque los valores funcionales de MVP ya quedan definidos.

## Impacto arquitectónico

No se crea ningún ADR nuevo. Las decisiones son funcionales o de política de producto. ADR-016 y ADR-017 solo requieren actualización de texto porque hacían referencia a `OPEN-01`, `OPEN-02`, `OPEN-07` y `OPEN-08`.

## Tabla final

| ID | Clasificación | Resultado |
|---|---|---|
| `OPEN-01` | Cerrar con valor provisional de MVP | Cerrada como `Active` 30 días + `Recoverable` 14 días. |
| `OPEN-02` | Cerrar con valor provisional de MVP | Cerrada con lista de actividad humana relevante. |
| `OPEN-03` | Cerrar ahora | Todos los participantes activos pueden crear actividad en equipo rápido. |
| `OPEN-04` | Cerrar con valor provisional de MVP | Un administrador primario en MVP. |
| `OPEN-05` | Cerrar con valor provisional de MVP | Creación abierta a participantes; resolución administrativa; tres estados activos. |
| `OPEN-06` | Cerrar ahora | Ordenación lexicográfica determinista con `Quizá` como señal positiva débil. |
| `OPEN-07` | Cerrar con valor provisional de MVP | Eliminación/anonimización irreversible tras expiración definitiva. |
| `OPEN-08` | Cerrar con valor provisional de MVP | Sin notificaciones externas automáticas de actividad en MVP. |
| `OPEN-09` | Cerrar con valor provisional de MVP | Zona horaria IANA por equipo; relativas por zona del equipo y revisión humana. |
