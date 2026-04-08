import type { GAHourlyRecord, GADailyRecord, DailyAnalytics, CorrelatedDailyRecord } from './types';

export function aggregateGAHourlyToDaily(hourly: GAHourlyRecord[]): GADailyRecord[] {
  const byDate = new Map<string, GAHourlyRecord[]>();
  for (const row of hourly) {
    const existing = byDate.get(row.date);
    if (existing) {
      existing.push(row);
    } else {
      byDate.set(row.date, [row]);
    }
  }

  const result: GADailyRecord[] = [];
  for (const [date, rows] of byDate) {
    const sessions = rows.reduce((sum, r) => sum + r.sessions, 0);
    const engagedSessions = rows.reduce((sum, r) => sum + r.engagedSessions, 0);
    const formSubmits = rows.reduce((sum, r) => sum + r.formSubmits, 0);
    const engagementRate = sessions > 0 ? engagedSessions / sessions : 0;

    result.push({ date, sessions, engagedSessions, engagementRate, formSubmits });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function filterGAByDateRange(
  daily: GADailyRecord[],
  startDate: string,
  endDate: string,
): GADailyRecord[] {
  return daily.filter((d) => d.date >= startDate && d.date <= endDate);
}

export function correlateData(
  instantly: DailyAnalytics[],
  ga: GADailyRecord[],
): CorrelatedDailyRecord[] {
  const gaMap = new Map<string, GADailyRecord>();
  for (const g of ga) {
    gaMap.set(g.date, g);
  }

  const instantlyMap = new Map<string, DailyAnalytics>();
  for (const d of instantly) {
    instantlyMap.set(d.date, d);
  }

  const allDates = new Set([...gaMap.keys(), ...instantlyMap.keys()]);
  const sorted = [...allDates].sort();

  return sorted.map((date) => {
    const inst = instantlyMap.get(date);
    const gaDay = gaMap.get(date);

    return {
      date,
      sent: inst?.sent ?? 0,
      newContacts: inst?.new_leads_contacted ?? 0,
      opened: inst?.unique_opened ?? 0,
      replies: inst?.replies ?? 0,
      sessions: gaDay?.sessions ?? 0,
      engagedSessions: gaDay?.engagedSessions ?? 0,
      formSubmits: gaDay?.formSubmits ?? 0,
      engagementRate: gaDay?.engagementRate ?? 0,
    };
  });
}
