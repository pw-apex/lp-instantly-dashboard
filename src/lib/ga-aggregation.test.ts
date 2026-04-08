import { describe, it, expect } from 'vitest';
import {
  aggregateGAHourlyToDaily,
  filterGAByDateRange,
  correlateData,
  aggregateEmailsToBuckets,
  filterGAHourlyByDateRange,
  buildFunnelDayRows,
} from './ga-aggregation';
import type { GAHourlyRecord, GADailyRecord, DailyAnalytics } from './types';

describe('aggregateGAHourlyToDaily', () => {
  it('sums sessions, engagedSessions, formSubmits per day', () => {
    const hourly: GAHourlyRecord[] = [
      { dateHour: '2026031608', date: '2026-03-16', hour: 8, sessions: 78, engagedSessions: 38, engagementRate: 0.487, avgEngagementTime: 6.3, eventsPerSession: 4.9, formSubmits: 1 },
      { dateHour: '2026031617', date: '2026-03-16', hour: 17, sessions: 28, engagedSessions: 19, engagementRate: 0.679, avgEngagementTime: 7.1, eventsPerSession: 5.6, formSubmits: 1 },
      { dateHour: '2026031610', date: '2026-03-16', hour: 10, sessions: 1, engagedSessions: 0, engagementRate: 0, avgEngagementTime: 0, eventsPerSession: 2, formSubmits: 0 },
    ];

    const result = aggregateGAHourlyToDaily(hourly);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-03-16');
    expect(result[0].sessions).toBe(107);
    expect(result[0].engagedSessions).toBe(57);
    expect(result[0].formSubmits).toBe(2);
  });

  it('computes engagement rate as engagedSessions / sessions', () => {
    const hourly: GAHourlyRecord[] = [
      { dateHour: '2026030508', date: '2026-03-05', hour: 8, sessions: 22, engagedSessions: 11, engagementRate: 0.5, avgEngagementTime: 5, eventsPerSession: 4, formSubmits: 0 },
      { dateHour: '2026030516', date: '2026-03-05', hour: 16, sessions: 15, engagedSessions: 10, engagementRate: 0.667, avgEngagementTime: 8.9, eventsPerSession: 5.6, formSubmits: 0 },
    ];

    const result = aggregateGAHourlyToDaily(hourly);
    expect(result[0].engagementRate).toBeCloseTo(21 / 37, 4);
  });

  it('handles zero sessions gracefully', () => {
    const hourly: GAHourlyRecord[] = [
      { dateHour: '2026030100', date: '2026-03-01', hour: 0, sessions: 0, engagedSessions: 0, engagementRate: 0, avgEngagementTime: 0, eventsPerSession: 0, formSubmits: 0 },
    ];

    const result = aggregateGAHourlyToDaily(hourly);
    expect(result[0].engagementRate).toBe(0);
  });

  it('returns results sorted by date', () => {
    const hourly: GAHourlyRecord[] = [
      { dateHour: '2026031509', date: '2026-03-15', hour: 9, sessions: 5, engagedSessions: 3, engagementRate: 0.6, avgEngagementTime: 4, eventsPerSession: 3, formSubmits: 0 },
      { dateHour: '2026030109', date: '2026-03-01', hour: 9, sessions: 10, engagedSessions: 5, engagementRate: 0.5, avgEngagementTime: 2, eventsPerSession: 3, formSubmits: 0 },
    ];

    const result = aggregateGAHourlyToDaily(hourly);
    expect(result[0].date).toBe('2026-03-01');
    expect(result[1].date).toBe('2026-03-15');
  });
});

