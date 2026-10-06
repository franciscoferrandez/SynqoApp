import { Component } from '@angular/core';

@Component({
  selector: 'app-arrival-intro',
  template: `
    <section class="min-w-0 wrap-anywhere" aria-labelledby="intro-title">
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
        <li class="rounded-full bg-soft px-3 py-2 text-sm font-semibold">Disponibilidad por día</li>
        <li class="rounded-full bg-soft px-3 py-2 text-sm font-semibold">Decisiones claras</li>
      </ul>
    </section>
  `,
})
export class ArrivalIntro {}
