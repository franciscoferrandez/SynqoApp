# Dirección visual de Synqo

## Objetivo

Definir una dirección visual inicial para Synqo que traduzca sus principios de producto a criterios de diseño verificables. Este documento no fija todavía tokens, componentes definitivos ni librerías UI; sirve como entrada para el design system posterior.

## Fuentes

- `PRD.md`
- `product/01-product-vision.md`
- `product/10-non-functional-requirements.md`
- `product/13-information-architecture.md`
- `product/15-screen-specification.md`
- `product/16-wireframes/README.md`
- `product/16-wireframes/03-team-home.md`
- `product/16-wireframes/04-my-availability.md`
- `product/16-wireframes/05-collective-availability.md`

## Atributos de marca y tono visual

Synqo debe sentirse como una herramienta de coordinación clara, rápida y confiable. La experiencia no debe parecer una red social, una suite corporativa pesada ni una landing de marketing: el valor aparece cuando el usuario entiende qué requiere su atención, qué sabe el equipo y qué queda por decidir.

| Atributo | Dirección |
|---|---|
| Claridad | Jerarquía explícita entre acción pendiente, información calculada y resolución humana. |
| Baja fricción | Pantallas directas, pocos pasos visibles y acciones principales fáciles de encontrar, especialmente desde deep links. |
| Coordinación | Énfasis visual en estados compartidos, recuentos, coincidencias y diferencias entre participantes. |
| Confianza | Superficies sobrias, estados inequívocos y señales claras de permisos, temporalidad y cierre. |
| Cercanía | Lenguaje visual humano y cotidiano, sin solemnidad administrativa excesiva. |
| Mobile-first | Densidad útil, controles táctiles claros y navegación orientada a tareas. |

La expresividad visual debe ser moderada. Synqo puede tener personalidad mediante color, ritmo, iconografía y microdetalles, pero no debe competir con la lectura de disponibilidad, pendientes y resultados.

## Sensación deseada

El usuario debería percibir:

- "Entiendo qué está pasando en este equipo."
- "Puedo responder rápido sin registrarme si no hace falta."
- "Puedo distinguir un resultado calculado de una decisión final."
- "El color ayuda, pero no dependo solo de verlo."
- "El equipo rápido es temporal; el administrable es más estable y configurable."

## Jerarquía visual

La jerarquía debe priorizar tareas y decisiones:

1. Acción pendiente del usuario.
2. Estado del equipo o consulta cuando afecta a la acción.
3. Información colectiva relevante: coincidencias, recuentos, votos, resultado.
4. Acciones secundarias: compartir, cambiar vista, consultar histórico.
5. Metadatos: modalidad de equipo, deadline, zona horaria, permisos.

En una pantalla de equipo, "TU ACTIVIDAD" y los pendientes deben tener más peso visual que bloques informativos o navegación secundaria. En consultas, "Resultado actual" y "Resolución" deben verse como bloques relacionados pero separados.

## Densidad

Synqo debe ser denso en información cuando el usuario compara fechas o alternativas, y más despejado cuando debe tomar una decisión irreversible.

- En disponibilidad y resultados: permitir comparación compacta, con tablas, listas o calendarios escaneables.
- En creación/resolución: bajar densidad, confirmar consecuencias y evitar ruido.
- En móvil: mostrar menos columnas y más agrupación vertical, pero sin obligar a abrir una pantalla independiente por cada día.
- En escritorio: aprovechar anchura para comparación y detalle lateral, no para decorar.

## Color

El color puede ser predominante en calendarios y disponibilidad, pero nunca el único canal semántico (`RNF-A11Y-03`). Cada estado debe combinar color con texto, icono, patrón, posición o abreviatura.

### Disponibilidad

| Estado | Intención visual | Apoyo no cromático |
|---|---|---|
| `Disponible` | Positivo, estable, apto para destacar coincidencias. Debe sentirse claramente favorable sin gritar. | Check, etiqueta "Disponible", abreviatura "Sí", relleno sólido o borde reforzado. |
| `Quizá` | Intermedio, cauteloso, señal positiva débil. No debe confundirse con disponibilidad plena. | Signo `?`, etiqueta "Quizá", relleno parcial, patrón diagonal o borde discontinuo. |
| `No disponible` | Negativo o bloqueo real, visualmente distinguible sin parecer error técnico. | Cruz, etiqueta "No disponible" o "No", trazo/contorno específico. |
| `Sin respuesta` | Ausencia de dato, neutral y subordinada. Nunca debe parecer `No disponible`. | Punto, guion, vacío controlado, etiqueta "Sin respuesta". |

Principios:

