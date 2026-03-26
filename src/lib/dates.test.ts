import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDateRange, getPresetLabel } from './dates';

describe('getDateRange', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns last 7 days range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15'));

    const result = getDateRange('last7');
    expect(result.startDate).toBe('2026-03-08');
    expect(result.endDate).toBe('2026-03-15');
    expect(result.preset).toBe('last7');
  });

  it('returns last 30 days range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15'));

    const result = getDateRange('last30');
    expect(result.startDate).toBe('2026-02-13');
    expect(result.endDate).toBe('2026-03-15');
    expect(result.preset).toBe('last30');
  });

  it('returns month-to-date range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15'));

    const result = getDateRange('mtd');
    expect(result.startDate).toBe('2026-03-01');
    expect(result.endDate).toBe('2026-03-15');
    expect(result.preset).toBe('mtd');
  });

  it('returns custom range with provided dates', () => {
    const result = getDateRange('custom', '2026-01-01', '2026-01-31');
    expect(result.startDate).toBe('2026-01-01');
    expect(result.endDate).toBe('2026-01-31');
    expect(result.preset).toBe('custom');
  });

  it('falls back to defaults for custom range without dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15'));

    const result = getDateRange('custom');
    expect(result.startDate).toBe('2026-03-01');
    expect(result.endDate).toBe('2026-03-15');
  });
});

describe('getPresetLabel', () => {
  it('returns correct labels', () => {
    expect(getPresetLabel('last7')).toBe('Last 7 Days');
    expect(getPresetLabel('last30')).toBe('Last 30 Days');
    expect(getPresetLabel('mtd')).toBe('Month to Date');
    expect(getPresetLabel('custom')).toBe('Custom Range');
  });
});
