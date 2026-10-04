---
id: MOCKUP-EQU-001
estado: en_revision
---

# MOCKUP-EQU-001 — Arranque directo de un equipo

## Propósito

Revisar la propuesta visual del formulario que aparece al abrir Synqo sin enlace de equipo, siguiendo la dirección de los temas claro y oscuro del [MOCKUP-COO-001 — Calendario y consultas del equipo en claro y oscuro](mockup-coo-001-calendario-consultas.md).

## Vista

[Abrir propuesta navegable](prototipo-arranque-equipo.html). El archivo muestra el formulario y la confirmación predeterminada con el enlace y acceso al calendario según [FLUJO-EQU-002 — Crear un equipo rápido](../02_flujos/flujo-equ-002-crear-equipo.md). La creación se simula. El campo de correo incluye el aviso de que la demo local no enviará nada; el estado parametrizado `?correo=fallido` ilustra exclusivamente la entrega posterior con envío real. Una configuración interna del producto podrá omitir esta confirmación.

## Flujo y estado

- Entrada directa y campos según [WF-EQU-002 — Creación de equipo rápido](../03_wireframes/wf-equ-002-crear-equipo.md).
- Nombre del equipo y primer participante obligatorios según [RF-EQU-001 — Crear un equipo sin registro](../../03_requisitos/01_funcionales/EQU/rf-equ-001-crear-equipo.md) y [RN-EQU-005 — Equipo con al menos un participante](../../03_requisitos/02_reglas-negocio/EQU/rn-equ-005-equipo-con-participante.md).
- Correo opcional visible sin envío en [REL-001 — Demo local operativa de Synqo](../../01_producto/10_entregas/rel-001-demo-local-operativa.md); el envío posterior se define en [RF-EQU-006 — Enviar el enlace del equipo por correo opcional](../../03_requisitos/01_funcionales/EQU/rf-equ-006-enviar-enlace-por-correo.md).

## Componentes y aspecto

**DIRECCIÓN VALIDADA:** misma marca exploratoria, superficies, tipografía y controles que el prototipo central, formulario directo y confirmación posterior. La validación procede de la respuesta expresa de quien impulsa Synqo a la versión actual del prototipo. El selector ofrece «Automático», «Claro» y «Oscuro» y recuerda la opción en el navegador; «Automático» sigue al dispositivo y usa claro como respaldo. El formulario presenta primero los dos nombres necesarios, ambos limitados a 50 caracteres, y después el correo opcional con el aviso explícito de que la demo no enviará nada. La pantalla conserva una sola acción principal: «Crear equipo». Al completar el formulario ilustrativo se recuerda al primer participante para la vista de calendario del prototipo.

Los placeholders ilustran el arranque con una secuencia de veinte nombres de equipo humorísticos, nombres de participante y correos de ejemplo con el dominio reservado `.example`. Se escriben en ese orden; cada campo muestra un «_» parpadeante desde que empieza a escribirse y los anteriores conservan el suyo. Al terminar el correo, la secuencia espera tres segundos, borra los tres textos simultáneamente carácter a carácter desde el final y empieza otro ejemplo. Los valores reales de los campos nunca se modifican. Mientras cualquiera de los tres campos tiene el foco, los tres placeholders quedan vacíos y la animación se pausa; cuando ninguno lo tiene, continúa desde el mismo punto. Si el dispositivo solicita reducir el movimiento, se muestran ejemplos estáticos mientras ningún campo tiene el foco.

La confirmación permite entrar al calendario sin esperar al resultado del intento de envío. Si se conoce un fallo mientras se muestra, usa el mismo aviso que el panel del equipo: explica que el equipo sigue creado, muestra el enlace y conserva las acciones de copiarlo y compartirlo. **DIRECCIÓN VALIDADA** para ambos lugares por respuesta expresa de quien impulsa Synqo. El aviso ilustrativo puede descartarse; al hacerlo, el enlace ordinario vuelve a verse. Si no se descarta, el prototipo lo conserva para mostrarlo al entrar al panel del equipo en ese navegador. El estado se activa mediante `?correo=fallido`; no fija el mecanismo de envío ni de comprobación. No representa rebotes posteriores a la aceptación del proveedor.

La versión previa al aviso de que la demo no enviará correo se conserva en [revisiones/prototipo-arranque-equipo-20261003-antes-aviso-demo-correo.html](revisiones/prototipo-arranque-equipo-20261003-antes-aviso-demo-correo.html).
La versión previa a esta animación se conserva en [revisiones/prototipo-arranque-equipo-20261003-003050.html](revisiones/prototipo-arranque-equipo-20261003-003050.html).
La versión previa al control de pausa se conserva en [revisiones/prototipo-arranque-equipo-20261003-003357.html](revisiones/prototipo-arranque-equipo-20261003-003357.html).
La versión previa al tercer ejemplo animado se conserva en [revisiones/prototipo-arranque-equipo-20261003-003535.html](revisiones/prototipo-arranque-equipo-20261003-003535.html).
La versión previa a la pausa automática por foco se conserva en [revisiones/prototipo-arranque-equipo-20261003-003856.html](revisiones/prototipo-arranque-equipo-20261003-003856.html).
La versión previa a ocultar los placeholders durante el foco se conserva en [revisiones/prototipo-arranque-equipo-20261003-004229.html](revisiones/prototipo-arranque-equipo-20261003-004229.html).
La versión previa al tema inicial según el dispositivo se conserva en [revisiones/prototipo-arranque-equipo-20261003-004554.html](revisiones/prototipo-arranque-equipo-20261003-004554.html).
La versión previa al selector de tres modos y a recordar preferencias se conserva en [revisiones/prototipo-arranque-equipo-20261003-004751.html](revisiones/prototipo-arranque-equipo-20261003-004751.html).
La versión previa al aviso de fallo del correo en la confirmación se conserva en [revisiones/prototipo-arranque-equipo-20261003-010314.html](revisiones/prototipo-arranque-equipo-20261003-010314.html).
La versión previa a limitar los nombres a 50 caracteres se conserva en [revisiones/prototipo-arranque-equipo-20261003-013547.html](revisiones/prototipo-arranque-equipo-20261003-013547.html).
La versión previa al enlace opaco y a la clave ilustrativa basada en UUID se conserva en [revisiones/prototipo-arranque-equipo-20261003-013950.html](revisiones/prototipo-arranque-equipo-20261003-013950.html).
La versión previa al aviso descartable se conserva en [revisiones/prototipo-arranque-equipo-20261003-aviso-descartable.html](revisiones/prototipo-arranque-equipo-20261003-aviso-descartable.html).
La versión previa al ajuste del texto sobre el correo efímero se conserva en [revisiones/prototipo-arranque-equipo-20261003-texto-correo-efimero.html](revisiones/prototipo-arranque-equipo-20261003-texto-correo-efimero.html).

## Revisión pendiente

- Comprobar contraste, foco, ampliación y adaptación en móvil y escritorio antes de aprobar los valores visuales definitivos.
- Resolver en investigación y arquitectura cómo se conoce y comunica un fallo del intento de envío asíncrono; el mockup solo representa el aviso cuando se conoce.
