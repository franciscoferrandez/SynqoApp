# Toolkit local de Railway

El punto de entrada es `./railway-toolkit.sh`. Opera únicamente sobre el proyecto Synqo configurado en el script y el entorno `preproduction`; exige la Railway CLI autenticada y el repositorio vinculado al proyecto. Empieza por `./railway-toolkit.sh status`. La [operación Railway de REL-002](railway-rel-002.md) conserva la guía de configuración, secretos y comprobaciones de aplicación.

| Orden | Uso |
|---|---|
| `status` | Estado y horarios Cron, sin leer variables secretas. |
| `plan`, `apply` | Previsualizar y aplicar IaC. Detecta los servicios Cron existentes para conservar sus opt-ins; `apply` muestra el plan y exige confirmación. No se usa durante una pausa. Para crear por primera vez un Cron, sigue los opt-ins explícitos de la guía principal. |
| `logs synqo-http` | Últimas 100 líneas del servicio indicado. Admite los cuatro servicios de preproducción. |
| `cron-run purge` o `cron-run demo-reset` | Ejecuta una vez un Cron existente, tras confirmación. `demo-reset` restaura solamente los UUID demo configurados, si pasa sus guardas. |
| `deploy-local synqo-http` | Excepción: publica un árbol Git limpio desde el equipo. También admite cada servicio Cron. Un push posterior a `main` puede sustituir esa imagen. |

## Parar conservando datos

1. Ejecuta `./railway-toolkit.sh pause`. Guarda localmente los horarios que existen en `.local-dev/railway-toolkit-state.json` y muestra los pasos manuales. No detiene servicios todavía.
2. En Railway, desactiva **Automatic Deployments** de los servicios conectados a GitHub y quita el horario de cada Cron indicado. Espera a que termine cualquier ejecución Cron. El toolkit no puede verificar el interruptor de autodespliegue por CLI, así que exige que declares haberlo comprobado.
3. Ejecuta `./railway-toolkit.sh pause --autodeploy-disabled` en una terminal interactiva. Comprueba que los Cron carecen de horario, pide escribir `PAUSAR preproduction` y retira los despliegues activos de HTTP y PostgreSQL. Conserva los servicios y el volumen; el almacenamiento puede seguir generando coste.

No apliques IaC durante la pausa: su definición puede volver a activar horarios y réplicas. Conserva el archivo local de estado; contiene solo nombres y horarios, nunca secretos. Si cambias de equipo antes de reanudar, recupera esos datos o restaura los horarios manualmente.

Si solo habías preparado la pausa y cambias de idea, restaura antes los horarios y ejecuta `./railway-toolkit.sh cancel-pause`. Comprueba también que **Automatic Deployments** quede como estaba.

Para reanudar, ejecuta `./railway-toolkit.sh resume`. Requiere el archivo local de pausa, pide confirmación, despliega PostgreSQL y espera a que esté activo; después publica HTTP desde la fuente GitHub configurada y espera a que supere su despliegue/healthcheck. Finalmente restaura los horarios Cron registrados y elimina el archivo local. Revisa `/healthz`, API y Cron Runs, y reactiva **Automatic Deployments** manualmente en Railway. Si algo falla a mitad de camino, conserva el archivo de pausa para reintentar o resolver el fallo; comprueba el estado antes de repetir.

## Borrar y reconstruir

`./railway-toolkit.sh destroy --data-loss-accepted` borra el entorno `preproduction` después de una confirmación escrita. **El proyecto no configura copias de PostgreSQL**; antes de ejecutarlo, exporta los datos que quieras conservar o acepta perderlos. Borrar el entorno elimina sus servicios, variables y datos asociados; no es una pausa.

Tras borrarlo, `./railway-toolkit.sh create` crea el entorno vacío y muestra el plan IaC, sin aplicar cambios todavía. Revisa el plan y ejecuta `./railway-toolkit.sh apply`. Después configura los secretos protegidos, conecta las fuentes GitHub y genera el dominio siguiendo la [guía de operación](railway-rel-002.md). `./railway-toolkit.sh publish` despliega PostgreSQL y HTTP una vez conectada la fuente del servicio HTTP; verifica salud y rutas antes de habilitar los Cron. Los Cron siguen siendo opt-in y deben desplegarse y verificarse individualmente según la guía. Ningún script inventa ni guarda valores de secretos.

La CLI empleada se documenta en [Railway `status`](https://docs.railway.com/cli/status), [`down`](https://docs.railway.com/cli/down), [`redeploy`](https://docs.railway.com/cli/redeploy), [IaC](https://docs.railway.com/infrastructure-as-code), [Cron](https://docs.railway.com/cli/cron) y [entornos](https://docs.railway.com/cli/environment).