- `Disponible` y `No disponible` deben ser distinguibles también en escala de grises.
- `Quizá` debe quedar entre ambos como matiz, no como éxito atenuado.
- `Sin respuesta` debe usar baja prominencia, no rojo ni símbolos de rechazo.
- En disponibilidad colectiva, los recuentos por estado permanecen separados; no mezclar `Quizá` dentro de `Disponible`.
- En heatmaps, la intensidad puede representar concentración favorable, pero el detalle del día debe mostrar desglose textual y nominal cuando proceda.

### Color funcional general

- Acciones primarias: reservar un color de acción reconocible y consistente.
- Alertas de expiración de equipo rápido: visibles sin ser alarmistas.
- Estados de error: diferenciar error técnico de restricción de permisos o consulta cerrada.
- IA: usar un tratamiento discreto; debe parecer asistencia opcional, no un modo mágico ni decisor.

## Tipografía

La tipografía debe favorecer lectura rápida de fechas, nombres, recuentos y estados.

- Priorizar legibilidad sobre carácter decorativo.
- Usar una familia sans-serif de interfaz, con números claros y diferenciables.
- Evitar titulares sobredimensionados dentro de pantallas operativas.
- Reservar mayor escala para nombres de equipo, pregunta de consulta y decisiones finales.
- Recuentos y fechas necesitan alineación y ritmo consistente para comparación.
- La microcopy de estados debe ser directa: "Sin respuesta", "Todavía sin resolver", "Consulta cerrada".

## Espaciado y composición

La composición debe dejar ver qué pertenece al mismo contexto:

- Agrupar por tarea: pendiente, disponibilidad, decisiones activas, histórico.
- Separar visualmente información calculada de resolución final.
- Usar espaciado suficiente para tactilidad móvil sin perder densidad comparativa.
- Evitar grandes bloques hero o composiciones promocionales dentro del producto.
- Mantener la navegación de equipo estable entre Inicio, Disponibilidad, Decisiones, Histórico y Configuración.

## Superficies

Las superficies deben comunicar estructura, no decorar.

- Usar fondos base tranquilos y superficies de contenido con contraste suficiente.
- Las tarjetas deben reservarse para elementos repetibles o unidades de acción: pendientes, consultas, fechas candidatas.
- Evitar tarjetas anidadas; cuando haga falta jerarquía interna, usar divisores, encabezados compactos o alineación.
- Los estados críticos como verificación pendiente, equipo recuperable o enlace inválido pueden usar bandas o bloques de aviso persistentes.

## Radios y elevación

La forma debe ser amable pero precisa.

- Radios moderados: suficientes para suavizar, no tan grandes que parezcan elementos lúdicos o promocionales.
- Elevación mínima: usar sombra solo para capas temporales, menús, modales o elementos flotantes.
- Preferir borde, fondo y espaciado para jerarquía permanente.
- En calendario y listas, no permitir que radios/elevación dificulten comparar celdas o filas.

## Iconografía

Los iconos deben acelerar reconocimiento, no sustituir texto donde haya ambigüedad.

- Usar iconos simples y consistentes para disponibilidad, crear, compartir, resolver, cerrar, cancelar, configuración y seguridad.
- Disponibilidad debe apoyarse en símbolos reconocibles: check, interrogación, cruz, punto/guion.
- Las acciones sensibles, como resolver o cancelar, deben combinar icono y texto.
- En vistas densas, los iconos deben mantener tamaño y alineación estable para no romper el escaneo.

## Diferenciación visual de conceptos clave

### Equipo rápido y equipo administrable

| Concepto | Diferenciación visual |
|---|---|
| Equipo rápido | Señal ligera y persistente de temporalidad: etiqueta "Equipo rápido", indicador de estado (`Active`, `Recoverable`) y aviso de expiración cuando sea relevante. Debe ser visible sin ocupar el centro de la pantalla todo el tiempo. |
| Equipo administrable | Señal de estabilidad y configuración: etiqueta "Equipo administrable", acceso a Configuración cuando proceda y mensajes de verificación/administración más formales. |

No usar estilos que sugieran que el equipo rápido es una versión "inferior"; es una modalidad de baja fricción.

### Consulta abierta, cerrada, resuelta y cancelada

| Estado | Tratamiento visual |
|---|---|
| Abierta | Acciones de respuesta visibles, deadline si existe y estado participativo activo. |
| Cerrada + pendiente | Bloque de respuesta en modo lectura, resultado visible y llamada a resolver si el usuario tiene permiso. |
| Resuelta | Resolución final destacada por encima del resultado; participación cerrada. |
| Cancelada | Estado claro, contenido conservado como histórico y acciones principales deshabilitadas. |

