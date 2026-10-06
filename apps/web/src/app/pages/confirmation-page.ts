import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrivalIntro } from '../shared/arrival-intro';
import { MailAttemptNotice } from '../shared/mail-attempt-notice';
import { TeamApi } from '../shared/team-api';

@Component({
  imports: [RouterLink, ArrivalIntro, MailAttemptNotice],
  template: `
    <div
      class="grid grid-cols-[minmax(0,1fr)] flex-1 items-center gap-9 py-10 min-[769px]:grid-cols-[minmax(0,.9fr)_minmax(340px,1fr)] min-[769px]:gap-14 min-[769px]:py-16"
    >
      <app-arrival-intro />
      @if (team) {
        <section class="panel confirmation-panel" aria-labelledby="confirmation-title">
          <p class="eyebrow">Equipo creado</p>
          <h2 #confirmationTitle id="confirmation-title" tabindex="-1">
            {{ team.name }}
          </h2>
          <p class="confirmation-person">
            Primer participante: {{ team.firstParticipant.name }}. Ya podéis empezar a coordinaros.
          </p>
          @if (team.mailAttempt) {
            <app-mail-attempt-notice
              [teamId]="team.id"
              [accessUrl]="team.accessUrl"
              context="confirmation"
              [progress]="true"
              (failedVisibleChange)="noticeVisible = $event"
            />
          }
          <div class="confirmation-link-field" [hidden]="noticeVisible">
            <p id="team-link-label">Enlace de acceso</p>
            <div
              class="confirmation-link"
              tabindex="0"
              aria-labelledby="team-link-label"
              data-access-url
            >
              {{ team.accessUrl }}
            </div>
          </div>
          <div class="confirmation-actions">
            <button class="outline" type="button" (click)="copy()">Copiar enlace</button>
            <button class="outline" type="button" [disabled]="!canShare" (click)="share()">
              Compartir
            </button>
          </div>
          <p class="confirmation-status" role="status" aria-live="polite">{{ linkStatus }}</p>
          <a class="confirmation-enter" [href]="team.accessUrl"
            >Ver el calendario del equipo <span aria-hidden="true">→</span></a
          >
        </section>
      } @else {
        <section class="panel">
          <h1 class="text-2xl font-bold">No hay una creación reciente</h1>
          <a class="primary mt-5 inline-flex" routerLink="/">Crear equipo</a>
        </section>
      }
    </div>
  `,
})
export class ConfirmationPage implements AfterViewInit {
  private readonly api = inject(TeamApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected readonly team = this.api.recentCreation;
  protected noticeVisible = false;
  protected readonly canShare = typeof navigator.share === 'function';
  protected linkStatus = '';
  @ViewChild('confirmationTitle') private confirmationTitle?: ElementRef<HTMLElement>;
  ngAfterViewInit(): void {
    this.confirmationTitle?.nativeElement.focus();
  }
  protected async copy(): Promise<void> {
    if (!this.team) return;
    try {
      await navigator.clipboard.writeText(this.team.accessUrl);
      this.linkStatus = 'Enlace copiado.';
    } catch {
      this.linkStatus = 'Selecciona y copia el enlace mostrado.';
    }
    this.changeDetector.markForCheck();
  }
  protected async share(): Promise<void> {
    if (!this.team || !navigator.share) return;
    try {
      await navigator.share({
        title: `Equipo ${this.team.name} en Synqo`,
        url: this.team.accessUrl,
      });
    } catch {
      // Cancelar el diálogo del dispositivo no cambia el equipo.
    }
  }
}
