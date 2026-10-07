import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { accessTokenInterceptor, TeamApi } from './shared/team-api';

describe('TeamApi', () => {
  let http: HttpTestingController;
  let api: TeamApi;
  afterEach(() => {
    http.verify();
    window.location.hash = '';
  });

  it('reads public configuration before deciding which optional fields to show', () => {
    TestBed.configureTestingModule({
      providers: [
        TeamApi,
        provideHttpClient(withInterceptors([accessTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(TeamApi);
    api.publicConfiguration().subscribe((configuration) => {
      expect(configuration.teamCreationEmailEnabled).toBe(false);
    });
    const request = http.expectOne('/api/configuration');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ teamCreationEmailEnabled: false });
  });

  it('envía solo nombres y zona al crear un equipo (nunca el correo opcional)', () => {
    TestBed.configureTestingModule({
      providers: [
        TeamApi,
        provideHttpClient(withInterceptors([accessTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(TeamApi);
    api.create('Grupo', 'Ana').subscribe();
    const request = http.expectOne('/api/teams');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Grupo',
      firstParticipantName: 'Ana',
      timeZone: expect.any(String),
    });
    expect(request.request.body).not.toHaveProperty('email');
    request.flush({});
  });

  it('añade el secreto del fragmento como Bearer a cada lectura protegida', () => {
    window.location.hash = '#t=secreto-de-prueba';
    TestBed.configureTestingModule({
      providers: [
        TeamApi,
        provideHttpClient(withInterceptors([accessTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(TeamApi);
    api.current().subscribe();
    const request = http.expectOne('/api/teams/current');
    expect(request.request.headers.get('Authorization')).toBe('Bearer secreto-de-prueba');
    request.flush({});
  });

  it('añade el Bearer a la escritura protegida sin usar la identidad local', () => {
    window.location.hash = '#t=secreto-de-prueba';
    localStorage.setItem('synqo-participant-team', 'identity');
    TestBed.configureTestingModule({
      providers: [
        TeamApi,
        provideHttpClient(withInterceptors([accessTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(TeamApi);
    api.addParticipant('Bea').subscribe();
    const request = http.expectOne('/api/teams/current/participants');
    expect(request.request.headers.get('Authorization')).toBe('Bearer secreto-de-prueba');
    expect(request.request.body).toEqual({ name: 'Bea' });
    request.flush({});
    localStorage.removeItem('synqo-participant-team');
  });
});
