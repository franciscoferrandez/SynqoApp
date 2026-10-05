import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TeamApi, TeamData } from '../shared/team-api';
import { LinkMessagePage } from './link-message-page';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LinkMessagePage],
  template: `
    @if (error) {
      <app-link-message [kind]="error" />
    } @else if (loadFailed) {
      <section class="panel" aria-labelledby="load-error-title">
        <h1 id="load-error-title">No se pudo cargar el equipo</h1>
        <p role="alert">Inténtalo otra vez.</p>
        <button class="primary" type="button" (click)="load()">Reintentar</button>
      </section>
    } @else if (team) {
      <div class="pt-5 sm:pt-7">
        @if (participantId) {
          <section class="team-header" aria-label="Equipo">
            <div class="min-w-0">
              <p class="eyebrow">Equipo rápido</p>
              <h1 class="team-title">{{ team.name }}</h1>
              <div class="team-meta">
                <span>Caduca: {{ expiry }}</span>
                <span
                  >{{ team.participants.length }}
                  {{ team.participants.length === 1 ? 'participante' : 'participantes' }}</span
                >
              </div>
            </div>
            <div class="identity-actions-wrap">
              <span class="identity-label">Participas como</span>
              <div class="identity-actions">
                <button
                  class="identity-trigger"
                  type="button"
                  aria-haspopup="dialog"
                  data-identity-trigger
                  (click)="openIdentityDialog()"
                >
                  {{ participantName || 'Elige una identidad' }} <span aria-hidden="true">▾</span>
                </button>
                <button
                  class="link-action"
                  type="button"
                  aria-label="Copiar enlace"
                  title="Copiar enlace"
                  (click)="copy()"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="8" y="8" width="11" height="11" rx="2" />
                    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                  </svg>
                </button>
                <button
                  class="link-action"
                  type="button"
                  aria-label="Compartir enlace"
                  title="Compartir enlace"
                  [disabled]="!canShare"
                  (click)="share()"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 15V3m0 0L7 8m5-5 5 5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
                  </svg>
                </button>
              </div>
              <p class="link-feedback" role="status" aria-live="polite">{{ linkFeedback }}</p>
            </div>
          </section>
          <nav class="team-tabs" aria-label="Secciones del equipo">
            <a
              class="section-tab"
              routerLink="calendario"
              preserveFragment
              routerLinkActive="section-tab-active"
              ariaCurrentWhenActive="page"
              >Calendario</a
            >
            <a
              class="section-tab"
              routerLink="consultas"
              preserveFragment
              routerLinkActive="section-tab-active"
              ariaCurrentWhenActive="page"
              >Consultas</a
            >
          </nav>
          <router-outlet />
        }
        @if (choose) {
          <dialog
            #identityDialog
            class="identity-dialog"
            aria-labelledby="identity-title"
            (cancel)="closeIdentityDialog($event)"
          >
            <div class="identity-dialog-head">
              <div>
                <p class="eyebrow">Identidad del equipo</p>
                <h2 id="identity-title">¿Con quién participas?</h2>
              </div>
              <button
                class="dialog-close"
                type="button"
                aria-label="Cerrar selección de identidad"
                (click)="closeIdentityDialog()"
              >
                ×
              </button>
            </div>
            <p class="identity-help">
              Selecciona una identidad existente o crea otra para este equipo.
            </p>
            <div class="identity-list" aria-label="Participantes existentes">
              @for (person of team.participants; track person.id) {
                <button
                  class="identity-option"
                  type="button"
                  [attr.autofocus]="$first ? '' : null"
                  (click)="select(person.id, person.name)"
                >
                  {{ person.name }}
                </button>
              }
            </div>
            <form class="identity-create" (submit)="add($event)">
              <label for="new-name">Crear nueva identidad</label>
              <input
                id="new-name"
                type="text"
                [attr.autofocus]="team.participants.length === 0 ? '' : null"
                maxlength="50"
                [attr.aria-invalid]="identityFieldError ? true : null"
                [attr.aria-describedby]="identityFieldError ? 'identity-error' : null"
                required
                autocomplete="off"
                [value]="newName"
                (input)="newName = $any($event.target).value"
                placeholder="Nombre de participante"
              />
              @if (identityError) {
                <p id="identity-error" class="identity-error" role="alert">{{ identityError }}</p>
              }
              <button class="primary identity-create-button" type="submit">
                Crear y participar
              </button>
            </form>
          </dialog>
        }
      </div>
    }
  `,
})
export class TeamLayout implements OnInit {
  private readonly api = inject(TeamApi);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected team?: TeamData;
  protected error: '' | 'expired' | 'missing' | 'auth' = '';
  protected loadFailed = false;
  protected identityFieldError = false;
  protected choose = false;
  protected newName = '';
  protected identityError = '';
  protected participantName = '';
  protected expiry = '';
  protected readonly canShare = typeof navigator.share === 'function';
  protected linkFeedback = '';
  protected participantId = '';
  ngOnInit(): void {
    this.load();
  }
  protected load(): void {
    this.loadFailed = false;
    this.error = '';
    this.api.current().subscribe({
      next: (team) => {
        this.team = team;
        this.expiry = this.formatExpiry(team.expiresAt, team.timeZone);
        this.participantId = localStorage.getItem(`synqo-participant-${team.id}`) ?? '';
        const current = team.participants.find((p) => p.id === this.participantId);
        this.participantName = current?.name ?? '';
        if (!current) {
          this.participantId = '';
          localStorage.removeItem(`synqo-participant-${team.id}`);
          this.openIdentityDialog();
        }
        this.changeDetector.markForCheck();
      },
      error: (e: HttpErrorResponse) => {
        if (!this.handleAccessError(e)) this.loadFailed = true;
        this.changeDetector.markForCheck();
      },
    });
  }
  @ViewChild('identityDialog')
  set identityDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }
  protected openIdentityDialog(): void {
    this.identityError = '';
    this.identityFieldError = false;
    this.choose = true;
    this.changeDetector.markForCheck();
  }
  protected closeIdentityDialog(event?: Event): void {
    event?.preventDefault();
    this.choose = false;
    if (!this.participantId) void this.router.navigateByUrl('/');
    else setTimeout(() => document.querySelector<HTMLElement>('[data-identity-trigger]')?.focus());
    this.changeDetector.markForCheck();
  }
  protected select(id: string, name: string): void {
    if (!this.team) return;
    localStorage.setItem(`synqo-participant-${this.team.id}`, id);
    this.participantId = id;
    this.participantName = name;
    this.choose = false;
    setTimeout(() => document.querySelector<HTMLElement>('[data-identity-trigger]')?.focus());
  }
  protected add(event: Event): void {
    event.preventDefault();
    this.identityError = '';
    this.identityFieldError = false;
    this.api.addParticipant(this.newName).subscribe({
      next: ({ participant, expiresAt }) => {
        if (!this.team) return;
        this.team.participants.push(participant);
        this.team.expiresAt = expiresAt;
        this.expiry = this.formatExpiry(expiresAt, this.team.timeZone);
        this.select(participant.id, participant.name);
        this.newName = '';
        this.changeDetector.markForCheck();
      },
      error: (e: HttpErrorResponse) => {
        if (this.handleAccessError(e)) {
          this.changeDetector.markForCheck();
          return;
        }
        const violations = e.status === 422 ? e.error?.violations : undefined;
        const nameViolations = Array.isArray(violations)
          ? violations.filter((v: { propertyPath: string }) => v.propertyPath === 'name')
          : [];
        this.identityFieldError = e.status === 409 || nameViolations.length > 0;
        this.identityError =
          e.status === 409
            ? 'Ese nombre ya está en uso.'
            : nameViolations.length
              ? nameViolations.map((v: { message: string }) => v.message).join(' ')
              : 'No se pudo añadir el participante. Inténtalo otra vez.';
        if (this.identityFieldError) document.getElementById('new-name')?.focus();
        this.changeDetector.markForCheck();
      },
    });
  }
  private handleAccessError(e: HttpErrorResponse): boolean {
    if (![401, 404, 410].includes(e.status)) return false;
    this.error = e.status === 410 ? 'expired' : e.status === 404 ? 'missing' : 'auth';
    this.team = undefined;
    this.choose = false;
    return true;
  }
  private formatExpiry(expiresAt: string, timeZone: string): string {
    const options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeZone };
    try {
      const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (browserZone) {
        new Intl.DateTimeFormat(undefined, { timeZone: browserZone });
        options.timeZone = browserZone;
      }
    } catch {
      // Si el navegador no informa una zona válida se usa la del equipo.
    }
    return new Intl.DateTimeFormat(document.documentElement.lang || undefined, options).format(
      new Date(new Date(expiresAt).getTime() - 1),
    );
  }
  private accessUrl(): string {
    return new URL(`/e${location.hash}`, location.origin).href;
  }
  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.accessUrl());
      this.linkFeedback = 'Enlace copiado.';
    } catch {
      this.linkFeedback = 'No se pudo copiar el enlace.';
    }
    this.changeDetector.markForCheck();
  }
  protected async share(): Promise<void> {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: this.team?.name, url: this.accessUrl() });
    } catch {
      // Cancelar el diálogo nativo no altera el enlace.
    }
  }
}
