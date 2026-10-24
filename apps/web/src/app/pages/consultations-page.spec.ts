import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { expect, it, vi } from 'vitest';
import {
  ArchivedConsultations,
  ConsultationGroups,
  ConsultationListItem,
  TeamApi,
} from '../shared/team-api';
import { ConsultationsPage } from './consultations-page';
import { ConsultationDetailPage } from './consultation-detail';
import { TeamLayout } from './team-layout';

const context = {
  today: '2026-10-24',
  timeZone: 'Europe/Madrid',
  recentDays: 7,
  loadMoreCount: 10,
};

function item(id: string): ConsultationListItem {
  return {
    id,
    title: id,
    type: 'text',
    state: 'open',
    createdAt: '2026-10-24T10:00:00Z',
    effectiveDate: '2026-10-24',
    createdBy: { id: 'actor', name: 'Ana' },
    options: [{ id: `${id}-option`, position: 0, text: 'Plan' }],
  };
}

function setup(initial: ConsultationGroups) {
  const pages: Subject<ArchivedConsultations>[] = [];
  const api = {
    consultations: vi.fn(() => of(initial)),
    loadArchivedConsultations: vi.fn(() => {
      const page = new Subject<ArchivedConsultations>();
      pages.push(page);
      return page;
    }),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: TeamApi, useValue: api },
      { provide: TeamLayout, useValue: { handleAccessError: () => false } },
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({})),
          snapshot: { paramMap: convertToParamMap({}) },
        },
      },
      { provide: Router, useValue: { navigate: vi.fn() } },
    ],
  });
  const fixture = TestBed.createComponent(ConsultationsPage);
  fixture.detectChanges();
  return { fixture, page: fixture.componentInstance, api, pages };
}

it('offers older history with no recent rows rather than an empty-team message', () => {
  const { fixture } = setup({
    active: [],
    archived: [],
    archivedCursor: 'older',
    listContext: context,
  });
  expect(fixture.nativeElement.textContent).toContain('Archivadas');
  expect(fixture.nativeElement.textContent).toContain('Cargar más');
  expect(fixture.nativeElement.textContent).not.toContain('Aún no hay consultas');
  fixture.destroy();
});

it('keeps rows on failure, retries the same cursor and appends without duplicate IDs', () => {
  const { fixture, page, api, pages } = setup({
    active: [item('active')],
    archived: [item('recent')],
    archivedCursor: 'older',
    listContext: context,
  });
  page.loadMore();
  page.loadMore();
  expect(api.loadArchivedConsultations).toHaveBeenCalledTimes(1);
  pages[0].error(new HttpErrorResponse({ status: 500 }));
  expect(page.archiveError).toBe(true);
  expect(page.consultations?.archived.map((entry) => entry.id)).toEqual(['recent']);
  page.loadMore();
  expect(api.loadArchivedConsultations).toHaveBeenNthCalledWith(2, 'older');
  pages[1].next({
    archived: [item('recent'), item('old'), item('old')],
    archivedCursor: null,
    listContext: context,
  });
  expect(page.consultations?.active.map((entry) => entry.id)).toEqual(['active']);
  expect(page.consultations?.archived.map((entry) => entry.id)).toEqual(['recent', 'old']);
  expect(page.archiveLoading).toBe(false);
  expect(page.archiveError).toBe(false);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).not.toContain('Cargar más');
  expect(fixture.nativeElement.textContent).toContain('Vigencia: 24 de octubre de 2026');
  fixture.destroy();
});

