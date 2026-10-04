# Contrato común de skills

Toda skill debe respetar:

`<PDI_ROOT>` es la raíz real del plugin que contiene `skills/`, `dist_docs/` y `scripts/`; resuelve enlaces simbólicos antes de determinarla.

## Contexto mínimo

1. `<PDI_ROOT>/AGENTS.md`.
2. `<DOC>/README.md`, donde `<DOC>` es la carpeta de `.pdi/config.json` o `pdi_doc/` por defecto.
3. convenciones de gobierno.
4. README de carpeta objetivo.
5. artefactos relevantes solamente.

## Resultado

Toda ejecución termina en uno de:

```text
DONE
READY_FOR_<NEXT>
BLOCKED
NO_CHANGE
```

## Formato BLOCKED

```text
BLOCKED
Motivo:
Impacto:
Falta:
Opciones conocidas:
Siguiente skill/acción permitida:
```

## Decisiones bloqueantes persistentes

La conversación no es el único registro de una decisión que impide completar o aprobar un artefacto. Antes de terminar una operación con ese bloqueo, deja en el propio artefacto afectado, si existe, una sección de decisiones pendientes con: pregunta concreta, por qué bloquea, opciones conocidas (o qué investigación falta) y gate afectado. Señala expresamente que ninguna opción está aprobada. Un resumen en el estado documental puede enlazar al artefacto, pero no reemplaza el detalle. Si el artefacto aún no puede crearse, registra una PA con su `Qué bloquea` y enlázala desde el estado de la fase; no crees una verdad normativa fingiendo que la decisión está tomada.

Al recibir la respuesta, actualiza el registro en la misma operación: incorpora la decisión por la skill autorizada, enlaza su fuente cuando corresponda y retira o resuelve el bloqueo. Las skills de consulta o validación que no modifican documentos deben señalar la ausencia de este registro y derivar a la skill que pueda escribirlo. No conviertas una recomendación, una opción preseleccionada ni el silencio en aprobación.

## Omission policy

Una fase solo puede omitirse si:

- la skill la declara opcional para el nivel;
- se registra `omitido_activamente`;
- se incluye motivo;
- no existe un riesgo que la haga obligatoria.

## Autoridad

- Las skills de Change no modifican verdad normativa directamente.
- `pdi:baseline-update` es la puerta canónica para verdad normativa.
- `architecture-decision` produce decisión/ADR y termina invocando/solicitando `pdi:baseline-update`.

## Enlaces documentales

- Toda referencia en prosa o tablas a un artefacto existente del proyecto debe usar `[ID — denominación canónica](ruta/relativa.md)` y apuntar al archivo de ese ID.
- Antes de terminar una operación que cree o modifique documentos, ejecuta `python3 <PDI_ROOT>/scripts/validate_structure.py` desde el proyecto y corrige las referencias sin enlace, los destinos erróneos y las denominaciones distintas.
