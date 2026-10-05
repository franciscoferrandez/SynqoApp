import { AfterViewInit, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-link-message',
  template: `
    <div class="link-message-shell">
      <section class="panel link-message-card" aria-labelledby="message-title">
        <div class="link-message-symbol" aria-hidden="true">
          {{ state === 'expired' ? '⌛' : '?' }}
        </div>
        <p class="eyebrow link-message-eyebrow">Enlace de equipo</p>
        @switch (state) {
          @case ('expired') {
            <h1 #messageTitle id="message-title" tabindex="-1">Este equipo ha caducado</h1>
            <p>Ya no se puede acceder a este equipo ni recuperar su contenido.</p>
          }
          @case ('auth') {
            <h1 #messageTitle id="message-title" tabindex="-1">Se requiere el enlace de acceso</h1>
            <p>Abre el enlace completo para entrar en este equipo.</p>
          }
          @default {
            <h1 #messageTitle id="message-title" tabindex="-1">No encontramos este equipo</h1>
            <p>
              No encontramos ningún equipo para este enlace. Comprueba que lo hayas abierto
              completo.
            </p>
          }
        }
      </section>
    </div>
  `,
})
export class LinkMessagePage implements AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  @Input() kind?: 'expired' | 'missing' | 'auth';
  @ViewChild('messageTitle') private messageTitle?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    this.messageTitle?.nativeElement.focus();
  }

  protected get state(): 'expired' | 'missing' | 'auth' {
    const value = this.kind ?? this.route.snapshot.data['kind'];
    return value === 'expired' || value === 'auth' ? value : 'missing';
  }
}
