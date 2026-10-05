# Documentación del proyecto

La ubicación de la documentación del proyecto está en `.pdi/config.json`, campo `docs_dir`. Si aún no existe ese archivo, usa `pdi_doc/`.

Antes de cambiar el producto o su código:

1. Lee el `README.md` de la carpeta documental y sus convenciones en `00_gobierno/`.
2. Si el trabajo pertenece a un Change, consulta su SPEC y los requisitos, decisiones y artefactos de experiencia que enlaza.
3. Lee los `README.md` de los módulos de arquitectura y desarrollo afectados.
4. Trata la documentación normativa como intención del producto, la SPEC como alcance del cambio y el código como estado actual. Si discrepan, señala la diferencia antes de consolidar una solución.

Sigue los enlaces de los artefactos para ampliar contexto. No copies reglas del producto en este archivo ni supongas que una propuesta equivale a una decisión aprobada.

# Workflow de Codex para vertical slices

Cuando la instrucción sea «Implementa SLICE-XX siguiendo su spec», aplica [el workflow multiagente](doc/ai/codex-workflow.md) sin sustituir las reglas documentales anteriores. En este repositorio las slices aparecen normalmente numeradas en «Plan por slices» de una SPEC PDI; no presupongas que `SLICE-XX` es un ID documental independiente. Localiza la SPEC y la slice exactas antes de cambiar código. Si el identificador no permite una correspondencia inequívoca, acláralo tras explorar las SPEC disponibles.

1. Lee la SPEC completa y sus enlaces normativos, de experiencia y de arquitectura; extrae objetivo, requisitos, criterios de aceptación, invariantes, restricciones, dependencias e incógnitas. No empieces a implementar hasta entender el alcance.
2. Formula un plan breve y verificable; clasifica cada tarea LOW, MEDIUM o HIGH. Conserva en el agente principal las decisiones de producto, dominio, arquitectura, seguridad, autorización, concurrencia, idempotencia y contratos, así como la interpretación de ambigüedades. Resuelve con las fuentes aprobadas o consulta a la persona usuaria si no hay base suficiente.
3. Delega proactivamente tareas acotadas cuando reduzcan contexto o tiempo sin perder calidad: `explorer` para lectura, `implementer` para implementación definida, `test_writer` para comportamiento conocido, `validator` para comandos y `reviewer` para revisión independiente. Prefiere unos 2–4 subagentes útiles por slice; no crees subagentes de subagentes. Usa un TASK PACKET con Task, Slice, Spec, Relevant acceptance criteria, Relevant requirements, Relevant files, Constraints, Expected output, Do not change y Validation. Proporciona sólo el contexto necesario y permite lectura adicional del repositorio. Confirma la llamada y la respuesta reales del subagente antes de atribuirle un resultado; si falla el spawn, informa del fallo y trabaja con la evidencia disponible.
4. Implementa por incrementos dentro del scope y escribe sólo los tests que aporten evidencia. Si un subagente responde `ESCALATE:`, resuelve la cuestión antes de continuar. Coordina escrituras: ningún par de agentes debe editar simultáneamente los mismos archivos ni el mismo contexto delimitado.
5. Ejecuta los checks reales aplicables del proyecto, obtiene una revisión final independiente y corrige BLOCKER/MAJOR. Verifica cada criterio en una matriz `Acceptance criterion | Evidence | Result` con PASS/FAIL/UNKNOWN. Declara DONE sólo si todos están PASS, pasan tests y checks relevantes, no hay escalados ni hallazgos graves pendientes, el alcance corresponde a la slice y las decisiones arquitectónicas relevantes están documentadas según PDI. Respeta también el gate de cierre de PDI.

La clasificación, los comandos reales, los límites de permisos y el protocolo detallado están en [doc/ai/codex-workflow.md](doc/ai/codex-workflow.md). Estas instrucciones de workflow no convierten una propuesta en decisión de producto.
