export function eventListFixture(
  active: unknown[] = [],
  archived: unknown[] = [],
  today = '2026-10-18',
  timeZone = 'Europe/Madrid',
) {
  return {
    active,
    archived,
    archivedCursor: null,
    listContext: { today, timeZone, recentDays: 7, loadMoreCount: 10 },
  };
}
