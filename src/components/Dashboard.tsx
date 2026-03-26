'use client';

import { useState, useEffect, useCallback } from 'react';
import DateRangeFilter from './ui/DateRangeFilter';
import KpiCard from './ui/KpiCard';
import ThemeToggle from './ui/ThemeToggle';
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
  const bounceRate = totalSent > 0 ? ((totalBounces / totalSent) * 100).toFixed(1) : '0.0';

  // Merge campaigns with analytics
  const campaignsWithAnalytics: CampaignWithAnalytics[] = campaigns.map((c) => {
    const a = analytics.find((an) => an.campaign_id === c.id);
    return { ...c, analytics: a };
  });

  // Lead inventory for active campaigns
  const leadInventory: LeadInventoryType[] = campaigns
    .filter((c) => c.status === 1 && (c.leads_count ?? 0) > 0)
    .map((c) => {
      const total = c.leads_count ?? 0;
      const contacted = Math.min(c.leads_contacted_count ?? 0, total);
      const remaining = total - contacted;
      return {
        campaignId: c.id,
        campaignName: c.name,
        totalLeads: total,
        contacted,
        remaining: Math.max(remaining, 0),
        percentContacted: total > 0 ? Math.min((contacted / total) * 100, 100) : 0,
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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="card p-8 max-w-md text-center">
          <div className="text-red text-4xl mb-4">!</div>
          <h2 className="text-lg font-semibold text-text-heading mb-2">Error Loading Dashboard</h2>
          <p className="text-sm text-text-body mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-text-heading rounded-lg text-sm font-medium text-bg hover:opacity-80 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 h-14 bg-surface border-b border-border-default px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-heading">Instantly Analytics</span>
          <span className="text-xs text-text-body border-l border-border-default pl-3">Luxury Presence</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <DateRangeFilter
            value={datePreset}
            customStart={customStart}
            customEnd={customEnd}
            onChange={handleDateChange}
          />
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-text-muted">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--spinner-fill)' }} />
              Loading analytics...
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <KpiCard
                label="Emails Sent"
                value={totalSent}
                subValues={[
                  { label: 'New Contacts', value: totalNew },
                  { label: 'Follow-ups', value: totalFollowups },
                ]}
              />
              <KpiCard
                label="Open Rate"
                value={`${openRate}%`}
                tooltip="Calculated only for campaigns with open tracking enabled. Campaigns with tracking disabled are excluded."
              />
              <KpiCard label="Reply Rate" value={`${replyRate}%`} />
              <KpiCard label="Bounce Rate" value={`${bounceRate}%`} />
              <KpiCard label="Opportunities" value={totalOpps} />
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VolumeChart data={dailyData} />
              <EngagementChart data={dailyData} />
            </section>

            {/* Campaign Table */}
            <CampaignTable campaigns={campaignsWithAnalytics} />

            {/* Lead Inventory */}
            <LeadInventory inventory={leadInventory} threshold={LEAD_ALERT_THRESHOLD} />
          </>
        )}
      </main>
    </div>
  );
}
