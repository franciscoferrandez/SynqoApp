# 10 — Requisitos no funcionales

## Usabilidad

- `RNF-US-01`: principales operaciones de participación con fricción mínima y sin registro cuando la modalidad lo permita.
- `RNF-US-02`: modalidad rápido/administrable claramente perceptible.
- `RNF-US-03`: carácter temporal de equipos rápidos visible sin resultar intrusivo.
- `RNF-US-04`: `No disponible` y `Sin respuesta` inequívocamente distintos.
- `RNF-US-05`: disponibilidad general y respuesta a propuesta inequívocamente distintas.
- `RNF-US-06`: en móvil debe poder modificarse disponibilidad de varios días sin abrir una pantalla independiente por fecha.
- `RNF-US-07`: cambiar Calendario/Lista conservará el contexto temporal cuando sea posible.

## Accesibilidad

- `RNF-A11Y-01`: objetivo WCAG 2.2 AA.
- `RNF-A11Y-02`: operaciones principales accesibles con teclado y foco perceptible.
- `RNF-A11Y-03`: el color puede ser predominante, nunca el único codificador de estado.

## Seguridad

- `RNF-SEC-01`: acceso administrativo requiere prueba distinta de conocer el enlace público.
- `RNF-SEC-02`: impedir apropiación de participante por identificadores/nombres públicos.
- `RNF-SEC-03`: autorización validada en servidor en toda operación sensible.
- `RNF-SEC-04`: mecanismos de acceso revocables cuando el modelo lo permita.
- `RNF-SEC-05`: prevenir acceso entre equipos por enumeración o IDOR.
- `RNF-SEC-06`: tokens sensibles no deben quedar innecesariamente en URLs, logs o telemetría.

## Privacidad

- `RNF-PRIV-01`: minimizar PII, especialmente en equipos rápidos.
- `RNF-PRIV-02`: los equipos rápidos expirados definitivamente eliminan o anonimizan irreversiblemente datos de dominio y credenciales, conservando como máximo métricas agregadas y trazas operativas mínimas sin tokens ni PII innecesaria.
- `RNF-PRIV-03`: aislamiento estricto entre equipos.
- `RNF-PRIV-04`: IA recibe únicamente contexto mínimo necesario; no requiere disponibilidad nominal.

## Rendimiento y fiabilidad

- `RNF-PERF-01`: interacción habitual con percepción de respuesta inmediata en condiciones normales.
- `RNF-PERF-02`: coincidencias, recuentos y ranking deterministas/reproducibles.
- `RNF-REL-01`: reintentos accidentales no generan respuestas duplicadas.
- `RNF-REL-02`: resolución consistente ante concurrencia.
- `RNF-REL-03`: fallo del proveedor IA no bloquea el flujo manual.

## Compatibilidad

- `RNF-COMP-01`: navegadores modernos de escritorio y móvil.
- `RNF-RESP-01`: responsive mobile-first.

## Observabilidad

- `RNF-AUD-01`: trazabilidad suficiente para operaciones administrativas, resolución y diagnóstico.
- `RNF-AI-OBS-01`: registrar proveedor/modelo, versión de prompt/schema, latencia, consumo y resultado de validación sin PII innecesaria.
