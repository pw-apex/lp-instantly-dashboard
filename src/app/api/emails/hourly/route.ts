import { NextRequest, NextResponse } from 'next/server';
import { listEmails } from '@/lib/instantly';
import { aggregateEmailsToBuckets } from '@/lib/ga-aggregation';
import {
  datesInRange,
  readCachedDay,
  todayInPT,
  writeCachedDay,
} from '@/lib/email-bucket-cache';
import type { EmailBucket } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaign_id = searchParams.get('campaign_id') || undefined;
    const start_date = searchParams.get('start_date') || '2000-01-01';
    const end_date = searchParams.get('end_date') || '2099-12-31';

    const today = todayInPT();
    const requestedDates = datesInRange(start_date, end_date);

    // Pull any cached past-day buckets first — never cache today.
    const cached: EmailBucket[] = [];
    const missingPast: string[] = [];
    let todayIsRequested = false;

    for (const date of requestedDates) {
      if (date >= today) {
        todayIsRequested = true;
        continue;
      }
      const dayCache = readCachedDay(date);
      if (dayCache) {
        cached.push(...dayCache);
      } else {
        missingPast.push(date);
      }
    }

    let partial = false;
    let pagesLoaded = 0;
    let totalEmails = 0;
    const fresh: EmailBucket[] = [];

    if (missingPast.length > 0 || todayIsRequested) {
      try {
        const res = await listEmails({ campaign_id });
        partial = res.partial;
        pagesLoaded = res.pagesLoaded;
        totalEmails = res.emails.length;

        const buckets = aggregateEmailsToBuckets(res.emails, '2000-01-01', '2099-12-31');
        fresh.push(...buckets);

        // Cache only COMPLETED days, and only when we fetched without a campaign
        // filter (cache is at the all-campaigns level). A day is safe to cache
        // when either the full paginated fetch exhausted (not partial), or the
        // day is strictly newer than the oldest email we saw — otherwise a 0
        // count could mean "we never paginated that far back".
        if (!campaign_id) {
          const byDate = new Map<string, EmailBucket[]>();
          let oldestFetchedDate: string | null = null;
          for (const b of buckets) {
            const list = byDate.get(b.date);
            if (list) list.push(b);
            else byDate.set(b.date, [b]);
            if (oldestFetchedDate === null || b.date < oldestFetchedDate) {
              oldestFetchedDate = b.date;
            }
          }
          for (const date of missingPast) {
            if (date >= today) continue;
            const safe = !partial || (oldestFetchedDate !== null && date > oldestFetchedDate);
            if (safe) writeCachedDay(date, byDate.get(date) ?? []);
          }
        }
      } catch (fetchErr) {
        // Fall back to cache-only results if the live fetch fails but we have
        // any cached coverage. Surface as partial so the UI can note staleness.
        if (cached.length === 0) throw fetchErr;
        partial = true;
      }
    }

    // If we fetched with a campaign filter, fresh buckets are already scoped.
    // Otherwise filter fresh + cached down to the requested campaign.
    const allBuckets = [...cached, ...fresh];
    const scoped = campaign_id
      ? allBuckets.filter((b) => b.campaignId === campaign_id)
      : allBuckets;

    const inRange = scoped.filter((b) => b.date >= start_date && b.date <= end_date);

    return NextResponse.json({
      data: inRange,
      partial,
      pagesLoaded,
      totalEmails,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch email data';
    const status = message.includes('429') ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
