import { NextRequest, NextResponse } from 'next/server';
import { getStepAnalytics, getCampaign } from '@/lib/instantly';
import { aggregateStepAnalytics } from '@/lib/aggregation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch step analytics and campaign detail in parallel
    const [rawSteps, campaignDetail] = await Promise.all([
      getStepAnalytics(id),
      getCampaign(id).catch((err) => {
        console.error('Error fetching campaign detail:', err);
        return undefined;
      }),
    ]);

    const steps = aggregateStepAnalytics(rawSteps, campaignDetail);

    return NextResponse.json({
      campaignId: id,
      steps,
    });
  } catch (error) {
    console.error('Error fetching step analytics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch step analytics' },
      { status: 500 }
    );
  }
}
