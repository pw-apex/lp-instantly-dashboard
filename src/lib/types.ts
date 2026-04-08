export interface Campaign {
  id: string;
  name: string;
  status: number; // 0=draft, 1=active, 2=paused, 3=completed
  open_tracking: boolean;
  link_tracking: boolean;
  leads_count?: number;
  leads_contacted_count?: number;
  sequences?: Sequence[];
}

export interface Sequence {
  steps: SequenceStep[];
}

export interface SequenceStep {
  subject: string;
  body: string;
  variant_label?: string;
}

export interface CampaignAnalytics {
  campaign_id?: string;
  campaign_name?: string;
  campaign_status?: number;
  emails_sent_count: number;
  new_leads_contacted_count: number;
  contacted_count?: number;
  leads_count?: number;
  open_count: number;
  open_count_unique: number;
  reply_count: number;
  reply_count_unique?: number;
  link_click_count: number;
  link_click_count_unique?: number;
  bounced_count: number;
  total_opportunities?: number;
  total_opportunity_value?: number;
  unsubscribed_count?: number;
}

export interface DailyAnalytics {
  date: string;
  sent: number;
  contacted: number;
  new_leads_contacted: number;
  opened: number;
  unique_opened: number;
  replies: number;
  unique_replies: number;
  clicks: number;
  unique_clicks: number;
  opportunities: number;
}

// Raw response from /campaigns/analytics/steps
export interface StepAnalyticsRaw {
  step: string;      // 0-based step index
  variant: string;   // 0-based variant index
  sent: number;
  opened: number;
  unique_opened: number;
  replies: number;
  unique_replies: number;
  replies_automatic: number;
  unique_replies_automatic: number;
  clicks: number;
  unique_clicks: number;
  opportunities: number;
  unique_opportunities: number;
}

export interface StepAnalytics {
  stepIndex: number;   // 0-based from API
  stepNumber: number;  // 1-based for display
  variant: number;
  subject: string;
  sentCount: number;
  openedCount: number;
  openRate: number;
  replyCount: number;
  clickCount: number;
  opportunityCount: number;
  isBestOpen: boolean;
  isWorstOpen: boolean;
}

export interface CampaignWithAnalytics extends Campaign {
  analytics?: CampaignAnalytics;
  openRate?: number;
  replyRate?: number;
  clickRate?: number;
}

export interface LeadInventory {
  campaignId: string;
  campaignName: string;
  totalLeads: number;
  contacted: number;
  remaining: number;
  percentContacted: number;
  isLow: boolean;
}

export type DateRange = 'last7' | 'last30' | 'mtd' | 'custom';

export interface DateRangeValue {
  startDate: string;
  endDate: string;
  preset: DateRange;
}

// Google Analytics types

export type GAHourlyRecord = {
  dateHour: string;       // original YYYYMMDDHH
  date: string;           // derived YYYY-MM-DD
  hour: number;           // derived 0-23
  sessions: number;
  engagedSessions: number;
  engagementRate: number;
  avgEngagementTime: number;
  eventsPerSession: number;
  formSubmits: number;
};

export type GADailyRecord = {
  date: string;           // YYYY-MM-DD, matches DailyAnalytics.date
  sessions: number;
  engagedSessions: number;
  engagementRate: number; // weighted average by sessions
  formSubmits: number;
};

export type CorrelatedDailyRecord = {
  date: string;
  // Instantly fields
  sent: number;
  newContacts: number;
  opened: number;
  replies: number;
  // GA fields
  sessions: number;
  engagedSessions: number;
  formSubmits: number;
  engagementRate: number;
};
