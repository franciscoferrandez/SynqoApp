---
id: SPEC-COO-005
nivel: N3
estado: cerrado
release: REL-002
---
# SPEC-COO-005 — Reservar los derechos del software propio para REL-002

## Objetivo

Preparar los avisos y artefactos de distribución para que las aportaciones propias de Synqo mantengan todos sus derechos reservados, se autoricen reutilizaciones caso por caso y se respeten por separado las licencias de terceros antes de desplegar el código en Railway.

## Scope

- Auditar la procedencia del código propio y el material heredado de plantillas, especialmente en API.
- Crear o ajustar el aviso propietario y los metadatos de paquetes para que su alcance no absorba componentes de terceros.
- Comprobar que los artefactos de distribución de API y WEB conservan los avisos exigidos por las licencias de sus dependencias.
- Verificar los términos aplicables al código fuente que Railway reciba en el flujo de despliegue previsto y determinar si conceden derechos compatibles con la decisión de reservar derechos y autorizar caso por caso.

## Fuera de scope

- Licenciar documentación, marcas, datos de ejemplo o contenido de usuario.
- Cambiar licencias de terceros o retirar sus avisos.
- Ejecutar un despliegue público de REL-002 o subir código fuente a Railway durante la preparación.
- Ofrecer una opinión jurídica profesional o garantías sobre la interpretación legal de términos de terceros.

## Baseline relacionado

- [REL-002 — Preproducción pública en Railway](../../01_producto/10_entregas/rel-002-preproduccion-publica-railway.md)
- [RESR-COO-004 — ¿Cómo reservar los derechos del software propio y desplegarlo en Railway?](../../05_investigacion-y-decisiones/01_research/resr-coo-004-licencia-propietaria-y-despliegue.md)
- [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md)

## Módulos afectados

- [API](../../06_arquitectura/03_modulos/API/README.md): procedencia del código y metadatos/avisos de distribución.
- [WEB](../../06_arquitectura/03_modulos/WEB/README.md): avisos de dependencias en los bundles servidos.
- Operación de despliegue Railway: clasificación y términos aplicables al código fuente enviado.

## Criterios de aceptación

1. El aviso identifica a Francisco M. Ferrández Sánchez como titular de las aportaciones propias y reserva sus derechos, con permiso de reutilización solo caso por caso.
2. El alcance del aviso separa expresamente las aportaciones propias de plantillas, dependencias, fuentes y otros activos de terceros, cuyos avisos y licencias se preservan.
3. La auditoría documenta qué archivos o conjuntos provienen de Symfony u otras fuentes heredadas y corrige metadatos que atribuyan MIT a todo el paquete cuando esa licencia no corresponda al conjunto.
4. Los artefactos previstos para REL-002 conservan los avisos requeridos por las dependencias distribuidas, incluidos los avisos WEB generados por el build.
5. Antes de autorizar cualquier envío de código fuente a Railway, se registra evidencia de la clasificación que la interfaz muestra para el código fuente y proyecto/workspace reales, junto con los términos aplicables. No se infiere esa clasificación de que la aplicación publicada sea accesible. Este criterio es un gate independiente de transferencia y despliegue, no bloquea `READY_FOR_CHANGE_APPLY`. Sin evidencia de una clasificación compatible, no se conecta ni se envía el repositorio. Si la clasificación o sus términos conceden derechos más amplios que los autorizados, el envío sigue bloqueado hasta disponer de un flujo compatible o una autorización expresa.

## Impacto baseline esperado

Sin cambio de intención normativa. Materializa la reserva de derechos y los límites de alcance fijados en [RESR-COO-004 — ¿Cómo reservar los derechos del software propio y desplegarlo en Railway?](../../05_investigacion-y-decisiones/01_research/resr-coo-004-licencia-propietaria-y-despliegue.md).

## Questions / Assumptions

