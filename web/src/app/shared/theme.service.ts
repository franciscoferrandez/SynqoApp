import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type ThemePreference = 'auto' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  readonly preference = signal<ThemePreference>(this.readPreference());

  constructor() {
    this.apply();
    this.media?.addEventListener('change', () => this.apply());
  }

  setPreference(value: ThemePreference): void {
    this.preference.set(value);
    try {
      this.document.defaultView?.localStorage.setItem('synqo:theme', value);
    } catch {
      // El tema sigue funcionando aunque el navegador no permita almacenamiento.
    }
    this.apply();
  }

  private readPreference(): ThemePreference {
    try {
      const value = this.document.defaultView?.localStorage.getItem('synqo:theme');
      if (value === 'auto' || value === 'light' || value === 'dark') return value;
    } catch {
      // El modo automático es el valor de respaldo.
    }
    return 'auto';
  }

  private apply(): void {
    const preference = this.preference();
    this.document.documentElement.dataset['theme'] =
      preference === 'auto' && this.media?.matches
        ? 'dark'
        : preference === 'auto'
          ? 'light'
          : preference;
  }
}
