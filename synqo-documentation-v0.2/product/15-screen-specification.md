# 15 — Especificación de pantallas

## Inventario

| ID | Pantalla |
|---|---|
| SCR-01 | Landing |
| SCR-02 | Crear equipo: modalidad |
| SCR-03 | Crear equipo rápido |
| SCR-04 | Crear equipo administrable |
| SCR-05 | Verificación administrativa |
| SCR-06 | Identificación al acceder |
| SCR-07 | Login/creación de cuenta |
| SCR-08 | Inicio global |
| SCR-09 | Mis equipos |
| SCR-10 | Cuenta |
| SCR-11 | Inicio de equipo |
| SCR-12 | Mi disponibilidad |
| SCR-13 | Disponibilidad colectiva |
| SCR-14 | Solicitudes |
| SCR-15 | Crear solicitud |
| SCR-16 | Responder solicitud |
| SCR-17 | Decisiones |
| SCR-18 | Crear: selección de actividad |
| SCR-19 | Crear propuesta |
| SCR-20 | Responder/ver propuesta |
| SCR-21 | Crear encuesta |
| SCR-22 | Responder/ver encuesta |
| SCR-23 | Resolver consulta |
| SCR-24 | Histórico |
| SCR-25 | Participantes |
| SCR-26 | Configuración general |
| SCR-27 | Configuración disponibilidad |
| SCR-28 | Configuración permisos |
| SCR-29 | Acceso y seguridad |
| SCR-30 | Administración |
| SCR-AI-01 | Interpretar restricciones y revisar candidatos |

## Disponibilidad

### Calendario

Representación visual principal por color, complementada con iconos/texto accesibles. En Mi disponibilidad, pulsar un día permite modificar su estado. En disponibilidad colectiva, pulsar muestra desglose, participantes y acción `Añadir a propuesta`.

### Lista

Representación semanal, más explícita y operativa. Debe permitir trabajar con varios días de forma rápida y mantener el mismo contexto temporal que el calendario.

## Resultado frente a resolución

Toda vista de consulta debe separar claramente:

- **Resultado actual**: recuentos calculados.
- **Decisión final**: resolución explícita o «Todavía sin resolver».

## Estados obligatorios de UI

Vacío, cargando, error recuperable, sin permisos, consulta cerrada, resuelta, cancelada, equipo recuperable, equipo expirado, enlace inválido/revocado y verificación pendiente.

## Acción Crear

Una acción común puede agrupar `Solicitar disponibilidad`, `Proponer fechas` y `Crear encuesta`, sin alterar el modelo de dominio.

## Asistente IA

Se integra junto al flujo de disponibilidad colectiva como opción adicional para encontrar candidatos. Debe mostrar la interpretación estructurada antes de ejecutar el motor determinista.
