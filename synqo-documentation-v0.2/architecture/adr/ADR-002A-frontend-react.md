# ADR-002A — Frontend con React

**Estado:** Accepted

## Contexto
La UI es una SPA/PWA mobile-first con calendarios interactivos, heatmaps de disponibilidad, selección de múltiples fechas, vistas Calendario/Lista, formularios dinámicos y accesibilidad. Debe funcionar bien dentro de Capacitor en el futuro.

## Alternativas consideradas
- React + TypeScript + Vite.
- Angular + TypeScript.

## Decisión
Adoptar **React + TypeScript + Vite**, React Router, TanStack Query, React Hook Form y Zod. La capa visual se apoyará en componentes controlables (p. ej. shadcn/ui + Tailwind), revisando la elección concreta durante bootstrap si fuera necesario.

## Justificación
React ofrece flexibilidad de composición y un ecosistema adecuado para interfaces altamente interactivas sin imponer una segunda arquitectura de servidor. TanStack Query separa server-state y React Hook Form/Zod cubren formularios y validación.

## Consecuencias
Se requiere disciplina explícita de arquitectura frontend y selección consciente de bibliotecas; se evita un framework más pesado cuando la necesidad principal es composición UI.
