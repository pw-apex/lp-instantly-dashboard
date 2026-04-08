import type {
  GAHourlyRecord,
  GADailyRecord,
  DailyAnalytics,
  CorrelatedDailyRecord,
  EmailBucket,
  FunnelDayRow,
  FunnelHourSlot,
  FunnelHourEmail,
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

function parseStepNumber(step: string): number {
  const parts = step.split('_');
  return parts.length >= 2 ? parseInt(parts[1], 10) + 1 : 1;
}

export function aggregateEmailsToBuckets(
  emails: Array<{
    timestamp_email?: string;
    timestamp_created: string;
    campaign_id?: string;
    step?: string;
    subject?: string;
  }>,
  startDate: string,
  endDate: string,
): EmailBucket[] {
  const bucketMap = new Map<string, EmailBucket>();

  for (const email of emails) {
    const ts = email.timestamp_email || email.timestamp_created;
    if (!ts) continue;
    const d = new Date(ts);
    if (isNaN(d.getTime())) continue;
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    if (dateStr < startDate || dateStr > endDate) continue;

    const hour = parseInt(
      d.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hour12: false }),
      10,
    );
    const campaignId = email.campaign_id || 'unknown';
    const step = email.step || '0_0_0';
    const key = `${dateStr}|${hour}|${campaignId}|${step}`;

    const existing = bucketMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      bucketMap.set(key, {
        date: dateStr,
        hour,
        campaignId,
        step,
        stepNumber: parseStepNumber(step),
        subject: email.subject || 'Untitled',
        count: 1,
      });
    }
  }

  return [...bucketMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date) || a.hour - b.hour,
  );
}

export function filterGAHourlyByDateRange(
  hourly: GAHourlyRecord[],
  startDate: string,
  endDate: string,
): GAHourlyRecord[] {
  return hourly.filter((h) => h.date >= startDate && h.date <= endDate);
}

export function buildFunnelDayRows(
  buckets: EmailBucket[],
  gaHourly: GAHourlyRecord[],
  campaignNames: Map<string, string>,
  dailyOpens: Map<string, number>,
): FunnelDayRow[] {
  // Group GA data by date (daily totals)
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

  // Group GA data by date+hour (for hourly correlation table)
  const gaByDateHour = new Map<string, { sessions: number; formSubmits: number }>();
  for (const g of gaHourly) {
    const key = `${g.date}|${g.hour}`;
    const existing = gaByDateHour.get(key);
    if (existing) {
      existing.sessions += g.sessions;
      existing.formSubmits += g.formSubmits;
    } else {
      gaByDateHour.set(key, { sessions: g.sessions, formSubmits: g.formSubmits });
    }
  }

  // Group buckets by date
  const bucketsByDate = new Map<string, EmailBucket[]>();
  for (const b of buckets) {
    const existing = bucketsByDate.get(b.date);
    if (existing) {
      existing.push(b);
    } else {
      bucketsByDate.set(b.date, [b]);
    }
  }

  const allDates = new Set([...bucketsByDate.keys(), ...gaByDate.keys()]);

  return [...allDates]
    .sort((a, b) => b.localeCompare(a)) // descending — most recent first
    .map((date) => {
      const dayBuckets = bucketsByDate.get(date) || [];
      const ga = gaByDate.get(date);

      // Build hourly correlation table (site-wide)
      const emailsByHour = new Map<number, number>();
      for (const b of dayBuckets) {
        emailsByHour.set(b.hour, (emailsByHour.get(b.hour) || 0) + b.count);
      }

      const gaHoursForDate = gaHourly.filter((g) => g.date === date);
      const allHours = new Set<number>([
        ...emailsByHour.keys(),
        ...gaHoursForDate.map((g) => g.hour),
      ]);

      // Build per-hour email detail
      const emailsByDateHour = new Map<number, EmailBucket[]>();
      for (const b of dayBuckets) {
        const existing = emailsByDateHour.get(b.hour);
        if (existing) {
          existing.push(b);
        } else {
          emailsByDateHour.set(b.hour, [b]);
        }
      }

      const hourly: FunnelHourSlot[] = [...allHours]
        .sort((a, b) => a - b)
        .map((hour) => {
          const gaH = gaByDateHour.get(`${date}|${hour}`);
          const hourBuckets = emailsByDateHour.get(hour) || [];

          // Aggregate emails by (campaign, step) for this hour
          const emailMap = new Map<string, FunnelHourEmail>();
          for (const b of hourBuckets) {
            const key = `${b.campaignId}|${b.step}`;
            const existing = emailMap.get(key);
            if (existing) {
              existing.count += b.count;
            } else {
              emailMap.set(key, {
                campaignName: campaignNames.get(b.campaignId) || b.campaignId,
                stepNumber: b.stepNumber,
                subject: b.subject,
                count: b.count,
              });
            }
          }

          return {
            hour,
            sent: emailsByHour.get(hour) ?? 0,
            sessions: gaH?.sessions ?? 0,
            formSubmits: gaH?.formSubmits ?? 0,
            emails: [...emailMap.values()].sort((a, b) => b.count - a.count),
          };
        });

      return {
        date,
        emailsSent: dayBuckets.reduce((sum, b) => sum + b.count, 0),
        opens: dailyOpens.get(date) ?? 0,
        sessions: ga?.sessions ?? 0,
        formSubmits: ga?.formSubmits ?? 0,
        hourly,
      };
    });
}
