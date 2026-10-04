import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  template: `
    <section
      class="min-h-64 rounded-2xl border border-dashed border-line bg-soft p-6 sm:p-8"
      aria-labelledby="section-title"
    >
      <p class="eyebrow">Sección de ejemplo</p>
      @if (section === 'calendario') {
        <h2 class="mt-2 text-2xl font-bold" id="section-title">Calendario</h2>
        <p class="mt-3 max-w-xl leading-relaxed text-muted">
          El calendario de disponibilidad aparecerá aquí en un próximo incremento.
        </p>
      } @else {
        <h2 class="mt-2 text-2xl font-bold" id="section-title">Consultas</h2>
        <p class="mt-3 max-w-xl leading-relaxed text-muted">
          Las consultas del equipo aparecerán aquí en un próximo incremento.
        </p>
      }
    </section>
  `,
})
export class EmptySection {
  protected readonly section = inject(ActivatedRoute).snapshot.data['section'] as string;
}
