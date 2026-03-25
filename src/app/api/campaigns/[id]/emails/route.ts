import { NextRequest, NextResponse } from 'next/server';
import { listCampaignEmails, getCampaign } from '@/lib/instantly';
import { aggregateStepAnalytics } from '@/lib/aggregation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch emails and campaign detail in parallel
    const [emails, campaignDetail] = await Promise.all([
      listCampaignEmails(id),
      getCampaign(id).catch(() => undefined),
    ]);

    const steps = aggregateStepAnalytics(emails, campaignDetail);

    return NextResponse.json({
      campaignId: id,
      totalEmails: emails.length,
      steps,
    });
  } catch (error) {
    console.error('Error fetching campaign emails:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
