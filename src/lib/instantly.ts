import type { Campaign, CampaignAnalytics, DailyAnalytics, StepAnalyticsRaw, HourlyEmailCount } from './types';

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

// Get single campaign detail (includes sequences with step subjects)
export async function getCampaign(id: string): Promise<CampaignDetail> {
  return apiFetch<CampaignDetail>(`/campaigns/${id}`);
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

// Get per-step analytics for a campaign — single API call, no pagination needed
export async function getStepAnalytics(campaignId: string): Promise<StepAnalyticsRaw[]> {
  const data = await apiFetch<StepAnalyticsRaw[]>(
    '/campaigns/analytics/steps',
    {
      campaign_id: campaignId,
      include_opportunities_count: 'true',
    }
  );
  return Array.isArray(data) ? data : [];
}

// List sent emails for a campaign (paginated with safety caps)
type EmailRecord = {
  id: string;
  timestamp_created: string;
  timestamp_email?: string;
  campaign_id?: string;
};

type EmailListResponse = {
  items: EmailRecord[];
  next_starting_after?: string;
};

const MAX_EMAIL_PAGES = 10;
const EMAIL_TIMEOUT_MS = 8000;

export async function listEmails(params: {
  campaign_id?: string;
  maxPages?: number;
  timeoutMs?: number;
}): Promise<{ emails: EmailRecord[]; partial: boolean; pagesLoaded: number }> {
  const maxPages = params.maxPages ?? MAX_EMAIL_PAGES;
  const timeoutMs = params.timeoutMs ?? EMAIL_TIMEOUT_MS;
  const startTime = Date.now();
  const emails: EmailRecord[] = [];
  let cursor: string | undefined;
  let pagesLoaded = 0;

  while (pagesLoaded < maxPages) {
    if (Date.now() - startTime > timeoutMs) {
      return { emails, partial: true, pagesLoaded };
    }

    const queryParams: Record<string, string> = {
      limit: '100',
      email_type: 'sent',
    };
    if (params.campaign_id) queryParams.campaign_id = params.campaign_id;
    if (cursor) queryParams.starting_after = cursor;

    const data = await apiFetch<EmailListResponse>('/emails', queryParams);
    emails.push(...(data.items || []));
    pagesLoaded++;

    if (!data.next_starting_after || (data.items || []).length === 0) break;
    cursor = data.next_starting_after;
  }

  return { emails, partial: pagesLoaded >= maxPages, pagesLoaded };
}

// Campaign detail type matching actual API shape
export interface CampaignDetail {
  id: string;
  name: string;
  status: number;
  open_tracking: boolean;
  link_tracking: boolean;
  sequences?: Array<{
    steps: Array<{
      type: string;
      variants: Array<{
        subject: string;
        body: string;
      }>;
    }>;
  }>;
}
