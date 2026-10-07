import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, expect, it, vi } from 'vitest';
import { CreatePage } from './create-page';
import { TeamApi, TeamCreated } from '../shared/team-api';
import { TEAM_CREATION_CONFIRMATION } from '../shared/team-flow-config';

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

it('enters directly when confirmation is disabled and remembers the creator identity and mail receipt', () => {
  const assign = vi.fn();
  vi.stubGlobal('window', {
    navigator: window.navigator,
    location: { assign },
    matchMedia: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
  const created: TeamCreated = {
    id: 'team-id',
    name: 'Equipo',
    timeZone: 'Europe/Madrid',
    expiresAt: '2027-01-01T00:00:00Z',
    firstParticipant: { id: 'ana', name: 'Ana' },
    accessUrl: 'http://localhost/e#t=full-link',
    mailAttempt: { status: 'pending', receipt: 'private-receipt' },
  };
  const api = {
    publicConfiguration: vi.fn(() =>
      of({
        teamCreationEmailEnabled: true,
        teamCreationMaxTeams: 2,
        teamCreationWindowMinutes: 60,
      }),
    ),
    create: vi.fn(() => of(created)),
    recentCreation: undefined,
  };
  const navigateByUrl = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      { provide: TeamApi, useValue: api },
      { provide: Router, useValue: { navigateByUrl } },
      { provide: TEAM_CREATION_CONFIRMATION, useValue: false },
    ],
  });
  const fixture = TestBed.createComponent(CreatePage);
  Reflect.set(fixture.componentInstance, 'examplesDisabled', true);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('#email')).not.toBeNull();
  expect(fixture.nativeElement.querySelector('#creation-limit-info')?.textContent).toContain(
    '2 equipos',
  );
  expect(fixture.nativeElement.querySelector('#creation-limit-info')?.textContent).toContain(
    '60 minutos',
  );
  const component = fixture.componentInstance;
  Reflect.set(component, 'teamName', 'Equipo');
  Reflect.set(component, 'participantName', 'Ana');
  Reflect.set(component, 'email', ' persona@example.invalid ');
  Reflect.get(component, 'create').call(component, new Event('submit'));
  expect(api.create).toHaveBeenCalledWith('Equipo', 'Ana', 'persona@example.invalid');
  expect(JSON.parse(localStorage.getItem('synqo-mail-attempt-team-id') ?? '')).toEqual({
    receipt: 'private-receipt',
    dismissed: false,
  });
  expect(localStorage.getItem('synqo-participant-team-id')).toBe('ana');
  expect(assign).toHaveBeenCalledWith(created.accessUrl);
  expect(navigateByUrl).not.toHaveBeenCalled();
  fixture.destroy();
});

it('shows the generic configured-limit message when creation is rate limited', () => {
  vi.stubGlobal('window', {
    navigator: window.navigator,
    location: window.location,
    matchMedia: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
  const api = {
    publicConfiguration: vi.fn(() =>
      of({
        teamCreationEmailEnabled: false,
        teamCreationMaxTeams: 2,
        teamCreationWindowMinutes: 60,
      }),
    ),
    create: vi.fn(() =>
      throwError(() => ({
        status: 429,
        error: { type: 'urn:synqo:problem:creation-limit-exceeded' },
      })),
    ),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: TeamApi, useValue: api },
      { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      { provide: TEAM_CREATION_CONFIRMATION, useValue: true },
    ],
  });
  const fixture = TestBed.createComponent(CreatePage);
  Reflect.set(fixture.componentInstance, 'examplesDisabled', true);
  fixture.detectChanges();
  const component = fixture.componentInstance;
  Reflect.set(component, 'teamName', 'Equipo');
  Reflect.set(component, 'participantName', 'Ana');
  Reflect.get(component, 'create').call(component, new Event('submit'));
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain(
    'Has alcanzado el límite de creación de equipos. Inténtalo de nuevo más tarde.',
  );
  fixture.destroy();
});

it('hides email when the public configuration disables it', () => {
  vi.stubGlobal('window', {
    navigator: window.navigator,
    location: window.location,
    matchMedia: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
  const api = {
    publicConfiguration: vi.fn(() =>
      of({
        teamCreationEmailEnabled: false,
        teamCreationMaxTeams: 2,
        teamCreationWindowMinutes: 60,
      }),
    ),
    create: vi.fn(),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: TeamApi, useValue: api },
      { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      { provide: TEAM_CREATION_CONFIRMATION, useValue: true },
    ],
  });
  const fixture = TestBed.createComponent(CreatePage);
  Reflect.set(fixture.componentInstance, 'examplesDisabled', true);
  expect(fixture.nativeElement.querySelector('#email')).toBeNull();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('#email')).toBeNull();
  expect(fixture.nativeElement.querySelector('#team-name')).not.toBeNull();
  expect(fixture.nativeElement.querySelector('#participant-name')).not.toBeNull();
  expect(fixture.nativeElement.textContent).not.toContain('Solo se usará para enviarte el enlace');
  fixture.destroy();
});

it('keeps email hidden when public configuration cannot be loaded', () => {
  vi.stubGlobal('window', {
    navigator: window.navigator,
    location: window.location,
    matchMedia: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
  const api = {
    publicConfiguration: vi.fn(() => throwError(() => new Error('offline'))),
    create: vi.fn(),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: TeamApi, useValue: api },
      { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      { provide: TEAM_CREATION_CONFIRMATION, useValue: true },
    ],
  });
  const fixture = TestBed.createComponent(CreatePage);
  Reflect.set(fixture.componentInstance, 'examplesDisabled', true);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('#email')).toBeNull();
  expect(fixture.nativeElement.querySelector('#team-name')).not.toBeNull();
  fixture.destroy();
});
