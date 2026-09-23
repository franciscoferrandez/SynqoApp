# ADR-001 — Estrategia multiplataforma

**Estado:** Accepted — revalidated

## Contexto
Synqo debe ser pública, responsive y abrirse desde enlaces compartidos sin exigir instalación. Los deep links, la participación sin cuenta y la respuesta rápida desde móvil son capacidades centrales. No existe requisito de offline profundo ni APIs nativas intensivas en el MVP.

## Alternativas consideradas
- Web/PWA responsive + Capacitor posteriormente.
- React Native/Expo.
- Flutter.
- Clientes web/móvil separados.

## Decisión
Adoptar **web-first/PWA** como cliente principal y utilizar **Capacitor** solo cuando sea necesario empaquetar para Android/iOS.

## Justificación
Abrir una URL es el mecanismo de menor fricción para equipos rápidos, accesos identificados y solicitudes/consultas compartidas. Capacitor mantiene alta reutilización si se necesita distribución nativa.

## Consecuencias
Artefacto web de primera clase; una base de UI; necesidad futura de plugins si aparecen capacidades nativas profundas.

## Revisar si
Background execution, widgets, sensores, integración nativa intensiva u offline pasan a ser objetivos centrales.
