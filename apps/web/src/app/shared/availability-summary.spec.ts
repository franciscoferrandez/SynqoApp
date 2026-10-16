import { describe, expect, it } from 'vitest';
import { summarizeAvailability } from './availability-summary';

describe('summarizeAvailability', () => {
  it.each([
    [{ available: 0, maybe: 0, unavailable: 0 }, [null, null, null]],
    [{ available: 1, maybe: 0, unavailable: 1 }, ['unavailable', 'maybe', 'available']],
    [{ available: 1, maybe: 1, unavailable: 0 }, ['maybe', 'available', 'available']],
    [{ available: 0, maybe: 1, unavailable: 1 }, ['unavailable', 'maybe', 'maybe']],
    [{ available: 1, maybe: 1, unavailable: 1 }, ['unavailable', 'maybe', 'available']],
    [{ available: 2, maybe: 0, unavailable: 2 }, ['unavailable', 'maybe', 'available']],
    [{ available: 1, maybe: 2, unavailable: 1 }, ['unavailable', 'maybe', 'maybe']],
  ] as const)('matches the API for counts %j', (counts, [worst, median, mostFrequent]) => {
    expect(summarizeAvailability(counts)).toEqual({ worst, median, mostFrequent });
  });
});
