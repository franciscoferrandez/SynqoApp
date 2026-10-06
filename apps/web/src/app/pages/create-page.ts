import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TEAM_CREATION_CONFIRMATION } from '../shared/team-flow-config';
import { TeamApi } from '../shared/team-api';
import { ArrivalIntro } from '../shared/arrival-intro';
import { MailAttemptTracker } from '../shared/mail-attempt-tracker';

@Component({
  imports: [FormsModule, ArrivalIntro],
  template: `
    <div
      class="grid grid-cols-[minmax(0,1fr)] flex-1 items-center gap-9 py-10 min-[769px]:grid-cols-[minmax(0,.9fr)_minmax(340px,1fr)] min-[769px]:gap-14 min-[769px]:py-16"
    >
      <app-arrival-intro />
      <section class="panel" aria-labelledby="create-title">
        <p class="eyebrow">Empezar</p>
        <h2 class="mt-2 text-2xl font-bold tracking-tight" id="create-title">Crea tu equipo</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Crea un espacio compartido y envía el enlace a tu equipo.
        </p>
        <form class="mt-6 space-y-5" (submit)="create($event)" autocomplete="off">
          <div class="field">
            <label for="team-name">Nombre del equipo o grupo</label
            ><input
              id="team-name"
              name="team"
              required
              [(ngModel)]="teamName"
              maxlength="50"
              [attr.aria-invalid]="fieldErrors['name'] ? true : null"
              [attr.aria-describedby]="fieldErrors['name'] ? 'team-name-error' : null"
              [placeholder]="teamPlaceholder"
              (focus)="pauseExamples()"
              (blur)="resumeExamples()"
            />
            @if (fieldErrors['name']) {
              <p id="team-name-error" class="identity-error">{{ fieldErrors['name'] }}</p>
            }
          </div>
          <div class="field">
            <label for="participant-name">Nombre del primer participante</label
            ><input
              id="participant-name"
              name="participant"
              required
              [(ngModel)]="participantName"
              maxlength="50"
              [attr.aria-invalid]="fieldErrors['firstParticipantName'] ? true : null"
              [attr.aria-describedby]="
                fieldErrors['firstParticipantName'] ? 'participant-name-error' : null
              "
              [placeholder]="participantPlaceholder"
              (focus)="pauseExamples()"
              (blur)="resumeExamples()"
            />
            @if (fieldErrors['firstParticipantName']) {
              <p id="participant-name-error" class="identity-error">
                {{ fieldErrors['firstParticipantName'] }}
              </p>
            }
          </div>
          <div class="field">
            <label for="email"
              >Correo para recibir el enlace
              <span class="font-normal text-muted">(opcional)</span></label
            ><input
              id="email"
              name="email"
              type="email"
              [(ngModel)]="email"
              [placeholder]="emailPlaceholder"
              (focus)="pauseExamples()"
              (blur)="resumeExamples()"
              autocomplete="email"
              inputmode="email"
              maxlength="254"
              [attr.aria-invalid]="fieldErrors['email'] ? true : null"
              [attr.aria-describedby]="
                fieldErrors['email'] ? 'email-help email-error' : 'email-help'
              "
            />
            <p class="mt-2 text-xs leading-relaxed text-muted" id="email-help">
              Solo se usará para enviarte el enlace de acceso al equipo.
            </p>
            @if (fieldErrors['email']) {
              <p id="email-error" class="identity-error">{{ fieldErrors['email'] }}</p>
            }
          </div>
          <button class="primary w-full bg-action" type="submit" [disabled]="busy">
            {{ busy ? 'Creando…' : 'Crear equipo' }}
          </button>
        </form>
        @if (error) {
          <p class="text-sm text-red-700" role="alert">{{ error }}</p>
        }
      </section>
    </div>
  `,
})
export class CreatePage implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly api = inject(TeamApi);
  private readonly mailAttempts = inject(MailAttemptTracker);
  private readonly showConfirmation = inject(TEAM_CREATION_CONFIRMATION);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected teamPlaceholder = '';
  protected participantPlaceholder = '';
  protected emailPlaceholder = '';
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private exampleTimeout?: ReturnType<typeof setTimeout>;
  private blinkInterval?: ReturnType<typeof setInterval>;
  private scheduledCallback: (() => void) | null = null;
  private scheduledAt = 0;
  private remainingDelay = 0;
  private examplesDisabled = false;
  private examplesPaused = false;
  private cursorVisible = true;
  private teamExample = '';
  private participantExample = '';
  private emailExample = '';
  private teamCursor = false;
  private participantCursor = false;
  private emailCursor = false;
  private lastTeam = -1;
  private static readonly exampleTeams = [
    'Solteros contra casados',
    'Saturday night party',
    'Synqo IT Crowd Teambuilding',
    'Los del último tren',
    'La cena que nunca llega',
    'Martes de pizza y caos',
    'Los que siempre dicen quizá',
    'Plan B: más tapas',
    'Ensayo con final feliz',
    'La banda del bis',
    'Comité de croquetas',
    'Los domingos sin despertador',
    'Operación escapada',
    'Reunión de gente maja',
    'Los del karaoke secreto',
    'Café, ideas y milagros',
    'La liga del vermú',
    'Viernes sin excusas',
    'Los que llegan a tiempo',
    'Excursión de sofá',
  ];
  private static readonly exampleParticipants = [
    'Marta',
    'Dani',
    'Lucía',
    'Álvaro',
    'Irene',
    'Sofía',
    'Pablo',
    'Noa',
    'Alex',
    'Vero',
    'Javi',
    'Clara',
    'Raúl',
    'Nerea',
    'Hugo',
    'Aina',
    'Marcos',
    'Lola',
    'Leo',
    'Cris',
  ];
  private static readonly exampleEmailDomains = [
    'planazos.example',
    'croquetas.example',
    'viernes.example',
    'ensayos.example',
    'escapadas.example',
    'teambuilding.example',
    'tapas.example',
    'conciertos.example',
    'ideas.example',
    'karaoke.example',
  ];
  protected teamName = '';
  protected participantName = '';
  protected email = '';
  protected busy = false;
  protected error = '';
  protected fieldErrors: Record<string, string> = {};
  ngAfterViewInit(): void {
    this.reducedMotion.addEventListener('change', this.onMotionPreferenceChange);
    if (this.reducedMotion.matches) this.showStaticExamples();
    else this.beginExample();
  }
  ngOnDestroy(): void {
    this.clearTimers();
    this.reducedMotion.removeEventListener('change', this.onMotionPreferenceChange);
  }
  protected pauseExamples(): void {
    if (this.examplesDisabled) {
      this.clearExamplePlaceholders();
      return;
    }
    if (this.examplesPaused) return;
    this.examplesPaused = true;
    if (this.scheduledCallback) this.remainingDelay = Math.max(0, this.scheduledAt - Date.now());
    this.clearTimers();
    this.clearExamplePlaceholders();
    this.changeDetector.markForCheck();
  }
  protected resumeExamples(): void {
    setTimeout(() => {
      if (this.hasFocusedField()) return;
      if (this.examplesDisabled) {
        this.showStaticExamples();
        return;
      }
      if (!this.examplesPaused) return;
      this.examplesPaused = false;
      this.renderExamples();
      this.startBlink();
      if (this.scheduledCallback) this.scheduleExample(this.scheduledCallback, this.remainingDelay);
    });
  }
  private readonly onMotionPreferenceChange = (event: MediaQueryListEvent): void => {
    if (event.matches) {
      this.showStaticExamples();
      return;
    }
    this.examplesDisabled = false;
    this.examplesPaused = this.hasFocusedField();
    this.beginExample();
  };
  private hasFocusedField(): boolean {
    return ['team-name', 'participant-name', 'email'].includes(
      (document.activeElement as HTMLElement | null)?.id ?? '',
    );
  }
  private clearExamplePlaceholders(): void {
    this.teamPlaceholder = '';
    this.participantPlaceholder = '';
    this.emailPlaceholder = '';
    this.changeDetector.markForCheck();
  }
  private showStaticExamples(): void {
    this.examplesDisabled = true;
    this.clearTimers();
    this.scheduledCallback = null;
    this.teamCursor = this.participantCursor = this.emailCursor = false;
    if (this.hasFocusedField()) this.clearExamplePlaceholders();
    else {
      this.teamPlaceholder = 'Por ejemplo, Amigos del viernes';
      this.participantPlaceholder = 'Por ejemplo, Marta';
      this.emailPlaceholder = 'Por ejemplo, marta@viernes.example';
      this.changeDetector.markForCheck();
    }
  }
  private scheduleExample(next: () => void, delay: number): void {
    this.scheduledCallback = next;
    this.remainingDelay = delay;
    clearTimeout(this.exampleTimeout);
    if (this.examplesPaused || this.examplesDisabled) return;
    this.scheduledAt = Date.now() + delay;
    this.exampleTimeout = setTimeout(() => {
      this.scheduledCallback = null;
      this.remainingDelay = 0;
      next();
    }, delay);
  }
  private startBlink(): void {
    clearInterval(this.blinkInterval);
    if (
      !this.examplesPaused &&
      !this.examplesDisabled &&
      (this.teamCursor || this.participantCursor || this.emailCursor)
    ) {
      this.blinkInterval = setInterval(() => {
        this.cursorVisible = !this.cursorVisible;
        this.renderExamples();
      }, 460);
    }
  }
  private renderExamples(): void {
    if (this.examplesPaused) {
      this.clearExamplePlaceholders();
      return;
    }
    this.teamPlaceholder = this.teamExample + (this.teamCursor && this.cursorVisible ? '_' : '');
    this.participantPlaceholder =
      this.participantExample + (this.participantCursor && this.cursorVisible ? '_' : '');
    this.emailPlaceholder = this.emailExample + (this.emailCursor && this.cursorVisible ? '_' : '');
    this.changeDetector.markForCheck();
  }
  private chooseExample(): { team: string; participant: string; email: string } {
    const teamIndex = Math.floor(Math.random() * CreatePage.exampleTeams.length);
    const selectedTeam =
      teamIndex === this.lastTeam ? (teamIndex + 1) % CreatePage.exampleTeams.length : teamIndex;
    this.lastTeam = selectedTeam;
    const participant =
      CreatePage.exampleParticipants[
        Math.floor(Math.random() * CreatePage.exampleParticipants.length)
      ];
    const mailbox = participant
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const domain =
      CreatePage.exampleEmailDomains[
        Math.floor(Math.random() * CreatePage.exampleEmailDomains.length)
      ];
    return {
      team: CreatePage.exampleTeams[selectedTeam],
      participant,
      email: `${mailbox}@${domain}`,
    };
  }
  private beginExample(): void {
    if (this.examplesDisabled || this.examplesPaused) return;
    const example = this.chooseExample();
    this.teamExample = this.participantExample = this.emailExample = '';
    this.teamCursor = true;
    this.participantCursor = this.emailCursor = false;
    this.cursorVisible = true;
    this.renderExamples();
    this.startBlink();
    const typeTeam = (position: number): void => {
      if (this.examplesDisabled) return;
      this.teamExample = example.team.slice(0, position);
      this.renderExamples();
      if (position < example.team.length) this.scheduleExample(() => typeTeam(position + 1), 85);
      else {
        this.participantCursor = true;
        this.renderExamples();
        this.scheduleExample(() => typeParticipant(0), 430);
      }
    };
    const typeParticipant = (position: number): void => {
      if (this.examplesDisabled) return;
      this.participantExample = example.participant.slice(0, position);
      this.renderExamples();
      if (position < example.participant.length)
        this.scheduleExample(() => typeParticipant(position + 1), 110);
      else {
        this.emailCursor = true;
        this.renderExamples();
        this.scheduleExample(() => typeEmail(0), 430);
      }
    };
    const typeEmail = (position: number): void => {
      if (this.examplesDisabled) return;
      this.emailExample = example.email.slice(0, position);
      this.renderExamples();
      if (position < example.email.length) this.scheduleExample(() => typeEmail(position + 1), 78);
      else this.scheduleExample(eraseExamples, 3000);
    };
    const eraseExamples = (): void => {
      if (this.examplesDisabled) return;
      clearInterval(this.blinkInterval);
      this.teamCursor = this.participantCursor = this.emailCursor = false;
      const erase = (): void => {
        if (this.examplesDisabled) return;
        this.teamExample = this.teamExample.slice(0, -1);
        this.participantExample = this.participantExample.slice(0, -1);
        this.emailExample = this.emailExample.slice(0, -1);
        this.renderExamples();
        if (this.teamExample || this.participantExample || this.emailExample)
          this.scheduleExample(erase, 55);
        else this.scheduleExample(() => this.beginExample(), 350);
      };
      erase();
    };
    this.scheduleExample(() => typeTeam(1), 450);
  }
  private clearTimers(): void {
    clearTimeout(this.exampleTimeout);
    clearInterval(this.blinkInterval);
  }
  protected create(event: Event): void {
    event.preventDefault();
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    this.fieldErrors = {};
    this.api.create(this.teamName, this.participantName, this.email.trim()).subscribe({
      next: (created) => {
        this.api.recentCreation = created;
        if (created.mailAttempt)
          this.mailAttempts.remember(created.id, created.mailAttempt.receipt);
        localStorage.setItem(`synqo-participant-${created.id}`, created.firstParticipant.id);
        if (this.showConfirmation) void this.router.navigateByUrl('/confirmacion');
        else window.location.assign(created.accessUrl);
      },
      error: (err: HttpErrorResponse) => {
        const violations: { propertyPath: string; message: string }[] = Array.isArray(
          err.error?.violations,
        )
          ? err.error.violations
          : [];
        const onlyEmail =
          violations.length > 0 &&
          violations.every((violation) => violation.propertyPath === 'email');
        this.error =
          err.status === 422
            ? onlyEmail
              ? 'Revisa el correo e inténtalo de nuevo.'
              : 'Revisa los nombres e inténtalo de nuevo.'
            : 'No se pudo crear el equipo. Inténtalo otra vez.';
        if (err.status === 422 && Array.isArray(err.error?.violations)) {
          for (const violation of err.error.violations) {
            const field = violation.propertyPath;
            if (field === 'name' || field === 'firstParticipantName' || field === 'email') {
              this.fieldErrors[field] = [this.fieldErrors[field], violation.message]
                .filter(Boolean)
                .join(' ');
            }
          }
          const firstField = this.fieldErrors['name']
            ? 'team-name'
            : this.fieldErrors['firstParticipantName']
              ? 'participant-name'
              : this.fieldErrors['email']
                ? 'email'
                : '';
          if (firstField) document.getElementById(firstField)?.focus();
        }
        this.busy = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
