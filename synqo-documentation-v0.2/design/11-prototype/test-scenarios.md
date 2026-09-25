# Escenarios de prueba del prototipo

## Uso

Guion para pruebas moderadas o no moderadas del prototipo. La persona evaluadora puede entregar cada tarea tal como está escrita, sin explicar reglas internas de Synqo.

## Preparación

- Prototipo abierto en pantalla inicial.
- Dispositivo recomendado: móvil 360px simulado o teléfono real para primera ronda.
- No explicar previamente qué significan `Resultado actual`, `Decisión final`, `Quizá` o `Sin respuesta`.
- Observar dudas, retrocesos, lectura de mensajes y errores de interpretación.

## Métricas ligeras

| Métrica | Cómo medir |
|---|---|
| Éxito de tarea | Completa / completa con ayuda / no completa. |
| Tiempo aproximado | Cronometrar desde inicio de tarea. |
| Duda observable | Pausas, relecturas, navegación atrás, pregunta verbal. |
| Comprensión clave | Pregunta post-tarea. |
| Severidad | Alta si bloquea; media si retrasa; baja si solo genera roce. |

## Escenario 1 — Coordinación rápida

### Contexto para la persona

```text
Quieres organizar un partido de pádel este mes con un grupo pequeño. No quieres crear una cuenta ahora. Crea un equipo rápido, indica cuándo puedes, revisa las mejores coincidencias y deja una propuesta resuelta.
```

### Tareas

1. Crea un equipo rápido llamado `Pádel jueves`.
2. Indica tu disponibilidad para tres días de octubre.
3. Busca la disponibilidad del equipo.
4. Selecciona dos fechas candidatas.
5. Crea una propuesta con esas fechas.
6. Responde a la propuesta como participante.
7. Consulta el resultado.
8. Registra una decisión final.

### Resultado esperado

- El usuario elige equipo rápido sin buscar registro.
- Entiende que el equipo es temporal.
- Usa `Mi disponibilidad` y `Disponibilidad del equipo` como conceptos distintos.
- Selecciona fechas desde disponibilidad colectiva.
- No interpreta la fecha con más disponibilidad como decisión automática.
- Confirma la resolución explícitamente.

### Preguntas post-tarea

- ¿Qué diferencia viste entre disponibilidad y propuesta?
- ¿La app decidió automáticamente la fecha?
- ¿Qué significa que el equipo sea rápido?
- ¿Hubo algún punto donde no supieras qué hacer después?

## Escenario 2 — Encuesta

### Contexto para la persona

```text
En el equipo ya creado queréis decidir si jugar en pista cubierta. Crea una encuesta, vota y registra la decisión final.
```

### Tareas

1. Crea una encuesta con la pregunta `¿Pista cubierta?`.
2. Añade las opciones `Sí`, `No` y `Me da igual`.
3. Déjala como selección única.
4. Publícala.
5. Vota una opción.
6. Consulta el resultado.
7. Registra la decisión final.

### Resultado esperado

- El usuario distingue Propuesta de Encuesta.
- Entiende SINGLE como una única opción.
- Puede votar sin cuenta adicional.
- Ve el resultado como recuento.
- Entiende que resolver encuesta es una acción explícita.

### Preguntas post-tarea

- ¿Qué diferencia viste entre votar y resolver?
- ¿Qué habrías esperado que pasara si dos opciones empatan?
- ¿Te quedó claro si los resultados eran agregados o nominales?

## Escenario 3 — Equipo administrable

### Contexto para la persona

```text
Ahora quieres crear un equipo para usarlo durante más tiempo, con permisos configurables. Crea un equipo administrable, verifica la administración y revisa la configuración básica.
```

### Tareas

1. Crea un equipo administrable llamado `TFM Coordinación`.
2. Introduce un email de administración.
3. Completa la verificación simulada.
4. Revisa la configuración de disponibilidad.
5. Configura quién puede crear solicitudes y decisiones.
6. Comprueba quién puede resolver decisiones.
7. Guarda la configuración.

### Resultado esperado

- El usuario entiende que administrable no equivale necesariamente a crear Cuenta.
- Entiende que el email verifica administración.
- Diferencia participar de administrar.
- No intenta desactivar simultáneamente Disponible y No disponible sin entender la validación.
- Comprende que resolución por administradores es el default.

### Preguntas post-tarea

- ¿Qué diferencia viste entre equipo rápido y administrable?
- ¿Para qué se usa el email?
- ¿Quién puede resolver decisiones en esta configuración?
- ¿Qué cambiarías del texto o de la pantalla?

## Variantes de error a probar

| Variante | Tarea | Observación buscada |
|---|---|---|
| Guardado de disponibilidad falla | Escenario 1, tarea 2 | Si conserva cambios y encuentra reintento. |
| Propuesta con una sola fecha | Escenario 1, tarea 5 | Si entiende validación de mínimo dos fechas. |
| Consulta cerrada al responder | Escenario 1, tarea 6 | Si entiende paso a lectura. |
| Encuesta con una opción | Escenario 2, tarea 2 | Si entiende mínimo dos opciones. |
| Configuración inválida | Escenario 3, tarea 4 | Si entiende mantener Disponible o No disponible. |
| Enlace revocado | Deep link de respuesta | Si distingue revocado de error técnico. |

## Señales de riesgo

- Confunde `Sin respuesta` con `No disponible`.
- Cree que la mejor coincidencia queda resuelta automáticamente.
- No entiende que disponibilidad general no modifica respuestas a propuestas.
- No encuentra cómo volver al equipo tras un deep link.
- No distingue equipo rápido de administrable.
- No entiende cuándo una acción está bloqueada por permisos o por consulta cerrada.

## Criterios de cierre del prototipo

El prototipo está listo para validación si:

- Los tres E2E tienen inicio, objetivo, pasos y final claro.
- Ningún recorrido requiere backend real.
- Hay datos suficientes para comparar disponibilidad, resultado y resolución.
- Las variantes de error están enlazadas o localizables.
- Las pantallas respetan briefs high-fidelity y patrones de interacción.
