import { Component, inject } from '@angular/core';
import { ThemePreference, ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-picker',
  template: `
    <div class="flex items-center gap-2 text-sm">
      <label class="font-semibold text-muted" for="theme">Tema</label>
      <select
        class="rounded-full border border-line bg-surface px-3 py-2 font-medium text-ink"
        id="theme"
        [value]="theme.preference()"
        (change)="setTheme($event)"
      >
        <option value="auto">Automático</option>
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
      </select>
    </div>
  `,
})
export class ThemePicker {
  protected readonly theme = inject(ThemeService);
  protected setTheme(event: Event): void {
    this.theme.setPreference((event.target as HTMLSelectElement).value as ThemePreference);
  }
}
