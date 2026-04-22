import { describe, it, expect } from 'vitest';
import { filterGAByDateRange, correlateData } from './ga-aggregation';
import type { GADailyRecord, DailyAnalytics } from './types';

describe('filterGAByDateRange', () => {
  const daily: GADailyRecord[] = [
    { date: '2026-03-01', sessions: 10, formSubmits: 1, viewSearchResults: 0, bookingConfirmed: 0 },
    { date: '2026-03-15', sessions: 20, formSubmits: 2, viewSearchResults: 1, bookingConfirmed: 0 },
    { date: '2026-04-01', sessions: 30, formSubmits: 3, viewSearchResults: 2, bookingConfirmed: 1 },
    { date: '2026-04-08', sessions: 40, formSubmits: 4, viewSearchResults: 3, bookingConfirmed: 0 },
  ];

  it('filters to date range (inclusive)', () => {
    const result = filterGAByDateRange(daily, '2026-03-15', '2026-04-01');
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2026-03-15');
    expect(result[1].date).toBe('2026-04-01');
  });

  it('returns empty for non-overlapping range', () => {
    const result = filterGAByDateRange(daily, '2026-05-01', '2026-05-31');
    expect(result).toHaveLength(0);
  });

  it('returns all when range covers all dates', () => {
    const result = filterGAByDateRange(daily, '2026-01-01', '2026-12-31');
    expect(result).toHaveLength(4);
  });
});

describe('correlateData', () => {
  it('joins Instantly and GA data on matching dates', () => {
    const instantly: DailyAnalytics[] = [
      { date: '2026-03-16', sent: 500, contacted: 400, new_leads_contacted: 300, opened: 200, unique_opened: 150, replies: 10, unique_replies: 8, clicks: 5, unique_clicks: 4, opportunities: 1 },
    ];
    const ga: GADailyRecord[] = [
      { date: '2026-03-16', sessions: 107, formSubmits: 2, viewSearchResults: 4, bookingConfirmed: 1 },
    ];

    const result = correlateData(instantly, ga);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      date: '2026-03-16',
      sent: 500,
      newContacts: 300,
      opened: 150,
      replies: 10,
      sessions: 107,
      formSubmits: 2,
      viewSearchResults: 4,
      bookingConfirmed: 1,
    });
  });

  it('includes dates only in Instantly with GA fields as 0', () => {
    const instantly: DailyAnalytics[] = [
      { date: '2026-03-20', sent: 200, contacted: 100, new_leads_contacted: 100, opened: 80, unique_opened: 70, replies: 5, unique_replies: 4, clicks: 2, unique_clicks: 1, opportunities: 0 },
    ];
    const ga: GADailyRecord[] = [];

    const result = correlateData(instantly, ga);
    expect(result).toHaveLength(1);
    expect(result[0].sessions).toBe(0);
    expect(result[0].formSubmits).toBe(0);
    expect(result[0].viewSearchResults).toBe(0);
    expect(result[0].bookingConfirmed).toBe(0);
  });

  it('includes dates only in GA with Instantly fields as 0', () => {
    const instantly: DailyAnalytics[] = [];
    const ga: GADailyRecord[] = [
      { date: '2026-03-29', sessions: 5, formSubmits: 1, viewSearchResults: 1, bookingConfirmed: 0 },
    ];

    const result = correlateData(instantly, ga);
    expect(result).toHaveLength(1);
    expect(result[0].sent).toBe(0);
    expect(result[0].newContacts).toBe(0);
    expect(result[0].sessions).toBe(5);
  });

  it('returns results sorted by date', () => {
    const instantly: DailyAnalytics[] = [
      { date: '2026-04-01', sent: 100, contacted: 50, new_leads_contacted: 50, opened: 40, unique_opened: 35, replies: 3, unique_replies: 2, clicks: 1, unique_clicks: 1, opportunities: 0 },
    ];
    const ga: GADailyRecord[] = [
      { date: '2026-03-01', sessions: 10, formSubmits: 0, viewSearchResults: 0, bookingConfirmed: 0 },
    ];

    const result = correlateData(instantly, ga);
    expect(result[0].date).toBe('2026-03-01');
    expect(result[1].date).toBe('2026-04-01');
  });
});
