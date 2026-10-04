# Controles estáticos de la demo local

## Alcance

Estos controles forman parte de la calidad de la [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md). La configuración se incorporará al crear cada módulo: WEB en [SPEC-COO-001 — Base visual y navegación de Synqo](../../08_especificaciones/spec-coo-001-base-visual-y-navegacion.md) y API en [SPEC-EQU-001 — Arranque de equipo compartido en la demo local](../../08_especificaciones/spec-equ-001-arranque-equipo-local.md). Este repositorio ya tiene Git y la rama `main`, pero aún no contiene proyectos Angular/Symfony ni dependencias instaladas; los hooks se activarán al crear los módulos.

## API: PHP 8.5 y Symfony 7.4

| Herramienta | Configuración acordada | Comprobación sin modificar | Corrección a demanda |
|---|---|---|---|
| PHP CS Fixer | Dependencia de desarrollo; configuración versionada con `@Symfony`, reglas no riesgosas y ámbito `src/` y `tests/`, excluyendo código generado y `vendor/`. | `vendor/bin/php-cs-fixer check --diff` | `vendor/bin/php-cs-fixer fix` |
| PHPStan | Dependencia de desarrollo; nivel `max` desde el inicio, con extensiones Symfony y Doctrine; analizar `src/` y `tests/`. No generar una baseline global de errores. Toda excepción tendrá alcance mínimo y motivo documentado. | `vendor/bin/phpstan analyse --no-progress` | Corregir tipos o código manualmente; PHPStan no modifica archivos. |
| Rector | Dependencia de desarrollo; configuración versionada para `src/` y `tests/`, limitada a los conjuntos de PHP compatibles con `composer.json` y a las transformaciones Symfony compatibles con la versión instalada. No activar conjuntos masivos de refactorización o reglas riesgosas por defecto. | `vendor/bin/rector process --dry-run` | `vendor/bin/rector process`, seguido de revisión del diff y pruebas. |

La configuración de PHPStan cargará las extensiones Symfony y Doctrine para interpretar los patrones del framework. La de Rector se ajustará a las versiones efectivamente instaladas, sin proponer migraciones a Symfony 8 ni a versiones de PHP superiores a la elegida. Si una herramienta no admite la combinación instalada, se investigará la incompatibilidad antes de rebajar el control o cambiar versiones.

## WEB: Angular 21

| Herramienta | Configuración acordada | Comprobación sin modificar | Corrección a demanda |
|---|---|---|---|
| ESLint con `angular-eslint` 21 y `typescript-eslint` | Configuración plana; reglas recomendadas de TypeScript y Angular para `.ts`, plantillas externas e internas, incluidas las reglas de accesibilidad de plantillas. Los problemas reportados bloquean el control. | `npm run lint` | `npm run lint:fix`, con revisión de cambios. |
| Prettier | Configuración e ignorados versionados para código y archivos de configuración de WEB; no reformatear los mockups de referencia ni todo `pdi_doc/` por efecto del hook. | `npm run format:check` (`prettier --check`) | `npm run format:fix` (`prettier --write`). |
| Compilador TypeScript/Angular | `strict` y `strictTemplates` activos. La compilación comprueba también las plantillas; ESLint no sustituye esta comprobación. | `npm run build` | Corregir los errores manualmente. |

Se fijarán versiones compatibles en los archivos de dependencias al crear WEB y API. Las reglas de estilo de Prettier no se duplicarán en ESLint.

## Pre-commit local

Un hook versionado en la raíz, gestionado con Lefthook, ejecutará las comprobaciones aplicables **antes de cada commit** cuando haya cambios preparados en WEB o API. Empezará con las comprobaciones de WEB en la primera SPEC y añadirá las de API en la segunda. Un hook `commit-msg` distinto comprobará el formato de todos los commits conforme a la [convención de commits de Synqo](../04_git/convencion-commits.md). Si cambia la configuración de una herramienta, se ejecuta el control completo de su módulo. El hook bloquea el commit si falla una comprobación o falta una dependencia necesaria. No ejecuta comandos `--fix` o `--write`, no modifica archivos ni añade cambios al índice de Git.

Para que un archivo preparado no pase gracias a cambios posteriores sin preparar, el hook rechazará archivos de código/configuración parcialmente preparados en los módulos afectados; se deberán preparar completos o separar el cambio antes de volver a intentar el commit. Los comandos de comprobación completos estarán disponibles también fuera del hook. Al disponer de las dependencias se documentará cómo activar el hook en cada clon y se comprobará que una infracción impide realmente el commit. La configuración de CI de GitHub usará los mismos comandos al incorporarse y respetará las reglas actuales de `main`.

## Fuentes de configuración

- [PHP CS Fixer: versiones, `check` y `fix`](https://github.com/PHP-CS-Fixer/PHP-CS-Fixer).
- [PHPStan: niveles](https://phpstan.org/user-guide/rule-levels) y [extensiones](https://phpstan.org/user-guide/extension-library).
- [Rector: configuración](https://getrector.com/documentation/config-configuration), [conjuntos basados en Composer](https://getrector.com/documentation/composer-based-sets) y [`--dry-run`](https://getrector.com/documentation/cli-options).
- [angular-eslint: instalación y compatibilidad con Angular](https://github.com/angular-eslint/angular-eslint) y [configuración de TypeScript y plantillas](https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_ESLINT.md).
- [Prettier: `--check` y `--write`](https://prettier.io/docs/cli), [Angular: `strictTemplates`](https://angular.dev/reference/configs/angular-compiler-options) y [Lefthook: hooks y filtros](https://github.com/evilmartians/lefthook).
