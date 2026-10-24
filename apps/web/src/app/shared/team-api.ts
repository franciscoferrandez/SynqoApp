import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type AvailabilityState = 'available' | 'maybe' | 'unavailable';
export type AvailabilitySummaryRule = 'worst' | 'median' | 'mostFrequent';
export interface AvailabilityDay {
  date: string;
  state: AvailabilityState | null;
  summaryStates: Record<AvailabilitySummaryRule, AvailabilityState | null>;
  counts: Record<AvailabilityState, number>;
  marks: { participantId: string; participantName: string; state: AvailabilityState }[];
}
export type ConsultationState = 'open' | 'resolved' | 'rejected';
export type EventStatus = 'provisional' | 'definitive' | 'rejected';
export interface TeamEventSummary {
  id: string;
  title: string;
  date: string | null;
  status: EventStatus;
  lastModifiedAt: string | null;
  version: number;
}
export interface TeamEvent extends TeamEventSummary {
  notes: string | null;
  createdBy: Participant;
  createdAt: string;
  lastModifiedBy: Participant | null;
  consultations?: { id: string; title: string; state: ConsultationState }[];
}
export interface TeamEventListItem extends TeamEventSummary {
  effectiveDate: string;
  openConsultationId: string | null;
}
export interface ArchivedEvents {
  archived: TeamEventListItem[];
  archivedCursor: string | null;
  listContext: ListContext;
}
export interface TeamEventGroups extends ArchivedEvents {
  active: TeamEventListItem[];
}
export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  status: Exclude<EventStatus, 'rejected'>;
}
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
  lastModifiedBy?: Participant | null;
  lastModifiedAt?: string | null;
  options: ConsultationOption[];
  event?: TeamEventSummary;
  resolution?: {
    participant: Participant;
    resolvedAt: string;
    acceptedOptionIds: string[];
  };
}
export type ConsultationDetail = Omit<Consultation, 'options'> & {
  options: (ConsultationOption & { count: number; voters: Participant[] })[];
};
export interface ListContext {
  today: string;
  timeZone: string;
  recentDays: number;
  loadMoreCount: number;
}
export interface ConsultationListItem extends Consultation {
  effectiveDate: string;
}
export interface ArchivedConsultations {
  archived: ConsultationListItem[];
  archivedCursor: string | null;
  listContext: ListContext;
}
export interface ConsultationGroups extends ArchivedConsultations {
  active: ConsultationListItem[];
}
export interface ConsultationEdit {
  participantId: string;
  title?: string;
  timeZone?: string;
  optionChanges: {
    add: ({ id: string; text: string } | { id: string; date: string })[];
    update: { id: string; text: string }[];
    remove: string[];
  };
  confirmedRemovalOptionIds: string[];
}
export type ConsultationRemovalWithVotes = { id: string; count: number } & (
  { text: string; date?: never } | { date: string; text?: never }
);
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
  creationAllowance?: { maxTeams: number; windowMinutes: number; remaining: number };
  mailAttempt?: { status: 'pending'; receipt: string };
}
export interface PublicConfiguration {
  teamCreationEmailMode: 'hidden' | 'demo' | 'send';
  teamCreationMaxTeams: number;
  teamCreationWindowMinutes: number;
  demo?: {
    nextResetAt?: string;
    teams: { name: string; accessUrl: string; kind?: 'social' | 'music' }[];
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
  calendarEvents(from: string, to: string): Observable<{ events: CalendarEvent[] }> {
    return this.http.get<{ events: CalendarEvent[] }>('/api/teams/current/events/calendar', {
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
  loadArchivedConsultations(archivedCursor: string): Observable<ArchivedConsultations> {
    return this.http.get<ArchivedConsultations>('/api/teams/current/consultations', {
      params: { archivedCursor },
    });
  }
  consultation(id: string): Observable<ConsultationDetail> {
    return this.http.get<ConsultationDetail>(`/api/teams/current/consultations/${id}`);
  }
  editConsultation(
    id: string,
    changes: ConsultationEdit,
  ): Observable<{ consultation: ConsultationDetail; expiresAt: string }> {
    return this.http.patch<{ consultation: ConsultationDetail; expiresAt: string }>(
      `/api/teams/current/consultations/${id}`,
      changes,
    );
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
    event?: { eventId?: string | null; expectedEventVersion?: number },
  ): Observable<{ consultation: ConsultationDetail; expiresAt: string }> {
    return this.http.put<{ consultation: ConsultationDetail; expiresAt: string }>(
      `/api/teams/current/consultations/${consultationId}/resolution`,
      { participantId, status, acceptedOptionIds, ...event },
    );
  }
  events(): Observable<TeamEventGroups> {
    return this.http.get<TeamEventGroups>('/api/teams/current/events');
  }
  loadArchivedEvents(archivedCursor: string): Observable<ArchivedEvents> {
    return this.http.get<ArchivedEvents>('/api/teams/current/events', {
      params: { archivedCursor },
    });
  }
  event(id: string): Observable<{ event: TeamEvent }> {
    return this.http.get<{ event: TeamEvent }>(`/api/teams/current/events/${id}`);
  }
  createEvent(input: {
    participantId: string;
    title: string;
    notes: string | null;
    date: string | null;
    status: 'provisional' | 'definitive';
  }): Observable<{ event: TeamEvent; expiresAt: string }> {
    return this.http.post<{ event: TeamEvent; expiresAt: string }>(
      '/api/teams/current/events',
      input,
    );
  }
  updateEvent(
    id: string,
    input: {
      participantId: string;
      title: string;
      notes: string | null;
      date: string | null;
      status: 'provisional' | 'definitive';
    },
  ): Observable<{ event: TeamEvent; expiresAt: string }> {
    return this.http.put<{ event: TeamEvent; expiresAt: string }>(
      `/api/teams/current/events/${id}`,
      input,
    );
  }
  rejectEvent(
    id: string,
    participantId: string,
    disposition?: 'unlink' | 'reject_both',
  ): Observable<{ event: TeamEvent; expiresAt: string }> {
    return this.http.put<{ event: TeamEvent; expiresAt: string }>(
      `/api/teams/current/events/${id}/rejection`,
      { participantId, ...(disposition ? { disposition } : {}) },
    );
  }
  recoverEvent(
    id: string,
    participantId: string,
  ): Observable<{ event: TeamEvent; expiresAt: string }> {
    return this.http.put<{ event: TeamEvent; expiresAt: string }>(
      `/api/teams/current/events/${id}/recovery`,
      { participantId },
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
    createEvent = false,
  ): Observable<{ consultation: Consultation; expiresAt: string }> {
    return this.http.post<{ consultation: Consultation; expiresAt: string }>(
      '/api/teams/current/consultations',
      {
        type: 'date',
        participantId,
        title,
        options: dates,
        timeZone,
        createEvent,
      },
    );
  }
  setConsultationEvent(
    consultationId: string,
    eventId: string | null,
  ): Observable<{ consultation: Consultation; expiresAt: string }> {
    return this.http.put<{ consultation: Consultation; expiresAt: string }>(
      `/api/teams/current/consultations/${consultationId}/event`,
      { eventId },
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
