# 12 — Historias de usuario y criterios de aceptación

Las historias agrupan valor observable; RNF e invariantes técnicas se verifican aparte.

## HU-EQ-01 — Crear equipo rápido

> Como visitante, quiero crear un equipo rápido sin registrarme ni proporcionar email para empezar a coordinarme inmediatamente.

```gherkin
Scenario: Crear sin cuenta
  Given que no tengo sesión autenticada
  When creo un equipo rápido con los datos mínimos
  Then el equipo queda activo
  And puedo compartirlo
  And Synqo informa de que es temporal
```

## HU-EQ-02 — Crear equipo administrable

> Como persona que necesita uso continuado, quiero crear un equipo administrable mediante email verificable sin estar obligada a crear cuenta.

```gherkin
Scenario: Verificación obligatoria
  Given que no tengo cuenta
  When creo un equipo administrable e indico mi email
  Then el equipo queda pendiente de verificación
  And no obtengo administración persistente hasta verificarlo
```

## HU-EQ-03 — Acceder por enlace público

> Como participante, quiero entrar desde un enlace compartido sin cuenta.

```gherkin
Scenario: Acceso válido
  Given un enlace público válido
  When lo abro
  Then accedo al contexto del equipo
  And Synqo solicita identificación cuando sea necesaria
```

## HU-EQ-04 — Acceso identificado

> Como participante, quiero que un enlace personalizado pueda reconocer mi identidad para responder con menos pasos.

```gherkin
Scenario: Enlace personalizado
  Given un enlace válido asociado a mi participante
  When lo abro
  Then Synqo establece mi identidad local
  And me dirige a la acción objetivo si existe
```

## HU-ID-01 — Vincular participante a cuenta

> Como usuario, quiero vincular una participación previa para conservar y centralizar mi actividad.

```gherkin
Scenario: Vinculación válida
  Given un participante sin cuenta
  And demuestro control suficiente de esa identidad
  When lo vinculo a mi cuenta
  Then conserva disponibilidad, votos y respuestas
```

## HU-ID-02 — Añadir equipo rápido a cuenta

```gherkin
Scenario: Vincular sin transformar
  Given un equipo rápido
  When lo añado a mi cuenta
  Then aparece en Mis equipos
  And conserva su expiración
```

## HU-EQR-01 — Conocer y recuperar equipo rápido

```gherkin
Scenario: Reactivar recuperable
  Given un equipo en estado recuperable
  When realizo una interacción válida de reactivación
  Then vuelve a activo
  And conserva su información
```

## HU-EQA-01 — Configurar disponibilidad

```gherkin
Scenario: Configuración inválida
  Given que administro un equipo
  When intento deshabilitar Disponible y No disponible simultáneamente
  Then Synqo rechaza la configuración
```

## HU-EQA-02 — Configurar creación

> Como administrador, quiero elegir si solicitudes y consultas las crean todos o solo administradores.

## HU-EQA-03 — Configurar resolución

> Como administrador, quiero elegir quién puede resolver consultas.

## HU-EQA-04 — Recuperar administración

```gherkin
Scenario: Recuperación válida
  Given que soy identidad administrativa reconocida
  When demuestro control del medio verificable asociado
  Then Synqo restablece mi acceso administrativo
```

## HU-DIS-01 — Indicar disponibilidad

```gherkin
Scenario: Distinguir no respuesta
  Given una fecha sin valor declarado
  Then aparece como Sin respuesta
  And no como No disponible
```

```gherkin
Scenario: Cambiar vista
  Given que consulto octubre en Calendario
  When cambio a Lista
  Then veo la misma información
  And se mantiene el contexto temporal cuando sea posible
```

## HU-DIS-02 — Modificar disponibilidad

```gherkin
Scenario: No alterar propuesta
  Given que respondí Disponible a una propuesta del día 15 a las 19:00
  When cambio mi disponibilidad general del día 15 a No disponible
  Then la respuesta específica no cambia
```

## HU-SD-01 — Solicitar disponibilidad

> Como participante con permiso, quiero solicitar disponibilidad entre dos fechas con deadline opcional.