describe('filterGAByDateRange', () => {
  const daily: GADailyRecord[] = [
    { date: '2026-03-01', sessions: 10, engagedSessions: 5, engagementRate: 0.5, formSubmits: 1 },
    { date: '2026-03-15', sessions: 20, engagedSessions: 12, engagementRate: 0.6, formSubmits: 2 },
    { date: '2026-04-01', sessions: 30, engagedSessions: 20, engagementRate: 0.67, formSubmits: 3 },
    { date: '2026-04-08', sessions: 40, engagedSessions: 25, engagementRate: 0.625, formSubmits: 4 },
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
      { date: '2026-03-16', sessions: 107, engagedSessions: 57, engagementRate: 0.533, formSubmits: 2 },
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
      engagedSessions: 57,
      formSubmits: 2,
      engagementRate: 0.533,
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
  });

  it('includes dates only in GA with Instantly fields as 0', () => {
    const instantly: DailyAnalytics[] = [];
    const ga: GADailyRecord[] = [
      { date: '2026-03-29', sessions: 5, engagedSessions: 3, engagementRate: 0.6, formSubmits: 1 },
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
      { date: '2026-03-01', sessions: 10, engagedSessions: 5, engagementRate: 0.5, formSubmits: 0 },
    ];

    const result = correlateData(instantly, ga);
    expect(result[0].date).toBe('2026-03-01');
    expect(result[1].date).toBe('2026-04-01');
  });
});