it('restarts the initial window when the server reports a changed civil-day context', () => {
  const { fixture, page, api, pages } = setup({
    active: [],
    archived: [item('previous-window')],
    archivedCursor: 'older',
    listContext: context,
  });
  api.consultations.mockReturnValue(
    of({
      active: [item('fresh')],
      archived: [],
      archivedCursor: 'fresh-cursor',
      listContext: { ...context, today: '2026-10-25' },
    }),
  );
  page.loadMore();
  pages[0].error(
    new HttpErrorResponse({
      status: 409,
      error: { type: 'urn:synqo:problem:list-context-changed' },
    }),
  );
  expect(api.consultations).toHaveBeenCalledTimes(2);
  expect(page.consultations?.archived).toEqual([]);
  expect(page.consultations?.active.map((entry) => entry.id)).toEqual(['fresh']);
  expect(page.consultations?.archivedCursor).toBe('fresh-cursor');
  fixture.destroy();
});

it('does not append an obsolete history response after reopening the list', () => {
  const { fixture, page, pages } = setup({
    active: [item('active')],
    archived: [],
    archivedCursor: 'older',
    listContext: context,
  });
  page.loadMore();
  page.openDetail('active');
  page.closeDetail();
  pages[0].next({
    archived: [item('late')],
    archivedCursor: null,
    listContext: context,
  });
  expect(page.consultations?.archived).toEqual([]);
  expect(page.consultations?.archivedCursor).toBe('older');
  fixture.destroy();
});

it.each([true, false])('restores focus with a returned card: %s', (present) => {
  vi.useFakeTimers();
  const { fixture, page } = setup({
    active: [item('active')],
    archived: [],
    archivedCursor: 'older',
    listContext: context,
  });
  document.body.appendChild(fixture.nativeElement);
  try {
    page.openDetail(present ? 'active' : 'outside-initial-window');
    page.closeDetail();
    fixture.detectChanges();
    vi.runAllTimers();
    const expected = fixture.nativeElement.querySelector(
      present ? '[data-consultation-id="active"]' : '.section-heading button',
    );
    expect(document.activeElement).toBe(expected);
  } finally {
    fixture.nativeElement.remove();
    fixture.destroy();
    vi.useRealTimers();
  }
});

it('does not move focus when another detail opens before list focus is restored', () => {
  vi.useFakeTimers();
  const { fixture, page } = setup({
    active: [item('active')],
    archived: [],
    archivedCursor: 'older',
    listContext: context,
  });
  document.body.appendChild(fixture.nativeElement);
  try {
    page.openDetail('outside-initial-window');
    page.closeDetail();
    fixture.detectChanges();
    const focused = fixture.nativeElement.querySelector('[data-consultation-id="active"]');
    focused.focus();
    page.openDetail('active');
    vi.runAllTimers();
    expect(document.activeElement).toBe(focused);
  } finally {
    fixture.nativeElement.remove();
    fixture.destroy();
    vi.useRealTimers();
  }
});

it('keeps the linked event selected while excluding an event occupied outside loaded history', async () => {
  const event = (id: string, openConsultationId: string | null) => ({
    id,
    title: id,
    status: 'provisional' as const,
    date: null,
    version: 1,
    lastModifiedAt: null,
    openConsultationId,
  });
  const api = {
    events: vi.fn(() =>
      of({
        unfinalized: [
          event('current', 'consultation'),
          event('free', null),
          event('occupied-outside-window', 'old-open-consultation'),
          { ...event('definitive', null), status: 'definitive' },
        ],
        future: [],
        past: [],
        rejected: [],
      }),
    ),
  };
  TestBed.configureTestingModule({
    imports: [ConsultationDetailPage],
    providers: [
      { provide: TeamApi, useValue: api },
      { provide: TeamLayout, useValue: { handleAccessError: () => false } },
    ],
  });
  await TestBed.compileComponents();
  const fixture = TestBed.createComponent(ConsultationDetailPage);
  const page = fixture.componentInstance;
  page.consultationId = 'consultation';
  page.consultation = {
    ...item('consultation'),
    options: [],
    event: event('current', 'consultation'),
  };
  page.openEventEditor();
  expect(page.draftEventId).toBe('current');
  expect(page.eligibleEvents.map((entry) => entry.id)).toEqual(['current', 'free']);
  expect(api.events).toHaveBeenCalledTimes(1);
  fixture.destroy();
});
