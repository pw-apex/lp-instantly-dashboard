import type {
  GADailyRecord,
  DailyAnalytics,
  CorrelatedDailyRecord,
  EmailBucket,
  FunnelDayRow,
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

export function buildFunnelDayRows(
  buckets: EmailBucket[],
  gaDaily: GADailyRecord[],
  dailyOpens: Map<string, number>,
): FunnelDayRow[] {
  const emailsByDate = new Map<string, number>();
  for (const b of buckets) {
    emailsByDate.set(b.date, (emailsByDate.get(b.date) ?? 0) + b.count);
  }

  const gaByDate = new Map<string, GADailyRecord>();
  for (const g of gaDaily) {
    gaByDate.set(g.date, g);
  }

  const allDates = new Set([...emailsByDate.keys(), ...gaByDate.keys()]);

  return [...allDates]
    .sort((a, b) => b.localeCompare(a)) // descending — most recent first
    .map((date) => {
      const ga = gaByDate.get(date);
      return {
        date,
        emailsSent: emailsByDate.get(date) ?? 0,
        opens: dailyOpens.get(date) ?? 0,
        sessions: ga?.sessions ?? 0,
        formSubmits: ga?.formSubmits ?? 0,
      };
    });
}
