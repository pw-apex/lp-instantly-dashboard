import type { Campaign, CampaignAnalytics, DailyAnalytics, Email } from './types';

const BASE_URL = 'https://api.instantly.ai/api/v2';

function getApiKey(): string {
  const key = process.env.INSTANTLY_API_KEY;
  if (!key) throw new Error('INSTANTLY_API_KEY environment variable is not set');
  return key;
}

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getApiKey()}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instantly API error ${res.status}: ${text}`);
  }
  return res.json();
}

// List all campaigns (paginated)
export async function listCampaigns(): Promise<Campaign[]> {
  const campaigns: Campaign[] = [];
  let cursor: string | undefined;

  while (true) {
    const params: Record<string, string> = { limit: '100' };
    if (cursor) params.starting_after = cursor;

    const data = await apiFetch<{ items: Campaign[]; next_starting_after?: string }>(
      '/campaigns',
      params
    );
    campaigns.push(...(data.items || []));
    if (!data.next_starting_after || (data.items || []).length === 0) break;
    cursor = data.next_starting_after;
  }

  return campaigns;
}

// Get single campaign detail
export async function getCampaign(id: string): Promise<Campaign> {
  return apiFetch<Campaign>(`/campaigns/${id}`);
}

// Get campaign analytics (aggregate)
export async function getCampaignAnalytics(params: {
  campaign_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<CampaignAnalytics[]> {
  const queryParams: Record<string, string> = {};
  if (params.campaign_id) queryParams.campaign_id = params.campaign_id;
  if (params.start_date) queryParams.start_date = params.start_date;
  if (params.end_date) queryParams.end_date = params.end_date;

  const data = await apiFetch<CampaignAnalytics[] | { items: CampaignAnalytics[] }>(
    '/campaigns/analytics',
    queryParams
  );
  return Array.isArray(data) ? data : data.items || [];
}

// Get daily analytics
export async function getDailyCampaignAnalytics(params: {
  campaign_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<DailyAnalytics[]> {
  const queryParams: Record<string, string> = {};
  if (params.campaign_id) queryParams.campaign_id = params.campaign_id;
  if (params.start_date) queryParams.start_date = params.start_date;
  if (params.end_date) queryParams.end_date = params.end_date;

  const data = await apiFetch<DailyAnalytics[] | { items: DailyAnalytics[] }>(
    '/campaigns/analytics/daily',
    queryParams
  );
  return Array.isArray(data) ? data : data.items || [];
}

// List emails for a campaign (paginated - for per-step aggregation)
export async function listCampaignEmails(campaignId: string): Promise<Email[]> {
  const emails: Email[] = [];
  let cursor: string | undefined;

  while (true) {
    const params: Record<string, string> = {
      campaign_id: campaignId,
      limit: '100',
    };
    if (cursor) params.starting_after = cursor;

    const data = await apiFetch<{ items: Email[]; next_starting_after?: string }>(
      '/emails',
      params
    );
    emails.push(...(data.items || []));
    if (!data.next_starting_after || (data.items || []).length === 0) break;
    cursor = data.next_starting_after;
  }

  return emails;
}
