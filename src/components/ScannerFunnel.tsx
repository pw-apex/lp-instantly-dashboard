'use client';

import { useState, useEffect } from 'react';
import FunnelChart from './charts/FunnelChart';
import { GA_HOURLY_DATA } from '@/lib/ga-data';
import {
  filterGAHourlyByDateRange,
  correlateFunnelByHourOfDay,
  correlateFunnelByDay,
} from '@/lib/ga-aggregation';
import type {
  Campaign,
  HourlyEmailCount,
  FunnelHourlyRecord,
  FunnelDailyRecord,
  EmailHourlyResponse,
} from '@/lib/types';

type ScannerFunnelProps = {
  campaigns: Campaign[];
  startDate: string;
  endDate: string;
};

export default function ScannerFunnel({ campaigns, startDate, endDate }: ScannerFunnelProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [emailHourly, setEmailHourly] = useState<HourlyEmailCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState(false);
  const [view, setView] = useState<'hourly' | 'daily'>('hourly');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEmailData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
        });
        if (selectedCampaignId) {
          params.set('campaign_id', selectedCampaignId);
        }

        const res = await fetch(`/api/emails/hourly?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error('Failed to fetch email hourly data');
        }
        const result: EmailHourlyResponse = await res.json();
        setEmailHourly(result.data);
        setPartial(result.partial);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEmailData();
    return () => controller.abort();
  }, [startDate, endDate, selectedCampaignId, retryKey]);

  const filteredGA = filterGAHourlyByDateRange(GA_HOURLY_DATA, startDate, endDate);
  const hourlyData: FunnelHourlyRecord[] = correlateFunnelByHourOfDay(emailHourly, filteredGA);
  const dailyData: FunnelDailyRecord[] = correlateFunnelByDay(emailHourly, filteredGA);

  const activeCampaigns = campaigns.filter((c) => c.status === 1);

  return (
    <div className="bg-surface rounded-lg border border-border-default p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h3 className="text-sm font-medium text-text-heading">Scanner Funnel Performance</h3>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-500" />
              <span className="text-[10px] font-medium text-text-body uppercase">Emails Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-[2px] bg-blue-500" />
              <span className="text-[10px] font-medium text-text-body uppercase">Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
              <span className="text-[10px] font-medium text-text-body uppercase">Form Submits</span>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex rounded-md border border-border-default overflow-hidden">
            <button
              onClick={() => setView('hourly')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                view === 'hourly'
                  ? 'bg-surface-elevated text-text-heading'
                  : 'bg-bg text-text-muted hover:text-text-body'
              }`}
            >
              By Hour
            </button>
            <button
              onClick={() => setView('daily')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                view === 'daily'
                  ? 'bg-surface-elevated text-text-heading'
                  : 'bg-bg text-text-muted hover:text-text-body'
              }`}
            >
              By Day
            </button>
          </div>

          {/* Campaign selector */}
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="text-xs bg-bg border border-border-default rounded-md px-2 py-1 text-text-body max-w-[200px]"
          >
            <option value="">All Campaigns</option>
            {activeCampaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80">
          <div className="flex items-center gap-3 text-text-muted">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--spinner-fill)' }}
            />
            Loading email data...
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <p className="text-sm text-text-muted">{error}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-4 py-2 bg-text-heading rounded-lg text-sm font-medium text-bg hover:opacity-80 transition-opacity"
          >
            Retry
          </button>
        </div>
      ) : (
        <FunnelChart
          hourlyData={hourlyData}
          dailyData={dailyData}
          view={view}
          partial={partial}
        />
      )}
    </div>
  );
}
