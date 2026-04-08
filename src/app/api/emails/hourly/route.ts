import { NextRequest, NextResponse } from 'next/server';
import { listEmails } from '@/lib/instantly';
import { emailsToHourlyCounts } from '@/lib/ga-aggregation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaign_id = searchParams.get('campaign_id') || undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;

    const { emails, partial, pagesLoaded } = await listEmails({
      campaign_id,
    });

    const data = emailsToHourlyCounts(
      emails,
      start_date || '2000-01-01',
      end_date || '2099-12-31',
    );

    return NextResponse.json({
      data,
      partial,
      pagesLoaded,
      totalEmails: emails.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch email data';
    const status = message.includes('429') ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
