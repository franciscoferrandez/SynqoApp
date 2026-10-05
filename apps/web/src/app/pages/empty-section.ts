import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  template: `
    @if (section === 'calendario') {
      <section aria-labelledby="section-title">
        <div class="section-heading">
          <div>
            <h2 id="section-title">Disponibilidad del equipo</h2>
            <p>Explora el período y elige un día para ver el detalle.</p>
          </div>
        </div>
        <div class="calendar-layout">
          <div class="panel calendar-panel">
            <div class="calendar-tools">
              <h3>{{ monthLabel }}</h3>
              <div class="calendar-controls">
                <button
                  type="button"
                  aria-label="Mes anterior"
                  title="Mes anterior"
                  (click)="moveMonth(-1)"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Mes siguiente"
                  title="Mes siguiente"
                  (click)="moveMonth(1)"
                >
                  ›
                </button>
              </div>
            </div>
            <div class="calendar-weekdays" aria-hidden="true">
              <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span
              ><span>Sá</span><span>Do</span>
            </div>
            <div class="calendar-days">
              @for (day of days; track $index) {
                @if (day) {
                  <button
                    class="calendar-day"
                    type="button"
                    [attr.aria-label]="dayLabel(day)"
                    [attr.aria-pressed]="selectedDay === day"
                    (click)="selectedDay = day"
                  >
                    <span>{{ day }}</span
                    ><small>· Sin marcas</small>
                  </button>
                } @else {
                  <span aria-hidden="true"></span>
                }
              }
            </div>
            <p class="calendar-legend">· Sin marcas de disponibilidad</p>
          </div>
          <aside class="panel calendar-detail" aria-labelledby="day-title">
            <p class="eyebrow">Detalle del día</p>
            <h3 id="day-title">{{ dayLabel(selectedDay) }}</h3>
            <p>Aún no hay marcas de disponibilidad para este día.</p>
            <p class="calendar-note">
              La edición de disponibilidad llegará en un próximo incremento.
            </p>
          </aside>
        </div>
      </section>
    } @else {
      <section aria-labelledby="section-title">
        <div class="section-heading">
          <div>
            <h2 id="section-title">Consultas</h2>
            <p>Vota o revisa las decisiones de este equipo.</p>
          </div>
        </div>
        <div class="panel consultations-empty">
          <span class="empty-symbol" aria-hidden="true">?</span>
          <h3>Aún no hay consultas</h3>
          <p>Las consultas del equipo aparecerán aquí en un próximo incremento.</p>
        </div>
      </section>
    }
  `,
})
export class EmptySection {
  protected readonly section = inject(ActivatedRoute).snapshot.data['section'] as string;
  protected month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  protected selectedDay = new Date().getDate();

  protected get monthLabel(): string {
    const month = new Intl.DateTimeFormat('es', { month: 'short' })
      .format(this.month)
      .replace('.', '');
    return `${month[0].toUpperCase()}${month.slice(1)} '${String(this.month.getFullYear()).slice(-2)}`;
  }

  protected get days(): (number | null)[] {
    const first = (this.month.getDay() + 6) % 7;
    const total = new Date(this.month.getFullYear(), this.month.getMonth() + 1, 0).getDate();
    return [...Array<null>(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  }

  protected moveMonth(offset: number): void {
    this.month = new Date(this.month.getFullYear(), this.month.getMonth() + offset, 1);
    this.selectedDay = 1;
  }

  protected dayLabel(day: number): string {
    return new Intl.DateTimeFormat('es', { dateStyle: 'full' }).format(
      new Date(this.month.getFullYear(), this.month.getMonth(), day),
    );
  }
}