- **Decisiones y límites ya fijados:** la persona impulsora reserva todos los derechos sobre las aportaciones propias y autoriza reutilizaciones caso por caso; el aviso abarcará código fuente y bundles/binarios propios, sin absorber activos de terceros, conforme a [RESR-COO-004 — ¿Cómo reservar los derechos del software propio y desplegarlo en Railway?](../../05_investigacion-y-decisiones/01_research/resr-coo-004-licencia-propietaria-y-despliegue.md). También está fijado el despliegue iniciado manualmente desde la fuente GitHub según [ADR-COO-004 — Desplegar la preproducción de Synqo en Railway con IaC](../../05_investigacion-y-decisiones/05_adr/adr-coo-004-preproduccion-railway-iac.md). Estas decisiones no equivalen a aceptar permisos de Railway más amplios ni a aprobar una transferencia antes de pasar el gate de origen.
- **Q1 — respondida por la persona impulsora (2026-10-07):** el código fuente no debe ser visible. La clasificación de audiencia limitada no se ha comprobado en el proyecto/workspace real. No se autoriza conectar/subir el repositorio para averiguarla. Esto bloquea cualquier conexión, transferencia y despliegue, aunque no bloquea la preparación e implementación local de este Change.
- **Q2 — respondida por la persona impulsora (2026-10-07):** separar el gate de implementación local del gate de transferencia a Railway. Se permite completar localmente el inventario, los avisos y metadatos de licencia; no se permite conectar ni transferir el código mientras no haya evidencia de clasificación y términos compatibles. Esta respuesta no autoriza transferir código ni desplegar.

La documentación oficial de Railway dice que la categoría se identifica al entregar un User Submission; `railway up` escanea, comprime y sube los archivos del directorio. No se ha comprobado que el flujo manual conectado a GitHub exponga una clasificación previa sin transferir código. Esta operación no subirá código para averiguarlo. La persona impulsora aprobó el modo de despliegue manual, pero esa aprobación no resuelve Q1.

## Research necesario

### Hallazgos de inspección local (2026-10-07)

- `apps/api/composer.json` conserva `name: symfony/skeleton`, `license: MIT` y descripción de plantilla; `apps/api/LICENSE` conserva un aviso MIT atribuido a Fabien Potencier. El historial local muestra que `apps/api/LICENSE` y el manifiesto se introdujeron en commits de integración de API, pero el historial por sí solo no determina qué archivos son plantilla, código generado por recetas o aportaciones propias. La auditoría de procedencia debe continuar archivo por archivo antes de delimitar la excepción a MIT.
- `apps/web/package.json` declara `private: true`, pero no contiene una licencia propia del repositorio; existe `apps/web/public/fonts/LICENSE.txt` y el build lo conserva en `browser/fonts/`. No se ha inferido de `private` una licencia para el código fuente.
- Los lockfiles fijan dependencias para los entornos actuales. En el artefacto local generado, `apps/web/dist/web/3rdpartylicenses.txt` recoge Angular, `rxjs` y `tslib`; queda en `dist/web/`, fuera de `dist/web/browser/`, que contiene el sitio. Por tanto, este artefacto local demuestra que el aviso se genera, pero no que el directorio WEB servido por sí solo lo distribuya. La ubicación final deberá comprobarse en el artefacto real de REL-002.
- Existe `apps/api/vendor/` local con avisos por paquete; `vendor/composer/LICENSE` corresponde a Composer. No se encontró un artefacto final de API de REL-002 que permita concluir qué avisos llegan al contenedor desplegado. El [Dockerfile de API](../../../apps/api/Dockerfile) instala Composer como herramienta y no contiene una etapa completa de empaquetado en el archivo inspeccionado.
- El requisito de alcance limitado y exclusión de terceros sigue siendo la intención aprobada descrita en [RESR-COO-004 — ¿Cómo reservar los derechos del software propio y desplegarlo en Railway?](../../05_investigacion-y-decisiones/01_research/resr-coo-004-licencia-propietaria-y-despliegue.md); esta SPEC no ofrece opinión jurídica profesional ni determina titularidad basándose únicamente en un historial de Git.

### Verificación de fuentes oficiales

