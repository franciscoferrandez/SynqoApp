# Playbook de documentación y Product Baseline

**Versión:** 2.0  
**Rol:** definir y mantener la verdad persistente del producto.

---

## 1. Propósito

Este playbook define cómo pasar desde una idea, necesidad o sistema existente a un conjunto coherente de artefactos que describen **lo que el producto debe ser**.

Su resultado lógico es el **Product Baseline (PB)**.

No prescribe cuánto producto debe definirse antes de comenzar a implementar. Prescribe **cómo** se define correctamente aquello que decidimos consolidar.

---

## 2. Product Baseline

El Product Baseline es una vista lógica, no un único archivo.

Puede incluir, cuando existan:

```text
Producto
Dominio
RF
RN
RD
RNF
Restricciones
Atributos de calidad
UX normativa
ADR aceptados
Arquitectura
Tecnologías decididas
Convenciones de desarrollo
Contratos
Operación normativa
```

### 2.1. El baseline describe intención normativa

El baseline responde:

> **¿Cómo debe ser el producto?**

No responde necesariamente:

> **¿Qué está ya implementado?**

Una capacidad puede estar definida y aprobada en el baseline y continuar pendiente de delivery.

### 2.2. Delivery separado

El estado de implementación se sigue mediante `REL — Entregas` y sus estados de delivery.

```text
PRODUCT BASELINE
→ verdad deseada

REL / DELIVERY COVERAGE
→ materialización de esa verdad
```

---

## 3. Principios

1. La IA propone; las decisiones relevantes se autorizan.
2. No se rellenan huecos importantes por inferencia silenciosa.
3. Elemento con identidad propia → archivo propio.
4. Enlaza cada referencia a un artefacto existente como `[ID — denominación](ruta/relativa.md)`; el destino es el archivo del ID citado.
5. Identidad lógica independiente de la ruta física.
6. El castellano es el idioma canónico.
7. Se crean carpetas estáticas + README; no artefactos vacíos.
8. El código no sustituye el porqué documental.
9. Research precede a decisiones técnicas importantes.
10. ADR registra una decisión arquitectónica; no es la investigación ni la decisión en sí.
11. La profundidad se adapta al riesgo, pero la semántica de los artefactos no cambia.
12. Una verdad normativa se modifica mediante `pdi:baseline-update`.

---

## 4. Identificación

Formato habitual:

```text
<TIPO>-<AREA>-<NNN> — <Denominación>
```

Ejemplos ilustrativos:

```text
HU-DIS-012 — Indicar disponibilidad
RF-DIS-021 — Registrar disponibilidad para una opción
RN-DIS-008 — Solo el propietario modifica su disponibilidad
RNF-SEG-006 — Aislamiento entre equipos
ADR-NOT-003 — Estrategia de entrega de notificaciones
SPEC-DIS-014 — Modificar disponibilidad
```

Los códigos de área se crean bajo demanda y se registran cuando aparecen. Antes de asignar un ID se aplica el criterio de área de las convenciones documentales de `<DOC>/00_gobierno/01_convenciones-documentales.md` y se contrasta el catálogo vigente. Al aparecer una capacidad con responsabilidad propia se revisa la clasificación, aunque ya exista un área amplia.

---

## 5. Estructura y README contractuales

Las carpetas estáticas se crean desde el inicio. Cada una contiene un `README.md` que define:

- propósito;
- qué contiene y qué no;
- precondiciones;
- proceso de definición;
- preguntas que el LLM debe formular;
- mandamientos;
- criterios de calidad;
- outputs;
- plantillas aplicables.

Las carpetas dinámicas —áreas funcionales y módulos de solución— solo se crean cuando existen realmente.

---

## 6. Modos de entrada

### 6.1. Greenfield

Parte de una idea o necesidad y construye el PB progresivamente.

### 6.2. Brownfield

Primero reconstruye una baseline confiable a partir de documentación, código, tests y comportamiento existente. Las discrepancias se registran como conflictos; no se supone que el código o la documentación tengan razón automáticamente.

---

## 7. Profundidad inicial del baseline

El analista puede proponer una profundidad, pero debe justificarla por riesgo y por el siguiente incremento.

### Ligera

Adecuada para MVP pequeño o primer slice de bajo riesgo.

Debe existir lo suficiente para implementar sin inventar decisiones relevantes:

