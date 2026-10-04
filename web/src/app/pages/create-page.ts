import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  template: `
    <div
      class="grid flex-1 items-center gap-9 py-10 md:grid-cols-[minmax(0,.9fr)_minmax(340px,1fr)] md:gap-14 md:py-16"
    >
      <section aria-labelledby="intro-title">
        <p class="eyebrow">Un espacio para vuestro equipo</p>
        <h1
          class="mt-3 max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          id="intro-title"
        >
          Poneos de acuerdo más fácilmente.
        </h1>
        <p class="mt-5 max-w-lg text-lg leading-relaxed text-muted">
          Reunid disponibilidad y consultas en un mismo lugar. Crea un equipo, comparte el enlace y
          empezad a coordinaros.
        </p>
        <ul class="mt-7 flex flex-wrap gap-2" aria-label="Características">
          <li class="rounded-full bg-soft px-3 py-2 text-sm font-semibold">Sin registro</li>
          <li class="rounded-full bg-soft px-3 py-2 text-sm font-semibold">
            Disponibilidad por día
          </li>
          <li class="rounded-full bg-soft px-3 py-2 text-sm font-semibold">Decisiones claras</li>
        </ul>
      </section>
      <section class="panel" aria-labelledby="create-title">
        <p class="eyebrow">Empezar · vista previa</p>
        <h2 class="mt-2 text-2xl font-bold tracking-tight" id="create-title">Crea tu equipo</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Prueba el recorrido visual. Los datos que escribas no se usarán ni se guardarán.
        </p>
        <form class="mt-6 space-y-5" (submit)="showPreview($event)" autocomplete="off" novalidate>
          <div class="field">
            <label for="team-name">Nombre del equipo o grupo</label
            ><input
              id="team-name"
              name="team"
              maxlength="50"
              placeholder="Por ejemplo, Amigos del viernes"
            />
          </div>
          <div class="field">
            <label for="participant-name">Nombre del primer participante</label
            ><input
              id="participant-name"
              name="participant"
              maxlength="50"
              placeholder="Por ejemplo, Marta"
            />
          </div>
          <div class="field">
            <label for="email"
              >Correo para recibir el enlace
              <span class="font-normal text-muted">(opcional)</span></label
            ><input
              id="email"
              name="email"
              type="email"
              placeholder="Por ejemplo, marta@viernes.example"
              aria-describedby="email-help"
            />
            <p class="mt-2 text-xs leading-relaxed text-muted" id="email-help">
              Demo local: todavía no se enviará ningún correo. Si escribes una dirección, se
              descartará.
            </p>
          </div>
          <button class="primary w-full bg-action" type="submit">
            Ver confirmación de ejemplo
          </button>
        </form>
      </section>
    </div>
  `,
})
export class CreatePage {
  private readonly router = inject(Router);
  protected showPreview(event: Event): void {
    event.preventDefault();
    void this.router.navigateByUrl('/_preview/confirmacion');
  }
}
