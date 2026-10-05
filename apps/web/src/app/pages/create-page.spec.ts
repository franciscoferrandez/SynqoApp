import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, expect, it, vi } from 'vitest';
import { CreatePage } from './create-page';
import { TeamApi, TeamCreated } from '../shared/team-api';
import { TEAM_CREATION_CONFIRMATION } from '../shared/team-flow-config';

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

it('enters directly when confirmation is disabled and remembers the creator identity', () => {
  const assign = vi.fn();
  vi.stubGlobal('window', {
    navigator: window.navigator,
    location: { assign },
    matchMedia: () => ({ addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
  const created: TeamCreated = {
    id: 'team-id',
    name: 'Equipo',
    timeZone: 'Europe/Madrid',
    expiresAt: '2027-01-01T00:00:00Z',
    firstParticipant: { id: 'ana', name: 'Ana' },
    accessUrl: 'http://localhost/e#t=full-link',
  };
  const api = {
    create: vi.fn(() => of(created)),
    recentCreation: undefined,
    recentCreationHadEmail: false,
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
  const component = fixture.componentInstance;
  Reflect.set(component, 'teamName', 'Equipo');
  Reflect.set(component, 'participantName', 'Ana');
  Reflect.set(component, 'email', 'ignored@example.invalid');
  Reflect.get(component, 'create').call(component, new Event('submit'));
  expect(api.create).toHaveBeenCalledWith('Equipo', 'Ana');
  expect(localStorage.getItem('synqo-participant-team-id')).toBe('ana');
  expect(assign).toHaveBeenCalledWith(created.accessUrl);
  expect(navigateByUrl).not.toHaveBeenCalled();
  fixture.destroy();
});
