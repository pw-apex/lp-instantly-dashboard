import { NextRequest, NextResponse } from 'next/server';
import { listSentEmails, listReceivedEmails, getCampaign } from '@/lib/instantly';
import { aggregateStepAnalytics } from '@/lib/aggregation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow time for pagination

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch sent emails, received emails (replies), and campaign detail in parallel
    const [sentEmails, receivedEmails, campaignDetail] = await Promise.all([
      listSentEmails(id),
      listReceivedEmails(id),
      getCampaign(id).catch((err) => {
        console.error('Error fetching campaign detail:', err);
        return undefined;
      }),
    ]);

    const steps = aggregateStepAnalytics(sentEmails, receivedEmails, campaignDetail);

    return NextResponse.json({
      campaignId: id,
      totalSentEmails: sentEmails.length,
      totalReceivedEmails: receivedEmails.length,
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
