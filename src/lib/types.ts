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

export interface Email {
  id: string;
  campaign_id: string;
  step: string; // format: sequenceIndex_stepIndex_variantIndex
  subject: string;
  to_address_email_list: string;
  lead?: string;
  timestamp_created: string;
  ue_type?: number;
  eaccount?: string;
  from_address_email?: string;
}

export interface StepAnalytics {
  step: string;
  stepNumber: number; // 1-based display number
  subject: string;
  sentCount: number;
  openedCount: number;
  openRate: number;
  replyCount: number;
  clickCount: number;
  isBestOpen: boolean;
  isWorstOpen: boolean;
  isBestReply: boolean;
  isWorstReply: boolean;
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

export type DateRange = 'last7' | 'last14' | 'mtd' | 'custom';

export interface DateRangeValue {
  startDate: string;
  endDate: string;
  preset: DateRange;
}
