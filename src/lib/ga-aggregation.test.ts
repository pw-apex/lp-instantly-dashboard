import { describe, it, expect } from 'vitest';
import {
  filterGAByDateRange,
  correlateData,
  aggregateEmailsToBuckets,
  buildFunnelDayRows,
} from './ga-aggregation';
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

describe('aggregateEmailsToBuckets', () => {
  // Note: timestamps are UTC, converted to Pacific Time (UTC-7 for PDT, UTC-8 for PST)
  // March 2026 is PDT (UTC-7), so 17:15 UTC = 10:15 AM PT

  it('converts UTC timestamps to Pacific Time hours', () => {
    const emails = [
      { timestamp_created: '2026-03-16T17:15:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'Hello' },
      { timestamp_created: '2026-03-16T17:45:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'Hello' },
      { timestamp_created: '2026-03-16T18:00:00Z', campaign_id: 'c1', step: '0_1_0', subject: 'Follow up' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result).toHaveLength(2);
    // 17:15 UTC = 10:15 AM PT, 18:00 UTC = 11:00 AM PT
    expect(result[0]).toMatchObject({ date: '2026-03-16', hour: 10, campaignId: 'c1', step: '0_0_0', count: 2 });
    expect(result[1]).toMatchObject({ date: '2026-03-16', hour: 11, campaignId: 'c1', step: '0_1_0', count: 1 });
  });

  it('parses step number correctly (1-based)', () => {
    const emails = [
      { timestamp_created: '2026-03-16T17:00:00Z', campaign_id: 'c1', step: '0_3_0', subject: 'Step 4' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result[0].stepNumber).toBe(4);
  });

  it('prefers timestamp_email over timestamp_created', () => {
    const emails = [
      { timestamp_email: '2026-03-16T20:00:00Z', timestamp_created: '2026-03-16T17:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'Test' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    // 20:00 UTC = 1pm PT
    expect(result[0].hour).toBe(13);
  });

  it('handles date boundary in Pacific Time', () => {
    // 06:00 UTC on Mar 17 = 11pm PT on Mar 16 (PDT, UTC-7)
    const emails = [
      { timestamp_created: '2026-03-17T06:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'Late' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-03-16');
    expect(result[0].hour).toBe(23);
  });

  it('filters by date range', () => {
    const emails = [
      { timestamp_created: '2026-03-15T17:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'A' },
      { timestamp_created: '2026-03-16T17:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'B' },
      { timestamp_created: '2026-03-17T17:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'C' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-03-16');
  });

  it('skips invalid timestamps', () => {
    const emails = [
      { timestamp_created: 'invalid', campaign_id: 'c1', step: '0_0_0', subject: 'A' },
      { timestamp_created: '2026-03-16T17:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'B' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result).toHaveLength(1);
  });

  it('defaults missing fields', () => {
    const emails = [
      { timestamp_created: '2026-03-16T17:00:00Z' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result[0].campaignId).toBe('unknown');
    expect(result[0].subject).toBe('Untitled');
  });
});

describe('buildFunnelDayRows', () => {
  const emptyOpens = new Map<string, number>();

  it('merges email totals with daily GA data and opens by date', () => {
    const buckets = [
      { date: '2026-03-16', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'Hello', count: 50 },
      { date: '2026-03-16', hour: 9, campaignId: 'c1', step: '0_1_0', stepNumber: 2, subject: 'Follow up', count: 30 },
    ];
    const gaDaily: GADailyRecord[] = [
      { date: '2026-03-16', sessions: 106, formSubmits: 2, viewSearchResults: 0, bookingConfirmed: 0 },
    ];
    const opens = new Map([['2026-03-16', 40]]);

    const result = buildFunnelDayRows(buckets, gaDaily, opens);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      date: '2026-03-16',
      emailsSent: 80,
      opens: 40,
      sessions: 106,
      formSubmits: 2,
    });
  });

  it('sorts by date descending', () => {
    const buckets = [
      { date: '2026-03-16', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'A', count: 10 },
      { date: '2026-04-01', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'A', count: 20 },
    ];

    const result = buildFunnelDayRows(buckets, [], emptyOpens);
    expect(result[0].date).toBe('2026-04-01');
    expect(result[1].date).toBe('2026-03-16');
  });

  it('includes dates only in GA with zero emails', () => {
    const gaDaily: GADailyRecord[] = [
      { date: '2026-03-17', sessions: 10, formSubmits: 3, viewSearchResults: 1, bookingConfirmed: 0 },
    ];

    const result = buildFunnelDayRows([], gaDaily, emptyOpens);
    expect(result).toHaveLength(1);
    expect(result[0].emailsSent).toBe(0);
    expect(result[0].opens).toBe(0);
    expect(result[0].sessions).toBe(10);
    expect(result[0].formSubmits).toBe(3);
  });

  it('defaults opens to 0 when not in dailyOpens map', () => {
    const buckets = [
      { date: '2026-03-16', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'A', count: 10 },
    ];

    const result = buildFunnelDayRows(buckets, [], emptyOpens);
    expect(result[0].opens).toBe(0);
  });

  it('defaults GA fields to 0 for dates only in email buckets', () => {
    const buckets = [
      { date: '2026-03-16', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'A', count: 10 },
    ];

    const result = buildFunnelDayRows(buckets, [], emptyOpens);
    expect(result[0].sessions).toBe(0);
    expect(result[0].formSubmits).toBe(0);
  });
});
