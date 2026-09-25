# Especificación de prototipo interactivo

## Objetivo

Diseñar un prototipo navegable para validar tres recorridos E2E principales antes de implementar Synqo, usando datos ficticios y navegación simulada sin backend real.

## Fuentes

- `product/14-user-flows.md`
- `product/17-traceability-matrix.md`
- `design/10-high-fidelity/high-fidelity-screen-briefs.md`
- `design/06-interactions/interaction-patterns.md`

## Decisión de herramienta

El prototipo se especifica como Figma-first.

Razones:

- permite validar navegación, jerarquía, copy y comprensión sin implementar;
- evita confusión con código de producción;
- permite enlazar variantes de estado y formularios simulados;
- es suficiente para una validación de usabilidad ligera.

Si más adelante se necesita un prototipo HTML, debe vivir separado del código de producto, por ejemplo en una carpeta documental o artefacto experimental, y no compartir rutas, API ni scaffolding con la aplicación real.

## Alcance

| E2E | Nombre | Objetivo de validación |
|---|---|---|
| `E2E-01` | Coordinación rápida | Crear equipo rápido, indicar disponibilidad, revisar coincidencias, crear propuesta, responder y resolver. |
| `E2E-02` | Encuesta | Crear encuesta, votar, consultar resultado y registrar decisión final. |
| `E2E-03` | Equipo administrable | Crear equipo administrable, verificar, configurar permisos y reutilizar el equipo. |

Fuera de alcance:

- backend real;
- autenticación real;
- persistencia real;
- envío de email real;
- IA real;
- cálculo dinámico de resultados;
- implementación React.

## Datos ficticios

- Equipo rápido: `Pádel jueves`.
- Equipo administrable: `TFM Coordinación`.
- Participante actual: `Fran`.
- Participantes: Fran, Marta, Lucía, Dani, Irene, Álvaro, Sara, Leo.
- Fechas: 12, 14, 15, 17 de octubre de 2026.
- Propuesta: `Próximo partido`.
- Encuesta: `¿Pista cubierta?`.
- Opciones encuesta: `Sí`, `No`, `Me da igual`.
- Disponibilidad colectiva:
  - 12 oct: 6 Disponible, 1 Quizá, 1 No disponible.
  - 14 oct: 7 Disponible, 0 Quizá, 0 No disponible, 1 Sin respuesta.
  - 15 oct: 3 Disponible, 3 Quizá, 1 No disponible, 1 Sin respuesta.

## Mapa conceptual de rutas

Estas rutas son identificadores de prototipo, no contrato técnico.

| Ruta prototipo | Pantalla |
|---|---|
| `/` | Landing |
| `/crear-equipo` | Selección tipo de equipo |
| `/crear-equipo/rapido` | Crear equipo rápido |
| `/crear-equipo/administrable` | Crear equipo administrable |
| `/equipo/padel-jueves` | Inicio de equipo |
| `/equipo/padel-jueves/disponibilidad/mi` | Mi disponibilidad |
| `/equipo/padel-jueves/disponibilidad/equipo` | Disponibilidad colectiva |
| `/equipo/padel-jueves/propuesta/nueva` | Crear propuesta |
| `/propuesta/proximo-partido/responder` | Responder propuesta por deep link |
| `/propuesta/proximo-partido/resultados` | Resultado y resolución |
| `/equipo/padel-jueves/decisiones` | Decisiones |
| `/equipo/padel-jueves/encuesta/nueva` | Crear encuesta |
| `/encuesta/pista-cubierta/responder` | Responder encuesta |
| `/encuesta/pista-cubierta/resultados` | Resultado y resolución encuesta |
| `/equipo/tfm-coordinacion/verificacion` | Verificación administrable |
| `/equipo/tfm-coordinacion/configuracion` | Configuración administrable |

## `E2E-01` Coordinación rápida

### Flujo

1. Landing → `Crear un equipo`.
2. Selección tipo → `Crear rápido`.
3. Equipo rápido creado → inicio de equipo.
4. `Mi disponibilidad` → editar 12, 14 y 15 oct → guardar.
5. `Disponibilidad del equipo` → revisar coincidencias → seleccionar 12 y 14 oct.
6. `Crear propuesta con 2 fechas` → añadir hora opcional → publicar.
7. Abrir deep link de respuesta como participante ficticio.
8. Responder propuesta.
9. Ver resultados.
10. Resolver propuesta con confirmación.

### Puntos de decisión

