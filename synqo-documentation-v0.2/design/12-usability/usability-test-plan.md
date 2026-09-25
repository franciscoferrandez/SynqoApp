# Plan de validación de usabilidad

## Objetivo

Preparar una validación ligera y defendible para el TFM, centrada en riesgos de comprensión del producto y no en preferencias estéticas.

## Fuentes

- `PRD.md`
- `product/03-users-and-scenarios.md`
- `product/04-jobs-to-be-done.md`
- `design/11-prototype/prototype-specification.md`

## Objetivos de investigación

| ID | Objetivo | Riesgo asociado |
|---|---|---|
| `UXR-01` | Comprobar si se entiende equipo rápido vs administrable. | Elegir modalidad incorrecta o esperar persistencia del equipo rápido. |
| `UXR-02` | Comprobar si se entiende participar sin cuenta. | Abandono por asumir registro obligatorio. |
| `UXR-03` | Comprobar disponibilidad general vs respuesta a propuesta. | Creer que disponibilidad confirma una fecha con hora. |
| `UXR-04` | Comprobar Resultado actual vs Decisión final. | Creer que Synqo decide automáticamente. |
| `UXR-05` | Comprobar uso del calendario/lista para disponibilidad y candidatas. | No encontrar cómo editar varios días o seleccionar fechas. |
| `UXR-06` | Comprobar comprensión de permisos administrables. | Confundir participante, cuenta y administración. |

## Preguntas de investigación

- ¿La persona entiende qué modalidad de equipo necesita para una coordinación puntual?
- ¿Detecta que puede participar sin crear cuenta?
- ¿Distingue `Sin respuesta` de `No disponible`?
- ¿Distingue disponibilidad general de respuesta a propuesta?
- ¿Comprende que un resultado calculado no es una decisión final?
- ¿Encuentra cómo seleccionar fechas candidatas desde disponibilidad colectiva?
- ¿Entiende que el email del equipo administrable verifica administración?
- ¿Puede completar el recorrido sin explicación oral?

## Participantes

Muestra recomendada: 5 participantes para una ronda inicial.

Perfiles:

- 2 personas que organizan planes o actividades puntuales.
- 2 personas que participan en grupos recurrentes de estudio/trabajo/ocio.
- 1 persona con experiencia administrando herramientas colaborativas.

Condiciones deseables:

- mezcla de móvil y escritorio;
- al menos 2 participantes sin familiaridad previa con Synqo;
- no usar personas que conozcan profundamente la documentación.

## Tareas

| Tarea | JTBD | E2E | Éxito esperado |
|---|---|---|---|
| Crear equipo rápido y coordinar fecha | `JTBD-01`, `JTBD-03`, `JTBD-05`, `JTBD-06`, `JTBD-07` | `E2E-01` | Crea equipo, indica disponibilidad, selecciona candidatas, crea propuesta y resuelve. |
| Crear y resolver encuesta | `JTBD-08`, `JTBD-09` | `E2E-02` | Crea encuesta, vota, entiende resultado y registra decisión final. |
| Crear equipo administrable y configurar permisos | `JTBD-02`, `JTBD-11` | `E2E-03` | Verifica administración y entiende permisos básicos. |

No preguntar "¿te gusta el diseño?". Preguntar por comprensión, confianza, expectativa y siguiente acción.

## Guion moderado

1. Presentación breve: "Estamos probando si se entiende el flujo, no tu habilidad."
2. Pedir que piense en voz alta.
3. Dar una tarea cada vez, sin explicar términos de Synqo.
4. Observar acciones, dudas, retrocesos, errores y frases espontáneas.
5. Hacer preguntas post-tarea.
6. Cerrar con preguntas de comprensión global.

Preguntas de cierre:

- ¿Qué diferencia hay entre equipo rápido y administrable?
- ¿Qué diferencia hay entre disponibilidad y responder una propuesta?
- ¿Qué diferencia hay entre resultado y decisión final?
- ¿Qué harías si quieres usar el mismo equipo durante más tiempo?
- ¿Qué punto te generó más duda?

## Guion no moderado

Instrucción inicial:

