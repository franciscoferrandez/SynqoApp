import { AvailabilityState, AvailabilitySummaryRule } from './team-api';

export function summarizeAvailability(
  counts: Record<AvailabilityState, number>,
): Record<AvailabilitySummaryRule, AvailabilityState | null> {
  const favorable: AvailabilityState[] = ['available', 'maybe', 'unavailable'];
  const total = favorable.reduce((sum, state) => sum + counts[state], 0);
  if (!total) return { worst: null, median: null, mostFrequent: null };
  const worst = [...favorable].reverse().find((state) => counts[state] > 0) ?? null;
  const ordered = favorable
    .flatMap((state) => Array(counts[state]).fill(state) as AvailabilityState[])
    .reverse();
  const lower = ordered[Math.floor((total - 1) / 2)];
  const upper = ordered[Math.floor(total / 2)];
  const median = lower === 'unavailable' && upper === 'available' ? 'maybe' : upper;
  const highestCount = Math.max(...favorable.map((state) => counts[state]));
  const mostFrequent = favorable.find((state) => counts[state] === highestCount) ?? null;
  return { worst, median, mostFrequent };
}
