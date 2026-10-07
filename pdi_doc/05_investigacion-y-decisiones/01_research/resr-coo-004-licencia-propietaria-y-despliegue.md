---
id: RESR-COO-004
---
# RESR-COO-004 — ¿Cómo reservar los derechos del software propio y desplegarlo en Railway?

## Objetivo

Recopilar evidencia para establecer en REL-002 una licencia que refleje la intención de reservar los derechos sobre las aportaciones propias de Synqo, sin atribuirse código o activos de terceros, y evaluar su relación con el repositorio público y el despliegue en Railway.

## Hechos

- La decisión de producto expresada por la persona impulsora es reservar todos los derechos sobre el software propio y autorizar la reutilización caso por caso. El código está ahora en un repositorio público durante el TFM y se prevé volverlo privado al terminar. El titular indicado es Francisco M. Ferrández Sánchez.
- No existe un `LICENSE` en la raíz. `apps/api/LICENSE` contiene MIT con titularidad de Fabien Potencier. `apps/api/composer.json` mantiene `name: symfony/skeleton`, `license: MIT` y una descripción de plantilla.
- La comparación con la rama 7.4 del repositorio oficial [`symfony/skeleton`](https://github.com/symfony/skeleton/tree/7.4), consultada el 2026-10-06, encontró que el upstream contiene `LICENSE` y `composer.json`; el `composer.json` local conserva la estructura y metadatos de esa plantilla con modificaciones de dependencias y scripts. Esta evidencia acredita la procedencia de esos dos artefactos, pero no clasifica por sí sola todos los archivos de la API ni el código generado por recetas de Symfony Flex.
- El `package.json` de WEB es privado como paquete npm (`private: true`) y no declara una licencia de la aplicación; esto no es una licencia del repositorio Git.
- El análisis local de campos `license` en los lockfiles encontró 136 paquetes PHP (87 de producción y 49 de desarrollo): 113 con MIT y 23 con BSD-3-Clause; los 136 declaran licencia. En WEB encontró 728 entradas, todas con licencia declarada; las 9 entradas no marcadas como desarrollo son 7 MIT, una Apache-2.0 (`rxjs`) y una 0BSD (`tslib`). Las licencias distintas de las permisivas más comunes que aparecen en el lockfile de WEB son dependencias de desarrollo. El análisis usa los metadatos de `composer.lock` y `package-lock.json`; no sustituye revisar avisos y obligaciones de cada paquete incluido en un artefacto distribuido.
- `apps/api/vendor` y `apps/web/node_modules` no están versionados. El archivo de licencia de Inter está en `apps/web/public/fonts/LICENSE.txt` y aparece copiado en el artefacto local ignorado `apps/web/dist/web/browser/fonts/LICENSE.txt`.
- Se ejecutó `npm run build -- --output-path=/tmp/synqo-license-build` con Node 24.21.0 y npm 11.19.0. El build de producción genera `3rdpartylicenses.txt` en la raíz del output, con los textos de Angular, `rxjs` (Apache-2.0) y `tslib` (0BSD). El artefacto previo ignorado en `apps/web/dist` no lo incluía; el flujo de despliegue debe copiar y servir también el archivo de avisos situado fuera de la carpeta `browser/`.
- El remoto configurado es GitHub. Sus términos conservan la propiedad del contenido en quien lo publica, otorgan a GitHub permisos para operar el servicio y permiten a otros usuarios ver y hacer fork de repositorios públicos mediante las funciones de la plataforma. Las autorizaciones de servicio de GitHub y Railway son independientes de la licencia del software de Synqo.
- Los términos de Railway vigentes a la fecha de consulta (efectivos desde 2026-04-20) dicen que la persona usuaria conserva la titularidad de sus User Submissions. Para envíos personales o de audiencia limitada, otorgan a Railway una licencia no exclusiva, limitada al plazo, y necesaria para prestar el servicio. Para envíos públicos, prevén una licencia perpetua e irrevocable para operar los servicios. Railway indica que la clasificación del envío se mostrará al momento de entregarlo. La clasificación concreta del código fuente que Railway recibe al construir/desplegar Synqo no se ha comprobado en una cuenta o proyecto real.

## Evidencias

- Repositorio local: `apps/api/LICENSE`, `apps/api/composer.json`, `apps/api/composer.lock`, `apps/web/package.json`, `apps/web/package-lock.json`, `apps/web/public/fonts/LICENSE.txt` y `apps/web/angular.json`. Verificación reproducida con `cd apps/web && npm run build -- --output-path=/tmp/synqo-license-build` usando Node 24.21.0/npm 11.19.0; el output temporal se inspeccionó y no se versiona.
- Plantilla oficial: [Symfony Skeleton 7.4](https://github.com/symfony/skeleton/tree/7.4) y su [LICENSE MIT](https://github.com/symfony/skeleton/blob/7.4/LICENSE).
- Dependencias Composer: [esquema oficial de `composer.json`](https://getcomposer.org/doc/04-schema.md), que permite el identificador `proprietary` para software cerrado.
- Railway: [Terms of Service](https://railway.com/legal/terms), secciones «What about anything I contribute to the Services?» y «Licenses».
- GitHub: [Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service), sección D, contenido generado por usuarios y repositorios públicos.
- Fuentes y tipos: [SIL Open Font License](https://openfontlicense.org/open-font-license-official-text/).

## Restricciones

- Una licencia propietaria para aportaciones de Synqo no sustituye ni revoca licencias que terceros hayan concedido sobre componentes incorporados al repositorio, dependencias, fuentes tipográficas u otros activos.
- Hacer privado el repositorio más adelante no permite retirar copias, forks, clones ni otros usos ya realizados mientras era público.
- El alcance solicitado es el software propio. No hay una decisión sobre licenciar documentación, marcas, datos de ejemplo o contenido aportado por usuarios; no deben incluirse implícitamente en el aviso de código.
- Decisión de quien impulsa Synqo: reservar los derechos del software propio y autorizar reutilizaciones caso por caso. Para esta entrega, el aviso cubrirá tanto el código fuente propio como los bundles/binarios propios, sin extenderse a componentes de terceros ni conceder una licencia general de reutilización. La incertidumbre sobre procedencia de archivos heredados y obligaciones de avisos es una tarea de auditoría técnica durante la preparación, no una pregunta pendiente para la persona impulsora.
- El acuerdo de Railway aplicable depende del tipo de workspace y de los ajustes reales del proyecto. Una página pública de Synqo no permite concluir por sí sola si el código fuente almacenado para el build se clasifica como envío público en Railway.

## Unknowns

- Qué archivos del backend provienen de recetas de Symfony Flex u otras plantillas y cuáles son aportaciones originales; se requiere una revisión de procedencia antes de delimitar exactamente la excepción a MIT.
- Cómo Railway clasifica el código fuente conectado desde GitHub o cargado para build en el flujo de despliegue previsto, y si hay términos de workspace empresarial distintos.
- Verificar en el flujo real de despliegue la clasificación del código fuente recibido por Railway y evaluar si esa licencia operativa encaja con la reserva de derechos decidida.

## Assumptions

- La aplicación se desplegará desde un workspace personal estándar de Railway, sujeto a sus términos públicos, salvo que el proyecto indique lo contrario.
- Los lockfiles representan las dependencias fijadas que se instalarán para los entornos actuales; el inventario se debe repetir al cambiar dependencias o tooling.

## Alternativas observadas

- Publicar todo el repositorio bajo MIT u otra licencia abierta: no refleja la preferencia expresa de reservar los derechos y permitir usos caso por caso.
- Declarar todo el contenido del repositorio propietario y reemplazar sin más el aviso MIT de API: no conserva de forma clara la procedencia ni las licencias preexistentes.
- Aplicar un aviso propietario al código propio y conservar avisos separados para componentes de terceros: se ajusta a la intención, sujeto a completar el inventario de procedencia y a redactar claramente las exclusiones.

## Impacto potencial

- Un `LICENSE` propietario en la raíz podría establecer que las aportaciones propias no reciben una licencia general de reutilización, identificando por separado archivos, dependencias y activos que se rigen por sus propios términos.
- `apps/api/LICENSE` y los metadatos de Composer requieren limpieza coordinada: conservar la atribución MIT aplicable a la plantilla sin dar a entender que todo el código propio de la API se ofrece bajo MIT. Composer permite declarar `proprietary` para el paquete cerrado, pero el aviso del código fuente debe explicar su alcance y las excepciones.
- La distribución del bundle WEB y de la API requiere incluir los avisos que las licencias de las dependencias exijan; el build WEB ya genera el aviso agregado, pero el futuro artefacto de Railway debe conservar y exponer el `3rdpartylicenses.txt` producido fuera de `browser/`.
- Railway no adquiere titularidad del software según los términos revisados; la licencia operativa concedida depende de la clase de User Submission y debe contrastarse en el flujo real antes de dar esta validación por cerrada.

## Conclusión factual

Los datos revisados no muestran una dependencia de producción que obligue a licenciar el código propio como software abierto: las dependencias de producción listadas son MIT, Apache-2.0 y 0BSD, mientras los lockfiles completos también incluyen paquetes de desarrollo. El build WEB de producción sí genera los avisos de sus dependencias de runtime; Railway deberá conservarlos en el artefacto servido. La decisión de producto es reservar derechos sobre el código fuente y los bundles/binarios propios, y autorizar usos caso por caso, manteniendo las licencias de terceros. Antes del despliegue deberá cerrarse la procedencia detallada de la API, preparar los avisos correspondientes y verificar en el flujo real cómo Railway clasifica el código fuente y qué licencia operativa aplica.