## HU-SD-02 — Responder solicitud

```gherkin
Scenario: Actualizar disponibilidad general
  Given una solicitud abierta
  When respondo los días del intervalo
  Then se actualiza mi disponibilidad general
  And no se crea una copia paralela
```

## HU-DIS-03 — Consultar disponibilidad colectiva

```gherkin
Scenario: Detalle de un día
  Given la vista de Calendario colectiva
  When pulso una fecha
  Then veo recuentos y participantes por estado
  And puedo añadir la fecha a una propuesta
```

## HU-PRO-01 — Crear propuesta

```gherkin
Scenario: Desde coincidencias
  Given varias fechas seleccionadas en disponibilidad colectiva
  When creo una propuesta
  Then las fechas aparecen ya como opciones
  And puedo añadir una hora opcional a cada una
```

## HU-PRO-02 — Responder propuesta

```gherkin
Scenario: Varias opciones válidas
  Given una propuesta abierta
  When marco A Disponible, B Quizá y C Disponible
  Then Synqo conserva las tres respuestas
```

## HU-PRO-03 — Consultar resultado

> Como participante, quiero comparar `Disponible/Quizá/No disponible/Sin respuesta` por opción y, cuando proceda, ver detalle nominal.

## HU-PRO-04 — Resolver propuesta

```gherkin
Scenario: Resolución
  Given que tengo permiso
  When confirmo una opción como decisión final
  Then Synqo la registra
  And cierra la participación
```

## HU-ENC-01 — Encuesta single

```gherkin
Scenario: Cambiar selección
  Given una encuesta SINGLE abierta
  When selecciono una segunda opción
  Then sustituye a la anterior
```

## HU-ENC-02 — Encuesta multiple

```gherkin
Scenario: Varias selecciones
  Given una encuesta MULTIPLE abierta
  When selecciono A, C y D
  Then las tres forman parte de mi respuesta
```

## HU-ENC-03 — Cambiar voto

> Como participante, quiero modificar mi respuesta mientras la encuesta acepte participación.

## HU-ENC-04 — Consultar resultados

```gherkin
Scenario: Empate
  Given dos opciones con el mismo mayor recuento
  When consulto resultados
  Then Synqo representa el empate
  And no aplica un desempate automático
```

## HU-ENC-05 — Resolver encuesta

```gherkin
Scenario: Resolución múltiple
  Given una encuesta MULTIPLE
  And tengo permiso para resolver
  When selecciono dos opciones como resolución
  Then ambas forman parte de la decisión final
```

## HU-CON-01 — Deadline

```gherkin
Scenario: Deadline alcanzado
  Given una consulta con deadline
  When se alcanza
  Then participation pasa a CLOSED
  And resolution puede permanecer PENDING
```

## HU-CON-02 — Cancelar

> Como participante autorizado, quiero cancelar una consulta, conservando el histórico ya recibido.

## HU-CON-03 — Proteger respuestas

```gherkin
Scenario: Opción con respuestas
  Given una consulta ya respondida
  When se intenta modificar sustancialmente una opción
  Then Synqo lo impide
```

## HU-PEN-01/HU-PEN-02 — Pendientes

> Como participante quiero ver qué requiere mi respuesta; como usuario con cuenta quiero agregarlos entre mis equipos.

## HU-HIS-01 — Histórico

> Como participante, quiero consultar decisiones anteriores sin que la salida posterior de miembros cambie retrospectivamente el resultado.

## HU-AI-01 — Asistente de coordinación

```gherkin
Scenario: Interpretación y revisión
  Given que puedo crear una propuesta
  When describo restricciones compatibles en lenguaje natural
  Then Synqo muestra la interpretación estructurada
  And puedo revisarla antes de buscar candidatos
```

```gherkin
Scenario: Cálculo determinista
  Given una interpretación validada
  When busco fechas
  Then el motor determinista calcula los candidatos
  And el LLM no calcula ni publica la propuesta
```

```gherkin
Scenario: Fallo de proveedor
  Given que la IA no está disponible
  Then puedo continuar seleccionando fechas manualmente
```
