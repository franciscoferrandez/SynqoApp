# Convención de commits de Synqo

Se aplica a todos los commits del repositorio: producto, documentación, plugin PDI, WEB, API y configuración. Adopta [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) con un ámbito obligatorio y un resumen en castellano.

## Formato

```text
tipo(ambito): resumen

cuerpo opcional

pies opcionales
```

- `tipo` es uno de `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `style`, `build`, `ci`, `chore` o `revert`.
- `ambito` identifica la parte afectada, en minúsculas y con guiones si hace falta. Usar preferentemente `pdi`, `doc`, `web`, `api` o `repo`. Si un cambio abarca varias partes inseparables, usar el ámbito que explica mejor su intención o `repo`; no enumerar varios ámbitos.
- `resumen` expresa una acción breve en castellano, empieza con verbo en infinitivo, no termina en punto y explica el cambio concreto. El cuerpo, si hace falta, explica el motivo o una consecuencia; se separa del encabezado por una línea vacía.
- Si el cambio rompe un contrato ya consumido, añadir `!` antes de `:` y explicar la incompatibilidad en un pie `BREAKING CHANGE: ...`. No se infiere que toda modificación de una SPEC sea un cambio incompatible.
- Si el commit materializa una SPEC, se recomienda añadir `Refs: SPEC-...` en el pie para localizarla. No es obligatorio para cambios independientes como el framework PDI o la documentación general.

## Elección del tipo

| Tipo | Uso |
|---|---|
| `feat` | Capacidad nueva de la aplicación o del plugin PDI. |
| `fix` | Corrección de un fallo de comportamiento. |
| `docs` | Cambio solo documental, incluidos baseline, README y SPEC. |
| `refactor` | Reorganización de código sin cambio de comportamiento. |
| `test` | Incorporación o corrección de pruebas sin cambiar el comportamiento productivo. |
| `perf` | Mejora de rendimiento comprobable. |
| `style` | Formato del código sin cambio de lógica. |
| `build` | Dependencias, compilación o empaquetado. |
| `ci` | Automatización de integración o entrega. |
| `chore` | Mantenimiento del repositorio que no encaja en otro tipo. |
| `revert` | Reversión de un commit anterior; indicar su referencia en el cuerpo o pie. |

## Ejemplos

```text
docs(doc): registrar la convención HTTP de la API
feat(pdi): añadir la skill de inicialización
feat(web): crear el layout exterior compartido
fix(api): rechazar nombres de participante duplicados
build(repo): configurar los controles estáticos locales
feat(api)!: cambiar el contrato de acceso al equipo

BREAKING CHANGE: los clientes deben enviar el nuevo valor de acceso
Refs: SPEC-EQU-001
```

Los commits reúnen un cambio coherente. Si hay intenciones distintas, se separan cuando sea razonable. Los mensajes de merge o squash que se creen manualmente seguirán el mismo formato; no se aceptan encabezados genéricos que oculten el cambio.

## Validación local

En este repositorio, la configuración de Lefthook añadirá un hook `commit-msg` para comprobar el encabezado y, si aparece, el marcador de ruptura. El hook devolverá error y bloqueará el commit cuando el mensaje no cumpla el formato; nunca modificará el mensaje. La persona podrá editarlo y repetir el commit. Esta comprobación se aplicará desde el primer incremento visual, junto con los [controles estáticos de la demo local](../03_calidad/controles-estaticos-demo-local.md), y se verificará con mensajes válidos e inválidos. Git ya está disponible aquí; el hook aún no está configurado.

El hook local es una ayuda para mantener el formato; al configurar CI se añadirá la comprobación equivalente para los commits que entren en `main`. [Git documenta el comportamiento de `commit-msg`](https://git-scm.com/docs/githooks#_commit_msg).
