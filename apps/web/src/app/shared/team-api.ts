import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type AvailabilityState = 'available' | 'maybe' | 'unavailable';
export interface AvailabilityDay {
  date: string;
  state: AvailabilityState | null;
  counts: Record<AvailabilityState, number>;
  marks: { participantId: string; participantName: string; state: AvailabilityState }[];
}
export type ConsultationState = 'open' | 'resolved' | 'rejected';
export interface ConsultationOption {
  id: string;
  text: string;
  position: number;
}
export interface Consultation {
  id: string;
  type: 'text';
  title: string;
  state: ConsultationState;
  createdAt: string;
  createdBy: Participant;
  options: ConsultationOption[];
}
export interface ConsultationGroups {
  open: Consultation[];
  resolved: Consultation[];
  rejected: Consultation[];
}
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
  availability(from: string, to: string): Observable<{ days: AvailabilityDay[] }> {
    return this.http.get<{ days: AvailabilityDay[] }>('/api/teams/current/availability', {
      params: { from, to },
    });
  }
  mark(
    date: string,
    participantId: string,
    state: AvailabilityState | null,
    timeZone?: string,
  ): Observable<{ day: AvailabilityDay; expiresAt: string }> {
    return this.http.put<{ day: AvailabilityDay; expiresAt: string }>(
      `/api/teams/current/availability/${date}/participants/${participantId}`,
      { state, ...(timeZone ? { timeZone } : {}) },
    );
  }
  consultations(): Observable<ConsultationGroups> {
    return this.http.get<ConsultationGroups>('/api/teams/current/consultations');
  }
  createConsultation(
    participantId: string,
    title: string,
    options: string[],
  ): Observable<{ consultation: Consultation; expiresAt: string }> {
    return this.http.post<{ consultation: Consultation; expiresAt: string }>(
      '/api/teams/current/consultations',
      { participantId, title, options },
    );
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
