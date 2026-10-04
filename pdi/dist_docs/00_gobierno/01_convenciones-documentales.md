# Convenciones documentales

## Idioma

Castellano por defecto. Se permiten términos técnicos consolidados como Wireframe, Mockup, Frontend, Backend, API, Endpoint, Pull Request, Commit, Branch, Merge, Deploy, Rollback, Pipeline, Framework, SDK, CLI, CI/CD, DevOps, Spike, Refactor, Code Review, Skill, RFC y ADR.

## Identificadores

Formato de los artefactos con ID:

```text
<TIPO>-<AREA>-<NNN>
```

Las entregas usan `REL-<NNN>` y se guardan en `01_producto/10_entregas/`, porque integran capacidades de varias áreas.

Toda referencia a un artefacto existente en prosa o tablas debe ser un enlace Markdown relativo al archivo del artefacto, con su ID y denominación canónica como texto visible:

```markdown
[<ID> — <Denominación>](ruta/relativa/al/artefacto.md)
```

El destino debe ser el archivo del ID citado. No basta con escribir el ID y la denominación sin enlace. El título del propio artefacto y los ejemplos de código no son referencias.

## Áreas

Un área agrupa una responsabilidad de producto cohesionada, con conceptos, reglas o ciclo de vida que pueden evolucionar por separado. No equivale a una pantalla, una fase de trabajo ni un módulo técnico. Tampoco se crea un área por cada entidad o propuesta futura.

Antes de asignar un ID, contrasta la responsabilidad del artefacto con el catálogo de áreas (`00_gobierno/06_catalogo-areas.md`), cuando exista. Si ninguna área vigente la cubre sin ampliar artificialmente su alcance, define una nueva área y registra sus límites en el catálogo. Un artefacto que integra varias capacidades puede pertenecer a un área transversal documentada; la relación con otras áreas no justifica por sí sola crear otra.

La clasificación se revisa cuando aparece una capacidad con reglas o ciclo de vida propios. Un cambio de carpeta no cambia el ID. Una corrección de área que sí cambie IDs requiere la trazabilidad de la migración prevista en el Playbook documental.

## Tipos principales

```text
JTBD  Job To Be Done
HU    Historia de Usuario
RF    Requisito Funcional
RN    Regla de Negocio
RD    Requisito de Datos
RNF   Requisito No Funcional
RES   Restricción
PA    Pregunta Abierta
HIP   Hipótesis
RFC   Request for Comments
ADR   Architecture Decision Record
SPEC  Especificación de cambio/incremento
CAM   Cambio relevante transversal
REL   Entrega / Release objetivo
```

## Estados conceptuales

```text
DEFINIDO
PROPUESTO
NO_RESUELTO
CONFLICTO
OBSOLETO
SUSTITUIDO
EN_RETIRADA
```

## Estados documentales sugeridos

```text
borrador
en_revision
aprobado
innecesario
obsoleto
sustituido
```

## Archivos

- Elemento con identidad propia → archivo propio.
- El nombre de un archivo con ID empieza por el ID en minúsculas, seguido de un nombre descriptivo; por ejemplo, `rf-dis-001-indicar-disponibilidad.md`.
- Los requisitos con ID se guardan en la carpeta de su área dentro de la categoría correspondiente de `pdi_doc/03_requisitos/`.
- No crear placeholders vacíos.
- Carpetas estáticas sí; carpetas de área/módulo bajo demanda.
- Ruta física no forma parte de la identidad.

## Baseline

El Product Baseline expresa **lo que el producto debe ser**. No usa `implementado: sí/no` en RF/RN como sustituto del seguimiento de delivery.

## Delivery

La implementación se sigue en `REL` y mediante SPEC/Changes.

## Modificación de verdad

La operación canónica es `pdi:baseline-update`.

## Prohibiciones

- no convertir propuestas en decisiones;
- no modificar docs para justificar código divergente;
- no copiar una misma definición normativa en skills, AGENTS o SPEC;
- no decidir tecnologías importantes sin drivers/research cuando corresponda.


## Jerarquía de fuentes ante conflicto

Para intención de producto, usar como orientación:

```text
decisión humana explícita y vigente
→ artefacto normativo aprobado
→ evidencia de usuario/stakeholder
→ comportamiento aceptado y validado
→ código/tests como evidencia de realidad
→ notas/issues
→ inferencia de IA
```

Una discrepancia no se resuelve silenciosamente: se registra como conflicto y se aclara.

Para investigación técnica:

```text
documentación oficial
→ código fuente / especificación oficial
→ estándares
→ documentación técnica confiable
→ comunidad
→ respuesta de IA sin fuente
```

La jerarquía no obliga a aceptar una fuente obsoleta; obliga a justificar por qué se descarta.
