import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ConsultationDetail, Participant, TeamApi, TeamEventSummary } from '../shared/team-api';
import { TeamLayout } from './team-layout';

type Decision = 'resolved' | 'rejected';

@Component({
  selector: 'app-consultation-detail',
  imports: [RouterLink],
  template: `
    <div class="consultation-detail-view">
      <button #backButton class="consultation-back" type="button" (click)="back.emit()">
        ← Volver a Consultas
      </button>
      @if (loading) {
        <p role="status">Cargando consulta…</p>
      } @else if (loadError) {
        <div class="panel" role="alert">
          <p>No se pudo cargar la consulta.</p>
          <button class="outline" type="button" (click)="load()">Reintentar</button>
        </div>
      } @else if (consultation; as item) {
        <div class="panel">
          <div class="consultation-detail-head">
            <div>
              <p class="eyebrow">
                {{ item.type === 'date' ? 'Consulta de fechas' : 'Consulta de opciones' }}
              </p>
              <h2>{{ item.title }}</h2>
              @if (item.state === 'open') {
                <p>
                  Elige una o varias opciones. Puedes cambiar o retirar tu voto mientras siga
                  abierta.
                </p>
              }
            </div>
            <span
              class="badge"
              [class.open]="item.state === 'open'"
              [class.resolved]="item.state === 'resolved'"
              [class.rejected]="item.state === 'rejected'"
            >
              {{
                item.state === 'open'
                  ? 'Abierta'
                  : item.state === 'resolved'
                    ? 'Resuelta'
                    : 'Rechazada'
              }}
            </span>
          </div>
          @if (item.state === 'open' && item.type === 'date') {
            <section aria-label="Evento vinculado">
              @if (item.event) {
                <p>
                  Evento vinculado:
                  <a [routerLink]="['/e/eventos', item.event.id]" preserveFragment>{{
                    item.event.title
                  }}</a>
                </p>
              } @else {
                <p>Sin evento vinculado.</p>
              }
              <button
                #eventButton
                class="outline"
                type="button"
                [disabled]="saving"
                (click)="openEventEditor()"
              >
                {{ item.event ? 'Cambiar evento' : 'Elegir evento' }}
              </button>
              @if (item.event) {
                <button
                  class="outline"
                  type="button"
                  [disabled]="saving"
                  (click)="openEventEditor(true)"
                >
                  Quitar vínculo
                </button>
              }
            </section>
          }
          @if (item.resolution; as resolution) {
            <div class="consultation-resolution-summary">
              <strong>{{
                item.state === 'resolved' ? 'Opciones aceptadas' : 'Consulta rechazada'
              }}</strong>
              @if (item.state === 'resolved') {
                <p>{{ acceptedSummary(item) }}</p>
              } @else {
                <p>Ninguna opción aceptada.</p>
              }
              @if (item.event) {
                <p class="calendar-note">
                  Evento vinculado:
                  <a [routerLink]="['/e/eventos', item.event.id]" preserveFragment>{{
                    item.event.title
                  }}</a>
                </p>
              }
              <small>Resolución registrada por {{ resolution.participant.name }}.</small>
            </div>
          }
          <div class="consultation-vote-grid">
            @for (option of item.options; track option.id) {
              <div
                class="consultation-vote-option"
                role="group"
                [attr.aria-label]="'Opción ' + optionLabel(option)"
                [attr.tabindex]="item.state === 'open' && team.participantId ? 0 : null"
                [class.interactive]="item.state === 'open' && !!team.participantId"
                [class.selected]="hasOwnVote(option.id)"
                [class.accepted]="item.resolution?.acceptedOptionIds?.includes(option.id)"
                (click)="activateVoteCard($event, option.id)"
                (keydown.enter)="activateVoteCardKey($event, option.id)"
                (keydown.space)="activateVoteCardKey($event, option.id)"
              >
                @if (item.state === 'open' && team.participantId) {
                  <label class="consultation-vote-label">
                    <input
                      type="checkbox"
                      [checked]="hasOwnVote(option.id)"
                      [disabled]="saving"
                      (change)="setVote(option.id, $any($event.target).checked)"
                    />
                    <span>{{ optionLabel(option) }}</span>
                  </label>
                } @else {
                  <strong>{{ optionLabel(option) }}</strong>
                }
                <div class="consultation-vote-tally">
                  <strong>{{ option.count }} {{ option.count === 1 ? 'voto' : 'votos' }}</strong>
                  @if (option.voters.length) {
                    <div class="consultation-voter-list">
                      @for (voter of visibleVoters(option.id); track voter.id; let last = $last) {
                        <span [class.self]="voter.id === team.participantId"
                          >{{ voter.id === team.participantId ? 'Tú' : voter.name
                          }}{{ last ? '' : ', ' }}</span
                        >
                      }
                      @if (option.voters.length > 3) {
                        <button
                          class="consultation-more-voters"
                          type="button"
                          [attr.aria-expanded]="expanded.has(option.id)"
                          (click)="toggleVoters(option.id)"
                        >
                          {{
                            expanded.has(option.id)
                              ? 'Mostrar menos'
                              : '(+' + (option.voters.length - 3) + ')'
                          }}
                        </button>
                      }
                    </div>
                  }
                  @if (item.resolution?.acceptedOptionIds?.includes(option.id)) {
                    <small class="consultation-accepted-label">Aceptada</small>
                  }
                </div>
              </div>
            }
          </div>
          @if (voteError) {
            <div class="consultation-save-error" role="alert">
              <p>No se pudo guardar tu voto. Hemos recuperado tu selección anterior.</p>
              <button type="button" (click)="retryVote()">Reintentar</button>
            </div>
          }
          @if (item.state === 'open') {
            <div class="consultation-vote-note">
              <button
                #resolveButton
                class="outline"
                type="button"
                [disabled]="saving"
                (click)="openResolution()"
              >
                Resolver consulta
              </button>
              <span>La resolución requiere confirmación y cierra la votación.</span>
            </div>
          }
        </div>
      }
      <span class="sr-only" role="status" aria-live="polite">{{ message }}</span>
    </div>

    @if (showResolution && consultation; as item) {
      <dialog
        #resolutionDialog
        class="consultation-dialog consultation-resolution-dialog"
        aria-labelledby="resolution-title"
        (cancel)="closeResolution($event)"
      >
        <div class="dialog-head">
          <div>
            <p class="eyebrow">Resolución</p>
            <h2 id="resolution-title">Resolver consulta</h2>
          </div>
          <button
            class="dialog-close"
            type="button"
            aria-label="Cerrar resolución"
            (click)="closeResolution()"
          >
            ×
          </button>
        </div>
        <p>Resolverás como {{ team.activeParticipantName }}.</p>
        @if (resolutionLoading) {
          <p role="status">Comprobando el estado actual…</p>
        }
        @if (resolveError) {
          <p class="field-error" role="alert">{{ resolveError }}</p>
          @if (!confirming) {
            <button class="outline" type="button" (click)="refreshResolution()">Reintentar</button>
          }
        }
        @if (!confirming) {
          @if (item.type === 'date') {
            <label for="resolution-event">Evento (opcional)</label>
            <select
              id="resolution-event"
              class="text-query-input"
              [value]="draftEventId ?? ''"
              [disabled]="
                eventsLoading || resolutionLoading || resolutionEvent?.status === 'rejected'
              "
              (change)="selectResolutionEvent($any($event.target).value)"
            >
              <option value="">Sin evento</option>
              @if (item.event && !currentEventIsEligible) {
                <option [value]="item.event.id">{{ item.event.title }} (vínculo actual)</option>
              }
              @for (event of eligibleEvents; track event.id) {
                <option [value]="event.id">{{ event.title }}</option>
              }
            </select>
            @if (eventsLoading) {
              <p role="status">Cargando eventos…</p>
            }
            @if (eventsError) {
              <p role="alert">No se pudieron cargar los eventos.</p>
              <button type="button" class="outline" (click)="loadEvents()">
                Reintentar eventos
              </button>
            } @else if (!eventsLoading && !eligibleEvents.length) {
              <p>No hay eventos elegibles. Puedes continuar sin vínculo.</p>
            }
          }
          <p>
            {{
              draftEventId
                ? 'Elige exactamente una fecha para el evento vinculado.'
                : 'Elige las opciones aceptadas. La selección empieza vacía y es independiente de tu voto.'
            }}
          </p>
          <div class="consultation-vote-grid">
            @for (option of item.options; track option.id) {
              <div
                class="consultation-vote-option interactive"
                role="group"
                [attr.aria-label]="'Opción ' + optionLabel(option)"
                tabindex="0"
                [class.selected]="accepted.has(option.id)"
                (click)="activateAcceptedCard($event, option.id)"
                (keydown.enter)="activateAcceptedCardKey($event, option.id)"
                (keydown.space)="activateAcceptedCardKey($event, option.id)"
              >
                <label class="consultation-vote-label">
                  <input
                    type="checkbox"
                    [checked]="accepted.has(option.id)"
                    (change)="toggleAccepted(option.id)"
                  />
                  <span>{{ optionLabel(option) }}</span>
                </label>
                <div class="consultation-vote-tally">
                  <strong>{{ option.count }} {{ option.count === 1 ? 'voto' : 'votos' }}</strong>
                  <div class="consultation-voter-list">
                    {{ voterNames(option.id) }}
                    @if (option.voters.length > 3) {
                      <button
                        class="consultation-more-voters"
                        type="button"
                        [attr.aria-expanded]="expanded.has(option.id)"
                        (click)="toggleVoters(option.id)"
                      >
                        {{
                          expanded.has(option.id)
                            ? 'Mostrar menos'
                            : '(+' + (option.voters.length - 3) + ')'
                        }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
          <div class="consultation-resolve-actions">
            <button class="outline" type="button" (click)="closeResolution()">Cancelar</button>
            <button
              class="outline danger"
              type="button"
              [disabled]="resolutionLoading"
              (click)="beginConfirmation('rejected')"
            >
              Rechazar consulta
            </button>
            <button
              class="primary"
              type="button"
              [disabled]="
                accepted.size === 0 || resolutionLoading || (!!draftEventId && accepted.size !== 1)
              "
              (click)="beginConfirmation('resolved')"
            >
              {{
                resolutionEvent?.status === 'rejected'
                  ? 'Desvincular y resolver aceptando fecha'
                  : 'Aceptar seleccionadas'
              }}
            </button>
          </div>
          @if (resolutionEvent?.status === 'rejected') {
            <p role="alert">
              El evento está rechazado. Puedes desvincularlo y aceptar una fecha, o rechazar la
              consulta conservando el vínculo histórico.
            </p>
          }
        } @else {
          <div class="consultation-resolution-summary">
            <strong>{{
              decision === 'resolved' ? 'Aceptar opciones' : 'Rechazar consulta'
            }}</strong>
            <p>
              {{ decision === 'resolved' ? selectedSummary() : 'Ninguna opción será aceptada.' }}
            </p>
          </div>
          @if (decision === 'resolved' && resolutionEvent) {
            @if (resolutionEvent.status === 'definitive') {
              <p role="alert">
                El evento ya tiene fecha definitiva. Resolver esta consulta no cambiará su fecha. El
                vínculo se conservará.
              </p>
            } @else if (resolutionEvent.status === 'rejected') {
              <p>El evento se desvinculará y la consulta se resolverá aceptando una fecha.</p>
            } @else {
              <p>
                La fecha aceptada quedará asignada como definitiva al evento
                {{ resolutionEvent.title }}.
              </p>
            }
          }
          <p>Al confirmar, la consulta dejará de admitir votos y no se reabrirá.</p>
          <div class="consultation-resolve-actions">
            <button
              class="outline"
              type="button"
              [disabled]="submitting"
              (click)="confirming = false"
            >
              Volver
            </button>
            <button
              class="primary"
              type="button"
              [disabled]="submitting"
              (click)="confirmResolution()"
            >
              {{ submitting ? 'Guardando…' : 'Confirmar resolución' }}
            </button>
          </div>
        }
      </dialog>
    }
    @if (showEventEditor) {
      <dialog
        #eventDialog
        class="consultation-dialog consultation-confirmation"
        aria-labelledby="consultation-event-title"
        (cancel)="closeEventEditor($event)"
      >
        <h2 id="consultation-event-title">Evento vinculado</h2>
        <label for="consultation-event">Evento (opcional)</label>
        <select
          id="consultation-event"
          class="text-query-input"
          [value]="draftEventId ?? ''"
          [disabled]="eventsLoading || eventSaving"
          (change)="draftEventId = $any($event.target).value || null"
        >
          <option value="">Sin evento</option>
          @if (consultation?.event && !currentEventIsEligible) {
            <option [value]="consultation!.event!.id">
              {{ consultation!.event!.title }} (vínculo actual)
            </option>
          }
          @for (event of eligibleEvents; track event.id) {
            <option [value]="event.id">{{ event.title }}</option>
          }
        </select>
        @if (eventsLoading) {
          <p role="status">Cargando eventos…</p>
        }
        @if (eventsError) {
          <p role="alert">No se pudieron cargar los eventos.</p>
          <button class="outline" type="button" (click)="loadEvents()">Reintentar</button>
        } @else if (!eventsLoading && !eligibleEvents.length) {
          <p>No hay eventos elegibles. Puedes continuar sin vínculo.</p>
        }
        @if (eventError) {
          <p role="alert">{{ eventError }}</p>
        }
        <div class="text-query-actions">
          <button
            type="button"
            class="outline"
            [disabled]="eventSaving"
            (click)="closeEventEditor()"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="primary"
            [disabled]="eventsLoading || eventSaving"
            (click)="saveEvent()"
          >
            {{ eventSaving ? 'Guardando…' : 'Guardar vínculo' }}
          </button>
        </div>
      </dialog>
    }
  `,
})
export class ConsultationDetailPage implements OnInit, OnDestroy {
  @Input({ required: true }) consultationId!: string;
  @Output() readonly back = new EventEmitter<void>();
  @Output() readonly updated = new EventEmitter<void>();
  @ViewChild('backButton') private backButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('resolveButton') private resolveButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('eventButton') private eventButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('eventDialog')
  set eventDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }
  @ViewChild('resolutionDialog')
  set resolutionDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }

  readonly team = inject(TeamLayout);
  private readonly api = inject(TeamApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  consultation?: ConsultationDetail;
  private confirmed?: ConsultationDetail;
  loading = true;
  loadError = false;
  saving = false;
  voteError = false;
  message = '';
  expanded = new Set<string>();
  private retry?: { optionId: string; selected: boolean };
  private request?: Subscription;
  showResolution = false;
  confirming = false;
  decision: Decision = 'resolved';
  accepted = new Set<string>();
  submitting = false;
  resolveError = '';
  resolutionLoading = false;
  resolutionEvent?: TeamEventSummary;
  draftEventId: string | null = null;
  eligibleEvents: TeamEventSummary[] = [];
  eventsLoading = false;
  eventsError = false;
  showEventEditor = false;
  eventSaving = false;
  eventError = '';
  private readonly subscriptions = new Subscription();
  private resolutionEventChanged = false;
  private focusEventAfterLoad = false;
  private eventFocusReturn?: HTMLElement;

  get currentEventIsEligible(): boolean {
    return this.eligibleEvents.some((event) => event.id === this.consultation?.event?.id);
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.request = this.api.consultation(this.consultationId).subscribe({
      next: (detail) => {
        this.consultation = detail;
        this.confirmed = structuredClone(detail);
        this.loading = false;
        this.changeDetector.markForCheck();
        if (this.focusEventAfterLoad) {
          this.focusEventAfterLoad = false;
          setTimeout(() => this.eventButton?.nativeElement.focus());
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.loadError = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  optionLabel(option: { text?: string; date?: string }): string {
    if (option.text !== undefined) return option.text;
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(`${option.date}T12:00:00`));
  }

  hasOwnVote(optionId: string): boolean {
    return !!this.consultation?.options
      .find((option) => option.id === optionId)
      ?.voters.some((voter) => voter.id === this.team.participantId);
  }

  visibleVoters(optionId: string): Participant[] {
    const voters =
      this.consultation?.options.find((option) => option.id === optionId)?.voters ?? [];
    const ordered = [...voters].sort((a, b) =>
      a.id === this.team.participantId
        ? -1
        : b.id === this.team.participantId
          ? 1
          : a.name.localeCompare(b.name),
    );
    return this.expanded.has(optionId) ? ordered : ordered.slice(0, 3);
  }

  voterNames(optionId: string): string {
    return this.visibleVoters(optionId)
      .map((voter) => (voter.id === this.team.participantId ? 'Tú' : voter.name))
      .join(', ');
  }

  toggleVoters(optionId: string): void {
    if (this.expanded.has(optionId)) this.expanded.delete(optionId);
    else this.expanded.add(optionId);
  }

  setVote(optionId: string, selected: boolean): void {
    if (!this.consultation || !this.confirmed || this.saving || !this.team.participantId) return;
    this.retry = { optionId, selected };
    this.voteError = false;
    const option = this.consultation.options.find((candidate) => candidate.id === optionId);
    if (!option) return;
    this.consultation = structuredClone(this.consultation);
    const optimistic = this.consultation.options.find((candidate) => candidate.id === optionId)!;
    optimistic.voters = optimistic.voters.filter((voter) => voter.id !== this.team.participantId);
    if (selected)
      optimistic.voters.push({
        id: this.team.participantId,
        name: this.team.activeParticipantName || 'Tú',
      });
    optimistic.count = optimistic.voters.length;
    this.saving = true;
    this.request = this.api
      .vote(this.consultationId, this.team.participantId, optionId, selected)
      .subscribe({
        next: ({ consultation, expiresAt }) => {
          this.confirmed = structuredClone(consultation);
          this.consultation = consultation;
          this.team.updateExpiry(expiresAt);
          this.saving = false;
          this.retry = undefined;
          this.message = selected ? 'Voto registrado.' : 'Voto retirado.';
          this.changeDetector.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.consultation = structuredClone(this.confirmed!);
          this.saving = false;
          if (this.team.handleAccessError(error)) return;
          if (error.status === 409) {
            this.voteError = false;
            this.message = 'La consulta ya está cerrada.';
            this.load();
          } else {
            this.voteError = true;
            this.message = 'No se pudo guardar tu voto. Hemos recuperado tu selección anterior.';
          }
          this.changeDetector.markForCheck();
        },
      });
  }

  activateVoteCard(event: MouseEvent, optionId: string): void {
    if (this.isNestedControl(event) || this.consultation?.state !== 'open') return;
    this.setVote(optionId, !this.hasOwnVote(optionId));
  }

  activateAcceptedCard(event: MouseEvent, optionId: string): void {
    if (!this.isNestedControl(event)) this.toggleAccepted(optionId);
  }

  activateVoteCardKey(event: Event, optionId: string): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    if (this.consultation?.state === 'open') this.setVote(optionId, !this.hasOwnVote(optionId));
  }

  activateAcceptedCardKey(event: Event, optionId: string): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    this.toggleAccepted(optionId);
  }

  private isNestedControl(event: MouseEvent): boolean {
    return event.target instanceof Element && !!event.target.closest('label, button, input');
  }

  retryVote(): void {
    const pending = this.retry;
    if (!pending) return;
    this.voteError = false;
    this.api.consultation(this.consultationId).subscribe({
      next: (detail) => {
        this.confirmed = structuredClone(detail);
        this.consultation = detail;
        if (detail.state === 'open') this.setVote(pending.optionId, pending.selected);
        else this.message = 'La consulta ya está cerrada.';
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        if (!this.team.handleAccessError(error)) this.voteError = true;
        this.changeDetector.markForCheck();
      },
    });
  }

  acceptedSummary(item: ConsultationDetail): string {
    return item.options
      .filter((option) => item.resolution?.acceptedOptionIds.includes(option.id))
      .map((option) => this.optionLabel(option))
      .join(', ');
  }

  selectedSummary(): string {
    return (
      this.consultation?.options
        .filter((option) => this.accepted.has(option.id))
        .map((option) => this.optionLabel(option))
        .join(', ') ?? ''
    );
  }

  openResolution(): void {
    if (!this.team.participantId) {
      this.message = 'Elige una identidad del equipo para resolver la consulta.';
      return;
    }
    this.accepted = new Set();
    this.confirming = false;
    this.resolveError = '';
    this.showResolution = true;
    this.resolutionEventChanged = false;
    this.draftEventId = this.consultation?.event?.id ?? null;
    this.resolutionEvent = this.consultation?.event;
    if (this.consultation?.type === 'date') this.loadEvents();
    this.refreshResolution();
    this.changeDetector.markForCheck();
  }

  closeResolution(event?: Event): void {
    event?.preventDefault();
    if (this.submitting) return;
    this.showResolution = false;
    this.changeDetector.markForCheck();
    setTimeout(() => this.resolveButton?.nativeElement.focus());
  }

  toggleAccepted(id: string): void {
    const selected = this.accepted.has(id);
    if (this.draftEventId) this.accepted.clear();
    if (selected) this.accepted.delete(id);
    else this.accepted.add(id);
    this.changeDetector.markForCheck();
  }

  beginConfirmation(decision: Decision): void {
    this.decision = decision;
    this.refreshResolution(true);
  }

  confirmResolution(): void {
    if (!this.team.participantId || this.submitting) return;
    this.submitting = true;
    this.resolveError = '';
    const accepted = this.decision === 'resolved' ? [...this.accepted] : [];
    const event =
      this.consultation?.type === 'date'
        ? {
            ...(this.decision === 'resolved' && this.resolutionEvent?.status === 'rejected'
              ? { eventId: null }
              : this.resolutionEventChanged
                ? { eventId: this.draftEventId }
                : {}),
            ...(this.decision === 'resolved' && this.resolutionEvent?.status === 'definitive'
              ? { expectedEventVersion: this.resolutionEvent.version }
              : {}),
          }
        : undefined;
    this.api
      .resolveConsultation(
        this.consultationId,
        this.team.participantId,
        this.decision,
        accepted,
        event,
      )
      .subscribe({
        next: ({ consultation, expiresAt }) => {
          this.submitting = false;
          this.showResolution = false;
          this.consultation = consultation;
          this.confirmed = structuredClone(consultation);
          this.team.updateExpiry(expiresAt);
          this.updated.emit();
          this.message = 'Resolución registrada.';
          this.changeDetector.markForCheck();
          setTimeout(() => this.backButton?.nativeElement.focus());
        },
        error: (error: HttpErrorResponse) => {
          this.submitting = false;
          if (this.team.handleAccessError(error)) return;
          if (error.status === 409) {
            this.confirming = false;
            this.resolveError =
              'El estado ha cambiado. Revisa los datos actualizados y vuelve a confirmar.';
            this.refreshResolution();
            if (this.consultation?.type === 'date') this.loadEvents();
          } else {
            this.resolveError = 'No se pudo guardar la resolución. Puedes reintentar.';
          }
          this.changeDetector.markForCheck();
        },
      });
  }

  openEventEditor(remove = false): void {
    this.eventFocusReturn =
      document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.draftEventId = remove ? null : (this.consultation?.event?.id ?? null);
    this.eventError = '';
    this.showEventEditor = true;
    this.loadEvents();
  }

  closeEventEditor(event?: Event): void {
    event?.preventDefault();
    if (this.eventSaving) return;
    this.showEventEditor = false;
    this.changeDetector.markForCheck();
    setTimeout(() => {
      if (this.eventFocusReturn?.isConnected) this.eventFocusReturn.focus();
      else this.eventButton?.nativeElement.focus();
    });
  }

  loadEvents(): void {
    this.eventsLoading = true;
    this.eventsError = false;
    this.subscriptions.add(
      forkJoin({ events: this.api.events(), consultations: this.api.consultations() }).subscribe({
        next: ({ events, consultations }) => {
          const occupied = new Set(
            consultations.open
              .filter((item) => item.id !== this.consultationId)
              .map((item) => item.event?.id),
          );
          this.eligibleEvents = events.unfinalized.filter(
            (event) => event.status === 'provisional' && !occupied.has(event.id),
          );
          this.eventsLoading = false;
          this.changeDetector.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.eventsLoading = false;
          this.eventsError = !this.team.handleAccessError(error);
          this.changeDetector.markForCheck();
        },
      }),
    );
  }

  saveEvent(): void {
    if (this.eventSaving) return;
    this.eventSaving = true;
    this.eventError = '';
    this.subscriptions.add(
      this.api.setConsultationEvent(this.consultationId, this.draftEventId).subscribe({
        next: ({ expiresAt }) => {
          this.eventSaving = false;
          this.team.updateExpiry(expiresAt);
          this.closeEventEditor();
          this.focusEventAfterLoad = true;
          this.load();
          this.updated.emit();
          this.message = 'Vínculo actualizado.';
        },
        error: (error: HttpErrorResponse) => {
          this.eventSaving = false;
          if (this.team.handleAccessError(error)) return;
          this.eventError =
            error.status === 409
              ? 'El estado ha cambiado. Revisa los eventos disponibles y vuelve a intentarlo.'
              : 'No se pudo guardar el vínculo. Puedes reintentar.';
          if (error.status === 409) this.loadEvents();
          this.changeDetector.markForCheck();
        },
      }),
    );
  }

  selectResolutionEvent(id: string): void {
    this.resolutionEventChanged = true;
    this.draftEventId = id || null;
    this.resolutionEvent =
      this.eligibleEvents.find((event) => event.id === id) ??
      (this.consultation?.event?.id === id ? this.consultation.event : undefined);
    if (this.draftEventId && this.accepted.size > 1) this.accepted.clear();
  }

  refreshResolution(confirm = false): void {
    this.resolutionLoading = true;
    this.subscriptions.add(
      this.api.consultation(this.consultationId).subscribe({
        next: (detail) => {
          this.consultation = detail;
          this.confirmed = structuredClone(detail);
          if (detail.state !== 'open') {
            this.resolutionLoading = false;
            this.closeResolution();
            this.updated.emit();
            this.message = 'La consulta ya está cerrada.';
            return;
          }
          if (!this.resolutionEventChanged) this.draftEventId = detail.event?.id ?? null;
          if (!this.draftEventId) {
            this.resolutionEvent = undefined;
            this.finishResolutionRefresh(confirm);
            return;
          }
          this.subscriptions.add(
            this.api.event(this.draftEventId).subscribe({
              next: ({ event }) => {
                if (
                  confirm &&
                  this.decision === 'resolved' &&
                  event.status === 'rejected' &&
                  this.resolutionEvent?.status !== 'rejected'
                ) {
                  confirm = false;
                  this.resolveError = 'El evento está rechazado. Elige cómo continuar.';
                }
                this.resolutionEvent = event;
                this.finishResolutionRefresh(confirm);
              },
              error: (error: HttpErrorResponse) => this.resolutionRefreshFailed(error),
            }),
          );
        },
        error: (error: HttpErrorResponse) => this.resolutionRefreshFailed(error),
      }),
    );
  }

  private finishResolutionRefresh(confirm: boolean): void {
    this.resolutionLoading = false;
    if (confirm) {
      this.resolveError = '';
      if (
        this.decision === 'resolved' &&
        (this.accepted.size === 0 || (this.draftEventId && this.accepted.size !== 1))
      ) {
        this.resolveError = 'Elige exactamente una fecha para el evento vinculado.';
      } else {
        this.confirming = true;
      }
    }
    this.changeDetector.markForCheck();
  }

  private resolutionRefreshFailed(error: HttpErrorResponse): void {
    this.resolutionLoading = false;
    if (!this.team.handleAccessError(error))
      this.resolveError = 'No se pudo comprobar el estado actual. Reintenta antes de confirmar.';
    this.changeDetector.markForCheck();
  }
}