- Elegir equipo rápido frente administrable.
- Cambiar entre Calendario y Lista si la persona se atasca.
- Seleccionar fechas candidatas aunque no sean "ganadoras".
- Confirmar resolución tras revisar resultado.

### Estados mínimos

- Equipo rápido temporal.
- Guardando disponibilidad.
- Selección de candidatas.
- Propuesta abierta.
- Consulta resuelta.
- Error recuperable opcional al guardar disponibilidad.

## `E2E-02` Encuesta

### Flujo

1. Inicio de equipo → `Crear` → `Crear encuesta`.
2. Redactar pregunta `¿Pista cubierta?`.
3. Añadir opciones `Sí`, `No`, `Me da igual`.
4. Elegir modalidad SINGLE.
5. Publicar.
6. Abrir enlace de respuesta.
7. Votar `Sí`.
8. Ver resultados.
9. Resolver encuesta.
10. Consultar histórico/estado resuelto.

### Puntos de decisión

- SINGLE frente MULTIPLE.
- Resultados agregados frente nominales.
- Resolver no es automático aunque haya opción con más votos.

### Estados mínimos

- Encuesta abierta.
- Voto guardado.
- Resultado con empate opcional.
- Decisión final registrada.

## `E2E-03` Equipo administrable

### Flujo

1. Landing → `Crear un equipo`.
2. Selección tipo → `Crear administrable`.
3. Introducir nombre `TFM Coordinación` y email.
4. Pantalla de verificación pendiente.
5. Simular `Verificar email`.
6. Inicio/configuración del equipo administrable.
7. Configurar disponibilidad: Disponible, Quizá, No disponible activos.
8. Configurar creación: todos pueden crear solicitudes y decisiones.
9. Configurar resolución: administradores.
10. Guardar cambios.
11. Compartir equipo o volver al inicio.

### Puntos de decisión

- Comprender que equipo administrable no exige Cuenta.
- Comprender que email verifica administración.
- Cambiar permisos sin confundir participar con administrar.

### Estados mínimos

- `PendingVerification`.
- Configuración con cambios sin guardar.
- Configuración inválida si se desactivan Disponible y No disponible.
- Guardado correcto.
- Sin permisos para usuario no administrador como variante.

## Navegación del prototipo

- Cada pantalla debe tener un CTA principal que avance el flujo.
- Rutas de deep link deben aterrizar cerca de la acción.
- Los botones secundarios permiten volver al contexto anterior.
- Los estados de error/retry deben ser alcanzables por enlace de prototipo específico o variante.
- No hace falta simular todos los campos editables; sí debe parecer plausible completar la tarea.

## Estados de éxito/error mínimos

| Área | Éxito | Error/alternativa |
|---|---|---|
| Disponibilidad | `Disponibilidad guardada` | `No se pudo guardar. Reintentar.` |
| Propuesta | `Propuesta publicada` | Menos de dos fechas. |
| Respuesta | `Respuesta guardada` | Consulta cerrada durante edición. |
| Encuesta | `Encuesta publicada` | Menos de dos opciones. |
| Resolución | `Decisión final registrada` | Ya resuelta. |
| Administrable | `Configuración guardada` | Configuración de disponibilidad inválida. |
| Enlace | Respuesta directa | Enlace revocado/expirado como variante. |

## Reglas de fidelidad

- Usar los briefs `HF-01`…`HF-12` como base visual.
- No añadir rutas que no correspondan a flows documentados.
- No simular chat, notificaciones externas automáticas ni recurrencia.
- Los cálculos de resultados son datos fijos del prototipo.
- La IA no forma parte de los tres E2E principales; puede existir como pantalla exploratoria no obligatoria.

## Decisiones de prototipo

| ID | Decisión |
|---|---|
| `PROTO-01` | El prototipo se define Figma-first y no requiere backend real. |
| `PROTO-02` | Los tres E2E principales son coordinación rápida, encuesta y equipo administrable. |
| `PROTO-03` | Los resultados y disponibilidad usan datos fijos, no cálculo dinámico. |
| `PROTO-04` | Los deep links se simulan como pantallas/rutas directas. |
| `PROTO-05` | Variantes de error se incluyen como frames enlazables, no como lógica real. |

## Referencias cruzadas

- `E2E-01`
- `E2E-02`
- `E2E-03`
- `UF-01`…`UF-16`
- `UF-21`
- `HF-01`…`HF-12`
- `INT-01`…`INT-06`
