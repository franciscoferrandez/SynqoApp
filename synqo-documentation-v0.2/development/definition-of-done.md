# Definition of Done

Esta definición es común a cambios de implementación. Se aplica con el alcance que corresponda y no obliga a ejecutar herramientas que aún no existan.

## Checklist

- [ ] Existe una SPEC `Ready` cuando el cambio es una funcionalidad o comportamiento sustancial.
- [ ] Los requisitos y criterios de aceptación aplicables están satisfechos.
- [ ] Las invariantes del dominio se preservan.
- [ ] La autorización se comprueba en servidor.
- [ ] Se han añadido o actualizado los tests apropiados al riesgo.
- [ ] Los tests existentes siguen pasando.
- [ ] Typecheck pasa, cuando exista.
- [ ] Lint pasa, cuando exista.
- [ ] Build pasa, cuando exista.
- [ ] OpenAPI y DTOs están sincronizados cuando aplica.
- [ ] Las migraciones y constraints están actualizadas cuando aplica.
- [ ] Seguridad y privacidad se han revisado cuando aplica.
- [ ] Accesibilidad se ha revisado para la UI afectada.
- [ ] No se han introducido secretos.
- [ ] No quedan TODO críticos sin registrar.
- [ ] La documentación afectada está sincronizada.
- [ ] El diff se ha revisado y no incluye cambios accidentales.
- [ ] La SPEC refleja el resultado y las desviaciones, si existen.
- [ ] La evidencia TFM se registra si el cambio es significativo.
- [ ] Se ha realizado la verificación final mediante `$synqo-verification`.

Cuando el repositorio tenga scripts de implementación, este documento se completará con los comandos exactos descubiertos en el propio proyecto. No se presuponen comandos antes de que existan.
