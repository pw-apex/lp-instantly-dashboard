import { NextRequest, NextResponse } from 'next/server';
import { getDailyCampaignAnalytics } from '@/lib/instantly';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaign_id = searchParams.get('campaign_id') || undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;

    const daily = await getDailyCampaignAnalytics({ campaign_id, start_date, end_date });
    return NextResponse.json(daily);
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch daily analytics' },
      { status: 500 }
    );
  }
}