- Los [Railway Terms of Service](https://railway.com/legal/terms), efectivos desde 2026-04-20 en la página consultada el 2026-10-07, distinguen envíos personales, de audiencia limitada y públicos; la sección de licencias describe permisos diferentes y dice que la clasificación se identifica al momento de enviar. Esto describe el texto publicado, no determina cómo clasificará Railway este proyecto.
- La [documentación oficial de Railway CLI — Deploying](https://docs.railway.com/cli/deploying) indica que `railway up` escanea, comprime y sube los archivos del directorio. No se usó la CLI ni se conectó una cuenta para probarlo.
- El [esquema oficial de `composer.json`](https://getcomposer.org/doc/04-schema.md#license) documenta `proprietary` como identificador disponible para paquetes cerrados. Esto permite revisar el metadato técnico durante el Change, pero no resuelve la procedencia de archivos ni sustituye avisos de terceros.

### Resultado de investigación

1. El inventario de procedencia API/WEB y los límites de atribución están registrados en [procedencia y avisos](../../../doc/legal/procedencia-y-avisos.md), incluidas las limitaciones de inferir titularidad a partir del historial.
2. Los lockfiles y artefactos locales están comprobados: la distribución WEB conserva los avisos en `browser/` y el staging API los conserva para sus 87 dependencias de producción.
3. El build WEB copia `3rdpartylicenses.txt` junto a los avisos propios, de terceros, de plantillas y de Inter. Los avisos API se generan en staging; la imagen combinada queda pendiente de comprobación antes de desplegar.
4. La clasificación del source en el proyecto/workspace real sigue sin verificarse. No se conectó ni transfirió el repositorio; se mantiene el gate operativo bloqueado y cualquier vía alternativa requiere investigación y decisión posterior.

## Design / Structure

La implementación local sigue el inventario de procedencia: aviso raíz para aportaciones propias con exclusiones expresas; preservación de los avisos de plantilla/terceros aplicables; metadatos de paquete coherentes con el límite aprobado; y avisos de dependencias junto a los artefactos locales. No se asigna propiedad por inferencia ni se retira el aviso MIT de API. El gate de clasificación de Railway permanece separado y bloquea cualquier transferencia o despliegue.

Módulos y responsabilidades:

- [API — arquitectura del módulo](../../06_arquitectura/03_modulos/API/README.md) y [API — reglas de implementación](../../07_desarrollo/08_modulos/API/README.md): procedencia heredada, manifiesto Composer y avisos incluidos en el contenedor.
- [WEB — arquitectura del módulo](../../06_arquitectura/03_modulos/WEB/README.md) y [WEB — reglas de implementación](../../07_desarrollo/08_modulos/WEB/README.md): manifest NPM, salida del build y ubicación accesible del aviso agregado y licencia de fuente.
- [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../01_activas/spec-coo-006-railway-iac-operacion-rel-002.md): gate previo a cada despliegue; se coordina su preflight con este Change, sin duplicar su procedimiento operativo.

**Clasificación N3:** el Change afecta reserva de derechos sobre código propio, atribución/avisos de terceros y condiciones contractuales del proveedor donde se enviará el source; una transferencia no autorizada puede ser difícil de revertir. Por ello se separan el DoR de trabajo local y el gate obligatorio previo a toda transferencia.

### Separación de DoR y gate de envío

`READY_FOR_CHANGE_APPLY` autoriza implementar localmente el inventario, avisos y metadatos del Change. Un gate aparte autoriza conectar y transferir fuente a Railway. La respuesta Q2 permite alcanzar READY sin relajar dicho gate. La investigación documental confirma que los términos de Railway distinguen Personal, Limited Audience y Public User Submissions, y que la categoría se identifica al someter contenido ([Railway Terms of Service](https://railway.com/legal/terms)). No se halló una pantalla pública que permita comprobar la categoría de este repositorio antes de conectar/subirlo. No se transferirá el repositorio para averiguarlo; si no puede comprobarse sin transferencia, el gate seguirá cerrado y habrá que evaluar una alternativa compatible.

## Plan por slices

1. Completar investigación de procedencia de API, WEB, recetas y activos, y producir un inventario con atribución comprobable y dudas residuales.
2. Con ese inventario, concretar el aviso propio y los metadatos de paquete, conservando las licencias, avisos y atribuciones de terceros aplicables.
3. Concretar la distribución de avisos en los artefactos WEB y API; comprobar en los artefactos generados dónde quedan el aviso `3rdpartylicenses.txt`, la licencia de Inter y los avisos API.
4. Proseguir con la implementación local y ejecutar checks de manifiestos/build, revisión independiente del alcance de avisos y validación final.
5. Resolver el gate de Railway sin transferir source durante este Change. Si solo se revela la categoría al enviar, detenerse y mantener bloqueado el envío; evaluar una vía compatible o elevar una solicitud de autorización explícita. El flujo de [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../01_activas/spec-coo-006-railway-iac-operacion-rel-002.md) deberá comprobar el estado del gate antes de cada conexión o despliegue.

## Evidencia / Validation

### Preparación inicial (2026-10-07)

Inspección documental, metadatos de paquetes, historial Git y artefactos locales realizada; no se modificó código ni se ejecutó build/test en esta preparación. La inspección confirma el manifiesto API heredado, el manifiesto WEB privado sin licencia de aplicación, la existencia local de avisos por dependencia API y la ubicación de los avisos WEB fuera de `browser/`. Esto no verifica los artefactos finales previstos para Railway.

**Resultado DoR: READY para implementación local.** La pregunta Q2 resolvió que la incertidumbre de clasificación no impide completar el trabajo local de licencia. El gate de conexión/transferencia/despliegue permanece **BLOCKED**: no hay evidencia de la clasificación aplicable al proyecto real, y no se inferirá ni se probará enviando el código. No se ejecutó transferencia ni se conectó Railway.

### Implementación local (2026-10-07)

- El [aviso propietario](../../../LICENSE) identifica al titular e incluye exclusiones de terceros y de documentación, marcas, datos demo y contenido de usuarios. Los manifiestos pasan a `synqo/api`/`proprietary` y npm `UNLICENSED`; los lockfiles solo cambian el hash del manifiesto/API y el metadato npm, sin cambiar versiones de dependencias.
- El [inventario de procedencia y avisos](../../../doc/legal/procedencia-y-avisos.md) identifica material de Skeleton, archivos de recetas idénticos/modificados frente a un commit upstream inmutable, configuración Symfony generada, estructura Angular y fuente Inter. No usa el historial Git como prueba definitiva de titularidad. El aviso MIT de API permanece intacto; se preservan los textos de recetas y Angular y un suplemento de API Platform para JSON-LD, cuyo split auditado omite el archivo LICENSE.
- El [generador de avisos](../../../scripts/distribution-notices.mjs) conserva los avisos de los paquetes instalados y rechaza omisiones o discrepancias del lockfile. El [wrapper de build WEB](../../../scripts/build-web.mjs) conserva los avisos en el directorio `browser/` efectivamente servido, también al cambiar `--output-path`. La [suite de empaquetado](../../../scripts/distribution-notices.test.mjs) comprueba fallos por pérdida de avisos y dependencias de desarrollo en producción; queda integrada en CI.
- Se instaló el lockfile API en un staging temporal local independiente mediante `composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader --no-interaction`. Los 87 paquetes de producción se instalaron y el generador produjo `SYNQO-LICENSE.txt` y `THIRD_PARTY_NOTICES.txt`, conservando los avisos del vendor. No se cambió la base de datos ni el vendor del servicio API activo.
- `composer validate --strict --no-check-publish` pasó. `node --test scripts/distribution-notices.test.mjs` pasó sus dos casos. El build de producción WEB con Node 24.21.0/npm 11.19.0 pasó, generando avisos propios, agregados, plantillas Angular e Inter. La imagen final FrankenPHP/Caddy de [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../01_activas/spec-coo-006-railway-iac-operacion-rel-002.md) aún no existe: esta evidencia local no declara que sus capas o el servicio remoto hayan sido comprobados.

| Criterio | Evidencia | Resultado local |
|---|---|---|
| 1 — titular y reserva de derechos | Aviso raíz y copias idénticas en artefactos locales | PASS |
| 2 — terceros y alcance separados | Exclusiones expresas; MIT Skeleton intacto, recetas, Inter y licencias de dependencias conservadas | PASS |
| 3 — procedencia API y metadatos | Inventario, comparación upstream de recetas, manifiestos y validación Composer | PASS |
| 4 — conservación de avisos de distribución | WEB `browser/` y staging API no-dev comprobados; falta inspección de la imagen final combinada y sus componentes de runtime | PARTIAL; excepción de cierre local documentada |
| 5 — clasificación de envío en Railway | No hay evidencia del proyecto/workspace real; no se conectó ni transfirió código | NOT_TESTED; excepción de cierre local documentada y transferencia BLOCKED |

## Verificación independiente (2026-10-07)

| Criterio | Evidencia | Resultado |
|---|---|---|
| 1 — titular y reserva de derechos | Aviso raíz y copias idénticas en los artefactos locales | PASS |
| 2 — terceros y alcance separados | Exclusiones expresas; aviso MIT de Skeleton intacto, recetas, Inter y licencias de dependencias conservadas | PASS |
| 3 — procedencia y metadatos | Inventario y comparación upstream; `composer validate --strict --no-check-publish` pasó | PASS |
| 4 — avisos en artefactos | Build WEB de producción y staging API limpio (`--no-dev`, 87 paquetes) contienen los avisos esperados | PARTIAL: imagen final combinada inexistente |
| 5 — clasificación de source Railway | No se examinó la interfaz/workspace real ni se transfirió source | NOT_TESTED; gate de transferencia permanece BLOCKED |

Validaciones repetidas: build WEB con Node 24.21.0/npm 11.19.0; los dos tests de `scripts/distribution-notices.test.mjs`; instalación limpia de Composer con el lockfile de producción y ejecución del generador sobre el staging; Composer validate; `validate_structure.py` (`VALIDATION OK`) y `git diff --check`.

La evidencia confirma los artefactos locales, pero no la imagen final combinada ni el servicio Railway. El criterio 5 sigue sin resultado porque verificarlo mediante envío de código está expresamente fuera de la autorización vigente.

### Excepciones de cierre

Se cierra el trabajo local de esta SPEC a petición de la persona impulsora, con estas excepciones documentadas; ninguna cambia el gate de transferencia ni equivale a aceptar términos de Railway:

1. **Criterio 4 — imagen final:** se acepta como evidencia de cierre la distribución WEB y el staging API local. La comprobación de avisos dentro de la imagen FrankenPHP/Caddy se traslada a [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../01_activas/spec-coo-006-railway-iac-operacion-rel-002.md) antes del primer envío o despliegue. Riesgo residual: el empaquetado de la imagen podría omitir avisos que están presentes en los stagings.
2. **Criterio 5 — clasificación Railway:** se cierra el trabajo documental y local sin comprobar la clasificación real. La transferencia, conexión del repositorio y despliegue permanecen bloqueados hasta que [SPEC-COO-006 — Preparar la infraestructura Railway y la operación de REL-002](../01_activas/spec-coo-006-railway-iac-operacion-rel-002.md) registre evidencia compatible obtenida sin incumplir la prohibición de transferir source. Si no puede obtenerse sin envío, se requerirá una nueva decisión expresa sobre una vía compatible; esta excepción no autoriza probar mediante transferencia.

## Convergence

**Convergencia PASS — `READY_FOR_CHANGE_CLOSE` (2026-10-07).** No hay drift de intención ni de implementación en el alcance local. Las dos limitaciones restantes se asignan explícitamente a COO-006; la clasificación de Railway sigue siendo un gate operativo independiente.

## Resultado de cierre

Cerrado con excepciones de verificación local descritas arriba. La licencia y los avisos están implementados en los artefactos locales. La clasificación de Railway y la imagen final siguen sin verificarse; no se ha conectado ni enviado el repositorio y el despliegue continúa bloqueado.
