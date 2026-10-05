# Arquitectura del módulo API

La API usa PHP 8.5, Symfony 7.4, API Platform 5, Doctrine ORM y PostgreSQL 18. Permite crear equipos y publica operaciones protegidas para leerlos, incorporar participantes, gestionar disponibilidad y crear, votar, consultar y resolver consultas.

```mermaid
flowchart LR
    Web[WEB Angular] -->|JSON / Bearer| Operations[API Platform · operaciones y OpenAPI]
    Operations --> Controllers[Team / Availability / Consultation Controllers]
    Controllers --> Services[Servicios de aplicación]
    Services --> Rules[Reglas de equipo, disponibilidad y consultas]
    Services --> Ports[Puertos de repositorio]
    Ports -. Doctrine ORM .-> Records[Entidades Team, Participant, Availability, Consultation, Option, Vote]
    Records --> DB[(PostgreSQL)]
    Command[app:teams:cleanup] --> Cleanup[TeamCleanupService]
    Cleanup --> Ports
    Operations -. contrato .-> OpenAPI[TeamOpenApiFactory]
```

## Componentes y responsabilidades

- **Recursos y controladores:** `TeamOperations`, `AvailabilityOperations` y `ConsultationOperations` declaran las rutas. Sus controladores adaptan JSON, Bearer y respuestas HTTP; `TeamOpenApiFactory` publica el contrato y `ProblemDetailsSubscriber` gestiona errores inesperados.
- **Equipo:** `TeamService` crea y lee equipos, incorpora participantes y verifica el enlace. `ParticipantName`, `TeamTimeZone` y `ExpiryCalculator` contienen reglas comprobables del dominio.
- **Disponibilidad:** `AvailabilityService` lee el intervalo y guarda marcas de participante; `DailyAvailability` valida estados, fechas editables y resumen diario.
- **Consultas:** `ConsultationService` lista, crea, muestra el detalle, registra o retira votos por opción y resuelve consultas de texto o fechas. `TextConsultationRules` y `DateConsultationRules` validan las opciones de creación. Las mutaciones comprueban acceso, identidad y vigencia bajo bloqueo del equipo; el repositorio aplica las restricciones de voto y resolución.
- **Persistencia y limpieza:** los repositorios `Orm*Repository` implementan los puertos de aplicación con Doctrine. `TeamCleanupService`, `TeamDeletionPolicy` y el comando `app:teams:cleanup` eliminan de la base activa los equipos cuyo plazo de retención terminó. El comando requiere ejecución externa; no hay tarea programada en el repositorio.

## Operaciones actuales

| Recurso | Operaciones |
|---|---|
| Equipo | `POST /api/teams`, `GET /api/teams/current`, `POST /api/teams/current/participants` |
| Disponibilidad | `GET /api/teams/current/availability`, `PUT /api/teams/current/availability/{date}/participants/{participantId}` |
| Consultas | `GET /api/teams/current/consultations`, `POST /api/teams/current/consultations` para opciones de texto o fecha, `GET /api/teams/current/consultations/{consultationId}` |
| Votos y resolución | `PUT /api/teams/current/consultations/{consultationId}/votes/{participantId}/options/{optionId}`, `PUT /api/teams/current/consultations/{consultationId}/resolution` |

Las rutas del equipo vigente comprueban el Bearer del enlace. Las respuestas son JSON o Problem Details y se describen en `/api/docs`.

## Persistencia

```mermaid
erDiagram
    TEAM ||--|{ PARTICIPANT : contiene
    TEAM ||--o{ AVAILABILITY : agrupa
    PARTICIPANT ||--o{ AVAILABILITY : marca
    TEAM ||--o{ CONSULTATION : contiene
    PARTICIPANT ||--o{ CONSULTATION : crea
    CONSULTATION ||--|{ CONSULTATION_OPTION : propone
    CONSULTATION ||--o{ CONSULTATION_VOTE : recibe
    PARTICIPANT ||--o{ CONSULTATION_VOTE : emite
    CONSULTATION_VOTE ||--o{ CONSULTATION_VOTE_SELECTION : selecciona
    CONSULTATION_OPTION ||--o{ CONSULTATION_VOTE_SELECTION : es_seleccionada
    CONSULTATION ||--o{ CONSULTATION_RESOLUTION_OPTION : acepta
    CONSULTATION_OPTION ||--o{ CONSULTATION_RESOLUTION_OPTION : es_aceptada
```

Las migraciones en `apps/api/migrations/` crean ocho tablas: equipo, participante, disponibilidad, consulta, opción, voto, selección de voto y opción aceptada en la resolución. Cada opción de consulta guarda texto **o** fecha civil, con una restricción que exige exactamente uno de esos valores. La consulta conserva el participante y la fecha de resolución. Las claves foráneas aplican borrado en cascada desde el equipo; la cascada para votos y resoluciones quedó verificada en [SPEC-EQU-002 — Borrado de equipos caducados](../../pdi_doc/08_especificaciones/99_archivadas/spec-equ-002-borrado-equipo-caducado.md).

## Desarrollo

Los comandos de Composer, migraciones, limpieza, base de prueba y análisis estático están en el [README principal](../../README.md#desarrollo-local). Los scripts ejecutables se declaran en `apps/api/composer.json`.
