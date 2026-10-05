import { InjectionToken } from '@angular/core';

/** Internal deployment switch; the user-facing default keeps the confirmation page. */
export const TEAM_CREATION_CONFIRMATION = new InjectionToken<boolean>(
  'TEAM_CREATION_CONFIRMATION',
  { providedIn: 'root', factory: () => true },
);
