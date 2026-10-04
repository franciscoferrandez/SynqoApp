import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { previewTeam } from './preview-data';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="pt-8 sm:pt-10">
      <p class="eyebrow">Equipo · vista previa</p>
      <div class="panel mt-3 p-0!">
        <div class="flex flex-wrap items-start justify-between gap-5 px-5 py-6 sm:px-8">
          <div>
            <h1 class="text-3xl font-bold tracking-tight">{{ team.name }}</h1>
            <p class="mt-2 text-sm text-muted">{{ team.expiry }}</p>
          </div>
          <div class="rounded-xl bg-soft px-4 py-3 text-sm">
            <span class="block text-xs font-semibold text-muted">Participante de ejemplo</span
            ><strong class="mt-1 block">{{ team.participant }}</strong>
          </div>
        </div>
        <p class="mx-5 rounded-xl border border-line bg-soft px-4 py-3 text-sm text-muted sm:mx-8">
          Vista ilustrativa: no existe un enlace de acceso para copiar o compartir.
        </p>
        <nav
          class="mt-5 flex gap-1 border-b border-line px-5 sm:px-8"
          aria-label="Secciones del equipo"
        >
          <a
            class="section-tab"
            routerLink="calendario"
            routerLinkActive="section-tab-active"
            ariaCurrentWhenActive="page"
            >Calendario</a
          >
          <a
            class="section-tab"
            routerLink="consultas"
            routerLinkActive="section-tab-active"
            ariaCurrentWhenActive="page"
            >Consultas</a
          >
        </nav>
        <div class="px-5 py-7 sm:px-8 sm:py-9"><router-outlet /></div>
      </div>
    </div>
  `,
})
export class TeamLayout {
  protected readonly team = previewTeam;
}
