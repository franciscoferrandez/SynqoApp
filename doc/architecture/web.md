# Arquitectura del módulo WEB

WEB es una aplicación Angular 21 que se ejecuta en el navegador con Node.js 24 durante el desarrollo. Presenta los recorridos, conserva preferencias e identidad seleccionada en el navegador y consulta la API por HTTP. No accede a PostgreSQL.

```mermaid
flowchart LR
    Person[Persona usuaria] --> Routes[Rutas Angular]
    Routes --> Create[CreatePage]
    Routes --> Confirm[ConfirmationPage]
    Routes --> Team[TeamLayout]
    Team --> Calendar[EmptySection · calendario ilustrativo]
    Team --> Polls[EmptySection · consultas ilustrativas]
    Routes --> LinkState[LinkMessagePage]

    Create --> TeamApi[TeamApi · HttpClient]
    Confirm --> TeamApi
    Team --> TeamApi
    TeamApi --> Interceptor[Interceptor de acceso]
    Interceptor -->|Bearer extraído de #t=...| API[API Symfony · /api]

    App[App] --> Theme[ThemePicker / ThemeService]
    Theme --> LocalStorage[(Preferencia de tema)]
    Team --> LocalIdentity[(Identidad por equipo)]
```

## Componentes

- **App y rutas:** `app.ts`, `app.routes.ts` y `app.config.ts` montan el selector de tema, la navegación y el interceptor HTTP. Las rutas separan creación, confirmación, equipo y estados de enlace.
- **CreatePage:** recoge nombre del equipo y primer participante y envía la creación a la API. El campo de correo es ilustrativo y no se transmite.
- **ConfirmationPage:** muestra el equipo creado y permite copiar o compartir el enlace. Su estado reciente se mantiene en memoria del servicio durante la navegación.
- **TeamLayout:** carga el equipo, comprueba la identidad local elegida y presenta la cabecera, selector de identidad, enlace y navegación interior. La selección por UUID se recuerda en `localStorage`; el valor secreto del enlace permanece en el fragmento URL.
- **TeamApi e interceptor:** agrupan las peticiones JSON. El interceptor obtiene el secreto `t` del fragmento y lo envía como Bearer en las llamadas `/api/`.
- **ThemePicker y ThemeService:** aplican tema automático, claro u oscuro; la preferencia se guarda en `localStorage`.
- **EmptySection y LinkMessagePage:** renderizan las superficies actuales de calendario y consultas, y los estados de enlace caducado o no encontrado. Calendario y consultas aún son ilustrativos y no leen ni escriben disponibilidad o consultas.

## Recorrido HTTP

```mermaid
sequenceDiagram
    actor User as Navegador
    participant Page as Página Angular
    participant Client as TeamApi + interceptor
    participant API as API Symfony

    User->>Page: Crea equipo o abre /e#t=...
    Page->>Client: Crear, leer o añadir participante
    Client->>Client: Añade Bearer desde el fragmento para rutas protegidas
    Client->>API: JSON por /api/teams...
    API-->>Client: JSON o Problem Details
    Client-->>Page: Resultado para actualizar la vista
```

## Desarrollo

Los comandos de instalación, servidor, pruebas, lint, formato y build están en el [README principal](../../README.md#desarrollo-local). Las rutas reales y los tests de navegador están bajo `src/app/` y `e2e/`.
