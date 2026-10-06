import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MailAttemptNotice } from './mail-attempt-notice';
import { MailAttemptTracker } from './mail-attempt-tracker';
import { TeamApi } from './team-api';

const status = vi.fn();

beforeEach(() => {
  status.mockReset();
  TestBed.configureTestingModule({
    providers: [{ provide: TeamApi, useValue: { mailAttemptStatus: status } }],
  });
});
afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

function render(context: 'team' | 'confirmation' = 'team') {
  const fixture = TestBed.createComponent(MailAttemptNotice);
  fixture.componentRef.setInput('teamId', 'team-1');
  fixture.componentRef.setInput('accessUrl', 'http://localhost/e#t=full-link');
  fixture.componentRef.setInput('context', context);
  fixture.componentRef.setInput('progress', true);
  fixture.detectChanges();
  return fixture;
}

it('shows nothing and asks nothing when this browser has no receipt', () => {
  render();
  expect(status).not.toHaveBeenCalled();
});

it('shows the failure with the link, keeps it after reload and persists its dismissal', () => {
  TestBed.inject(MailAttemptTracker).remember('team-1', 'receipt');
  status.mockReturnValue(of({ status: 'failed' }));
  let fixture = render();
  expect(status).toHaveBeenCalledWith('receipt');
  expect(fixture.nativeElement.querySelector('[data-mail-failed]')).not.toBeNull();
  expect(fixture.nativeElement.querySelector('[data-mail-failed-link]').textContent).toContain(
    'http://localhost/e#t=full-link',
  );
  fixture.destroy();

  fixture = render();
  expect(fixture.nativeElement.querySelector('[data-mail-failed]')).not.toBeNull();
  fixture.nativeElement.querySelector('button.dismiss').click();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[data-mail-failed]')).toBeNull();
  fixture.destroy();

  fixture = render();
  expect(fixture.nativeElement.querySelector('[data-mail-failed]')).toBeNull();
  expect(JSON.parse(localStorage.getItem('synqo-mail-attempt-team-1') ?? '')).toEqual({
    receipt: 'receipt',
    dismissed: true,
  });
});

it('keeps polling while pending and reveals a late failure', () => {
  vi.useFakeTimers();
  TestBed.inject(MailAttemptTracker).remember('team-1', 'receipt');
  status.mockReturnValueOnce(of({ status: 'pending' })).mockReturnValue(of({ status: 'failed' }));
  const fixture = render('confirmation');
  expect(fixture.nativeElement.textContent).toContain('Estamos enviando el enlace por correo');
  expect(fixture.nativeElement.querySelector('[data-mail-failed]')).toBeNull();
  vi.advanceTimersByTime(2000);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[data-mail-failed]')).not.toBeNull();
  vi.advanceTimersByTime(10_000);
  expect(status).toHaveBeenCalledTimes(2);
});

it('forgets the receipt after success or when the attempt no longer exists', () => {
  const tracker = TestBed.inject(MailAttemptTracker);
  tracker.remember('team-1', 'receipt');
  status.mockReturnValue(of({ status: 'succeeded' }));
  const fixture = render('confirmation');
  expect(fixture.nativeElement.textContent).toContain('El correo con el enlace se ha enviado');
  expect(fixture.nativeElement.textContent).not.toContain('llegado');
  expect(tracker.receipt('team-1')).toBeNull();
  fixture.destroy();

  tracker.remember('team-1', 'receipt');
  status.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
  render();
  expect(tracker.receipt('team-1')).toBeNull();
});

it('does not keep polling after being destroyed with a request in flight', () => {
  vi.useFakeTimers();
  TestBed.inject(MailAttemptTracker).remember('team-1', 'receipt');
  const pending = new Subject<{ status: string }>();
  status.mockReturnValue(pending);
  const fixture = render();
  fixture.destroy();
  pending.next({ status: 'pending' });
  vi.advanceTimersByTime(10_000);
  expect(status).toHaveBeenCalledTimes(1);
});
