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
    publicConfiguration: vi.fn(() => of({ teamCreationEmailEnabled: true })),
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

it('hides email when the public configuration disables it', () => {
  vi.stubGlobal('window', {
    navigator: window.navigator,
    location: window.location,
    matchMedia: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
  const api = {
    publicConfiguration: vi.fn(() => of({ teamCreationEmailEnabled: false })),
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
