import { describe, expect, it } from 'vitest';
import { parseCalendarPreferences } from './availability-calendar';

describe('calendar preferences', () => {
  it('preserves old display options and defaults to the worst rule', () => {
    expect(parseCalendarPreferences('{"extended":true,"overlay":false,"counts":true}')).toEqual({
      extended: true,
      overlay: false,
      counts: true,
      rule: 'worst',
    });
  });

  it('ignores an unknown rule while preserving valid display options', () => {
    expect(
      parseCalendarPreferences('{"extended":true,"overlay":true,"counts":false,"rule":"unknown"}'),
    ).toEqual({ extended: true, overlay: true, counts: false, rule: 'worst' });
  });
});