- visión/problema;
- alcance inmediato;
- dominio mínimo;
- RF/RN imprescindibles;
- RNF críticos;
- restricciones conocidas;
- UX necesaria;
- decisiones arquitectónicas bloqueantes;
- estrategia mínima de testing.

### Estándar

Adecuada para un producto normal con varias capacidades y evolución prevista.

Amplía dominio, MVP, requisitos, UX base, drivers, arquitectura y convenciones.

### Amplia

Adecuada para alto riesgo, múltiples integraciones, seguridad, regulación o decisiones costosas de revertir.

Profundiza en atributos de calidad, research, alternativas, ADR, operación, seguridad, migración y observabilidad.

### Regla

> No se persigue “documentación completa”; se persigue **suficiencia del baseline para el siguiente incremento**.

---

## 8. Cadena conceptual de definición

```text
Problema / Visión
→ Alcance
→ Dominio
→ JTBD / HU / Journeys
→ RF
→ RN
→ RD
→ RNF
→ Restricciones
→ Atributos de calidad
→ Drivers arquitectónicos
→ Research / alternativas
→ Decisiones
→ ADR
→ Arquitectura
→ Tecnologías
→ Convenciones de desarrollo
→ Baseline Readiness
```

No es waterfall. Las ramas pueden retroalimentarse.

UX/UI evoluciona en paralelo desde que existe suficiente comprensión funcional:

```text
RF + RN
→ Flujos
→ Wireframes
→ Validación
→ Dirección visual
→ Sistema de diseño
→ Mockups
```

---

## 9. Fases

### 9.1. Problema y visión

**Objetivo:** comprender por qué existe el producto.  
**No es:** diseñar una solución.

Mandamientos:

1. Formula problemas antes que pantallas.
2. Separa hechos de propuestas.
3. No introduzcas tecnologías.
4. Declara hipótesis.

### 9.2. Producto

Define alcance, actores, JTBD, HU, journeys y PRD.

Mandamientos:

1. El PRD dice qué producto construir, no cómo programarlo.
2. Explicita fuera de alcance.
3. No conviertas una idea futura en MVP por accidente.

### 9.3. Dominio

Define vocabulario, conceptos, relaciones, estados, transiciones, invariantes y eventos conceptuales.

Mandamientos:

1. No confundas modelo de dominio con tablas o clases.
2. Usa los mismos términos en todo el baseline.
3. Convierte invariantes relevantes en RN posteriormente.

### 9.4. Requisitos

Separa:

- RF — comportamiento;
- RN — reglas del dominio;
- RD — datos e integridad;
- RNF — propiedades no funcionales verificables;
- RES — restricciones reales;
- atributos de calidad — vista arquitectónicamente relevante de RNF.

Mandamientos:

1. Todo requisito relevante debe poder comprobarse.
2. No mezcles comportamiento y solución técnica.
3. Separa regla de negocio de mecanismo de implementación.
4. Define casos límite.

### 9.5. UX/UI

Define arquitectura de información, flujos, Wireframes, dirección visual, sistema de diseño, Mockups y accesibilidad.

Mandamientos:

1. Flujo antes que acabado visual.
2. Mockup no sustituye RF/RN.
3. SPEC referencia el sistema visual; no lo reinventa.
4. Accesibilidad no es un añadido posterior.

### 9.6. Research y decisiones

Flujo:

```text
Question
→ Research
→ Options
→ Evaluation
→ Decision
→ ADR si es arquitectónicamente significativa
```

Mandamientos:

1. Research recopila evidencia; no decide.
2. No investigues solo para confirmar tu solución favorita.
3. Tecnología se deriva de requisitos, restricciones y calidad.
4. No contamines ADR con decisiones triviales.

### 9.7. Arquitectura y tecnologías

La arquitectura consolida decisiones aceptadas y límites del sistema.

Los módulos de solución se crean dinámicamente en `<DOC>/06_arquitectura/03_modulos/`.

Mandamientos:

1. Explica responsabilidades y dependencias permitidas.
2. “SOLID”, “Clean” o similares deben traducirse a reglas operables.
3. Una tecnología impuesta es una restricción; una tecnología elegida requiere justificación.

### 9.8. Desarrollo y módulos

Las reglas globales viven en `<DOC>/07_desarrollo/`.

Las reglas específicas de un módulo viven en:

