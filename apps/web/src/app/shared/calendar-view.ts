import { AvailabilitySummaryRule } from './team-api';
export function civilDate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}
export function visibleDates(year: number, month: number, extended: boolean): string[] {
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  if (extended) {
    first.setUTCDate(first.getUTCDate() - ((first.getUTCDay() + 6) % 7));
    last.setUTCDate(last.getUTCDate() + ((7 - last.getUTCDay()) % 7));
  }
  const dates: string[] = [];
  for (const date = new Date(first); date <= last; date.setUTCDate(date.getUTCDate() + 1))
    dates.push(civilDate(date));
  return dates;
}

export const calendarPreferenceKey = 'synqo:calendar-view:v2';
export const previousCalendarPreferenceKey = 'synqo:calendar-view:v1';
export interface CalendarPreferences {
  extended: boolean;
  overlay: boolean;
  counts: boolean;
  rule: AvailabilitySummaryRule;
}
const defaultCalendarPreferences: CalendarPreferences = {
  extended: false,
  overlay: false,
  counts: false,
  rule: 'worst',
};

export function parseCalendarPreferences(value: string | null): CalendarPreferences {
  if (!value) return { ...defaultCalendarPreferences };
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'extended' in parsed &&
      typeof parsed.extended === 'boolean' &&
      'overlay' in parsed &&
      typeof parsed.overlay === 'boolean' &&
      'counts' in parsed &&
      typeof parsed.counts === 'boolean'
    )
      return {
        extended: parsed.extended,
        overlay: parsed.overlay,
        counts: parsed.counts,
        rule:
          'rule' in parsed &&
          (parsed.rule === 'worst' || parsed.rule === 'median' || parsed.rule === 'mostFrequent')
            ? parsed.rule
            : 'worst',
      };
  } catch {
    // Una preferencia antigua o dañada no debe impedir abrir el calendario.
  }
  return { ...defaultCalendarPreferences };
}
