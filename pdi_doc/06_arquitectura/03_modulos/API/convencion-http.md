# Convención HTTP de la API

Esta convención se aplica a los siguientes slices de Synqo. [ADR-COO-003 — Usar JSON y Problem Details como contrato de la API](../../../05_investigacion-y-decisiones/05_adr/adr-coo-003-json-y-problem-details-como-contrato-api.md) fija los formatos; cada SPEC asigna estos códigos a sus operaciones y documenta sus cuerpos en OpenAPI.

## Respuestas correctas

| Código | Uso común |
|---|---|
| `200` | Operación correcta que devuelve una representación. |
| `201` | Recurso creado; la respuesta devuelve la representación definida por la operación. |
| `204` | Operación correcta sin cuerpo de respuesta, cuando una SPEC lo prevea. |

## Errores

Todo error HTTP de la API usa `application/problem+json` e incluye `type`, `title`, `status` y `detail`. `status` coincide con el código HTTP. `detail` explica el problema sin revelar secretos, trazas ni datos privados. Los tipos de problema que deba distinguir un cliente serán estables y estarán documentados en OpenAPI; puede usarse `about:blank` si no se necesita una semántica adicional al código. La validación de campos puede añadir `violations`, una lista de objetos con `propertyPath` y `message`.

| Código | Uso común |
|---|---|
| `400` | Sintaxis de la petición incorrecta, incluido JSON mal formado. |
| `401` | Falta la credencial Bearer exigida por la operación. La respuesta incluye `WWW-Authenticate: Bearer`. |
| `403` | Credencial válida, pero una regla prohíbe la operación. Solo se usa si una SPEC define esa regla. |
| `404` | Recurso no encontrado. En acceso a equipos, también cubre el valor del enlace inválido y el equipo ya borrado, con respuesta genérica. |
| `409` | Conflicto con el estado actual, como un nombre de participante duplicado. Cada SPEC concreta sus conflictos. |
| `410` | En acceso a equipos, enlace válido cuyo equipo ha caducado y sigue conservado. No incluye datos del equipo. |
| `422` | Petición JSON bien formada que incumple validaciones de entrada o invariantes aplicables a sus campos. |
| `500` | Fallo interno inesperado; respuesta genérica sin detalles del servidor. |

Una credencial Bearer presente pero inválida para un equipo se trata como `404` conforme a [ADR-EQU-003 — Verificar el valor del enlace en cada operación de la API](../../../05_investigacion-y-decisiones/05_adr/adr-equ-003-verificar-enlace-en-api.md). `401` identifica su ausencia en una operación protegida. Un `409` expresa un conflicto con estado existente; `422` expresa que la entrada no supera la validación de la operación.

Las respuestas que incluyen datos de equipo o el enlace de acceso, y los errores `404` y `410` derivados de su comprobación, llevan `Cache-Control: no-store`. Cada operación declara en OpenAPI los códigos que realmente devuelve, el esquema de éxito, el esquema Problem Details, la autenticación y los tipos de problema distinguibles. Los códigos de esta tabla no se añaden automáticamente a todas las operaciones.

## Interpretación en WEB

La web interpreta el código junto con la operación solicitada y, cuando haga falta distinguir causas del mismo código, con el `type` estable. Un fallo de red no es una respuesta HTTP y se trata por separado.

| Resultado | Tratamiento del cliente |
|---|---|
| `400` | Avisar de que la petición no pudo procesarse; conservar el contexto útil para corregirla o repetirla. |
| `401` | En una operación de equipo, comprobar el enlace de acceso y mostrar un estado de acceso no disponible. No presentar la identidad local como autorización. |
| `403` | Informar de que la operación no está permitida, cuando alguna SPEC incorpore esta regla. |
| `404` | Al abrir un equipo, mostrar «No encontramos este equipo»; en otros recursos, mostrar el estado previsto por su SPEC. |
| `409` | Mostrar el conflicto concreto, conservar la entrada cuando proceda y permitir corregirla o actualizar el estado. |
| `410` | Al abrir un equipo, mostrar la pantalla de equipo caducado. |
| `422` | Asociar las `violations` a los campos cuando existan y ofrecer un resumen accesible. |
| `500` | Mostrar un error general con opción de reintento si la operación lo permite. |

Si una operación con actualización visual inmediata falla, WEB restaura el estado anterior y ofrece reintento conforme a su requisito y SPEC. Los mensajes de error se anuncian de forma accesible y conservan o recuperan el foco adecuado. La semántica específica de cada recorrido se concreta en su SPEC.

## Referencias

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html).
