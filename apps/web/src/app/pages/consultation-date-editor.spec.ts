import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { afterEach, expect, it, vi } from 'vitest';
import { ConsultationDateEditor } from './consultation-date-editor';
import { ConsultationEdit, TeamApi } from '../shared/team-api';
import { TeamLayout } from './team-layout';

afterEach(() => localStorage.clear());

function setup(edit = true, initialMonth?: string) {
  const api = {
    consultation: vi.fn(() =>
      of({
        id: 'consultation',
        type: 'date',
        title: ' Título sin recortar ',
        state: 'open',
        options: [{ id: 'past-option', date: '2000-01-01', count: 2, voters: [] }],
      }),
    ),
    availability: vi.fn(() => of({ days: [] })),
    calendarEvents: vi.fn(() => of({ events: [] })),
    editConsultation: vi.fn<(id: string, changes: ConsultationEdit) => Observable<never>>(() =>
      throwError(() => new HttpErrorResponse({ status: 500 })),
    ),
    createDateConsultation: vi.fn(() => throwError(() => new HttpErrorResponse({ status: 500 }))),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: TeamApi, useValue: api },
      {
        provide: TeamLayout,
        useValue: {
          participantId: 'actor',
          team: { timeZone: 'Europe/Madrid' },
          handleAccessError: () => false,
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(ConsultationDateEditor);
  const editor = fixture.componentInstance;
  if (edit) editor.consultationId = 'consultation';
  editor.initialMonth = initialMonth;
  editor.ngOnInit();
  return { editor, api, fixture };
}

it.each(['2001-02', '2031-12'])(
  'opens creation at the supplied month %s with no dates',
  (month) => {
    const { editor, api, fixture } = setup(false, month);
    expect(editor.month).toBe(month);
    expect(editor.dates[0].slice(0, 7)).toBe(month);
    expect(editor.options).toEqual([]);
    expect(editor.title).toBe('');
    expect(api.createDateConsultation).not.toHaveBeenCalled();
    fixture.destroy();
  },
);

it.each([undefined, '', '2031-00', '2031-13', '2031-2', '0000-01', 'invalid'])(
  'falls back to the current month for absent or invalid initial month %s',
  (month) => {
    const { editor, fixture } = setup(false, month);
    expect(editor.month).toBe(editor.today.slice(0, 7));
    fixture.destroy();
  },
);

it('keeps the existing consultation month when editing despite an initial month input', () => {
  const { editor, fixture } = setup(true, '2031-12');
  expect(editor.month).toBe('2000-01');
  expect(editor.selected('2000-01-01')).toBe(true);
  fixture.destroy();
});

it('restores an original past date with its identity and votes and sends only changed fields', () => {
  const { editor, api, fixture } = setup();
  expect(editor.selected('2000-01-01')).toBe(true);
  editor.toggle('2000-01-01');
  expect(editor.selected('2000-01-01')).toBe(false);
  editor.toggle('2000-01-01');
  expect(editor.options).toEqual([
    { id: 'past-option', date: '2000-01-01', count: 2, original: true, removed: false },
  ]);
  expect(editor.dirty).toBe(false);
  editor.save();
  expect(api.editConsultation).toHaveBeenCalledWith(
    'consultation',
    expect.objectContaining({ optionChanges: { add: [], update: [], remove: [] } }),
  );
  expect(api.editConsultation.mock.calls[0][1]).not.toHaveProperty('title');
  fixture.destroy();
});

it('confirms only voted removals at save and keeps new UUIDs across failed retries', () => {
  const { editor, api, fixture } = setup();
  editor.toggle(editor.today);
  const id = editor.options.find((option) => !option.original)!.id;
  editor.toggle('2000-01-01');
  expect(editor.stage).toBe('edit');
  editor.save();
  expect(editor.stage).toBe('removal');
  expect(api.editConsultation).not.toHaveBeenCalled();
  editor.confirmRemoval();
  editor.save();
  expect(api.editConsultation).toHaveBeenCalledTimes(2);
  for (const call of api.editConsultation.mock.calls)
    expect(call[1]).toEqual(
      expect.objectContaining({
        optionChanges: { add: [{ id, date: editor.today }], update: [], remove: ['past-option'] },
        confirmedRemovalOptionIds: ['past-option'],
      }),
    );
  fixture.destroy();
});

it('preserves draft and requires confirmation when a previously unvoted removal receives votes', () => {
  const { editor, api, fixture } = setup();
  editor.options[0].count = 0;
  editor.toggle(editor.today);
  editor.toggle('2000-01-01');
  api.editConsultation.mockImplementationOnce(() =>
    throwError(
      () =>
        new HttpErrorResponse({
          status: 409,
          error: {
            type: 'urn:synqo:problem:consultation-removal-confirmation-required',
            optionsWithVotes: [{ id: 'past-option', date: '2000-01-01', count: 1 }],
          },
        }),
    ),
  );
  editor.save();
  expect(editor.stage).toBe('removal');
  expect(editor.pendingRemovals[0].date).toBe('2000-01-01');
  editor.backToEdit();
  expect(editor.selected(editor.today)).toBe(true);
  expect(editor.title).toBe(' Título sin recortar ');
  fixture.destroy();
});

it('reads preferences without writing them and keeps draft on calendar failure', () => {
  const stored = JSON.stringify({ extended: true, overlay: true, counts: true, rule: 'median' });
  localStorage.setItem('synqo:calendar-view:v2', stored);
  const { editor, api, fixture } = setup(false);
  editor.title = 'Nueva fecha';
  editor.toggle(editor.today);
  expect(editor.preferences.rule).toBe('median');
  expect(editor.dates.length % 7).toBe(0);
  api.availability.mockImplementationOnce(() =>
    throwError(() => new HttpErrorResponse({ status: 500 })),
  );
  editor.loadCalendar();
  expect(editor.calendarFailed).toBe(true);
  expect(editor.selected(editor.today)).toBe(true);
  expect(editor.dayLabel(editor.today)).toContain('no disponibles');
  editor.loadCalendar();
  expect(editor.calendarFailed).toBe(false);
  expect(localStorage.getItem('synqo:calendar-view:v2')).toBe(stored);
  fixture.destroy();
});

it('ignores a cancelled older calendar response after navigating months', () => {
  const { editor, api, fixture } = setup(false);
  const old = new Subject<{ days: [] }>();
  api.availability.mockReturnValueOnce(old);
  editor.loadCalendar();
  editor.moveMonth(1);
  old.error(new HttpErrorResponse({ status: 500 }));
  expect(editor.calendarLoading).toBe(false);
  expect(editor.calendarFailed).toBe(false);
  fixture.destroy();
});

it('retries a previously submitted date with the same UUID after midnight and leaves validation to API', () => {
  const { editor, api, fixture } = setup();
  const addedDate = editor.today;
  editor.toggle(addedDate);
  editor.save();
  const sent = api.editConsultation.mock.calls[0][1].optionChanges.add;
  vi.spyOn(editor, 'today', 'get').mockReturnValue('9999-12-31');
  editor.save();
  expect(api.editConsultation).toHaveBeenCalledTimes(2);
  expect(api.editConsultation.mock.calls[1][1].optionChanges.add).toEqual(sent);
  fixture.destroy();
});

it('blocks an unsent new date that has become past before saving', () => {
  const { editor, api, fixture } = setup();
  editor.toggle(editor.today);
  vi.spyOn(editor, 'today', 'get').mockReturnValue('9999-12-31');
  editor.save();
  expect(api.editConsultation).not.toHaveBeenCalled();
  expect(editor.error).toContain('ya han pasado');
  fixture.destroy();
});
