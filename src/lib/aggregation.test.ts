import { describe, it, expect } from 'vitest';
import { aggregateStepAnalytics } from './aggregation';
import type { StepAnalyticsRaw } from './types';

describe('aggregateStepAnalytics', () => {
  it('returns empty array for empty input', () => {
    expect(aggregateStepAnalytics([])).toEqual([]);
    expect(aggregateStepAnalytics(null as unknown as StepAnalyticsRaw[])).toEqual([]);
  });

  it('maps raw step data to StepAnalytics', () => {
    const raw: StepAnalyticsRaw[] = [
      {
        step: '0',
        variant: '0',
        sent: 100,
        opened: 80,
        unique_opened: 60,
        replies: 10,
        unique_replies: 8,
        replies_automatic: 0,
        unique_replies_automatic: 0,
        clicks: 20,
        unique_clicks: 15,
        opportunities: 5,
        unique_opportunities: 3,
      },
    ];

    const result = aggregateStepAnalytics(raw);
    expect(result).toHaveLength(1);
    expect(result[0].stepIndex).toBe(0);
    expect(result[0].stepNumber).toBe(1);
    expect(result[0].openRate).toBe(60);
    expect(result[0].replyCount).toBe(8);
    expect(result[0].clickCount).toBe(15);
  });

  it('calculates open rate as 0 when no emails sent', () => {
    const raw: StepAnalyticsRaw[] = [
      {
        step: '0',
        variant: '0',
        sent: 0,
        opened: 0,
        unique_opened: 0,
        replies: 0,
        unique_replies: 0,
        replies_automatic: 0,
        unique_replies_automatic: 0,
        clicks: 0,
        unique_clicks: 0,
        opportunities: 0,
        unique_opportunities: 0,
      },
    ];

    const result = aggregateStepAnalytics(raw);
    expect(result[0].openRate).toBe(0);
  });

  it('marks best and worst open rates with sufficient volume', () => {
    const raw: StepAnalyticsRaw[] = [
      {
        step: '0', variant: '0', sent: 100, opened: 80, unique_opened: 80,
        replies: 0, unique_replies: 0, replies_automatic: 0, unique_replies_automatic: 0,
        clicks: 0, unique_clicks: 0, opportunities: 0, unique_opportunities: 0,
      },
      {
        step: '1', variant: '0', sent: 100, opened: 20, unique_opened: 20,
        replies: 0, unique_replies: 0, replies_automatic: 0, unique_replies_automatic: 0,
        clicks: 0, unique_clicks: 0, opportunities: 0, unique_opportunities: 0,
      },
    ];

    const result = aggregateStepAnalytics(raw);
    expect(result[0].isBestOpen).toBe(true);
    expect(result[0].isWorstOpen).toBe(false);
    expect(result[1].isBestOpen).toBe(false);
    expect(result[1].isWorstOpen).toBe(true);
  });

  it('does not mark best/worst when volume is too low', () => {
    const raw: StepAnalyticsRaw[] = [
      {
        step: '0', variant: '0', sent: 5, opened: 4, unique_opened: 4,
        replies: 0, unique_replies: 0, replies_automatic: 0, unique_replies_automatic: 0,
        clicks: 0, unique_clicks: 0, opportunities: 0, unique_opportunities: 0,
      },
      {
        step: '1', variant: '0', sent: 3, opened: 1, unique_opened: 1,
        replies: 0, unique_replies: 0, replies_automatic: 0, unique_replies_automatic: 0,
        clicks: 0, unique_clicks: 0, opportunities: 0, unique_opportunities: 0,
      },
    ];

    const result = aggregateStepAnalytics(raw);
    expect(result[0].isBestOpen).toBe(false);
    expect(result[1].isWorstOpen).toBe(false);
  });

  it('sorts by step index then variant', () => {
    const raw: StepAnalyticsRaw[] = [
      {
        step: '1', variant: '0', sent: 50, opened: 25, unique_opened: 25,
        replies: 0, unique_replies: 0, replies_automatic: 0, unique_replies_automatic: 0,
        clicks: 0, unique_clicks: 0, opportunities: 0, unique_opportunities: 0,
      },
      {
        step: '0', variant: '1', sent: 50, opened: 30, unique_opened: 30,
        replies: 0, unique_replies: 0, replies_automatic: 0, unique_replies_automatic: 0,
        clicks: 0, unique_clicks: 0, opportunities: 0, unique_opportunities: 0,
      },
      {
        step: '0', variant: '0', sent: 50, opened: 20, unique_opened: 20,
        replies: 0, unique_replies: 0, replies_automatic: 0, unique_replies_automatic: 0,
        clicks: 0, unique_clicks: 0, opportunities: 0, unique_opportunities: 0,
      },
    ];

    const result = aggregateStepAnalytics(raw);
    expect(result[0].stepIndex).toBe(0);
    expect(result[0].variant).toBe(0);
    expect(result[1].stepIndex).toBe(0);
    expect(result[1].variant).toBe(1);
    expect(result[2].stepIndex).toBe(1);
  });
});
