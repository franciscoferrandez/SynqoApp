import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Participant {
  id: string;
  name: string;
}
export interface TeamCreated {
  id: string;
  name: string;
  timeZone: string;
  expiresAt: string;
  firstParticipant: Participant;
  accessUrl: string;
}
export interface TeamData {
  id: string;
  name: string;
  timeZone: string;
  expiresAt: string;
  participants: Participant[];
}

export const accessTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = new URLSearchParams(location.hash.slice(1)).get('t');
  return next(
    token && request.url.includes('/api/')
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request,
  );
};

@Injectable({ providedIn: 'root' })
export class TeamApi {
  private readonly http = inject(HttpClient);
  recentCreation?: TeamCreated;
  recentCreationHadEmail = false;
  create(name: string, firstParticipantName: string): Observable<TeamCreated> {
    return this.http.post<TeamCreated>('/api/teams', {
      name,
      firstParticipantName,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }
  current(): Observable<TeamData> {
    return this.http.get<TeamData>('/api/teams/current');
  }
  addParticipant(name: string): Observable<{ participant: Participant; expiresAt: string }> {
    return this.http.post<{ participant: Participant; expiresAt: string }>(
      '/api/teams/current/participants',
      { name },
    );
  }
}
