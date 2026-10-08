import { TestBed } from '@angular/core/testing';
import { afterEach, expect, it, vi } from 'vitest';
import { DemoResetTimer } from './demo-reset-timer';

afterEach(() => vi.useRealTimers());

it('counts down to the next UTC hour without a live announcement every second', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2030-01-01T10:59:55Z'));
  TestBed.configureTestingModule({ imports: [DemoResetTimer] });
  const fixture = TestBed.createComponent(DemoResetTimer);
  fixture.componentRef.setInput('resetAt', '2030-01-01T11:00:00+00:00');
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('0 min 5 s');
  expect(fixture.nativeElement.querySelector('[aria-live="off"]')).not.toBeNull();
  vi.advanceTimersByTime(6_000);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('59 min 59 s');
  fixture.destroy();
});
