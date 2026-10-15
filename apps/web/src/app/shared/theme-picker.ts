import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-picker',
  template: `
    <button
      class="theme-cycle"
      type="button"
      (click)="cycle()"
      [attr.aria-label]="label()"
      [title]="label()"
    >
      @if (theme.preference() === 'auto') {
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <rect
            x="2.5"
            y="3.5"
            width="19"
            height="14"
            rx="2"
            stroke="currentColor"
            stroke-width="1.7"
          />
          <path
            d="M8 21h8m-4-3.5V21"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />
          @if (theme.effectiveTheme() === 'dark') {
            <path d="M15.5 6.5a4.6 4.6 0 1 0 2 7.3 4.7 4.7 0 0 1-2-7.3Z" fill="currentColor" />
          } @else {
            <circle cx="12" cy="10.5" r="2.7" fill="currentColor" />
          }
        </svg>
      } @else if (theme.preference() === 'light') {
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" />
          <path
            d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      } @else {
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.5 16.6A9 9 0 0 1 7.4 3.5a9 9 0 1 0 13.1 13.1Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
        </svg>
      }
    </button>
  `,
})
export class ThemePicker {
  protected readonly theme = inject(ThemeService);
  protected cycle(): void {
    const next = { auto: 'light', light: 'dark', dark: 'auto' } as const;
    this.theme.setPreference(next[this.theme.preference()]);
  }

  protected label(): string {
    const preference = this.theme.preference();
    const current =
      preference === 'auto'
        ? `automático (${this.theme.effectiveTheme() === 'dark' ? 'oscuro' : 'claro'})`
        : preference === 'light'
          ? 'claro'
          : 'oscuro';
    const next = preference === 'auto' ? 'claro' : preference === 'light' ? 'oscuro' : 'automático';
    return `Tema ${current}. Cambiar a ${next}`;
  }
}
