# ADR-005 — Persistencia con MikroORM + PostgreSQL

**Estado:** Accepted — revised context

## Contexto
El dominio estabilizado es relacional: Cuenta, Participante, Equipo, políticas, Disponibilidad, Solicitud, Consulta, opciones, Respuestas y Resolución. Existen invariantes transaccionales como resolver+cierre, idempotencia de respuestas y vinculación de identidades.

## Alternativas consideradas
MikroORM, Prisma, TypeORM, NoSQL principal.

## Decisión
Usar **PostgreSQL + MikroORM**.

## Justificación
Transacciones, integridad relacional, Data Mapper y Unit of Work encajan con el dominio. La especialización conceptual Consulta/Propuesta/Encuesta no prescribe una estrategia ORM concreta; el esquema físico se decidirá durante diseño técnico.

## Revisar si
El modelo real demuestra un patrón no relacional dominante o MikroORM produce un bloqueo técnico comprobado.