```text
<DOC>/07_desarrollo/08_modulos/<MODULO>/
```

Ejemplos posibles: `BACKEND`, `FRONTEND`, `MOBILE`, `BACKOFFICE`, `WORKER`, etc.

La arquitectura de ese módulo vive en `<DOC>/06_arquitectura/03_modulos/<MODULO>/`.

### 9.9. Entregas

`REL` define qué conjunto de capacidades queremos materializar en una entrega.

Ejemplo:

```text
REL-001 — MVP inicial
```

El REL puede referenciar HU, RF o capacidades agregadas y mantiene estado de delivery sin alterar el estado documental de esos elementos.

---

## 10. Baseline Readiness Gate

Pregunta central:

> **¿Podemos implementar el siguiente incremento sin que el agente tenga que inventar decisiones relevantes?**

Una decisión que bloquee un artefacto se documenta en ese artefacto con la pregunta, su impacto, las opciones conocidas y el gate afectado; la conversación no basta como registro. Si aún no puede existir el artefacto, se usa una PA enlazada desde el estado documental. Al resolverse, se actualiza el registro y se incorpora la verdad mediante `pdi:baseline-update` cuando corresponda. El estado de fase resume el bloqueo, sin sustituir su ubicación concreta.

El gate evalúa al menos:

- objetivo y alcance inmediato;
- dominio relevante;
- RF/RN aplicables;
- RNF críticos;
- restricciones;
- preguntas bloqueantes;
- UX suficiente;
- decisiones arquitectónicas bloqueantes;
- testing esperado;
- módulos afectados definidos cuando ya se conocen.

Resultado:

```text
READY
NOT_READY
READY_WITH_EXPLICIT_OMISSIONS
```

Una omisión debe registrar motivo y riesgo.

---

## 11. `pdi:baseline-update`

Es la operación canónica para añadir o cambiar una verdad persistente.

Puede:

- crear;
- modificar;
- sustituir;
- obsoletar;
- relacionar.

Proceso mínimo:

```text
nueva verdad
→ clasificar tipo y área
→ buscar equivalencias/conflictos
→ preguntar solo lo necesario
→ aplicar la plantilla correcta
→ validar calidad
→ actualizar catálogo/trazabilidad cuando existan
```

Para una RN pequeña no crea cinco artefactos auxiliares. Para una decisión arquitectónica compleja deriva a Research/ADR.

---

## 12. Release Scope y Delivery Coverage

El baseline puede definir más producto del que está implementado.

`REL` mantiene una vista de delivery:

```text
DEFINIDO
→ PLANIFICADO
→ ESPECIFICADO
→ EN_IMPLEMENTACION
→ IMPLEMENTADO
→ VALIDADO
→ ENTREGADO
```

Estados laterales:

```text
BLOQUEADO
POSPUESTO
DESCARTADO
```

Esto permite obtener el catálogo de pendientes sin contaminar RF/RN con porcentajes o estados de código.

---

## 13. Cambios importantes en verdad normativa

Si cambia la semántica de un elemento:

- no se reescribe la historia;
- se conserva el ID antiguo;
- se crea sustituto cuando corresponde;
- el antiguo queda `SUSTITUIDO` u `OBSOLETO`;
- se actualiza trazabilidad.

Los movimientos físicos de archivo no alteran la identidad lógica.

Una corrección de clasificación puede exigir cambiar el código de área incluido en los IDs sin cambiar la semántica de los artefactos. No se hace como efecto automático de mover carpetas: se justifica mediante `pdi:baseline-update`, se reserva cada ID anterior para no reutilizarlo, se registra una equivalencia antiguo → vigente en `<DOC>/10_historial/03_migraciones-documentales/` y se actualizan referencias y enlaces. La sustitución semántica sigue la regla anterior de `SUSTITUIDO` u `OBSOLETO`.

---

## 14. Relación con el Playbook de implementación

El Playbook de implementación **consume** el PB.

Si durante `pdi:change-prepare` aparece una nueva RN, RF, decisión o restricción:

```text
Change
→ detecta nueva verdad
→ pdi:baseline-update
→ baseline coherente
→ reanudar Change
```

El Change puede descubrir conocimiento, pero no inventa la semántica documental.

---

## 15. Regla final

> Define solo lo suficiente para avanzar con seguridad, pero todo lo que declares como verdad debe estar explícito, trazable y en su lugar canónico.
