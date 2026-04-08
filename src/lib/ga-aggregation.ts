import type {
  GAHourlyRecord,
  GADailyRecord,
  DailyAnalytics,
  CorrelatedDailyRecord,
  HourlyEmailCount,
  FunnelHourlyRecord,
  FunnelDailyRecord,
} from './types';

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

// Scanner Funnel aggregation functions

export function emailsToHourlyCounts(
  emails: Array<{ timestamp_email?: string; timestamp_created: string }>,
  startDate: string,
  endDate: string,
): HourlyEmailCount[] {
  const countMap = new Map<string, number>();

  for (const email of emails) {
    const ts = email.timestamp_email || email.timestamp_created;
    if (!ts) continue;
    const d = new Date(ts);
    if (isNaN(d.getTime())) continue;
    const dateStr = d.toISOString().split('T')[0];
    if (dateStr < startDate || dateStr > endDate) continue;
    const hour = d.getUTCHours();
    const dateHour = dateStr.replace(/-/g, '') + String(hour).padStart(2, '0');
    countMap.set(dateHour, (countMap.get(dateHour) || 0) + 1);
  }

  return [...countMap.entries()]
    .map(([dateHour, count]) => ({
      dateHour,
      date: `${dateHour.slice(0, 4)}-${dateHour.slice(4, 6)}-${dateHour.slice(6, 8)}`,
      hour: parseInt(dateHour.slice(8, 10), 10),
      count,
    }))
    .sort((a, b) => a.dateHour.localeCompare(b.dateHour));
}

export function filterGAHourlyByDateRange(
  hourly: GAHourlyRecord[],
  startDate: string,
  endDate: string,
): GAHourlyRecord[] {
  return hourly.filter((h) => h.date >= startDate && h.date <= endDate);
}

export function correlateFunnelByHourOfDay(
  emailHourly: HourlyEmailCount[],
  gaHourly: GAHourlyRecord[],
): FunnelHourlyRecord[] {
  const result: FunnelHourlyRecord[] = [];

  for (let h = 0; h < 24; h++) {
    const emailsSent = emailHourly
      .filter((e) => e.hour === h)
      .reduce((sum, e) => sum + e.count, 0);
    const sessions = gaHourly
      .filter((g) => g.hour === h)
      .reduce((sum, g) => sum + g.sessions, 0);
    const formSubmits = gaHourly
      .filter((g) => g.hour === h)
      .reduce((sum, g) => sum + g.formSubmits, 0);

    result.push({ hour: h, emailsSent, sessions, formSubmits });
  }

  return result;
}

export function correlateFunnelByDay(
  emailHourly: HourlyEmailCount[],
  gaHourly: GAHourlyRecord[],
): FunnelDailyRecord[] {
  const emailByDate = new Map<string, number>();
  for (const e of emailHourly) {
    emailByDate.set(e.date, (emailByDate.get(e.date) || 0) + e.count);
  }

  const gaByDate = new Map<string, { sessions: number; formSubmits: number }>();
  for (const g of gaHourly) {
    const existing = gaByDate.get(g.date);
    if (existing) {
      existing.sessions += g.sessions;
      existing.formSubmits += g.formSubmits;
    } else {
      gaByDate.set(g.date, { sessions: g.sessions, formSubmits: g.formSubmits });
    }
  }

  const allDates = new Set([...emailByDate.keys(), ...gaByDate.keys()]);
  return [...allDates]
    .sort()
    .map((date) => ({
      date,
      emailsSent: emailByDate.get(date) ?? 0,
      sessions: gaByDate.get(date)?.sessions ?? 0,
      formSubmits: gaByDate.get(date)?.formSubmits ?? 0,
    }));
}
