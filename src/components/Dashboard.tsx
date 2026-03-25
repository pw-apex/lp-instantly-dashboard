'use client';

import { useState, useEffect, useCallback } from 'react';
import DateRangeFilter from './ui/DateRangeFilter';
import KpiCard from './ui/KpiCard';
import VolumeChart from './charts/VolumeChart';
import EngagementChart from './charts/EngagementChart';
import CampaignTable from './CampaignTable';
import LeadInventory from './LeadInventory';
import { getDateRange } from '@/lib/dates';
import type {
  DateRange,
  Campaign,
  CampaignAnalytics,
  DailyAnalytics,
  CampaignWithAnalytics,
  LeadInventory as LeadInventoryType,
} from '@/lib/types';

const LEAD_ALERT_THRESHOLD = 500;

export default function Dashboard() {
  const [datePreset, setDatePreset] = useState<DateRange>('mtd');
  const [customStart, setCustomStart] = useState<string>();
  const [customEnd, setCustomEnd] = useState<string>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<CampaignAnalytics[]>([]);
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const range = getDateRange(datePreset, customStart, customEnd);
      const params = new URLSearchParams({
        start_date: range.startDate,
        end_date: range.endDate,
      });

      const [campaignsRes, analyticsRes, dailyRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch(`/api/campaigns/analytics?${params}`),
        fetch(`/api/campaigns/analytics/daily?${params}`),
      ]);

      if (!campaignsRes.ok || !analyticsRes.ok || !dailyRes.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const [campaignsData, analyticsData, dailyDataResult] = await Promise.all([
        campaignsRes.json(),
        analyticsRes.json(),
        dailyRes.json(),
      ]);

      setCampaigns(campaignsData);
      setAnalytics(analyticsData);
      setDailyData(dailyDataResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [datePreset, customStart, customEnd]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate KPIs
  const totalSent = analytics.reduce((sum, a) => sum + (a.emails_sent_count || 0), 0);
  const totalNew = analytics.reduce((sum, a) => sum + (a.new_leads_contacted_count || 0), 0);
  const totalFollowups = totalSent - totalNew;
  const totalOpens = analytics.reduce((sum, a) => sum + (a.open_count_unique || 0), 0);
  const totalReplies = analytics.reduce((sum, a) => sum + (a.reply_count_unique || a.reply_count || 0), 0);
  const totalClicks = analytics.reduce((sum, a) => sum + (a.link_click_count || 0), 0);
  const totalBounces = analytics.reduce((sum, a) => sum + (a.bounced_count || 0), 0);
  const totalOpps = analytics.reduce((sum, a) => sum + (a.total_opportunities || 0), 0);

  const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0.0';
  const replyRate = totalNew > 0 ? ((totalReplies / totalNew) * 100).toFixed(1) : '0.0';

  // Merge campaigns with analytics
  const campaignsWithAnalytics: CampaignWithAnalytics[] = campaigns.map((c) => {
    const a = analytics.find((an) => an.campaign_id === c.id);
    return { ...c, analytics: a };
  });

  // Lead inventory for active campaigns (lead counts come from analytics)
  const leadInventory: LeadInventoryType[] = analytics
    .filter((a) => {
      const campaign = campaigns.find((c) => c.id === a.campaign_id);
      return campaign?.status === 1 && (a.leads_count ?? 0) > 0;
    })
    .map((a) => {
      const total = a.leads_count ?? 0;
      const contacted = a.contacted_count ?? 0;
      const remaining = total - contacted;
      return {
        campaignId: a.campaign_id || '',
        campaignName: a.campaign_name || '',
        totalLeads: total,
        contacted,
        remaining: Math.max(remaining, 0),
        percentContacted: total > 0 ? (contacted / total) * 100 : 0,
        isLow: remaining < LEAD_ALERT_THRESHOLD,
      };
    });

  const handleDateChange = (preset: DateRange, start?: string, end?: string) => {
    setDatePreset(preset);
    setCustomStart(start);
    setCustomEnd(end);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 max-w-md text-center">
          <div className="text-red text-4xl mb-4">!</div>
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Error Loading Dashboard</h2>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary rounded-lg text-sm font-medium text-white hover:bg-primary/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">Instantly Analytics</h1>
            <p className="text-xs text-slate-500">Luxury Presence Outbound Dashboard</p>
          </div>
          <DateRangeFilter
            value={datePreset}
            customStart={customStart}
            customEnd={customEnd}
            onChange={handleDateChange}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading analytics...
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <KpiCard label="Emails Sent" value={totalSent} color="#6366f1" />
              <KpiCard label="New Contacts" value={totalNew} color="#22d3ee" />
              <KpiCard label="Follow-ups" value={totalFollowups} color="#a78bfa" />
              <KpiCard label="Open Rate" value={openRate} color="#f59e0b" suffix="%" />
              <KpiCard label="Reply Rate" value={replyRate} color="#22c55e" suffix="%" />
              <KpiCard label="Clicks" value={totalClicks} color="#f472b6" />
              <KpiCard label="Bounces" value={totalBounces} color="#ef4444" />
              <KpiCard label="Opportunities" value={totalOpps} color="#10b981" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VolumeChart data={dailyData} />
              <EngagementChart data={dailyData} />
            </div>

            {/* Campaign Table */}
            <CampaignTable campaigns={campaignsWithAnalytics} />

            {/* Lead Inventory */}
            {leadInventory.length > 0 && (
              <LeadInventory inventory={leadInventory} threshold={LEAD_ALERT_THRESHOLD} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
