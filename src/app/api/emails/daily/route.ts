import { NextRequest, NextResponse } from 'next/server';
import { listCampaigns, getDailyCampaignAnalytics } from '@/lib/instantly';
import type { DailyCampaignSend } from '@/lib/types';

export const dynamic = 'force-dynamic';

const CONCURRENCY = 5;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;

    const campaigns = await listCampaigns();
    // Include active + paused + completed — any campaign that *might* have sent in the range.
    // Drafts (status 0) have nothing to report.
    const relevant = campaigns.filter((c) => c.status !== 0);

    const perCampaign = await mapWithConcurrency(relevant, CONCURRENCY, async (c) => {
      const daily = await getDailyCampaignAnalytics({
        campaign_id: c.id,
        start_date,
        end_date,
      });
      return { campaign: c, daily };
    });

    const rows: DailyCampaignSend[] = [];
    for (const { campaign, daily } of perCampaign) {
      for (const d of daily) {
        if (!d.sent) continue;
        rows.push({
          date: d.date,
          campaignId: campaign.id,
          campaignName: campaign.name,
          sent: d.sent,
          opened: d.unique_opened ?? d.opened ?? 0,
        });
      }
    }

    return NextResponse.json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch daily send data';
    const status = message.includes('429') ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
