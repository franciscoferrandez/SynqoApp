import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AvailabilityDay, AvailabilityState, TeamApi } from '../shared/team-api';
import { TeamLayout } from './team-layout';

export function civilDate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}
export function visibleDates(year: number, month: number, extended: boolean): string[] {
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  if (extended) {
    first.setUTCDate(first.getUTCDate() - ((first.getUTCDay() + 6) % 7));
    last.setUTCDate(last.getUTCDate() + ((7 - last.getUTCDay()) % 7));
  }
  const dates: string[] = [];
  for (const date = new Date(first); date <= last; date.setUTCDate(date.getUTCDate() + 1))
    dates.push(civilDate(date));
  return dates;
}

@Component({
  imports: [NgTemplateOutlet],
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
            <div class="calendar-filters">
              <div class="view-toggle" role="group" aria-label="Extensión del calendario">
                <button
                  class="icon-button"
                  type="button"
                  aria-label="Mes natural"
                  title="Mes natural"
                  [attr.aria-pressed]="!extended"
                  (click)="setExtent(false)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                    <path d="M8 14h3v3H8z" />
                  </svg></button
                ><button
                  class="icon-button"
                  type="button"
                  aria-label="Semanas completas"
                  title="Semanas completas"
                  [attr.aria-pressed]="extended"
                  (click)="setExtent(true)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 6h13M8 12h13M8 18h13" />
                    <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
                    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
                    <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </button>
              </div>
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
                disabled
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4M12 16h6M15 13v6" />
                </svg>
              </button>
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
          <div class="calendar-days" [attr.aria-busy]="loading">
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
                [attr.aria-label]="
                  label(date) +
                  ': ' +
                  statusLabel(displayState(date)) +
                  (date < today ? ', pasado, solo lectura' : '')
                "
                [attr.aria-pressed]="selected === date"
                [attr.data-date]="date"
                (click)="select(date, $event)"
              >
                <span class="day-number"
                  >{{ number(date) }}
                  @if (date.slice(0, 7) !== civilMonth) {
                    <small>{{ shortMonth(date) }}</small>
                  }</span
                ><small class="status">{{ statusLabel(displayState(date)) }}</small>
              </button>
            }
          </div>
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
        <p class="calendar-note">
          El estado resume la peor marca registrada; las ausencias se ignoran.
        </p>
        <p class="choice-help">
          {{
            selected < today
              ? 'Este día es pasado. Puedes consultar sus marcas.'
              : 'Para marcar tu disponibilidad, toca una tarjeta. Tócala de nuevo para quitar tu marca.'
          }}
        </p>
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
  private readonly api = inject(TeamApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild('dayDialog') dialog?: ElementRef<HTMLDialogElement>;
  private focusReturn?: HTMLElement;
  private reading?: Subscription;
  private writing?: Subscription;
  private reloadAfterSave = false;
  readonly states: AvailabilityState[] = ['available', 'maybe', 'unavailable'];
  extended = false;
  mine = false;
  loading = false;
  loadFailed = false;
  saving = false;
  saveFailed = false;
  message = '';
  retryAction?: { date: string; participantId: string; state: AvailabilityState | null };
  data: Record<string, AvailabilityDay> = {};
  month = this.today.slice(0, 7);
  selected = this.today;
  get deviceZone(): string | undefined {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
    } catch {
      return undefined;
    }
  }
  get today(): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.deviceZone ?? this.team.team?.timeZone ?? 'Europe/Madrid',
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
    this.loading = true;
    this.loadFailed = false;
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
  }
  move(offset: number): void {
    const date = this.parse(this.month + '-01');
    date.setUTCMonth(date.getUTCMonth() + offset);
    this.month = civilDate(date).slice(0, 7);
    this.load();
  }
  setExtent(value: boolean): void {
    this.extended = value;
    this.load();
  }
  goToday(): void {
    this.month = this.today.slice(0, 7);
    this.selected = this.today;
    this.load();
  }
  select(date: string, event: Event): void {
    this.selected = date;
    this.focusReturn = event.currentTarget as HTMLElement;
    if (matchMedia('(max-width: 700px)').matches) this.dialog?.nativeElement.showModal();
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
        counts: { available: 0, maybe: 0, unavailable: 0 },
        marks: [],
      }
    );
  }
  ownState(date: string): AvailabilityState | null {
    return (
      this.day(date).marks.find((p) => p.participantId === this.team.participantId)?.state ?? null
    );
  }
  displayState(date: string): AvailabilityState | null {
    return this.mine ? this.ownState(date) : this.day(date).state;
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
    const state = this.states.filter((s) => counts[s] > 0).at(-1) ?? null;
    this.data[action.date] = { date: action.date, state, counts, marks };
    this.saving = true;
    this.saveFailed = false;
    this.retryAction = action;
    this.message = 'Guardando disponibilidad…';
    this.changeDetector.markForCheck();
    this.writing = this.api
      .mark(action.date, action.participantId, action.state, this.deviceZone)
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
