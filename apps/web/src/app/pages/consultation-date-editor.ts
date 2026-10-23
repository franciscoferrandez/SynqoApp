import { DOCUMENT } from '@angular/common';
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
import {
  calendarPreferenceKey,
  civilDate,
  parseCalendarPreferences,
  previousCalendarPreferenceKey,
  visibleDates,
} from '../shared/calendar-view';
import {
  AvailabilityDay,
  AvailabilityState,
  Consultation,
  ConsultationDetail,
  ConsultationEdit,
  ConsultationRemovalWithVotes,
  TeamApi,
} from '../shared/team-api';
import { TeamLayout } from './team-layout';

interface DateOption {
  id: string;
  date: string;
  original: boolean;
  count: number;
  removed: boolean;
}
type DateRemoval = Extract<ConsultationRemovalWithVotes, { date: string }>;

@Component({
  selector: 'app-consultation-date-editor',
  template: `
    @if (stage === 'edit') {
      <dialog
        #editorDialog
        class="consultation-dialog date-editor"
        aria-labelledby="date-editor-heading"
        (cancel)="requestClose($event)"
      >
        <div class="dialog-head">
          <h2 id="date-editor-heading">
            {{ consultationId ? 'Editar consulta' : 'Nueva consulta de fechas' }}
          </h2>
          <button
            class="dialog-close"
            type="button"
            aria-label="Cerrar consulta de fechas"
            [disabled]="pending"
            (click)="requestClose()"
          >
            ×
          </button>
        </div>
        @if (loading) {
          <p role="status">Cargando consulta para editar…</p>
        } @else if (loadFailed) {
          <p role="alert">No se pudo cargar la consulta para editar.</p>
          <button class="outline" type="button" (click)="load()">Reintentar</button>
        } @else {
          <fieldset class="date-fields" [disabled]="pending || !editable">
            <label for="date-query-title">Título breve</label>
            <input
              #titleInput
              id="date-query-title"
              class="text-query-input"
              maxlength="250"
              autocomplete="off"
              [value]="title"
              [attr.aria-invalid]="titleInvalid ? true : null"
              aria-describedby="date-title-error"
              (input)="title = $any($event.target).value; clearError()"
            />
            <p id="date-title-error" class="field-error">
              {{ titleInvalid ? 'Escribe un título de hasta 250 caracteres.' : '' }}
            </p>
            <h3>Fechas · hasta diez</h3>
            <p class="calendar-note">
              Disponibilidad del equipo. Pulsa un día para incluirlo o retirarlo.
            </p>
            <div class="date-month-toolbar">
              <button
                class="outline"
                type="button"
                aria-label="Mes anterior"
                (click)="moveMonth(-1)"
              >
                ‹
              </button>
              <h4 aria-live="polite">{{ monthLabel }}</h4>
              <button
                class="outline"
                type="button"
                aria-label="Mes siguiente"
                (click)="moveMonth(1)"
              >
                ›
              </button>
              @if (!dates.includes(today)) {
                <button class="outline" type="button" (click)="goToday()">Hoy</button>
              }
            </div>
            @if (calendarLoading) {
              <p role="status">Cargando disponibilidad y eventos…</p>
            }
            @if (calendarFailed) {
              <div role="alert" class="date-calendar-error">
                <p>
                  No se pudieron cargar la disponibilidad y los eventos. Conservamos las fechas
                  elegidas.
                </p>
                <button class="outline" type="button" (click)="loadCalendar()">
                  Reintentar calendario
                </button>
              </div>
            }
            <div class="calendar-weekdays" aria-hidden="true">
              @for (weekday of weekdays; track weekday) {
                <span>{{ weekday }}</span>
              }
            </div>
            <div class="calendar-days" [attr.aria-busy]="calendarLoading">
              @for (blank of blanks; track $index) {
                <span aria-hidden="true"></span>
              }
              @for (date of dates; track date) {
                <button
                  class="calendar-day"
                  type="button"
                  [attr.data-date]="date"
                  [class.available]="state(date) === 'available'"
                  [class.maybe]="state(date) === 'maybe'"
                  [class.unavailable]="state(date) === 'unavailable'"
                  [class.past]="date < today"
                  [class.today]="date === today"
                  [attr.aria-pressed]="selected(date)"
                  [attr.aria-label]="dayLabel(date)"
                  [disabled]="calendarLoading || calendarFailed || !canToggle(date)"
                  (click)="toggle(date)"
                >
                  <span class="calendar-day-face" aria-hidden="true">
                    <span class="day-number"
                      >{{ dayNumber(date) }}
                      @if (date.slice(0, 7) !== month) {
                        <small>{{ shortMonth(date) }}</small>
                      }
                    </span>
                    @if (hasEvent(date)) {
                      <svg
                        class="date-event-bell"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        aria-hidden="true"
                      >
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                      </svg>
                    }
                    <small class="status">{{
                      calendarLoading ? '…' : calendarFailed ? '—' : stateLabel(state(date))
                    }}</small>
                  </span>
                </button>
              }
            </div>
            <p class="calendar-legend">✓ Disponible · ? Quizá · × No disponible · · Sin marcas</p>
            <p class="calendar-note">
              Las fechas incluidas se distinguen por su contorno. Las preferencias se cambian desde
              Calendario.
            </p>
            @if (validationShown && activeOptions.length < 1) {
              <p class="field-error">Elige entre una y diez fechas.</p>
            }
            @if (!consultationId) {
              <label class="date-event-switch">
                <input
                  type="checkbox"
                  role="switch"
                  [checked]="createEvent"
                  (change)="createEvent = $any($event.target).checked; clearError()"
                />
                Crear evento provisional
              </label>
              <p class="calendar-note">Sin fecha asignada y con el mismo título de la consulta.</p>
            }
          </fieldset>
        }
        @if (error) {
          <p class="field-error" role="alert">{{ error }}</p>
        }
        @if (needsReload) {
          <button class="outline" type="button" [disabled]="pending" (click)="requestReload()">
            Recargar ficha
          </button>
        }
        <div class="text-query-actions">
          <button class="outline" type="button" [disabled]="pending" (click)="requestClose()">
            Cancelar
          </button>
          <button
            class="primary"
            type="button"
            [disabled]="pending || loading || loadFailed || !editable"
            (click)="save()"
          >
            {{ pending ? 'Guardando…' : consultationId ? 'Guardar consulta' : 'Crear consulta' }}
          </button>
        </div>
      </dialog>
    } @else if (stage === 'discard') {
      <dialog
        #discardDialog
        class="consultation-dialog consultation-confirmation"
        aria-labelledby="date-discard-heading"
        (cancel)="backToEdit($event)"
      >
        <h2 id="date-discard-heading">¿Descartar los cambios?</h2>
        <p>Se perderán el título y las fechas del borrador.</p>
        <div class="text-query-actions">
          <button class="outline" type="button" (click)="backToEdit()">Seguir editando</button>
          <button class="primary danger" type="button" (click)="closed.emit(reloadAfterDiscard)">
            {{ consultationId ? 'Descartar cambios' : 'Abandonar edición' }}
          </button>
        </div>
      </dialog>
    } @else {
      <dialog
        #removalDialog
        class="consultation-dialog consultation-confirmation"
        aria-labelledby="date-removal-heading"
        (cancel)="backToEdit($event)"
      >
        <h2 id="date-removal-heading">Eliminar fechas y sus votos</h2>
        <ul>
          @for (option of pendingRemovals; track option.id) {
            <li>{{ fullDate(option.date) }}</li>
          }
        </ul>
        <p>Se eliminarán estas fechas y todos sus votos. Las demás selecciones se conservan.</p>
        <div class="text-query-actions">
          <button class="outline" type="button" (click)="backToEdit()">Volver a editar</button>
          <button class="primary danger" type="button" (click)="confirmRemoval()">
            Eliminar fechas y guardar
          </button>
        </div>
      </dialog>
    }
  `,
  styles: `
    .date-editor {
      width: min(620px, calc(100vw - 2rem));
    }
    .date-fields {
      border: 0;
      padding: 0;
      margin: 0;
      min-width: 0;
    }
    .date-fields > label:first-child {
      display: block;
      margin-bottom: 0.4rem;
    }
    .date-month-toolbar {
      display: flex;
      gap: 0.45rem;
      align-items: center;
      margin: 1rem 0;
    }
    .date-month-toolbar h4 {
      flex: 1;
      text-align: center;
      text-transform: capitalize;
      margin: 0;
    }
    .date-month-toolbar button {
      padding: 0.45rem 0.65rem;
    }
    .calendar-days,
    .calendar-weekdays {
      gap: 0.3rem;
    }
    .calendar-day,
    .calendar-day-face {
      min-height: 70px;
    }
    .calendar-day-face {
      padding: 0.4rem 0.3rem;
    }
    .calendar-day .status {
      font-size: 0.65rem;
      min-width: 0;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .calendar-day .day-number {
      padding-right: 0.8rem;
    }
    .date-event-bell {
      position: absolute;
      right: 0.25rem;
      top: 0.35rem;
      width: 13px;
      height: 13px;
      color: var(--blue-strong);
    }
    .calendar-day:disabled {
      opacity: 0.6;
    }
    .calendar-day[aria-pressed='true']:disabled {
      opacity: 1;
    }
    .calendar-day:focus-visible::after {
      outline: 2px dashed var(--focus);
      outline-offset: 2px;
    }
    .date-event-switch {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    @media (max-width: 480px) {
      .calendar-days,
      .calendar-weekdays {
        gap: 0.2rem;
      }
      .calendar-day,
      .calendar-day-face {
        min-height: 62px;
      }
      .calendar-day-face {
        padding: 0.35rem 0.15rem;
      }
      .calendar-day .day-number {
        font-size: 0.78rem;
        padding-right: 0.6rem;
      }
      .date-event-bell {
        width: 10px;
        height: 10px;
        right: 0.16rem;
      }
    }
  `,
})
export class ConsultationDateEditor implements OnInit, OnDestroy {
  @Input() consultationId?: string;
  @Input() initialMonth?: string;
  @Output() readonly saved = new EventEmitter<{
    consultation: ConsultationDetail;
    expiresAt: string;
  }>();
  @Output() readonly created = new EventEmitter<{
    consultation: Consultation;
    expiresAt: string;
  }>();
  @Output() readonly closed = new EventEmitter<boolean>();
  @ViewChild('titleInput') private titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('editorDialog') set editorDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    this.openDialog(ref);
  }
  @ViewChild('discardDialog') set discardDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    this.openDialog(ref);
  }
  @ViewChild('removalDialog') set removalDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    this.openDialog(ref);
  }
  readonly team = inject(TeamLayout);
  private readonly api = inject(TeamApi);
  private readonly document = inject(DOCUMENT);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly subscriptions = new Subscription();
  private calendarRequest?: Subscription;
  private calendarVersion = 0;
  readonly weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  preferences = parseCalendarPreferences(null);
  stage: 'edit' | 'discard' | 'removal' = 'edit';
  title = '';
  createEvent = false;
  options: DateOption[] = [];
  loading = false;
  loadFailed = false;
  pending = false;
  editable = true;
  validationShown = false;
  error = '';
  needsReload = false;
  reloadAfterDiscard = false;
  pendingRemovals: DateRemoval[] = [];
  month = '';
  calendarLoading = true;
  calendarFailed = false;
  private days = new Map<string, AvailabilityDay>();
  private eventDates = new Set<string>();
  private originalTitle = '';
  private originalDraft = '';
  private readonly confirmedRemovalIds = new Set<string>();
  private readonly submittedAddIds = new Set<string>();

  ngOnInit(): void {
    try {
      const storage = this.document.defaultView?.localStorage;
      this.preferences = parseCalendarPreferences(
        storage?.getItem(calendarPreferenceKey) ??
          storage?.getItem(previousCalendarPreferenceKey) ??
          null,
      );
    } catch {
      /* El diálogo funciona con los valores predeterminados sin almacenamiento. */
    }
    this.month =
      !this.consultationId &&
      this.initialMonth &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(this.initialMonth) &&
      Number(this.initialMonth.slice(0, 4)) > 0
        ? this.initialMonth
        : this.today.slice(0, 7);
    this.originalDraft = this.draftValue();
    if (this.consultationId) this.load();
    else this.loadCalendar();
  }
  ngOnDestroy(): void {
    this.calendarVersion++;
    this.calendarRequest?.unsubscribe();
    this.subscriptions.unsubscribe();
  }
  get timeZone(): string {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone) {
        new Intl.DateTimeFormat('en', { timeZone: zone });
        return zone;
      }
    } catch {
      /* Usar zona del equipo. */
    }
    return this.team.team?.timeZone ?? 'Europe/Madrid';
  }
  get today(): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    return ['year', 'month', 'day']
      .map((type) => parts.find((part) => part.type === type)?.value)
      .join('-');
  }
  get dates(): string[] {
    const [year, month] = this.month.split('-').map(Number);
    return visibleDates(year, month - 1, this.preferences.extended);
  }
  get blanks(): null[] {
    return this.preferences.extended
      ? []
      : Array<null>((this.parse(this.dates[0]).getUTCDay() + 6) % 7).fill(null);
  }
  get monthLabel(): string {
    return new Intl.DateTimeFormat('es', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(this.parse(this.month + '-01'));
  }
  get activeOptions(): DateOption[] {
    return this.options.filter((option) => !option.removed);
  }
  get titleInvalid(): boolean {
    return this.validationShown && (!this.title.trim() || this.title.length > 250);
  }
  get dirty(): boolean {
    if (!this.consultationId) return !!this.title.trim() || this.activeOptions.length > 0;
    return !!this.originalDraft && this.draftValue() !== this.originalDraft;
  }

  load(): void {
    if (!this.consultationId || this.pending) return;
    this.loading = true;
    this.loadFailed = false;
    this.subscriptions.add(
      this.api.consultation(this.consultationId).subscribe({
        next: (detail) => {
          this.loading = false;
          this.title = this.originalTitle = detail.title;
          this.options = detail.options
            .filter((option) => option.date !== undefined)
            .map((option) => ({
              id: option.id,
              date: option.date!,
              original: true,
              count: option.count,
              removed: false,
            }));
          this.originalDraft = this.draftValue();
          this.editable = detail.type === 'date' && detail.state === 'open';
          if (!this.editable) {
            this.error =
              'La consulta ya no admite edición. Recarga la ficha para ver su estado actual.';
            this.needsReload = true;
          }
          this.month = this.options[0]?.date.slice(0, 7) ?? this.month;
          this.loadCalendar();
          this.changeDetector.markForCheck();
          setTimeout(() => this.titleInput?.nativeElement.focus());
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.loadFailed = !this.team.handleAccessError(error);
          this.changeDetector.markForCheck();
        },
      }),
    );
  }
  loadCalendar(): void {
    this.calendarRequest?.unsubscribe();
    const version = ++this.calendarVersion;
    const dates = this.dates;
    this.calendarLoading = true;
    this.calendarFailed = false;
    this.days.clear();
    this.eventDates.clear();
    this.calendarRequest = forkJoin({
      availability: this.api.availability(dates[0], dates[dates.length - 1]),
      events: this.api.calendarEvents(dates[0], dates[dates.length - 1]),
    }).subscribe({
      next: ({ availability, events }) => {
        if (version !== this.calendarVersion) return;
        this.days = new Map(availability.days.map((day) => [day.date, day]));
        this.eventDates = new Set(
          events.events
            .filter((event) => event.status === 'provisional' || event.status === 'definitive')
            .map((event) => event.date),
        );
        this.calendarLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        if (version !== this.calendarVersion) return;
        this.calendarLoading = false;
        this.calendarFailed = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }
  moveMonth(delta: number): void {
    if (this.pending) return;
    const date = this.parse(this.month + '-01');
    date.setUTCMonth(date.getUTCMonth() + delta);
    this.month = civilDate(date).slice(0, 7);
    this.loadCalendar();
  }
  goToday(): void {
    if (!this.pending) {
      this.month = this.today.slice(0, 7);
      this.loadCalendar();
    }
  }
  selected(date: string): boolean {
    return this.options.some((option) => option.date === date && !option.removed);
  }
  canToggle(date: string): boolean {
    return (
      this.selected(date) ||
      (this.activeOptions.length < 10 &&
        (date >= this.today ||
          this.options.some((option) => option.date === date && option.original)))
    );
  }
  toggle(date: string): void {
    if (
      this.pending ||
      !this.editable ||
      this.calendarLoading ||
      this.calendarFailed ||
      !this.canToggle(date)
    )
      return;
    const option = this.options.find((item) => item.date === date);
    if (option?.original) {
      option.removed = !option.removed;
      this.confirmedRemovalIds.delete(option.id);
    } else if (option) this.options = this.options.filter((item) => item !== option);
    else
      this.options.push({
        id: crypto.randomUUID(),
        date,
        original: false,
        removed: false,
        count: 0,
      });
    this.clearError();
  }
  state(date: string): AvailabilityState | null {
    const day = this.days.get(date);
    return (
      day?.summaryStates?.[this.preferences.rule] ??
      (this.preferences.rule === 'worst' ? (day?.state ?? null) : null)
    );
  }
  stateLabel(state: AvailabilityState | null): string {
    return state === 'available'
      ? '✓ Disp.'
      : state === 'maybe'
        ? '? Quizá'
        : state === 'unavailable'
          ? '× No disp.'
          : '·';
  }
  hasEvent(date: string): boolean {
    return this.eventDates.has(date);
  }
  dayLabel(date: string): string {
    const state = this.state(date);
    const label = this.calendarLoading
      ? 'cargando disponibilidad y eventos'
      : this.calendarFailed
        ? 'disponibilidad y eventos no disponibles'
        : state === 'available'
          ? 'Disponible'
          : state === 'maybe'
            ? 'Quizá'
            : state === 'unavailable'
              ? 'No disponible'
              : 'Sin marcas';
    return `${this.fullDate(date)}; ${label}; ${this.selected(date) ? 'incluida' : 'no incluida'}${this.hasEvent(date) ? '; tiene evento' : ''}`;
  }
  fullDate(date: string): string {
    return new Intl.DateTimeFormat('es', { dateStyle: 'full', timeZone: 'UTC' }).format(
      this.parse(date),
    );
  }
  dayNumber(date: string): number {
    return Number(date.slice(-2));
  }
  shortMonth(date: string): string {
    return new Intl.DateTimeFormat('es', { month: 'short', timeZone: 'UTC' }).format(
      this.parse(date),
    );
  }
  clearError(): void {
    this.error = '';
  }
  save(): void {
    if (this.pending || this.loading || this.loadFailed || !this.editable) return;
    this.validationShown = true;
    if (this.titleInvalid || this.activeOptions.length < 1 || this.activeOptions.length > 10) {
      this.error = 'Revisa el título y elige entre una y diez fechas.';
      return;
    }
    if (
      this.activeOptions.some(
        (option) =>
          !option.original &&
          option.date < this.today &&
          (!this.consultationId || !this.submittedAddIds.has(option.id)),
      )
    ) {
      this.error = 'Hay fechas nuevas que ya han pasado. Retíralas o selecciona otra fecha.';
      return;
    }
    const participantId = this.team.participantId;
    if (!participantId) {
      this.error = 'Elige una identidad del equipo para guardar la consulta.';
      return;
    }
    const removals = this.options.filter(
      (option) => option.removed && option.count > 0 && !this.confirmedRemovalIds.has(option.id),
    );
    if (removals.length) {
      this.pendingRemovals = removals;
      this.stage = 'removal';
      return;
    }
    this.pending = true;
    this.error = '';
    if (!this.consultationId) {
      this.subscriptions.add(
        this.api
          .createDateConsultation(
            participantId,
            this.title,
            this.activeOptions.map((option) => option.date),
            this.timeZone,
            this.createEvent,
          )
          .subscribe({
            next: (result) => {
              this.pending = false;
              this.created.emit(result);
            },
            error: (error: HttpErrorResponse) => {
              this.pending = false;
              if (!this.team.handleAccessError(error)) this.applyError(error);
              this.changeDetector.markForCheck();
            },
          }),
      );
      return;
    }
    const remove = this.options
      .filter((option) => option.original && option.removed)
      .map((option) => option.id);
    const changes: ConsultationEdit = {
      participantId,
      timeZone: this.timeZone,
      ...(this.title !== this.originalTitle ? { title: this.title } : {}),
      optionChanges: {
        add: this.activeOptions
          .filter((option) => !option.original)
          .map(({ id, date }) => ({ id, date })),
        update: [],
        remove,
      },
      confirmedRemovalOptionIds: remove.filter((id) => this.confirmedRemovalIds.has(id)),
    };
    for (const option of changes.optionChanges.add) this.submittedAddIds.add(option.id);
    this.subscriptions.add(
      this.api.editConsultation(this.consultationId, changes).subscribe({
        next: (result) => {
          this.pending = false;
          this.saved.emit(result);
        },
        error: (error: HttpErrorResponse) => {
          this.pending = false;
          if (!this.team.handleAccessError(error)) this.applyError(error);
          this.changeDetector.markForCheck();
        },
      }),
    );
  }
  confirmRemoval(): void {
    for (const option of this.pendingRemovals) this.confirmedRemovalIds.add(option.id);
    this.stage = 'edit';
    this.save();
  }
  backToEdit(event?: Event): void {
    event?.preventDefault();
    this.stage = 'edit';
    this.reloadAfterDiscard = false;
    this.changeDetector.markForCheck();
    setTimeout(() => this.titleInput?.nativeElement.focus());
  }
  requestClose(event?: Event): void {
    event?.preventDefault();
    if (this.pending) return;
    this.reloadAfterDiscard = false;
    if (this.dirty) this.stage = 'discard';
    else this.closed.emit(false);
  }
  requestReload(): void {
    if (this.pending) return;
    this.reloadAfterDiscard = true;
    if (this.dirty) this.stage = 'discard';
    else this.closed.emit(true);
  }
  private applyError(error: HttpErrorResponse): void {
    const problem = error.error;
    if (
      error.status === 409 &&
      problem?.type === 'urn:synqo:problem:consultation-removal-confirmation-required'
    ) {
      const removals: ConsultationRemovalWithVotes[] = problem.optionsWithVotes ?? [];
      this.pendingRemovals = removals.filter(
        (removal): removal is DateRemoval =>
          typeof removal.date === 'string' &&
          this.options.some(
            (option) => option.id === removal.id && option.original && option.removed,
          ),
      );
      if (this.pendingRemovals.length) this.stage = 'removal';
      else this.error = 'La consulta ha cambiado. Revisa las fechas antes de guardar.';
      return;
    }
    if (error.status === 409) {
      this.error =
        'La consulta ha cambiado. Conservamos tu borrador; revisa las fechas o recarga la ficha.';
      this.needsReload = !!this.consultationId;
      const current = problem?.consultation as ConsultationDetail | undefined;
      if (current) this.editable = current.type === 'date' && current.state === 'open';
      if (problem?.type === 'urn:synqo:problem:consultation-closed') this.editable = false;
      return;
    }
    if (error.status === 422) {
      this.error =
        typeof problem?.detail === 'string'
          ? problem.detail
          : 'Revisa el título, las fechas y los límites indicados. No se guardó ningún cambio.';
      const violations = Array.isArray(problem?.violations) ? problem.violations : [];
      const messages: string[] = violations
        .map((violation: { message?: unknown }) =>
          typeof violation.message === 'string' ? violation.message : '',
        )
        .filter(Boolean);
      if (messages.length) this.error += ' ' + messages.join(' ');
      return;
    }
    this.error =
      'No se pudo guardar la consulta. Conservamos tu borrador para que puedas reintentar.';
  }
  private parse(date: string): Date {
    return new Date(date + 'T12:00:00Z');
  }
  private draftValue(): string {
    return JSON.stringify({
      title: this.title,
      createEvent: this.createEvent,
      options: this.options.map(({ id, date, removed }) => ({ id, date, removed })),
    });
  }
  private openDialog(ref: ElementRef<HTMLDialogElement> | undefined): void {
    if (ref && !ref.nativeElement.open) {
      ref.nativeElement.showModal();
      setTimeout(() =>
        (
          ref.nativeElement.querySelector<HTMLInputElement>('#date-query-title') ??
          ref.nativeElement.querySelector<HTMLButtonElement>('button')
        )?.focus(),
      );
    }
  }
}
