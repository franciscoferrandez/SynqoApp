import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MailAttemptStatus, TeamApi } from './team-api';

interface StoredAttempt {
  receipt: string;
  dismissed: boolean;
}

/** Remembers, per team and browser, the private receipt of the optional link email. */
@Injectable({ providedIn: 'root' })
export class MailAttemptTracker {
  private readonly api = inject(TeamApi);

  status(receipt: string): Observable<{ status: MailAttemptStatus }> {
    return this.api.mailAttemptStatus(receipt);
  }
  remember(teamId: string, receipt: string): void {
    this.write(teamId, { receipt, dismissed: false });
  }
  receipt(teamId: string): string | null {
    return this.read(teamId)?.receipt ?? null;
  }
  isDismissed(teamId: string): boolean {
    return this.read(teamId)?.dismissed ?? false;
  }
  dismiss(teamId: string): void {
    const stored = this.read(teamId);
    if (stored) this.write(teamId, { ...stored, dismissed: true });
  }
  forget(teamId: string): void {
    try {
      localStorage.removeItem(this.key(teamId));
    } catch {
      // Sin almacenamiento local el aviso simplemente no se recuerda.
    }
  }
  private key(teamId: string): string {
    return `synqo-mail-attempt-${teamId}`;
  }
  private read(teamId: string): StoredAttempt | null {
    try {
      const value = JSON.parse(localStorage.getItem(this.key(teamId)) ?? 'null') as unknown;
      if (
        value &&
        typeof (value as StoredAttempt).receipt === 'string' &&
        typeof (value as StoredAttempt).dismissed === 'boolean'
      )
        return value as StoredAttempt;
    } catch {
      // Un valor ilegible equivale a no tener resultado asociado.
    }
    return null;
  }
  private write(teamId: string, value: StoredAttempt): void {
    try {
      localStorage.setItem(this.key(teamId), JSON.stringify(value));
    } catch {
      // Sin almacenamiento local el aviso simplemente no se recuerda.
    }
  }
}
