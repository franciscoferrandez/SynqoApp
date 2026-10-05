import { Component } from '@angular/core';

@Component({
  template: `
    <section aria-labelledby="section-title">
      <div class="section-heading">
        <div>
          <h2 id="section-title">Consultas</h2>
          <p>Vota o revisa las decisiones de este equipo.</p>
        </div>
      </div>
      <div class="panel consultations-empty">
        <span class="empty-symbol" aria-hidden="true">?</span>
        <h3>Aún no hay consultas</h3>
        <p>Las consultas del equipo aparecerán aquí en un próximo incremento.</p>
      </div>
    </section>
  `,
})
export class EmptySection {}