describe('aggregateEmailsToBuckets', () => {
  it('groups emails by date, hour, campaign, and step', () => {
    const emails = [
      { timestamp_created: '2026-03-16T08:15:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'Hello' },
      { timestamp_created: '2026-03-16T08:45:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'Hello' },
      { timestamp_created: '2026-03-16T09:00:00Z', campaign_id: 'c1', step: '0_1_0', subject: 'Follow up' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ date: '2026-03-16', hour: 8, campaignId: 'c1', step: '0_0_0', count: 2 });
    expect(result[1]).toMatchObject({ date: '2026-03-16', hour: 9, campaignId: 'c1', step: '0_1_0', count: 1 });
  });

  it('parses step number correctly (1-based)', () => {
    const emails = [
      { timestamp_created: '2026-03-16T08:00:00Z', campaign_id: 'c1', step: '0_3_0', subject: 'Step 4' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result[0].stepNumber).toBe(4);
  });

  it('prefers timestamp_email over timestamp_created', () => {
    const emails = [
      { timestamp_email: '2026-03-16T10:00:00Z', timestamp_created: '2026-03-16T08:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'Test' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result[0].hour).toBe(10);
  });

  it('filters by date range', () => {
    const emails = [
      { timestamp_created: '2026-03-15T08:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'A' },
      { timestamp_created: '2026-03-16T08:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'B' },
      { timestamp_created: '2026-03-17T08:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'C' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-03-16');
  });

  it('skips invalid timestamps', () => {
    const emails = [
      { timestamp_created: 'invalid', campaign_id: 'c1', step: '0_0_0', subject: 'A' },
      { timestamp_created: '2026-03-16T08:00:00Z', campaign_id: 'c1', step: '0_0_0', subject: 'B' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result).toHaveLength(1);
  });

  it('defaults missing fields', () => {
    const emails = [
      { timestamp_created: '2026-03-16T08:00:00Z' },
    ];

    const result = aggregateEmailsToBuckets(emails, '2026-03-16', '2026-03-16');
    expect(result[0].campaignId).toBe('unknown');
    expect(result[0].subject).toBe('Untitled');
  });
});

describe('filterGAHourlyByDateRange', () => {
  const hourly: GAHourlyRecord[] = [
    { dateHour: '2026031608', date: '2026-03-16', hour: 8, sessions: 78, engagedSessions: 38, engagementRate: 0.487, avgEngagementTime: 6, eventsPerSession: 4, formSubmits: 1 },
    { dateHour: '2026031708', date: '2026-03-17', hour: 8, sessions: 15, engagedSessions: 8, engagementRate: 0.53, avgEngagementTime: 7, eventsPerSession: 5, formSubmits: 0 },
    { dateHour: '2026031808', date: '2026-03-18', hour: 8, sessions: 4, engagedSessions: 2, engagementRate: 0.5, avgEngagementTime: 1, eventsPerSession: 3, formSubmits: 0 },
  ];

  it('filters hourly records by date range', () => {
    const result = filterGAHourlyByDateRange(hourly, '2026-03-16', '2026-03-17');
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2026-03-16');
    expect(result[1].date).toBe('2026-03-17');
  });
});

describe('buildFunnelDayRows', () => {
  const emptyOpens = new Map<string, number>();

  it('merges email buckets with GA data and opens by date', () => {
    const buckets = [
      { date: '2026-03-16', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'Hello', count: 50 },
      { date: '2026-03-16', hour: 9, campaignId: 'c1', step: '0_1_0', stepNumber: 2, subject: 'Follow up', count: 30 },
    ];
    const gaHourly: GAHourlyRecord[] = [
      { dateHour: '2026031608', date: '2026-03-16', hour: 8, sessions: 78, engagedSessions: 38, engagementRate: 0.487, avgEngagementTime: 6, eventsPerSession: 4, formSubmits: 1 },
      { dateHour: '2026031617', date: '2026-03-16', hour: 17, sessions: 28, engagedSessions: 19, engagementRate: 0.679, avgEngagementTime: 7, eventsPerSession: 5, formSubmits: 1 },
    ];
    const names = new Map([['c1', 'My Campaign']]);
    const opens = new Map([['2026-03-16', 40]]);

    const result = buildFunnelDayRows(buckets, gaHourly, names, opens);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-03-16');
    expect(result[0].emailsSent).toBe(80);
    expect(result[0].opens).toBe(40);
    expect(result[0].sessions).toBe(106);
    expect(result[0].formSubmits).toBe(2);
    expect(result[0].campaigns).toHaveLength(1);
    expect(result[0].campaigns[0].campaignName).toBe('My Campaign');
  });

  it('builds hourly correlation table merging emails and GA', () => {
    const buckets = [
      { date: '2026-03-16', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'A', count: 50 },
    ];
    const gaHourly: GAHourlyRecord[] = [
      { dateHour: '2026031608', date: '2026-03-16', hour: 8, sessions: 78, engagedSessions: 38, engagementRate: 0.487, avgEngagementTime: 6, eventsPerSession: 4, formSubmits: 1 },
      { dateHour: '2026031617', date: '2026-03-16', hour: 17, sessions: 28, engagedSessions: 19, engagementRate: 0.679, avgEngagementTime: 7, eventsPerSession: 5, formSubmits: 3 },
    ];

    const result = buildFunnelDayRows(buckets, gaHourly, new Map(), emptyOpens);
    const hourly = result[0].hourly;
    expect(hourly).toHaveLength(2); // hours 8 and 17
    expect(hourly[0]).toEqual({ hour: 8, sent: 50, sessions: 78, formSubmits: 1 });
    expect(hourly[1]).toEqual({ hour: 17, sent: 0, sessions: 28, formSubmits: 3 });
  });

  it('groups by campaign within a day', () => {
    const buckets = [
      { date: '2026-03-16', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'A', count: 50 },
      { date: '2026-03-16', hour: 8, campaignId: 'c2', step: '0_0_0', stepNumber: 1, subject: 'B', count: 30 },
    ];
    const names = new Map([['c1', 'Campaign 1'], ['c2', 'Campaign 2']]);

    const result = buildFunnelDayRows(buckets, [], names, emptyOpens);
    expect(result[0].campaigns).toHaveLength(2);
  });

  it('sorts by date descending', () => {
    const buckets = [
      { date: '2026-03-16', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'A', count: 10 },
      { date: '2026-04-01', hour: 8, campaignId: 'c1', step: '0_0_0', stepNumber: 1, subject: 'A', count: 20 },
    ];

    const result = buildFunnelDayRows(buckets, [], new Map(), emptyOpens);
    expect(result[0].date).toBe('2026-04-01');
    expect(result[1].date).toBe('2026-03-16');
  });

  it('includes dates only in GA with zero emails', () => {
    const gaHourly: GAHourlyRecord[] = [
      { dateHour: '2026031708', date: '2026-03-17', hour: 8, sessions: 10, engagedSessions: 5, engagementRate: 0.5, avgEngagementTime: 3, eventsPerSession: 4, formSubmits: 3 },
    ];

    const result = buildFunnelDayRows([], gaHourly, new Map(), emptyOpens);
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

    const result = buildFunnelDayRows(buckets, [], new Map(), emptyOpens);
    expect(result[0].opens).toBe(0);
  });
});
