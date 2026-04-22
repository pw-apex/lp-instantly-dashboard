import { unstable_cache } from 'next/cache';
import type { Campaign, CampaignAnalytics, DailyAnalytics, StepAnalyticsRaw } from './types';

const BASE_URL = 'https://api.instantly.ai/api/v2';

// Cache TTLs (seconds)
const TTL_STEP_ANALYTICS = 300; // 5 min
const TTL_CAMPAIGN_DETAIL = 1800; // 30 min
const TTL_ANALYTICS = 300; // 5 min
const TTL_DAILY_ANALYTICS = 300; // 5 min
const TTL_CAMPAIGN_LIST = 600; // 10 min

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

// ---------------------------------------------------------------------------
// Uncached implementations — these hit Instantly directly. Do not export;
// callers should use the cached wrappers below.
// ---------------------------------------------------------------------------

async function listCampaignsUncached(): Promise<Campaign[]> {
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

async function getCampaignUncached(id: string): Promise<CampaignDetail> {
  return apiFetch<CampaignDetail>(`/campaigns/${id}`);
}

async function getCampaignAnalyticsUncached(params: {
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

async function getDailyCampaignAnalyticsUncached(params: {
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

async function getStepAnalyticsUncached(campaignId: string): Promise<StepAnalyticsRaw[]> {
  const data = await apiFetch<StepAnalyticsRaw[]>(
    '/campaigns/analytics/steps',
    {
      campaign_id: campaignId,
      include_opportunities_count: 'true',
    }
  );
  return Array.isArray(data) ? data : [];
}

// ---------------------------------------------------------------------------
// Cached exports — unstable_cache serializes the function arguments into the
// cache key automatically, so different campaign IDs / date ranges are cached
// independently. TTLs are tuned in the constants at the top of this file.
// ---------------------------------------------------------------------------

export const listCampaigns = unstable_cache(
  listCampaignsUncached,
  ['campaigns:list'],
  { revalidate: TTL_CAMPAIGN_LIST, tags: ['campaigns:list'] },
);

export const getCampaign = unstable_cache(
  getCampaignUncached,
  ['campaigns:detail'],
  { revalidate: TTL_CAMPAIGN_DETAIL, tags: ['campaigns:detail'] },
);

export const getCampaignAnalytics = unstable_cache(
  getCampaignAnalyticsUncached,
  ['campaigns:analytics'],
  { revalidate: TTL_ANALYTICS, tags: ['campaigns:analytics'] },
);

export const getDailyCampaignAnalytics = unstable_cache(
  getDailyCampaignAnalyticsUncached,
  ['campaigns:analytics:daily'],
  { revalidate: TTL_DAILY_ANALYTICS, tags: ['campaigns:analytics:daily'] },
);

export const getStepAnalytics = unstable_cache(
  getStepAnalyticsUncached,
  ['campaigns:steps'],
  { revalidate: TTL_STEP_ANALYTICS, tags: ['campaigns:steps'] },
);
