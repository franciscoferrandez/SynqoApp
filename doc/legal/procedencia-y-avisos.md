# Procedencia del software y avisos de distribución

El [aviso propio](../../LICENSE) reserva los derechos sobre las aportaciones propias de software a Francisco M. Ferrández Sánchez. La reutilización requiere autorización caso por caso. No incorpora las licencias de terceros ni licencia documentación, marcas, datos demo o contenido de usuarios. Los metadatos `proprietary` de Composer y `UNLICENSED` de npm describen el software propio; `private: true` impide publicar el paquete npm, pero no regula el acceso al repositorio.

## Auditoría de procedencia (2026-10-07)

Se revisaron archivos versionados, lockfiles, fuentes instaladas y recetas; Git se usa como pista de integración, no como prueba de autoría. No se identificaron otras fuentes externas en el código específico del producto, pero esta revisión técnica no garantiza la titularidad de cada línea ni sustituye asesoramiento jurídico. Se conserva el material heredado aun cuando se haya modificado localmente.

| Conjunto | Evidencia y tratamiento |
|---|---|
| API: `composer.json` y `LICENSE` | Proceden de [Symfony Skeleton 7.4](https://github.com/symfony/skeleton/tree/7.4). El aviso original [MIT de Fabien Potencier](../../apps/api/LICENSE) permanece intacto. El manifiesto deja de identificar toda la aplicación como Skeleton/MIT y pasa a `synqo/api`/`proprietary`. Las partes heredadas siguen bajo sus condiciones. |
| API: archivos de recetas listados debajo | [symfony.lock](../../apps/api/symfony.lock) identifica recetas y rutas. Comparados con un [commit inmutable de Symfony recipes](https://github.com/symfony/recipes/tree/984105c2398b208d56306ff3e78a57c05b7ad9dd), no con el contenido histórico supuesto de un hash de receta. Se conserva su [aviso MIT](third_party/symfony-recipes-LICENSE.txt), que incluye el copyright `2017-present` del upstream. |
| API: `config/bundles.php`, `.gitignore`, configuración de herramientas y entorno | Contienen registro/secciones de recetas y ajustes locales; se tratan como material mixto con la misma exclusión de terceros. `.env` y `.env.dev` locales no están versionados y nunca deben empaquetarse por este procedimiento. |
| API: `config/reference.php` | Se identifica como archivo autogenerado del configurador Symfony. No se atribuye a Synqo; se conservan los avisos de Symfony del vendor junto al artefacto. |
| API: `src/` salvo `Kernel.php`, migraciones y tests específicos | Código específico de equipos, calendario, consultas, correo y control de creación integrado en el historial del proyecto; no se encontró una fuente externa adicional. La reserva alcanza aportaciones propias, nunca fragmentos heredados ni el código de las dependencias importadas. |
| WEB: estructura inicial Angular, bootstrap, configuración, tests base | Puede contener material generado por Angular CLI; no se atribuyen las partes de plantilla a Synqo. Se preserva de forma conservadora el [aviso de Angular schematics 21.2.24](third_party/angular-schematics-LICENSE.txt), procedente del paquete instalado fijado en el lockfile. |
| WEB: páginas, componentes, cliente HTTP y estilos específicos | Aportaciones específicas del producto; los imports Angular/RxJS, plantillas generadas y CSS de Tailwind conservan sus avisos separados. |
| WEB: Inter | [Licencia SIL OFL 1.1 y atribución de Rasmus Andersson](../../apps/web/public/fonts/LICENSE.txt) conservadas junto a `InterVariable.woff2`; no se modificó ni relicenció la fuente. |
| WEB: SVG e iconos inline | No se identificaron referencias a paquetes de iconos externos en los activos inspeccionados. La marca/favicon queda fuera del alcance del aviso de software propio; no se le asigna una licencia aquí. |

### Archivos de Symfony Flex comprobados

Las versiones de receta están en el lockfile. «Idéntico» significa igualdad byte a byte con el commit de comparación; «modificado» confirma diferencia, sin atribuir por ello todas sus líneas al titular. Los hashes `recipe.ref` no se usaron como si fueran commits Git del repositorio upstream.

| Receta | Archivos idénticos | Archivos modificados |
|---|---|---|
| `api-platform/symfony` 4.0 | `config/routes/api_platform.yaml`, `src/ApiResource/.gitignore` | `config/packages/api_platform.yaml` |
| `doctrine/doctrine-bundle` 3.0 | `src/Entity/.gitignore`, `src/Repository/.gitignore` | `config/packages/doctrine.yaml` |
| `doctrine/doctrine-migrations-bundle` 3.1 | `config/packages/doctrine_migrations.yaml`, `migrations/.gitignore` | — |
| `friendsofphp/php-cs-fixer` 3.39 | — | `.php-cs-fixer.dist.php` |
| `phpunit/phpunit` 11.1 | `bin/phpunit` | `.env.test`, `phpunit.dist.xml`, `tests/bootstrap.php` |
| `symfony/console` 5.3 | `bin/console` | — |
| `symfony/flex` 2.4 | — | `.env`, `.env.dev` (locales no versionados) |
| `symfony/framework-bundle` 7.4 | `config/packages/cache.yaml`, `config/packages/framework.yaml`, `config/preload.php`, `config/routes/framework.yaml`, `public/index.php`, `src/Controller/.gitignore`, `.editorconfig` | `config/services.yaml`, `src/Kernel.php` |
| `symfony/mailer` 4.3 | `config/packages/mailer.yaml` | — |
| `symfony/property-info` 7.3 | `config/packages/property_info.yaml` | — |
| `symfony/routing` 7.4 | `config/packages/routing.yaml`, `config/routes.yaml` | — |
| `symfony/security-bundle` 7.4 | `config/packages/security.yaml`, `config/routes/security.yaml` | — |
| `symfony/validator` 7.0 | `config/packages/validator.yaml` | — |

### Dependencias y suplemento JSON-LD

Las 87 dependencias API de producción fijadas en [composer.lock](../../apps/api/composer.lock) declaran MIT. Las dependencias de desarrollo declaran MIT o BSD-3-Clause y no forman parte del staging `--no-dev`. El WEB tiene nueve entradas runtime: siete MIT, RxJS Apache-2.0 y tslib 0BSD. Tailwind es una herramienta de desarrollo, pero su CSS también conserva su aviso MIT. Esto describe los paquetes inspeccionados, no aprueba automáticamente futuras dependencias.

`api-platform/jsonld` v5.0.2, revisión `8c85e35288931b169b524f980eb76bc34a646d16`, no incluye `LICENSE` en el split instalado, aunque sus fuentes remiten a él y su manifiesto declara MIT. Se conserva el [LICENSE del proyecto padre API Platform v5.0.2](https://github.com/api-platform/core/blob/v5.0.2/LICENSE) como [suplemento local íntegro](third_party/api-platform-jsonld-LICENSE.txt). Coincide con los avisos de los otros splits de la misma versión. El generador aplica este suplemento solo a esa revisión exacta; un cambio requiere inspección y no hereda silenciosamente la excepción técnica.

Los avisos de terceros se conservaron íntegros, sin reformular sus textos. Huellas SHA-256:

| Aviso conservado | SHA-256 |
|---|---|
| Symfony recipes | `ee707013b4bf565be3638dd8981c286c08ac84226d751fb60e2ea27dc96694ae` |
| API Platform JSON-LD | `0f6a8869658d87f1b04e3c7be4ce9648fe4a16b0c62f954511b564ab52178b59` |
| Angular schematics | `15e77c4692114f87c2020353626c868472c23954a4ed37ecc4c1522d14be1eb7` |

## Runtime combinado Railway

La imagen Docker multietapa de REL-002 fija el manifest de FrankenPHP `1-php8.5-bookworm` por digest (`sha256:667ddd39a3ed826cd4b5fb8dcbb3af480533931a9f0a53977c2d8557d81f7d99`), que al preparar la imagen contenía FrankenPHP 1.13.0, PHP 8.5.11 y Caddy 2.11.7. Se incorporan los textos íntegros upstream [FrankenPHP MIT](third_party/frankenphp-LICENSE.txt), [Caddy Apache-2.0](third_party/caddy-LICENSE.txt) y [PHP License](third_party/php-LICENSE.txt), además de un índice en [avisos del runtime Railway](third_party/railway-runtime-notices.txt). Los avisos de copyright de paquetes Debian permanecen en `/usr/share/doc/<package>/copyright` dentro de la imagen.

Esto conserva los avisos directos conocidos, pero no cierra la revisión legal completa del runtime: aún debe inventariarse el software Go enlazado en FrankenPHP/Caddy y los paquetes/avisos exactos del sistema. La imagen no se transferirá a Railway antes de resolver ese gate de procedencia.

## Generación y comprobación de los artefactos

Desde la raíz, con las dependencias WEB instaladas:

```sh
npm --prefix apps/web run build
node --test scripts/distribution-notices.test.mjs
```

El build de producción incluye en `apps/web/dist/web/browser/` el aviso propio `SYNQO-LICENSE.txt`, los avisos Angular generados `3rdpartylicenses.txt`, `THIRD_PARTY_NOTICES.txt` con las licencias completas de todos los paquetes runtime y Tailwind, `ANGULAR-TEMPLATES-LICENSE.txt` y `fonts/LICENSE.txt`. Servir/copiar **todo** `browser/` conserva esos avisos; ejecutar `ng build` directamente omite la fase adicional de empaquetado. El wrapper admite `npm --prefix apps/web run build -- --output-path=/ruta/temporal` y procesa ese output, evitando inspeccionar un build antiguo.

Para un staging API local con el código, su `LICENSE` heredado y dependencias instaladas desde su lockfile mediante `composer install --no-dev --no-scripts --optimize-autoloader`, genera los avisos:

```sh
node scripts/distribution-notices.mjs api /ruta/al/staging-api --production
```

El staging conserva todos los archivos `vendor/`, incluyendo los avisos originales. El generador añade `SYNQO-LICENSE.txt` y `THIRD_PARTY_NOTICES.txt`, que reúne Skeleton, recetas, Composer y los 87 paquetes. El comando rechaza dependencias de desarrollo, paquetes ausentes, versiones diferentes y licencias/avisos no encontrados. No cambia el vendor ni la base de datos. Sin `--production` inspecciona también dependencias de desarrollo y no demuestra un empaquetado de producción.

El empaquetado futuro debe copiar esos dos archivos y el vendor íntegro al directorio privado de API. No es necesario publicar archivos PHP o vendor por HTTP para conservar sus avisos. Node se usa en la fase local/de build; no se requiere en el runtime PHP. Cuando exista la imagen final, deberá comprobarse dentro de ella la presencia de ambos avisos y el vendor, y por HTTP los avisos WEB. Las licencias del servidor, imagen base y paquetes del sistema deberán conservarse al concretar esa imagen; este staging aún no acredita una imagen Railway inexistente.

## Límite operativo de Railway

No se conectó ni transfirió código a Railway. Su [texto de términos](https://railway.com/legal/terms) distingue permisos según categoría del envío; una URL pública de la aplicación no demuestra la categoría del código fuente. No hay evidencia de la clasificación del proyecto/workspace real. La reserva de derechos propia y los avisos técnicos no sustituyen esa comprobación ni autorizan el envío. Cualquier aceptación de una excepción deberá decidirse expresamente antes de transferir el código.
