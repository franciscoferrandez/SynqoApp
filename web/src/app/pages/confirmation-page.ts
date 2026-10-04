import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { previewTeam } from './preview-data';

@Component({
  imports: [RouterLink],
  template: `
    <div class="grid flex-1 place-items-center py-10">
      <section class="panel w-full max-w-xl" aria-labelledby="confirmation-title">
        <p class="eyebrow">Confirmación · ejemplo</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight" id="confirmation-title">
          {{ team.name }}
        </h1>
        <p class="mt-3 leading-relaxed text-muted">
          Primer participante: {{ team.participant }}. Esta pantalla ilustra cómo se verá la
          confirmación.
        </p>
        <div class="mt-6 rounded-xl border border-line bg-soft p-4">
          <p class="font-bold">Enlace de ejemplo · no da acceso a un equipo</p>
          <p class="mt-1 text-sm leading-relaxed text-muted">
            La creación real y el enlace compartible se incorporarán más adelante. No se han
            guardado los datos del formulario.
          </p>
        </div>
        <a class="primary mt-6 inline-flex" routerLink="/_preview/equipo/calendario"
          >Ver calendario de ejemplo <span aria-hidden="true">→</span></a
        >
      </section>
    </div>
  `,
})
export class ConfirmationPage {
  protected readonly team = previewTeam;
}
