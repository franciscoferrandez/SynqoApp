/** Fixtures declare their buckets; this helper does not classify domain states. */
export function consultationListFixture(
  active: Record<string, unknown>[] = [],
  archived: Record<string, unknown>[] = [],
  today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(new Date()),
) {
  const summary = (item: Record<string, unknown>) => ({
    ...item,
    effectiveDate: item['effectiveDate'] ?? String(item['createdAt'] ?? today).slice(0, 10),
  });
  return {
    active: active.map(summary),
    archived: archived.map(summary),
    archivedCursor: null as string | null,
    listContext: { today, timeZone: 'Europe/Madrid', recentDays: 7, loadMoreCount: 10 },
  };
}
