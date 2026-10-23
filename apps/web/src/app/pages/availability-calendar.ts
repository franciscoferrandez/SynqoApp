import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AvailabilityDay,
  AvailabilityState,
  AvailabilitySummaryRule,
  CalendarEvent,
  TeamApi,
} from '../shared/team-api';
import { summarizeAvailability } from '../shared/availability-summary';
import { TeamLayout } from './team-layout';
import { ConsultationDateEditor } from './consultation-date-editor';

import {
  civilDate,
  visibleDates,
  calendarPreferenceKey,
  previousCalendarPreferenceKey,
  parseCalendarPreferences,
} from '../shared/calendar-view';
export { civilDate, visibleDates, parseCalendarPreferences } from '../shared/calendar-view';

@Component({
  imports: [NgTemplateOutlet, ConsultationDateEditor],
  template: `
    <section aria-labelledby="section-title">
      <div class="section-heading">
        <div>
          <h2 id="section-title">{{ mine ? 'Mi disponibilidad' : 'Disponibilidad del equipo' }}</h2>
          <p>Explora el período y elige un día para ver el detalle.</p>
        </div>
      </div>
      <div class="calendar-layout">
        <div class="panel calendar-panel">
          <div class="calendar-tools">
            <div class="calendar-toolbar-top">
              <div class="monthbar">
                <h3>{{ monthLabel }}</h3>
                <button
                  type="button"
                  aria-label="Mes anterior"
                  title="Mes anterior"
                  (click)="move(-1)"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Mes siguiente"
                  title="Mes siguiente"
                  (click)="move(1)"
                >
                  ›
                </button>
                @if (!dates.includes(today)) {
                  <button
                    class="icon-button"
                    type="button"
                    aria-label="Volver a hoy"
                    title="Volver a hoy"
                    (click)="goToday()"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                }
              </div>
              <div class="calendar-toolbar-actions">
                <div class="calendar-filters">
                  <div class="scope-toggle" role="group" aria-label="Disponibilidad mostrada">
                    <button
                      class="icon-button"
                      type="button"
                      aria-label="Disponibilidad del equipo"
                      title="Disponibilidad del equipo"
                      [attr.aria-pressed]="!mine"
                      (click)="mine = false"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="9" cy="8" r="3" />
                        <path d="M3 20v-1a6 6 0 0 1 12 0v1H3z" />
                        <circle cx="17" cy="9" r="2" />
                        <path d="M17 15a5 5 0 0 1 4 5h-4" />
                      </svg></button
                    ><button
                      class="icon-button"
                      type="button"
                      aria-label="Mi disponibilidad"
                      title="Mi disponibilidad"
                      [attr.aria-pressed]="mine"
                      (click)="mine = true"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21v-2a8 8 0 0 1 16 0v2H4z" />
                      </svg>
                    </button>
                  </div>
                  <button
                    class="icon-button create-date-button"
                    type="button"
                    aria-label="Crear consulta de fechas"
                    title="Crear consulta de fechas"
                    [disabled]="!canStartDateConsultation"
                    #createDateButton
                    aria-haspopup="dialog"
                    [attr.aria-expanded]="showDateEditor"
                    (click)="startDateConsultation()"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M3 10h18M8 3v4M16 3v4M12 16h6M15 13v6" />
                    </svg>
                  </button>
                </div>
                <div class="calendar-menu">
                  <button
                    #menuButton
                    class="icon-button calendar-menu-button"
                    type="button"
                    aria-label="Opciones de visualización"
                    [attr.aria-controls]="menuOpen ? 'calendar-view-options' : null"
                    [attr.aria-expanded]="menuOpen"
                    (click)="menuOpen = !menuOpen"
                    (keydown.escape)="closeMenu($event)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  @if (menuOpen) {
                    <div
                      id="calendar-view-options"
                      class="calendar-menu-panel"
                      tabindex="-1"
                      (keydown.escape)="closeMenu($event)"
                    >
                      <label
                        ><input
                          type="checkbox"
                          [checked]="extended"
                          (change)="setExtent($any($event.target).checked)"
                        />
                        Ver semanas completas</label
                      >
                      <label
                        ><input
                          type="checkbox"
                          [checked]="overlay"
                          (change)="setOverlay($any($event.target).checked)"
                        />
                        Superponer calendarios</label
                      >
                      <label
                        ><input
                          type="checkbox"
                          [checked]="showCounts"
                          (change)="setCounts($any($event.target).checked)"
                        />
                        Mostrar recuentos del equipo</label
                      >
                      <fieldset class="calendar-rule-options">
                        <legend>Regla del resumen del equipo</legend>
                        <label
                          ><input
                            type="radio"
                            name="calendar-summary-rule"
                            [checked]="rule === 'worst'"
                            (change)="setRule('worst')"
                          />
                          Peor disponibilidad</label
                        >
                        <label
                          ><input
                            type="radio"
                            name="calendar-summary-rule"
                            [checked]="rule === 'median'"
                            (change)="setRule('median')"
                          />
                          Mediana de las marcas</label
                        >
                        <label
                          ><input
                            type="radio"
                            name="calendar-summary-rule"
                            [checked]="rule === 'mostFrequent'"
                            (change)="setRule('mostFrequent')"
                          />
                          Estado más frecuente</label
                        >
                      </fieldset>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          @if (loading) {
            <p role="status">Cargando disponibilidad…</p>
          }
          @if (loadFailed) {
            <div role="alert">
              <p>No se pudo cargar la disponibilidad.</p>
              <button class="outline" type="button" (click)="load()">Reintentar</button>
            </div>
          }
          <div class="calendar-weekdays" aria-hidden="true">
            <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span
            ><span>Sá</span><span>Do</span>
          </div>
          <div class="calendar-days" [class.overlay-active]="overlay" [attr.aria-busy]="loading">
            @for (blank of blanks; track $index) {
              <span aria-hidden="true"></span>
            }
            @for (date of dates; track date) {
              <button
                class="calendar-day"
                type="button"
                [class.available]="displayState(date) === 'available'"
                [class.maybe]="displayState(date) === 'maybe'"
                [class.unavailable]="displayState(date) === 'unavailable'"
                [class.past]="date < today"
                [class.today]="date === today"
                [attr.aria-label]="dayLabel(date)"
                [attr.aria-pressed]="selected === date"
                [attr.data-date]="date"
                (click)="select(date, $event)"
              >
                <span class="calendar-day-face" aria-hidden="true">
                  <span class="day-number"
                    >{{ number(date) }}
                    @if (date.slice(0, 7) !== civilMonth) {
                      <small>{{ shortMonth(date) }}</small>
                    }
                  </span>
                  @if (dayEvents(date).length) {
                    <span
                      class="calendar-event-indicator"
                      [attr.aria-label]="
                        dayEvents(date).length === 1
                          ? 'Tiene un evento'
                          : 'Tiene ' + dayEvents(date).length + ' eventos'
                      "
                    >
                      ♧
                      @if (dayEvents(date).length > 1) {
                        {{ dayEvents(date).length }}
                      }
                    </span>
                  }
                  @if (mine) {
                    <small class="status">{{ calendarStatusLabel(ownState(date)) }}</small>
                  } @else {
                    <ng-container *ngTemplateOutlet="teamStatus; context: { date: date }" />
                  }
                </span>
                @if (overlay) {
                  <span
                    class="calendar-underlay"
                    [class.available]="(mine ? teamState(date) : ownState(date)) === 'available'"
                    [class.maybe]="(mine ? teamState(date) : ownState(date)) === 'maybe'"
                    [class.unavailable]="
                      (mine ? teamState(date) : ownState(date)) === 'unavailable'
                    "
                    [class.past]="date < today"
                    aria-hidden="true"
                  >
                    @if (mine) {
                      <ng-container
                        *ngTemplateOutlet="teamStatus; context: { date: date, underlay: true }"
                      />
                    } @else {
                      <small class="status">{{ calendarStatusLabel(ownState(date)) || '·' }}</small>
                    }
                  </span>
                }
              </button>
            }
          </div>
          <ng-template #teamStatus let-date="date" let-underlay="underlay">
            @if (showCounts) {
              <span class="team-counts" aria-hidden="true">
                @for (state of states; track state) {
                  <span class="team-count" [class.result]="teamState(date) === state">
                    {{ stateIcon(state) }}{{ day(date).counts[state] || '_' }}
                  </span>
                }
              </span>
            } @else {
              <small class="status">{{
                underlay && !teamState(date) ? '·' : calendarStatusLabel(teamState(date))
              }}</small>
            }
          </ng-template>
          <p class="calendar-legend">✓ Disponible · ? Quizá · × No disponible · · Sin marcas</p>
        </div>
        <aside class="panel calendar-detail" aria-label="Detalle del día">
          <ng-container *ngTemplateOutlet="detail" />
        </aside>
      </div>
      <dialog
        #dayDialog
        class="availability-dialog"
        aria-labelledby="mobile-day-title"
        (cancel)="close($event)"
      >
        <ng-container *ngTemplateOutlet="detail; context: { mobile: true }" />
      </dialog>
      @defer (when showDateEditor) {
        @if (showDateEditor) {
          <app-consultation-date-editor
            [initialMonth]="month"
            (created)="dateCreated($event)"
            (closed)="closeDateEditor()"
          />
        }
      } @loading {
        <p role="status">Cargando formulario de fechas…</p>
      } @error {
        <p role="alert">
          No se pudo cargar el formulario de fechas. Recarga la página para reintentar.
        </p>
        <button class="outline" type="button" (click)="reloadPage()">Recargar página</button>
      }
      <ng-template #detail let-mobile="mobile">
        <div class="detail-heading">
          <div>
            <p class="eyebrow">Detalle del día</p>
            <h3 [id]="mobile ? 'mobile-day-title' : 'day-title'">{{ label(selected) }}</h3>
          </div>
          @if (mobile) {
            <button
              class="dialog-close"
              type="button"
              aria-label="Cerrar detalle del día"
              (click)="close()"
            >
              ×
            </button>
          }
        </div>
        <p class="calendar-note">{{ ruleDescription }} las ausencias se ignoran.</p>
        <p class="choice-help">
          {{
            selected < today
              ? 'Este día es pasado. Puedes consultar sus marcas.'
              : 'Para marcar tu disponibilidad, toca una tarjeta. Tócala de nuevo para quitar tu marca.'
          }}
        </p>
        @if (eventsLoading) {
          <p class="calendar-events-status" role="status">Cargando eventos…</p>
        } @else if (eventsLoadFailed) {
          <div class="calendar-events-status" role="alert">
            <p>No se pudieron cargar los eventos.</p>
            <button class="outline" type="button" (click)="retryEvents()">
              Reintentar eventos
            </button>
          </div>
        } @else if (dayEvents(selected).length) {
          <section class="calendar-events" aria-labelledby="calendar-events-heading">
            <h4 id="calendar-events-heading">Eventos</h4>
            <div class="calendar-events-list">
              @for (event of dayEvents(selected); track event.id) {
                <button class="calendar-event-row" type="button" (click)="openEvent(event.id)">
                  <span>{{ event.title }}</span>
                  <small>{{ eventStatusLabel(event.status) }}</small>
                </button>
              }
            </div>
          </section>
        }
        <div class="state-list">
          @for (state of states; track state) {
            <button
              type="button"
              class="state-row"
              [class.available]="state === 'available'"
              [class.maybe]="state === 'maybe'"
              [class.unavailable]="state === 'unavailable'"
              [attr.aria-pressed]="ownState(selected) === state"
              [disabled]="!canEdit(selected)"
              [attr.aria-disabled]="saving || !canEdit(selected)"
              (click)="toggle(state)"
            >
              <strong>{{ statusLabel(state) }} · {{ day(selected).counts[state] }}</strong>
              <span class="names">
                @for (person of group(state); track person.participantId) {
                  @if (!$first) {
                    ,
                  }
                  @if (person.participantId === team.participantId) {
                    <strong class="self">Tú</strong>
                  } @else {
                    {{ person.participantName }}
                  }
                } @empty {
                  Nadie
                }
              </span>
            </button>
          }
        </div>
        @if (saveFailed && retryAction?.date === selected) {
          <div class="save-error" role="alert">
            <p>No se pudo guardar tu disponibilidad. Hemos recuperado la marca anterior.</p>
            @if (canRetry) {
              <button type="button" (click)="retry()">Reintentar</button>
            }
          </div>
        }
        <span class="sr-only" role="status" aria-live="polite">{{ message }}</span>
      </ng-template>
    </section>
  `,
})
export class AvailabilityCalendar implements OnInit, OnDestroy {
  readonly team = inject(TeamLayout);
  private readonly document = inject(DOCUMENT);
  private readonly api = inject(TeamApi);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild('dayDialog') dialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('createDateButton') private createDateButton?: ElementRef<HTMLButtonElement>;
  private focusReturn?: HTMLElement;
  private reading?: Subscription;
  private writing?: Subscription;
  private eventReading?: Subscription;
  private reloadAfterSave = false;
  readonly states: AvailabilityState[] = ['available', 'maybe', 'unavailable'];
  extended = false;
  overlay = false;
  showCounts = false;
  rule: AvailabilitySummaryRule = 'worst';
  menuOpen = false;
  mine = false;
  loading = false;
  loadFailed = false;
  eventsLoading = false;
  eventsLoadFailed = false;
  saving = false;
  saveFailed = false;
  message = '';
  retryAction?: { date: string; participantId: string; state: AvailabilityState | null };
  data: Record<string, AvailabilityDay> = {};
  events: Record<string, CalendarEvent[]> = {};
  month = this.today.slice(0, 7);
  selected = this.today;
  showDateEditor = false;
  constructor() {
    let stored: string | null = null;
    try {
      stored = this.document.defaultView?.localStorage.getItem(calendarPreferenceKey) ?? null;
      if (stored === null) {
        stored =
          this.document.defaultView?.localStorage.getItem(previousCalendarPreferenceKey) ?? null;
      }
    } catch {
      // El calendario sigue funcionando sin almacenamiento local.
    }
    const preferences = parseCalendarPreferences(stored);
    this.extended = preferences.extended;
    this.overlay = preferences.overlay;
    this.showCounts = preferences.counts;
    this.rule = preferences.rule;
    if (stored !== null) this.savePreferences();
  }
  get effectiveTimeZone(): string {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone) {
        new Intl.DateTimeFormat('en', { timeZone: zone });
        return zone;
      }
    } catch {
      // Fall back to the team's configured zone.
    }
    const fallback = this.team.team?.timeZone ?? 'Europe/Madrid';
    try {
      new Intl.DateTimeFormat('en', { timeZone: fallback });
      return fallback;
    } catch {
      return 'Europe/Madrid';
    }
  }
  get canStartDateConsultation(): boolean {
    return (
      !this.showDateEditor &&
      !!this.team.participantId &&
      !!this.team.team &&
      !this.loading &&
      !this.loadFailed &&
      new Date(this.team.team.expiresAt).getTime() > Date.now()
    );
  }
  get today(): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.effectiveTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    return ['year', 'month', 'day']
      .map((type) => parts.find((p) => p.type === type)?.value)
      .join('-');
  }
  get civilMonth(): string {
    return this.month;
  }
  get dates(): string[] {
    const [year, month] = this.month.split('-').map(Number);
    return visibleDates(year, month - 1, this.extended);
  }
  get blanks(): null[] {
    return this.extended
      ? []
      : Array<null>((this.parse(this.dates[0]).getUTCDay() + 6) % 7).fill(null);
  }
  get monthLabel(): string {
    const date = this.parse(this.month + '-01');
    const month = new Intl.DateTimeFormat('es', { month: 'short', timeZone: 'UTC' })
      .format(date)
      .replace('.', '');
    return `${month[0].toUpperCase()}${month.slice(1)} '${this.month.slice(2, 4)}`;
  }
  ngOnInit(): void {
    this.load();
  }
  ngOnDestroy(): void {
    this.reading?.unsubscribe();
    this.writing?.unsubscribe();
  }
  load(): void {
    this.reading?.unsubscribe();
    this.eventReading?.unsubscribe();
    this.loading = true;
    this.loadFailed = false;
    this.eventsLoading = true;
    this.eventsLoadFailed = false;
    const dates = this.dates;
    if (this.saving) {
      this.loading = false;
      this.reloadAfterSave = true;
      return;
    }
    this.reading = this.api.availability(dates[0], dates[dates.length - 1]).subscribe({
      next: ({ days }) => {
        for (const day of days) this.data[day.date] = day;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.loadFailed = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
    this.eventReading = this.api.calendarEvents(dates[0], dates[dates.length - 1]).subscribe({
      next: ({ events }) => {
        this.events = {};
        for (const event of events) (this.events[event.date] ??= []).push(event);
        this.eventsLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.eventsLoading = false;
        this.eventsLoadFailed = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }
  retryEvents(): void {
    const dates = this.dates;
    this.eventsLoading = true;
    this.eventsLoadFailed = false;
    this.eventReading?.unsubscribe();
    this.eventReading = this.api.calendarEvents(dates[0], dates[dates.length - 1]).subscribe({
      next: ({ events }) => {
        this.events = {};
        for (const event of events) (this.events[event.date] ??= []).push(event);
        this.eventsLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.eventsLoading = false;
        this.eventsLoadFailed = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }
  move(offset: number): void {
    const date = this.parse(this.month + '-01');
    date.setUTCMonth(date.getUTCMonth() + offset);
    this.month = civilDate(date).slice(0, 7);
    this.load();
  }
  setExtent(value: boolean): void {
    this.extended = value;
    this.savePreferences();
    this.load();
  }
  setOverlay(value: boolean): void {
    this.overlay = value;
    this.savePreferences();
  }
  setCounts(value: boolean): void {
    this.showCounts = value;
    this.savePreferences();
  }
  setRule(rule: AvailabilitySummaryRule): void {
    this.rule = rule;
    this.savePreferences();
  }
  get ruleDescription(): string {
    return this.rule === 'worst'
      ? 'El estado resume la peor marca registrada;'
      : this.rule === 'median'
        ? 'El estado resume la mediana de las marcas;'
        : 'El estado resume la marca más frecuente;';
  }
  closeMenu(event: Event): void {
    event.preventDefault();
    this.menuOpen = false;
    this.changeDetector.detectChanges();
    this.menuButton?.nativeElement.focus();
  }
  private savePreferences(): void {
    try {
      this.document.defaultView?.localStorage.setItem(
        calendarPreferenceKey,
        JSON.stringify({
          extended: this.extended,
          overlay: this.overlay,
          counts: this.showCounts,
          rule: this.rule,
        }),
      );
    } catch {
      // La selección permanece activa durante esta visita.
    }
  }
  goToday(): void {
    this.month = this.today.slice(0, 7);
    this.selected = this.today;
    this.load();
  }
  select(date: string, event: Event): void {
    this.selected = date;
    this.focusReturn = event.currentTarget as HTMLElement;
    if (matchMedia('(max-width: 768px)').matches) this.dialog?.nativeElement.showModal();
  }
  close(event?: Event): void {
    event?.preventDefault();
    this.dialog?.nativeElement.close();
    this.focusReturn?.focus();
  }
  day(date: string): AvailabilityDay {
    return (
      this.data[date] ?? {
        date,
        state: null,
        summaryStates: { worst: null, median: null, mostFrequent: null },
        counts: { available: 0, maybe: 0, unavailable: 0 },
        marks: [],
      }
    );
  }
  dayEvents(date: string): CalendarEvent[] {
    return this.events[date] ?? [];
  }
  eventStatusLabel(status: CalendarEvent['status']): string {
    return status === 'definitive' ? 'Definitivo' : 'Provisional';
  }
  openEvent(id: string): void {
    void this.router.navigate(['/e/eventos', id], { preserveFragment: true });
  }
  ownState(date: string): AvailabilityState | null {
    return (
      this.day(date).marks.find((p) => p.participantId === this.team.participantId)?.state ?? null
    );
  }
  displayState(date: string): AvailabilityState | null {
    return this.mine ? this.ownState(date) : this.teamState(date);
  }
  teamState(date: string): AvailabilityState | null {
    const day = this.day(date);
    return day.summaryStates?.[this.rule] ?? (this.rule === 'worst' ? day.state : null);
  }
  stateIcon(state: AvailabilityState): string {
    return state === 'available' ? '✓' : state === 'maybe' ? '?' : '×';
  }
  calendarStatusLabel(state: AvailabilityState | null): string {
    return state === 'available'
      ? '✓ Disp.'
      : state === 'maybe'
        ? '? Quizá'
        : state === 'unavailable'
          ? '× No disp.'
          : '';
  }
  dayLabel(date: string): string {
    const main = this.mine
      ? `Marca propia: ${this.statusLabel(this.ownState(date))}`
      : this.teamLabel(date);
    const opposite = this.mine
      ? `; ${this.teamLabel(date)}`
      : `; marca propia: ${this.statusLabel(this.ownState(date))}`;
    const eventCount = this.dayEvents(date).length;
    const events = eventCount
      ? `; ${eventCount === 1 ? 'un evento' : `${eventCount} eventos`}`
      : '';
    return `${this.label(date)}: ${main}${this.overlay ? opposite : ''}${events}${date < this.today ? ', pasado, solo lectura' : ''}`;
  }
  private teamLabel(date: string): string {
    const day = this.day(date);
    const result = this.statusLabel(this.teamState(date));
    if (!this.showCounts) return `equipo: ${result}`;
    return `equipo: ${result}; disponible ${day.counts.available}, quizá ${day.counts.maybe}, no disponible ${day.counts.unavailable}`;
  }
  group(state: AvailabilityState): AvailabilityDay['marks'] {
    return this.day(this.selected)
      .marks.filter((p) => p.state === state)
      .sort(
        (a, b) =>
          Number(b.participantId === this.team.participantId) -
          Number(a.participantId === this.team.participantId),
      );
  }
  canEdit(date: string): boolean {
    return (
      !!this.team.team &&
      !!this.team.participantId &&
      date >= this.today &&
      !this.loading &&
      !this.loadFailed &&
      new Date(this.team.team.expiresAt).getTime() > Date.now()
    );
  }
  get canRetry(): boolean {
    return (
      !!this.retryAction &&
      this.canEdit(this.retryAction.date) &&
      this.team.team?.participants.some((p) => p.id === this.retryAction?.participantId) === true &&
      !this.saving
    );
  }
  toggle(state: AvailabilityState): void {
    this.save({
      date: this.selected,
      participantId: this.team.participantId,
      state: this.ownState(this.selected) === state ? null : state,
    });
  }
  retry(): void {
    if (this.canRetry && this.retryAction) this.save(this.retryAction);
  }
  private save(action: {
    date: string;
    participantId: string;
    state: AvailabilityState | null;
  }): void {
    if (!this.canEdit(action.date) || this.saving) return;
    this.reading?.unsubscribe();
    const before = this.day(action.date);
    const marks = before.marks.filter((p) => p.participantId !== action.participantId);
    if (action.state)
      marks.push({
        participantId: action.participantId,
        participantName:
          this.team.team?.participants.find((p) => p.id === action.participantId)?.name ?? '',
        state: action.state,
      });
    const counts = { available: 0, maybe: 0, unavailable: 0 };
    for (const mark of marks) counts[mark.state]++;
    const summaryStates = summarizeAvailability(counts);
    this.data[action.date] = {
      date: action.date,
      state: summaryStates.worst,
      summaryStates,
      counts,
      marks,
    };
    this.saving = true;
    this.saveFailed = false;
    this.retryAction = action;
    this.message = 'Guardando disponibilidad…';
    this.changeDetector.markForCheck();
    this.writing = this.api
      .mark(action.date, action.participantId, action.state, this.effectiveTimeZone)
      .subscribe({
        next: ({ day, expiresAt }) => {
          this.data[day.date] = day;
          this.team.updateExpiry(expiresAt);
          this.saving = false;
          this.retryAction = undefined;
          this.message = 'Disponibilidad guardada.';
          this.finishSave();
        },
        error: (error: HttpErrorResponse) => {
          this.data[action.date] = before;
          this.saving = false;
          this.saveFailed = !this.team.handleAccessError(error);
          this.message =
            'No se pudo guardar tu disponibilidad. Hemos recuperado la marca anterior.';
          this.finishSave();
        },
      });
  }
  private finishSave(): void {
    if (this.reloadAfterSave && this.team.team) {
      this.reloadAfterSave = false;
      this.load();
    }
    this.changeDetector.markForCheck();
  }
  private parse(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
  startDateConsultation(): void {
    if (!this.canStartDateConsultation) return;
    this.dialog?.nativeElement.close();
    this.showDateEditor = true;
  }
  closeDateEditor(): void {
    this.showDateEditor = false;
    this.changeDetector.markForCheck();
    setTimeout(() => this.createDateButton?.nativeElement.focus());
  }
  dateCreated(result: { expiresAt: string }): void {
    this.team.updateExpiry(result.expiresAt);
    this.showDateEditor = false;
    void this.router.navigate(['/e/consultas'], { preserveFragment: true });
  }
  reloadPage(): void {
    this.document.defaultView?.location.reload();
  }
  label(date: string): string {
    return new Intl.DateTimeFormat('es', { dateStyle: 'full', timeZone: 'UTC' }).format(
      this.parse(date),
    );
  }
  number(date: string): number {
    return Number(date.slice(-2));
  }
  shortMonth(date: string): string {
    return new Intl.DateTimeFormat('es', { month: 'short', timeZone: 'UTC' }).format(
      this.parse(date),
    );
  }
  statusLabel(state: AvailabilityState | null): string {
    return state === 'available'
      ? '✓ Disponible'
      : state === 'maybe'
        ? '? Quizá'
        : state === 'unavailable'
          ? '× No disponible'
          : '· Sin marcas';
  }
}