`CLOSED + PENDING` no debe parecer resuelto. Debe leerse como "ya no acepta respuestas, falta decisión".

### Resultado y Resolución

Resultado y Resolución son conceptos distintos y deben separarse visualmente:

- Resultado: recuentos, ranking o distribución calculada; estilo informativo.
- Resolución: decisión final explícita; estilo confirmatorio, con mayor peso y registro de opción elegida.

Nunca presentar el primer resultado o la mejor coincidencia como decisión automática.

## Calendario y lista

El calendario es la vista más visual; la lista es la vista más explícita. Ambas deben conservar contexto temporal al alternar.

### Calendario

- Adecuado para detectar patrones, huecos y coincidencias.
- Las celdas deben mantener tamaño estable y no depender solo de color.
- En disponibilidad propia, cada día debe poder cambiarse sin navegación profunda.
- En disponibilidad colectiva, cada día debe mostrar resumen compacto y abrir desglose.

### Lista

- Adecuada para accesibilidad, comparación textual y operación rápida por semana.
- Debe mostrar estado y acciones por día con etiquetas completas.
- Debe ser equivalente funcional del calendario, no una vista secundaria incompleta.

## Mobile-first y escritorio

### Móvil

- Priorizar tareas inmediatas y controles táctiles.
- Navegación de equipo candidata: `Inicio | Disponibilidad | Decisiones | Más`.
- Calendario compacto con detalle progresivo.
- Acciones primarias visibles, con confirmaciones solo cuando haya consecuencia relevante.

### Escritorio

- Usar columnas para combinar lista/calendario con detalle.
- Mantener densidad de comparación en disponibilidad colectiva y resultados.
- Evitar expandir artificialmente espacios vacíos con contenido decorativo.

## Hacer / No hacer

| Hacer | No hacer |
|---|---|
| Mostrar "Sin respuesta" como ausencia de dato. | Pintar "Sin respuesta" como "No disponible". |
| Separar Resultado de Resolución con títulos y jerarquía. | Convertir la opción mejor posicionada en decisión implícita. |
| Usar color + icono/texto/patrón para estados. | Depender solo de rojo/verde. |
| Señalizar equipo rápido como temporal de forma persistente pero discreta. | Mostrar avisos intrusivos de expiración en cada interacción. |
| Permitir comparar fechas en calendario y lista. | Hacer que la lista pierda información respecto al calendario. |
| Usar densidad alta en comparación y baja en confirmación. | Diseñar todas las pantallas con la misma densidad. |
| Mantener IA como ayuda opcional y revisable. | Presentar la IA como fuente de decisión o autoridad. |
| Usar tarjetas para consultas o pendientes repetibles. | Encapsular secciones enteras en tarjetas dentro de tarjetas. |

## Criterios de evaluación para pantallas futuras

Una pantalla futura es coherente con esta dirección visual si:

- Permite responder "qué requiere mi atención" en pocos segundos.
- Distingue `Disponible`, `Quizá`, `No disponible` y `Sin respuesta` sin depender solo de color.
- Mantiene visibles las diferencias entre disponibilidad general y respuesta a propuesta.
- Distingue Resultado de Resolución sin ambigüedad.
- Hace perceptible la modalidad rápido/administrable cuando afecta al usuario.
- Mantiene operaciones principales accesibles con teclado y foco visible.
- Usa densidad adecuada al trabajo: comparación compacta, decisión despejada.
- No introduce estética promocional dentro de pantallas operativas.
- No añade conceptos fuera del MVP para resolver problemas visuales.

## Decisiones explícitas de dirección visual

| ID | Decisión |
|---|---|
| `DV-01` | Synqo adopta una dirección visual de herramienta operativa clara, no de producto promocional. |
| `DV-02` | Color será un canal predominante para disponibilidad, pero siempre redundante con texto, símbolo, patrón o estructura. |
| `DV-03` | `Quizá` se representa como estado intermedio y positivo débil, nunca como variante de `Disponible`. |
| `DV-04` | `Sin respuesta` se representa como ausencia neutral de dato, nunca como rechazo. |
| `DV-05` | Resultado y Resolución tienen jerarquías visuales separadas en toda consulta. |
| `DV-06` | Las superficies priorizan estructura y escaneo; no se usan tarjetas anidadas ni elevación decorativa. |

## Cuestiones para el prompt 03

El design system deberá concretar:

- Escalas tipográficas y de espaciado.
- Paleta accesible y contrastes mínimos por estado.
- Iconos concretos para cada estado y acción.
- Tratamiento de foco, hover, selección y deshabilitado.
- Densidades de calendario/lista para móvil y escritorio.