```text
Vas a probar un prototipo de Synqo. No hay respuestas correctas. Completa las tareas como lo harías normalmente y escribe cualquier duda que aparezca.
```

Para cada tarea:

- contexto breve;
- objetivo;
- enlace inicial del prototipo;
- pregunta final de comprensión;
- escala de seguridad: `1 nada seguro` a `5 muy seguro`.

## Métricas

### Cuantitativas simples

| Métrica | Interpretación |
|---|---|
| Éxito de tarea | Completa / con ayuda / no completa. |
| Tiempo por tarea | Indicador de fricción, no objetivo absoluto. |
| Número de errores críticos | Errores que bloquean o cambian la decisión. |
| Número de retrocesos | Navegación atrás o exploración por pérdida de rumbo. |
| Seguridad declarada | 1-5 tras cada tarea. |

### Cualitativas

- duda verbal;
- concepto malinterpretado;
- acción esperada no encontrada;
- texto que genera confusión;
- punto donde la persona abandona;
- diferencia entre lo que cree que ocurrió y lo que el producto realmente hizo.

## Criterios de severidad

| Severidad | Criterio | Acción |
|---|---|---|
| Alta | Bloquea tarea o provoca comprensión contraria a una regla clave. | Cambiar producto/diseño antes de avanzar. |
| Media | La tarea se completa con duda o rodeo significativo. | Ajustar diseño/copy y volver a revisar. |
| Baja | Roce menor sin impacto en comprensión. | Registrar y priorizar si se repite. |

Reglas clave de severidad alta:

- confundir `Sin respuesta` con `No disponible`;
- creer que Synqo resuelve automáticamente;
- no entender que se puede participar sin cuenta;
- no poder distinguir equipo rápido de administrable;
- no encontrar cómo responder una propuesta o encuesta desde deep link.

## Trazabilidad de hallazgos

Cada hallazgo debe vincularse a:

- tarea;
- JTBD;
- E2E;
- pantalla o brief;
- documento afectado probable;
- decisión de cambio o no cambio.

Documentos afectados posibles:

- `design/08-content/content-and-microcopy.md` para textos.
- `design/10-high-fidelity/high-fidelity-screen-briefs.md` para composición visual.
- `design/11-prototype/prototype-specification.md` para navegación.
- `design/04-calendar/calendar-specification.md` para calendario.
- `product/15-screen-specification.md` si cambia una pantalla funcional.
- `product/09-functional-requirements.md` solo si aparece una necesidad funcional real.

## Criterio para transformar hallazgos en cambios

Un hallazgo debe generar cambio cuando:

- aparece en 2 o más participantes con impacto medio;
- aparece en 1 participante con impacto alto;
- contradice un principio del PRD;
- impide completar un E2E principal;
- revela ambigüedad en una distinción obligatoria.

No debe generar cambio automático cuando:

- es preferencia estética aislada;
- pide funcionalidad fuera de MVP sin relación con la tarea;
- contradice una decisión consolidada sin evidencia fuerte;
- se resuelve con instrucción oral pero no con UI/copy.

## Entregables tras la prueba

- Tabla de hallazgos priorizados.
- Cambios propuestos por documento.
- Decisiones de no cambio justificadas.
- Riesgos restantes.
- Recomendación: iterar diseño, validar de nuevo o pasar a diseño técnico.

## Decisiones de investigación

| ID | Decisión |
|---|---|
| `UXR-01` | La validación prioriza comprensión de conceptos críticos sobre opinión estética. |
| `UXR-02` | La muestra inicial recomendada es de 5 participantes. |
| `UXR-03` | Los tres E2E del prototipo son la base de tareas. |
| `UXR-04` | Hallazgos se trazan a JTBD, E2E, pantalla y documento afectado. |
| `UXR-05` | Un hallazgo de severidad alta basta para proponer cambio antes de avanzar. |

## Referencias cruzadas

- `JTBD-01`…`JTBD-11`
- `E2E-01`
- `E2E-02`
- `E2E-03`
- `PROTO-01`…`PROTO-05`
- `HF-01`…`HF-12`
