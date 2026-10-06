import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MailAttemptTracker } from './mail-attempt-tracker';

const POLL_MS = 2000;
const GIVE_UP_MS = 35 * 60 * 1000;

@Component({
  selector: 'app-mail-attempt-notice',
  template: `
    @if (progress() && context() === 'confirmation') {
      @if (state() === 'pending') {
        <p class="confirmation-mail-note" role="status">
          Estamos enviando el enlace por correo. Puedes entrar al equipo sin esperar.
        </p>
      } @else if (state() === 'succeeded') {
        <p class="confirmation-mail-note" role="status">
          El correo con el enlace se ha enviado. Puede tardar unos minutos en llegar.
        </p>
      }
    }
    @if (failedVisible()) {
      <div class="mail-status" role="alert" data-mail-failed>
        <strong>El equipo se ha creado, pero el correo no se pudo enviar.</strong>
        <p>
          Guarda este enlace para volver. También puedes copiarlo o compartirlo
          {{ context() === 'team' ? 'desde la cabecera' : 'con los botones de abajo' }}.
        </p>
        <span class="access-link" data-mail-failed-link>{{ accessUrl() }}</span>
        <button class="dismiss" type="button" (click)="dismiss()">Descartar aviso</button>
      </div>
    }
  `,
})
export class MailAttemptNotice implements OnInit {
  readonly teamId = input.required<string>();
  readonly accessUrl = input.required<string>();
  readonly context = input<'confirmation' | 'team'>('team');
  readonly progress = input(false);
  readonly failedVisibleChange = output<boolean>();

  private readonly tracker = inject(MailAttemptTracker);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = signal<'none' | 'pending' | 'succeeded' | 'failed'>('none');
  private readonly dismissed = signal(false);
  protected readonly failedVisible = computed(() => this.state() === 'failed' && !this.dismissed());
  private timer?: ReturnType<typeof setTimeout>;
  private startedAt = 0;
  private destroyed = false;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      clearTimeout(this.timer);
    });
    const teamId = this.teamId();
    if (!this.tracker.receipt(teamId)) return;
    this.dismissed.set(this.tracker.isDismissed(teamId));
    this.startedAt = Date.now();
    this.check();
  }

  protected dismiss(): void {
    this.tracker.dismiss(this.teamId());
    this.dismissed.set(true);
    this.failedVisibleChange.emit(false);
    setTimeout(() => document.querySelector<HTMLElement>('[data-access-url]')?.focus());
  }

  private check(): void {
    const teamId = this.teamId();
    const receipt = this.tracker.receipt(teamId);
    if (!receipt) return;
    this.tracker.status(receipt).subscribe({
      next: ({ status }) => {
        if (this.destroyed) return;
        this.state.set(status);
        if (status === 'pending') this.schedule();
        else if (status === 'succeeded') this.tracker.forget(teamId);
        else this.failedVisibleChange.emit(this.failedVisible());
      },
      error: (error: HttpErrorResponse) => {
        if (this.destroyed) return;
        if (error.status === 404 || error.status === 401) this.tracker.forget(teamId);
        else this.schedule();
      },
    });
  }

  private schedule(): void {
    if (Date.now() - this.startedAt > GIVE_UP_MS) return;
    this.timer = setTimeout(() => this.check(), POLL_MS);
  }
}
