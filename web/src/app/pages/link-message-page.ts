import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  template: `
    <div class="grid flex-1 place-items-center py-10">
      <section class="panel w-full max-w-xl" aria-labelledby="message-title">
        <div
          class="grid h-12 w-12 place-items-center rounded-xl bg-soft text-2xl text-blue-strong"
          aria-hidden="true"
        >
          @if (expired) {
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M5 3h14M5 21h14M7 3c0 5 5 6 5 9s-5 4-5 9m10-18c0 5-5 6-5 9s5 4 5 9M8 6h8M8 18h8"
              />
            </svg>
          } @else {
            ?
          }
        </div>
        <p class="eyebrow mt-6!">Enlace de equipo · vista previa</p>
        @if (expired) {
          <h1 class="mt-2 text-3xl font-bold tracking-tight" id="message-title">
            Este equipo ha caducado
          </h1>
          <p class="mt-3 leading-relaxed text-muted">
            Ya no se puede acceder a este equipo ni recuperar su contenido.
          </p>
        } @else {
          <h1 class="mt-2 text-3xl font-bold tracking-tight" id="message-title">
            No encontramos este equipo
          </h1>
          <p class="mt-3 leading-relaxed text-muted">
            No encontramos ningún equipo para este enlace. Comprueba que lo hayas abierto completo.
          </p>
        }
      </section>
    </div>
  `,
})
export class LinkMessagePage {
  protected readonly expired = inject(ActivatedRoute).snapshot.data['kind'] === 'expired';
}
