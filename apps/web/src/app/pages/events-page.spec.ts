import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { expect, it, vi } from 'vitest';
import { ArchivedEvents, TeamEventGroups, TeamEventListItem, TeamApi } from '../shared/team-api';
import { EventsPage } from './events-page';
import { TeamLayout } from './team-layout';

const context = {
  today: '2026-10-24',
  timeZone: 'Europe/Madrid',
  recentDays: 7,
  loadMoreCount: 10,
};

function item(id: string): TeamEventListItem {
  return {
    id,
    title: id,
    status: 'provisional',
    date: null,
    version: 1,
    lastModifiedAt: null,
    effectiveDate: '2026-10-24',
    openConsultationId: null,
  };
}

function setup(initial: TeamEventGroups) {
  const pages: Subject<ArchivedEvents>[] = [];
  const api = {
    events: vi.fn(() => of(initial)),
    event: vi.fn(() =>
      of({
        event: {
          ...item('detail'),
          notes: null,
          createdAt: '2026-10-24T10:00:00Z',
          createdBy: { id: 'actor', name: 'Ana' },
          lastModifiedBy: null,
        },
      }),
    ),
    loadArchivedEvents: vi.fn(() => {
      const page = new Subject<ArchivedEvents>();
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
  const fixture = TestBed.createComponent(EventsPage);
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
  expect(fixture.nativeElement.textContent).toContain('Archivados');
  expect(fixture.nativeElement.textContent).toContain('Cargar más');
  expect(fixture.nativeElement.textContent).not.toContain('Aún no hay eventos');
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
  expect(api.loadArchivedEvents).toHaveBeenCalledTimes(1);
  pages[0].error(new HttpErrorResponse({ status: 500 }));
  expect(page.archiveError).toBe(true);
  expect(page.groups?.archived.map((entry) => entry.id)).toEqual(['recent']);
  page.loadMore();
  expect(api.loadArchivedEvents).toHaveBeenNthCalledWith(2, 'older');
  pages[1].next({
    archived: [item('recent'), item('old'), item('old')],
    archivedCursor: null,
    listContext: context,
  });
  expect(page.groups?.active.map((entry) => entry.id)).toEqual(['active']);
  expect(page.groups?.archived.map((entry) => entry.id)).toEqual(['recent', 'old']);
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
  api.events.mockReturnValue(
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
  expect(api.events).toHaveBeenCalledTimes(2);
  expect(page.groups?.archived).toEqual([]);
  expect(page.groups?.active.map((entry) => entry.id)).toEqual(['fresh']);
  expect(page.groups?.archivedCursor).toBe('fresh-cursor');
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
  expect(page.groups?.archived).toEqual([]);
  expect(page.groups?.archivedCursor).toBe('older');
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
      present ? '[data-event-id="active"]' : '.section-heading button',
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
  const focused = document.createElement('button');
  document.body.appendChild(fixture.nativeElement);
  document.body.appendChild(focused);
  try {
    page.openDetail('outside-initial-window');
    page.closeDetail();
    fixture.detectChanges();
    focused.focus();
    page.openDetail('active');
    vi.runAllTimers();
    expect(document.activeElement).toBe(focused);
  } finally {
    focused.remove();
    fixture.nativeElement.remove();
    fixture.destroy();
    vi.useRealTimers();
  }
});

it('renders every server row in its supplied order and preserves the civil effective date', () => {
  const active = [
    { ...item('old-provisional'), date: '2020-01-01', effectiveDate: '2020-01-01' },
    { ...item('next'), effectiveDate: '2026-10-25' },
  ];
  const archived = Array.from({ length: 13 }, (_, index) => ({
    ...item(`recent-${index}`),
    status: 'rejected' as const,
  }));
  const { fixture, page } = setup({
    active,
    archived,
    archivedCursor: null,
    listContext: { ...context, recentDays: 3, loadMoreCount: 4 },
  });
  const cards = [...fixture.nativeElement.querySelectorAll('[data-event-id]')] as HTMLElement[];
  expect(cards.map((card) => card.dataset['eventId'])).toEqual(
    [...active, ...archived].map((entry) => entry.id),
  );
  expect(cards[0].textContent).toContain('Vigencia: 1 de enero de 2020');
  expect(page.effectiveDateLabel('2026-10-25')).toBe('25 de octubre de 2026');
  fixture.destroy();
});
