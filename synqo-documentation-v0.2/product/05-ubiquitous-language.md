# 05 — Lenguaje ubicuo

| Término | Definición |
|---|---|
| **Cuenta** | Identidad global y persistente de una persona registrada en Synqo. |
| **Equipo** | Contexto compartido que agrupa participantes, disponibilidad y procesos de decisión. Término oficial del dominio. |
| **Participante** | Identidad local de una persona dentro de un equipo. Puede no tener cuenta. |
| **Administrador** | Identidad con capacidades de configuración y gobierno sobre un equipo administrable. |
| **Creador** | Persona que origina un equipo, solicitud o consulta. No implica privilegios permanentes. |
| **Equipo rápido** | Equipo temporal de baja fricción, sin administración formal y sujeto a expiración. |
| **Equipo administrable** | Equipo persistente y configurable con identidad administrativa verificable. |
| **Vincular a cuenta** | Asociar una participación o acceso con una cuenta sin cambiar la identidad ni el lifecycle del equipo. |
| **Conversión** | Cambio futuro de equipo rápido a administrable preservando identidad e histórico. |
| **Disponibilidad** | Estado general de un participante para un día concreto dentro de un equipo. |
| **Solicitud de disponibilidad** | Petición para completar/actualizar disponibilidad dentro de un rango. |
| **Coincidencia** | Información derivada de las disponibilidades agregadas por fecha. |
| **Consulta** | Abstracción funcional de un proceso de elección entre alternativas. Agrupa Propuesta y Encuesta. |
| **Propuesta** | Consulta cuyas opciones son fechas con hora opcional. |
| **Encuesta** | Consulta cuyas opciones son alternativas genéricas. |
| **Opción temporal** | Fecha obligatoria + hora opcional dentro de una propuesta. |
| **Respuesta** | Participación de un participante en una consulta. |
| **Voto** | Selección de una o varias opciones dentro de una encuesta según su modalidad. |
| **Resultado** | Información calculada a partir de respuestas. |
| **Resolución** | Decisión final explícita registrada para una consulta. |
| **Pendiente** | Acción derivada que requiere intervención del participante. |
| **Acceso público** | Acceso compartido que no concede por sí mismo una identidad administrativa. |
| **Acceso identificado** | Acceso que vincula de forma segura la sesión a un participante concreto. |
| **Acceso administrativo** | Acceso que otorga capacidades de administración tras una prueba válida de autorización. |

## Distinciones obligatorias

- `Cuenta ≠ Participante`.
- `Disponibilidad general ≠ respuesta a propuesta`.
- `No disponible ≠ Sin respuesta`.
- `Resultado ≠ Resolución`.
- `Vincular ≠ Convertir`.
- `Participar ≠ Administrar`.
- `Solicitud de disponibilidad ≠ Consulta`.
