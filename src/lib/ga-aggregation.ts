import type {
  GADailyRecord,
  DailyAnalytics,
  CorrelatedDailyRecord,
} from './types';

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
      formSubmits: gaDay?.formSubmits ?? 0,
      viewSearchResults: gaDay?.viewSearchResults ?? 0,
      bookingConfirmed: gaDay?.bookingConfirmed ?? 0,
    };
  });
}

