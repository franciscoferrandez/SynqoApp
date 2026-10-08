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
export type ConsultationOption = {
  id: string;
  position: number;
} & ({ text: string; date?: never } | { date: string; text?: never });
export interface Consultation {
  id: string;
  type: 'text' | 'date';
  title: string;
  state: ConsultationState;
  createdAt: string;
  createdBy: Participant;
  options: ConsultationOption[];
  resolution?: {
    participant: Participant;
    resolvedAt: string;
    acceptedOptionIds: string[];
  };
}
export type ConsultationDetail = Omit<Consultation, 'options'> & {
  options: (ConsultationOption & { count: number; voters: Participant[] })[];
};
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
  mailAttempt?: { status: 'pending'; receipt: string };
}
export interface PublicConfiguration {
  teamCreationEmailEnabled: boolean;
  teamCreationMaxTeams: number;
  teamCreationWindowMinutes: number;
  demo?: {
    nextResetAt: string;
    teams: { name: string; accessUrl: string }[];
  };
}
export type MailAttemptStatus = 'pending' | 'succeeded' | 'failed';
export interface TeamData {
  id: string;
  name: string;
  timeZone: string;
  expiresAt: string;
  participants: Participant[];
}

export const accessTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = new URLSearchParams(location.hash.slice(1)).get('t');
  const isPublicConfiguration = request.url === '/api/configuration';
  return next(
    token && request.url.includes('/api/') && !isPublicConfiguration
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request,
  );
};

@Injectable({ providedIn: 'root' })
export class TeamApi {
  private readonly http = inject(HttpClient);
  recentCreation?: TeamCreated;
  publicConfiguration(): Observable<PublicConfiguration> {
    return this.http.get<PublicConfiguration>('/api/configuration');
  }
  create(name: string, firstParticipantName: string, email?: string): Observable<TeamCreated> {
    const deviceKey = getCreationDeviceKey();
    return this.http.post<TeamCreated>(
      '/api/teams',
      {
        name,
        firstParticipantName,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(email ? { email } : {}),
      },
      { headers: deviceKey ? { 'X-Creation-Device': deviceKey } : {} },
    );
  }
  mailAttemptStatus(receipt: string): Observable<{ status: MailAttemptStatus }> {
    return this.http.get<{ status: MailAttemptStatus }>('/api/mail-attempts/current', {
      headers: { 'X-Mail-Receipt': receipt },
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
  consultation(id: string): Observable<ConsultationDetail> {
    return this.http.get<ConsultationDetail>(`/api/teams/current/consultations/${id}`);
  }
  vote(
    consultationId: string,
    participantId: string,
    optionId: string,
    selected: boolean,
  ): Observable<{ consultation: ConsultationDetail; expiresAt: string }> {
    return this.http.put<{ consultation: ConsultationDetail; expiresAt: string }>(
      `/api/teams/current/consultations/${consultationId}/votes/${participantId}/options/${optionId}`,
      { selected },
    );
  }
  resolveConsultation(
    consultationId: string,
    participantId: string,
    status: 'resolved' | 'rejected',
    acceptedOptionIds: string[],
  ): Observable<{ consultation: ConsultationDetail; expiresAt: string }> {
    return this.http.put<{ consultation: ConsultationDetail; expiresAt: string }>(
      `/api/teams/current/consultations/${consultationId}/resolution`,
      { participantId, status, acceptedOptionIds },
    );
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
  createDateConsultation(
    participantId: string,
    title: string,
    dates: string[],
    timeZone: string,
  ): Observable<{ consultation: Consultation; expiresAt: string }> {
    return this.http.post<{ consultation: Consultation; expiresAt: string }>(
      '/api/teams/current/consultations',
      { type: 'date', participantId, title, options: dates, timeZone },
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

const CREATION_DEVICE_STORAGE_KEY = 'synqo-creation-origin-v1';
const CREATION_DEVICE_KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function getCreationDeviceKey(): string | undefined {
  try {
    const storage = globalThis.localStorage;
    const existing = storage.getItem(CREATION_DEVICE_STORAGE_KEY);
    if (existing && CREATION_DEVICE_KEY_PATTERN.test(existing)) return existing;

    const bytes = new Uint8Array(32);
    globalThis.crypto.getRandomValues(bytes);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const key = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    storage.setItem(CREATION_DEVICE_STORAGE_KEY, key);
    return key;
  } catch {
    // Storage/crypto restrictions fall back to an IP when one is trustworthy.
    return undefined;
  }
}
